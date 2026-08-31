/* =========================================================================
   LOCAL STORE — everything the app remembers lives on the device.
   AsyncStorage (SQLite-backed on Android) — no account, no cloud.
   ========================================================================= */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {Entry, Profile, Settings, Sub} from '../engine/types';
import {EMPTY_PROFILE, DEFAULT_SETTINGS} from '../engine/types';
export {EMPTY_PROFILE, DEFAULT_SETTINGS};

export const STORE_KEY = 'safesub.v1';

export interface Persisted {
  v: 1;
  settings: Settings;
  my: string[];
  profile: Profile;
  custom: Sub[];
  log: Entry[];
}


export async function restore(): Promise<Persisted | null> {
  try{
    const raw = await AsyncStorage.getItem(STORE_KEY);
    if(!raw) return null;
    const d = JSON.parse(raw);
    const num=(v:any,def:number,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.min(max,Math.max(min,v)):def;
    const settings={...DEFAULT_SETTINGS, ...(d.settings&&typeof d.settings==='object'?d.settings:{})};
    if(settings.lang!=='he'&&settings.lang!=='en') settings.lang=DEFAULT_SETTINGS.lang;
    if(!['system','dark','light'].includes(settings.theme)) settings.theme=DEFAULT_SETTINGS.theme;
    settings.onb=!!settings.onb;
    const profileRaw=d.profile&&typeof d.profile==='object'?d.profile:{};
    const profile={...EMPTY_PROFILE,
      name:typeof profileRaw.name==='string'?profileRaw.name.slice(0,60):'',
      age:profileRaw.age==null?null:num(profileRaw.age,0,0,130)||null,
      weight:profileRaw.weight==null?null:num(profileRaw.weight,0,0,500)||null,
      height:profileRaw.height==null?null:num(profileRaw.height,0,0,280)||null,
      sex:['f','m','x'].includes(profileRaw.sex)?profileRaw.sex:null,
      meds:typeof profileRaw.meds==='string'?profileRaw.meds.slice(0,500):''};
    const custom=(Array.isArray(d.custom)?d.custom:[])
      .filter((s:any)=>s&&typeof s==='object'&&typeof s.id==='string'&&typeof s.n==='string')
      .map((s:any)=>({id:s.id, n:s.n.slice(0,60), c:'oth' as const, i:'pill', u:'unit' as const, kind:'std' as const,
        tp:num(s.tp,30,1,600), hl:num(s.hl,120,5,60000), dur:num(s.dur,120,5,60000), ev:'C' as const, s:[], custom:true as const}));
    const log=(Array.isArray(d.log)?d.log:[])
      .filter((e:any)=>e&&typeof e==='object'&&typeof e.id==='string'&&typeof e.t==='number'&&Number.isFinite(e.t))
      .map((e:any)=>({id:e.id, t:e.t, q:num(e.q,1,0.5,999), sub:typeof e.sub==='string'?e.sub:null, key:typeof e.key==='string'?e.key:'k'+e.t}));
    return {v:1, settings, my:(Array.isArray(d.my)?d.my:[]).filter((x:any)=>typeof x==='string'), profile, custom, log};
  }catch{ return null; }
}

let pending: ReturnType<typeof setTimeout> | null = null;
let last: Persisted | null = null;
/* coalesce rapid writes (qty taps, timer ticks) into one */
export function persist(p: Persisted){
  last = p;
  if(pending) return;
  pending = setTimeout(async ()=>{
    pending = null;
    try{ await AsyncStorage.setItem(STORE_KEY, JSON.stringify(last)); }catch{}
  }, 150);
}

export async function wipeStore(){
  try{ await AsyncStorage.removeItem(STORE_KEY); }catch{}
}
