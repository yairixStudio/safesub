import React, {useRef, useState} from 'react';
import {Pressable, TextInput, View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {useFonts} from 'expo-font';
import {IBMPlexSansHebrew_300Light, IBMPlexSansHebrew_400Regular, IBMPlexSansHebrew_500Medium, IBMPlexSansHebrew_600SemiBold, IBMPlexSansHebrew_700Bold} from '@expo-google-fonts/ibm-plex-sans-hebrew';
import {IBMPlexMono_400Regular, IBMPlexMono_500Medium, IBMPlexMono_600SemiBold} from '@expo-google-fonts/ibm-plex-mono';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import {AppProvider, useApp} from './src/state/AppContext';
import {localReply, stateSummary} from './src/logic/advisor';
import {Icon} from './src/ui/Icon';
import {T} from './src/ui/common';
import {IntensityPane, type Msg} from './src/ui/IntensityPane';
import {SubstancesPane} from './src/ui/SubstancesPane';
import {JournalPane} from './src/ui/JournalPane';
import {LogSheet} from './src/ui/LogSheet';
import {CtxMenu, type CtxState} from './src/ui/CtxMenu';
import {SettingsPage} from './src/ui/pages/SettingsPage';
import {ProfilePage} from './src/ui/pages/ProfilePage';
import {LearnPage} from './src/ui/pages/LearnPage';
import {Onboarding} from './src/ui/Onboarding';
import {alpha} from './src/theme/tokens';

/* optional remote advisor — a proxy that holds the API key (docs/ai-advisor.md).
   Unset → the local rule-based responder answers, so the app always works. */
const AI_PROXY = process.env.EXPO_PUBLIC_AI_PROXY || '';

export default function App(){
  const [fontsLoaded] = useFonts({IBMPlexSansHebrew_300Light, IBMPlexSansHebrew_400Regular, IBMPlexSansHebrew_500Medium, IBMPlexSansHebrew_600SemiBold, IBMPlexSansHebrew_700Bold, IBMPlexMono_400Regular, IBMPlexMono_500Medium, IBMPlexMono_600SemiBold});
  return (
    <GestureHandlerRootView style={{flex:1, backgroundColor:'#0A0D11'}}>
      <SafeAreaProvider>
        <AppProvider>{fontsLoaded ? <Root/> : <View style={{flex:1, backgroundColor:'#0A0D11'}}/>}</AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const PANES=3;
function Root(){
  const app = useApp(); const {colors, dir, tr, lang, settings, profile, eng, byId, ready} = app;
  const [page, setPage] = useState(1);                       /* logical: 0 intensity, 1 substances, 2 journal */
  const [sheet, setSheet] = useState<{key:string; mode:'new'|'edit'}|null>(null);
  const [ctx, setCtx] = useState<CtxState|null>(null);
  const [learn, setLearn] = useState<string|null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const pager = useRef<PagerView>(null);
  const searchRef = useRef<TextInput>(null);
  const phys = (logical:number) => dir.rtl ? PANES-1-logical : logical;
  const goto = (p:number) => { setPage(p); pager.current?.setPage(phys(p)); };

  if(!ready) return <View style={{flex:1, backgroundColor:colors.ink}}/>;

  async function respond(q:string){
    setBusy(true);
    setMsgs(m=>[...m, {cls:'user', txt:q}, {cls:'typing', txt:tr.t('chat.thinking')}]);
    let ans='';
    try{
      if(!AI_PROXY) throw new Error('no proxy');
      const res=await fetch(AI_PROXY,{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({lang, summary:stateSummary(eng,tr,byId,profile), question:q})});
      if(!res.ok) throw new Error('proxy '+res.status);
      const data=await res.json(); ans=String(data.text||'').trim(); if(!ans) throw new Error('empty');
    }catch{ await new Promise(r=>setTimeout(r,350)); ans=localReply(eng,tr,byId,profile,q); }
    setMsgs(m=>[...m.filter(x=>x.cls!=='typing'), {cls:'ai', txt:ans}]);
    setBusy(false);
  }
  const askAbout=(name:string)=>{ goto(0); respond(tr.t('ai.ask',name)); };
  const askCombo=(id:string)=>{ const s=byId(id)!; const others=eng.activeIds().filter(x=>x!==id); const q=others.length?tr.t('ai.askCombo',tr.sn(s),others.map(o=>tr.sn(byId(o)!)).join(' + ')):tr.t('ai.askAlone',tr.sn(s)); goto(0); respond(q); };
  const openLog=(id:string)=>{ const e=app.addEntry(id); setSheet({key:e.key, mode:'new'}); };

  const initial = profile.name ? profile.name[0].toUpperCase() : '';
  const filled = !!(profile.name||profile.age||profile.weight||profile.sex||profile.meds);
  const panes = [
    <View key="p0" style={{flex:1}}><IntensityPane msgs={msgs} onSend={respond} busy={busy}/></View>,
    <View key="p1" style={{flex:1}}><SubstancesPane onLog={openLog} onCtx={(id,x,y)=>setCtx({id,x,y})} searchRef={searchRef}/></View>,
    <View key="p2" style={{flex:1}}><JournalPane onEdit={key=>setSheet({key, mode:'edit'})}/></View>,
  ];
  const ordered = dir.rtl ? [...panes].reverse() : panes;
  const NavBtn=({p,label,testID}:{p:number; label:string; testID:string})=>(
    <Pressable testID={testID} onPress={()=>goto(p)} accessibilityRole="tab" accessibilityState={{selected:page===p}} style={{flex:1, height:40, alignItems:'center', justifyContent:'center', gap:4}}>
      <View style={{width:14, height:2, borderRadius:1, backgroundColor:page===p?colors.iris:'transparent'}}/>
      <T f="mono" size={10} c={page===p?colors.iris:colors.dust} align="center" style={{letterSpacing:.6}}>{label}</T>
    </Pressable>
  );

  return (
    <SafeAreaView style={{flex:1, backgroundColor:colors.ink}} edges={['top','bottom']}>
      <StatusBar style={colors.isDark?'light':'dark'}/>
      {/* header: wordmark at inline-start, profile + settings at inline-end */}
      <View style={{height:38, paddingHorizontal:16, flexDirection:dir.row, alignItems:'center', justifyContent:'space-between'}}>
        <View style={{flexDirection:'row', alignItems:'baseline'}}>
          <T f="sansSemi" size={17} style={{letterSpacing:-.3}}>safe</T><T f="sansLight" size={17} c={colors.iris} style={{letterSpacing:-.3}}>sub</T>
        </View>
        <View style={{flexDirection:dir.row, gap:6}}>
          <Pressable testID="btn-profile" onPress={()=>setProfileOpen(true)} accessibilityLabel={tr.t('head.profile')} style={{width:30, height:30, borderRadius:15, borderWidth:1, borderColor:filled?alpha(colors.iris,.5):colors.lineHard, backgroundColor:colors.slate1, alignItems:'center', justifyContent:'center'}}>
            {initial ? <T f="monoSemi" size={12} c={colors.iris} align="center">{initial}</T> : <Icon k="user" size={16} color={colors.haze} strokeWidth={1.7}/>}
          </Pressable>
          <Pressable testID="btn-settings" onPress={()=>setSettingsOpen(true)} accessibilityLabel={tr.t('head.settings')} style={{width:30, height:30, borderRadius:15, borderWidth:1, borderColor:colors.lineHard, backgroundColor:colors.slate1, alignItems:'center', justifyContent:'center'}}>
            <Icon k="gear" size={16} color={colors.haze} strokeWidth={1.7}/>
          </Pressable>
        </View>
      </View>

      <PagerView key={lang} ref={pager} style={{flex:1}} initialPage={phys(page)} onPageSelected={e=>setPage(dir.rtl ? PANES-1-e.nativeEvent.position : e.nativeEvent.position)}>
        {ordered}
      </PagerView>

      <View style={{flexDirection:dir.row, borderTopWidth:1, borderTopColor:colors.line, backgroundColor:colors.ink}}>
        <NavBtn p={0} label={tr.t('nav.intensity')} testID="nav-intensity"/>
        <NavBtn p={1} label={tr.t('nav.subs')} testID="nav-subs"/>
        <NavBtn p={2} label={tr.t('nav.log')} testID="nav-log"/>
      </View>

      <LearnPage id={learn} onClose={()=>setLearn(null)}/>
      <SettingsPage open={settingsOpen} onClose={()=>setSettingsOpen(false)} onIntro={()=>app.showOnb()}/>
      <ProfilePage open={profileOpen} onClose={()=>setProfileOpen(false)}/>
      <LogSheet entryKey={sheet?.key||null} mode={sheet?.mode||'new'} onClose={()=>setSheet(null)} onAskAi={askAbout}/>
      <CtxMenu ctx={ctx} onClose={()=>setCtx(null)} onLog={openLog} onAsk={askCombo} onLearn={id=>setLearn(id)} onRemove={id=>app.removeFromList(id)}/>
      {!settings.onb ? <Onboarding/> : null}
    </SafeAreaView>
  );
}
