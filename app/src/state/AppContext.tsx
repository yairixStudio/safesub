/* =========================================================================
   APP STATE — one context: journal, list, profile, settings, custom
   substances, plus the derived engine / translator / theme for this cycle.
   Every mutation persists (coalesced) to the device store.
   ========================================================================= */
import React, {createContext, useContext, useEffect, useMemo, useReducer, useRef, useState, useCallback} from 'react';
import {AppState, useColorScheme} from 'react-native';
import type {Entry, Lang, Profile, Settings, Sub, Theme} from '../engine/types';
import {SUBS} from '../engine/catalog';
import {makeEngine, type Engine} from '../engine/pk';
import {makeTr, type Tr} from '../i18n';
import {DARK, LIGHT, type Colors} from '../theme/tokens';
import {restore, persist, wipeStore, EMPTY_PROFILE, DEFAULT_SETTINGS} from './store';

interface State {
  ready: boolean;
  log: Entry[];
  my: string[];
  profile: Profile;
  settings: Settings;
  custom: Sub[];
}
type Action =
  | {t:'restore'; s:Partial<State>}
  | {t:'log'; log:Entry[]}
  | {t:'my'; my:string[]}
  | {t:'custom'; custom:Sub[]}
  | {t:'profile'; profile:Profile}
  | {t:'settings'; settings:Partial<Settings>}
  | {t:'wipe'};

const initial: State = {ready:false, log:[], my:[], profile:EMPTY_PROFILE, settings:DEFAULT_SETTINGS, custom:[]};
function reducer(s:State, a:Action): State {
  switch(a.t){
    case 'restore': return {...s, ...a.s, ready:true};
    case 'log': return {...s, log:a.log};
    case 'my': return {...s, my:a.my};
    case 'custom': return {...s, custom:a.custom};
    case 'profile': return {...s, profile:a.profile};
    case 'settings': return {...s, settings:{...s.settings, ...a.settings}};
    case 'wipe': return {...s, log:[], my:[], custom:[], profile:EMPTY_PROFILE, settings:{...s.settings, onb:false}};
  }
}

export interface Dir { rtl:boolean; row:'row'|'row-reverse'; textAlign:'left'|'right'; start:'left'|'right'; end:'left'|'right' }

export interface App extends State {
  subs: Sub[];
  byId: (id:string)=>Sub|undefined;
  now: number;
  eng: Engine;
  tr: Tr;
  lang: Lang;
  dir: Dir;
  colors: Colors;
  addEntry(id:string): Entry;
  updateEntry(key:string, patch:Partial<Entry>): void;
  removeEntry(key:string): void;
  addToList(id:string): void;
  removeFromList(id:string): void;
  addCustom(name:string): Sub;
  saveProfile(p:Profile): void;
  setLang(l:Lang): void;
  setTheme(t:Theme): void;
  finishOnb(): void;
  showOnb(): void;
  wipe(): Promise<void>;
  bump(): void;
}

const Ctx = createContext<App|null>(null);
export const useApp = () => { const v=useContext(Ctx); if(!v) throw new Error('useApp outside provider'); return v; };

export function AppProvider({children}:{children:React.ReactNode}){
  const [s, dispatch] = useReducer(reducer, initial);
  const [now, setNow] = useState(()=>Date.now());
  const scheme = useColorScheme();

  /* restore once */
  useEffect(()=>{ let alive=true; restore().then(p=>{ if(!alive) return; dispatch({t:'restore', s:p ? {log:p.log, my:p.my, profile:p.profile, settings:p.settings, custom:p.custom} : {}}); }); return ()=>{ alive=false; }; },[]);
  /* persist every change after restore */
  useEffect(()=>{ if(!s.ready) return; persist({v:1, settings:s.settings, my:s.my, profile:s.profile, custom:s.custom, log:s.log}); },[s]);
  /* one clock: 30 s tick while active only — nothing runs in the background
     (battery), and returning to the foreground re-clocks immediately */
  useEffect(()=>{
    let iv: ReturnType<typeof setInterval>|null = null;
    const start=()=>{ if(!iv) iv=setInterval(()=>setNow(Date.now()),30000); };
    const stop=()=>{ if(iv){ clearInterval(iv); iv=null; } };
    start();
    const sub=AppState.addEventListener('change',st=>{ if(st==='active'){ setNow(Date.now()); start(); } else stop(); });
    return ()=>{ stop(); sub.remove(); };
  },[]);

  const subs = useMemo(()=>[...SUBS, ...s.custom],[s.custom]);
  const map = useMemo(()=>new Map(subs.map(x=>[x.id,x])),[subs]);
  const byId = useCallback((id:string)=>map.get(id),[map]);
  const eng = useMemo(()=>makeEngine(s.log, now, byId),[s.log, now, byId]);
  const tr = useMemo(()=>makeTr(s.settings.lang),[s.settings.lang]);
  const rtl = tr.rtl;
  const dir = useMemo<Dir>(()=>({rtl, row:rtl?'row-reverse':'row', textAlign:rtl?'right':'left', start:rtl?'right':'left', end:rtl?'left':'right'}),[rtl]);
  const colors = useMemo(()=>{ const th=s.settings.theme; const dark = th==='system' ? scheme!=='light' : th==='dark'; return dark?DARK:LIGHT; },[s.settings.theme, scheme]);

  const logRef = useRef(s.log); logRef.current = s.log;
  const bump = useCallback(()=>setNow(Date.now()),[]);

  const api: App = useMemo(()=>({
    ...s, subs, byId, now, eng, tr, lang:s.settings.lang, dir, colors, bump,
    addEntry(id){
      const sub=byId(id); const e:Entry={id, t:Date.now(), q:sub?.def||1, sub:null, key:'k'+Date.now()};
      dispatch({t:'log', log:[...logRef.current, e]}); setNow(Date.now()); return e;
    },
    updateEntry(key, patch){ dispatch({t:'log', log:logRef.current.map(e=>e.key===key?{...e,...patch}:e)}); setNow(Date.now()); },
    removeEntry(key){ dispatch({t:'log', log:logRef.current.filter(e=>e.key!==key)}); setNow(Date.now()); },
    addToList(id){ if(!s.my.includes(id)) dispatch({t:'my', my:[...s.my,id]}); },
    removeFromList(id){ dispatch({t:'my', my:s.my.filter(x=>x!==id)}); },
    addCustom(name){
      const ns:Sub={id:'cu'+Date.now(), n:name, c:'oth', i:'pill', u:'unit', kind:'std', tp:30, hl:120, dur:120, ev:'C', s:[], custom:true};
      dispatch({t:'custom', custom:[...s.custom, ns]}); dispatch({t:'my', my:[...s.my, ns.id]}); return ns;
    },
    saveProfile(p){ dispatch({t:'profile', profile:p}); },
    setLang(l){ dispatch({t:'settings', settings:{lang:l}}); },
    setTheme(th){ dispatch({t:'settings', settings:{theme:th}}); },
    finishOnb(){ dispatch({t:'settings', settings:{onb:true}}); },
    showOnb(){ dispatch({t:'settings', settings:{onb:false}}); },
    async wipe(){ await wipeStore(); dispatch({t:'wipe'}); },
  }), [s, subs, byId, now, eng, tr, dir, colors, bump]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
