import React, {useEffect, useRef, useState} from 'react';
import {Animated, Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Rect, Text as SvgText} from 'react-native-svg';
import {useApp} from '../state/AppContext';
import {riskFor} from '../engine/interactions';
import {medHits} from '../engine/interactions';
import {SEVRANK} from '../engine/types';
import type {Sev} from '../engine/types';
import {TINT, alpha} from '../theme/tokens';
import {Icon} from './Icon';
import {T, Row, Chip, Btn, HScroll} from './common';

const WINDOW_MS = 15000;
/* The countdown bar and digits are drawn in SVG on purpose: SVG content is not
   a native View, so the accessibility/UI-automation hierarchy stays static
   while they animate. The bar is STEPPED from state (500 ms ticks) rather than
   Animated: under R8, Animated's per-frame native-prop path on SVG can fall
   back to per-frame re-renders, which stalls UI drivers again. */
const hhmm = (ms:number) => { const d=new Date(ms); return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };

/* The commit / edit sheet. In "new" mode a 15-second bar counts down and the
   entry saves itself untouched; any interaction restarts it. */
export function LogSheet({entryKey, mode, onClose, onAskAi}:{entryKey:string|null; mode:'new'|'edit'; onClose:()=>void; onAskAi:(name:string)=>void}){
  const app = useApp(); const {colors, dir, tr, eng, byId, profile} = app;
  const {height} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const e = app.log.find(x=>x.key===entryKey) || null;
  const s = e ? byId(e.id) : undefined;
  const open = !!e && !!s;
  const y = useRef(new Animated.Value(1)).current;
  const [secs, setSecs] = useState(15);
  const [frac, setFrac] = useState(1);
  const [whenSel, setWhenSel] = useState<number|'time'>(0);
  const [timeTxt, setTimeTxt] = useState('');
  const deadline = useRef(0);
  const [barW, setBarW] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval>|null>(null);

  useEffect(()=>{ Animated.timing(y,{toValue:open?0:1,duration:open?280:220,useNativeDriver:true}).start(); },[open]);

  function reset(){
    if(mode!=='new') return;
    deadline.current = Date.now()+WINDOW_MS; setSecs(15); setFrac(1);
  }
  useEffect(()=>{
    if(!open){ if(timer.current){ clearInterval(timer.current); timer.current=null; } return; }
    setWhenSel(mode==='new'?0:'time'); setTimeTxt(mode==='edit'&&e?hhmm(e.t):'');
    if(mode==='new'){ reset(); timer.current=setInterval(()=>{ const left=deadline.current-Date.now(); setSecs(Math.max(0,Math.ceil(left/1000))); setFrac(Math.max(0,left/WINDOW_MS)); if(left<=0){ clearInterval(timer.current!); timer.current=null; onClose(); } },500); }
    return ()=>{ if(timer.current){ clearInterval(timer.current); timer.current=null; } };
  },[open, entryKey, mode]);

  if(!open || !e || !s) return (
    <Animated.View pointerEvents="none" style={[st.sheet,{backgroundColor:colors.slate2, borderTopColor:colors.lineHard, transform:[{translateY:y.interpolate({inputRange:[0,1],outputRange:[0,height]})}]}]}/>
  );

  const tint=TINT[s.c];
  /* highest-severity interaction among active windows + standing meds */
  type Flag={sev:Sev; title:string; txt:string; meta:string};
  const cands:Flag[]=[];
  eng.activeIds().forEach(other=>{ if(other===s.id) return; const r=riskFor(s.id,other,byId);
    if(r) cands.push({sev:r.sev, title:`${tr.sn(s)} + ${tr.sn(byId(other)!)}`, txt:tr.rtxt(r.k), meta:tr.t('pop.winOpen',tr.sn(byId(other)!),tr.rem(eng.windowLeft(other)))}); });
  medHits(profile.meds, s.c).forEach(f=>cands.push({sev:f.sev, title:tr.t('pop.medTitle',tr.sn(s)), txt:tr.rtxt(f.k), meta:tr.t('pop.fromProfile')}));
  const best:Flag|null = cands.reduce<Flag|null>((b,c)=>(!b||SEVRANK[c.sev]>SEVRANK[b.sev])?c:b, null);
  const tips:string[]=tr.stips(s);
  const step=s.step||1;
  const flagColor = best ? (best.sev==='caution'?colors.ember:colors.clay) : colors.ember;

  const setWhen=(m:number)=>{ setWhenSel(m); setTimeTxt(''); app.updateEntry(e.key,{t:Date.now()-m*60000}); reset(); };
  const applyTime=(v:string)=>{ const m=/^(\d{1,2}):(\d{2})$/.exec(v.trim()); if(!m) return; const h=+m[1], mi=+m[2]; if(h>23||mi>59) return;
    let d=new Date(e.t); d.setHours(h,mi,0,0); if(d.getTime()>Date.now()) d=new Date(d.getTime()-86400000); setWhenSel('time'); app.updateEntry(e.key,{t:d.getTime()}); reset(); };

  return (
    <>
      <Pressable testID="scrim" onPress={onClose} style={[StyleSheet.absoluteFill,{backgroundColor:colors.scrim}]}/>
      <Animated.View testID="log-sheet" onTouchStart={reset} style={[st.sheet,{backgroundColor:colors.slate2, borderTopColor:colors.lineHard, maxHeight:height*.92, paddingBottom:insets.bottom, transform:[{translateY:y.interpolate({inputRange:[0,1],outputRange:[0,height]})}]}]}>
        {mode==='new' ? <View style={{height:2, marginHorizontal:-16}} onLayout={e=>setBarW(e.nativeEvent.layout.width)}>
          {barW ? <Svg width={barW} height={2}>
            <Rect x={0} y={0} width={barW} height={2} fill={colors.lineHard}/>
            <Rect y={0} height={2} fill={colors.ember} width={Math.max(0,barW*frac)} x={dir.rtl ? barW*(1-frac) : 0}/>
          </Svg> : null}
        </View> : null}
        <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
          <Row gap={10} style={{paddingTop:12, paddingBottom:10}}>
            <View style={{width:34, height:34, borderRadius:2, alignItems:'center', justifyContent:'center', backgroundColor:alpha(tint,.13), borderWidth:1, borderColor:alpha(tint,.22)}}><Icon k={s.i} size={19} color={tint} strokeWidth={1.7}/></View>
            <View style={{flex:1}}>
              <Row gap={5}><View style={{width:4, height:4, borderRadius:2, backgroundColor:mode==='new'?colors.ember:colors.haze}}/><T f="mono" size={9.5} c={mode==='new'?colors.ember:colors.haze} style={{letterSpacing:.5}}>{mode==='new'?tr.t('pop.now'):tr.t('pop.edit')}</T></Row>
              <T f="sansSemi" size={16.5} testID="sheet-name" style={{letterSpacing:-.3}}>{tr.sn(s)}</T>
            </View>
            {mode==='new' ? <Svg width={30} height={24}><SvgText x={dir.rtl?0:30} y={19} fill={colors.haze} fontSize={17} fontFamily="IBMPlexMono_500Medium" textAnchor={dir.rtl?'start':'end'}>{String(secs)}</SvgText></Svg> : null}
          </Row>

          {best ? (
            <View testID="sheet-flag" style={{flexDirection:dir.row, gap:9, alignItems:'flex-start', backgroundColor:alpha(flagColor, best.sev==='danger'?.13:.06), borderWidth:1, borderColor:alpha(flagColor, best.sev==='danger'?.55:.3), borderRadius:3, paddingVertical:9, paddingHorizontal:11, marginBottom:10}}>
              <Icon k="warn" size={15} color={flagColor} strokeWidth={1.9}/>
              <View style={{flex:1}}>
                <T f="sansSemi" size={12} c={flagColor}>{tr.sev(best.sev)}: {best.title} — {best.txt}</T>
                <T f="mono" size={9.5} c={colors.dust} style={{marginTop:4}}>{best.meta}</T>
              </View>
            </View>
          ) : null}

          {tips.length ? (
            <View style={{borderWidth:1, borderColor:colors.line, borderRadius:3, backgroundColor:colors.slate1, paddingVertical:9, paddingHorizontal:11, marginBottom:10}}>
              <T f="mono" size={9.5} c={colors.dust} style={{letterSpacing:.5, marginBottom:5}}>{tr.t('pop.tips')}</T>
              {tips.map((x,i)=>(<Row key={i} gap={7} align="flex-start" style={{marginTop:i?3:0}}><View style={{width:4, height:4, borderRadius:1, backgroundColor:tint, marginTop:6}}/><T size={11.5} c={colors.haze} style={{flex:1, lineHeight:18}}>{x}</T></Row>))}
            </View>
          ) : null}

          <T f="mono" size={9.5} c={colors.dust} style={{letterSpacing:.5, marginBottom:5}}>{tr.t('pop.when')}</T>
          {/* chips and the exact-time field flow together in one wrapping row */}
          <View style={{flexDirection:dir.row, flexWrap:'wrap', alignItems:'center', gap:6, marginBottom:10}}>
            {([0,5,15,30,60] as const).map(m=><Chip key={m} testID={`when-${m}`} label={tr.t('pop.w'+m)} on={whenSel===m} onPress={()=>setWhen(m)}/>)}
            <TextInput testID="when-time" value={timeTxt} onChangeText={setTimeTxt} onBlur={()=>applyTime(timeTxt)} onSubmitEditing={()=>applyTime(timeTxt)} placeholder="--:--" placeholderTextColor={colors.dust} keyboardType="numbers-and-punctuation" maxLength={5}
              style={{width:84, height:34, borderRadius:3, backgroundColor:colors.slate1, borderWidth:1, borderColor:whenSel==='time'?alpha(colors.iris,.5):colors.lineHard, color:whenSel==='time'?colors.iris:colors.haze, fontFamily:'IBMPlexMono_400Regular', fontSize:12, paddingVertical:0, paddingHorizontal:8, textAlign:'center'}}/>
          </View>

          <Row gap={10} align="flex-end" style={{marginBottom:10}}>
            <View>
              <T f="mono" size={9.5} c={colors.dust} style={{letterSpacing:.5, marginBottom:5}}>{tr.t('pop.qty')}</T>
              <Row style={{backgroundColor:colors.slate1, borderWidth:1, borderColor:colors.lineHard, borderRadius:3, overflow:'hidden'}}>
                <Pressable testID="qty-minus" onPress={()=>{ app.updateEntry(e.key,{q:Math.max(step,e.q-step)}); reset(); }} accessibilityLabel={tr.t('pop.minus')} style={{width:38, height:36, alignItems:'center', justifyContent:'center'}}><Icon k="minus" size={13} color={colors.haze} strokeWidth={2.2}/></Pressable>
                <View style={{minWidth:60, height:36, alignItems:'center', justifyContent:'center', borderLeftWidth:1, borderRightWidth:1, borderColor:colors.lineHard, flexDirection:dir.row, gap:3}}>
                  <T f="monoMed" size={14} testID="qty-val" align="center">{String(e.q)}</T><T size={10.5} c={colors.dust}>{tr.unit(s)}</T>
                </View>
                <Pressable testID="qty-plus" onPress={()=>{ app.updateEntry(e.key,{q:e.q+step}); reset(); }} accessibilityLabel={tr.t('pop.plus')} style={{width:38, height:36, alignItems:'center', justifyContent:'center'}}><Icon k="plus" size={13} color={colors.haze} strokeWidth={2.2}/></Pressable>
              </Row>
            </View>
            {s.s.length ? (
              <View style={{flex:1, minWidth:0}}>
                <T f="mono" size={9.5} c={colors.dust} style={{letterSpacing:.5, marginBottom:5}}>{tr.t('pop.sub')}</T>
                <HScroll>
                  {s.s.map(k=><Chip key={k} testID={`sub-${k}`} label={tr.subLabel(s,k)} on={e.sub===k} onPress={()=>{ app.updateEntry(e.key,{sub:e.sub===k?null:k}); reset(); }}/>)}
                </HScroll>
              </View>
            ) : null}
          </Row>

          <Row gap={7} style={{marginTop:1}}>
            <Btn testID="sheet-undo" kind="ghost" style={{flex:1}} label={mode==='new'?tr.t('pop.undo'):tr.t('pop.del')} onPress={()=>{ app.removeEntry(e.key); onClose(); }}/>
            <Btn testID="sheet-ai" kind="accent" style={{flex:1}} label={tr.t('pop.ai')} icon="chat" onPress={()=>{ const name=tr.sn(s); onClose(); onAskAi(name); }}/>
            <Btn testID="sheet-save" kind="primary" style={{flex:1.4}} label={tr.t('pop.ok')} onPress={onClose}/>
          </Row>
          <T f="mono" size={9} c={colors.dust} align="center" style={{marginTop:9, marginBottom:14, letterSpacing:.1}}>{mode==='new'?tr.t('pop.foot'):tr.t('pop.footEdit')}</T>
        </ScrollView>
      </Animated.View>
    </>
  );
}

const st = StyleSheet.create({
  sheet:{position:'absolute', left:0, right:0, bottom:0, borderTopWidth:1, paddingHorizontal:16, zIndex:9, elevation:9},
});
