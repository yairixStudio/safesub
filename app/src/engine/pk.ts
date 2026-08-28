/* =========================================================================
   PK ENGINE — port of the demo's prep()/levelAt()/windowLeft()/activeIds()/
   todayCount() block. The maths is identical (verified against
   test/golden-pk.json by __tests__/pk.golden.test.ts). Instead of module-level
   caches keyed on a global NOW, an engine instance is built per render cycle
   from (log, now) and memoises internally.
   ========================================================================= */
import type {Entry, Sub} from './types';

const KIND = {std:0, zero:1, edible:2} as const;
const MG = 'mg';
const EMPTY: never[] = [];

interface Prepped { ageNow:number; kind:number; tp:number; hl:number; df:number; clearMin:number; end:number }

export interface Engine {
  now: number;
  dayStart: number; dayEnd: number; prevStart: number;
  isToday(t:number): boolean;
  isYesterday(t:number): boolean;
  mins(t:number): number;
  levelAt(id:string, tau:number): number;
  nowLevel(id:string): number;
  windowLeft(id:string): number;
  activeIds(): string[];
  todayCount(id:string): number;
  entriesBy(id:string): Entry[];
  inWindowCount(id:string): number;
  closeAt(id:string): number;
  sparkFor(id:string): {d:string; nx:number; ny:number} | null;
  earliestActive(id:string): number;
}

export const r1 = (v:number) => Math.round(v*10)/10;

export function makeEngine(log: Entry[], now: number, byId: (id:string)=>Sub|undefined): Engine {
  /* local-midnight bounds, DST-correct */
  const d = new Date(now); d.setHours(0,0,0,0); const dayStart = d.getTime();
  d.setDate(d.getDate()+1); const dayEnd = d.getTime();
  d.setDate(d.getDate()-2); const prevStart = d.getTime();

  /* prep(): flatten each entry once into the scalars the PK loop needs */
  const prep = new Map<string, Prepped[]>(), today = new Map<string, number>(), rawBy = new Map<string, Entry[]>();
  for(let i=0;i<log.length;i++){
    const e=log[i], s0=byId(e.id);
    if(!s0) continue;
    let raw=rawBy.get(e.id); if(!raw){ raw=[]; rawBy.set(e.id,raw); } raw.push(e);
    const t=e.t;
    if(t>=dayStart && t<dayEnd) today.set(e.id,(today.get(e.id)||0)+(s0.u===MG?1:e.q));
    if(s0.kind==='chronic') continue;
    /* the sub-type morph */
    let tp=s0.tp, hl=s0.hl, kind:number=KIND[s0.kind as keyof typeof KIND]??0;
    if(s0.editSub && e.sub===s0.editSub){
      if(s0.id==='can') kind=2;                    /* edible absorption lag */
      else if(s0.id==='mph'){ tp=120; hl=360; }    /* LA / concerta */
    }
    const df = (s0.u===MG && s0.def) ? Math.min(2.4, e.q/s0.def) : Math.min(2.4, .6+.4*e.q);
    const clearMin = kind===1 ? e.q*90/(s0.rate||1) : 0;   /* ~90 min per unit */
    const end = kind===1 ? clearMin+tp+30 : tp+(hl||180)*6;
    let a=prep.get(e.id); if(!a){ a=[]; prep.set(e.id,a); }
    a.push({ageNow:(now-t)/60000, kind, tp, hl:hl||180, df, clearMin, end});
  }
  const prepped = (id:string): Prepped[] => prep.get(id)||EMPTY;

  /* relative intensity at tau minutes from now (tau may be negative) */
  function levelAt(id:string, tau:number): number {
    const a=prepped(id); let v=0;
    for(let i=0;i<a.length;i++){
      const p=a[i], age=p.ageNow+tau;
      if(age<=0||age>=p.end) continue;
      if(p.kind===1){                       /* zero-order: linear clearance (alcohol) */
        if(age<=p.tp) v+=p.df*(age/p.tp);
        else { const f=1-(age-p.tp)/p.clearMin; if(f>0) v+=p.df*f; }
      }else if(p.kind===2){                 /* edible: delayed onset, stretched peak */
        if(age<60) v+=p.df*(age/60)*.25;
        else if(age<150) v+=p.df*(.25+.75*(age-60)/90);
        else v+=p.df*Math.exp(-Math.LN2*(age-150)/p.hl);
      }else{                                /* first-order: linear rise, exp decay */
        if(age<=p.tp) v+=p.df*(age/p.tp);
        else v+=p.df*Math.exp(-Math.LN2*(age-p.tp)/p.hl);
      }
    }
    return v;
  }
  const nowLevel = (id:string) => levelAt(id,0);

  /* first 10-minute mark below threshold, walking only to the analytic horizon */
  const wl = new Map<string, number>();
  function windowLeft(id:string): number {
    const hit=wl.get(id); if(hit!==undefined) return hit;
    let r=0;
    if(nowLevel(id)>=.06){
      const a=prepped(id);
      let maxEnd=0;
      for(let i=0;i<a.length;i++){ const e=a[i].end-a[i].ageNow; if(e>maxEnd) maxEnd=e; }
      r=1440;
      for(let tau=0;tau<=1440;tau+=10){
        if(tau>=maxEnd||levelAt(id,tau)<.06){ r=tau; break; }
      }
    }
    wl.set(id,r); return r;
  }

  let act: string[] | null = null;
  function activeIds(): string[] {
    if(act) return act;
    const lv=new Map<string, number>();
    for(const id of prep.keys()){ const v=levelAt(id,0); if(v>=.06) lv.set(id,v); }
    return act=[...lv.keys()].sort((a,b)=>lv.get(b)!-lv.get(a)!);
  }
  const todayCount = (id:string) => today.get(id)||0;
  const entriesBy = (id:string): Entry[] => rawBy.get(id)||EMPTY;

  /* ---- tile reads (on top of the engine, no change to the maths) ---- */
  /* doses still inside the model window */
  function inWindowCount(id:string): number {
    const a=prepped(id); let n=0;
    for(let i=0;i<a.length;i++){ const p=a[i]; if(p.ageNow>=0 && p.ageNow<p.end) n++; }
    return n;
  }
  /* windowLeft() opens only once the level crosses .06 — the rising phase counts too */
  function closeAt(id:string): number {
    const w=windowLeft(id); if(w>0) return w;
    let seen=false;
    for(let tau=0;tau<=1440;tau+=10){ const v=levelAt(id,tau); if(v>=.06) seen=true; else if(seen) return tau; }
    return seen?1440:0;
  }
  function earliestActive(id:string): number {
    const a=prepped(id); let t0=0;
    for(let i=0;i<a.length;i++){ const p=a[i]; if(p.ageNow>=0 && p.ageNow<p.end && -p.ageNow<t0) t0=-p.ageNow; }
    return t0;
  }
  /* whole curve from the earliest still-active dose to the window close, in a 100×100 box */
  function sparkFor(id:string){
    const a=prepped(id); if(!a.length) return null;
    const t1=closeAt(id); if(t1<=0) return null;
    const t0=earliestActive(id);
    const span=t1-t0; if(span<=0) return null;
    const N=40, ys=new Array<number>(N+1); let ymax=0;
    for(let k=0;k<=N;k++){ const v=levelAt(id,t0+span*k/N); ys[k]=v; if(v>ymax) ymax=v; }
    if(ymax<=0) return null;
    const X=(k:number)=>r1(100*k/N), Y=(v:number)=>r1(100-92*v/ymax);
    let dd='M'+X(0)+' '+Y(ys[0]); for(let k=1;k<=N;k++) dd+='L'+X(k)+' '+Y(ys[k]);
    return {d:dd, nx:r1(100*(0-t0)/span), ny:Y(levelAt(id,0))};
  }

  return {
    now, dayStart, dayEnd, prevStart,
    isToday:(t)=>t>=dayStart && t<dayEnd,
    isYesterday:(t)=>t>=prevStart && t<dayStart,
    mins:(t)=>(now-t)/60000,
    levelAt, nowLevel, windowLeft, activeIds, todayCount, entriesBy, inWindowCount, closeAt, sparkFor, earliestActive,
  };
}
