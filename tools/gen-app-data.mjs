/* =========================================================================
   Generates app/src data modules straight from demo-reference.html, the
   single source of truth for the catalogue, rules, dictionaries and icons.

     node tools/gen-app-data.mjs         # writes app/src/{engine,i18n,ui} data files
     node tools/gen-app-data.mjs --check # writes nothing; fails if outputs would change

   Content changes therefore go: demo-reference.html → this tool → app.
   (Same philosophy as test/run.mjs: test the shipped demo, not a copy.)
   ========================================================================= */
import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';

const here = dirname(fileURLToPath(import.meta.url));
const DEMO = join(here, '..', 'demo-reference.html');
const OUT = join(here, '..', 'app', 'src');
const CHECK = process.argv.includes('--check');

const js = /<script>([\s\S]*)<\/script>/.exec(readFileSync(DEMO, 'utf8'))[1];
const lines = js.split('\n');
const at = (pred, from = 0) => {
  const i = lines.findIndex((l, k) => k >= from && pred(l));
  if (i < 0) throw new Error('anchor not found in demo-reference.html');
  return i;
};

/* ---- data blocks (icons + catalogue + rules), evaluated as a module ---- */
const d0 = at(l => l.startsWith('const I = {'));
const d1 = at(l => l.startsWith('/* ================= state: empty first run'), d0);
const dataMod = lines.slice(d0, d1).join('\n') + '\nexport {I, C, SUBS, RISK, IDCAT, CATRISK, MED_FLAGS, RESOURCES};';
const {I, C, SUBS, RISK, IDCAT, CATRISK, MED_FLAGS, RESOURCES} =
  await import('data:text/javascript;base64,' + Buffer.from(dataMod).toString('base64'));

/* ---- dictionaries: text transform (functions must survive verbatim) ---- */
const l0 = at(l => l.startsWith('const L = {};'));
const lHe1 = at(l => l.startsWith('L.en = {'), l0);
const lEn1 = at(l => l.startsWith('/* ================= i18n runtime'), lHe1);
const heSrc = lines.slice(l0 + 1, lHe1).join('\n').replace(/^L\.he = \{/, 'export const he = {');
const enSrc = lines.slice(lHe1, lEn1).join('\n').replace(/^L\.en = \{/, 'export const en = {');
if (!heSrc.startsWith('export const he = {') || !enSrc.startsWith('export const en = {'))
  throw new Error('dictionary transform failed');

const HDR = '/* GENERATED from demo-reference.html by tools/gen-app-data.mjs — edit the demo, then regenerate. */\n';
const j = v => JSON.stringify(v);
const outputs = [];

/* catalogue */
{
  let cat = HDR + `import type {Sub, Cat} from './types';\n\n`;
  cat += `/* category tints */\nexport const C: Record<Cat,string> = ${JSON.stringify(C)};\n\n`;
  cat += `/* SUBSTANCE CATALOGUE — language-neutral PK records (names/notes live in i18n).\n   tp = time-to-peak (min), hl = half-life (min), dur = acute window (min),\n   ev = evidence strength A/B/C. Every value is a population average. NO dosing data. */\nexport const SUBS: Sub[] = [\n`;
  for (const s of SUBS) cat += '  ' + j(s) + ',\n';
  cat += '];\n';
  outputs.push(['engine/catalog.ts', cat]);
}
/* rules */
{
  let r = HDR + `import type {Cat, Sev} from './types';\n\n`;
  r += `/* explicit pairs: [idA, idB, severity, textKey] */\nexport const RISK: [string,string,Sev,string][] = [\n` + RISK.map(x => '  ' + j(x) + ',').join('\n') + '\n];\n\n';
  r += `/* one substance against a whole category */\nexport const IDCAT: [string,Cat,Sev,string][] = [\n` + IDCAT.map(x => '  ' + j(x) + ',').join('\n') + '\n];\n\n';
  r += `/* category against category — the safety net */\nexport const CATRISK: [Cat,Cat,Sev,string][] = [\n` + CATRISK.map(x => '  ' + j(x) + ',').join('\n') + '\n];\n\n';
  r += `/* meds typed into the profile that create standing risks (substring match) */\nexport const MED_FLAGS: {kw:string[]; hitsCat:Cat[]; sev:Sev; k:string}[] = [\n` + MED_FLAGS.map(x => '  ' + j(x) + ',').join('\n') + '\n];\n\n';
  r += `export const RESOURCES: {id:string; tel:string; href:string}[] = ${j(RESOURCES)};\n`;
  outputs.push(['engine/rules.ts', r]);
}
/* icons → primitives */
{
  function parseEls(str) {
    const out = []; const re = /<(path|rect|circle|g)\b([^>]*?)(\/>|>)/g; let m;
    while ((m = re.exec(str))) {
      const tag = m[1], attrs = {};
      for (const a of m[2].matchAll(/([a-z-]+)="([^"]*)"/g)) attrs[a[1]] = a[2];
      if (tag === 'g') { const end = str.indexOf('</g>', re.lastIndex); out.push({t: 'g', transform: attrs.transform, el: parseEls(str.slice(re.lastIndex, end))}); re.lastIndex = end + 4; continue; }
      if (tag === 'path') out.push({t: 'path', d: attrs.d});
      else if (tag === 'rect') out.push({t: 'rect', x: +attrs.x, y: +attrs.y, w: +attrs.width, h: +attrs.height, rx: attrs.rx ? +attrs.rx : 0});
      else if (tag === 'circle') out.push({t: 'circle', cx: +attrs.cx, cy: +attrs.cy, r: +attrs.r});
    }
    return out;
  }
  /* extra UI icons that exist only in the app */
  const EXTRA = {
    chevR: [{t:'path', d:'m9 6 6 6-6 6'}],
    chevD: [{t:'path', d:'m6 9 6 6 6-6'}],
    gear: [{t:'circle',cx:12,cy:12,r:3},{t:'path',d:'M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z'}],
    user: [{t:'circle',cx:12,cy:8.5,r:3.6},{t:'path',d:'M4.8 20a7.2 7.2 0 0 1 14.4 0'}],
    send: [{t:'path',d:'M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z'}],
    close: [{t:'path',d:'m6 6 12 12M18 6 6 18'}],
    search: [{t:'circle',cx:10.5,cy:10.5,r:6.5},{t:'path',d:'m15.5 15.5 4 4'}],
    lock: [{t:'rect',x:4,y:10.5,w:16,h:10,rx:2},{t:'path',d:'M8 10.5V7a4 4 0 0 1 8 0v3.5'}],
    warn: [{t:'path',d:'M12 3.5 21.5 20h-19L12 3.5Z'},{t:'path',d:'M12 10v4.2M12 17.2v.1'}],
    sparkle: [{t:'path',d:'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z'},{t:'path',d:'M18.5 16.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z'}],
    chat: [{t:'path',d:'M21 12.5c0 4.1-4 7.5-9 7.5-1.1 0-2.2-.16-3.2-.46L3.5 21l1.4-3.6C3.7 16 3 14.3 3 12.5 3 8.4 7 5 12 5s9 3.4 9 7.5Z'}],
  };
  const icons = {}; for (const [k, v] of Object.entries(I)) icons[k] = parseEls(v);
  Object.assign(icons, EXTRA);
  let ic = HDR + `export type IconEl = {t:'path';d:string}|{t:'rect';x:number;y:number;w:number;h:number;rx:number}|{t:'circle';cx:number;cy:number;r:number}|{t:'g';transform?:string;el:IconEl[]};\nexport const ICONS: Record<string, IconEl[]> = {\n`;
  for (const [k, v] of Object.entries(icons)) ic += `  ${j(k)}: ${j(v)},\n`;
  ic += '};\n';
  outputs.push(['ui/icons.ts', ic]);
}
/* dictionaries */
outputs.push(['i18n/he.ts', '// @ts-nocheck — pure data file; typed structurally through Dict in ./index.ts\n' + HDR + heSrc + '\n']);
outputs.push(['i18n/en.ts', '// @ts-nocheck — pure data file; must mirror he.ts key for key (checked by Dict)\n' + HDR + enSrc + '\n']);

let changed = 0;
for (const [rel, content] of outputs) {
  const p = join(OUT, rel);
  const prev = existsSync(p) ? readFileSync(p, 'utf8') : '';
  if (prev === content) continue;
  changed++;
  if (CHECK) { console.error('would change: app/src/' + rel); continue; }
  mkdirSync(dirname(p), {recursive: true});
  writeFileSync(p, content);
  console.log('wrote app/src/' + rel);
}
if (CHECK && changed) { console.error(`--check: ${changed} file(s) out of date`); process.exit(1); }
console.log(changed ? `${changed} file(s) regenerated` : 'app data is in sync with the demo');
