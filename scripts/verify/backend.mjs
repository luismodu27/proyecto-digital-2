/**
 * Verificación del BACKEND REAL por API: incidentes (0030/0031), proveedores (0032)
 * y el idioma del contenido persistido (0033).
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

// ===========================================================================
// Registro de proveedores (migración 0032)
// ===========================================================================
const sup = await api("/rest/v1/suppliers", {
  token: tokenA,
  method: "POST",
  prefer: "return=representation",
  body: {
    organization_id: idA,
    name: `HireFlow ${stamp}`,
    ai_act_role: "provider",
    outside_eu: true,
    gdpr_role: "processor",
    excludes_high_risk_use: true,
  },
});
const supId = sup.json?.[0]?.id;
check("A da de alta un proveedor", sup.status === 201 && Boolean(supId), sup.text.slice(0, 160));

const supBad = await api("/rest/v1/suppliers", {
  token: tokenA,
  method: "POST",
  body: { organization_id: idA, name: "malo", ai_act_role: "inventado" },
});
check("rechaza un papel inventado en el Reglamento", supBad.status >= 400, String(supBad.status));

const evOk = await api("/rest/v1/supplier_evidence", {
  token: tokenA,
  method: "POST",
  prefer: "return=representation",
  body: {
    organization_id: idA,
    supplier_id: supId,
    kind: "technicalDocumentation",
    status: "refused",
    note: "Responden que el Anexo IV es para autoridades.",
  },
});
const evId = evOk.json?.[0]?.id;
check("A registra una negativa del proveedor como evidencia", evOk.status === 201 && Boolean(evId), evOk.text.slice(0, 160));

const evBad = await api("/rest/v1/supplier_evidence", {
  token: tokenA,
  method: "POST",
  body: { organization_id: idA, supplier_id: supId, kind: "x", status: "conforme" },
});
check("rechaza un estado inventado ('conforme')", evBad.status >= 400, String(evBad.status));

const supB = await api("/rest/v1/suppliers?select=id", { token: tokenB });
check(
  "B NO ve el proveedor de A (RLS)",
  Array.isArray(supB.json) && !supB.json.some((r) => r.id === supId),
  JSON.stringify(supB.json)?.slice(0, 160),
);

const evB = await api(`/rest/v1/supplier_evidence?select=id&id=eq.${evId}`, { token: tokenB });
check(
  "B tampoco alcanza su evidencia pidiéndola por id",
  Array.isArray(evB.json) && evB.json.length === 0,
  JSON.stringify(evB.json)?.slice(0, 160),
);

const supCross = await api("/rest/v1/suppliers", {
  token: tokenB,
  method: "POST",
  body: { organization_id: idA, name: "inyectado" },
});
check("B no puede dar de alta un proveedor EN la organización de A", supCross.status >= 400, String(supCross.status));

const auditSup = await api(
  "/rest/v1/audit_log?select=table_name,row_id&table_name=in.(suppliers,supplier_evidence)&order=at.desc&limit=10",
  { token: tokenA },
);
check(
  "el audit-trail registró el proveedor y su evidencia",
  Array.isArray(auditSup.json) &&
    auditSup.json.some((r) => r.row_id === supId) &&
    auditSup.json.some((r) => r.row_id === evId),
  JSON.stringify(auditSup.json)?.slice(0, 200),
);

// Borrar el proveedor debe arrastrar su evidencia: un expediente huérfano de
// proveedor no significa nada, y dejarlo colgando ensucia los recuentos.
await api(`/rest/v1/suppliers?id=eq.${supId}`, { token: tokenA, method: "DELETE" });
const evAfter = await api(`/rest/v1/supplier_evidence?select=id&id=eq.${evId}`, { token: tokenA });
check(
  "al borrar el proveedor su evidencia cae en cascada",
  Array.isArray(evAfter.json) && evAfter.json.length === 0,
  JSON.stringify(evAfter.json)?.slice(0, 160),
);

// ---------------------------------------------------------------------------
// 0033 · idioma del contenido persistido
//
// Este bloque se ADAPTA a si la migración está aplicada o no, a propósito. El
// contrato de la fachada es que la app funcione igual con la 0033 pendiente
// (`logDataFallback` + reintento sin la columna), así que ambos estados son
// resultados válidos y los dos hay que poder comprobarlos: antes de que el
// fundador pegue el SQL, y después.
// ---------------------------------------------------------------------------
const probe = await api("/rest/v1/gap_items?select=id,locale&limit=1", { token: tokenA });
const has0033 = probe.status === 200;

if (!has0033) {
  check(
    "0033 pendiente: la columna locale aún no existe (degradación activa)",
    probe.status >= 400,
    `${probe.status} ${probe.text.slice(0, 120)}`,
  );
  // Y lo que de verdad importa mientras esté pendiente: que la lectura SIN la
  // columna —el reintento que hace `getGapItems`— siga funcionando.
  const base = await api("/rest/v1/gap_items?select=id,requirement&limit=1", { token: tokenA });
  check("...y la lectura sin ella sigue funcionando (la app no se rompe)", base.status === 200, String(base.status));
} else {
  const sysA = await api("/rest/v1/ai_systems", {
    token: tokenA,
    method: "POST",
    prefer: "return=representation",
    body: { organization_id: idA, name: `locale-${stamp}` },
  });
  const sysId = sysA.json?.[0]?.id;
  check("A da de alta un sistema para probar el idioma", sysA.status === 201 && Boolean(sysId), sysA.text.slice(0, 160));

  const gapEn = await api("/rest/v1/gap_items", {
    token: tokenA,
    method: "POST",
    prefer: "return=representation",
    body: {
      organization_id: idA,
      ai_system_id: sysId,
      requirement: "Human oversight",
      article: "Art. 14",
      locale: "en",
    },
  });
  const gapId = gapEn.json?.[0]?.id;
  check("guarda una brecha declarando su idioma (en)", gapEn.status === 201 && gapEn.json?.[0]?.locale === "en", gapEn.text.slice(0, 160));

  // El CHECK del catálogo: ni un idioma fuera de LOCALES ni una etiqueta BCP-47
  // con región, que es el error tentador ("es-ES" parece válido y no lo es).
  for (const bad of ["fr", "es-ES"]) {
    const r = await api("/rest/v1/gap_items", {
      token: tokenA,
      method: "POST",
      body: { organization_id: idA, ai_system_id: sysId, requirement: "x", locale: bad },
    });
    check(`rechaza un idioma fuera del catálogo ('${bad}')`, r.status >= 400, String(r.status));
  }

  // `null` es un valor legítimo: significa "no consta", que es lo que tienen
  // todas las filas anteriores a la 0033. Si el CHECK lo rechazara, la migración
  // habría roto el histórico.
  const gapNull = await api("/rest/v1/gap_items", {
    token: tokenA,
    method: "POST",
    body: { organization_id: idA, ai_system_id: sysId, requirement: "sin idioma" },
  });
  check("acepta una brecha sin idioma (null = no consta)", gapNull.status === 201, String(gapNull.status));

  const gapB = await api(`/rest/v1/gap_items?select=id,locale&id=eq.${gapId}`, { token: tokenB });
  check(
    "B no ve la brecha de A ni con la columna nueva (RLS)",
    Array.isArray(gapB.json) && gapB.json.length === 0,
    JSON.stringify(gapB.json)?.slice(0, 160),
  );

  await api(`/rest/v1/ai_systems?id=eq.${sysId}`, { token: tokenA, method: "DELETE" });
}

console.log(`\n${pass} correctas · ${fail} fallos`);
process.exit(fail === 0 ? 0 : 1);
