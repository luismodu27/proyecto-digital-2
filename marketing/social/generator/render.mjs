import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

// args: node render.mjs <html> <out.png> [width] [height] [scale] [addClass]
const [htmlPath, outPath, w = '1080', h = '1350', scale = '2', addClass = ''] = process.argv.slice(2);
if (!htmlPath || !outPath) {
  console.error('usage: node render.mjs <html> <out.png> [w] [h] [scale]');
  process.exit(1);
}
const width = parseInt(w, 10);
const height = parseInt(h, 10);
const deviceScaleFactor = parseFloat(scale);

const fileUrl = 'file://' + path.resolve(htmlPath);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
});
const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor });
await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 60000 });
if (addClass) {
  await page.evaluate((cls) => {
    const el = document.querySelector('.canvas') || document.querySelector('.pano');
    if (el) cls.split(/\s+/).filter(Boolean).forEach((c) => el.classList.add(c));
  }, addClass);
}
// ensure all @font-face are loaded and painted
await page.evaluate(async () => { await document.fonts.ready; });
await new Promise((r) => setTimeout(r, 300));
await page.screenshot({
  path: outPath,
  clip: { x: 0, y: 0, width, height },
  type: 'png',
});
await browser.close();
console.log('rendered', outPath, `${width * deviceScaleFactor}x${height * deviceScaleFactor}`);
