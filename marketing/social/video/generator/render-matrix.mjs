// render-matrix.mjs — render selected scenes × formats × themes with limited concurrency.
// usage: node render-matrix.mjs [scenes=intro,foso,auditable] [formats=story,square,wide] [themes=light,dark] [conc=2]
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
const A = process.argv.slice(2);
const scenes  = (A[0]||'intro-web,foso-web,auditable-web').split(',');
const formats = (A[1]||'story,square,wide').split(',');
const themes  = (A[2]||'light,dark').split(',');
const CONC = parseInt(A[3]||'2',10);
const DIM = { story:[1080,1920], square:[1080,1080], wide:[1920,1080] };
mkdirSync('out/final', { recursive: true });

const jobs = [];
for (const s of scenes) for (const f of formats) for (const th of themes) {
  const [w,h] = DIM[f];
  jobs.push({ label:`${s}-${f}-${th}`, args:[
    'vrender.mjs', `scenes/${s}.html?fmt=${f}&theme=${th}`, `out/final/${s}-${f}-${th}.mp4`,
    '30','', String(w), String(h), '1'
  ]});
}
console.log(`${jobs.length} jobs, concurrency ${CONC}`);
let idx = 0, done = 0;
function runOne(job){
  return new Promise((res)=>{
    const t0 = Date.now();
    const p = spawn('node', job.args, { stdio:['ignore','ignore','ignore'] });
    p.on('close', (code)=>{ done++; console.log(`[${done}/${jobs.length}] ${job.label} ${code===0?'OK':'FAIL('+code+')'}`); res(); });
  });
}
async function worker(){ while(idx<jobs.length){ const j=jobs[idx++]; await runOne(j); } }
await Promise.all(Array.from({length:CONC},()=>worker()));
console.log('MATRIX DONE');
