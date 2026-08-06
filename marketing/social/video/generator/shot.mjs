// shot.mjs — grab static frames at given times for QA. usage: node shot.mjs <html> <outdir> <w> <h> <scale> <t1,t2,...>
import puppeteer from 'puppeteer-core';
import path from 'node:path';
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const [htmlPath, outDir, wA='1080', hA='1920', scaleA='1', times=''] = process.argv.slice(2);
const width=parseInt(wA,10), height=parseInt(hA,10), dsf=parseFloat(scaleA);
const ts = times.split(',').map(parseFloat).filter(x=>!isNaN(x));
const browser = await puppeteer.launch({executablePath:CHROME,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--font-render-hinting=none','--force-color-profile=srgb']});
const page = await browser.newPage();
await page.setViewport({width,height,deviceScaleFactor:dsf});
await page.goto('file://'+path.resolve(htmlPath),{waitUntil:'networkidle0'});
await page.evaluateHandle('document.fonts.ready');
for(const t of ts){ await page.evaluate(tt=>window.SEEK(tt),t); await page.screenshot({path:path.join(outDir,`f_${t}.png`),type:'png'}); }
await browser.close();
console.log('shots:',ts.join(', '));
