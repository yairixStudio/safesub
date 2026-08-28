/* =========================================================================
   ADVISOR — the local rule-based state reading and responder. The remote
   model call lives behind a proxy (docs/ai-advisor.md); the frontend only
   ever sends the anonymous summary built here.
   ========================================================================= */
import type {Engine} from '../engine/pk';
import type {Tr} from '../i18n';
import type {Profile, Sub} from '../engine/types';
import {SEVRANK} from '../engine/types';
import {riskFor, type Risk} from '../engine/interactions';

type ById = (id:string)=>Sub|undefined;

export function recFor(tr:Tr, byId:ById, id:string): string {
  const s=byId(id); const r=tr.t('ai.recs.'+id);
  return (r && r!=='ai.recs.'+id) ? r : (s ? tr.t('ai.recsCat.'+s.c) : '');
}
export const phaseWord = (eng:Engine, tr:Tr, id:string) => eng.levelAt(id,15) > eng.nowLevel(id) ? tr.t('ai.rising') : tr.t('ai.falling');

export function worstPairNow(eng:Engine, byId:ById): {a:string; b:string; r:Risk} | null {
  const ids=eng.activeIds(); let worst:{a:string;b:string;r:Risk}|null=null;
  for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
    const r=riskFor(ids[i],ids[j],byId); if(r && (!worst||SEVRANK[r.sev]>SEVRANK[worst.r.sev])) worst={a:ids[i],b:ids[j],r};
  }
  return worst;
}

export interface Reading { time:string; profiled:boolean; empty:boolean; now?:string; next?:string; rec?:string }
const hhmm = (ms:number) => { const d=new Date(ms); return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };

export function aiRead(eng:Engine, tr:Tr, byId:ById, profile:Profile): Reading {
  const ids=eng.activeIds();
  const base={time:hhmm(eng.now), profiled:!!(profile.age||profile.weight)};
  if(!ids.length) return {...base, empty:true};
  const top=ids.slice(0,2);
  const nowTxt = top.map(id=>{ const s=byId(id)!; const f=tr.t('feel.'+s.c); return `${tr.sn(s)} ${phaseWord(eng,tr,id)}${f?tr.t('ai.mainly',f):''}`; }).join('; ')
    + (ids.length>2?tr.t('ai.more',ids.length-2):'') + '.';
  const closes=ids.map(id=>({id,left:eng.windowLeft(id)})).sort((a,b)=>a.left-b.left);
  const first=closes[0], last=closes[closes.length-1];
  const next = ids.length===1
    ? tr.t('ai.close1', tr.sn(byId(first.id)!), tr.rem(first.left))
    : tr.t('ai.closeN', tr.sn(byId(first.id)!), tr.rem(first.left), tr.sn(byId(last.id)!), tr.rem(last.left));
  const recs:string[]=[]; top.forEach(id=>{ const r=recFor(tr,byId,id); if(r) recs.push(r); });
  const wp=worstPairNow(eng,byId);
  if(wp) recs.unshift(tr.t('ai.combo', tr.sn(byId(wp.a)!), tr.sn(byId(wp.b)!), tr.sev(wp.r.sev), tr.rtxt(wp.r.k)));
  const recTxt=recs.slice(0,3).join(' · ')+'.';
  return {...base, empty:false, now:nowTxt, next, rec:recTxt.length>1?recTxt:undefined};
}

/* the ANONYMOUS summary — never the name or any identifier */
export function stateSummary(eng:Engine, tr:Tr, byId:ById, profile:Profile): string {
  const ids=eng.activeIds();
  const parts = ids.length ? ids.map(id=>{ const s=byId(id)!; return tr.t('ai.state.item', tr.sn(s), phaseWord(eng,tr,id), tr.rem(eng.windowLeft(id)), tr.hl(s.hl||s.tp)); }).join(' | ') : tr.t('ai.state.none');
  const wp=worstPairNow(eng,byId);
  const combo = wp ? tr.t('ai.state.combo', tr.sn(byId(wp.a)!), tr.sn(byId(wp.b)!), tr.sev(wp.r.sev), tr.rtxt(wp.r.k)) : '';
  const medsNote = profile.meds ? tr.t('ai.state.meds',profile.meds) : '';
  const sexLabel = profile.sex ? tr.t('profile.sex'+profile.sex.toUpperCase()) : '';
  const demo = (profile.age||profile.weight||profile.sex)
    ? tr.t('ai.state.profile',[profile.age&&tr.t('ai.state.years',profile.age),profile.weight&&tr.t('ai.state.kg',profile.weight),sexLabel].filter(Boolean).join(', ')) : '';
  return `${tr.t('ai.state.prefix')}${parts}${combo}${medsNote}${demo}.`;
}

export function localReply(eng:Engine, tr:Tr, byId:ById, profile:Profile, userText:string): string {
  const q=(userText||'').toLowerCase(); const ids=eng.activeIds();
  const has=(kws:string[])=>kws.some(k=>q.includes(k));
  if(has(tr.t('ai.local.kwAlc')) && (ids.includes('can')||ids.includes('hash')))
    return tr.t('ai.local.alcCan', tr.rem(eng.windowLeft(ids.includes('can')?'can':'hash')));
  if(has(tr.t('ai.local.kwSleep')))
    return ids.some(id=>byId(id)?.c==='caf') ? tr.t('ai.local.sleepCaf') : tr.t('ai.local.sleepFree');
  const wp=worstPairNow(eng,byId);
  if(wp) return tr.t('ai.local.worst', tr.sn(byId(wp.a)!), tr.sn(byId(wp.b)!), tr.sev(wp.r.sev), tr.rtxt(wp.r.k));
  if(!ids.length) return tr.t('ai.local.none');
  return stateSummary(eng,tr,byId,profile).replace(tr.t('ai.state.prefix'),tr.t('ai.local.byLog')) + tr.t('ai.local.tail');
}
