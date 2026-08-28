import React, {useRef, useState} from 'react';
import {View, ScrollView, Pressable} from 'react-native';
import Svg, {Path, Line, Circle, Rect, Text as SvgText} from 'react-native-svg';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {useApp} from '../state/AppContext';
import {riskFor} from '../engine/interactions';
import {r1} from '../engine/pk';
import {TINT, alpha} from '../theme/tokens';
import {T} from './common';

/* Intensity chart — port of renderChartSvg. Pan = scroll time, pinch = zoom.
   The x axis always runs left→right, whatever the UI language. */
export function Chart(){
  const {colors, tr, eng, byId, dir} = useApp();
  const [size, setSize] = useState({w:0,h:0});
  const [view, setView] = useState({t0:-240, span:720});
  const [sel, setSel] = useState<string>('all');
  const start = useRef({t0:-240, span:720, anchorT:0, anchorF:.5});

  const clamp=(t0:number, span:number)=>{ span=Math.max(120,Math.min(2880,span)); t0=Math.max(-2880,Math.min(1440-span,t0)); return {t0,span}; };
  const pan = Gesture.Pan().minDistance(4).runOnJS(true)
    .onBegin(()=>{ start.current.t0=view.t0; start.current.span=view.span; })
    .onUpdate(ev=>{ if(!size.w) return; setView(v=>clamp(start.current.t0 - ev.translationX*v.span/size.w, v.span)); });
  const pinch = Gesture.Pinch().runOnJS(true)
    .onBegin(ev=>{ start.current.span=view.span; start.current.anchorF=size.w?ev.focalX/size.w:.5; start.current.anchorT=view.t0+start.current.anchorF*view.span; })
    .onUpdate(ev=>{ const span=start.current.span/Math.max(.2,ev.scale); const {t0,span:sp}=clamp(start.current.anchorT-start.current.anchorF*span, span); setView({t0,span:sp}); });
  const gesture = Gesture.Simultaneous(pan, pinch);

  const W=size.w, H=size.h;
  const ids=eng.activeIds();
  const curveSel = sel!=='all' && !ids.includes(sel) ? 'all' : sel;
  let body:React.ReactNode=null;
  if(W&&H){
    const padL=6,padR=6,padT=12,padB=22;
    if(!ids.length){
      body=(<>
        <SvgText x={W/2} y={H/2-8} fill={colors.dust} fontSize={12} fontFamily="IBMPlexSansHebrew_400Regular" textAnchor="middle">{tr.t('intensity.empty1')}</SvgText>
        <SvgText x={W/2} y={H/2+12} fill={colors.chartFaint} fontSize={10.5} fontFamily="IBMPlexSansHebrew_400Regular" textAnchor="middle">{tr.t('intensity.empty2')}</SvgText>
      </>);
    }else{
      const VT0=view.t0, VSPAN=view.span, VT1=VT0+VSPAN;
      const step=Math.max(4,VSPAN/90), N=Math.floor(VSPAN/step)+1, tAt=(k:number)=>VT0+k*step;
      const S:Record<string,number[]>={}; const tot=new Array<number>(N).fill(0);
      for(const id of ids){ const a=new Array<number>(N); for(let k=0;k<N;k++){ a[k]=eng.levelAt(id,tAt(k)); tot[k]+=a[k]; } S[id]=a; }
      let ymax=1; for(let k=0;k<N;k++) if(tot[k]>ymax) ymax=tot[k]; ymax*=1.12;
      const x=(t:number)=>padL+(t-VT0)/VSPAN*(W-padL-padR), y=(v:number)=>padT+(1-Math.min(v,ymax)/ymax)*(H-padT-padB), baseY=y(0);
      const pathOf=(a:number[])=>{ let d=''; for(let k=0;k<N;k++) d+=(k?'L':'M')+r1(x(tAt(k)))+' '+r1(y(a[k])); return d; };
      const els:React.ReactNode[]=[];
      /* risk overlap bars */
      for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
        if(!riskFor(ids[i],ids[j],byId)) continue;
        const A=S[ids[i]],B=S[ids[j]]; let s0:number|null=null;
        for(let k=0;k<=N;k++){ const both=k<N&&A[k]>.12&&B[k]>.12; if(both&&s0===null) s0=tAt(k);
          if(!both&&s0!==null){ els.push(<Rect key={`r${i}${j}${k}`} x={x(s0)} y={baseY+5} width={x(tAt(Math.min(k,N-1)))-x(s0)} height={3} fill="#E0766B" opacity={.5}/>); s0=null; } }
      }
      const eventsOf=(id:string)=>eng.entriesBy(id).map(e=>-eng.mins(e.t)).filter(t=>t>=VT0&&t<=VT1);
      ids.forEach(id=>{ if(id===curveSel) return;
        els.push(<Path key={'d'+id} d={pathOf(S[id])} fill="none" stroke={colors.chartDim} strokeWidth={1.2} strokeLinejoin="round" opacity={.9}/>);
        if(curveSel==='all'){ const col=TINT[byId(id)!.c]; eventsOf(id).forEach((te,i)=>{ els.push(<Line key={`e${id}${i}`} x1={x(te)} y1={baseY} x2={x(te)} y2={baseY-5} stroke={col} strokeWidth={1.4} opacity={.85}/>); els.push(<Circle key={`c${id}${i}`} cx={x(te)} cy={baseY} r={2.1} fill={col}/>); }); }
      });
      const totalD=pathOf(tot);
      if(curveSel==='all'){
        els.push(<Path key="tf" d={`${totalD}L${x(VT1)} ${baseY}L${x(VT0)} ${baseY}Z`} fill={colors.chartTotal} opacity={.05}/>);
        els.push(<Path key="tl" d={totalD} fill="none" stroke={colors.chartTotal} strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round"/>);
        if(0>=VT0&&0<=VT1){ let nv=0; ids.forEach(id=>nv+=eng.nowLevel(id)); els.push(<Circle key="nd" cx={x(0)} cy={y(nv)} r={3.2} fill={colors.chartTotal}/>); }
      }else{
        els.push(<Path key="tl" d={totalD} fill="none" stroke={colors.chartDim} strokeWidth={1.2} strokeDasharray="3 3"/>);
        const col=TINT[byId(curveSel)!.c], d=pathOf(S[curveSel]);
        els.push(<Path key="sf" d={`${d}L${x(VT1)} ${baseY}L${x(VT0)} ${baseY}Z`} fill={col} opacity={.07}/>);
        els.push(<Path key="sl" d={d} fill="none" stroke={col} strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round"/>);
        eventsOf(curveSel).forEach((te,i)=>{ const ev=eng.levelAt(curveSel,te);
          els.push(<Line key={'sv'+i} x1={x(te)} y1={baseY} x2={x(te)} y2={y(ev)} stroke={col} strokeWidth={1} opacity={.28} strokeDasharray="2 3"/>);
          els.push(<Circle key={'sc'+i} cx={x(te)} cy={baseY} r={2.4} fill={col}/>);
          els.push(<Circle key={'sr'+i} cx={x(te)} cy={y(ev)} r={3.4} fill="none" stroke={col} strokeWidth={1.6}/>); });
        if(0>=VT0&&0<=VT1) els.push(<Circle key="nd" cx={x(0)} cy={y(eng.nowLevel(curveSel))} r={3.2} fill={col}/>);
      }
      if(0>=VT0&&0<=VT1){
        els.push(<Line key="nl" x1={x(0)} y1={padT-4} x2={x(0)} y2={baseY} stroke={colors.iris} strokeWidth={1} strokeDasharray="2 3"/>);
        els.push(<SvgText key="nt" x={x(0)} y={H-7} fill={colors.iris} fontSize={9} fontFamily="IBMPlexMono_400Regular" textAnchor="middle">{tr.t('intensity.now')}</SvgText>);
      }
      const tick=VSPAN<=240?30:VSPAN<=480?60:VSPAN<=960?120:240;
      const nowMs=eng.now; const d0=new Date(nowMs+VT0*60000); d0.setSeconds(0,0);
      const m0=d0.getHours()*60+d0.getMinutes(); d0.setMinutes(d0.getMinutes()+(tick-(m0%tick))%tick);
      for(let dt=new Date(d0), i=0; i<200; dt=new Date(dt.getTime()+tick*60000), i++){
        const t=(dt.getTime()-nowMs)/60000; if(t>VT1) break; if(t<VT0) continue; if(Math.abs(t)<tick*.4) continue;
        const lbl=String(dt.getHours()).padStart(2,'0')+':'+String(dt.getMinutes()).padStart(2,'0');
        els.push(<SvgText key={'tk'+i} x={x(t)} y={H-7} fill={colors.dust} fontSize={9} fontFamily="IBMPlexMono_400Regular" textAnchor="middle">{lbl}</SvgText>);
      }
      body=<>{els}</>;
    }
  }

  return (
    <View>
      <GestureDetector gesture={gesture}>
        <View testID="chart" style={{height:186}} onLayout={e=>setSize({w:e.nativeEvent.layout.width, h:e.nativeEvent.layout.height})}>
          {W&&H ? <Svg width={W} height={H}>{body}</Svg> : null}
        </View>
      </GestureDetector>
      {ids.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:5, paddingVertical:7, flexDirection:dir.row}}>
          {(['all',...ids] as string[]).map(id=>{ const on=curveSel===id; const tint=id==='all'?'#B9C4CF':TINT[byId(id)!.c]; return (
            <Pressable key={id} testID={`ctag-${id}`} onPress={()=>setSel(id)} style={{flexDirection:dir.row, alignItems:'center', gap:5, paddingVertical:3, paddingHorizontal:8, borderRadius:3, borderWidth:1,
              backgroundColor:on?alpha(tint,.12):colors.slate1, borderColor:on?alpha(tint,.55):colors.lineHard}}>
              <View style={{width:6, height:6, borderRadius:1, backgroundColor:tint}}/>
              <T f="sansMed" size={11} c={on?colors.bone:colors.haze}>{id==='all'?tr.t('intensity.all'):tr.sn(byId(id)!)}</T>
            </Pressable>); })}
        </ScrollView>
      ) : null}
    </View>
  );
}
