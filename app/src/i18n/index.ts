/* =========================================================================
   i18n — every user-facing string lives in he.ts / en.ts. Hebrew is the
   source of truth; en must mirror it key for key (enforced by the Dict type).
   Entries may be functions (called with the extra args passed to t()).
   ========================================================================= */
import {he} from './he';
import {en} from './en';
import type {Lang, Sub, Sev, Cat} from '../engine/types';

export type Dict = typeof he;
export const L: Record<Lang, Dict> = {he, en: en as unknown as Dict};

const get = (o:any, k:string) => { for(const p of k.split('.')){ if(o==null) return undefined; o=o[p]; } return o; };

/* t(lang, 'a.b.c', ...args) — resolves in the active language, falls back to Hebrew */
export function t(lang:Lang, k:string, ...args:any[]): any {
  let v=get(L[lang],k); if(v===undefined) v=get(L.he,k);
  if(typeof v==='function') return v(...args);
  return v===undefined ? k : v;
}

/* a bound translator for a given language — what components use */
export interface Tr {
  lang: Lang;
  rtl: boolean;
  t: (k:string, ...args:any[]) => any;
  rtxt: (k:string) => string;
  sn: (s:Sub) => string;
  snote: (s:Sub) => string;
  stips: (s:Sub) => string[];
  subLabel: (s:Sub, k:string|null) => string;
  unit: (s:Sub) => string;
  cat: (c:Cat) => string;
  sev: (sev:Sev) => string;
  ago: (m:number) => string;
  rem: (m:number) => string;
  hl: (min:number) => string;
  dict: Dict;
}
export function makeTr(lang:Lang): Tr {
  const tt=(k:string,...a:any[])=>t(lang,k,...a);
  const LS=(id:string)=>(L[lang].subs as any)[id]||(L.he.subs as any)[id];
  return {
    lang, rtl: L[lang].dir==='rtl', t:tt, dict:L[lang],
    rtxt:k=>tt('risk.'+k),
    sn:s=>s.n||LS(s.id)?.n||s.id,
    snote:s=>s.custom?tt('grid.customNote'):(LS(s.id)?.note||''),
    stips:s=>s.custom?tt('grid.customTips'):(LS(s.id)?.tips||[]),
    subLabel:(s,k)=>k==null?'':(LS(s.id)?.s?.[k]??k),
    unit:s=>tt('units.'+s.u),
    cat:c=>tt('cat.'+c),
    sev:sev=>tt('sev.'+sev),
    ago:m=>tt('ago',m), rem:m=>tt('rem',m), hl:min=>tt('hl',min),
  };
}

/* search haystack for a catalogue entry across both languages */
export function searchText(s:Sub): string {
  const parts=[s.id, s.n||''];
  for(const lg of ['he','en'] as Lang[]){ const d=(L[lg].subs as any)[s.id]; if(!d) continue; parts.push(d.n||'', d.q||'', ...Object.values(d.s||{}) as string[]); }
  return parts.join(' ').toLowerCase();
}
