import React, {useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useApp} from '../state/AppContext';
import {TINT, alpha} from '../theme/tokens';
import {Icon} from './Icon';
import {T, Row} from './common';

const hhmm = (ms:number) => { const d=new Date(ms); return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };

export function JournalPane({onEdit}:{onEdit:(key:string)=>void}){
  const {colors, dir, tr, eng, byId, log} = useApp();
  const [filter, setFilter] = useState('all');
  const counts:Record<string,number>={}; log.forEach(e=>counts[e.id]=(counts[e.id]||0)+1);
  const loggedIds=Object.keys(counts).sort((a,b)=>counts[b]-counts[a]);
  const f = filter!=='all' && !counts[filter] ? 'all' : filter;
  const shown = f==='all' ? log : log.filter(e=>e.id===f);
  const sorted=[...shown].sort((a,b)=>b.t-a.t);
  const todayN = shown.filter(e=>eng.isToday(e.t)).length;
  const cap = f==='all' ? tr.t('log.cap',todayN) : tr.t('log.capSub',tr.sn(byId(f)!),shown.length,todayN);
  let day='';
  return (
    <View style={{flex:1, paddingHorizontal:16}}>
      <Row justify="space-between" align="baseline" style={{paddingTop:4, paddingBottom:8, paddingHorizontal:2}}>
        <T f="sansSemi" size={12} c={colors.haze} style={{letterSpacing:.5}}>{tr.t('log.title')}</T>
        <T f="mono" size={9} c={colors.dust} testID="log-cap">{String(cap).replace(/<\/?b>/g,'')}</T>
      </Row>
      {log.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flexGrow:0}} contentContainerStyle={{gap:5, paddingTop:2, paddingBottom:7, flexDirection:dir.row}}>
          {(['all',...loggedIds]).map(id=>{ const on=f===id; const tint=id==='all'?'#B9C4CF':TINT[byId(id)?.c||'oth']; const n=id==='all'?log.length:counts[id]; return (
            <Pressable key={id} testID={`ltag-${id}`} onPress={()=>setFilter(id)} style={{flexDirection:dir.row, alignItems:'center', gap:5, paddingVertical:3, paddingHorizontal:8, borderRadius:3, borderWidth:1, backgroundColor:on?alpha(tint,.12):colors.slate1, borderColor:on?alpha(tint,.55):colors.lineHard}}>
              <View style={{width:6, height:6, borderRadius:1, backgroundColor:tint}}/>
              <T f="sansMed" size={11} c={on?colors.bone:colors.haze}>{id==='all'?tr.t('log.all'):tr.sn(byId(id)!)}</T>
              <T f="monoMed" size={9} c={colors.dust}>{String(n)}</T>
            </Pressable>); })}
        </ScrollView>
      ) : null}
      <ScrollView testID="loglist" contentContainerStyle={{paddingBottom:16}}>
        {!log.length ? (
          <View style={{marginTop:8, borderWidth:1, borderStyle:'dashed', borderColor:colors.lineHard, borderRadius:2, paddingVertical:34, paddingHorizontal:20}}>
            <T size={13} c={colors.dust} align="center" style={{lineHeight:23}}>{String(tr.t('log.empty')).replace(/<br>/g,'\n')}</T>
          </View>
        ) : sorted.map(e=>{
          const s=byId(e.id); if(!s) return null;
          const d=eng.isToday(e.t)?tr.t('log.today'):(eng.isYesterday(e.t)?tr.t('log.yesterday'):tr.t('log.earlier'));
          const sep = d!==day; day=d;
          const unit = s.u==='mg' ? `${e.q} ${tr.unit(s)}` : (e.q>1 ? `${e.q} ${tr.unit(s)}` : '');
          const tint=TINT[s.c];
          return (
            <View key={e.key}>
              {sep ? <T f="mono" size={9.5} c={colors.dust} style={{letterSpacing:.6, paddingTop:11, paddingBottom:5}}>{d}</T> : null}
              <Pressable testID={`row-${e.key}`} onPress={()=>onEdit(e.key)} style={({pressed})=>({flexDirection:dir.row, alignItems:'center', gap:10, paddingVertical:8, borderBottomWidth:1, borderBottomColor:colors.line, backgroundColor:pressed?colors.slate2:'transparent'})}>
                <View style={{width:26, height:26, borderRadius:2, alignItems:'center', justifyContent:'center', backgroundColor:alpha(tint,.11)}}><Icon k={s.i} size={14} color={tint} strokeWidth={1.8}/></View>
                <View style={{flex:1}}>
                  <Row gap={6}><T f="sansMed" size={13.5}>{tr.sn(s)}</T>{e.sub ? <View style={{backgroundColor:colors.slate3, borderRadius:2, paddingVertical:1.5, paddingHorizontal:5}}><T f="monoMed" size={9.5} c={colors.haze}>{tr.subLabel(s,e.sub)}</T></View> : null}</Row>
                  <T size={11} c={colors.dust} style={{marginTop:1}}>{tr.ago(eng.mins(e.t))}{unit?' · '+unit:''}</T>
                </View>
                <T f="monoMed" size={12} c={colors.haze}>{hhmm(e.t)}</T>
                <View style={{opacity:.45, transform:[{scaleX:dir.rtl?-1:1}]}}><Icon k="chevR" size={12} color={colors.dust} strokeWidth={1.8}/></View>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
