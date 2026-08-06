// vrender.mjs — deterministic HTML/CSS motion-graphics → MP4 (streams PNG frames to ffmpeg, no disk bloat)
// usage: node vrender.mjs <html> <out.mp4> [fps=30] [dur=sec] [w=1080] [h=1920] [scale=2]
// The HTML page must define a global function window.SEEK(t) that positions the timeline at time t (seconds),
// and window.DURATION (seconds). If dur arg is omitted, window.DURATION is used.
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const FFMPEG = require('@ffmpeg-installer/ffmpeg').path;
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const [htmlPath, outPath, fpsA = '30', durA = '', wA = '1080', hA = '1920', scaleA = '2'] = process.argv.slice(2);
if (!htmlPath || !outPath) { console.error('usage: node vrender.mjs <html> <out.mp4> [fps] [dur] [w] [h] [scale]'); process.exit(1); }
const fps = parseInt(fpsA, 10), width = parseInt(wA, 10), height = parseInt(hA, 10), dsf = parseFloat(scaleA);
const fileUrl = 'file://' + path.resolve(htmlPath);

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none', '--force-color-profile=srgb'],
});
const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: dsf });
await page.goto(fileUrl, { waitUntil: 'networkidle0' });
await page.evaluateHandle('document.fonts.ready');
const duration = durA ? parseFloat(durA) : await page.evaluate(() => window.DURATION || 5);
const totalFrames = Math.round(duration * fps);

// ffmpeg: read PNG stream from stdin, encode H.264 yuv420p (broadcast/social-safe)
const ff = spawn(FFMPEG, [
  '-y', '-f', 'image2pipe', '-vcodec', 'png', '-r', String(fps), '-i', '-',
  '-vf', `scale=${width}:${height}:flags=lanczos,format=yuv420p`,
  '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'medium', '-crf', '17',
  '-movflags', '+faststart', '-r', String(fps), outPath,
], { stdio: ['pipe', 'inherit', 'inherit'] });

let ffErr = null; ff.on('error', e => { ffErr = e; });
const canWrite = (buf) => new Promise((res) => { ff.stdin.write(buf) ? res() : ff.stdin.once('drain', res); });

process.stdout.write(`Rendering ${totalFrames} frames @ ${fps}fps (${duration}s, ${width}x${height}@${dsf}x)\n`);
for (let i = 0; i < totalFrames; i++) {
  const t = i / fps;
  await page.evaluate((tt) => window.SEEK(tt), t);
  const buf = await page.screenshot({ type: 'png', optimizeForSpeed: true });
  await canWrite(buf);
  if (ffErr) { console.error('ffmpeg error', ffErr); break; }
  if (i % 30 === 0) process.stdout.write(`\r  frame ${i}/${totalFrames}`);
}
ff.stdin.end();
await new Promise((res) => ff.on('close', res));
process.stdout.write(`\rDone. ${totalFrames} frames → ${outPath}\n`);
await browser.close();
