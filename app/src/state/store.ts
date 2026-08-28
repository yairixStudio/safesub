/* =========================================================================
   LOCAL STORE — everything the app remembers lives on the device.
   AsyncStorage (SQLite-backed on Android) — no account, no cloud.
   ========================================================================= */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {Entry, Profile, Settings, Sub} from '../engine/types';

export const STORE_KEY = 'safesub.v1';

export interface Persisted {
  v: 1;
  settings: Settings;
  my: string[];
  profile: Profile;
  custom: Sub[];
  log: Entry[];
}

export const EMPTY_PROFILE: Profile = {name:'', age:null, weight:null, height:null, sex:null, meds:''};
/* defaults: Hebrew, dark (product decision 2026-08-28) — both switchable in Settings */
export const DEFAULT_SETTINGS: Settings = {lang:'he', theme:'dark', onb:false};

export async function restore(): Promise<Persisted | null> {
  try{
    const raw = await AsyncStorage.getItem(STORE_KEY);
    if(!raw) return null;
    const d = JSON.parse(raw);
    return {
      v:1,
      settings:{...DEFAULT_SETTINGS, ...(d.settings||{})},
      my:Array.isArray(d.my)?d.my:[],
      profile:{...EMPTY_PROFILE, ...(d.profile||{})},
      custom:Array.isArray(d.custom)?d.custom:[],
      log:Array.isArray(d.log)?d.log.filter((e:any)=>e&&typeof e.t==='number'):[],
    };
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
