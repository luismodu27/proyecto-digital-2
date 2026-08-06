/**
 * Acuerdo de Tratamiento de Datos (DPA) — art. 28 RGPD.
 *
 * PARA QUÉ SIRVE DE VERDAD. Ningún comprador mid-market europeo firma un SaaS que
 * toca datos de sus empleados sin un DPA. No es un trámite: es literalmente la
 * casilla que bloquea la compra en la revisión de proveedores, y llegar a esa
 * conversación sin documento significa semanas de retraso o el «no» directo. Que
 * Attesta venda gobernanza de IA y no tuviera el suyo era, además, incoherente
 * con lo que le pide a sus propios clientes.
 *
 * CÓMO ESTÁ ESCRITO. Siguiendo la lista del art. 28.3 punto por punto —objeto y
 * duración, naturaleza y fin, tipos de datos y categorías de interesados, y luego
 * las ocho obligaciones de las letras a) a h)— porque así es como lo revisa quien
 * lo revisa: con la lista al lado, comprobando que no falte ninguna. Un DPA con
 * prosa bonita y una letra ausente se devuelve con comentarios.
 *
 * LO QUE ESTE FICHERO NO PUEDE HACER. Un contrato necesita partes identificadas.
 * Mientras `entity.ts` no tenga sociedad, domicilio y NIF, la página se marca como
 * borrador y no se indexa. Y necesita revisión de abogado: el texto es correcto en
 * los hechos técnicos —que es la parte que normalmente sale mal en las plantillas—
 * pero la redacción contractual no es cosa que se cierre sin jurista.
 */
import type { LegalDocument } from "./types";

export const DPA_DOC: LegalDocument = {
  id: "dpa",
  slug: { es: "tratamiento-de-datos", en: "data-processing-agreement" },
  title: {
    es: "Acuerdo de Tratamiento de Datos",
    en: "Data Processing Agreement",
  },
  summary: {
    es: "Condiciones bajo las que Attesta trata datos personales por cuenta de tu organización (art. 28 RGPD).",
    en: "Terms under which Attesta processes personal data on your organization's behalf (Art. 28 GDPR).",
  },
  updated: "2026-08-04",
  sections: [
    {
      id: "objeto",
      heading: {
        es: "1. Objeto, duración, naturaleza y finalidad",
        en: "1. Subject matter, duration, nature and purpose",
      },
      blocks: [
        {
          kind: "p",
          text: {
            es: "Este acuerdo regula el tratamiento de datos personales que Attesta (el encargado) realiza por cuenta de la organización cliente (el responsable) al prestar el servicio contratado. Forma parte del contrato de servicio y se aplica desde su aceptación hasta el cese del servicio y la devolución o supresión de los datos.",
            en: "This agreement governs the processing of personal data that Attesta (the processor) carries out on behalf of the customer organization (the controller) when providing the contracted service. It forms part of the service contract and applies from acceptance until the service ends and data is returned or deleted.",
          },
        },
        {
          kind: "p",
          text: {
            es: "La naturaleza y finalidad del tratamiento son: alojar, organizar, consultar y poner a disposición del responsable la información sobre sus sistemas de IA, sus evaluaciones de riesgo, su evidencia declarada y su registro de actividad, así como generar a partir de ella los documentos e informes que el propio responsable solicita.",
            en: "The nature and purpose of the processing are: to host, organise, retrieve and make available to the controller the information about its AI systems, its risk assessments, its declared evidence and its activity log, and to generate from it the documents and reports the controller itself requests.",
          },
        },
      ],
    },
    {
      id: "datos",
      heading: {
        es: "2. Tipos de datos y categorías de interesados",
        en: "2. Types of data and categories of data subjects",
      },
      blocks: [
        {
          kind: "ul",
          items: {
            es: [
              "Tipos de datos: datos identificativos y de contacto profesional (nombre, correo, papel dentro de la organización), datos de uso de la plataforma (acciones registradas en el registro de auditoría) y cualquier dato personal que el responsable decida incluir en los campos de texto libre del inventario, la evidencia o las notas.",
              "Categorías de interesados: personal del responsable con cuenta en la plataforma; personas designadas como responsables de un sistema de IA; personas que envían una ficha de intake mediante un enlace emitido por el responsable.",
              "No es finalidad del servicio tratar categorías especiales de datos del art. 9 RGPD. El responsable se compromete a no introducirlas en los campos de texto libre.",
            ],
            en: [
              "Types of data: identification and professional contact data (name, email, role within the organization), platform usage data (actions recorded in the audit log), and any personal data the controller chooses to enter in free-text fields of the inventory, evidence or notes.",
              "Categories of data subjects: the controller's staff holding an account on the platform; people designated as responsible for an AI system; people submitting an intake form through a link issued by the controller.",
              "Processing special categories of data under Art. 9 GDPR is not a purpose of the service. The controller undertakes not to enter such data in free-text fields.",
            ],
          },
        },
      ],
    },
    {
      id: "instrucciones",
      heading: {
        es: "3. Tratamiento conforme a instrucciones (art. 28.3.a)",
        en: "3. Processing on documented instructions (Art. 28(3)(a))",
      },
      blocks: [
        {
          kind: "p",
          text: {
            es: "Attesta trata los datos personales únicamente siguiendo las instrucciones documentadas del responsable, que son el contrato de servicio, este acuerdo y el uso que el responsable hace de las funciones del producto. Si una instrucción infringe la normativa de protección de datos, Attesta lo comunicará antes de ejecutarla.",
            en: "Attesta processes personal data solely on the controller's documented instructions, which are the service contract, this agreement, and the controller's use of the product's features. If an instruction infringes data protection law, Attesta will say so before carrying it out.",
          },
        },
        {
          kind: "note",
          text: {
            es: "Attesta no utiliza los datos del responsable para entrenar modelos de inteligencia artificial, ni propios ni de terceros, ni para ninguna finalidad ajena a la prestación del servicio. Los proveedores de IA que intervienen en el radar de vigilancia tratan exclusivamente texto normativo público, nunca contenido del responsable.",
            en: "Attesta does not use the controller's data to train artificial-intelligence models, whether its own or third parties', nor for any purpose other than providing the service. The AI providers involved in the regulatory monitoring radar process only public regulatory text, never the controller's content.",
          },
        },
      ],
    },
    {
      id: "confidencialidad",
      heading: {
        es: "4. Confidencialidad (art. 28.3.b)",
        en: "4. Confidentiality (Art. 28(3)(b))",
      },
      blocks: [
        {
          kind: "p",
          text: {
            es: "Las personas autorizadas por Attesta para tratar los datos están sujetas a un deber de confidencialidad de naturaleza contractual, que subsiste tras el fin de la relación. El acceso se concede por necesidad y se retira al cesar esa necesidad.",
            en: "Persons authorised by Attesta to process the data are bound by a contractual duty of confidentiality that survives the end of the relationship. Access is granted on a need-to-know basis and withdrawn when that need ends.",
          },
        },
      ],
    },
    {
      id: "seguridad",
      heading: {
        es: "5. Seguridad del tratamiento (arts. 28.3.c y 32)",
        en: "5. Security of processing (Arts. 28(3)(c) and 32)",
      },
      blocks: [
        {
          kind: "ul",
          items: {
            es: [
              "Cifrado de los datos en tránsito y en reposo.",
              "Aislamiento entre organizaciones aplicado en la propia base de datos mediante seguridad a nivel de fila, de modo que una organización no puede leer los datos de otra aunque la aplicación fallara.",
              "Control de acceso por papeles dentro de cada organización (propietaria, administradora, miembro).",
              "Registro de auditoría inmutable y encadenado criptográficamente, con verificación automática periódica para detectar manipulaciones.",
              "Copias de seguridad gestionadas por el proveedor de base de datos, con capacidad de restauración a un punto en el tiempo.",
              "Minimización: no se registran direcciones IP ni user-agent para la medición de producto, y las claves de limitación de abuso se almacenan como hash.",
            ],
            en: [
              "Encryption of data in transit and at rest.",
              "Isolation between organizations enforced in the database itself via row-level security, so one organization cannot read another's data even if the application failed.",
              "Role-based access control within each organization (owner, admin, member).",
              "Immutable, cryptographically chained audit log, with automated periodic verification to detect tampering.",
              "Backups managed by the database provider, with point-in-time restore capability.",
              "Minimisation: no IP addresses or user-agents are recorded for product measurement, and abuse-limitation keys are stored as hashes.",
            ],
          },
        },
      ],
    },
    {
      id: "subencargados",
      heading: {
        es: "6. Subencargados (arts. 28.2 y 28.4)",
        en: "6. Sub-processors (Arts. 28(2) and 28(4))",
      },
      blocks: [
        {
          kind: "p",
          text: {
            es: "El responsable autoriza de forma general la incorporación de subencargados. La lista vigente, con la finalidad, los datos y la ubicación de cada uno, está publicada y accesible en todo momento en la página de subprocesadores.",
            en: "The controller gives general authorisation for the engagement of sub-processors. The current list, with each one's purpose, data and location, is published and accessible at all times on the subprocessors page.",
          },
        },
        {
          kind: "note",
          text: {
            es: "Antes de incorporar un subencargado nuevo que trate datos del responsable, Attesta lo comunicará por correo electrónico con al menos 30 días de antelación. Durante ese plazo el responsable puede oponerse por motivos razonables de protección de datos; si la objeción no puede resolverse, podrá resolver el contrato sin penalización respecto del servicio afectado.",
            en: "Before engaging a new sub-processor that would process the controller's data, Attesta will give at least 30 days' notice by email. During that period the controller may object on reasonable data protection grounds; if the objection cannot be resolved, it may terminate the contract without penalty as regards the affected service.",
          },
        },
        {
          kind: "p",
          text: {
            es: "Attesta impone a cada subencargado, por contrato, obligaciones de protección de datos equivalentes a las de este acuerdo, y responde ante el responsable del cumplimiento de dichas obligaciones.",
            en: "Attesta imposes on each sub-processor, by contract, data protection obligations equivalent to those in this agreement, and remains liable to the controller for their performance.",
          },
        },
      ],
    },
    {
      id: "derechos",
      heading: {
        es: "7. Asistencia con los derechos de los interesados (art. 28.3.e)",
        en: "7. Assistance with data subject rights (Art. 28(3)(e))",
      },
      blocks: [
        {
          kind: "p",
          text: {
            es: "El producto permite al responsable acceder, rectificar y suprimir por sí mismo la mayor parte del contenido de su organización. Para lo que no pueda resolver con las funciones disponibles, Attesta le asistirá con medidas técnicas y organizativas apropiadas. Si un interesado se dirige directamente a Attesta, esta no responderá por su cuenta: le indicará que debe dirigirse al responsable y trasladará la solicitud sin demora indebida.",
            en: "The product lets the controller access, rectify and delete most of its organization's content on its own. For anything it cannot resolve with the available features, Attesta will assist with appropriate technical and organisational measures. If a data subject contacts Attesta directly, Attesta will not respond on its own: it will direct them to the controller and forward the request without undue delay.",
          },
        },
      ],
    },
    {
      id: "asistencia",
      heading: {
        es: "8. Asistencia en seguridad, brechas y evaluaciones (art. 28.3.f)",
        en: "8. Assistance with security, breaches and assessments (Art. 28(3)(f))",
      },
      blocks: [
        {
          kind: "note",
          text: {
            es: "Attesta notificará al responsable cualquier violación de la seguridad de los datos personales sin demora indebida y, en todo caso, dentro de las 48 horas siguientes a tener conocimiento de ella, con la información necesaria para que el responsable pueda cumplir sus propias obligaciones de los arts. 33 y 34 RGPD.",
            en: "Attesta will notify the controller of any personal data breach without undue delay and, in any event, within 48 hours of becoming aware of it, with the information the controller needs to meet its own obligations under Arts. 33 and 34 GDPR.",
          },
        },
        {
          kind: "p",
          text: {
            es: "Attesta asistirá razonablemente al responsable en las evaluaciones de impacto (art. 35) y en las consultas previas a la autoridad de control (art. 36) que se refieran al tratamiento objeto de este acuerdo.",
            en: "Attesta will reasonably assist the controller with data protection impact assessments (Art. 35) and prior consultations with the supervisory authority (Art. 36) relating to the processing covered by this agreement.",
          },
        },
      ],
    },
    {
      id: "supresion",
      heading: {
        es: "9. Devolución o supresión al finalizar (art. 28.3.g)",
        en: "9. Return or deletion on termination (Art. 28(3)(g))",
      },
      blocks: [
        {
          kind: "p",
          text: {
            es: "Al terminar la prestación del servicio, y a elección del responsable, Attesta devolverá los datos en un formato estructurado y de uso común o los suprimirá, junto con las copias existentes, en un plazo máximo de 30 días, salvo que el Derecho de la Unión o nacional exija conservarlos.",
            en: "On termination of the service, and at the controller's choice, Attesta will return the data in a structured, commonly used format or delete it, along with existing copies, within a maximum of 30 days, unless Union or national law requires it to be retained.",
          },
        },
      ],
    },
    {
      id: "auditoria",
      heading: {
        es: "10. Información y auditorías (art. 28.3.h)",
        en: "10. Information and audits (Art. 28(3)(h))",
      },
      blocks: [
        {
          kind: "p",
          text: {
            es: "Attesta pondrá a disposición del responsable la información necesaria para demostrar el cumplimiento de las obligaciones de este acuerdo y permitirá y contribuirá a auditorías, incluidas inspecciones, realizadas por el responsable o por un auditor que este designe, previo aviso razonable, en horario laboral y sin comprometer la confidencialidad de otros clientes.",
            en: "Attesta will make available to the controller the information needed to demonstrate compliance with this agreement and will allow for and contribute to audits, including inspections, conducted by the controller or an auditor it appoints, on reasonable notice, during business hours, and without compromising the confidentiality of other customers.",
          },
        },
      ],
    },
    {
      id: "transferencias",
      heading: {
        es: "11. Transferencias internacionales",
        en: "11. International transfers",
      },
      blocks: [
        {
          kind: "p",
          text: {
            es: "Los datos se alojan en la Unión Europea. Cuando un subencargado esté establecido fuera del Espacio Económico Europeo, la transferencia se ampara en las cláusulas contractuales tipo aprobadas por la Comisión Europea, complementadas con las medidas adicionales que resulten necesarias. La ubicación de cada subencargado se indica en la página de subprocesadores.",
            en: "Data is hosted in the European Union. Where a sub-processor is established outside the European Economic Area, the transfer relies on the standard contractual clauses approved by the European Commission, supplemented by any additional measures required. Each sub-processor's location is indicated on the subprocessors page.",
          },
        },
      ],
    },
  ],
};
