/**
 * Verificación del registro de incidentes contra el BACKEND REAL, por API.
 *
 *   npm run verify:backend
 *
 * NO ESTÁ EN CI y no puede estarlo: necesita credenciales reales y crea datos.
 * Se ejecuta a mano tras aplicar una migración que toque esta tabla.
 *
 * Por qué por API y no con navegador: el Chromium headless de Playwright no usa
 * el proxy de salida de este entorno y no alcanza Supabase. `fetch`/curl sí.
 *
 * Por qué existe además del Postgres desechable: ese Postgres **no reproduce los
 * grants por defecto de Supabase**, así que no puede decir nada sobre PERMISOS.
 * Aquí se cazó que `organizations.review_cadence_days` era inescribible (42501):
 * la migración 0025 había restringido el UPDATE de esa tabla a (name, slug) para
 * que nadie pudiera ascenderse de plan, y 0030 escribía por fuera de la lista.
 *
 * Lo que de verdad prueba: el AISLAMIENTO entre organizaciones. Dos usuarios
 * `*@attesta-test.dev`, dos organizaciones, y que ninguna alcance la otra ni
 * leyendo, ni por id, ni escribiendo, ni por el audit-trail.
 */
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync("/home/user/proyecto-digital-2/.env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const stamp = process.argv[2] ?? String(Date.now());
let pass = 0;
let fail = 0;

function check(name, ok, extra = "") {
  if (ok) {
    pass++;
    console.log(`✅ ${name}`);
  } else {
    fail++;
    console.log(`❌ ${name} ${extra}`);
  }
}

async function api(path, { token, method = "GET", body, prefer } = {}) {
  const h = {
    apikey: ANON,
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(prefer ? { Prefer: prefer } : {}),
  };
  const r = await fetch(`${URL_}${path}`, {
    method,
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* respuesta no-JSON */
  }
  return { status: r.status, json, text };
}

async function signUp(email, password) {
  const r = await api("/auth/v1/signup", {
    method: "POST",
    body: { email, password },
  });
  return r.json?.access_token ?? null;
}

async function signIn(email, password) {
  const r = await api("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: { email, password },
  });
  return r.json?.access_token ?? null;
}

async function ensureUser(email, password) {
  return (await signIn(email, password)) ?? (await signUp(email, password));
}

const PWD = "Attesta-test-2026!";
const A = `inc-a-${stamp}@attesta-test.dev`;
const B = `inc-b-${stamp}@attesta-test.dev`;

const tokenA = await ensureUser(A, PWD);
const tokenB = await ensureUser(B, PWD);
check("dos usuarios de prueba con sesión", Boolean(tokenA && tokenB));
if (!tokenA || !tokenB) process.exit(1);

// --- Organizaciones separadas ---------------------------------------------
const orgA = await api("/rest/v1/rpc/create_org_and_owner", {
  token: tokenA,
  method: "POST",
  body: { org_name: `Org A ${stamp}`, org_slug: `org-a-${stamp}` },
});
const orgB = await api("/rest/v1/rpc/create_org_and_owner", {
  token: tokenB,
  method: "POST",
  body: { org_name: `Org B ${stamp}`, org_slug: `org-b-${stamp}` },
});
const idA = orgA.json;
const idB = orgB.json;
check("cada usuario tiene su organización", Boolean(idA && idB && idA !== idB), `${orgA.status}/${orgB.status}`);

// --- Alta de expediente ----------------------------------------------------
const created = await api("/rest/v1/incidents", {
  token: tokenA,
  method: "POST",
  prefer: "return=representation",
  body: {
    organization_id: idA,
    title: "Descartes anómalos tras actualización",
    aware_on: "2026-08-01",
    occurred_on: "2026-07-30",
    seriousness: "serious",
    categories: ["fundamental_rights", "critical_infrastructure"],
    risk_art79: true,
    use_suspended: true,
  },
});
const incId = created.json?.[0]?.id;
check("A abre un expediente en su organización", created.status === 201 && Boolean(incId), created.text.slice(0, 160));

// --- AISLAMIENTO (lo que este entorno sí puede demostrar) ------------------
const readA = await api(`/rest/v1/incidents?select=id,title`, { token: tokenA });
check("A ve su propio expediente", readA.json?.some((r) => r.id === incId));

const readB = await api(`/rest/v1/incidents?select=id,title`, { token: tokenB });
check(
  "B NO ve el expediente de A (RLS)",
  Array.isArray(readB.json) && !readB.json.some((r) => r.id === incId),
  JSON.stringify(readB.json)?.slice(0, 160),
);

const readByIdB = await api(`/rest/v1/incidents?select=id&id=eq.${incId}`, { token: tokenB });
check(
  "B tampoco lo alcanza pidiéndolo por id",
  Array.isArray(readByIdB.json) && readByIdB.json.length === 0,
  JSON.stringify(readByIdB.json)?.slice(0, 160),
);

const updB = await api(`/rest/v1/incidents?id=eq.${incId}`, {
  token: tokenB,
  method: "PATCH",
  prefer: "return=representation",
  body: { title: "secuestrado" },
});
check(
  "B no puede modificar el expediente de A",
  Array.isArray(updB.json) && updB.json.length === 0,
  `${updB.status} ${updB.text.slice(0, 120)}`,
);

const crossInsert = await api("/rest/v1/incidents", {
  token: tokenB,
  method: "POST",
  body: { organization_id: idA, title: "inyectado", aware_on: "2026-08-01" },
});
check(
  "B no puede escribir EN la organización de A",
  crossInsert.status >= 400,
  `${crossInsert.status} ${crossInsert.text.slice(0, 120)}`,
);

// --- CHECKs sobre el backend real -----------------------------------------
const badCat = await api("/rest/v1/incidents", {
  token: tokenA,
  method: "POST",
  body: {
    organization_id: idA,
    title: "categoría inventada",
    aware_on: "2026-08-01",
    categories: ["reputational_harm"],
  },
});
check("rechaza una categoría fuera del Art. 3.49", badCat.status >= 400, String(badCat.status));

const badSeriousness = await api("/rest/v1/incidents", {
  token: tokenA,
  method: "POST",
  body: {
    organization_id: idA,
    title: "calificación inventada",
    aware_on: "2026-08-01",
    seriousness: "muy_grave",
  },
});
check("rechaza una calificación inventada", badSeriousness.status >= 400, String(badSeriousness.status));

// --- Cadencia de revisión (vía RPC: 0025 dejó organizations sin UPDATE de tabla)
const cadOk = await api("/rest/v1/rpc/set_review_cadence", {
  token: tokenA,
  method: "POST",
  body: { org: idA, days: 180 },
});
if (cadOk.status === 404) {
  console.log("⏭️  cadencia: la migración 0031 aún no está aplicada (RPC ausente)");
} else {
  check("A (owner) fija una cadencia válida (180)", cadOk.status < 300, `${cadOk.status} ${cadOk.text.slice(0, 140)}`);

  const readCad = await api(`/rest/v1/organizations?select=review_cadence_days&id=eq.${idA}`, { token: tokenA });
  check("la cadencia quedó guardada de verdad", readCad.json?.[0]?.review_cadence_days === 180, JSON.stringify(readCad.json));

  // Antes fallaba por 42501 (sin grant) y el test lo daba por bueno: pasaba por
  // el motivo equivocado. Ahora se exige que el rechazo venga de la función.
  const cadBad = await api("/rest/v1/rpc/set_review_cadence", {
    token: tokenA,
    method: "POST",
    body: { org: idA, days: 90 },
  });
  check(
    "rechaza una cadencia fuera del catálogo, y POR EL MOTIVO correcto",
    cadBad.status >= 400 && /cadencia no v/i.test(cadBad.text),
    `${cadBad.status} ${cadBad.text.slice(0, 140)}`,
  );

  const cadCross = await api("/rest/v1/rpc/set_review_cadence", {
    token: tokenB,
    method: "POST",
    body: { org: idA, days: 730 },
  });
  check(
    "B no puede fijar la cadencia de la organización de A",
    cadCross.status >= 400 && /no autorizado/i.test(cadCross.text),
    `${cadCross.status} ${cadCross.text.slice(0, 140)}`,
  );

  // El endurecimiento de 0025 sigue en pie: nadie escribe `plan` desde el cliente.
  const planHack = await api(`/rest/v1/organizations?id=eq.${idA}`, {
    token: tokenA,
    method: "PATCH",
    body: { plan: "enterprise" },
  });
  check("sigue sin poder ascenderse de plan por API (0025 intacto)", planHack.status >= 400, String(planHack.status));
}

// --- Audit-trail -----------------------------------------------------------
const audit = await api(
  `/rest/v1/audit_log?select=table_name,action,row_id&table_name=eq.incidents&order=at.desc&limit=5`,
  { token: tokenA },
);
check(
  "el trigger de auditoría registró el alta",
  Array.isArray(audit.json) && audit.json.some((r) => r.row_id === incId && r.action === "insert"),
  JSON.stringify(audit.json)?.slice(0, 200),
);

const auditB = await api(`/rest/v1/audit_log?select=row_id&table_name=eq.incidents`, { token: tokenB });
check(
  "B no ve el audit-trail de A",
  Array.isArray(auditB.json) && !auditB.json.some((r) => r.row_id === incId),
);

console.log(`\n${pass} correctas · ${fail} fallos`);
process.exit(fail === 0 ? 0 : 1);
