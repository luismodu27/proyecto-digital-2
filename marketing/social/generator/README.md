# Generador de imágenes de redes

Cada pieza es **HTML/CSS** renderizado con **Chromium (puppeteer-core)** a PNG. Control
tipográfico total, hex exactos y texto de marca integrado.

## Requisitos

```bash
npm i puppeteer-core        # usa un Chromium ya instalado (ver CHROME en render.mjs)
pip install Pillow          # solo para (re)procesar el logo y cortar carruseles
```

`render.mjs` apunta a un binario de Chromium en `CHROME`. Ajusta esa ruta a tu entorno
(p. ej. la de Chrome/Chromium instalado o el de Playwright).

## Estructura

- `brand.css` — sistema de diseño (tokens, fuentes, componentes). Espejo de `globals.css`.
- `fonts/` — Fraunces (display, varios pesos), Geist y Geist Mono (woff2).
- `assets/` — `sealmark.png` / `sealmark-dark.png` (logo real, claro/oscuro).
- `posts/` — un `.html` por pieza. Los `*-pano.html` son carruseles (lienzo de 4320×1350).
- `process_logo.py` — genera variantes del sello desde el PNG original (opcional).

## Render de un post suelto (4:5, 2×)

```bash
node render.mjs posts/01-dato.html 01-dato.png 1080 1350 2
```

## Render de un carrusel conectado (lienzo continuo → 4 slides)

```bash
node render.mjs posts/QUIEN-pano.html quien-full.png 4320 1350 2   # 8640×2700
python3 - <<'PY'
from PIL import Image
im=Image.open('quien-full.png'); W=2160
for i in range(4): im.crop((i*W,0,(i+1)*W,2700)).save(f'quien-{i+1}.png')
PY
```

## Crear un post nuevo

Copia un `.html` de `posts/` como plantilla, edita el texto/estructura reutilizando las
clases de `brand.css` (`.headline`, `.kicker`, `.lead`, `.tag`, `.stat`, `.seal`…) y renderiza.
Para modo oscuro, añade la clase `dark` al `.canvas`. Respeta SIEMPRE las reglas de copy.
