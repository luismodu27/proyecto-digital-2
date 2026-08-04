/**
 * Verificación del BACKEND REAL por API: incidentes (0030/0031), proveedores (0032),
 * el idioma del contenido persistido (0033) y el rate limit compartido (0034).
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

// ---------------------------------------------------------------------------
// 0034 · rate limit compartido entre instancias
//
// Se comprueba por API y no solo en el Postgres desechable porque lo que hay que
// probar aquí son PERMISOS, y el Postgres desechable no reproduce los grants por
// defecto de Supabase (la lección de 0028). Lo que importa: que `anon` PUEDA
// llamar a la función —el formulario de intake se envía sin cuenta— y que nadie
// pueda leer la tabla de contadores.
//
// Igual que el bloque anterior, se adapta a si la migración está aplicada.
// ---------------------------------------------------------------------------
const rl = (token, bucket, limit, windowMs) =>
  api("/rest/v1/rpc/consume_rate_limit", {
    token,
    method: "POST",
    body: { p_bucket: bucket, p_limit: limit, p_window_ms: windowMs },
  });

const rlProbe = await rl(tokenA, `probe-${stamp}`, 5, 60000);

if (rlProbe.status >= 400 && /consume_rate_limit/i.test(rlProbe.text)) {
  check("0034 pendiente: la RPC aún no existe (degradación activa)", true, String(rlProbe.status));
} else {
  check("la RPC responde a un usuario con sesión", rlProbe.status === 200, rlProbe.text.slice(0, 140));

  // 1) Cuenta y corta donde debe.
  const bucket = `verify-${stamp}`;
  const seq = [];
  for (let i = 0; i < 5; i++) seq.push((await rl(tokenA, bucket, 3, 60000)).json);
  check(
    "permite exactamente el límite y deniega después",
    JSON.stringify(seq) === JSON.stringify([true, true, true, false, false]),
    JSON.stringify(seq),
  );

  // 2) Cada clave lleva su cuenta.
  const otra = await rl(tokenA, `verify-otra-${stamp}`, 3, 60000);
  check("otra clave no arrastra el bloqueo de la primera", otra.json === true, String(otra.json));

  // 3) Argumentos absurdos: deniega en vez de dividir por cero o dejar pasar.
    for (const [nombre, body] of [
    ["límite 0", { p_bucket: `abs-${stamp}`, p_limit: 0, p_window_ms: 60000 }],
    ["límite negativo", { p_bucket: `abs-${stamp}`, p_limit: -1, p_window_ms: 60000 }],
    ["ventana 0", { p_bucket: `abs-${stamp}`, p_limit: 3, p_window_ms: 0 }],
    ["clave vacía", { p_bucket: "", p_limit: 3, p_window_ms: 60000 }],
  ]) {
    const r = await api("/rest/v1/rpc/consume_rate_limit", { token: tokenA, method: "POST", body });
    check(`rechaza un argumento absurdo (${nombre})`, r.json === false, `${r.status} ${r.text.slice(0, 80)}`);
  }

  // 4) EL PERMISO QUE IMPORTA: `anon` (sin sesión) debe poder llamarla, porque
  //    el formulario de intake se envía sin cuenta y es la superficie que más
  //    falta hace limitar.
  const anon = await rl(undefined, `anon-${stamp}`, 2, 60000);
  check("anon PUEDE consumir cuota (es el caso del intake)", anon.status === 200 && anon.json === true, `${anon.status} ${anon.text.slice(0, 120)}`);

  // 5) Y la tabla de contadores no la lee nadie: no tiene ninguna policy.
  for (const [quien, token] of [["anon", undefined], ["un usuario con sesión", tokenA]]) {
    const t = await api("/rest/v1/rate_limits?select=bucket,hits", { token });
    check(
      `${quien} no puede leer la tabla de contadores`,
      t.status >= 400 || (Array.isArray(t.json) && t.json.length === 0),
      `${t.status} ${JSON.stringify(t.json)?.slice(0, 120)}`,
    );
  }

  // 6) LA PROPIEDAD QUE JUSTIFICA LA MIGRACIÓN: atomicidad. 20 llamadas a la vez
  //    contra la misma clave con límite 8 tienen que dar 8 permitidas exactas.
  //    Es justo lo que el limitador en memoria no podía garantizar.
  const conc = `conc-${stamp}`;
  const results = await Promise.all(
    Array.from({ length: 20 }, () => rl(tokenA, conc, 8, 60000).then((r) => r.json)),
  );
  const permitidas = results.filter((x) => x === true).length;
  check(
    "20 llamadas simultáneas: exactamente 8 permitidas (upsert atómico)",
    permitidas === 8,
    `permitidas=${permitidas} · ${JSON.stringify(results)}`,
  );
}

// ---------------------------------------------------------------------------
// 0035 · baja de organización (supresión y periodo de gracia)
//
// LO QUE ESTE ENTORNO PUEDE DEMOSTRAR Y EL POSTGRES DESECHABLE NO: los
// PERMISOS. El scaffold desechable no reproduce los grants por defecto de
// Supabase, así que allí no se puede concluir nada sobre quién puede llamar a
// qué. Aquí sí, y es justo lo que sostiene el diseño: si `authenticated`
// pudiera llamar a `purge_organization`, el periodo de gracia sería decorativo.
//
// Lo inverso también aplica: la lógica de la purga (orden de borrado,
// aislamiento entre organizaciones) se probó en el desechable, porque aquí no
// hay service_role y además no se va a borrar nada de verdad.
// ---------------------------------------------------------------------------
const orgProbe = await api(
  `/rest/v1/organizations?select=id,deletion_requested_at&id=eq.${idA}`,
  { token: tokenA },
);
const has0035 = orgProbe.status === 200;

if (!has0035) {
  check(
    "0035 pendiente: la columna deletion_requested_at aún no existe",
    orgProbe.status >= 400,
    `${orgProbe.status} ${orgProbe.text.slice(0, 120)}`,
  );
  const rpcMissing = await api("/rest/v1/rpc/request_org_deletion", {
    token: tokenA,
    method: "POST",
    body: { p_org: idA, p_confirm: "x" },
  });
  check(
    "0035 pendiente: la RPC de baja no existe (la app degrada sin romperse)",
    rpcMissing.status >= 400,
    `${rpcMissing.status}`,
  );
} else {
  check("0035 aplicada: organizations tiene deletion_requested_at", true);

  // 1) El nombre de confirmación tiene que coincidir. Es la defensa contra el
  //    clic equivocado en la pantalla más destructiva del producto.
  const wrongName = await api("/rest/v1/rpc/request_org_deletion", {
    token: tokenA,
    method: "POST",
    body: { p_org: idA, p_confirm: "nombre que no es" },
  });
  check(
    "rechaza la baja si el nombre de confirmación no coincide",
    wrongName.status >= 400,
    `${wrongName.status} ${wrongName.text.slice(0, 140)}`,
  );

  // 2) B no es propietario de A: no puede darla de baja aunque acierte el nombre.
  const notOwner = await api("/rest/v1/rpc/request_org_deletion", {
    token: tokenB,
    method: "POST",
    body: { p_org: idA, p_confirm: `Org A ${stamp}` },
  });
  check(
    "B no puede dar de baja la organización de A (aun sabiendo su nombre)",
    notOwner.status >= 400,
    `${notOwner.status} ${notOwner.text.slice(0, 140)}`,
  );

  // 3) El propietario sí, y el plazo devuelto son ~7 días.
  const ok = await api("/rest/v1/rpc/request_org_deletion", {
    token: tokenA,
    method: "POST",
    body: { p_org: idA, p_confirm: `Org A ${stamp}` },
  });
  const purgeAt = typeof ok.json === "string" ? Date.parse(ok.json) : NaN;
  const days = (purgeAt - Date.now()) / 86400000;
  check(
    "el propietario solicita la baja y recibe la fecha de purga",
    ok.status === 200 && !Number.isNaN(purgeAt),
    `${ok.status} ${ok.text.slice(0, 140)}`,
  );
  check(
    "el plazo devuelto es de ~7 días (no 0, no 30)",
    days > 6.5 && days < 7.5,
    `días=${days.toFixed(2)}`,
  );

  // 4) La marca queda visible: es lo que pinta el aviso permanente en el panel.
  const marked = await api(
    `/rest/v1/organizations?select=deletion_requested_at&id=eq.${idA}`,
    { token: tokenA },
  );
  check(
    "la solicitud queda registrada y visible para la organización",
    Boolean(marked.json?.[0]?.deletion_requested_at),
    JSON.stringify(marked.json),
  );

  // 5) Reiterar NO reinicia el plazo. Sin esto, insistir alargaría la gracia
  //    para siempre y la baja no llegaría nunca.
  const again = await api("/rest/v1/rpc/request_org_deletion", {
    token: tokenA,
    method: "POST",
    body: { p_org: idA, p_confirm: `Org A ${stamp}` },
  });
  const purgeAt2 = typeof again.json === "string" ? Date.parse(again.json) : NaN;
  check(
    "repetir la solicitud no reinicia el plazo",
    Math.abs(purgeAt2 - purgeAt) < 2000,
    `${new Date(purgeAt).toISOString()} vs ${new Date(purgeAt2).toISOString()}`,
  );

  // 6) LA COMPROBACIÓN QUE SOSTIENE EL DISEÑO: un usuario con sesión NO puede
  //    purgar. Si pudiera, el periodo de gracia no existiría.
  const purgeAttempt = await api("/rest/v1/rpc/purge_organization", {
    token: tokenA,
    method: "POST",
    body: { p_org: idA },
  });
  check(
    "un usuario con sesión NO puede purgar (el plazo de gracia es real)",
    purgeAttempt.status >= 400,
    `${purgeAttempt.status} ${purgeAttempt.text.slice(0, 140)}`,
  );

  const purgeDueAttempt = await api("/rest/v1/rpc/purge_due_organizations", {
    token: tokenA,
    method: "POST",
    body: {},
  });
  check(
    "tampoco puede lanzar la purga masiva del cron",
    purgeDueAttempt.status >= 400,
    `${purgeDueAttempt.status} ${purgeDueAttempt.text.slice(0, 140)}`,
  );

  const purgeAnon = await api("/rest/v1/rpc/purge_organization", {
    method: "POST",
    body: { p_org: idA },
  });
  check(
    "anon tampoco puede purgar",
    purgeAnon.status >= 400,
    `${purgeAnon.status} ${purgeAnon.text.slice(0, 140)}`,
  );

  // 7) Y se puede cancelar. Se deja cancelada: la verificación no debe dejar
  //    una organización condenada a borrarse dentro de 7 días.
  const cancelB = await api("/rest/v1/rpc/cancel_org_deletion", {
    token: tokenB,
    method: "POST",
    body: { p_org: idA },
  });
  check(
    "B no puede cancelar la baja de A",
    cancelB.status >= 400,
    `${cancelB.status}`,
  );

  const cancelled = await api("/rest/v1/rpc/cancel_org_deletion", {
    token: tokenA,
    method: "POST",
    body: { p_org: idA },
  });
  const afterCancel = await api(
    `/rest/v1/organizations?select=deletion_requested_at&id=eq.${idA}`,
    { token: tokenA },
  );
  check(
    "el propietario cancela la baja y la marca desaparece",
    cancelled.status === 200 && afterCancel.json?.[0]?.deletion_requested_at === null,
    `${cancelled.status} ${JSON.stringify(afterCancel.json)}`,
  );
}

// ---------------------------------------------------------------------------
// 0036 · facturación (idempotencia y orden)
//
// La LÓGICA (que un evento tardío no pise el estado bueno) se probó contra un
// Postgres real en el desechable, porque aquí no hay service_role. Lo que este
// entorno demuestra —y el otro no— es la FRONTERA: que ni un usuario con sesión
// ni `anon` pueden tocar el registro de eventos ni forzar un estado de
// suscripción. Sin eso, cualquiera se regalaría el plan de pago.
// ---------------------------------------------------------------------------
const evProbe = await api("/rest/v1/stripe_events?select=id&limit=1", { token: tokenA });
const subProbe = await api("/rest/v1/subscriptions?select=last_event_at&limit=1", {
  token: tokenA,
});
// Con RLS sin policies, un SELECT devuelve 200 y vacío; si la TABLA no existe,
// da 404/400. Es la diferencia entre "no aplicada" y "aplicada y protegida".
const has0036 = subProbe.status === 200;

if (!has0036) {
  check(
    "0036 pendiente: subscriptions aún no tiene last_event_at",
    subProbe.status >= 400,
    `${subProbe.status} ${subProbe.text.slice(0, 120)}`,
  );
} else {
  check("0036 aplicada: subscriptions tiene last_event_at", true);

  check(
    "un usuario con sesión no puede leer el registro de eventos de Stripe",
    evProbe.status >= 400 || (Array.isArray(evProbe.json) && evProbe.json.length === 0),
    `${evProbe.status} ${evProbe.text.slice(0, 120)}`,
  );

  const evAnon = await api("/rest/v1/stripe_events?select=id&limit=1");
  check(
    "anon tampoco lo lee",
    evAnon.status >= 400 || (Array.isArray(evAnon.json) && evAnon.json.length === 0),
    `${evAnon.status} ${evAnon.text.slice(0, 120)}`,
  );

  const evInsert = await api("/rest/v1/stripe_events", {
    token: tokenA,
    method: "POST",
    body: { id: `evt_fake_${stamp}`, type: "checkout.session.completed", event_at: new Date().toISOString() },
  });
  check(
    "un usuario con sesión no puede inventarse un evento de Stripe",
    evInsert.status >= 400,
    `${evInsert.status} ${evInsert.text.slice(0, 140)}`,
  );

  // LA IMPORTANTE: si esto se pudiera llamar, cualquiera se pondría el plan de
  // pago a sí mismo sin pasar por Stripe.
  const forge = await api("/rest/v1/rpc/apply_subscription_event", {
    token: tokenA,
    method: "POST",
    body: {
      p_org: idA,
      p_customer: "cus_fake",
      p_subscription: "sub_fake",
      p_status: "active",
      p_price: "price_fake",
      p_period_end: new Date(Date.now() + 86400000 * 365).toISOString(),
      p_cancel_at_period_end: false,
      p_event_at: new Date().toISOString(),
    },
  });
  check(
    "un usuario con sesión NO puede regalarse una suscripción activa",
    forge.status >= 400,
    `${forge.status} ${forge.text.slice(0, 160)}`,
  );

  const forgeAnon = await api("/rest/v1/rpc/apply_subscription_event", {
    method: "POST",
    body: {
      p_org: idA, p_customer: "cus_fake", p_subscription: "sub_fake",
      p_status: "active", p_price: "price_fake",
      p_period_end: new Date().toISOString(), p_cancel_at_period_end: false,
      p_event_at: new Date().toISOString(),
    },
  });
  check(
    "anon tampoco",
    forgeAnon.status >= 400,
    `${forgeAnon.status} ${forgeAnon.text.slice(0, 160)}`,
  );

  // Y comprobamos que el intento NO dejó rastro: la suscripción sigue sin existir.
  const subAfter = await api(
    `/rest/v1/subscriptions?select=status&organization_id=eq.${idA}`,
    { token: tokenA },
  );
  check(
    "tras los intentos, la organización sigue sin suscripción activa",
    Array.isArray(subAfter.json) && subAfter.json.length === 0,
    JSON.stringify(subAfter.json),
  );

  const prune = await api("/rest/v1/rpc/prune_stripe_events", {
    token: tokenA,
    method: "POST",
    body: {},
  });
  check(
    "un usuario con sesión no puede lanzar la limpieza de eventos",
    prune.status >= 400,
    `${prune.status}`,
  );
}

// ---------------------------------------------------------------------------
// Limpieza. Cada ejecución crea dos organizaciones de prueba, y sin esto se
// acumulan para siempre en el proyecto real. Ahora se pueden dar de baja con la
// misma función que usa el producto: la purga la hará el cron a los 7 días.
//
// Nota: esto usa la 0035 para limpiar lo que la propia verificación ensucia, así
// que si la migración no está aplicada simplemente no limpia — y lo dice.
// ---------------------------------------------------------------------------
if (has0035) {
  const bye = await Promise.all([
    api("/rest/v1/rpc/request_org_deletion", {
      token: tokenA, method: "POST",
      body: { p_org: idA, p_confirm: `Org A ${stamp}` },
    }),
    api("/rest/v1/rpc/request_org_deletion", {
      token: tokenB, method: "POST",
      body: { p_org: idB, p_confirm: `Org B ${stamp}` },
    }),
  ]);
  check(
    "las organizaciones de prueba quedan marcadas para su borrado automático",
    bye.every((r) => r.status === 200),
    bye.map((r) => r.status).join("/"),
  );
} else {
  console.log("  ⚠️  sin 0035 no se pueden limpiar las organizaciones de prueba");
}

console.log(`\n${pass} correctas · ${fail} fallos`);
process.exit(fail === 0 ? 0 : 1);
