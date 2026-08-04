/**
 * Aviso de cookies y almacenamiento local.
 *
 * LA POSICIÓN QUE DEFIENDE ESTE DOCUMENTO, dicha sin rodeos: Attesta no muestra
 * banner de cookies porque no usa ninguna cookie que lo exija. No hay publicidad,
 * no hay terceros midiendo, no hay cookies entre sitios. Lo que hay es sesión,
 * idioma, tema y una medición de audiencia de primera parte.
 *
 * EL ÚNICO PUNTO DISCUTIBLE, y conviene que esté escrito donde se pueda leer: el
 * identificador aleatorio de medición (`attesta_aid`). El art. 5.3 de la Directiva
 * ePrivacy exige consentimiento para almacenar información en el terminal salvo
 * que sea estrictamente necesaria para el servicio solicitado. La medición de
 * audiencia NO es estrictamente necesaria en sentido literal; varias autoridades
 * (la CNIL de forma expresa) admiten una exención para analítica de primera parte
 * si es estrictamente propia, agregada, sin cesión a terceros, sin cruce entre
 * sitios y con alcance limitado. La implementación de Attesta cumple esas
 * condiciones —sin IP, sin user-agent, sin terceros, sin cruce— y además respeta
 * la señal del navegador y ofrece rechazo explícito. Es una posición defendible,
 * no una certeza: conviene que la confirme un abogado antes de la venta a
 * clientes grandes, y por eso está descrita aquí en vez de dada por supuesta.
 *
 * La lista de abajo se escribió comprobando qué se guarda de verdad, no de
 * memoria: cookie de sesión de Supabase, `NEXT_LOCALE`, y las claves de
 * `localStorage` que usan el conmutador de tema, la telemetría y los avisos de
 * onboarding.
 */
import type { LegalDocument } from "./types";

export const COOKIES_DOC: LegalDocument = {
  id: "cookies",
  slug: { es: "cookies", en: "cookies" },
  title: {
    es: "Cookies y almacenamiento local",
    en: "Cookies and local storage",
  },
  summary: {
    es: "Todo lo que Attesta guarda en tu navegador, para qué sirve y cómo rechazar lo que es opcional.",
    en: "Everything Attesta stores in your browser, what it is for, and how to opt out of what is optional.",
  },
  updated: "2026-08-04",
  sections: [
    {
      id: "resumen",
      heading: {
        es: "1. Por qué no hay banner de cookies",
        en: "1. Why there is no cookie banner",
      },
      blocks: [
        {
          kind: "p",
          text: {
            es: "Porque no hay nada que consentir. Attesta no usa publicidad, no incrusta scripts de terceros, no comparte nada con redes sociales ni plataformas de anuncios, y no coloca ninguna cookie que permita seguirte de un sitio a otro. Lo único que se guarda en tu navegador es lo necesario para que la sesión funcione, para recordar tus preferencias y para contar visitas de forma agregada.",
            en: "Because there is nothing to consent to. Attesta does not use advertising, does not embed third-party scripts, shares nothing with social networks or ad platforms, and sets no cookie that can follow you from site to site. The only things stored in your browser are what the session needs, your preferences, and an aggregate visit count.",
          },
        },
        {
          kind: "note",
          text: {
            es: "Un banner que te obliga a rechazar cosas que no existen no protege a nadie: solo entrena a la gente a hacer clic sin leer. Preferimos no ponerlo y explicar aquí, con nombre y apellidos, todo lo que se guarda.",
            en: "A banner that makes you reject things that do not exist protects nobody: it just trains people to click without reading. We would rather leave it out and list here, by name, everything that is stored.",
          },
        },
      ],
    },
    {
      id: "necesarias",
      heading: {
        es: "2. Estrictamente necesarias",
        en: "2. Strictly necessary",
      },
      blocks: [
        {
          kind: "p",
          text: {
            es: "Sin esto la aplicación no puede funcionar. No requieren consentimiento y no se pueden desactivar sin dejar de poder usar el producto.",
            en: "Without these the application cannot work. They do not require consent and cannot be disabled while still using the product.",
          },
        },
        {
          kind: "ul",
          items: {
            es: [
              "Cookie de sesión (nombre que empieza por «sb-», puesta por Supabase): mantiene tu sesión iniciada. Es de primera parte y caduca al cerrar la sesión o al expirar.",
              "NEXT_LOCALE: recuerda si eliges español o inglés. Solo se escribe cuando cambias el idioma a mano; si no tocas nada, no se crea.",
            ],
            en: [
              "Session cookie (name starting with “sb-”, set by Supabase): keeps you signed in. It is first-party and expires when you sign out or when it lapses.",
              "NEXT_LOCALE: remembers whether you chose Spanish or English. It is only written when you change the language manually; if you do not touch it, it is never created.",
            ],
          },
        },
      ],
    },
    {
      id: "preferencias",
      heading: {
        es: "3. Preferencias (almacenamiento local, no cookies)",
        en: "3. Preferences (local storage, not cookies)",
      },
      blocks: [
        {
          kind: "p",
          text: {
            es: "No son cookies y no viajan al servidor en ninguna petición: se quedan en tu navegador.",
            en: "These are not cookies and never travel to the server in any request: they stay in your browser.",
          },
        },
        {
          kind: "ul",
          items: {
            es: [
              "theme: si prefieres el modo claro u oscuro.",
              "Marcas de avisos ya vistos: para no volver a enseñarte la guía de bienvenida o la lista de primeros pasos una vez las has cerrado.",
            ],
            en: [
              "theme: whether you prefer light or dark mode.",
              "Dismissal flags: so the welcome guide and the getting-started checklist are not shown again once you have closed them.",
            ],
          },
        },
      ],
    },
    {
      id: "medicion",
      heading: {
        es: "4. Medición de audiencia, y cómo rechazarla",
        en: "4. Audience measurement, and how to opt out",
      },
      blocks: [
        {
          kind: "p",
          text: {
            es: "Para saber qué partes del producto se usan guardamos en tu navegador un identificador aleatorio (attesta_aid). Sirve solo para distinguir «una persona que vuelve» de «cinco recargas de la misma página». No lleva tu nombre, no se cruza con ningún otro sitio, no se comparte con nadie y no se envía a ningún tercero: los eventos van a nuestro propio servidor.",
            en: "To learn which parts of the product are used we store a random identifier in your browser (attesta_aid). It only serves to tell “a returning person” apart from “five reloads of the same page”. It carries no name, is not combined with any other site, is shared with no one, and is sent to no third party: events go to our own server.",
          },
        },
        {
          kind: "p",
          text: {
            es: "Junto a cada evento se registra su nombre, la ruta visitada y el idioma. No se registra tu dirección IP, ni tu user-agent, ni la resolución de pantalla, ni ningún otro dato que permita reconstruir quién eres.",
            en: "Alongside each event we record its name, the path visited and the language. We do not record your IP address, user-agent, screen resolution, or anything else that could reconstruct who you are.",
          },
        },
        {
          kind: "note",
          text: {
            es: "Se respeta automáticamente la señal de tu navegador: si tienes activado Global Privacy Control o Do Not Track, no se emite ningún evento y no hace falta que hagas nada más. También puedes rechazarla explícitamente con el botón de esta página, o borrar el identificador vaciando el almacenamiento del sitio.",
            en: "Your browser's signal is honoured automatically: if you have Global Privacy Control or Do Not Track enabled, no event is emitted and you need do nothing further. You can also opt out explicitly with the button on this page, or delete the identifier by clearing the site's storage.",
          },
        },
      ],
    },
    {
      id: "terceros",
      heading: {
        es: "5. Lo que NO hay",
        en: "5. What is NOT here",
      },
      blocks: [
        {
          kind: "ul",
          items: {
            es: [
              "Sin Google Analytics, sin píxel de Meta, sin LinkedIn Insight, sin ninguna plataforma de analítica de terceros.",
              "Sin cookies publicitarias ni de perfilado, y sin venta ni cesión de datos con fines comerciales.",
              "Sin fuentes ni scripts cargados desde dominios ajenos: todo se sirve desde el propio sitio.",
              "Sin botones de redes sociales incrustados (los enlaces del pie son enlaces normales, no widgets que te sigan).",
            ],
            en: [
              "No Google Analytics, no Meta pixel, no LinkedIn Insight, no third-party analytics platform of any kind.",
              "No advertising or profiling cookies, and no sale or sharing of data for commercial purposes.",
              "No fonts or scripts loaded from external domains: everything is served from the site itself.",
              "No embedded social buttons (the footer links are plain links, not widgets that track you).",
            ],
          },
        },
        {
          kind: "p",
          text: {
            es: "Si contratas un plan de pago, la pasarela de Stripe carga sus propios scripts en la pantalla de pago; eso ocurre solo ahí y se rige por la política de privacidad de Stripe, enlazada en la página de subprocesadores.",
            en: "If you subscribe to a paid plan, the Stripe checkout loads its own scripts on the payment screen; that happens only there and is governed by Stripe's privacy policy, linked from the subprocessors page.",
          },
        },
      ],
    },
  ],
};
