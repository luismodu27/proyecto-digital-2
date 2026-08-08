/**
 * Diccionario canónico (español). Define la FORMA (`type Dictionary = typeof es`).
 * `en.ts` debe satisfacer ese tipo: si falta una clave o cambia una firma, tsc falla.
 *
 * SOLO chrome de UI. Nada de contenido regulatorio determinista (ver config.ts).
 *
 * PROHIBIDO PONER FUNCIONES AQUÍ. El diccionario entero se pasa como prop a
 * `I18nProvider`, que es un Client Component, y todo lo que cruza esa frontera se
 * serializa: una función lanza *"Functions cannot be passed directly to Client
 * Components"* y devuelve un 500. Es un error de EJECUCIÓN, así que ni `tsc` ni
 * `next build` lo ven — pasó una vez, con el panel entero roto y el build en
 * verde. Para cadenas con variables, usa un marcador de posición (`{days}`) y
 * `replace` en el punto de uso. Lo vigila `dictionaries.guard.test.ts`.
 */

export const es = {
  common: {
    save: "Guardar",
    cancel: "Cancelar",
    close: "Cerrar",
    back: "Volver",
    next: "Siguiente",
    loading: "Cargando…",
    seeAll: "Ver todos",
    skipToContent: "Saltar al contenido",
  },

  locale: {
    switchToEn: "Ver en inglés",
    switchToEs: "Ver en español",
    label: "Idioma",
    es: "Español",
    en: "English",
  },

  nav: {
    product: "Producto",
    howItWorks: "Cómo funciona",
    pricing: "Precios",
    faq: "FAQ",
    login: "Entrar",
    // CTA principal de la cabecera. Antes era "Solicitar acceso" → lista de
    // espera; el plan Diagnóstico es gratuito y el registro está activo, así que
    // el mensaje coherente es que se puede empezar hoy.
    requestAccess: "Empieza gratis",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
  },

  // Formulario PÚBLICO del enlace de intake: lo rellena alguien de la organización
  // del cliente que no tiene cuenta en Attesta.
  intake: {
    metaTitle: "Registrar una herramienta de IA",
    metaDescription:
      "Formulario para declarar una herramienta de IA que usa tu equipo, dentro del inventario de gobernanza de tu organización.",
    title: "¿Qué herramienta de IA usa tu equipo?",
    subtitle:
      "Tu organización está inventariando sus sistemas de IA para cumplir con la normativa. Cuéntanos qué usáis: se tarda menos de un minuto y no necesitas cuenta.",
    nameLabel: "Nombre de la herramienta *",
    namePlaceholder: "ChatGPT, un ATS, un chatbot de soporte…",
    nameHint:
      "Vale el nombre comercial. Si es algo hecho en casa, describe para qué sirve.",
    ownerLabel: "Área o responsable",
    ownerPlaceholder: "Marketing",
    domainLabel: "¿Para qué se usa?",
    domainPlaceholder: "Redactar borradores de anuncios",
    vendorLabel: "Proveedor",
    vendorPlaceholder: "OpenAI, HireFlow…",
    byLabel: "Tu nombre o correo (opcional)",
    byPlaceholder: "Para poder preguntarte dudas",
    notesLabel: "Algo más que debamos saber",
    notesPlaceholder:
      "¿Toma decisiones sobre personas? ¿Se le pasan datos de clientes o candidatos?",
    submit: "Enviar",
    sending: "Enviando…",
    thanksTitle: "¡Gracias!",
    thanksBody:
      "Tu equipo de compliance revisará la ficha y la añadirá al inventario. Si usáis más herramientas, añádelas también.",
    addAnother: "Añadir otra herramienta",
    privacyNote:
      "Lo que envías va al inventario de gobernanza de tu organización. Attesta solo procesa los datos por encargo suyo.",
    footerNote: "Inventario de IA gestionado con Attesta.",
    errors: {
      demo: "Este enlace no está conectado a una organización.",
      "no-name": "Escribe al menos el nombre de la herramienta.",
      "rate-limit": "Demasiados envíos seguidos. Espera unos minutos.",
      invalid:
        "Este enlace ya no acepta envíos: puede haber caducado o haberse revocado. Pídele uno nuevo a quien te lo compartió.",
    },
  },

  meta: {
    title: "Attesta — Gobernanza continua de IA para el mid-market",
    description:
      "Inventaría tus sistemas de IA, clasifica su riesgo (EU AI Act + EE. UU.) y genera evidencia lista para auditoría. Compliance de IA sin equipo GRC.",
    ogTitle: "Attesta — Gobernanza continua de IA",
  },

  landing: {
    hero: {
      badge: "El sistema de registro de tu gobernanza de IA · RRHH",
      titleLine1: "Contrata con IA",
      titleLine2: "sin miedo a la auditoría.",
      bodyBefore:
        "La IA que usas para contratar —cribado de CVs, entrevistas, scoring de candidatos— es de ",
      bodyEmphasis: "alto riesgo",
      bodyAfter:
        " bajo el EU AI Act. Attesta la inventaría, clasifica su riesgo, genera tu evidencia y vigila los cambios normativos. Sin necesitar un equipo GRC.",
      ctaPrimary: "Empieza gratis",
      ctaSecondary: "Explora la demo en vivo",
      ctaNote: "Gratis para empezar · sin tarjeta · sin llamada de ventas",
      footnote:
        "Más de 3 de cada 4 empresas van más rápido en IA que en su gobierno. Tú puedes ir por delante.",
    },

    heroPreview: {
      urlBar: "app.attesta.io/dashboard",
      navItems: ["Resumen", "Inventario", "Riesgo", "Vigilancia", "Equipo"],
      overviewTitle: "Resumen de gobernanza",
      liveLabel: "En vivo",
      stats: [
        { k: "Sistemas", v: "6" },
        { k: "Alto riesgo", v: "4" },
        { k: "% listo", v: "59%" },
      ],
      milestoneLabel: "Próximo hito · Transparencia (Art. 50)",
      countdown: "en 16 días",
      distributionTitle: "Distribución de riesgo",
      riskLabels: ["Alto riesgo", "Riesgo limitado", "Riesgo mínimo"],
    },

    trustStrip: {
      eyebrow: "Construido para resistir una auditoría",
      signals: [
        {
          title: "Cero alucinaciones",
          body: "Texto regulatorio 100% determinista, sin LLM.",
        },
        {
          title: "Datos alojados en la UE",
          body: "Alojamiento dentro de la Unión Europea.",
        },
        {
          title: "Registro inmutable",
          body: "Cada cambio queda en un audit-trail inalterable.",
        },
        {
          title: "Revisado por experto",
          body: "Contenido regulatorio revisado por un experto en compliance.",
        },
      ],
    },

    problemStats: {
      eyebrow: "El problema",
      title: "La regulación llegó. La mayoría no está lista.",
      intro:
        "Miles de empresas medianas usan IA en decisiones que afectan a personas —contratación, crédito, seguros, salud— y de repente están en el punto de mira regulatorio, sin equipo de compliance.",
      statLabels: [
        "de las empresas reconoce que su adopción de IA avanza más rápido que su capacidad de gobernarla.",
        "no tiene un inventario formal de sus sistemas de IA.",
        "o el 7% de la facturación: multas más duras que el GDPR.",
        "es lo que hoy cuesta resolverlo con consultores y hojas de cálculo.",
      ],
      sources:
        "Fuentes: gobierno de la IA — IBM, estudio de junio de 2026 (2.000 CIO y CTO en 33 países); inventario de IA — Cloud Security Alliance, nota de investigación de 2026. El límite de 35 M€ / 7 % de la facturación procede del propio EU AI Act (Art. 99).",
    },

    recruitmentFocus: {
      eyebrow: "Hecho para RRHH",
      title: "¿Usas IA para contratar? Estás en el alcance.",
      introBefore:
        "El EU AI Act clasifica la IA de empleo y selección de personal como ",
      introEmphasis: "alto riesgo",
      introAfter:
        " (Anexo III). Attesta te dice exactamente qué tienes y qué te falta.",
      cases: [
        {
          name: "Cribado y ranking de CVs",
          body: "Filtra o prioriza candidatos y decide quién avanza en el proceso.",
        },
        {
          name: "Entrevistas por vídeo con IA",
          body: "Analiza respuestas, voz o expresiones para evaluar a la persona.",
        },
        {
          name: "Scoring de candidatos",
          body: "Puntúa la idoneidad para el puesto a partir de datos del perfil.",
        },
        {
          name: "Tests psicométricos automatizados",
          body: "Evalúa aptitudes o personalidad con corrección automática.",
        },
        {
          name: "Chatbots de selección",
          body: "Interactúan con candidatos: obligación de transparencia.",
        },
        {
          name: "Agenda y logística de entrevistas",
          body: "Coordina sin decidir sobre las personas.",
        },
      ],
      note: "Clasificación orientativa según los criterios del EU AI Act. Attesta ofrece autoevaluación y gestión de evidencia, no asesoría legal.",
      riskLabels: { high: "Alto riesgo", limited: "Riesgo limitado", minimal: "Riesgo mínimo" },
    },

    modules: {
      eyebrow: "El producto",
      title: "El sistema de registro de tu gobernanza de IA.",
      intro: "El flujo completo: del inventario a la evidencia lista para auditar.",
      items: [
        {
          title: "Inventario de sistemas de IA",
          body: "Un catálogo vivo de cada modelo y sistema en uso: quién lo opera, qué datos toca y para qué decisión se usa. Más de la mitad de las empresas no lo tiene; tú sí.",
          stat: { v: "1", k: "fuente de verdad, no hojas sueltas" },
          points: [
            "Descubrimiento guiado",
            "Propietario y proveedor",
            "Estado siempre al día",
          ],
        },
        {
          title: "Clasificación de riesgo",
          body: "Un asistente guiado clasifica cada sistema según el EU AI Act —inaceptable, alto, limitado o mínimo— y te dice exactamente qué obligaciones aplican, distinguiendo lo tuyo (deployer) de lo del proveedor.",
          stat: { v: "5", k: "obligaciones del deployer · Arts. 14·26·27·50·86" },
          points: [
            "Mapeo a artículos del AI Act",
            "Captura de evidencia y atestación",
            "Explicable y defendible",
          ],
        },
        {
          title: "Gap assessment y plan",
          body: "Qué te falta, priorizado por severidad, con plan de acción por artículo. Aplica un policy pack por dominio (RRHH, gestión de trabajadores, atención al cliente e IA generativa o crédito/seguros) y precarga los controles típicos del caso.",
          stat: { v: "Minutos", k: "para tu dossier, no semanas" },
          points: [
            "Brechas priorizadas",
            "Policy packs por dominio",
            "Plan de acción por artículo",
          ],
        },
      ],
    },

    platform: {
      eyebrow: "El foso",
      title: "Gobernanza continua, no la foto de un día.",
      intro:
        "Un checklist caduca en cuanto lo cierras. Attesta se mantiene vivo: vigila la norma, genera la documentación y guarda la evidencia por ti.",
      items: [
        {
          title: "Vigilancia regulatoria",
          body: "Un radar de plazos y cambios del EU AI Act, mapeados a tus sistemas: sabes qué te afecta y cuándo, antes de que llegue. Cuando la ley cambia, tú ya lo sabes.",
        },
        {
          title: "Dossier e informes automáticos",
          body: "Genera en un clic el dossier de gobernanza de cada sistema y el informe ejecutivo de la organización, listos para el auditor o la dirección. Como tener un consultor dentro.",
        },
        {
          title: "Registro inmutable",
          body: "Cada cambio queda grabado por la base de datos —quién hizo qué y cuándo— sin poder editarlo ni borrarlo. Evidencia defendible de verdad, no una hoja de cálculo.",
        },
        {
          title: "Tu equipo, con roles",
          body: "RRHH, Legal y auditoría trabajando en el mismo sitio, con permisos por rol y aislamiento por organización. Invita a quien necesites en segundos.",
        },
      ],
    },

    coverage: {
      eyebrow: "Cobertura de marcos",
      title: "Prepara la evidencia de los marcos que te aplican",
      intro:
        "Un mismo sistema de registro para autoevaluar tu IA y reunir evidencia lista para auditoría frente a los marcos que te aplican.",
      frameworks: [
        {
          name: "EU AI Act",
          body: "Organiza la supervisión humana, la transparencia y la evidencia que exige tu despliegue.",
          tag: "Arts. 14·26·27·50·86",
        },
        {
          name: "ISO/IEC 42001",
          body: "Estructura tu sistema de gestión de IA y reúne su evidencia declarada.",
          tag: "Cláusulas 4–10 · Anexo A",
        },
        {
          name: "NIST AI RMF",
          body: "Ordena tus prácticas de gobernanza de IA según sus cuatro funciones.",
          tag: "Govern · Map · Measure · Manage",
        },
        {
          name: "NYC Local Law 144",
          body: "Conserva la auditoría de sesgo independiente y los avisos a candidatos.",
          tag: "Auditoría de sesgo · AEDT",
        },
        {
          name: "Illinois (IA en empleo)",
          body: "Documenta el aviso de uso de IA y las salvaguardas en selección.",
          tag: "AI Video Interview Act · HB 3773",
        },
        {
          name: "California (IA en empleo)",
          body: "Reúne la evidencia declarada de tus sistemas de decisión automatizada y conserva los registros que el empleo exige.",
          tag: "ADS (FEHA) · ADMT (CPPA)",
        },
        {
          name: "Colorado (decisiones automatizadas)",
          body: "Prepara el aviso previo, la explicación tras un resultado adverso y el expediente de cada decisión, antes de 2027.",
          tag: "ADMT · SB 26-189",
        },
      ],
      radarLabel: "En el radar de vigilancia",
      radar: ["Texas TRAIGA"],
      note: "Preparación para auditoría y clasificación orientativa — no es certificación ni asesoría legal.",
    },

    whyNow: {
      eyebrow: "Por qué ahora",
      title: "Una obligación inevitable, con una ventana para adelantarse.",
      introBefore: "El mercado de software de gobernanza de IA pasará de ",
      introValue1: "$492M en 2026",
      introMid: " a ",
      introValue2: "$15.8B en 2030",
      introAfter:
        " (~30–36% CAGR). Quien se convierta hoy en el sistema de registro de la gobernanza, se queda.",
      milestones: [
        {
          date: "Feb 2025 · en vigor",
          title: "Alfabetización en IA (Art. 4)",
          body: "Ya exigible: tu organización debe procurar que quien opera estas herramientas tenga formación suficiente en IA. Es un deber propio del deployer, no del proveedor.",
        },
        {
          date: "2 ago 2026",
          title: "Transparencia (Art. 50)",
          body: "El plazo más cercano: empiezan a aplicarse los deberes de transparencia sobre la IA que interactúa con candidatos o genera contenido. Afecta directamente a un proceso de selección con IA.",
        },
        {
          date: "Dic 2027",
          title: "Obligaciones de alto riesgo",
          body: "El Digital Omnibus movió aquí las obligaciones del Anexo III (empleo). No es agosto de 2026 —un error extendido en el mercado—: tienes una ventana para prepararte bien, no para ignorarlo.",
        },
        {
          date: "2026 →",
          title: "Leyes estatales en EE.UU.",
          body: "Se suman regulaciones de IA a nivel estatal (p. ej. Nueva York, Illinois, Colorado). La superficie regulatoria crece.",
        },
      ],
    },

    useCaseStory: {
      eyebrow: "En acción",
      title: "De la duda a la evidencia, en una tarde.",
      verbs: ["Inventaría tu IA", "Clasifica el riesgo", "Prueba que estás listo"],
      intro:
        "Así es como una empresa mid-market pasa de «creo que usamos IA en contratación» a tener todo clasificado, con brechas cerradas y evidencia lista para el auditor.",
      inventory: {
        header: "Inventario · 3 sistemas",
        rows: [
          { name: "Cribado de CVs", tag: "Alto riesgo" },
          { name: "Scoring de candidatos", tag: "Alto riesgo" },
          { name: "Chatbot de entrevistas", tag: "Riesgo limitado" },
        ],
      },
      risk: {
        header: "Distribución de riesgo",
        badge: "Cribado de CVs · Anexo III",
        barLabels: ["Alto riesgo", "Riesgo limitado", "Riesgo mínimo"],
      },
      gap: {
        header: "Preparación para auditoría",
        subtext: "Desde 41% al abrir el plan de acción.",
        tasks: [
          "Supervisión humana documentada (Art. 14)",
          "Aviso de transparencia a candidatos (Art. 50)",
          "Registro de logs conservado (Art. 26)",
        ],
      },
      evidence: {
        fileTitle: "Dossier de evidencia · Cribado de CVs.pdf",
        fileSubtitle: "Generado y listo para el auditor.",
        radar: "El radar detectó un cambio · Transparencia (Art. 50)",
        countdown: "en 16 días",
      },
      steps: [
        {
          title: "Descubre lo que ya usa",
          body: "En una tarde, Talenta RH —una agencia de selección de 140 personas— inventaría los sistemas de IA que ya tenía en marcha sin saberlo del todo.",
        },
        {
          title: "Ve su riesgo real",
          body: "El cribado de CVs resulta ser de alto riesgo bajo el Anexo III del EU AI Act. Attesta lo clasifica y le dice, como deployer, qué obligaciones le tocan.",
        },
        {
          title: "Cierra las brechas",
          body: "El gap assessment se convierte en un plan con responsables y fechas. Su preparación para auditoría sube del 41% al 78% conforme cierra tareas.",
        },
        {
          title: "Queda auditable y vigilada",
          body: "Genera su dossier de evidencia con un clic y el radar regulatorio queda vigilando: cuando algo cambia, se lo avisa antes del plazo.",
        },
      ],
    },

    evidence: {
      eyebrow: "La prueba",
      title: "La evidencia que enseñas al auditor.",
      intro:
        "Cada acción deja rastro: un dossier por sistema, un registro que nadie puede alterar y tu preparación medida al día. Es evidencia que tu organización declara, no un veredicto nuestro.",
      dossier: {
        label: "Dossier de gobernanza",
        file: "Cribado de CVs.pdf",
        caption: "Generado con tus datos, listo para el auditor.",
        lines: [
          "Clasificación de riesgo · Alto (Anexo III)",
          "Obligaciones del deployer · Arts. 14 · 26 · 50",
          "Evidencia declarada · 12 controles",
        ],
      },
      audit: {
        label: "Registro inmutable",
        actor: "María G.",
        action: "actualizó la evaluación de riesgo",
        time: "hace 2 h",
        sealNote: "Encadenado e inalterable: nadie puede editarlo ni borrarlo.",
      },
      readiness: {
        label: "Preparación para auditoría",
        value: 78,
        caption: "Tu organización declara un 78% de preparación.",
      },
      note: "Evidencia declarada por tu organización y clasificación orientativa — no es certificación ni asesoría legal.",
    },

    // Cómo verificamos el contenido legal. Regla al editar: aquí SOLO van
    // afirmaciones comprobables sobre nuestro propio proceso. Nada de lo que
    // diga esta sección puede ser algo que no hagamos de verdad — es la
    // sección donde una exageración cuesta más cara.
    verification: {
      eyebrow: "Cómo lo verificamos",
      title: "El texto legal no lo escribe un modelo",
      intro:
        "Es la parte del producto donde una alucinación no es un error molesto, sino un pasivo. Así que el contenido regulatorio no se genera: se ensambla con tus datos y con texto que un experto ya verificó contra la norma.",
      steps: [
        {
          n: "01",
          title: "Fuente primaria antes que código",
          body: "Cada regla nueva —un artículo, una ley estatal, un plazo— se investiga contra el texto oficial antes de escribir una línea. Varias veces eso ha cambiado el contenido antes de existir, y casi siempre en la dirección de quitar, no de añadir.",
        },
        {
          n: "02",
          title: "Segunda pasada adversarial",
          body: "Lo investigado se vuelve a revisar buscando el error, no la confirmación: qué se ha citado de más, qué obligación es de otro sujeto, qué plazo se ha dado por cierto sin leerlo.",
        },
        {
          n: "03",
          title: "Ensamblado determinista, cero modelo",
          body: "Dossier, informe, clasificación y recomendaciones se componen solo con datos de tu organización y texto ya verificado. Donde hay automatización —la vigilancia regulatoria— la máquina propone un borrador y una persona lo valida antes de que se publique.",
        },
        {
          n: "04",
          title: "Guardas automáticas en cada cambio",
          body: "Cada modificación pasa por comprobaciones que fallan solas: una vigila que no aparezca copy que insinúe certificación, otras codifican la expectativa regulatoria de cada regla. Y se validan rompiéndolas a propósito: un test que no falla al romper la regla no protege nada.",
        },
      ],
      notTitle: "Lo que no hacemos",
      not: [
        "No generamos texto regulatorio con un modelo de lenguaje.",
        "No afirmamos una fecha que no hayamos leído en el texto oficial: si está pendiente de verificar, lo decimos.",
        "No puntuamos tu cumplimiento ni el de tus proveedores. Contamos hechos: qué consta y qué falta.",
      ],
      exampleLabel: "Un ejemplo de que funciona",
      exampleTitle: "Colorado cambió de ley y el contenido cambió con ella",
      exampleBody:
        "El régimen de IA de Colorado fue derogado y reemplazado por otro. Media docena de obligaciones que dábamos por buenas describían una norma que ya no existía —incluida una que era además argumento comercial—. Se detectaron leyendo la ley nueva, no esperando a que lo notara un cliente. Ninguna verificación automática habría cazado eso: no es un fallo de código, es contenido.",
    },
    honestidad: {
      eyebrow: "Por qué puedes confiar",
      title: "Cero alucinaciones. Por diseño.",
      intro:
        "Cada línea de tu evidencia sale de tus datos y del texto del EU AI Act verificado por un humano — no de un modelo generativo. Es lo contrario de «compliance con IA»: aquí la IA no escribe tu derecho.",
      pillars: [
        {
          title: "Contenido legal determinista",
          body: "Ninguna clasificación de riesgo ni texto regulatorio lo redacta un modelo generativo. Se ensambla con reglas y con el texto verificado del EU AI Act sobre tus datos reales. Un texto legal inventado sería un pasivo; aquí no existe.",
        },
        {
          title: "Contrastado con criterio experto",
          body: "El contenido regulatorio se contrasta con criterio experto en el EU AI Act (artículos, plazos y el reparto de obligaciones entre proveedor y deployer) antes de publicarse, y se actualiza cuando la norma cambia.",
        },
        {
          title: "Evidencia verificable",
          body: "Cada registro queda encadenado con una huella SHA-256: cualquier alteración posterior es detectable. La evidencia que presentas al auditor es trazable, no una captura sin respaldo.",
        },
      ],
    },

    pricing: {
      eyebrow: "Precios",
      title: "Empieza gratis. Escala cuando lo necesites.",
      intro: "Precios orientativos (USD) durante el acceso anticipado.",
      recommended: "Recomendado",
      tiers: [
        {
          name: "Diagnóstico",
          price: "Gratis",
          note: "Una muestra para empezar hoy",
          features: [
            "Hasta 3 sistemas de IA en el inventario",
            "Clasificación de riesgo (EU AI Act + EE. UU.)",
            "1 usuario",
          ],
          limits: "Sin evidencia en PDF, sin vigilancia ni plan de acción.",
          cta: "Empieza gratis",
        },
        {
          name: "Preparación",
          price: "$120",
          unit: "/mes",
          note: "El sistema de registro de tu gobernanza",
          lead: "Todo lo del plan gratis, y además desbloqueas:",
          features: [
            "Hasta 25 sistemas de IA y 5 usuarios",
            "Gap assessment + plan de acción",
            "Vigilancia regulatoria continua",
            "Dossier e informe ejecutivo (PDF)",
            "Evidencia y audit-trail verificable",
            "Policy packs ({packs} packs · UE y EE. UU.)",
            "Equipo y roles",
          ],
          cta: "Suscribirse",
        },
        {
          name: "Enterprise",
          price: "A medida",
          note: "Para varias entidades y necesidades avanzadas",
          lead: "Todo lo de Preparación, y además:",
          features: [
            "Sistemas y usuarios a medida",
            "Multi-organización",
            "SSO y controles avanzados",
            "Soporte prioritario",
          ],
          cta: "Solicitar acceso",
        },
      ],
      compare: {
        title: "Compara los planes",
        capability: "Capacidad",
        team: "Equipo",
        custom: "A medida",
        includedLabel: "Incluido",
        notIncludedLabel: "No incluido",
        rows: [
          "Inventario de sistemas de IA",
          "Clasificación de riesgo (EU AI Act + EE. UU.)",
          "Sistemas de IA incluidos",
          "Usuarios",
          "Gap assessment + plan de acción",
          "Vigilancia regulatoria continua",
          "Dossier e informe ejecutivo (PDF)",
          "Evidencia y audit-trail verificable",
          "Policy packs ({packs} packs · UE y EE. UU.)",
          "Multi-organización",
          "SSO y controles avanzados",
          "Soporte prioritario",
        ],
      },
    },

    faq: {
      eyebrow: "Preguntas frecuentes",
      title: "Lo que sueles querer saber.",
      items: [
        {
          q: "¿Attesta certifica mi cumplimiento del EU AI Act?",
          a: "No. Attesta es una herramienta de autoevaluación y preparación para auditoría: organiza tu inventario, tu clasificación de riesgo y tu evidencia. La certificación de conformidad, cuando procede, solo la emiten organismos notificados acreditados. No prestamos asesoría legal.", // attesta-copy-ok: atribuye la certificación a organismos notificados (no a Attesta) — es el descargo, no una promesa.
        },
        {
          q: "¿La IA que filtra o puntúa candidatos es de alto riesgo?",
          a: "Por regla general, sí. La IA usada para selección de personal (cribado de CVs, ranking, entrevistas por vídeo, tests) entra en el Anexo III (empleo) del EU AI Act como alto riesgo. Existe una excepción acotada (Art. 6.3) para tareas muy limitadas, pero casi nunca aplica cuando el sistema perfila o puntúa a personas. Implica obligaciones de supervisión humana, control de sesgo y evidencia — justo lo que Attesta organiza por ti, y el asistente de riesgo evalúa esa excepción por ti.",
        },
        {
          q: "Usamos IA de terceros, no la desarrollamos. ¿Nos sirve?",
          a: "Sí — de hecho ese es nuestro foco. Como responsable del despliegue (deployer) tienes obligaciones propias (uso conforme, supervisión humana, conservación de logs, en ciertos casos una evaluación de impacto). Attesta te ayuda a cumplirlas y a demostrarlo con evidencia.",
        },
        {
          q: "El deadline se aplazó a 2027, ¿para qué empezar ahora?",
          a: "Justo por eso: tienes más ventana para prepararte bien, sin prisas ni consultores caros de última hora. El aplazamiento del alto riesgo del Anexo III a diciembre de 2027 proviene del Digital Omnibus, acordado por el Parlamento y el Consejo en junio de 2026 y pendiente de publicación formal en el DOUE. La obligación sigue siendo inevitable; adelantarte es más barato y menos arriesgado. (Ojo: la alfabetización en IA y las prohibiciones del Art. 5 ya son exigibles desde febrero de 2025.)",
        },
        {
          q: "¿En qué se diferencia de un consultor o de una hoja de cálculo?",
          a: "Un consultor te entrega una foto fija —cara y desactualizada en cuanto la norma cambia—; un Excel no vigila nada ni deja rastro verificable. Attesta es un sistema de registro vivo: mantiene tu inventario y tu evidencia al día, vigila los cambios regulatorios y encadena cada registro con SHA-256 para que sea auditable. No sustituye el criterio jurídico cuando lo necesites, pero sí el trabajo repetitivo de organizarlo y mantenerlo.",
        },
        {
          q: "¿Qué pasa con mi evidencia si me doy de baja?",
          a: "Es tuya. Puedes exportar tu dossier y tu informe ejecutivo en PDF en cualquier momento, así que la evidencia que has preparado no queda atrapada en la herramienta.",
        },
        {
          q: "¿Necesito un equipo de compliance para usarlo?",
          a: "No. Attesta está pensado para el mid-market sin equipo GRC: cuestionarios guiados, recomendaciones priorizadas y evidencia lista para auditoría, en un lenguaje claro.",
        },
        {
          q: "¿Cómo protegen nuestros datos?",
          a: "Cada organización está aislada de las demás (multi-tenant con control de acceso a nivel de fila) y todos los cambios quedan en un registro de auditoría verificable: encadenado con SHA-256, de forma que cualquier alteración posterior es detectable.",
        },
      ],
    },

    waitlist: {
      title: "Ve por delante de la auditoría.",
      intro:
        "Estamos incorporando a un grupo reducido de empresas mid-market. Solicita acceso anticipado y recibe un gap assessment inicial.",
      successTitle: "¡Gracias!",
      successBodyBefore: "Te avisaremos en ",
      successBodyAfter: " cuando abramos tu acceso.",
      emailLabel: "Correo de trabajo",
      honeypotLabel: "No rellenar",
      placeholder: "tu@empresa.com",
      submit: "Solicitar acceso",
      submitting: "Enviando…",
      invalidEmail: "Introduce un correo válido (p. ej. tu@empresa.com).",
      genericError: "No pudimos registrarte. Inténtalo de nuevo.",
      genericErrorRetry: "No pudimos registrarte. Inténtalo de nuevo en un momento.",
      trustMarkers: [
        "Región UE · datos en la Unión Europea",
        "Contenido del EU AI Act contrastado con criterio experto",
        "No certificamos: preparación honesta",
      ],
      disclaimer:
        "Sin compromiso. Attesta ofrece orientación de compliance, no asesoría legal.",
    },

    demo: {
      eyebrow: "Venta asistida",
      title: "Habla con nosotros antes de comprar",
      intro:
        "Si gestionas IA en varias áreas o te toca responder a una due-diligence, media hora ahorra semanas. Te enseñamos el producto con tu caso, no con datos de ejemplo.",
      bullets: [
        "Recorrido por tu caso: qué sistemas tendrías que inventariar y qué te pediría un auditor.",
        "Respuesta clara sobre qué cubre Attesta y qué no.",
        "Sin presentación comercial de 40 diapositivas.",
      ],
      emailLabel: "Correo de trabajo",
      nameLabel: "Nombre",
      companyLabel: "Organización",
      roleLabel: "Tu papel",
      rolePlaceholder: "p. ej. Responsable de RRHH, DPO, IT",
      sizeLabel: "Tamaño de la organización",
      sizePlaceholder: "Selecciona",
      contextLabel: "¿Qué te trae? (opcional)",
      contextPlaceholder:
        "p. ej. usamos una herramienta de cribado de currículums y nos han pedido evidencia.",
      optional: "opcional",
      cta: "Solicitar una demo",
      sending: "Enviando…",
      successTitle: "Recibido.",
      successBody:
        "Te escribimos al correo que nos has dejado. Si tienes prisa, responde a ese mensaje y lo adelantamos.",
      invalidEmail: "Introduce un correo válido.",
      rateError:
        "Has enviado varias solicitudes seguidas. Espera unos minutos e inténtalo otra vez.",
      genericError: "No se pudo enviar. Inténtalo de nuevo en un momento.",
      privacy:
        "Usamos estos datos solo para responderte. No los cedemos a nadie.",
      privacyLink: "Aviso de privacidad",
    },
    footer: {
      tagline:
        "Gobernanza continua de IA para el mid-market: inventario, riesgo, evidencia y vigilancia regulatoria, listos para auditoría.",
      contactHeading: "Contacto",
      legalHeading: "Legal y privacidad",
      rights: "© 2026 Attesta. Todos los derechos reservados.",
    },
  },

  /**
   * Chrome de las páginas legales. El TEXTO LEGAL no está aquí (vive en
   * `src/lib/legal/`, ver la frontera legal de `i18n/config.ts`): esto es solo el
   * envoltorio de la interfaz —encabezados, índice, botones— que sí es chrome.
   */
  legal: {
    eyebrow: "Documentación legal",
    updated: "Última actualización",
    contents: "En esta página",
    backToSite: "Volver a Attesta",
    otherDocs: "Otros documentos",
    contact: "Contacto para asuntos de privacidad",
    draftTitle: "Borrador: falta identificar al responsable del tratamiento",
    draftBody:
      "Este documento todavía no menciona la sociedad, el domicilio y la identificación fiscal del responsable, que exige el artículo 13 del RGPD. Mientras falten, la página no se indexa y no debe considerarse la versión definitiva.",
    draftMissing: "Datos pendientes",
    lawyerNote:
      "Texto preparado a partir del funcionamiento real del producto. Pendiente de revisión por abogado antes de su publicación definitiva.",
    controllerHeading: "Responsable del tratamiento",
    controllerName: "Denominación",
    controllerAddress: "Domicilio",
    controllerTaxId: "Identificación fiscal",
    controllerEmail: "Correo de privacidad",
    controllerEuRep: "Representante en la UE (art. 27 RGPD)",
    subprocessors: {
      customerHeading: "Tratan datos de organizaciones clientes",
      customerIntro:
        "Subencargados en el sentido del artículo 28 del RGPD. Cualquier alta nueva se comunica con 30 días de antelación.",
      corpusHeading: "Solo tratan el corpus normativo público",
      corpusIntro:
        "Intervienen en el radar de vigilancia regulatoria. No reciben ningún dato de ninguna organización cliente.",
      colProvider: "Proveedor",
      colPurpose: "Para qué",
      colData: "Qué recibe",
      colLocation: "Dónde",
      statusActive: "En uso",
      statusGated: "Sin activar",
      statusGatedHint:
        "Configurado por variable de entorno: mientras no se active, no recibe ningún dato.",
      privacyLink: "Privacidad del proveedor",
    },
    optOut: {
      heading: "Medición de audiencia",
      on: "Ahora mismo la medición está activa en este navegador.",
      off: "Has rechazado la medición en este navegador. No se emite ningún evento.",
      browser:
        "Tu navegador envía una señal de no rastreo (GPC o DNT) y se está respetando: no se emite ningún evento, no hace falta que hagas nada.",
      disable: "Rechazar la medición",
      enable: "Volver a permitirla",
    },
  },

  auth: {
    shell: {
      heading: "Gobierna tu IA antes que la auditoría.",
      points: [
        "Inventario y clasificación de riesgo (EU AI Act)",
        "Evidencia y audit-trail listos para auditoría",
        "Preparación de nivel enterprise, sin equipo GRC",
      ],
      backToSite: "← Volver al sitio",
      switchToEn: "Ver en inglés",
      switchToEs: "Ver en español",
    },

    demo: {
      title: "Modo demo",
      body: "El acceso con cuentas requiere conectar Supabase. Mientras tanto, puedes explorar el producto con datos de ejemplo.",
      cta: "Explorar la demo",
    },

    resetDemo: {
      title: "Modo demo",
      body: "La recuperación de contraseña requiere conectar Supabase.",
      cta: "Volver a iniciar sesión",
    },

    meta: {
      resetTitle: "Recuperar contraseña · Attesta",
      resetUpdateTitle: "Nueva contraseña · Attesta",
    },

    pageErrors: {
      authLink: "El enlace no es válido o caducó. Inicia sesión o solicita uno nuevo.",
      sso: "No se completó el acceso con el proveedor. Inténtalo de nuevo o usa tu correo.",
    },

    friendlyErrors: {
      invalidCredentials: "Correo o contraseña incorrectos.",
      emailNotConfirmed: "Confirma tu correo antes de iniciar sesión.",
      alreadyRegistered: "Ya existe una cuenta con este correo. Inicia sesión.",
      passwordShould: "La contraseña debe tener al menos 6 caracteres.",
      invalidEmailFormat: "El correo no tiene un formato válido.",
      signupsDisabled: "El registro por correo está deshabilitado. Contacta al administrador.",
      rateLimit: "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
      duplicateOrg: "Ese nombre de organización ya está en uso. Prueba con otro.",
      invalidToken: "El código es incorrecto o expiró. Revisa el correo o reenvíalo.",
      network: "No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.",
      generic: "Algo salió mal. Inténtalo de nuevo.",
    },

    login: {
      loginTitle: "Inicia sesión",
      signupTitle: "Crea tu cuenta",
      loginSubtitle: "Accede a tu panel de gobernanza de IA.",
      signupSubtitle: "Empieza a inventariar y clasificar tu IA.",

      nombreLabel: "Nombre",
      nombrePlaceholder: "Tu nombre",
      apellido1Label: "Primer apellido",
      apellido1Placeholder: "Apellido",
      apellido2Label: "Segundo apellido",
      apellido2Optional: "(opcional)",
      apellido2Placeholder: "Apellido",
      emailLabel: "Correo de trabajo",
      emailPlaceholder: "tu@empresa.com",
      passwordLabel: "Contraseña",
      forgotPassword: "¿Olvidaste tu contraseña?",
      confirmLabel: "Confirmar contraseña",
      passwordHint: "Mínimo 6 caracteres.",

      show: "Mostrar",
      hide: "Ocultar",
      showPassword: "Mostrar contraseña",
      hidePassword: "Ocultar contraseña",

      submitLoading: "Un momento…",
      loginCta: "Entrar",
      signupCta: "Crear cuenta",

      noAccount: "¿No tienes cuenta?",
      haveAccount: "¿Ya tienes cuenta?",
      switchToSignup: "Regístrate",
      switchToLogin: "Inicia sesión",

      // Validación local (por campo)
      nombreRequired: "Introduce tu nombre.",
      apellido1Required: "Introduce tu primer apellido.",
      emailRequired: "Introduce tu correo de trabajo.",
      emailInvalid: "Introduce un correo válido (p. ej. tu@empresa.com).",
      passwordRequired: "Introduce tu contraseña.",
      passwordMin: "La contraseña debe tener al menos 6 caracteres.",
      confirmRequired: "Repite la contraseña.",
      confirmMismatch: "Las contraseñas no coinciden.",

      // Verificación por código (tras registrarse)
      verifyTitle: "Verifica tu correo",
      verifyDescBefore: "Te enviamos un código de verificación a ",
      verifyDescAfter: ". Introdúcelo para activar tu cuenta.",
      codeLabel: "Código de verificación",
      codeRequired: "Introduce el código que te enviamos por correo.",
      codeVerifyFailed: "No pudimos verificar el código. Inténtalo de nuevo.",
      verifying: "Verificando…",
      verifyCta: "Verificar y continuar",
      resend: "Reenviar código",
      resending: "Reenviando…",
      resentNotice: "Te reenviamos el código. Revisa tu correo (y la carpeta de spam).",
      changeEmail: "← Cambiar correo",
      linkHint: "¿Recibiste un enlace en lugar de un código? Ábrelo desde el correo para confirmar tu cuenta.",
    },

    sso: {
      connecting: "Conectando…",
      continueGoogle: "Continuar con Google",
      continueMicrosoft: "Continuar con Microsoft",
      error: "No pudimos conectar con ese proveedor. Inténtalo de nuevo.",
      divider: "o con tu correo",
    },

    onboarding: {
      title: "Crea tu organización",
      subtitle: "Es tu espacio de trabajo en Attesta. Podrás invitar a tu equipo después.",
      nameLabel: "Nombre de la organización",
      namePlaceholder: "Acme, S.A.",
      creating: "Creando…",
      cta: "Crear y continuar",
    },

    resetRequest: {
      title: "Recupera tu contraseña",
      subtitle: "Introduce tu correo y te enviaremos un enlace para crear una nueva.",
      honeypotLabel: "No rellenar",
      emailLabel: "Correo de trabajo",
      emailPlaceholder: "tu@empresa.com",
      sending: "Enviando…",
      submit: "Enviar enlace",
      backToLoginLink: "← Volver a iniciar sesión",

      emailInvalid: "Introduce un correo válido (p. ej. tu@empresa.com).",
      rateLimit: "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
      redirectConfig: "No pudimos enviar el enlace (configuración de URLs de redirección pendiente). Contacta al administrador.",
      generic: "No pudimos enviar el correo. Inténtalo de nuevo en un momento.",

      sentTitle: "Revisa tu correo",
      sentBodyBefore: "Si existe una cuenta asociada a ",
      sentBodyAfter: ", te hemos enviado un enlace para restablecer tu contraseña. Caduca en una hora.",
      spamHint: "¿No lo ves? Revisa la carpeta de spam.",
      backToLogin: "Volver a iniciar sesión",
    },

    resetUpdate: {
      checking: "Comprobando el enlace…",

      invalidTitle: "Enlace no válido",
      invalidBody: "Este enlace de recuperación caducó o ya se usó. Solicita uno nuevo para continuar.",
      requestAnother: "Solicitar otro enlace",

      doneTitle: "Contraseña actualizada",
      doneBody: "Listo. Te estamos llevando a tu panel…",

      title: "Crea una nueva contraseña",
      subtitle: "Elige una contraseña segura para tu cuenta.",
      newPasswordLabel: "Nueva contraseña",
      passwordHint: "Mínimo 6 caracteres.",
      confirmLabel: "Repite la contraseña",
      saving: "Guardando…",
      submit: "Guardar contraseña",
      show: "Mostrar",
      hide: "Ocultar",
      showPassword: "Mostrar contraseña",
      hidePassword: "Ocultar contraseña",

      passwordMin: "La contraseña debe tener al menos 6 caracteres.",
      mismatch: "Las contraseñas no coinciden.",
      shouldDiffer: "La nueva contraseña debe ser distinta a la anterior.",
      expired: "El enlace caducó. Solicita uno nuevo.",
      generic: "No pudimos actualizar la contraseña. Inténtalo de nuevo.",
    },
  },

  dashboard: {
    skipToContent: "Saltar al contenido",

    // Aviso de contenido guardado en otro idioma (migración 0033). Ver
    // `src/lib/i18n/stored-locale.ts`: solo aparece cuando el idioma CONSTA y
    // difiere del de la interfaz. Explica por qué se ve mezclado, en vez de
    // dejar que parezca un fallo.
    storedLocale: {
      es: "español",
      en: "inglés",
      noticeOne:
        "Parte de este contenido se guardó en {lang} y se muestra tal cual: es el texto que quedó registrado en su día y traducirlo ahora cambiaría la evidencia.",
      noticeMany:
        "Parte de este contenido se guardó en otros idiomas ({langs}) y se muestra tal cual: es el texto que quedó registrado en su día y traducirlo ahora cambiaría la evidencia.",
    },

    nav: {
      overview: "Resumen",
      inventory: "Inventario",
      risk: "Riesgo",
      gap: "Gap assessment",
      vault: "Vault de evidencia",
      plan: "Plan de acción",
      incidents: "Incidentes",
      suppliers: "Proveedores",
      packs: "Policy packs",
      monitoring: "Vigilancia",
      team: "Equipo",
      activity: "Actividad",
      organizations: "Organizaciones",
      security: "Seguridad",
      telemetry: "Telemetría",
      lockedTitle: "Función del plan Preparación",
      lockedTitleEnterprise: "Función del plan Enterprise",
    },

    // Cajón de navegación móvil. Bloque hermano de `nav` y no dentro de él: de
    // `nav` sale el tipo de las claves de destino, y meter aquí etiquetas de
    // chrome lo ensancharía (ya arrastra `lockedTitle*`).
    navDrawer: {
      title: "Navegación",
      openMenu: "Abrir navegación",
      closeMenu: "Cerrar navegación",
      planLabel: "Tu plan",
      lockedCountOne: "1 sección requiere un plan superior",
      lockedCountMany: "{n} secciones requieren un plan superior",
      seePlans: "Ver planes",
    },

    sidebar: {
      demoTitle: "Vista de demostración",
      demoBody:
        "Explora Attesta con datos de ejemplo. Crea tu cuenta para usar los tuyos.",
      backToSite: "← Volver al sitio",
    },

    help: {
      title: "Ayuda",
      subtitle: "Las preguntas que más se repiten, y lo que Attesta no hace.",
      contactTitle: "¿No está aquí?",
      contactBody:
        "Escríbenos y te respondemos. Cuéntanos qué intentabas hacer y en qué pantalla te quedaste: con eso solemos resolverlo en el primer mensaje.",
      contactCta: "Escribir a soporte",
      goTo: "Ir a la sección",
      legalTitle: "Documentación legal",
      legalBody:
        "Aviso de privacidad, cookies, subprocesadores y el Acuerdo de Tratamiento de Datos.",
    },
    vault: {
      title: "Vault de evidencia",
      keygen: {
        title: "Generar la clave de firma",
        body:
          "Attesta necesita un par de claves para firmar los paquetes de auditoría. Este botón lo genera aquí mismo; luego solo tienes que pegar los dos valores en las variables de entorno de tu despliegue.",
        privacyNote:
          "La clave privada se genera en este navegador y no se envía a ningún sitio: ni a Attesta ni a nadie. Solo saldrá de aquí cuando tú la pegues en tu panel de despliegue.",
        cta: "Generar par de claves",
        warning:
          "Cópialas AHORA. Al recargar esta página desaparecen y habría que generar otras. Guarda la privada también en tu gestor de contraseñas: si la pierdes, los paquetes ya entregados no se podrán verificar.",
        keyIdLabel: "Huella de la clave (keyId)",
        privateLabel: "Privada · es un secreto, solo servidor",
        publicLabel: "Pública · no es secreta, sirve para verificar",
        copy: "Copiar",
        copied: "Copiado",
        steps: [
          "Pega cada valor en su variable, en Vercel → Settings → Environment Variables, marcadas para Production.",
          "Copia solo el valor: no incluyas el nombre de la variable ni el signo igual.",
          "Vuelve a desplegar (Deployments → el último → Redeploy). Las variables solo entran con un despliegue nuevo.",
          "Comprueba que /api/vault/key devuelve la misma huella que aparece arriba.",
        ],
        unsupported:
          "Este navegador no admite el tipo de clave que usamos (Ed25519). Prueba con Chrome o Edge actualizados.",
      },
      subtitle:
        "Los documentos reales detrás de cada control, y el paquete que se le entrega a un auditor.",
      why: "Un control marcado como hecho sin documento detrás es una declaración. Con el archivo dentro, es evidencia que alguien puede comprobar.",
      empty: "Todavía no has subido ningún documento.",
      emptyHint:
        "Empieza por lo que te pediría primero un auditor: la política de uso de IA, el registro de supervisión humana y la evidencia que te dio tu proveedor.",
      uploadTitle: "Subir un documento",
      fileLabel: "Archivo",
      fileHint: "Hasta 25 MB por archivo.",
      anchorLabel: "¿A qué corresponde?",
      anchorHint: "Elige la brecha o el sistema al que pertenece este documento.",
      anchorPlaceholder: "Selecciona",
      groupGaps: "Brechas",
      groupSystems: "Sistemas",
      uploadCta: "Subir documento",
      uploading: "Subiendo…",
      listTitle: "Documentos guardados",
      colFile: "Archivo",
      colAttached: "Corresponde a",
      colHash: "Huella SHA-256",
      colUploaded: "Subido",
      delete: "Eliminar",
      packageTitle: "Paquete de auditoría",
      packageBody:
        "Un ZIP con los documentos, un manifiesto que lista la huella SHA-256 de cada uno y las instrucciones para comprobarlo. Quien lo reciba puede verificarlo por su cuenta, sin cuenta en Attesta.",
      packageCta: "Descargar paquete",
      packageEmpty: "Sube al menos un documento para poder generar el paquete.",
      signedTitle: "Firmado por Attesta",
      signedBody:
        "El manifiesto va firmado, así que quien lo reciba puede comprobar que lo emitió Attesta y que nadie lo ha modificado después.",
      unsignedTitle: "Sin firma configurada",
      unsignedBody:
        "El paquete se genera igual y los hashes se pueden comprobar, pero no lleva firma: nadie podrá verificar que lo emitió Attesta. Configura la clave de firma antes de entregarlo a un tercero.",
      attests: "Qué afirma este paquete",
      attestsBody:
        "Que estos archivos, con estas huellas, estaban guardados en tu cuenta en la fecha indicada.",
      notAttests: "Qué NO afirma",
      notAttestsBody:
        "No es una certificación ni una auditoría. Attesta no abre los archivos ni valora si la evidencia es suficiente: eso lo juzga quien te audite.",
    },
    account: {
      organization: "Organización",
      billing: "Plan y facturación",
      goToSite: "Ir al sitio público",
      switchAccount: "Cambiar de cuenta",
      signOut: "Cerrar sesión",
    },

    toastClose: "Cerrar notificación",

    // Cupos del plan (metering). `{used}`/`{max}` los sustituye el componente.
    quota: {
      systems: "{used} de {max} sistemas de tu plan",
      seats: "{used} de {max} asientos de tu plan",
      nearSystems:
        "Te quedan pocos huecos. Lo que ya tienes se conserva siempre; el tope solo afecta a añadir nuevos.",
      nearSeats:
        "Te quedan pocos asientos. Cuentan los miembros y las invitaciones aún sin aceptar.",
      atSystems:
        "Has llegado al tope de tu plan: no se pueden añadir más sistemas. Nada de lo registrado se oculta ni se borra.",
      atSeats:
        "Has llegado al tope de asientos de tu plan: no se pueden enviar más invitaciones.",
      upgrade: "Ver planes",
    },

    toasts: {
      // Genéricos: los usan varias acciones (organizaciones, vault). Sin ellos, un
      // `?toast=demo` / `?toast=error` no encontraba mensaje y el toast NO aparecía
      // —acción sin feedback—, porque el Toaster ignora en silencio una clave que
      // no está en el mapa. El guard `toasts.guard.test.ts` vela por que no vuelva.
      demo: "Es una demostración: esta acción no se guarda.",
      error: "Ocurrió un error inesperado. Inténtalo de nuevo.",
      "system-created": "Sistema registrado en el inventario.",
      "vault-uploaded": "Documento guardado en el vault.",
      "vault-deleted": "Documento eliminado.",
      "vault-empty": "Elige un archivo y a qué corresponde.",
      "vault-large": "El archivo supera los 25 MB.",
      "vault-forbidden": "Solo un propietario o administrador puede eliminar evidencia.",
      "vault-error": "No se pudo guardar el documento. Inténtalo de nuevo.",
      "deletion-requested":
        "Baja solicitada. Puedes cancelarla durante los próximos 7 días.",
      "deletion-cancelled": "Baja cancelada. Tu organización sigue activa.",
      "deletion-confirm":
        "El nombre no coincide. Escríbelo tal cual aparece para confirmar la baja.",
      "system-updated": "Sistema actualizado.",
      "system-deleted": "Sistema eliminado.",
      "system-error": "No se pudo guardar el sistema. Inténtalo de nuevo.",
      seeded: "Datos de ejemplo cargados.",
      "seed-error": "No se pudieron cargar los datos de ejemplo. Inténtalo de nuevo.",
      "intake-created": "Enlace de intake creado. Cópialo y compártelo con el área.",
      "intake-revoked": "Enlace revocado: deja de aceptar envíos.",
      "intake-accepted": "Ficha añadida al inventario.",
      "intake-discarded": "Ficha descartada.",
      "intake-already": "Esa ficha ya la había resuelto otra persona.",
      "intake-demo": "El intake compartible requiere conectar tu organización.",
      "intake-error": "No se pudo completar la acción. Inténtalo de nuevo.",
      // Cupos del plan. El mensaje dice el LÍMITE y la SALIDA, no solo que no
      // se puede: un tope sin siguiente paso es una puerta cerrada sin timbre.
      "quota-systems":
        "Has alcanzado el número de sistemas de tu plan. Mejora de plan para seguir añadiendo; lo que ya tienes se conserva intacto.",
      "quota-seats":
        "Has alcanzado el número de asientos de tu plan (miembros e invitaciones pendientes). Mejora de plan para invitar a más gente.",
      "pack-applied": "Policy pack RRHH aplicado al sistema.",
      "pack-error": "No se pudo aplicar el policy pack. Inténtalo de nuevo.",
      "gap-created": "Brecha añadida.",
      "gap-deleted": "Brecha eliminada.",
      "gap-updated": "Estado de la brecha actualizado.",
      "gap-error": "No se pudo completar la acción. Inténtalo de nuevo.",
      "bias-saved": "Evidencia de auditoría de sesgo guardada.",
      "bias-error": "No se pudo guardar la auditoría de sesgo. Inténtalo de nuevo.",
      "member-added": "Miembro añadido al equipo.",
      "member-invited": "Invitación enviada.",
      "member-exists": "Esa persona ya es miembro del equipo.",
      "role-updated": "Rol actualizado.",
      "member-removed": "Miembro eliminado del equipo.",
      "invite-revoked": "Invitación revocada.",
      "team-forbidden": "No tienes permisos para esta acción.",
      "team-lastowner": "Debe quedar al menos un propietario.",
      "team-bademail": "Introduce un correo válido.",
      "team-demo": "La gestión del equipo requiere conectar tu organización.",
      "team-error": "No se pudo completar la acción. Inténtalo de nuevo.",
      "cand-approved": "Candidato publicado en el radar regulatorio.",
      "cand-saved": "Borrador del candidato guardado.",
      "cand-rejected": "Candidato descartado.",
      "cand-demo": "La validación de candidatos requiere conectar tu organización.",
      "cand-error": "No se pudo completar la acción. Revisa e inténtalo de nuevo.",
      "jur-saved": "Jurisdicciones actualizadas.",
      "jur-demo": "Configurar jurisdicciones requiere conectar tu organización.",
      "jur-error": "No se pudieron guardar las jurisdicciones.",
      "task-created": "Tarea añadida al plan.",
      "task-deleted": "Tarea eliminada.",
      "task-demo": "Editar el plan requiere conectar tu organización.",
      "task-error": "No se pudo completar la acción. Inténtalo de nuevo.",
      "vigia-ok": "Vigía ejecutado. Revisa la bandeja si detectó cambios.",
      "vigia-demo": "El Vigía requiere conectar tu organización.",
      "vigia-denied": "Solo el equipo de validación de Attesta puede ejecutar el Vigía.",
      "vigia-error": "El Vigía no pudo completar la revisión. Inténtalo de nuevo.",
      "incident-created": "Incidente registrado en el expediente.",
      "incident-updated": "Expediente del incidente actualizado.",
      "incident-demo": "El registro de incidentes requiere conectar tu organización.",
      "incident-error": "No se pudo completar la acción. Inténtalo de nuevo.",
      "cadence-updated": "Cadencia de revisión actualizada.",
      "supplier-created": "Proveedor añadido al registro.",
      "supplier-updated": "Proveedor actualizado.",
      "supplier-deleted": "Proveedor eliminado del registro.",
      "evidence-updated": "Elemento de evidencia actualizado.",
      "supplier-demo": "El registro de proveedores requiere conectar tu organización.",
      "supplier-error": "No se pudo completar la acción. Inténtalo de nuevo.",
    },

    units: {
      dayOne: "día",
      dayOther: "días",
      systemOne: "sistema",
      systemOther: "sistemas",
      minute: "min",
      hour: "h",
      monthOne: "mes",
      monthOther: "meses",
      yearOne: "año",
      yearOther: "años",
    },

    welcome: {
      badge: "Empecemos",
      greetingNamedPrefix: "Te damos la bienvenida, ",
      greetingDefault: "Te damos la bienvenida a Attesta",
      missionWithOrgBefore:
        "Aquí construyes el sistema de registro de la gobernanza de IA de ",
      missionWithOrgAfter:
        ": inventario, clasificación de riesgo y evidencia lista para auditoría.",
      missionDefault:
        "Aquí construyes el sistema de registro de tu gobernanza de IA: inventario, clasificación de riesgo y evidencia lista para auditoría.",
      ctaPrimary: "+ Registrar tu primer sistema",
      ctaSeed: "Explorar con datos de ejemplo",
      seedPending: "Cargando ejemplo…",
      seedHint:
        "Los datos de ejemplo cargan un inventario realista para que veas el dossier, las brechas y la vigilancia antes de introducir los tuyos.",
      step: "Paso",
      journey: [
        {
          title: "Inventaría",
          body: "Registra cada sistema de IA en uso: quién lo opera, qué proveedor y para qué.",
        },
        {
          title: "Clasifica el riesgo",
          body: "El asistente del EU AI Act y marcos de EE. UU. sitúan cada sistema en su nivel.",
        },
        {
          title: "Prepara la evidencia",
          body: "Detecta brechas, sigue un plan y genera dossier e informe listos para auditoría.",
        },
      ],
      nextMilestone: "Próximo hito regulatorio:",
      milestoneDaysPrefix: "· en ",
    },

    onboarding: {
      title: "Primeros pasos en Attesta",
      subtitle: "Completa estos pasos para poner en marcha tu gobernanza de IA.",
      dismiss: "Ocultar",
      paidBadge: "Preparación",
      steps: {
        system: {
          label: "Registra tu primer sistema de IA",
          hint: "Empieza tu inventario de IA",
        },
        risk: {
          label: "Clasifica el riesgo de un sistema",
          hint: "Con el asistente del EU AI Act",
        },
        gap: {
          label: "Detecta tus brechas",
          hint: "Aplica un policy pack a un sistema",
        },
        team: {
          label: "Invita a tu equipo",
          hint: "Gobernar es cosa de varios",
        },
      },
    },

    guide: {
      brand: "Guía rápida",
      skip: "Omitir",
      back: "Atrás",
      next: "Siguiente",
      start: "Empezar",
      step: "Paso",
      of: "de",
      frames: {
        overview: "Resumen de gobernanza",
        inventory: "Inventario · 3 sistemas",
        risk: "Distribución de riesgo",
        gap: "Preparación para auditoría",
        plan: "Plan de acción",
        radar: "Radar regulatorio",
        team: "Equipo",
      },
      steps: [
        {
          title: "Bienvenido a Attesta",
          body: "Tu sistema de registro para gobernar la IA con evidencia. Te mostramos en 30 segundos para qué sirve cada apartado —con un vistazo a cada pantalla.",
        },
        {
          title: "Inventario",
          body: "Registra cada sistema de IA que tu organización usa. Es el punto de partida: todo lo demás se calcula a partir de lo que declaras aquí.",
        },
        {
          title: "Riesgo",
          body: "Clasifica cada sistema según el EU AI Act y marcos de EE. UU. Attesta te orienta sobre su nivel de riesgo y qué obligaciones aplican a tu rol de deployer.",
        },
        {
          title: "Gap assessment",
          body: "Mide qué tan preparado estás frente a cada obligación y obtén tu «% listo». Las brechas identificadas se convierten en tareas concretas para cerrar.",
        },
        {
          title: "Plan de acción y Policy packs",
          body: "El plan reúne las tareas para cerrar brechas con responsables y fechas. Los policy packs te dan plantillas listas (empezando por RRHH).",
        },
        {
          title: "Vigilancia",
          body: "Un radar que vigila las fuentes regulatorias oficiales y te avisa cuando algo cambia. Los cambios los valida un humano antes de publicarse: nunca texto inventado.",
        },
        {
          title: "Equipo y Actividad",
          body: "Invita a tu equipo con roles y consulta el registro de actividad: un audit-trail inmutable de todo lo que ocurre. Listo, ya puedes empezar.",
        },
      ],
      viz: {
        statSystems: "Sistemas",
        statHighRisk: "Alto riesgo",
        statReady: "% listo",
        inventoryRows: [
          { name: "Cribado de CVs", tag: "Alto riesgo" },
          { name: "Scoring de candidatos", tag: "Alto riesgo" },
          { name: "Chatbot de entrevistas", tag: "Riesgo limitado" },
        ],
        riskBars: ["Alto", "Limitado", "Mínimo"],
        readyLabel: "% listo",
        checks: [
          "Supervisión humana (Art. 14)",
          "Transparencia a candidatos (Art. 50)",
        ],
        tasks: [
          { t: "Documentar supervisión humana", who: "Ana · 12 jul" },
          { t: "Publicar aviso de transparencia", who: "Luis · 20 jul" },
        ],
        radarMilestone: "Próximo hito · Transparencia (Art. 50)",
        radarCountdown: "en 16 días",
        radarSources: "8 fuentes oficiales vigiladas · sin cambios",
        teamMembers: "3 miembros · roles por correo",
        activityLabel: "Actividad ·",
        activityText: "Ana clasificó «Cribado de CVs» como alto riesgo",
      },
    },

    paywall: {
      featureBefore: "Función del plan ",
      featureAfter: "",
      tierName: {
        preparacion: "Preparación",
        enterprise: "Enterprise",
      },
      descDefault:
        "Desbloquea esta sección con el plan Preparación: la preparación completa para auditoría de tu organización.",
      descEnterprise:
        "Esta función forma parte del plan Enterprise (varias entidades, SSO y soporte prioritario).",
      ctaEnterprise: "Ver planes y contacto",
      ctaPlansBefore: "Ver planes · ",
      perMonth: "/mes",
      back: "Volver al resumen",
      footer:
        "Inventario y clasificación de riesgo siguen disponibles en el plan gratuito.",
      // Teaser del muro: cifras reales de la organización, para que el plan
      // gratuito vea QUÉ se está perdiendo (sin revelar el detalle).
      teaserIntro: "Con tus datos actuales ya hemos identificado",
      teaserNote:
        "Cifras calculadas con lo que tu organización ya ha declarado. Desbloquea para ver el detalle, el responsable y la fecha de cada brecha.",
      gapTeaser: {
        openGaps: "brechas abiertas",
        highSeverity: "de severidad alta",
        systems: "sistemas afectados",
      },
    },

    organizations: {
      title: "Organizaciones",
      subtitle:
        "Gestiona todas las entidades de tu grupo desde una sola cuenta.",
      gateFeature: "Multi-organización",
      gateDescription:
        "Administra varias entidades bajo una misma cuenta desde el plan Enterprise: cámbiate entre ellas y crea nuevas organizaciones. Cada organización conserva su propio plan, sus datos y su audit-trail por separado.",
      listTitle: "Tus organizaciones",
      listSubtitle:
        "El plan se aplica por organización. Al cambiarte, verás el plan y las funciones de la organización activa.",
      activeBadge: "Activa",
      planLabel: "Plan",
      roleLabel: "Tu rol",
      switchCta: "Cambiar a esta",
      switchingCta: "Cambiando…",
      createTitle: "Crear una organización",
      createSubtitle:
        "La nueva entidad empieza en el plan gratuito, con sus datos separados. Serás su propietario.",
      nameLabel: "Nombre de la organización",
      namePlaceholder: "p. ej. Filial Norte, S. L.",
      createCta: "Crear organización",
      creatingCta: "Creando…",
      createdToast: "Organización creada.",
      emptyDemo:
        "En la vista de demostración no hay varias organizaciones. Crea tu cuenta para gestionar tus entidades reales.",
      roles: { owner: "Propietario", admin: "Administrador", member: "Miembro" },
      /** Baja de la organización (derecho de supresión + cierre de cuenta). */
      deletion: {
        title: "Dar de baja esta organización",
        intro:
          "Se eliminarán el inventario, las evaluaciones, la evidencia declarada, el plan de acción, los proveedores, los incidentes y el registro de auditoría. No hay forma de recuperarlo después.",
        exportFirst:
          "Antes de continuar, descarga tu expediente completo. Es el mismo paquete que puedes pedir en cualquier momento por portabilidad.",
        exportCta: "Descargar mi expediente (JSON)",
        graceNotice:
          "La baja no es inmediata: dispones de {days} días para cancelarla. Pasado ese plazo, la eliminación es definitiva.",
        ownerOnly:
          "Solo el propietario de la organización puede darla de baja.",
        confirmLabel: "Escribe el nombre de la organización para confirmar",
        confirmHint: "Debe coincidir con «{name}».",
        requestCta: "Solicitar la baja",
        requestingCta: "Solicitando…",
        pendingTitle: "Baja solicitada",
        pendingBody:
          "Esta organización y todos sus datos se eliminarán en {days} día(s), el {date}. Puedes cancelarlo hasta entonces.",
        pendingBodyToday:
          "Esta organización y todos sus datos se eliminarán hoy ({date}). Cancélalo ahora si fue un error.",
        cancelCta: "Cancelar la baja",
        cancellingCta: "Cancelando…",
      },
    },

    security: {
      title: "Seguridad",
      subtitle: "SSO y controles avanzados para tu organización.",
      gateFeature: "SSO y controles avanzados",
      gateDescription:
        "El inicio de sesión único (SSO) y los controles de acceso avanzados forman parte del plan Enterprise. Actívalos coordinándote con el equipo de Attesta.",
      ssoTitle: "Inicio de sesión único (SSO)",
      ssoBody:
        "Conecta tu proveedor de identidad (SAML 2.0 u OIDC) para que tu equipo entre con las credenciales corporativas. La activación se coordina con nuestro equipo.",
      ssoStatusLabel: "Estado",
      ssoStatusNotConfigured: "No configurado",
      ssoIncludesTitle: "Incluye",
      ssoIncludes: [
        "SAML 2.0 y OpenID Connect",
        "Dominios de correo permitidos",
        "Aprovisionamiento y baja de usuarios",
      ],
      requestCta: "Solicitar activación de SSO",
      controlsTitle: "Controles avanzados",
      controlsBody:
        "Política de sesión, restricción por dominio de correo y registro de acceso ampliado. Disponibles con SSO en el plan Enterprise.",
    },

    deadlines: {
      title: "Vencimientos del plan",
      overdueOne: "vencida",
      overdueOther: "vencidas",
      viewPlan: "Ver el plan →",
      morePrefix: "y ",
      moreTaskOne: "tarea más",
      moreTaskOther: "tareas más",
      moreSuffix: " con fecha próxima.",
    },

    risk: {
      systems: "sistemas",
      labels: {
        unacceptable: "Inaceptable",
        high: "Alto riesgo",
        limited: "Riesgo limitado",
        minimal: "Riesgo mínimo",
      },
    },

    bias: {
      labels: {
        no_aplica: "No es AEDT",
        sin_auditoria: "Sin auditoría",
        vencida: "Auditoría vencida",
        por_vencer: "Próxima a vencer",
        vigente: "Auditoría vigente",
      },
      overduePrefix: "venció hace ",
      overdueSuffix: "",
      today: "vence hoy",
      upcomingPrefix: "vence en ",
      dayOne: "día",
      dayOther: "días",
    },

    confirm: {
      confirmDefault: "Eliminar",
      cancel: "Cancelar",
      close: "Cerrar",
    },

    buttons: {
      downloadPdf: "Descargar / Imprimir PDF",
      vigiaRun: "Ejecutar Vigía ahora",
      vigiaRunning: "Revisando fuentes…",
      deleteSystemTitleBefore: 'Eliminar "',
      deleteSystemTitleAfter: '"',
      deleteSystemMessage:
        "Se borrarán también sus evaluaciones y brechas. Esta acción no se puede deshacer.",
      deleteSystemLabel: "Eliminar sistema",
      deleteGapTitle: "Eliminar brecha",
      deleteGapMessage:
        "Se quitará este control del gap assessment. Esta acción no se puede deshacer.",
      deleteGapLabel: "Eliminar",
      removeMemberTitle: "Quitar del equipo",
      removeMemberMessageSuffix:
        " dejará de tener acceso a esta organización. Podrás volver a invitarle más tarde.",
      removeMemberLabel: "Quitar",
      revokeInviteTitle: "Revocar invitación",
      revokeInviteMessage:
        "La persona invitada ya no podrá unirse con este enlace. Puedes volver a invitarla más tarde.",
      revokeInviteLabel: "Revocar",
    },

    inventory: {
      title: "Inventario de sistemas de IA",
      subtitle:
        "Cada modelo y sistema en uso, con su propietario, proveedor y estado.",
      addSystem: "+ Registrar sistema",
      emptyTitle: "Tu inventario está vacío",
      emptyBody:
        "Registra tu primer sistema de IA, o carga un conjunto de datos de ejemplo para explorar Attesta con contenido.",
      loadSample: "Cargar datos de ejemplo",
      loadSamplePending: "Cargando ejemplo…",
      col: {
        system: "Sistema",
        domain: "Dominio",
        risk: "Riesgo",
        evidence: "Respaldo",
        readiness: "Preparación",
        lastReview: "Última revisión",
        actions: "Acciones",
      },
      classify: "Clasificar",
      dossier: "Dossier",
      filters: {
        searchLabel: "Buscar en el inventario",
        searchPlaceholder: "Nombre, código, responsable, proveedor…",
        searchAction: "Buscar",
        clearSearch: "Borrar",
        riskLabel: "Riesgo",
        evidenceLabel: "Respaldo",
        all: "Todos",
        evidenceNone: "Sin clasificar",
        clear: "Quitar filtros",
        countOne: "1 sistema de {total}",
        countOther: "{n} sistemas de {total}",
        countAllOne: "1 sistema",
        countAllOther: "{n} sistemas",
        sortAria: "Ordenar por {column}",
        noResultsTitle: "Ningún sistema coincide con esa búsqueda",
        noResultsBody:
          "Prueba con menos palabras o quita algún filtro. Tu inventario sigue intacto: solo estás viendo un subconjunto.",
      },
      addTitle: "Añadir sistemas al inventario",
      addSubtitle:
        "Dos caminos: pregunta a cada área con un enlace, o sube la lista que ya tengas en una hoja de cálculo.",
      intake: {
        title: "Enlace de intake compartible",
        subtitle:
          "Manda un enlace a cada área y que ellos declaren qué IA usan. No necesitan cuenta y lo que envían no entra directo al inventario: llega a una bandeja que revisas tú.",
        labelLabel: "¿A quién se lo vas a mandar?",
        labelPlaceholder: "RRHH, Marketing, Soporte…",
        create: "Crear enlace",
        creating: "Creando…",
        empty: "Todavía no has creado ningún enlace.",
        untitled: "Enlace sin etiqueta",
        linkMeta: "{n} de {max} envíos · caduca el {expires}",
        copy: "Copiar enlace",
        copied: "¡Copiado!",
        copyFallback: "Copia este enlace:",
        revoke: "Revocar",
        revoking: "Revocando…",
        stateRevoked: "revocado",
        stateExpired: "caducado",
        inboxTitle: "Fichas recibidas ({n})",
        inboxHint:
          "Cada ficha la envió alguien de tu organización sin cuenta en Attesta. Al aceptarla se crea el sistema en tu inventario y queda registrado a tu nombre en la actividad.",
        accept: "Añadir al inventario",
        accepting: "Añadiendo…",
        discard: "Descartar",
        discarding: "Descartando…",
        from: "Enviado por {who}",
        fromAnonymous: "Envío anónimo",
        noDetails: "Sin más detalles",
      },
      import: {
        title: "Importar inventario desde CSV",
        subtitle:
          "Pega tu hoja de cálculo o sube el CSV. Verás exactamente qué se va a crear antes de guardar nada.",
        demoNotice:
          "Modo demo: la importación necesita una organización conectada. Crea tu cuenta para importar tu inventario real.",
        pasteLabel: "Pega aquí el CSV (o elige un fichero abajo)",
        pastePlaceholder:
          "nombre,responsable,ambito,proveedor,rol\nCribado de CV,RRHH,Contratación,HireFlow,deployer",
        fileLabel: "Elegir fichero CSV",
        templateLink: "Descargar plantilla",
        limitNote:
          "Hasta {max} sistemas por importación. Cabeceras en español o inglés; el separador (coma o punto y coma) se detecta solo.",
        previewTitle: "Vista previa",
        previewCount: "{rows} para crear · {errors} descartadas",
        noHeaderNotice:
          "No se reconoció ninguna cabecera, así que se asume el orden de la plantilla: nombre, responsable, ámbito, proveedor, rol.",
        delimiterNote: "Separador detectado: «{delimiter}».",
        truncatedNote:
          "El tope es {max} sistemas por importación: {n} filas se quedaron fuera. Súbelas en una segunda tanda.",
        colName: "Nombre",
        colOwner: "Responsable",
        colDomain: "Ámbito",
        colVendor: "Proveedor",
        colRole: "Rol",
        roleDeployer: "Responsable del despliegue",
        roleProvider: "Proveedor",
        andMore: "y {n} más",
        errorsTitle: "Filas que NO se importarán",
        errCodes: {
          "missing-name": "sin nombre de sistema",
          "name-too-long": "el nombre es demasiado largo",
          "duplicate-in-file": "repetida en el propio fichero",
          "too-many-columns": "demasiadas columnas (¿separador equivocado?)",
        },
        submit: "Importar {n} sistemas",
        submitting: "Importando…",
        resultOk: "{n} sistemas añadidos a tu inventario.",
        resultSkipped: "{n} ya existían con el mismo nombre y no se duplicaron.",
        resultRejected: "{n} filas descartadas por datos incompletos.",
        resultTruncated: "{n} filas fuera del tope de esta importación.",
        // Distinto de `resultTruncated`: ahí sobraban filas del fichero, aquí
        // sobran para el PLAN. La acción que resuelve cada caso es distinta.
        resultQuota:
          "{n} no entraron porque tu plan llegó a su tope de sistemas. Se importó todo lo que cabía.",
        failures: {
          demo: "La importación necesita una organización conectada.",
          "no-org": "No encontramos tu organización. Vuelve a entrar e inténtalo de nuevo.",
          empty: "No encontramos ninguna fila válida. Revisa que haya al menos una columna con el nombre del sistema.",
          "too-large": "El fichero es demasiado grande. Divídelo en tandas más pequeñas.",
          "write-failed": "No pudimos guardar la importación. Inténtalo de nuevo en un momento.",
        },
      },
      importCta: "Importar CSV",
      backToInventory: "← Volver al inventario",
      cancel: "Cancelar",
      nameLabel: "Nombre del sistema *",
      namePlaceholder: "Filtro de CVs — Talento",
      ownerLabel: "Área responsable",
      ownerPlaceholder: "RRHH",
      domainLabel: "Dominio de uso",
      domainPlaceholder: "Contratación",
      vendorLabel: "Proveedor",
      vendorPlaceholder: "Interno / HireFlow…",
      roleLabel: "Vuestro rol",
      roleDeployer: "Deployer (usamos el sistema)",
      roleProvider: "Provider (lo desarrollamos)",
      newTitle: "Registrar sistema de IA",
      newSubtitle:
        "Añade un sistema al inventario. Podrás clasificar su riesgo después.",
      newDemoNotice:
        "El alta de sistemas requiere conectar Supabase. En modo demo el inventario usa datos de ejemplo. Configura las credenciales para empezar a registrar sistemas reales.",
      createCta: "Registrar sistema",
      createPending: "Registrando…",
      editTitle: "Editar sistema",
      editSubtitle: "Actualiza los datos del sistema o elimínalo del inventario.",
      generateDossier: "⬇ Generar dossier",
      notFound:
        "No se encontró el sistema, o la edición no está disponible en modo demo.",
      saveCta: "Guardar cambios",
      savePending: "Guardando…",
      historyTitle: "Historial de evaluaciones",
      evaluate: "+ Evaluar",
      historyBody:
        "Cada clasificación guardada queda registrada, con su nivel de respaldo y quién la atestó.",
      dangerTitle: "Zona de peligro",
      dangerBody: "Eliminar el sistema borra también sus evaluaciones y brechas.",
    },

    gap: {
      title: "Gap assessment",
      // Muro de plan de la sección (antes estaba hardcodeado en el layout).
      paywallFeature: "Gap assessment",
      paywallDesc:
        "Mide tu preparación frente a cada obligación, genera el informe de brechas y conviértelas en un plan de acción.",
      subtitleOne: "1 brecha abierta frente a los requisitos del EU AI Act.",
      subtitleOtherAfter:
        " brechas abiertas frente a los requisitos del EU AI Act.",
      addGap: "+ Añadir brecha",
      exportEvidence: "⬇ Exportar evidencia (PDF)",
      severityPrefix: "· severidad ",
      affectedSystemPrefix: "Sistema afectado: ",
      status: { missing: "Falta", partial: "Parcial", done: "Cubierto" },
      prohibited: {
        badge: "Práctica prohibida (Art. 5)",
        level: "Inaceptable",
        actionShort: "Revisión jurídica / cese de uso",
        action:
          "Requiere revisión jurídica y, en su caso, cese del uso. No se prepara para auditoría: una práctica prohibida se verifica y se cesa, no se prepara.",
        note:
          "Este ítem no se incluye en el «% listo». Una práctica prohibida (riesgo inaceptable, Art. 5) no se prepara para auditoría: tu organización debe verificar su ausencia o cesar el uso. El porcentaje mide preparación de obligaciones exigibles, no la resolución de prohibiciones.",
      },
      newTitle: "Añadir brecha",
      newSubtitle: "Registra un control o requisito pendiente para un sistema.",
      backToGap: "← Volver al gap assessment",
      newDemoNotice:
        "Añadir brechas requiere conectar Supabase. En modo demo el gap assessment usa datos de ejemplo.",
      noSystems:
        "Registra primero un sistema en el inventario para poder añadirle brechas.",
      systemLabel: "Sistema *",
      systemPlaceholder: "Selecciona un sistema…",
      requirementLabel: "Requisito / control *",
      requirementPlaceholder: "Supervisión humana efectiva en la decisión",
      articleLabel: "Artículo",
      articlePlaceholder: "Art. 26.2",
      severityLabel: "Severidad",
      severityAlta: "Alta",
      severityMedia: "Media",
      severityBaja: "Baja",
      statusLabel: "Estado",
      createCta: "Añadir brecha",
      createPending: "Añadiendo…",
      cancel: "Cancelar",
    },

    team: {
      title: "Equipo",
      subtitle: "Invita a tu equipo (RRHH, Legal, auditoría) y gestiona sus roles.",
      paywallFeature: "Equipo y roles",
      paywallDesc:
        "Invita a tu equipo, asigna roles (owner/admin/member) y gestiona quién ve y atesta la evidencia de tu organización.",
      demoBefore: "Estás en ",
      demoMode: "modo demo",
      demoAfter:
        ": se muestra un equipo de ejemplo. Conecta tu organización para invitar personas y gestionar roles de verdad.",
      inviteTitle: "Invitar a alguien",
      inviteBody:
        "Si ya tiene cuenta en Attesta se añade al instante. Si no, la invitación queda pendiente y se activa cuando se registre con ese correo.",
      emailLabel: "Correo",
      emailPlaceholder: "persona@empresa.com",
      roleLabel: "Rol",
      inviteCta: "Invitar",
      membersTitle: "Miembros",
      you: "(tú)",
      joinedPrefix: "Se unió el ",
      pendingTitle: "Invitaciones pendientes",
      invitedAsPrefix: "Invitado como ",
      pending: "Pendiente",
      rolesLegendTitle: "Qué puede hacer cada rol",
      roleLabels: {
        owner: "Propietario",
        admin: "Administrador",
        member: "Miembro",
      },
      roleHints: {
        owner:
          "Control total: gestiona el equipo, la organización y puede borrar sistemas.",
        admin:
          "Gestiona sistemas, brechas y evaluaciones; puede invitar a miembros.",
        member: "Acceso de lectura al panel de la organización.",
      },
    },

    billing: {
      title: "Plan y facturación",
      subtitle: "Gestiona la suscripción de tu organización.",
      okBanner:
        "¡Pago recibido! Tu suscripción se activará en unos segundos. Si no ves el cambio, recarga la página.",
      canceledBanner: "Checkout cancelado. No se realizó ningún cargo.",
      forbiddenBanner:
        "Solo el propietario o un administrador pueden gestionar la facturación de la organización.",
      planPrefix: "Plan ",
      badgeEnterprise: "Enterprise",
      badgeUnlocked: "Desbloqueado",
      badgeFree: "Gratuito",
      badgeActiveFallback: "Activa",
      tier: {
        free: "Diagnóstico",
        preparacion: "Preparación",
        enterprise: "Enterprise",
      },
      status: {
        active: "Activa",
        trialing: "En prueba",
        past_due: "Pago pendiente",
        canceled: "Cancelada",
        unpaid: "Impaga",
        incomplete: "Incompleta",
        incomplete_expired: "Expirada",
        paused: "En pausa",
      },
      willCancelBefore: "Se cancelará el ",
      willCancelAfter: ". Hasta entonces conservas el acceso.",
      renewsBefore: "Se renueva el ",
      renewsAfter: ".",
      manageSubscription: "Gestionar suscripción",
      portalHint:
        "Cambiar método de pago, ver facturas o cancelar — todo en el portal seguro de Stripe.",
      enterpriseBody:
        "Tu organización tiene el plan Enterprise: acceso completo, varias entidades, SSO y soporte prioritario.",
      unlockedBody:
        "Tu organización tiene desbloqueada la preparación completa para auditoría. ¡A por ello!",
      freeBody:
        "Tu organización usa el plan gratuito (inventario y clasificación de riesgo). Desbloquea la preparación completa para auditoría.",
      perMonth: "/mes",
      subscribeCta: "Suscribirse a Preparación",
      checkoutInactive: "El cobro en línea aún no está activo. Vuelve pronto.",
      includesTitle: "Qué incluye Preparación",
      features: [
        "Gap assessment + plan de acción",
        "Vigilancia regulatoria continua",
        "Dossier e informe ejecutivo (PDF)",
        "Evidencia y audit-trail",
        "Policy packs (RRHH)",
        "Equipo y roles",
      ],
      enterpriseHint:
        "¿Necesitas varias entidades, SSO o soporte prioritario? Escríbenos para el plan Enterprise.",
      exportTitle: "Exportar datos",
      exportBodyBefore:
        "Descarga una copia completa de la evidencia declarada de tu organización en un archivo ",
      exportBodyJson: "JSON",
      exportBodyAfter:
        " portable: inventario de sistemas, evaluaciones de riesgo, brechas, plan de acción, auditorías de sesgo, equipo, revisiones regulatorias y el registro de actividad con su verificación de integridad. Tus datos son tuyos: úsalo para respaldo o para llevártelos.",
      downloadJson: "Descargar JSON",
      exportNote:
        "Es un volcado de tus datos, no un informe ni una certificación. Para el dossier o el informe ejecutivo en PDF, usa las secciones de Inventario e Informe.",
    },

    riskPage: {
      title: "Clasificación de riesgo",
      subtitle:
        "Cada sistema mapeado a su nivel de riesgo del EU AI Act y sus obligaciones.",
      evaluateCta: "+ Evaluar un sistema",
    },

    overview: {
      title: "Resumen de gobernanza",
      subtitleStart: "Tu punto de partida para gobernar la IA con evidencia.",
      subtitle: "Estado de preparación de tus sistemas de IA en un vistazo.",
      executiveReport: "Informe ejecutivo",
      stat: {
        systems: "Sistemas de IA",
        systemsHint: "ver inventario",
        highRisk: "Alto riesgo",
        highRiskHint: "requieren obligaciones estrictas",
        avgReadiness: "Preparación media",
        avgReadinessHintBefore: "objetivo ≥ ",
        avgReadinessHintAfter: "% para estar listo",
        openGaps: "Brechas abiertas",
        openGapsHint: "ver gap assessment",
      },
      meterNoteBefore: "La marca en las barras señala el objetivo orientativo de ",
      meterNoteReady: "% listo",
      meterNoteAfter:
        " para considerar un sistema preparado para auditoría. No es un juicio de cumplimiento.",
      nextMilestone: "Próximo hito regulatorio",
      today: "hoy",
      inDaysPrefix: "en ",
      riskDistribution: "Distribución de riesgo",
      needAttention: "Requieren atención",
      viewAll: "Ver todos →",
      emptyAttentionTitle: "Nada que requiera atención",
      emptyAttentionBody:
        "Cuando registres sistemas de IA, aquí verás los que necesitan revisión o tienen menor preparación.",
      registerSystem: "+ Registrar sistema",
      legalNote:
        'El "% listo" refleja evidencia autodeclarada, no un juicio de cumplimiento.',
    },

    controls: {
      gapStatus: { missing: "Falta", partial: "Parcial", done: "Cubierto" },
      taskStatus: {
        todo: "Por hacer",
        in_progress: "En curso",
        blocked: "Bloqueada",
        done: "Hecha",
      },
      memberRole: {
        member: "Miembro",
        admin: "Administrador",
        owner: "Propietario",
      },
      memberRoleAria: "Rol del miembro",
      eventStatus: {
        aria: "Estado interno",
        unset: "Sin marcar",
        reviewed: "Revisado",
        planned: "Plan en marcha",
        notApplicable: "No aplica",
      },
      jurisdiction: {
        toggle: "Ajustar mis jurisdicciones",
        hint: "Dónde contratas · afina el radar",
        body: "Marca los territorios donde tu organización contrata o tiene empleados. El radar priorizará las normas de esas jurisdicciones.",
        save: "Guardar",
        readonlyTitle: "Jurisdicciones de tu organización",
        readonlyEmpty: "Sin configurar",
      },
      // Nota compartida por los ajustes de organización (nexo de jurisdicción y
      // cadencia de revisión) cuando el usuario no puede cambiarlos. Se enseña
      // el valor, no solo el candado: sin él, lo que el usuario ve en pantalla
      // parece arbitrario.
      ownerAdminOnly:
        "Solo quien tenga rol de propietario o administrador puede cambiarlo.",
      task: {
        statusAria: "Estado",
        assigneeAria: "Responsable",
        noAssignee: "Sin responsable",
        dueDateAria: "Fecha límite",
        deleteTitle: "Eliminar tarea",
        deleteMessageBefore: "Se eliminará la tarea «",
        deleteMessageAfter: "» del plan. Esta acción no se puede deshacer.",
        deleteConfirm: "Eliminar",
        deleteTrigger: "Eliminar",
        deleteAria: "Eliminar tarea",
      },
      history: {
        emptyBefore:
          "Este sistema aún no tiene evaluaciones guardadas. Clasifícalo desde ",
        emptyLink: "Riesgo → Evaluar un sistema",
        emptyAfter: ".",
        current: "Vigente",
        attestedByPrefix: " · atestado por ",
        viewEvidence: "Ver evidencia",
      },
    },

    // Chrome de navegación de las páginas regulatorias (5d). SOLO títulos de
    // PageHeader genéricos, botones de acción/navegación, estados vacíos y
    // micro-etiquetas de UI. El contenido regulatorio determinista queda en ES.
    pages: {
      // Enlaces de vuelta genéricos
      back: "← Volver",
      backToOverview: "← Volver al resumen",
      backToInventory: "← Volver al inventario",
      backToRiskClass: "← Volver a clasificación de riesgo",
      backToGap: "← Volver al gap assessment",
      backToMonitoring: "← Volver a Vigilancia",
      radarBack: "← Radar",

      evaluate: {
        title: "Evaluar riesgo de un sistema",
        subtitle:
          "Responde el cuestionario guiado y obtén la clasificación según el EU AI Act.",
      },

      wizard: {
        stepPrefix: "Paso ",
        stepOf: " de ",
        back: "← Atrás",
        next: "Siguiente",
        seeResult: "Ver resultado",
        selectSingle: "Selección única.",
        selectMultiple: "Selección múltiple: puedes marcar varias opciones.",
        evaluateAnother: "Evaluar otro sistema",
        backToRisk: "Volver a riesgo",
        result: {
          gpaiTitle: "Modelo de propósito general (GenAI) detectado",
      gpaiWarnTitle: "⚠️ Puede haber cambiado vuestro papel: revisión jurídica",
      indicativeLabel: "Resultado orientativo",
          indicativeSuffix: "(indicativo)",
          indicativeDesc:
            "Clasificación orientativa según los criterios del EU AI Act, a partir de lo que tu organización ha declarado.",
          transparencyPre:
            "Además, este sistema está sujeto a las obligaciones de transparencia del ",
          transparencyArticle: "Art. 50",
          transparencyMid: ", que se ",
          transparencyEmphasis: "suman",
          transparencyPost: " a las de alto riesgo.",
          obligationsTitle: "Obligaciones aplicables",
          regulatoryBasisTitle: "Base regulatoria",
          immediateAction: "Acción inmediata",
          criticalPoints: "Puntos críticos y próximos pasos",
          prohibitedNote:
            "Una práctica prohibida (Art. 5) no se prepara: se cesa. Valida con asesoría jurídica antes de continuar.",
          prioritizeNote:
            "Qué priorizar para tu preparación, ordenado por urgencia.",
          savedPre: "✓ Autoevaluación guardada como ",
          withEvidenceTag: "con evidencia",
          declaredTag: "declarado",
          savedMid:
            ". El sistema se actualizó y quedó registrado en el audit-trail",
          savedAttestedPrefix: ", atestado por ",
          viewDossier: "Ver dossier del sistema →",
          detectGaps: "Detectar brechas con un policy pack →",
          saveTitle: "Guardar como autoevaluación",
          systemLabel: "Sistema",
          systemPlaceholder: "Selecciona un sistema…",
          attestedByLabel: "Responsable que atesta",
          attestedByPlaceholder: "Nombre y cargo",
          evidenceLabel: "Evidencia de soporte",
          optional: "(opcional)",
          evidencePlaceholder: "Enlace o descripción del documento",
          evidenceHintYes:
            "Se guardará como «con evidencia»: aportas soporte documental.",
          evidenceHintNo:
            "Sin evidencia se guardará como «declarado» (sin verificar). Añade un enlace o documento para respaldarlo.",
          saving: "Guardando…",
          saveButton: "Guardar autoevaluación",
          saveError: "No se pudo guardar. Inténtalo de nuevo.",
        },
      },

      vault: {
        paywallFeature: "Vault de evidencia",
        paywallDesc:
          "Guarda los documentos reales detrás de cada control y genera el paquete que se le entrega a un auditor, con la huella SHA-256 de cada archivo.",
      },
      plan: {
        title: "Plan de acción",
        subtitle:
          "Tareas priorizadas para cerrar tus brechas: asigna responsable, fecha y estado.",
        paywallFeature: "Plan de acción",
        paywallDesc:
          "Convierte las brechas en tareas con responsables y fechas, y sigue su avance hasta cerrarlas.",
        exportEvidence: "⬇ Exportar evidencia",
        statOpen: "abiertas",
        statInProgress: "en curso",
        statOverdue: "vencidas",
        statDone: "hechas",
        addTask: "+ Añadir tarea",
        addTaskHint: "Crea una tarea manual",
        fieldTitle: "Título",
        fieldTitlePlaceholder: "Qué hay que hacer",
        fieldDetail: "Detalle (opcional)",
        fieldPriority: "Prioridad",
        fieldAssignee: "Responsable",
        noAssignee: "Sin responsable",
        fieldDueDate: "Fecha límite",
        fieldSystem: "Sistema (opcional)",
        addToPlan: "Añadir al plan",
        emptyTitle: "Tu plan está vacío",
        emptyBody:
          "Añade una tarea o incorpora las sugerencias de abajo, generadas a partir de tus brechas y niveles de riesgo.",
        overdue: "vencida",
        suggested: "· sugerida",
        suggestionsTitle: "Sugerencias",
        suggestionsBody:
          "Generadas a partir de tus brechas abiertas y niveles de riesgo. Añádelas al plan para asignarles responsable y fecha.",
        addSuggestionToPlan: "+ Añadir al plan",
      },

      // Registro de incidentes (Art. 26.5) + revisión periódica.
      // Ojo al redactar aquí: los plazos numéricos (15/10/2 días) son del
      // Art. 73 y son DEL PROVEEDOR; el 26.5 solo dice "sin demora
      // injustificada" e "inmediatamente". Y la cadencia de revisión es buena
      // práctica, no una obligación: hay un test que rompe si se reescribe como
      // obligatoria.
      incidents: {
        title: "Incidentes",
        subtitle:
          "Expediente de lo ocurrido, de lo que tu organización declara haber informado y de cuándo. Art. 26.5 del Reglamento de IA.",
        paywallFeature: "Registro de incidentes",
        paywallDesc:
          "Abre un expediente por cada incidencia, registra a quién informaste y cuándo, y conserva la fecha de conocimiento que arranca los plazos.",
        legalFrame:
          "El Art. 26 es exigible para el alto riesgo del Anexo III desde el 2 de diciembre de 2027. Registrar incidentes hoy es preparación, no una obligación vencida.",

        statOpen: "abiertos",
        statSerious: "calificados como graves",
        statAttention: "con avisos por registrar",
        statUnsuspended: "con riesgo y sin suspensión registrada",

        newIncident: "+ Abrir expediente",
        newIncidentHint: "Registra una incidencia",
        fieldTitle: "Qué ha pasado",
        fieldTitlePlaceholder: "Resume el hecho en una línea",
        fieldDetail: "Detalle (opcional)",
        fieldSystem: "Sistema afectado",
        fieldOccurredOn: "Fecha del hecho",
        fieldAwareOn: "Fecha de conocimiento",
        fieldAwareOnHint:
          "La más importante del expediente: el Art. 73 cuenta sus plazos desde que el proveedor —o, en su caso, tu organización— tiene conocimiento.",
        fieldCausalLinkOn: "Nexo causal establecido",
        fieldCausalLinkOnHint:
          "Cuándo se estableció el nexo con el sistema, o su probabilidad razonable. La definición admite causalidad directa o indirecta.",
        fieldSeriousness: "Calificación",
        fieldCategories: "Categorías del Art. 3, punto 49",
        categoriesHint:
          "Solo si lo has calificado como grave. Marca todas las que apliquen: cuando concurren varias, el plazo de referencia es el más corto.",
        create: "Abrir expediente",
        saveAssessment: "Guardar calificación",

        emptyTitle: "Todavía no hay expedientes",
        emptyBody:
          "Abre uno en cuanto detectes una incidencia, aunque aún no sepas si es grave. Casi todos empiezan en evaluación.",

        seriousnessLabel: {
          under_assessment: "En evaluación",
          serious: "Incidente grave",
          not_serious: "No es incidente grave",
        },
        seriousnessHint:
          "Se puede empezar en evaluación y escalar después: el expediente conserva las dos fechas.",

        categoryLabel: {
          death: "Muerte de una persona",
          serious_health_harm: "Daño grave para la salud",
          critical_infrastructure:
            "Perturbación grave e irreversible de infraestructuras críticas",
          fundamental_rights:
            "Incumplimiento de obligaciones del Derecho de la Unión que protegen derechos fundamentales",
          property_or_environment: "Daños graves a la propiedad o al medio ambiente",
        },

        stageLabel: {
          attention: "Avisos por registrar",
          notified: "Avisos registrados",
          logged: "Registrado",
          closed: "Cerrado",
        },

        targetLabel: {
          provider: "Proveedor",
          distributor: "Importador o distribuidor",
          authority: "Autoridad de vigilancia del mercado",
        },

        notifyTitle: "A quién informar",
        notifyOrderedNote:
          "Incidente grave: el Art. 26.5 fija el orden — primero al proveedor y después al importador o distribuidor y a las autoridades, inmediatamente.",
        notifySimultaneousNote:
          "Riesgo del Art. 79.1: informa al proveedor o distribuidor y a la autoridad de vigilancia del mercado, sin demora injustificada.",
        notifyNothing:
          "Mientras el expediente esté en evaluación y no haya riesgo declarado del Art. 79.1, el Art. 26.5 no activa todavía ningún aviso.",
        notifyDisclaimer:
          "Attesta no transmite nada a ninguna autoridad ni a ningún proveedor: aquí se registra lo que tu organización declara haber hecho.",
        notifyDeclared: "Declarado el",
        notifyPending: "Sin registrar",
        markNotified: "Registrar aviso",
        undoNotified: "Deshacer",

        elapsedPrefix: "Conocido hace ",
        elapsedToday: "Conocido hoy",

        flagRisk79: "Hay motivos para considerar un riesgo del Art. 79.1",
        flagRisk79Hint:
          "Riesgo para la salud, la seguridad o los derechos fundamentales. Cuenta aunque el sistema se esté usando conforme a las instrucciones: no hace falta mal uso.",
        flagSuspended: "Tu organización ha suspendido el uso",
        flagSuspendedHint:
          "El Art. 26.5 manda suspender el uso en la rama del riesgo del Art. 79.1 — no por el hecho de que el incidente sea grave.",
        flagProviderUnreachable: "No se ha podido contactar con el proveedor",
        flagProviderUnreachableHint:
          "Solo en ese caso el Art. 26.5 remite al Art. 73 «mutatis mutandis» y sus plazos pasan a ser de tu organización.",
        flagPersonalData: "Afecta además a datos personales",
        flagPersonalDataHint:
          "Bandera aparte a propósito: los plazos del RGPD (72 h a la autoridad de protección de datos) corren en paralelo y ninguno sustituye al otro.",

        suspendRequired: "Suspensión de uso pendiente de registrar",
        suspendDone: "Uso suspendido, según lo declarado",

        deadlineProviderTitle: "Plazo del proveedor (Art. 73)",
        deadlineProviderBody:
          "El Art. 73 obliga al proveedor, no a tu organización. Se cuenta desde tu fecha de conocimiento, así que tu expediente es la prueba de cuándo empezó a correr.",
        deadlineSelfTitle: "Plazo aplicable a tu organización (Art. 73)",
        deadlineSelfBody:
          "Al declarar que no has podido contactar con el proveedor, el Art. 26.5 remite al Art. 73 y el plazo pasa a ser tuyo. El canal lo define tu autoridad nacional de vigilancia del mercado.",
        deadlineRef: "Referencia: ",
        deadlineDaysSuffix: " días desde el conocimiento",

        gdprTitle: "Dos relojes distintos",
        gdprBody:
          "Un incidente grave del Reglamento de IA no es una violación de seguridad de datos personales, ni al revés. Si además lo es, corren en paralelo los plazos del RGPD (arts. 33 y 34) con otros destinatarios.",

        close: "Cerrar expediente",
        reopen: "Reabrir",
        openBadge: "Abierto",
        closedBadge: "Cerrado",
        detailsToggle: "Calificación y avisos",

        // --- Revisión periódica de la autoevaluación ---
        reviewTitle: "Revisión de la autoevaluación",
        reviewSubtitle:
          "Sistemas cuya autoevaluación conviene volver a mirar, según la cadencia que ha fijado tu organización.",
        cadenceLabel: "Cadencia",
        cadenceNote:
          "Buena práctica: el Reglamento no fija periodicidad de revisión para el responsable del despliegue. El Art. 26.5 pide supervisión continua y el Art. 27.2 se dispara por cambios, no por calendario; ISO/IEC 42001 habla de «intervalos planificados» y NIST AI RMF (GOVERN 1.5) deja la frecuencia a criterio de la organización.",
        cadence180: "Cada 6 meses",
        cadence365: "Cada 12 meses",
        cadence730: "Cada 24 meses",
        saveCadence: "Guardar",
        reviewEmpty: "Ningún sistema entra todavía en la ventana de revisión.",
        reviewStateLabel: {
          overdue: "Pasada la fecha",
          unknown: "Sin revisión registrada",
          due_soon: "Próxima",
          ok: "Al día",
        },
        reviewViewAll: "Ver revisiones",
        reviewMorePrefix: "Y ",
        reviewMoreSuffix: " sistemas más en la ventana de revisión.",
        reviewLastPrefix: "Última revisión: ",
        reviewNever: "sin registrar",
        reviewDuePrefix: "Toca el ",

        triggersTitle: "Qué debería disparar una revisión",
        triggersNote:
          "Estos son los disparadores que la norma sí reconoce. La cadencia de arriba es solo la red de seguridad.",
        art27Note:
          "Los marcados con Art. 27 solo obligan a quien está sujeto a la evaluación de impacto en derechos fundamentales: organismos públicos, entidades privadas que prestan servicios públicos y los puntos 5.b y 5.c del Anexo III. Una empresa privada de RRHH no debe esa evaluación.",
        triggers: {
          incident: "Se ha registrado un incidente en este sistema",
          substantialChange: "Modificación sustancial del sistema",
          vendorOrModel: "Cambio de proveedor o de versión del modelo",
          purpose: "Cambian los procesos o la finalidad de uso",
          affectedGroups: "Cambian las personas o los grupos afectados",
          newRisks: "Aparecen riesgos de perjuicio que antes no constaban",
          humanOversight: "Cambian las medidas de supervisión humana",
          regulatory: "Novedad regulatoria del radar de vigilancia",
        },
      },

      // Registro de proveedores y terceros (Capa 8).
      // Al redactar aquí: el VERBO depende de la base jurídica del elemento
      // (`src/lib/suppliers/evidence.ts`). Solo las instrucciones de uso son
      // exigibles; el Anexo IV, el SGC y la gestión de riesgos van dirigidos a
      // autoridades y organismos notificados. Y nada de puntuar al proveedor.
      suppliers: {
        title: "Proveedores",
        subtitle:
          "Quién te vende cada sistema de IA, qué evidencia te ha dado y qué te falta. La obligación de diseño es suya; el expediente es tuyo.",
        paywallFeature: "Registro de proveedores",
        paywallDesc:
          "Inventaría a tus proveedores de IA, lleva la cuenta de qué evidencia te ha entregado cada uno y ten a mano lo que hay que pactar en el próximo contrato.",
        legalFrame:
          "Las obligaciones de importador y distribuidor (Arts. 23 y 24) son exigibles para el alto riesgo del Anexo III desde el 2 de diciembre de 2027, igual que las del Art. 26. Hasta entonces esto es preparación contractual: hazlo mientras renuevas contratos, que es cuando tienes palanca.",

        statSuppliers: "proveedores",
        statCovered: "elementos con evidencia",
        statPending: "pendientes",
        statRefused: "negativas registradas",

        addSupplier: "+ Añadir proveedor",
        addSupplierHint: "Da de alta un tercero",
        fieldName: "Nombre",
        fieldNamePlaceholder: "Razón social del proveedor",
        fieldCountry: "País de establecimiento",
        fieldRole: "Papel en el Reglamento",
        fieldGdprRole: "Papel en protección de datos",
        fieldContact: "Contacto de compliance",
        fieldContractEnds: "Fin del contrato",
        fieldNote: "Notas",
        flagOutsideEu: "Establecido fuera de la UE",
        flagOutsideEuHint:
          "Entonces debe tener representante autorizado en la Unión (Art. 22). Si el representante cesa, es señal de alarma: el Art. 22.4 le obliga a poner fin al mandato cuando cree que el proveedor incumple.",
        fieldAuthorizedRep: "Representante autorizado",
        fieldAuthorizedRepChecked: "Verificado el",
        flagDpa: "Hay contrato de encargo de tratamiento (RGPD 28)",
        flagDpaHint:
          "Solo aplica si el proveedor trata datos personales por tu cuenta. Muchos se declaran responsables para entrenar o mejorar su producto: el papel es un dato, no una suposición.",
        flagExcludesHighRisk: "El contrato excluye usarlo en casos de alto riesgo",
        flagExcludesHighRiskHint:
          "Bandera roja del Art. 25.2. Si tu contrato lo excluye y aun así lo usas para un caso de alto riesgo, asumes las obligaciones de proveedor y pierdes el derecho a que el proveedor inicial coopere.",
        create: "Añadir proveedor",
        save: "Guardar",
        remove: "Eliminar proveedor",

        emptyTitle: "Sin proveedores registrados",
        emptyBody:
          "Empieza por quien te vende el sistema de mayor riesgo. La evidencia que le pidas hoy es la que no tendrás que improvisar cuando llegue una auditoría.",

        roles: {
          provider: "Proveedor",
          importer: "Importador",
          distributor: "Distribuidor",
          model_provider: "Proveedor del modelo",
          third_party: "Otro tercero",
          unknown: "Sin determinar",
        },
        gdprRoles: {
          controller: "Responsable del tratamiento",
          processor: "Encargado del tratamiento",
          joint: "Corresponsable",
          none: "No trata datos personales",
          unknown: "Sin determinar",
        },

        // De la base jurídica sale el verbo. Esto es el corazón de la sección.
        verbs: {
          deliverable: "Exige",
          publicSource: "Verifica",
          contractOnly: "Pacta en contrato",
          existsNoAccess: "Registra que existe",
        },
        verbHints: {
          deliverable:
            "El Reglamento obliga al proveedor a hacértelo llegar.",
          publicSource:
            "Es público: se comprueba sin depender de la buena voluntad del proveedor.",
          contractOnly:
            "No es exigible por ley. Se consigue negociando, y el mejor momento es la renovación.",
          existsNoAccess:
            "Debe existir, pero su destinatario es otro (autoridades u organismos notificados).",
        },

        kinds: {
          instructions: "Instrucciones de uso",
          correctiveActions: "Aviso de acciones correctoras o retirada",
          authorizedRep: "Representante autorizado en la Unión",
          ceMarking: "Marcado CE",
          declarationOfConformity: "Declaración UE de conformidad",
          euDatabase: "Ficha en la base de datos de la UE",
          notifiedBodyCertificate: "Certificado de organismo notificado",
          technicalDocumentation: "Documentación técnica (Anexo IV)",
          qualityManagement: "Sistema de gestión de la calidad",
          riskManagement: "Sistema de gestión de riesgos",
          dataGovernance: "Gobernanza y calidad de los datos",
          logAccess: "Acceso y exportación de los registros",
          dataProcessingAgreement: "Contrato de encargo de tratamiento",
          versionChangeNotice: "Aviso de cambio de versión",
          importerRecords: "Documentación conservada por el importador",
          distributorChecks: "Verificaciones del distribuidor",
          gpaiIntegratorDocs: "Documentación para integradores del modelo",
          gpaiTrainingSummary: "Resumen público del contenido de entrenamiento",
        },
        statuses: {
          notRequested: "Sin solicitar",
          requested: "Solicitado",
          received: "Recibido",
          verifiedPublicly: "Verificado en fuente pública",
          refused: "El proveedor se negó",
          notApplicable: "No aplica",
        },
        statusHintRefused:
          "Anota qué te contestó y cuándo: una negativa por escrito es evidencia, y de las mejores.",

        evidenceTitle: "Evidencia",
        fieldVersion: "Versión del documento o del sistema",
        fieldVersionHint:
          "Más útil que una fecha: lo que invalida unas instrucciones no es que pase el tiempo, es que salga una versión nueva.",
        fieldSourceUrl: "Enlace o referencia",
        fieldExpires: "Caduca el",
        fieldExpiresHint:
          "Solo el certificado de organismo notificado caduca (Art. 44). El marcado CE, la declaración de conformidad, las instrucciones y el registro en la base de datos de la UE no caducan.",
        addEvidence: "Añadir elemento",
        certWarning: "Certificado próximo a caducar",
        certExpired: "Certificado caducado",

        noNotifiedBody:
          "Aviso útil: para los puntos 2 a 8 del Anexo III —empleo, crédito, educación, servicios públicos— la evaluación de conformidad es por control interno y NO interviene ningún organismo notificado (Art. 43.2). Si tu proveedor no te da un número de certificado, en la mayoría de los casos no es que te lo esconda: es que no existe.",

        art25Title: "Cuándo dejas de ser responsable del despliegue",
        art25Note:
          "Cuatro situaciones convierten a quien usa un sistema en su proveedor, con todas las obligaciones del Art. 16 encima. La tercera es la que más se da en el mid-market y no exige tocar nada técnico.",
        art25Outcome:
          "Puede activar el Art. 25: requiere revisión jurídica. Attesta no dictamina si te has convertido en proveedor.",
        art25: {
          whiteLabel:
            "Pones tu nombre o tu marca en un sistema de alto riesgo que ya estaba en el mercado",
          substantialModification:
            "Modificas sustancialmente el sistema, más allá de los cambios que el proveedor dejó previstos",
          purposeChange:
            "Cambias la finalidad de uso de un sistema que no era de alto riesgo —incluido uno de propósito general— y con ello pasa a serlo",
          fineTuning:
            "Ajustas (fine-tuning) un modelo de propósito general por tu cuenta",
        },
        art25CarveOut:
          "Único con matiz contractual: el Art. 25.1.a admite que un pacto reparta las obligaciones entre las partes.",
      },

      activity: {
        title: "Registro de actividad",
        subtitle:
          "Cada cambio queda registrado y encadenado con SHA-256: cualquier alteración posterior es detectable. Quién hizo qué y cuándo.",
        paywallFeature: "Registro de actividad",
        paywallDesc:
          "El audit-trail inmutable de tu organización: quién creó, cambió o atestó cada sistema, evaluación y brecha, con fecha y autor.",
        chainOk: "Cadena íntegra",
        chainBroken: "Integridad rota",
        filterAll: "Todo",
        filterSystems: "Sistemas",
        filterAssessments: "Evaluaciones",
        filterGaps: "Brechas",
        filterTeam: "Equipo",
        empty: "No hay actividad registrada todavía.",
        demoBefore: "Estás en ",
        demoMode: "modo demo",
        demoAfter:
          ": actividad de ejemplo. En modo conectado se registra cada cambio real por triggers de base de datos, sin poder editarlo ni borrarlo.",
        justNow: "ahora mismo",
        agoPrefix: "hace ",
        agoSuffix: "",
        chainOkTitle: "Integridad de la cadena verificada",
        chainBrokenTitle: "Se detectó una alteración en el registro",
        chainOkBodyPrefix: "Los ",
        eventChainedOne: "evento está encadenado",
        eventChainedOther: "eventos están encadenados",
        chainOkBodyRest:
          " con SHA-256: cada registro incorpora el hash del anterior, así que alterar o borrar cualquiera —incluso con acceso directo a la base de datos— rompería la cadena y quedaría en evidencia.",
        chainBrokenBodyPrefix: "La cadena se rompe en el evento #",
        chainBrokenBodyRest:
          ": un registro fue modificado o eliminado fuera de la aplicación. Conserva esta evidencia y revisa el acceso a la base de datos.",
        verifiedLive: "Verificado en vivo · ",
        actorSystem: "El sistema",
        changedPrefix: "Cambió: ",
        pillInsert: "Alta",
        pillUpdate: "Cambio",
        pillDelete: "Baja",
      },

      monitoring: {
        title: "Vigilancia regulatoria",
        subtitle:
          "Radar de plazos y cambios normativos que afectan a tus sistemas de IA.",
        paywallFeature: "Vigilancia regulatoria",
        paywallDesc:
          "El radar que vigila las fuentes oficiales y te avisa de cada plazo y cambio del EU AI Act antes de que te afecte.",
        watchedSources: "Fuentes vigiladas →",
        validationInbox: "Bandeja de validación →",
        jurisdictionFilter: "Jurisdicción",
        myJurisdictions: "Mis jurisdicciones",
        allJurisdictions: "Todas",
        inNexus: "en tu nexo",
        nextDeadline: "Próximo plazo",
        affectsPrefix: "afecta a ",
        affectsPrefixCap: "Afecta a ",
        affectsSuffix: " de tu inventario",
        noAffected: "sin sistemas afectados en tu inventario",
        noAffectedCap: "Sin sistemas afectados en tu inventario",
        affectedOne: "sistema afectado",
        affectedOther: "sistemas afectados",
        viewSystems: "Ver sistemas →",
        morePastDeadlines: "Más plazos por venir",
        regulatoryTimeline: "Cronología regulatoria",
        timelineMyJurisdictions: " · mis jurisdicciones",
        timelineInForceDivider: "Ya en vigor",
        timelineEmptyFiltered: "No hay eventos con este estado.",
        statusAll: "Todos",
        summaryUpcoming: "Próximos plazos",
        summaryNearest: "El más cercano",
        summaryInForce: "Ya en vigor",
        summaryFrameworks: "Marcos vigilados",
        summaryNone: "—",
        upcoming: "por venir",
        inForce: "en vigor",
        detailWhat: "Qué es",
        detailMeaning: "Qué significa para ti",
        detailAction: "Qué hacer",
        internalStatus: "Estado interno",
        notMarked: "Sin marcar",
        affectedSystemsLabel: "Sistemas afectados",
        relToday: "hoy",
        relTomorrow: "mañana",
        relYesterday: "ayer",
        relInPrefix: "en ",
        relAgoPrefix: "hace ",
        relAgoSuffix: "",
        relDays: "días",
        relMonths: "meses",
        relYears: "años",
      },

      candidates: {
        title: "Bandeja de validación",
        subtitleNonAdmin:
          "Cola de candidatos regulatorios propuestos por el pipeline.",
        subtitle:
          "Borradores propuestos por el pipeline. Nada llega al radar de los clientes sin tu validación.",
        nonAdminNotice:
          "Esta área es para el equipo de compliance de Attesta, que valida los cambios normativos antes de publicarlos en el radar.", // attesta-copy-ok: el objeto es el CAMBIO NORMATIVO (validador humano interno del radar), no el cumplimiento del cliente.
        pendingOne: "candidato pendiente",
        pendingOther: "candidatos pendientes",
        pendingSuffix: " de revisión",
        empty:
          "No hay candidatos pendientes. El pipeline dejará aquí cada cambio normativo detectado para tu revisión.",
        reviewed: "Ya revisados",
        noDate: "sin fecha",
        eventDatePrefix: "· fecha del evento ",
        confidencePrefix: "confianza ",
        impactLabel: "Impacto para el deployer",
        actionLabel: "Acción propuesta",
        provenanceLabel: "Procedencia",
        agentPrefix: "agente ",
        modelPrefix: "modelo ",
        noLlm: "sin LLM (determinista)",
        sourcePrefix: "· fuente ",
        publishedAsPrefix: "Publicado como «",
        publishedAsMid: "» · ",
        discardedPrefix: "Descartado · ",
        reviewNoteSep: " — ",
      },

      candidateControls: {
        closeEditor: "Cerrar editor",
        completeAndPublish: "Completar y publicar",
        editAndPublish: "Editar y publicar",
        discard: "Descartar",
        discardTitle: "Descartar candidato",
        discardBodyBefore: "Vas a descartar «",
        discardBodyAfter:
          "». Puedes anotar un motivo (opcional) para el registro.",
        reasonLabel: "Motivo (opcional)",
        cancel: "Cancelar",
        close: "Cerrar",
        publishToRadar: "Publicar en el radar",
        saveDraft: "Guardar borrador",
        rejectPlaceholder: "p. ej. duplicado, ruido, ya cubierto…",
        signalUnanalyzedBold: "Señal del Vigía sin analizar.",
        signalUnanalyzedRest:
          " Ábrela para completar fecha y tipo de evento (obligatorios para publicar) y afinar los textos; o descártala si es ruido.",
        fieldTitle: "Título",
        fieldFramework: "Marco",
        fieldKind: "Tipo de evento",
        fieldKindChoose: "— elegir —",
        fieldEventDate: "Fecha del evento",
        fieldEventId: "Id del evento al publicar",
        fieldEventIdPlaceholder: "se genera si lo dejas vacío",
        fieldSummary: "Resumen (qué es)",
        fieldImpact: "Impacto para el deployer",
        fieldAction: "Acción propuesta (qué hacer)",
        fieldArticles: "Artículos (separados por coma)",
        fieldArticlesPlaceholder: "Art. 26, Anexo III",
        fieldScope: "Alcance (a qué sistemas afecta)",
        scopeAll: "Toda la organización",
        publishRequired: "Fecha y tipo de evento son obligatorios para publicar.",
      },

      sources: {
        title: "Fuentes vigiladas",
        subtitleNonAdmin:
          "Watchlist del Vigía: las fuentes regulatorias que monitorizamos.",
        subtitle:
          "El Vigía revisa estas fuentes oficiales por huella de contenido (fetch + hash). Cuando una cambia, encola una señal en la bandeja de validación. Cero LLM: solo detecta que algo cambió.",
        nonAdminNotice:
          "Esta área es para el equipo de compliance de Attesta, que vigila los cambios normativos antes de publicarlos en el radar.",
        sourcesUnit: "fuentes",
        changedUnrevised: "con cambios sin revisar",
        downloadErrors: "con error de descarga",
        demoNotice:
          "Modo demo: watchlist de ejemplo, de solo lectura. Con la organización conectada, el Vigía revisa las fuentes en un horario y deja las señales en la bandeja del Validador.",
        colSource: "Fuente",
        colLastStatus: "Último estado",
        colChecked: "Revisada",
        colLastChange: "Último cambio",
        unreviewed: "Sin revisar",
        never: "nunca",
        failOne: "fallo",
        failOther: "fallos",
      },

      telemetry: {
        title: "Telemetría de producto",
        subtitle:
          "Embudo de activación de los últimos 30 días: de la visita al pago. Datos de primera parte, sin herramientas de terceros y sin datos personales.",
        subtitleNonAdmin: "Métricas internas de producto de Attesta.",
        nonAdminNotice:
          "Esta área es del equipo de Attesta: mide cómo se usa el producto y no contiene datos de tu organización.",
        empty:
          "Todavía no hay eventos registrados. Si el despliegue es reciente, comprueba que la migración 0026 esté aplicada: sin ella la app funciona igual, pero no guarda métricas.",
        funnelTitle: "Embudo de activación",
        funnelHint:
          "Cada paso se cuenta por visitantes distintos. La conversión compara con el paso anterior. No es una secuencia obligatoria: se puede pagar sin haber aplicado un pack.",
        othersTitle: "Otros eventos",
        colStep: "Paso",
        colEvent: "Evento",
        colVisitors: "Visitantes",
        colEvents: "Eventos",
        colConversion: "Conversión",
        colLast: "Último",
        never: "nunca",
        privacyNote:
          "Sin IP, sin user-agent y sin datos personales. El identificador anónimo solo evita contar dos veces la misma visita, y se respetan las señales GPC/DNT del navegador.",
        events: {
          page_view: "Visitas",
          cta_click: "Clic en un CTA",
          waitlist_submit: "Solicitud de acceso",
          signup_submitted: "Registro enviado",
          org_created: "Organización creada",
          system_created: "Sistema dado de alta",
          risk_assessed: "Riesgo evaluado",
          pack_applied: "Policy pack aplicado",
          paywall_viewed: "Muro de pago visto",
          checkout_started: "Checkout iniciado",
          checkout_completed: "Pago confirmado",
          export_downloaded: "Evidencia exportada",
          invite_sent: "Invitación enviada",
        },
      },

      // Chrome de los documentos PDF: SOLO botón de descarga + paywall. El cuerpo
      // legal (dossier/informe/gap) permanece íntegro en español (contenido validado).
      reportExec: {
        downloadPdf: "Descargar informe (PDF)",
        paywallFeature: "Informe ejecutivo",
        paywallDesc:
          "Genera el informe ejecutivo de gobernanza en PDF, listo para dirección y auditoría.",
        coverTag: "Informe ejecutivo",
        coverKicker: "Gobernanza de IA · Estado de la organización · EU AI Act",
        coverTitle: "Informe ejecutivo de gobernanza de IA",
        kpiSystems: "Sistemas de IA",
        kpiHighRisk: "Alto riesgo",
        kpiAvgReadiness: "Preparación media",
        kpiOpenGaps: "Brechas abiertas",
        kpiBacked: "Con respaldo",
        riskDistribution: "Distribución de riesgo",
        needAttention: "Sistemas que requieren atención",
        needAttentionHintPrefix:
          "Los más urgentes: alto riesgo con preparación por debajo del 60% (el umbral orientativo de preparación es ",
        needAttentionHintSuffix: "%).",
        allAboveThreshold: "Ningún sistema de alto riesgo está por debajo del umbral. 👍",
        colSystem: "Sistema",
        colRisk: "Riesgo",
        colReadiness: "Preparación",
        openGapsTitle: "Brechas abiertas prioritarias",
        openGapsHintMid: " abiertas · ",
        openGapsHintSuffix: " de severidad alta.",
        noOpenGaps: "No hay brechas abiertas registradas.",
        deadlinesTitle: "Próximos plazos regulatorios",
        noFutureDeadlines: "No hay plazos futuros en el radar.",
        affectsMid: " · afecta a ",
        inDaysPrefix: "en ",
        footerNote: "Resumen de dirección para preparación de auditoría.",
      },
      dossier: {
        downloadPdf: "Descargar dossier (PDF)",
        paywallFeature: "Dossier de evidencia",
        paywallDesc:
          "Genera el dossier de evidencia por sistema en PDF, listo para presentar al auditor.",
        notFound:
          "No se encontró el sistema. Puede que se haya eliminado o que no pertenezca a tu organización.",
        docKicker: "Documentación técnica · Preparación para auditoría · EU AI Act",
        docType: "Dossier de gobernanza de IA",
        refPrefix: "Ref. ",
        sec1: "Identificación del sistema",
        sec2: "Clasificación de riesgo",
        sec3: "Obligaciones aplicables",
        sec4: "Controles y brechas",
        sec5: "Plan de acción priorizado",
        sec6: "Historial de evaluaciones",
        sec7: "Declaración de responsabilidad",
        fieldCode: "Código",
        fieldName: "Nombre",
        fieldOwnerArea: "Área responsable",
        fieldDomain: "Dominio de uso",
        fieldVendor: "Proveedor",
        fieldYourRole: "Vuestro rol",
        fieldLastReview: "Última revisión",
        fieldDeclaredReadiness: "Preparación declarada",
        kpiRiskLevel: "Nivel de riesgo",
        kpiClassification: "Clasificación",
        kpiPriority: "Prioridad",
        kpiBacking: "Respaldo",
        kpiReadiness: "Preparación",
        kpiOpenGaps: "Brechas abiertas",
        kpiProhibited: "Práctica prohibida (Art. 5)",
        kpiLegalReview: "Revisión jurídica",
        backingPrefix: "Respaldo: ",
        currentAssessmentPrefix: "Evaluación vigente del ",
        attestedByPrefix: "· atestada por ",
        noNominalAttestation: "· sin atestación nominal",
        levelAssignedNoAssessment:
          "Nivel asignado a la ficha del sistema; sin evaluación guardada con el asistente de riesgo.",
        colRequirementControl: "Requisito / control",
        gapsEmpty:
          "No hay controles registrados para este sistema. Aplica el policy pack de RRHH o añade brechas desde el gap assessment.",
        effortPrefix: "· esfuerzo ",
        historyEmpty: "No hay evaluaciones guardadas para este sistema.",
        currentBadge: "vigente",
        evidencePrefix: "Evidencia: ",
        declFieldBackingLevel: "Nivel de respaldo",
        declFieldAttestedBy: "Atestado por",
        biasSectionTitle: "Auditoría de sesgo — EE. UU. (NYC LL144)",
        biasFieldLast: "Última auditoría de sesgo",
        biasFieldNext: "Próxima auditoría (12 meses)",
        biasFieldAuditor: "Auditor independiente",
        biasFieldIndependence: "Independencia confirmada",
        biasYesDeclared: "Sí (declarado)",
        biasNo: "No",
        biasFieldPublished: "Resumen publicado",
        biasPublishedYesPrefix: "Sí · ",
        biasPending: "Pendiente",
        biasFieldUrl: "URL del resumen",
      },
      gapReport: {
        downloadPdf: "Descargar evidencia (PDF)",
        coverTag: "Informe de evidencia",
        coverKicker: "Autoevaluación · EU AI Act",
        coverTitle: "Brechas y preparación para auditoría",
        kpiEvaluated: "Controles evaluados",
        kpiOpen: "Brechas abiertas",
        kpiOpenHigh: "Abiertas de sev. alta",
        kpiCovered: "Cubierto",
        kpiSystems: "Sistemas",
        coveredSuffix: " cubierto",
        groupsEmpty:
          "Aún no hay controles evaluados. Aplica un policy pack a los sistemas de tu organización desde el gap assessment para evaluar su preparación.",
        chipHighOpenPrefix: " sev. alta ",
        chipOpenOne: "abierta",
        chipOpenOther: "abiertas",
        coveredWord: "cubierto",
        colRequirement: "Requisito",
      },

      packsPage: {
        title: "Policy packs",
        subtitle:
          "Plantillas de controles por caso de uso y marco. Aplícalas para precargar las brechas de un sistema.",
        paywallFeature: "Policy packs",
        paywallDesc:
          "Plantillas de políticas listas para tu vertical (empezando por RRHH) para acelerar tu evidencia.",
        controlsUnit: "controles",
        applies: "Aplica:",
        applyToSystem: "Aplicar a un sistema",
        selectSystem: "Selecciona un sistema…",
        applyButton: "Aplicar policy pack",
        needSystem:
          "Registra un sistema en el inventario para poder aplicarle este pack.",
        demoNote:
          "En modo demo puedes ver el pack. Conecta Supabase para aplicarlo a tus sistemas.",
        legalPrefix: "Controles orientativos.",
      },

      reportChrome: {
        execSummary: "Resumen ejecutivo",
        organizationLabel: "Organización:",
        selfDeclaredData: "datos autodeclarados",
        roleWord: "rol:",
        generatedByPrefix: "Generado por ",
        generatedByOn: " el ",
        footerWorkingDoc: "Documento de trabajo para preparación de auditoría.",
        colArticle: "Artículo",
        colSeverity: "Severidad",
        colStatus: "Estado",
        statusMissing: "Falta",
        statusPartial: "Parcial",
        statusDone: "Cubierto",
        roleDeployer: "Responsable del despliegue (deployer)",
        roleProvider: "Proveedor (provider)",
      },

      reportRadar: {
        downloadPdf: "Descargar radar (PDF)",
        coverKicker: "Vigilancia regulatoria",
        coverTitle: "Radar regulatorio",
        coverTag: "Radar · Attesta",
        scopeLabel: "Alcance:",
        scopeAll: "Todas las jurisdicciones",
        scopeNexus: "Jurisdicciones de tu organización",
        summaryTitle: "Resumen del radar",
        kpiUpcoming: "Próximos plazos",
        kpiInForce: "Ya en vigor",
        kpiFrameworks: "Marcos vigilados",
        kpiNearest: "Próximo hito",
        upcomingTitle: "Próximos plazos",
        inForceTitle: "Ya en vigor",
        colDate: "Fecha",
        colFramework: "Marco",
        colEvent: "Evento",
        colWhen: "Faltan",
        colAffected: "Sistemas",
        colStatus: "Estado interno",
        inPrefix: "en ",
        noUpcoming: "No hay plazos próximos en el alcance seleccionado.",
        noInForce: "No hay eventos en vigor en el alcance seleccionado.",
        footerNote:
          "Radar de vigilancia regulatoria. Fechas y artículos provienen de un catálogo curado y verificado; el estado interno lo declara tu organización.",
      },
    },

    // Ruta pública `/demo`: chrome de la muestra con datos de ejemplo.
    // Solo UI (títulos, CTAs, hints); los datos vienen de la fachada demo.
    demoPage: {
      metaTitle: "Demo · Attesta",
      metaDescription:
        "Una muestra de Attesta con datos de ejemplo: inventario y clasificación de riesgo de IA.",
      backToSiteLong: "Volver al sitio",
      backToSiteShort: "Sitio",
      createAccount: "Crear cuenta",
      unlockCta: "Regístrate para desbloquear →",
      sampleNoticeTitle: "Estás viendo una muestra con datos de ejemplo.",
      sampleNoticeBody:
        "Inventario y clasificación de riesgo, abiertos. El resto se desbloquea al crear tu cuenta y usar tus propios datos.",
      startFree: "Empezar gratis",
      kpiSystems: "Sistemas de IA",
      kpiSystemsHint: "en inventario",
      kpiHighRisk: "Alto riesgo",
      kpiHighRiskHint: "obligaciones estrictas",
      kpiReadiness: "Preparación media",
      kpiReadinessHintPrefix: "objetivo ≥ ",
      kpiFramework: "Marco",
      kpiFrameworkHint: "+ marcos de EE. UU.",
      inventoryTitle: "Inventario de IA",
      sampleBadge: "Muestra",
      riskDistributionTitle: "Distribución de riesgo",
      systemsLabel: "sistemas",
      unlockSectionTitle: "Con tu cuenta desbloqueas",
      lockGapTitle: "Gap assessment",
      lockGapDesc:
        "Mide tu «% listo» frente a cada obligación y detecta brechas.",
      lockGapPreview: "Preparación para auditoría",
      lockPlanTitle: "Plan de acción",
      lockPlanDesc:
        "Convierte las brechas en tareas con responsables y fechas.",
      lockPlanPreview: "Tareas abiertas",
      lockWatchTitle: "Vigilancia regulatoria",
      lockWatchDesc:
        "Radar de fuentes oficiales que te avisa de cada cambio y plazo.",
      lockWatchPreviewLabel: "Próximo hito",
      lockWatchPreviewMilestone: "Transparencia (Art. 50)",
      lockWatchPreviewCountdown: "en 16 días",
      lockDossierTitle: "Dossier e informe (PDF)",
      lockDossierDesc:
        "Evidencia lista para el auditor, generada con un clic.",
      ctaTitle: "Úsalo con tus propios sistemas de IA.",
      ctaBody:
        "Crea tu cuenta gratis: inventaría tu IA y obtén su clasificación de riesgo hoy mismo. Desbloquea la preparación completa cuando quieras.",
      ctaCreate: "Crear cuenta gratis",
      ctaPlans: "Ver planes",
    },
  },
};
