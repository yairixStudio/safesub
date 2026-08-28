import React from 'react';
import {Linking, Pressable, ScrollView, View} from 'react-native';
import {useApp} from '../../state/AppContext';
import {explicitRisksOf, riskFor} from '../../engine/interactions';
import {SEVRANK, type Sev} from '../../engine/types';
import {TINT, alpha, mix} from '../../theme/tokens';
import {Icon} from '../Icon';
import {T, Row, Page, SecHead, HScroll} from '../common';
import {ResourceList} from './SettingsPage';

export function LearnPage({id, onClose}:{id:string|null; onClose:()=>void}){
  const {colors, dir, tr, eng, byId, my, log} = useApp();
  const s = id ? byId(id) : undefined;
  const open = !!s;
  if(!s) return <Page open={false} onClose={onClose}/>;
  const tint=TINT[s.c];
  const left=eng.windowLeft(s.id);
  /* documented pairs + rule-derived pairs against the user's own list */
  const risks:{o:string; sev:Sev; txt:string}[]=[]; const seen=new Set<string>();
  explicitRisksOf(s.id).forEach(r=>{ if(byId(r.o)&&!seen.has(r.o)){ seen.add(r.o); risks.push({o:r.o, sev:r.sev, txt:tr.rtxt(r.k)}); } });
  my.forEach(o=>{ if(o===s.id||seen.has(o)) return; const r=riskFor(s.id,o,byId); if(r){ seen.add(o); risks.push({o, sev:r.sev, txt:tr.rtxt(r.k)}); } });
  risks.sort((a,b)=>SEVRANK[b.sev]-SEVRANK[a.sev]);
  const wk=log.filter(e=>e.id===s.id).length;
  const ev=s.ev||'C', evN={A:3,B:2,C:1}[ev];
  const tips:string[]=tr.stips(s), note=tr.snote(s);
  const hlV = s.kind==='zero' ? tr.t('page.rateFix') : s.kind==='chronic' ? tr.t('page.days') : String(s.hl!>=60?(s.hl!%60?(s.hl!/60).toFixed(1):s.hl!/60):s.hl);
  const hlU = s.kind==='zero' ? tr.t('page.rateU') : s.kind==='chronic' ? tr.t('page.steady') : (s.hl!>=60?tr.t('page.hr'):tr.t('page.min'));
  const Fact=({k,v,u}:{k:string; v:string; u:string})=>(
    <View style={{flex:1, backgroundColor:colors.slate1, paddingVertical:10, paddingHorizontal:12, borderWidth:StyleSheetHairline, borderColor:colors.lineHard}}>
      <T f="mono" size={8.5} c={colors.dust} style={{letterSpacing:.5}}>{k}</T>
      <Row gap={3} align="baseline" style={{marginTop:3}}><T f="monoMed" size={14}>{v}</T><T f="mono" size={9.5} c={colors.haze}>{u}</T></Row>
    </View>
  );
  const arts=[{t:tr.t('page.art1',tr.sn(s)), src:tr.t('page.src'), min:4},{t:tr.t('catart.'+s.c), src:tr.t('page.src'), min:6},{t:tr.t('page.art3'), src:'safesub', min:3}];
  const vids=[{t:tr.t('page.vid1',tr.sn(s)), dur:'3:10'},{t:tr.t('page.vid2'), dur:'5:40'},{t:tr.t('page.vid3'), dur:'2:55'}];
  const links=[{d:'health.gov.il', t:tr.t('page.link1'), href:'https://www.gov.il/he/departments/topics/drugs_and_addiction'},{d:'tripsit.me', t:tr.t('page.link2'), href:'https://wiki.tripsit.me/wiki/Drug_combinations'},{d:'dancesafe.org', t:tr.t('page.link3'), href:'https://dancesafe.org'}];
  return (
    <Page open={open} onClose={onClose} testID="page-learn"
      headerExtra={<View style={{width:36, height:36, borderRadius:2, alignItems:'center', justifyContent:'center', backgroundColor:alpha(tint,.13), borderWidth:1, borderColor:alpha(tint,.24)}}><Icon k={s.i} size={20} color={tint} strokeWidth={1.7}/></View>}
      title={undefined}
      right={<>
        <View style={{flex:1, minWidth:0}}>
          <T f="sansSemi" size={17} testID="learn-name" style={{letterSpacing:-.3}}>{tr.sn(s)}</T>
          <T f="mono" size={9.5} c={colors.dust} style={{letterSpacing:.4, marginTop:1}}>{(s.custom?tr.t('page.custom'):tr.cat(s.c))+(s.kind==='chronic'?' · '+tr.t('page.chronic'):' · t½ '+tr.hl(s.hl||s.tp))}</T>
        </View>
        {left ? <Row gap={4}><View style={{width:4, height:4, borderRadius:2, backgroundColor:colors.ember}}/><T f="mono" size={10} c={colors.ember}>{tr.t('page.active')}{tr.rem(left)}</T></Row> : null}
      </>}>
      <ScrollView contentContainerStyle={{paddingHorizontal:16, paddingTop:14, paddingBottom:26}}>
        <Row gap={1} style={{marginBottom:12, borderWidth:1, borderColor:colors.lineHard, borderRadius:2, overflow:'hidden', backgroundColor:colors.lineHard}}>
          <Fact k={tr.t('page.peak')} v={`${s.kind==='zero'?'~':''}${s.tp}`} u={tr.t('page.min')}/>
          <Fact k={s.kind==='zero'?tr.t('page.rate'):tr.t('page.hl')} v={hlV} u={hlU}/>
          <Fact k={tr.t('page.logs')} v={String(wk)} u={tr.t('page.total')}/>
        </Row>
        <Row gap={5} style={{marginBottom:12}}>
          <T f="mono" size={9} c={colors.dust} style={{letterSpacing:.3}}>{tr.t('page.ev')} · {tr.t('page.ev'+ev)}</T>
          <Row gap={2}>{[1,2,3].map(i=><View key={i} style={{width:9, height:4, borderRadius:1, backgroundColor:i<=evN?colors.haze:colors.lineHard}}/>)}</Row>
        </Row>
        {note ? <View style={{[dir.rtl?'borderRightWidth':'borderLeftWidth']:2, borderColor:tint, paddingVertical:2, [dir.rtl?'paddingRight':'paddingLeft']:10, marginBottom:14}}><T size={11.5} c={colors.haze} style={{lineHeight:19}}>{note}</T></View> : null}
        {s.kind==='chronic' ? <View style={{[dir.rtl?'borderRightWidth':'borderLeftWidth']:2, borderColor:colors.iris, paddingVertical:2, [dir.rtl?'paddingRight':'paddingLeft']:10, marginBottom:14}}><T size={11.5} c={colors.haze} style={{lineHeight:19}}>{tr.t('page.chronicHint')}</T></View> : null}
        {tips.length ? (<View style={{marginBottom:16}}><SecHead title={tr.t('page.tips')}/>
          <View style={{borderWidth:1, borderColor:colors.line, borderRadius:3, backgroundColor:colors.slate1, paddingVertical:9, paddingHorizontal:11}}>
            {tips.map((x,i)=>(<Row key={i} gap={7} align="flex-start" style={{marginTop:i?3:0}}><View style={{width:4, height:4, borderRadius:1, backgroundColor:tint, marginTop:6}}/><T size={11.5} c={colors.haze} style={{flex:1, lineHeight:18}}>{x}</T></Row>))}
          </View></View>) : null}
        {risks.length ? (<View style={{marginBottom:16}}><SecHead title={tr.t('page.combos')} count={risks.length}/>
          {risks.map(r=>{ const sevC = r.sev==='caution'?colors.ember:colors.clay; return (
            <Row key={r.o} gap={9} align="flex-start" style={{paddingVertical:8, paddingHorizontal:11, backgroundColor:alpha(colors.clay,.05), borderWidth:1, borderColor:alpha(colors.clay,.2), borderRadius:2, marginBottom:6}}>
              <View style={{paddingVertical:2, paddingHorizontal:6, borderRadius:2, marginTop:1, backgroundColor:r.sev==='danger'?colors.clay:alpha(sevC,.13), borderWidth:r.sev==='danger'?0:1, borderColor:alpha(sevC,.4)}}><T f="monoSemi" size={8.5} c={r.sev==='danger'?colors.onAccent:sevC} style={{letterSpacing:.3}}>{tr.sev(r.sev)}</T></View>
              <View style={{flex:1}}><T f="sansSemi" size={12.5}>+ {tr.sn(byId(r.o)!)}</T><T size={11} c={colors.haze} style={{lineHeight:16.5, marginTop:1}}>{r.txt}</T></View>
            </Row>); })}
        </View>) : null}
        <View style={{marginBottom:16}}><SecHead title={tr.t('page.emg')}/>
          <View style={{backgroundColor:alpha(colors.clay,.06), borderWidth:1, borderColor:alpha(colors.clay,.28), borderRadius:2, paddingVertical:10, paddingHorizontal:12}}>
            <T f="sansSemi" size={12} c={colors.clay} style={{marginBottom:4}}>{tr.t('page.emgT')}</T>
            <T size={11.5} c={colors.haze} style={{lineHeight:18.5}}>{tr.t('emg.'+s.c)}</T>
          </View></View>
        <View style={{marginBottom:16}}><SecHead title={tr.t('page.reading')} count={arts.length}/>
          {arts.map((a,i)=>(<Row key={i} gap={11} style={{paddingVertical:10, paddingHorizontal:12, backgroundColor:colors.slate1, borderWidth:1, borderColor:colors.line, borderRadius:2, marginBottom:6}}>
            <T f="mono" size={12} c={colors.dust} align="center" style={{width:22}}>{'0'+(i+1)}</T>
            <View style={{flex:1}}><T f="sansMed" size={13} style={{lineHeight:18}}>{a.t}</T><T f="mono" size={9.5} c={colors.dust} style={{marginTop:2}}>{a.src} · {tr.t('page.readMin',a.min)}</T></View>
            <View style={{transform:[{scaleX:dir.rtl?-1:1}]}}><Icon k="chevR" size={13} color={colors.dust} strokeWidth={1.8}/></View>
          </Row>))}
        </View>
        <View style={{marginBottom:16}}><SecHead title={tr.t('page.videos')} count={vids.length}/>
          <HScroll gap={7}>
            {vids.map((v,i)=>(<View key={i} style={{width:150}}>
              <View style={{height:86, borderRadius:2, borderWidth:1, borderColor:colors.lineHard, backgroundColor:mix(tint, colors.slate1, .16), alignItems:'center', justifyContent:'center'}}>
                <View style={{width:30, height:30, borderRadius:3, backgroundColor:'rgba(10,13,17,.72)', borderWidth:1, borderColor:colors.lineHard, alignItems:'center', justifyContent:'center'}}><Icon k="play" size={13} color="#E7ECF2" fill="#E7ECF2"/></View>
                <View style={{position:'absolute', bottom:5, left:5, backgroundColor:'rgba(10,13,17,.8)', paddingVertical:2, paddingHorizontal:5, borderRadius:2}}><T f="mono" size={9} c="#E7ECF2">{v.dur}</T></View>
              </View>
              <T f="sansMed" size={12} style={{lineHeight:16, marginTop:6}}>{v.t}</T><T f="mono" size={9} c={colors.dust} style={{marginTop:2}}>safesub</T>
            </View>))}
          </HScroll></View>
        <View style={{marginBottom:16}}><SecHead title={tr.t('page.links')}/>
          {links.map(l=>(<Pressable key={l.d} onPress={()=>Linking.openURL(l.href).catch(()=>{})} style={({pressed})=>({flexDirection:dir.row, alignItems:'center', gap:10, paddingVertical:10, paddingHorizontal:12, backgroundColor:pressed?colors.slate2:colors.slate1, borderWidth:1, borderColor:colors.line, borderRadius:2, marginBottom:6})}>
            <View style={{backgroundColor:alpha(tint,.1), paddingVertical:3, paddingHorizontal:7, borderRadius:2}}><T f="mono" size={9.5} c={tint}>{l.d}</T></View>
            <T f="sansMed" size={12.5} style={{flex:1}}>{l.t}</T>
            <Icon k="ext" size={13} color={colors.dust} strokeWidth={1.7}/>
          </Pressable>))}
        </View>
        <View style={{marginBottom:10}}><SecHead title={tr.t('page.support')}/><ResourceList/></View>
        <T f="mono" size={9} c={colors.dust} align="center" style={{paddingTop:6, lineHeight:16, letterSpacing:.1}}>{String(tr.t('page.caveat')).replace('<br>','\n')}</T>
      </ScrollView>
    </Page>
  );
}
const StyleSheetHairline = 0.5;
