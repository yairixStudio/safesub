/* =========================================================================
   PK GOLDEN TEST  —  node test/run.mjs

   Pulls the substance data and the PK engine straight out of demo-reference.html
   (so it tests the shipped code, not a copy), runs them against a frozen log
   covering every model kind, and compares to test/golden-pk.json — the curves as
   they were before the 2026-08-26 performance refactor.

   Any diff means the curves moved. The curves are the product; nothing in the UI
   would tell you they had shifted. Run this after touching:
     prep() · levelAt() · windowLeft() · activeIds() · todayCount() · SUBS
   If a change to SUBS or the model is intentional, re-baseline deliberately:
     node test/run.mjs --update
   ========================================================================= */
import {readFileSync, writeFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import {LOG, NOW, IDS} from './fixture.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const DEMO = join(here, '..', 'demo-reference.html');
const GOLD = join(here, 'golden-pk.json');

/* ---- extract the two live source blocks from the demo ---- */
const js = /<script>([\s\S]*)<\/script>/.exec(readFileSync(DEMO, 'utf8'))[1];
const lines = js.split('\n');
const at = (pred, from = 0) => {
  const i = lines.findIndex((l, k) => k >= from && pred(l));
  if (i < 0) throw new Error('anchor not found in demo-reference.html — did the section headings change?');
  return i;
};
const a0 = at(l => l.startsWith('const C = {nic:'));
const a1 = at(l => l.startsWith('/* category-level emergency signs */'), a0);
const b0 = at(l => l.includes('PER-CYCLE CACHES')) - 1;
const b1 = at(l => l.startsWith('/* ================= substances grid'), b0);

const mod = `
let LOG = [], NOW = 0;
const PROFILE = {meds:''};
let _dayStart=0,_dayEnd=0,_prevStart=0;
function markDay(){
  const d=new Date(NOW); d.setHours(0,0,0,0); _dayStart=d.getTime();
  d.setDate(d.getDate()+1); _dayEnd=d.getTime();
  d.setDate(d.getDate()-2); _prevStart=d.getTime();
}
${lines.slice(a0, a1).join('\n')}
${lines.slice(b0, b1).join('\n').replace('function invalidate(){ NOW=Date.now(); markDay();',
                                         'function invalidate(){ markDay();')}
export function run(log, now, ids){
  LOG = log; NOW = now; invalidate();
  const out = {levels:{}, windows:{}, today:{}, active:null};
  for(const id of ids){
    const row=[];
    for(let tau=-240; tau<=720; tau+=5) row.push(levelAt(id,tau));
    out.levels[id]=row; out.windows[id]=windowLeft(id); out.today[id]=todayCount(id);
  }
  out.active = activeIds();
  return out;
}`;
const {run} = await import('data:text/javascript;base64,' + Buffer.from(mod).toString('base64'));
const got = run(LOG, NOW, IDS);

if (process.argv.includes('--update')) {
  writeFileSync(GOLD, JSON.stringify(got));
  console.log('golden-pk.json re-baselined. Make sure you meant to.');
  process.exit(0);
}

/* ---- compare ---- */
const want = JSON.parse(readFileSync(GOLD, 'utf8'));
let bad = 0, maxDiff = 0, n = 0;
const fail = m => { if (bad < 8) console.log('  ' + m); bad++; };

for (const id of Object.keys(want.levels)) {
  const a = want.levels[id], b = got.levels[id] || [];
  if (a.length !== b.length) { fail(`${id}: ${a.length} samples expected, got ${b.length}`); continue; }
  for (let i = 0; i < a.length; i++) {
    const d = Math.abs(a[i] - b[i]); n++;
    if (d > maxDiff) maxDiff = d;
    if (d > 1e-9) fail(`level ${id}[tau=${-240 + i * 5}] ${a[i]} -> ${b[i]}`);
  }
}
/* windowLeft is quantised to 10-minute marks, so allow one step of slack */
for (const id of Object.keys(want.windows)) {
  const d = Math.abs(want.windows[id] - got.windows[id]);
  if (d > 10) fail(`window ${id} ${want.windows[id]} -> ${got.windows[id]}`);
}
for (const id of Object.keys(want.today))
  if (want.today[id] !== got.today[id]) fail(`todayCount ${id} ${want.today[id]} -> ${got.today[id]}`);
if (want.active.join() !== got.active.join()) fail(`activeIds [${want.active}] -> [${got.active}]`);

console.log(`${n} curve samples across ${Object.keys(want.levels).length} substances, max drift ${maxDiff}`);
console.log(bad ? `FAIL — ${bad} mismatch(es)` : 'PASS — curves unchanged');
process.exit(bad ? 1 : 0);
