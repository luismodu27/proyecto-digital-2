/**
 * Centro de ayuda.
 *
 * POR QUÉ NO ESTÁ EN EL DICCIONARIO i18n. Por la misma frontera que la
 * documentación legal: el diccionario es chrome de interfaz (botones, títulos,
 * estados vacíos) y se traduce con criterio de producto. Esto son textos largos,
 * orientados a tarea, que se corrigen cuando alguien pregunta algo dos veces —
 * un ciclo de edición distinto y una persona distinta.
 *
 * CÓMO ESTÁ ESCRITO, que es lo que decide si sirve de algo:
 *
 *  · **Por pregunta real, no por menú.** Los títulos son lo que alguien escribe
 *    en un buscador ("¿por qué no me sale el botón de…?"), no el nombre del
 *    módulo. Una ayuda organizada como el menú solo la encuentra quien ya sabe
 *    dónde mirar, que es justo quien no la necesita.
 *  · **Dice también lo que Attesta NO hace.** Es la sección que más consultas de
 *    soporte ahorra y la que más confianza da, y en este producto además es
 *    obligatoria: la regla nº 1 es que Attesta no certifica. Una ayuda que
 *    esquiva el límite lo convierte en una sorpresa desagradable más tarde.
 *  · **Sin capturas.** Envejecen a la primera reordenación de un menú y nadie las
 *    actualiza; una ayuda con capturas viejas es peor que una sin ellas.
 */
import type { Locale } from "@/lib/i18n/config";

export type HelpArticle = {
  id: string;
  question: Record<Locale, string>;
  answer: Record<Locale, readonly string[]>;
  /** Ruta del panel a la que lleva la respuesta, si la hay. */
  href?: string;
};

export type HelpSection = {
  id: string;
  title: Record<Locale, string>;
  articles: readonly HelpArticle[];
};

export const HELP_SECTIONS: readonly HelpSection[] = [
  {
    id: "empezar",
    title: { es: "Empezar", en: "Getting started" },
    articles: [
      {
        id: "por-donde",
        question: {
          es: "¿Por dónde empiezo?",
          en: "Where do I start?",
        },
        answer: {
          es: [
            "Por el inventario. Todo lo demás —clasificación de riesgo, brechas, plan de acción, dossier— se calcula a partir de los sistemas de IA que declares, así que sin inventario el resto del panel está vacío por buenos motivos.",
            "No hace falta que esté completo desde el primer día. Empieza por los sistemas que más te preocupan (los que afectan a personas: selección, evaluación, acceso a servicios) y ve añadiendo. Si ya tienes una lista en una hoja de cálculo, puedes importarla en CSV.",
          ],
          en: [
            "With the inventory. Everything else — risk classification, gaps, action plan, dossier — is derived from the AI systems you declare, so without an inventory the rest of the dashboard is empty for good reasons.",
            "It does not have to be complete on day one. Start with the systems that worry you most (the ones affecting people: hiring, evaluation, access to services) and add more as you go. If you already have a list in a spreadsheet, you can import it as CSV.",
          ],
        },
        href: "/dashboard/inventario",
      },
      {
        id: "no-se-que-ia-usamos",
        question: {
          es: "No sé qué IA usa cada área de mi organización",
          en: "I don't know which AI each team in my organization uses",
        },
        answer: {
          es: [
            "Es el problema más común, y no se resuelve preguntando por correo. Attesta emite un enlace que puedes mandar a cada área: quien lo reciba rellena una ficha sencilla sin necesidad de tener cuenta.",
            "Lo que envían no entra directamente en tu inventario: cae en una bandeja y alguien de tu organización lo acepta o lo descarta. Así el expediente siempre tiene un responsable con nombre detrás, que es lo que hace que sirva ante una auditoría.",
            "El enlace caduca a los 30 días, se puede revocar y tiene un tope de envíos.",
          ],
          en: [
            "This is the most common problem, and asking by email does not solve it. Attesta issues a link you can send to each team: whoever receives it fills in a simple form without needing an account.",
            "What they send does not go straight into your inventory: it lands in a tray and someone from your organization accepts or discards it. That way the record always has a named person behind it, which is what makes it hold up in an audit.",
            "The link expires after 30 days, can be revoked, and has a submission cap.",
          ],
        },
        href: "/dashboard/inventario",
      },
      {
        id: "importar-csv",
        question: {
          es: "Mi CSV no se importa bien",
          en: "My CSV does not import correctly",
        },
        answer: {
          es: [
            "La causa número uno es el separador: Excel en español exporta con punto y coma, no con coma. Attesta lo detecta solo, así que si aun así falla, el problema suele ser otro.",
            "El importador valida fila por fila y te dice el número de línea y el motivo de cada una que rechaza, en vez de abortar el fichero entero. Corrige solo esas filas y vuelve a subirlo: las que ya estaban bien no se duplican si las quitas del fichero.",
            "Las cabeceras pueden estar en español o en inglés, y acepta variantes habituales de cada nombre.",
          ],
          en: [
            "The number one cause is the separator: Spanish-language Excel exports with semicolons, not commas. Attesta detects this automatically, so if it still fails, the problem is usually something else.",
            "The importer validates row by row and tells you the line number and reason for each rejection, instead of aborting the whole file. Fix just those rows and upload again.",
            "Headers can be in Spanish or English, and common variants of each name are accepted.",
          ],
        },
      },
    ],
  },
  {
    id: "resultados",
    title: { es: "Entender los resultados", en: "Understanding the results" },
    articles: [
      {
        id: "porcentaje",
        question: {
          es: "¿Qué significa el porcentaje que veo?",
          en: "What does the percentage I see mean?",
        },
        answer: {
          es: [
            "Es el porcentaje de PREPARACIÓN: cuánta de la evidencia esperable ha declarado tu organización, sobre el total de la que le correspondería según el marco aplicable.",
            "No es un porcentaje de cumplimiento y no debe leerse como tal. Que salga alto significa que tienes recogida la evidencia que se te pediría, no que un regulador estaría conforme con ella. Quien juzga el cumplimiento es la autoridad, no una herramienta.",
          ],
          en: [
            "It is a READINESS percentage: how much of the expected evidence your organization has declared, out of what would correspond to it under the applicable framework.",
            "It is not a compliance percentage and should not be read as one. A high figure means you have gathered the evidence you would be asked for, not that a regulator would be satisfied with it. Compliance is judged by the authority, not by a tool.",
          ],
        },
        href: "/dashboard/gap",
      },
      {
        id: "clasificacion",
        question: {
          es: "¿La clasificación de riesgo es definitiva?",
          en: "Is the risk classification final?",
        },
        answer: {
          es: [
            "Es orientativa. Se calcula de forma determinista a partir del texto del Reglamento Europeo de IA y de lo que tu organización ha declarado sobre cada sistema: mismos datos, mismo resultado, siempre. No interviene ningún modelo de lenguaje, precisamente para que no haya sorpresas.",
            "Pero la clasificación depende de la información introducida, y hay casos donde el encaje es discutible. Si un sistema queda cerca de una frontera, la respuesta correcta no es fiarse del resultado: es guardar el razonamiento y validarlo con quien tenga criterio legal.",
          ],
          en: [
            "It is indicative. It is computed deterministically from the text of the EU AI Act and from what your organization has declared about each system: same data, same result, every time. No language model is involved, precisely so there are no surprises.",
            "But the classification depends on the information entered, and some cases are genuinely arguable. If a system lands near a boundary, the right response is not to trust the result: it is to record the reasoning and validate it with someone with legal judgment.",
          ],
        },
        href: "/dashboard/riesgo",
      },
      {
        id: "sistema-no-mio",
        question: {
          es: "El sistema lo hizo un proveedor, no nosotros. ¿Nos aplica igual?",
          en: "The system was built by a vendor, not us. Does it still apply to us?",
        },
        answer: {
          es: [
            "Sí, pero con obligaciones distintas. Attesta está pensado para quien USA la IA, no para quien la fabrica. Las obligaciones técnicas del fabricante se reencuadran como «exige y conserva evidencia del proveedor»: no tienes que documentar cómo se entrenó el modelo, tienes que poder demostrar que se lo pediste a quien sí lo sabe.",
            "Ojo con un caso: si ajustas el modelo o lo comercializas con tu marca, puedes pasar a ser considerado proveedor y asumir sus obligaciones. Si estás en esa situación, conviene mirarlo con detenimiento.",
          ],
          en: [
            "Yes, but with different obligations. Attesta is built for whoever USES the AI, not for whoever builds it. The manufacturer's technical obligations are reframed as “require and keep evidence from the vendor”: you do not have to document how the model was trained, you have to be able to show that you asked whoever does know.",
            "One case to watch: if you fine-tune the model or put your own brand on it, you may be treated as a provider and take on its obligations. If you are in that situation, it is worth looking closely.",
          ],
        },
        href: "/dashboard/proveedores",
      },
    ],
  },
  {
    id: "limites",
    title: { es: "Lo que Attesta NO hace", en: "What Attesta does NOT do" },
    articles: [
      {
        id: "no-certifica",
        question: {
          es: "¿Attesta certifica que cumplimos?",
          en: "Does Attesta certify that we comply?",
        },
        answer: {
          es: [
            "No, y ninguna herramienta puede. Attesta es un sistema de registro de evidencia y una ayuda a la autoevaluación: organiza lo que tu organización declara y lo deja listo para que alguien lo revise.",
            "Ningún documento que sale del producto es un certificado, ni una declaración de conformidad, ni un marcado CE. Quien evalúa el cumplimiento es la autoridad competente o un auditor acreditado, y lo que le entregas es precisamente lo que Attesta te ayuda a tener ordenado.",
            "Lo decimos aquí y en cada documento que sale del producto porque prometer lo contrario sería el atajo comercial más fácil y el más caro para quien se lo creyera.",
          ],
          en: [
            "No, and no tool can. Attesta is an evidence system of record and a self-assessment aid: it organises what your organization declares and gets it ready for someone to review.",
            "No document it generates is a certificate, a declaration of conformity, or a CE marking. Compliance is assessed by the competent authority or an accredited auditor, and what you hand them is exactly what Attesta helps you keep in order.",
            "We say this here and in every document the product produces because promising otherwise would be the easiest commercial shortcut and the most expensive one for anyone who believed it.",
          ],
        },
      },
      {
        id: "no-asesoria",
        question: {
          es: "¿Puedo usar esto en lugar de un abogado?",
          en: "Can I use this instead of a lawyer?",
        },
        answer: {
          es: [
            "No. Los textos regulatorios del producto son deterministas y están construidos sobre el articulado real, pero son orientación general aplicada a lo que has declarado, no asesoramiento sobre tu caso.",
            "Donde más se nota la diferencia es en los casos frontera y en las decisiones con consecuencias: si un sistema puede clasificarse de dos formas, esa decisión tiene un coste, y quien debe tomarla es alguien que responda de ella.",
          ],
          en: [
            "No. The product's regulatory texts are deterministic and built on the actual articles, but they are general guidance applied to what you have declared, not advice on your specific case.",
            "The difference shows most in borderline cases and in decisions with consequences: if a system can be classified two ways, that decision has a cost, and it should be made by someone accountable for it.",
          ],
        },
      },
      {
        id: "no-escanea",
        question: {
          es: "¿Detecta sola la IA que usamos?",
          en: "Does it detect the AI we use on its own?",
        },
        answer: {
          es: [
            "No. Attesta no se conecta a tu red ni escanea tus sistemas: no ve nada que tu organización no le cuente.",
            "Es una decisión, no una carencia. Un inventario que una herramienta rellena sola no tiene a nadie detrás, y un expediente sin responsable no sirve ante una auditoría — la primera pregunta es siempre quién lo declaró. Lo que sí hacemos es bajar el coste de declararlo: importación por CSV y enlaces de intake para las áreas que no tienen cuenta.",
          ],
          en: [
            "No. Attesta does not connect to your network or scan your systems: it sees nothing your organization does not tell it.",
            "That is a decision, not a gap. An inventory a tool fills in by itself has nobody behind it, and a record without an accountable person is useless in an audit — the first question is always who declared it. What we do instead is lower the cost of declaring: CSV import and intake links for teams without an account.",
          ],
        },
      },
    ],
  },
  {
    id: "cuenta",
    title: { es: "Cuenta y datos", en: "Account and data" },
    articles: [
      {
        id: "exportar",
        question: {
          es: "¿Puedo llevarme mis datos?",
          en: "Can I take my data with me?",
        },
        answer: {
          es: [
            "Sí, cuando quieras y sin pedir permiso. Desde Organizaciones descargas un paquete JSON con todo: inventario, evaluaciones y su historial, brechas, plan de acción, proveedores, incidentes, miembros y el registro de auditoría.",
            "Si el registro de auditoría fuera tan largo que se recorta, el propio paquete te lo dice. Preferimos que lo sepas a que te lleves algo incompleto creyendo que está entero.",
          ],
          en: [
            "Yes, whenever you want and without asking permission. From Organizations you download a JSON bundle with everything: inventory, assessments and their history, gaps, action plan, suppliers, incidents, members and the audit log.",
            "If the audit log is long enough to be trimmed, the bundle itself tells you. We would rather you knew than have you take away something incomplete believing it was whole.",
          ],
        },
        href: "/dashboard/organizaciones",
      },
      {
        id: "borrar",
        question: {
          es: "¿Cómo doy de baja mi organización?",
          en: "How do I close my organization?",
        },
        answer: {
          es: [
            "Desde Organizaciones, y solo si eres propietario. Hay que escribir el nombre de la organización para confirmar, porque es la acción más destructiva del producto y conviene leer cuál se está dando de baja.",
            "La baja no es inmediata: hay 7 días para cancelarla. No es burocracia, es protección — si alguien entrara en tu cuenta, ese plazo es lo que impide que destruya el expediente entero sin que nadie pueda reaccionar. Pasados los 7 días se borra todo, registro de auditoría incluido, y no hay vuelta atrás.",
            "Antes de confirmar, descarga tu expediente. El botón está en esa misma pantalla, justo por eso.",
          ],
          en: [
            "From Organizations, and only if you are the owner. You have to type the organization's name to confirm, because it is the most destructive action in the product and it is worth reading which one you are closing.",
            "Closure is not immediate: you have 7 days to cancel. That is not bureaucracy, it is protection — if someone got into your account, that window is what stops them destroying the whole record before anyone can react. After 7 days everything is deleted, audit log included, with no way back.",
            "Before confirming, download your record. The button is on that same screen, precisely for this reason.",
          ],
        },
        href: "/dashboard/organizaciones",
      },
      {
        id: "invitacion",
        question: {
          es: "Invité a alguien y no le llega el correo",
          en: "I invited someone and the email does not arrive",
        },
        answer: {
          es: [
            "Que mire la carpeta de spam: es la causa más frecuente con diferencia.",
            "Si sigue sin aparecer, la invitación no se pierde. Basta con que esa persona cree su cuenta con el mismo correo al que la invitaste: al entrar, la invitación pendiente se aplica sola y aparece dentro de tu organización.",
          ],
          en: [
            "Have them check their spam folder: by far the most frequent cause.",
            "If it still does not show up, the invitation is not lost. That person just has to create an account with the same email you invited: on signing in, the pending invitation is applied automatically and they appear inside your organization.",
          ],
        },
        href: "/dashboard/equipo",
      },
    ],
  },
];

/** Todas las preguntas en plano, para contar y para los tests. */
export function allArticles(): readonly HelpArticle[] {
  return HELP_SECTIONS.flatMap((s) => s.articles);
}
