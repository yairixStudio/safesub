import React, {useEffect, useRef, useState} from 'react';
import {Linking, Pressable, ScrollView, View} from 'react-native';
import {useApp} from '../../state/AppContext';
import {RESOURCES} from '../../engine/rules';
import type {Lang, Theme} from '../../engine/types';
import {L} from '../../i18n';
import {Icon} from '../Icon';
import {T, Row, Seg, Btn, Page, SecHead} from '../common';

export function ResourceList(){
  const {colors, dir, tr} = useApp();
  return (<>
    {RESOURCES.map(r=>(
      <Pressable key={r.id} testID={`res-${r.id}`} onPress={()=>Linking.openURL(r.href).catch(()=>{})} accessibilityRole="link"
        style={({pressed})=>({flexDirection:dir.row, alignItems:'center', gap:10, paddingVertical:9, paddingHorizontal:12, backgroundColor:pressed?colors.slate2:colors.slate1, borderWidth:1, borderColor:colors.line, borderRadius:2, marginBottom:6})}>
        <View style={{minWidth:44}}>{r.tel ? <T f="monoSemi" size={12} c={colors.iris}>{r.tel}</T> : <Icon k="ext" size={13} color={colors.dust} strokeWidth={1.7}/>}</View>
        <View style={{flex:1}}><T f="sansSemi" size={12.5}>{tr.t('res.'+r.id+'.n')}</T><T f="mono" size={9} c={colors.dust}>{tr.t('res.'+r.id+'.s')}</T></View>
      </Pressable>))}
  </>);
}

export function SettingsPage({open, onClose, onIntro}:{open:boolean; onClose:()=>void; onIntro:()=>void}){
  const app = useApp(); const {colors, dir, tr, settings} = app;
  const [armed, setArmed] = useState(false);
  const armT = useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>{ if(!open) setArmed(false); },[open]);
  const wipe=async()=>{
    if(!armed){ setArmed(true); if(armT.current) clearTimeout(armT.current); armT.current=setTimeout(()=>setArmed(false),4000); return; }
    if(armT.current) clearTimeout(armT.current); setArmed(false); await app.wipe(); onClose();
  };
  const Group=({children}:{children:React.ReactNode})=><View style={{borderWidth:1, borderColor:colors.line, borderRadius:2, backgroundColor:colors.slate1, marginBottom:14, overflow:'hidden'}}>{children}</View>;
  const RowItem=({title, sub, right, onPress, last, testID}:{title:string; sub?:string; right?:React.ReactNode; onPress?:()=>void; last?:boolean; testID?:string})=>(
    <Pressable testID={testID} onPress={onPress} disabled={!onPress} style={({pressed})=>({flexDirection:dir.row, alignItems:'center', gap:10, paddingVertical:11, paddingHorizontal:12, minHeight:50, borderBottomWidth:last?0:1, borderBottomColor:colors.line, backgroundColor:pressed&&onPress?colors.slate2:'transparent'})}>
      <View style={{flex:1}}><T f="sansMed" size={13}>{title}</T>{sub ? <T size={11} c={colors.dust} style={{lineHeight:16.5, marginTop:1}}>{sub}</T> : null}</View>
      {right}
    </Pressable>
  );
  return (
    <Page open={open} onClose={onClose} title={tr.t('settings.title')} testID="page-settings">
      <ScrollView contentContainerStyle={{paddingHorizontal:16, paddingTop:14, paddingBottom:26}}>
        <Group>
          <RowItem title={tr.t('settings.appearance')} sub={tr.t('settings.appS')} right={<Seg<Theme> testIDPrefix="theme" opts={[['system',tr.t('settings.system')],['dark',tr.t('settings.dark')],['light',tr.t('settings.light')]]} value={settings.theme} onChange={v=>app.setTheme(v)}/>}/>
          <RowItem last title={tr.t('settings.language')} sub={tr.t('settings.langS')} right={<Seg<Lang> testIDPrefix="lang" opts={(Object.keys(L) as Lang[]).map(k=>[k,L[k].name] as [Lang,string])} value={settings.lang} onChange={v=>app.setLang(v)}/>}/>
        </Group>
        <SecHead title={tr.t('settings.privacy')}/>
        <View style={{borderWidth:1, borderColor:colors.line, borderRadius:2, backgroundColor:colors.slate1, marginBottom:8, overflow:'hidden'}}>
          <RowItem title={tr.t('settings.privT')} sub={tr.t('settings.privS')}/>
          <RowItem last title={tr.t('settings.advT')} sub={tr.t('settings.advS')}/>
        </View>
        <Btn testID="wipe" kind={armed?'dangerArmed':'danger'} label={armed?tr.t('settings.wipeArm'):tr.t('settings.wipe')} onPress={wipe} style={{height:42}}/>
        <T f="mono" size={8.5} c={colors.dust} align="center" style={{marginTop:9, marginBottom:14, letterSpacing:.2}}>{tr.t('settings.wipeS')}</T>
        <SecHead title={tr.t('settings.support')}/>
        <View style={{marginBottom:10}}><ResourceList/></View>
        <SecHead title={tr.t('settings.about')}/>
        <Group>
          <RowItem testID="intro-again" title={tr.t('settings.intro')} sub={tr.t('settings.introS')} onPress={()=>{ onClose(); onIntro(); }} right={<View style={{transform:[{scaleX:dir.rtl?-1:1}]}}><Icon k="chevR" size={13} color={colors.dust} strokeWidth={1.8}/></View>}/>
          <RowItem last title={tr.t('settings.method')} sub={tr.t('settings.methodS')}/>
        </Group>
        <T f="mono" size={9} c={colors.dust} align="center" style={{paddingTop:6, letterSpacing:.1}}>{tr.t('settings.version')}</T>
      </ScrollView>
    </Page>
  );
}
