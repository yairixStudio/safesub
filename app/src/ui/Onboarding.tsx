import React, {useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import Svg, {Path, Rect, Circle, Line, Text as SvgText} from 'react-native-svg';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useApp} from '../state/AppContext';
import {L} from '../i18n';
import type {Lang} from '../engine/types';
import {alpha} from '../theme/tokens';
import {Icon} from './Icon';
import {T, Row, Btn} from './common';

/* the five illustrations — language-free, theme-aware */
function Illo({i}:{i:number}){
  const {colors} = useApp();
  const c=colors;
  const mono='IBMPlexMono_400Regular';
  return (
    <Svg width={190} height={170} viewBox="0 0 190 170" fill="none">
      {i===0 && (<>
        <Rect x={55} y={30} width={80} height={110} rx={4} stroke={c.lineHard} strokeWidth={1.5}/>
        <Rect x={63} y={40} width={64} height={8} rx={1} fill={c.slate3}/>
        <SvgText x={95} y={102} fill={c.iris} fontSize={30} fontFamily="IBMPlexMono_600SemiBold" textAnchor="middle">18+</SvgText>
        <Rect x={63} y={118} width={64} height={12} rx={2} fill={c.iris} opacity={.18}/>
      </>)}
      {i===1 && (<>
        <Rect x={55} y={30} width={80} height={110} rx={4} stroke={c.lineHard} strokeWidth={1.5}/>
        <Rect x={72} y={72} width={46} height={36} rx={3} stroke={c.iris} strokeWidth={1.6}/>
        <Path d="M81 72v-9a14 14 0 0 1 28 0v9" stroke={c.iris} strokeWidth={1.6}/>
        <Circle cx={95} cy={88} r={3.5} fill={c.iris}/>
        <Path d="M30 60l14 8M30 110l14-8M160 60l-14 8M160 110l-14-8" stroke={c.lineHard} strokeWidth={1.5} strokeLinecap="round" strokeDasharray="2 4"/>
      </>)}
      {i===2 && (<>
        <Rect x={30} y={35} width={60} height={60} rx={2} fill={c.slate1} stroke={c.lineHard}/>
        <Rect x={100} y={35} width={60} height={60} rx={2} fill={c.slate1} stroke={c.lineHard}/>
        <Path d="M112 52h14M112 58h20M42 52h14M42 58h20" stroke={c.chartFaint} strokeWidth={1.5} strokeLinecap="round"/>
        <Circle cx={130} cy={80} r={13} stroke={c.iris} strokeWidth={1.6}/>
        <Circle cx={130} cy={80} r={4} fill={c.iris}/>
        <Rect x={30} y={118} width={130} height={3} rx={1.5} fill={c.slate3}/>
        <Rect x={80} y={118} width={80} height={3} rx={1.5} fill={c.ember}/>
        <SvgText x={95} y={139} fill={c.dust} fontSize={10} fontFamily={mono} textAnchor="middle">3 sec</SvgText>
      </>)}
      {i===3 && (<>
        <Path d="M28 100c14-2 20-42 32-42s16 28 26 28 14-50 28-50 14 60 26 60 12-18 22-20" stroke={c.chartTotal} strokeWidth={2.2} strokeLinecap="round" fill="none"/>
        <Line x1={95} y1={34} x2={95} y2={116} stroke={c.iris} strokeWidth={1.2} strokeDasharray="2 3"/>
        <Circle cx={60} cy={100} r={2.5} fill="#93AE84"/><Circle cx={114} cy={100} r={2.5} fill="#C97F8C"/>
        <Rect x={52} y={104} width={70} height={3} fill="#E0766B" opacity={.55}/>
        <SvgText x={95} y={139} fill={c.dust} fontSize={10} fontFamily={mono} textAnchor="middle">t½ · 22:00</SvgText>
      </>)}
      {i===4 && (<>
        <Path d="M35 38h120M35 57h95" stroke={c.chartFaint} strokeWidth={2} strokeLinecap="round"/>
        <Path d="M35 85h60" stroke={c.iris} strokeWidth={2} strokeLinecap="round"/>
        <Path d="M35 113h120M35 132h80" stroke={c.chartFaint} strokeWidth={2} strokeLinecap="round"/>
        <Path d="M148 76l3.2 9 9 3.2-9 3.2-3.2 9-3.2-9-9-3.2 9-3.2 3.2-9Z" stroke={c.iris} strokeWidth={1.5} strokeLinejoin="round"/>
      </>)}
    </Svg>
  );
}

/* body copy carries <b>…</b> and a trailing <span class="fine">…</span> with <br> */
function Body({html}:{html:string}){
  const {colors} = useApp();
  const [main, fineRaw] = html.split('<span class="fine">');
  const parts = main.split(/(<b>.*?<\/b>)/);
  const fine = fineRaw ? fineRaw.replace('</span>','').replace(/<br>/g,'\n') : '';
  return (<>
    <T size={13.5} c={colors.haze} align="center" style={{lineHeight:25, maxWidth:300}}>
      {parts.map((p,i)=> p.startsWith('<b>') ? <T key={i} f="sansSemi" size={13.5} c={colors.bone} align="center">{p.slice(3,-4)}</T> : p)}
    </T>
    {fine ? <T f="mono" size={9.5} c={colors.dust} align="center" style={{lineHeight:18, marginTop:12, letterSpacing:.1, maxWidth:300}}>{fine}</T> : null}
  </>);
}

export function Onboarding(){
  const app = useApp(); const {colors, dir, tr, lang} = app;
  const [step, setStep] = useState(0);
  const [dd, setDd] = useState(false);
  const insets = useSafeAreaInsets();
  const steps = tr.t('onb.steps') as {label:string; skip:boolean; title:string; body:string}[];
  const s = steps[step];
  return (
    <View testID="onboarding" style={[StyleSheet.absoluteFill,{backgroundColor:colors.ink, zIndex:40, elevation:40, paddingTop:insets.top, paddingBottom:insets.bottom}]}>
      <View style={{alignItems:'center', paddingTop:16, gap:2, zIndex:2}}>
        <View style={{flexDirection:'row', alignItems:'baseline'}}>
          <T f="sansSemi" size={20} style={{letterSpacing:-.3}}>safe</T><T f="sansLight" size={20} c={colors.iris} style={{letterSpacing:-.3}}>sub</T>
        </View>
        <View>
          <Pressable testID="onb-lang" onPress={()=>setDd(v=>!v)} accessibilityRole="button" style={{flexDirection:'row', alignItems:'center', gap:5, paddingVertical:4, paddingHorizontal:8, borderRadius:3, borderWidth:1, borderColor:dd?colors.lineHard:'transparent'}}>
            <T f="mono" size={10.5} c={dd?colors.haze:colors.dust} style={{letterSpacing:.3}}>{L[lang].name}</T>
            <Icon k="chevD" size={9} color={dd?colors.haze:colors.dust} strokeWidth={2}/>
          </Pressable>
          {dd ? (
            <View testID="onb-lang-menu" style={{position:'absolute', top:'100%', left:'50%', marginTop:4, marginLeft:-75, width:150, backgroundColor:colors.slate2, borderWidth:1, borderColor:colors.lineHard, borderRadius:3, overflow:'hidden', elevation:8, shadowColor:'#000', shadowOpacity:.4, shadowRadius:16, shadowOffset:{width:0,height:10}}}>
              {(Object.keys(L) as Lang[]).map((k,i)=>(
                <Pressable key={k} testID={`onb-lang-${k}`} onPress={()=>{ setDd(false); app.setLang(k); }} style={({pressed})=>({flexDirection:dir.row, alignItems:'center', gap:8, paddingVertical:10, paddingHorizontal:13, borderBottomWidth:i<Object.keys(L).length-1?1:0, borderBottomColor:colors.line, backgroundColor:pressed?colors.slate3:'transparent'})}>
                  <View style={{width:5, height:5, borderRadius:3, backgroundColor:k===lang?colors.iris:'transparent'}}/>
                  <T f="sansMed" size={13}>{L[k].name}</T>
                </Pressable>))}
            </View>
          ) : null}
        </View>
      </View>
      <Pressable onPress={()=>setDd(false)} style={{flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal:24}}>
        <View style={{marginBottom:26}}><Illo i={step}/></View>
        <T f="sansSemi" size={20} align="center" testID="onb-title" style={{letterSpacing:-.4, marginBottom:11, maxWidth:300}}>{s.title}</T>
        <View style={{minHeight:150, alignItems:'center'}}><Body html={s.body}/></View>
      </Pressable>
      <View style={{paddingHorizontal:24, paddingBottom:30, alignItems:'center', gap:14}}>
        <Row gap={5}>{steps.map((_,i)=><View key={i} style={{width:i===step?18:5, height:5, borderRadius:1, backgroundColor:i===step?colors.iris:colors.lineHard}}/>)}</Row>
        <Btn testID="onb-next" kind="primary" label={s.label} style={{alignSelf:'stretch', height:46}} onPress={()=>{ if(step<steps.length-1) setStep(step+1); else app.finishOnb(); }}/>
        <Pressable testID="onb-skip" onPress={()=>app.finishOnb()} disabled={!s.skip} style={{height:16, opacity:s.skip?1:0}}>
          <T f="mono" size={10.5} c={colors.dust} align="center" style={{letterSpacing:.3}}>{tr.t('onb.skip')}</T>
        </Pressable>
      </View>
    </View>
  );
}
