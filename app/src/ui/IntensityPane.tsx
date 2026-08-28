import React, {useEffect, useRef, useState} from 'react';
import {Pressable, ScrollView, TextInput, View} from 'react-native';
import {useApp} from '../state/AppContext';
import {aiRead} from '../logic/advisor';
import {Icon} from './Icon';
import {T, Row} from './common';
import {Chart} from './Chart';

export interface Msg { cls:'user'|'ai'|'typing'; txt:string }

export function IntensityPane({msgs, onSend, busy}:{msgs:Msg[]; onSend:(q:string)=>void; busy:boolean}){
  const {colors, dir, tr, eng, byId, profile} = useApp();
  const [txt, setTxt] = useState('');
  const scroll = useRef<ScrollView>(null);
  useEffect(()=>{ scroll.current?.scrollToEnd({animated:true}); },[msgs.length]);
  const r = aiRead(eng, tr, byId, profile);
  const send=()=>{ const v=txt.trim(); if(!v||busy) return; setTxt(''); onSend(v); };
  return (
    <View style={{flex:1, paddingHorizontal:16}}>
      <Row style={{paddingTop:4, paddingBottom:8, paddingHorizontal:2}}><T f="sansSemi" size={12} c={colors.haze} style={{letterSpacing:.5}}>{tr.t('intensity.title')}</T></Row>
      <Chart/>
      <ScrollView ref={scroll} style={{flex:1}} contentContainerStyle={{paddingBottom:8}} keyboardShouldPersistTaps="handled">
        <View testID="ai-read">
          <Row gap={6} style={{marginTop:4, marginBottom:7}}>
            <Icon k="sparkle" size={12} color={colors.iris} strokeWidth={1.7}/>
            <T f="monoMed" size={9.5} c={colors.iris} style={{letterSpacing:.5}}>{tr.t('ai.read')}</T>
            <View style={{flex:1}}/>
            <T f="mono" size={9} c={colors.dust}>{r.profiled?tr.t('ai.profiled'):''}{r.time}</T>
          </Row>
          {r.empty ? (<>
            <T size={12.5} c={colors.haze} style={{lineHeight:21}}>{tr.t('ai.emptyRead')}</T>
            <T size={12.5} c={colors.haze} style={{lineHeight:21, marginTop:7}}>{tr.t('ai.emptyAsk')}</T>
          </>) : (<>
            <T size={12.5} c={colors.haze} style={{lineHeight:21}}><T f="sansSemi" size={12.5}>{tr.t('ai.now')}</T> {r.now}</T>
            <T size={12.5} c={colors.haze} style={{lineHeight:21, marginTop:7}}><T f="sansSemi" size={12.5}>{tr.t('ai.next')}</T> {r.next}</T>
            {r.rec ? <T size={12.5} c={colors.haze} style={{lineHeight:21, marginTop:7}}><T f="sansSemi" size={12.5}>{tr.t('ai.rec')}</T> {r.rec}</T> : null}
          </>)}
        </View>
        <View testID="msgs">
          {msgs.map((m,i)=> m.cls==='user'
            ? <T key={i} f="sansMed" size={12.5} c={colors.iris} style={{lineHeight:21, marginTop:12, marginBottom:6}}>{'› '+m.txt}</T>
            : m.cls==='typing' ? <T key={i} f="mono" size={11} c={colors.dust} style={{marginVertical:6}}>{m.txt}</T>
            : <T key={i} size={12.5} c={colors.haze} style={{lineHeight:21, marginVertical:6}}>{m.txt}</T>)}
        </View>
      </ScrollView>
      <Row gap={7} style={{paddingTop:8, borderTopWidth:1, borderTopColor:colors.line}}>
        <TextInput testID="chat-input" value={txt} onChangeText={setTxt} onSubmitEditing={send} placeholder={tr.t('chat.ph')} placeholderTextColor={colors.dust} returnKeyType="send"
          style={{flex:1, height:38, borderRadius:3, backgroundColor:colors.slate1, borderWidth:1, borderColor:colors.lineHard, paddingHorizontal:12, paddingVertical:0, color:colors.bone, fontFamily:'IBMPlexSansHebrew_400Regular', fontSize:13, textAlign:dir.textAlign}}/>
        <Pressable testID="chat-send" onPress={send} disabled={busy} accessibilityLabel={tr.t('chat.send')} style={{width:38, height:38, borderRadius:3, backgroundColor:colors.iris, alignItems:'center', justifyContent:'center', opacity:busy?.5:1, transform:[{scaleX:dir.rtl?-1:1}]}}>
          <Icon k="send" size={15} color={colors.onAccent} strokeWidth={2}/>
        </Pressable>
      </Row>
      <T f="mono" size={8.5} c={colors.dust} align="center" style={{paddingTop:7, paddingBottom:9, letterSpacing:.15}}>{tr.t('chat.caveat')}</T>
    </View>
  );
}
