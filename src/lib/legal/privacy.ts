/**
 * Aviso de privacidad de Attesta.
 *
 * ESCRITO CONTRA EL CÓDIGO, NO CONTRA UNA PLANTILLA. Cada categoría de datos de
 * la §2 sale de una tabla real del esquema (`supabase/migrations/`), y las
 * afirmaciones que se pueden comprobar —que la telemetría no guarda IP ni
 * user-agent, que el limitador guarda un hash y no la dirección, que el registro
 * de auditoría es inmutable por trigger— son afirmaciones sobre código que existe,
 * no promesas de intenciones. Ese es el único motivo por el que este documento
 * puede sostenerse en una due-diligence: si algo de aquí deja de ser verdad, deja
 * de ser verdad en un fichero que alguien tiene que tocar.
 *
 * LA DISTINCIÓN VERTEBRAL (§1): Attesta es **encargado** del tratamiento respecto
 * al contenido que el cliente introduce (ahí el responsable es el cliente), y
 * **responsable** respecto a los datos de cuenta, la lista de espera y la
 * medición de audiencia. Todo lo demás del documento se deriva de esa frontera:
 * los derechos sobre lo primero se ejercen ante el cliente, no ante nosotros.
 *
 * PENDIENTE DE ABOGADO. Este texto es correcto en cuanto a los hechos técnicos y
 * sigue la estructura de los arts. 13-14 RGPD, pero no sustituye la revisión de un
 * abogado antes de publicarlo como documento definitivo — que es justo lo que
 * impide `entity.ts` mientras no haya responsable identificado.
 */
import type { LegalDocument } from "./types";

export const PRIVACY_DOC: LegalDocument = {
  id: "privacy",
  slug: { es: "privacidad", en: "privacy" },
  title: {
    es: "Aviso de privacidad",
    en: "Privacy notice",
  },
  summary: {
    es: "Qué datos trata Attesta, con qué base jurídica, quién más los ve y cómo ejercer tus derechos.",
    en: "What data Attesta processes, on what legal basis, who else sees it, and how to exercise your rights.",
  },
  updated: "2026-08-04",
  sections: [
    {
      id: "roles",
      heading: {
        es: "1. Dos papeles distintos, y por qué te importa",
        en: "1. Two different roles, and why it matters to you",
      },
      blocks: [
        {
          kind: "p",
          text: {
            es: "Attesta trata datos personales en dos papeles distintos, y de cuál se trate depende a quién debes dirigirte para ejercer tus derechos.",
            en: "Attesta processes personal data in two different roles, and which one applies determines who you should contact to exercise your rights.",
          },
        },
        {
          kind: "ul",
          items: {
            es: [
              "Como ENCARGADO del tratamiento: todo el contenido que una organización cliente introduce en la herramienta (su inventario de sistemas de IA, sus evaluaciones, su evidencia, los nombres de las personas responsables de cada sistema). Ahí el responsable es la organización cliente: Attesta solo trata esos datos siguiendo sus instrucciones. Si trabajas en una organización que usa Attesta y quieres ejercer tus derechos sobre esos datos, el interlocutor es tu organización.",
              "Como RESPONSABLE del tratamiento: los datos de la cuenta de cada persona usuaria, las solicitudes de la lista de espera y la medición de audiencia de la web. Aquí decidimos nosotros el para qué y el cómo, y respondemos nosotros.",
            ],
            en: [
              "As a PROCESSOR: all content a customer organization enters into the tool (its AI system inventory, its assessments, its evidence, the names of the people responsible for each system). There the controller is the customer organization: Attesta only processes that data on its instructions. If you work at an organization that uses Attesta and want to exercise your rights over that data, your organization is the party to contact.",
              "As a CONTROLLER: each user's account data, waiting-list requests, and website audience measurement. Here we decide the purposes and means, and we answer for them.",
            ],
          },
        },
        {
          kind: "note",
          text: {
            es: "Las condiciones del tratamiento por cuenta del cliente (art. 28 RGPD) están en el Acuerdo de Tratamiento de Datos, que forma parte del contrato de servicio.",
            en: "The terms for processing on the customer's behalf (Art. 28 GDPR) are set out in the Data Processing Agreement, which forms part of the service contract.",
          },
        },
      ],
    },
    {
      id: "datos",
      heading: {
        es: "2. Qué datos se tratan, exactamente",
        en: "2. What data is processed, exactly",
      },
      blocks: [
        {
          kind: "p",
          text: {
            es: "Esta es la lista completa, por categorías. Cada una corresponde a una parte concreta del sistema; no hay recogida de datos fuera de esto.",
            en: "This is the complete list, by category. Each one corresponds to a specific part of the system; no data is collected beyond this.",
          },
        },
        {
          kind: "ul",
          items: {
            es: [
              "Cuenta y acceso: dirección de correo electrónico, identificador interno, fechas de alta y de último acceso, y el método de autenticación empleado. Attesta no almacena contraseñas: la autenticación la gestiona Supabase.",
              "Organización y pertenencia: nombre de la organización, jurisdicciones seleccionadas, plan contratado y el papel de cada persona (propietaria, administradora, miembro).",
              "Contenido de cumplimiento: los sistemas de IA declarados, sus evaluaciones de riesgo, brechas, tareas, proveedores, incidentes y la evidencia que la organización declara. Puede contener datos personales si la organización los introduce (por ejemplo, el nombre de la persona responsable de un sistema).",
              "Registro de auditoría: qué se creó, modificó o borró, por quién y cuándo. Es inmutable por diseño —no se puede editar ni borrar, ni siquiera por nosotros— porque su valor entero depende de eso.",
              "Fichas de intake: cuando alguien de tu organización recibe un enlace para declarar un sistema de IA sin tener cuenta, se guarda lo que rellena y, si lo aporta voluntariamente, su nombre para poder preguntarle. La organización que emitió el enlace es la responsable.",
              "Invitaciones: dirección de correo de la persona invitada y estado de la invitación.",
              "Lista de espera: dirección de correo y de qué punto de la web procede la solicitud.",
              "Medición de audiencia: un identificador aleatorio generado en tu propio navegador, el nombre del evento, la ruta visitada y el idioma. No se guarda tu dirección IP, ni tu user-agent, ni resolución de pantalla, ni ninguna otra huella de dispositivo.",
              "Protección frente a abuso: para limitar el número de envíos por remitente se guarda un valor derivado (hash) que incorpora la dirección IP, nunca la dirección en sí, junto con un contador y una marca de tiempo.",
              "Facturación: si contratas un plan de pago, el correo de facturación y el estado de la suscripción. Los datos de la tarjeta los recoge Stripe directamente y no pasan por nuestros servidores.",
            ],
            en: [
              "Account and access: email address, internal identifier, sign-up and last sign-in dates, and the authentication method used. Attesta does not store passwords: authentication is handled by Supabase.",
              "Organization and membership: organization name, selected jurisdictions, subscribed plan, and each person's role (owner, admin, member).",
              "Compliance content: the declared AI systems, their risk assessments, gaps, tasks, suppliers, incidents and the evidence the organization declares. It may contain personal data if the organization enters it (for example, the name of the person responsible for a system).",
              "Audit log: what was created, modified or deleted, by whom and when. It is immutable by design — it cannot be edited or deleted, not even by us — because its entire value depends on that.",
              "Intake submissions: when someone at your organization receives a link to declare an AI system without holding an account, what they fill in is stored and, if they provide it voluntarily, their name so they can be contacted. The organization that issued the link is the controller.",
              "Invitations: the invited person's email address and the status of the invitation.",
              "Waiting list: email address and which part of the site the request came from.",
              "Audience measurement: a random identifier generated in your own browser, the event name, the path visited and the language. Your IP address is not stored, nor your user-agent, screen resolution, or any other device fingerprint.",
              "Abuse protection: to limit how many submissions come from one sender, a derived value (hash) incorporating the IP address is stored — never the address itself — along with a counter and a timestamp.",
              "Billing: if you subscribe to a paid plan, the billing email and the subscription status. Card details are collected by Stripe directly and never pass through our servers.",
            ],
          },
        },
        {
          kind: "note",
          text: {
            es: "Attesta no compra datos a terceros, no enriquece perfiles con fuentes externas y no toma decisiones automatizadas con efectos jurídicos sobre ninguna persona. Los resultados que produce (clasificación de riesgo, porcentaje de preparación) son orientaciones sobre sistemas declarados por la organización, no evaluaciones de personas.",
            en: "Attesta does not buy data from third parties, does not enrich profiles from external sources, and does not make automated decisions producing legal effects on any person. The outputs it produces (risk classification, readiness percentage) are guidance about systems declared by the organization, not evaluations of people.",
          },
        },
      ],
    },
    {
      id: "bases",
      heading: {
        es: "3. Para qué y con qué base jurídica",
        en: "3. Purposes and legal bases",
      },
      blocks: [
        {
          kind: "ul",
          items: {
            es: [
              "Prestar el servicio contratado (cuenta, organización, contenido de cumplimiento, facturación): ejecución del contrato — art. 6.1.b RGPD.",
              "Mantener el registro de auditoría y la integridad de la evidencia: interés legítimo en que el producto sea fiable, y ejecución del contrato, ya que ese registro es una parte central de lo que se contrata — arts. 6.1.f y 6.1.b.",
              "Seguridad y prevención de abuso (limitación de envíos, verificación de la cadena de auditoría): interés legítimo — art. 6.1.f.",
              "Medición de audiencia agregada y de primera parte, para saber qué partes del producto se usan: interés legítimo — art. 6.1.f. Se puede rechazar en cualquier momento, y se respeta automáticamente la señal de tu navegador (Global Privacy Control o Do Not Track).",
              "Lista de espera y contacto comercial solicitado: consentimiento — art. 6.1.a. Se retira escribiendo a la dirección de contacto.",
              "Cumplir obligaciones legales propias (contables, fiscales): art. 6.1.c.",
            ],
            en: [
              "Providing the contracted service (account, organization, compliance content, billing): performance of a contract — Art. 6(1)(b) GDPR.",
              "Maintaining the audit log and the integrity of evidence: legitimate interest in the product being trustworthy, and performance of the contract, since that log is a core part of what is being purchased — Arts. 6(1)(f) and 6(1)(b).",
              "Security and abuse prevention (submission limits, audit-chain verification): legitimate interest — Art. 6(1)(f).",
              "Aggregated, first-party audience measurement, to learn which parts of the product are used: legitimate interest — Art. 6(1)(f). You can object at any time, and your browser's signal (Global Privacy Control or Do Not Track) is honoured automatically.",
              "Waiting list and requested commercial contact: consent — Art. 6(1)(a). Withdrawn by writing to the contact address.",
              "Complying with our own legal obligations (accounting, tax): Art. 6(1)(c).",
            ],
          },
        },
      ],
    },
    {
      id: "quien",
      heading: {
        es: "4. Quién más ve estos datos",
        en: "4. Who else sees this data",
      },
      blocks: [
        {
          kind: "p",
          text: {
            es: "Attesta no vende datos personales ni los cede a terceros con fines publicitarios. Los únicos terceros que intervienen son los proveedores necesarios para que el servicio funcione, cada uno con su contrato de encargo y limitado a lo que necesita.",
            en: "Attesta does not sell personal data and does not share it with third parties for advertising. The only third parties involved are the providers needed to run the service, each under its own processing agreement and limited to what it needs.",
          },
        },
        {
          kind: "note",
          text: {
            es: "La lista completa y actualizada, con qué recibe cada uno y dónde lo trata, está en la página de subprocesadores. Esa lista no es un documento aparte: se genera del mismo registro que usa el código, y hay una prueba automática que falla si el producto empieza a hablar con un proveedor que no esté declarado ahí.",
            en: "The complete, up-to-date list — what each provider receives and where it processes it — is on the subprocessors page. That list is not a separate document: it is generated from the same registry the code uses, and an automated test fails if the product starts talking to a provider that is not declared there.",
          },
        },
        {
          kind: "p",
          text: {
            es: "Dentro de una organización cliente, quienes tienen cuenta ven el contenido de su propia organización según su papel. El aislamiento entre organizaciones se aplica en la propia base de datos (seguridad a nivel de fila), no solo en la interfaz.",
            en: "Within a customer organization, account holders see their own organization's content according to their role. Isolation between organizations is enforced in the database itself (row-level security), not only in the interface.",
          },
        },
      ],
    },
    {
      id: "donde",
      heading: {
        es: "5. Dónde se guardan y transferencias internacionales",
        en: "5. Where data is stored, and international transfers",
      },
      blocks: [
        {
          kind: "p",
          text: {
            es: "La base de datos y la autenticación están alojadas en la Unión Europea, y la aplicación se ejecuta en región de la UE. Algunos proveedores son entidades establecidas fuera del Espacio Económico Europeo; en esos casos la transferencia se ampara en las cláusulas contractuales tipo aprobadas por la Comisión Europea, y se indica proveedor por proveedor en la página de subprocesadores.",
            en: "The database and authentication are hosted in the European Union, and the application runs in an EU region. Some providers are entities established outside the European Economic Area; in those cases the transfer relies on the standard contractual clauses approved by the European Commission, indicated provider by provider on the subprocessors page.",
          },
        },
      ],
    },
    {
      id: "conservacion",
      heading: {
        es: "6. Cuánto tiempo se conservan",
        en: "6. How long data is kept",
      },
      blocks: [
        {
          kind: "ul",
          items: {
            es: [
              "Contenido de cumplimiento y datos de la organización: mientras la cuenta esté activa. Al cerrarla, se eliminan en un plazo máximo de 30 días, salvo lo que haya que conservar por obligación legal.",
              "Registro de auditoría: mientras la organización exista, porque su utilidad es precisamente la trazabilidad histórica. Se elimina con el resto al cerrar la cuenta.",
              "Lista de espera: hasta que se atienda la solicitud o se pida la baja.",
              "Medición de audiencia: los eventos son agregables y no identifican a nadie; el identificador aleatorio vive en tu navegador y lo puedes borrar cuando quieras vaciando el almacenamiento del sitio.",
              "Protección frente a abuso: los contadores se borran automáticamente pasadas 24 horas.",
              "Facturación: el plazo que exija la normativa contable y fiscal aplicable.",
            ],
            en: [
              "Compliance content and organization data: for as long as the account is active. When it is closed, data is deleted within a maximum of 30 days, except what must be retained by legal obligation.",
              "Audit log: for as long as the organization exists, because its whole point is historical traceability. It is deleted along with everything else when the account is closed.",
              "Waiting list: until the request is handled or removal is requested.",
              "Audience measurement: events are aggregable and identify no one; the random identifier lives in your browser and you can delete it at any time by clearing the site's storage.",
              "Abuse protection: counters are deleted automatically after 24 hours.",
              "Billing: for the period required by applicable accounting and tax rules.",
            ],
          },
        },
      ],
    },
    {
      id: "derechos",
      heading: {
        es: "7. Tus derechos y cómo ejercerlos",
        en: "7. Your rights and how to exercise them",
      },
      blocks: [
        {
          kind: "p",
          text: {
            es: "Tienes derecho a acceder a tus datos, rectificarlos, suprimirlos, limitar u oponerte a su tratamiento, y a recibirlos en un formato portable. Para los datos en los que Attesta es responsable (cuenta, lista de espera, medición), escribe a la dirección de contacto de esta página: responderemos en el plazo de un mes que fija el art. 12.3 RGPD.",
            en: "You have the right to access your data, rectify it, erase it, restrict or object to its processing, and receive it in a portable format. For data where Attesta is the controller (account, waiting list, measurement), write to the contact address on this page: we will respond within the one-month period set by Art. 12(3) GDPR.",
          },
        },
        {
          kind: "note",
          text: {
            es: "Si tus datos están en el contenido de una organización cliente, el interlocutor es esa organización, no Attesta: nosotros solo podemos actuar siguiendo sus instrucciones. Si nos escribes, te lo indicaremos y trasladaremos la petición.",
            en: "If your data sits within a customer organization's content, that organization — not Attesta — is the party to contact: we can only act on its instructions. If you write to us, we will tell you so and forward the request.",
          },
        },
        {
          kind: "p",
          text: {
            es: "También puedes presentar una reclamación ante la autoridad de control de tu país. En España es la Agencia Española de Protección de Datos (www.aepd.es).",
            en: "You may also lodge a complaint with the supervisory authority in your country. In Spain this is the Agencia Española de Protección de Datos (www.aepd.es).",
          },
        },
      ],
    },
    {
      id: "seguridad",
      heading: {
        es: "8. Medidas de seguridad",
        en: "8. Security measures",
      },
      blocks: [
        {
          kind: "ul",
          items: {
            es: [
              "Cifrado en tránsito (HTTPS obligatorio, con HSTS) y en reposo, en la infraestructura del proveedor de base de datos.",
              "Aislamiento entre organizaciones aplicado en la base de datos mediante seguridad a nivel de fila, no solo en la aplicación.",
              "Registro de auditoría inmutable, encadenado criptográficamente y verificado de forma periódica y automática para detectar manipulaciones.",
              "Política de seguridad de contenido, cabeceras de transporte estricto y limitación de envíos en los formularios públicos.",
              "Principio de mínima recogida: no se guardan direcciones IP ni user-agent para la medición de producto, y las claves de limitación se guardan como hash.",
            ],
            en: [
              "Encryption in transit (HTTPS enforced, with HSTS) and at rest, in the database provider's infrastructure.",
              "Isolation between organizations enforced in the database via row-level security, not only in the application.",
              "Immutable audit log, cryptographically chained and verified automatically on a schedule to detect tampering.",
              "Content Security Policy, strict transport headers, and submission limits on public forms.",
              "Data minimisation by default: no IP addresses or user-agents are stored for product measurement, and rate-limit keys are stored as hashes.",
            ],
          },
        },
      ],
    },
    {
      id: "cambios",
      heading: {
        es: "9. Cambios en este aviso",
        en: "9. Changes to this notice",
      },
      blocks: [
        {
          kind: "p",
          text: {
            es: "Si cambiamos algo sustantivo —una finalidad nueva, un proveedor nuevo que trate datos de cliente— se actualiza la fecha de revisión y se avisa a las organizaciones clientes por correo antes de que el cambio surta efecto, con el plazo de objeción previsto en el Acuerdo de Tratamiento de Datos.",
            en: "If we change something substantive — a new purpose, a new provider processing customer data — the revision date is updated and customer organizations are notified by email before the change takes effect, with the objection period set out in the Data Processing Agreement.",
          },
        },
      ],
    },
  ],
};
