# Attesta · Pack de VIDEO

Videos de marca en **motion-graphics**, con la **identidad real de la web** de Attesta
(mismas fuentes Fraunces + Geist, paleta exacta de `src/app/globals.css`, mockups reales del
producto —dashboard, bandeja del validador, gap/dossier—, rejilla técnica de fondo y el
easing de las animaciones del sitio). **Silencio + subtítulos cinéticos** (pensados para feeds
que autoreproducen en mudo; "music-ready" para añadir pista después).

## Qué hay aquí

Cinco videos, cada uno en **3 formatos × 2 temas** = 6 archivos:

| Video | Superficie del producto | Tema base |
|---|---|---|
| **intro-web** — «Contrata con IA sin miedo a la auditoría» | Dashboard (tour con cursor) | claro |
| **foso-web** — «Cero alucinaciones. Por diseño.» | Bandeja del validador + 3 pilares | oscuro |
| **auditable-web** — «De 0 a auditable en una tarde» | Gap (medidor) + dossier | claro |
| **reloj-web** — «El reloj del EU AI Act» | Timeline de plazos (Feb 2025 → Dic 2027) | oscuro |
| **marcos-web** — «Un radar, todos tus marcos» | Radar multi-marco (EU + EE.UU.) | claro |

Formatos: `story` (9:16, 1080×1920) · `square` (1:1, 1080×1080) · `wide` (16:9, 1920×1080).
Temas: `light` · `dark`. Nombre: `{video}-{formato}-{tema}.mp4`.

Captions listos para pegar + hashtags + notas de datos → **`CAPTIONS.md`**.

## Cómo se generan (reproducible)

Pipeline HTML/CSS/JS animado → captura cuadro a cuadro en Chromium → codificación H.264 con
ffmpeg. Determinista, sin herramientas externas ni stock.

```
generator/
  web.css            # espejo de globals.css (tokens, rejilla, tarjetas, badges) + @font-face
  vlib.js            # timeline: easings (incl. el cubic-bezier del sitio) + helpers
  scenes/*-web.html  # cada video (theme+formato por query: ?fmt=story&theme=light)
  vrender.mjs        # render 1 escena → mp4 (streaming a ffmpeg, sin llenar disco)
  render-matrix.mjs  # render de toda la matriz (videos × formatos × temas)
  shot.mjs           # captura de fotogramas estáticos (QA)
  fonts/ assets/     # woff2 + sello (sealmark)
```

Regenerar todo:
```bash
cd generator && npm i puppeteer-core @ffmpeg-installer/ffmpeg    # deps (registry npm)
# Chromium: usa el del sistema (ver CHROME en vrender.mjs/shot.mjs) o PLAYWRIGHT_BROWSERS_PATH
node render-matrix.mjs intro-web,foso-web,auditable-web,reloj-web,marcos-web story,square,wide light,dark 3
```
Una sola variante: `node vrender.mjs "scenes/intro-web.html?fmt=story&theme=light" out.mp4 30 "" 1080 1920 1`

## Reglas de copy (innegociables)
Attesta = autoevaluación + preparación para auditoría + gestión de evidencia. **No certifica.**
Prohibido: certifica/cumple/compliant/garantiza/aprobado/sello de conformidad/marcado CE/
"auditado por Attesta"/libre de riesgo/asesoría legal. Clasificación siempre "orientativa";
puntaje = "% listo/preparación", nunca "% cumplimiento". Verbos de la organización.
Todo el pack se verificó con el experto de compliance y contra la web en vivo (jul-2026).
