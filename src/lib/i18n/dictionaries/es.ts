/**
 * Diccionario canónico (español). Define la FORMA (`type Dictionary = typeof es`).
 * `en.ts` debe satisfacer ese tipo: si falta una clave o cambia una firma, tsc falla.
 *
 * SOLO chrome de UI. Nada de contenido regulatorio determinista (ver config.ts).
 * Las cadenas con variables son funciones tipadas (interpolación sin dependencias).
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
    requestAccess: "Solicitar acceso",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
  },

  meta: {
    title: "Attesta — Gobernanza continua de IA para el mid-market",
    description:
      "Inventaría tus sistemas de IA, clasifica su riesgo (EU AI Act + EE. UU.) y genera evidencia lista para auditoría. Compliance de IA sin equipo GRC.",
    ogTitle: "Attesta — Gobernanza continua de IA",
  },

  landing: {
    hero: {
      badge: "Gobernanza de IA para Recursos Humanos · EU AI Act",
      titleLine1: "Contrata con IA",
      titleLine2: "sin miedo a la auditoría.",
      bodyBefore:
        "La IA que usas para contratar —cribado de CVs, entrevistas, scoring de candidatos— es de ",
      bodyEmphasis: "alto riesgo",
      bodyAfter:
        " bajo el EU AI Act. Attesta la inventaría, clasifica su riesgo, genera tu evidencia y vigila los cambios normativos. Sin necesitar un equipo GRC.",
      ctaPrimary: "Solicitar acceso anticipado",
      ctaSecondary: "Explorar la demo",
      footnote:
        "Más de 3 de cada 4 empresas van más rápido en IA que en su gobierno. Tú puedes ir por delante.",
    },

    heroPreview: {
      urlBar: "app.attesta.io/dashboard",
      navItems: ["Resumen", "Inventario", "Riesgo", "Vigilancia", "Equipo"],
      overviewTitle: "Resumen de gobernanza",
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
      eyebrow:
        "Para responsables de RRHH, Talent Acquisition y People Ops que usan IA para contratar",
      sectors: [
        "Cribado de CVs",
        "Entrevistas por vídeo",
        "Scoring de candidatos",
        "ATS con IA",
        "Tests automatizados",
        "Chatbots de selección",
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
          points: [
            "Descubrimiento guiado",
            "Propietario y proveedor",
            "Estado siempre al día",
          ],
        },
        {
          title: "Clasificación de riesgo",
          body: "Un asistente guiado clasifica cada sistema según el EU AI Act —inaceptable, alto, limitado o mínimo— y te dice exactamente qué obligaciones aplican, distinguiendo lo tuyo (deployer) de lo del proveedor.",
          points: [
            "Mapeo a artículos del AI Act",
            "Captura de evidencia y atestación",
            "Explicable y defendible",
          ],
        },
        {
          title: "Gap assessment y plan",
          body: "Qué te falta, priorizado por severidad, con plan de acción por artículo. Aplica un policy pack por dominio (RRHH, gestión de trabajadores, atención al cliente e IA generativa o crédito/seguros) y precarga los controles típicos del caso.",
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
            "Inventario de sistemas de IA",
            "Clasificación de riesgo (EU AI Act + EE. UU.)",
            "1 usuario",
          ],
          limits: "Sin evidencia en PDF, sin vigilancia ni plan de acción.",
          cta: "Entrar",
        },
        {
          name: "Preparación",
          price: "$120",
          unit: "/mes",
          note: "El sistema de registro de tu gobernanza",
          lead: "Todo lo del plan gratis, y además desbloqueas:",
          features: [
            "Gap assessment + plan de acción",
            "Vigilancia regulatoria continua",
            "Dossier e informe ejecutivo (PDF)",
            "Evidencia y audit-trail verificable",
            "Policy packs (5 dominios)",
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
        includedLabel: "Incluido",
        notIncludedLabel: "No incluido",
        rows: [
          "Inventario de sistemas de IA",
          "Clasificación de riesgo (EU AI Act + EE. UU.)",
          "Usuarios",
          "Gap assessment + plan de acción",
          "Vigilancia regulatoria continua",
          "Dossier e informe ejecutivo (PDF)",
          "Evidencia y audit-trail verificable",
          "Policy packs (5 dominios)",
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
          a: "No. Attesta es una herramienta de autoevaluación y preparación para auditoría: organiza tu inventario, tu clasificación de riesgo y tu evidencia. La certificación de conformidad, cuando procede, solo la emiten organismos notificados acreditados. No prestamos asesoría legal.",
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

    footer: {
      tagline:
        "Gobernanza continua de IA para el mid-market: inventario, riesgo, evidencia y vigilancia regulatoria, listos para auditoría.",
      contactHeading: "Contacto",
      rights: "© 2026 Attesta. Todos los derechos reservados.",
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

    nav: {
      overview: "Resumen",
      inventory: "Inventario",
      risk: "Riesgo",
      gap: "Gap assessment",
      plan: "Plan de acción",
      packs: "Policy packs",
      monitoring: "Vigilancia",
      team: "Equipo",
      activity: "Actividad",
      lockedTitle: "Función del plan Preparación",
      lockedLabel: "Bloqueado",
    },

    sidebar: {
      demoTitle: "Vista de demostración",
      demoBody:
        "Explora Attesta con datos de ejemplo. Crea tu cuenta para usar los tuyos.",
      backToSite: "← Volver al sitio",
    },

    account: {
      organization: "Organización",
      billing: "Plan y facturación",
      goToSite: "Ir al sitio público",
      switchAccount: "Cambiar de cuenta",
      signOut: "Cerrar sesión",
    },

    toastClose: "Cerrar notificación",

    toasts: {
      "system-created": "Sistema registrado en el inventario.",
      "system-updated": "Sistema actualizado.",
      "system-deleted": "Sistema eliminado.",
      "system-error": "No se pudo guardar el sistema. Inténtalo de nuevo.",
      seeded: "Datos de ejemplo cargados.",
      "seed-error": "No se pudieron cargar los datos de ejemplo. Inténtalo de nuevo.",
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
    },
  },
};
