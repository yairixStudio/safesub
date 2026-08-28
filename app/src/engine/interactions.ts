/* =========================================================================
   INTERACTION ENGINE — TripSit four-tier severity + clinical literature.
   Resolution order: explicit pair (RISK) → id × category (IDCAT) →
   category × category (CATRISK). Text keys resolve through i18n (risk.*).
   ========================================================================= */
import type {Cat, Sev, Sub} from './types';
import {RISK, IDCAT, CATRISK, MED_FLAGS} from './rules';

export interface Risk { a:string; b:string; sev:Sev; k:string }

const pairKey = (a:string,b:string) => a<b ? a+'|'+b : b+'|'+a;
const RISK_MAP = new Map<string, [string,string,Sev,string]>(RISK.map(r=>[pairKey(r[0],r[1]),r]));

function ruleRisk(A:Sub, B:Sub): [string,string,Sev,string] | null {
  for(let i=0;i<IDCAT.length;i++){ const r=IDCAT[i]; if((r[0]===A.id&&r[1]===B.c)||(r[0]===B.id&&r[1]===A.c)) return r; }
  for(let i=0;i<CATRISK.length;i++){ const r=CATRISK[i]; if((r[0]===A.c&&r[1]===B.c)||(r[0]===B.c&&r[1]===A.c)) return r; }
  return null;
}

/* the documented risk between two substances, or undefined */
export function riskFor(a:string, b:string, byId:(id:string)=>Sub|undefined): Risk | undefined {
  let r=RISK_MAP.get(pairKey(a,b));
  if(!r){ const A=byId(a), B=byId(b); if(A&&B) r=ruleRisk(A,B)||undefined; }
  return r ? {a, b, sev:r[2], k:r[3]} : undefined;
}

/* explicit documented pairs for one substance (for the learn page) */
export function explicitRisksOf(id:string): {o:string; sev:Sev; k:string}[] {
  const out:{o:string; sev:Sev; k:string}[]=[];
  for(const r of RISK){ if(r[0]!==id&&r[1]!==id) continue; out.push({o:r[0]===id?r[1]:r[0], sev:r[2], k:r[3]}); }
  return out;
}

export interface MedHit { sev:Sev; k:string }
/* meds typed into the profile that create standing risks against a substance.
   This is also how chronic meds reach the engine: a steady-state drug never
   opens a "window", so it can only flag through here. */
export function medHits(meds:string, cat:Cat): MedHit[] {
  if(!meds) return [];
  const lc=meds.toLowerCase();
  const out:MedHit[]=[];
  for(const f of MED_FLAGS){
    if(!f.kw.some(k=>lc.includes(k.toLowerCase()))) continue;
    if(f.hitsCat.includes(cat)) out.push({sev:f.sev, k:f.k});
  }
  return out;
}
