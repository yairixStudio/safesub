import React from 'react';
import {Pressable, StyleSheet, View, useWindowDimensions} from 'react-native';
import {useApp} from '../state/AppContext';
import {TINT} from '../theme/tokens';
import {Icon} from './Icon';
import {T, Row} from './common';

export interface CtxState { id:string; x:number; y:number }

/* long-press menu on a tile: log now / ask the advisor / learn / remove from list */
export function CtxMenu({ctx, onClose, onLog, onAsk, onLearn, onRemove}:{ctx:CtxState|null; onClose:()=>void; onLog:(id:string)=>void; onAsk:(id:string)=>void; onLearn:(id:string)=>void; onRemove:(id:string)=>void}){
  const {colors, tr, eng, byId} = useApp();
  const {width, height} = useWindowDimensions();
  if(!ctx) return null;
  const s=byId(ctx.id); if(!s) return null;
  const others=eng.activeIds().filter(x=>x!==ctx.id);
  const cw=200, ch=184;
  const left=Math.max(8,Math.min(width-cw-8, ctx.x-cw/2)), top=Math.max(8,Math.min(height-ch-8, ctx.y+10));
  const tint=TINT[s.c];
  const Item=({act, icon, label, small, hot, dim, testID}:{act:()=>void; icon:string; label:string; small?:string; hot?:boolean; dim?:boolean; testID:string})=>(
    <Pressable testID={testID} onPress={()=>{ onClose(); act(); }} accessibilityRole="button" style={({pressed})=>({backgroundColor:pressed?colors.slate3:'transparent', borderBottomWidth:1, borderBottomColor:colors.line})}>
      <Row gap={10} style={{paddingVertical:11, paddingHorizontal:13}}>
        <Icon k={icon} size={15} color={hot?tint:colors.haze} strokeWidth={1.7}/>
        <T f="sansMed" size={13} c={dim?colors.haze:colors.bone} style={{flex:1}}>{label}</T>
        {small ? <T f="mono" size={9} c={colors.dust}>{small}</T> : null}
      </Row>
    </Pressable>
  );
  return (
    <Pressable testID="ctx-layer" onPress={onClose} style={[StyleSheet.absoluteFill,{zIndex:10, elevation:10}]}>
      <View testID="ctx-menu" style={{position:'absolute', left, top, width:cw, backgroundColor:colors.slate2, borderWidth:1, borderColor:colors.lineHard, borderRadius:3, overflow:'hidden', shadowColor:'#000', shadowOpacity:.5, shadowRadius:20, shadowOffset:{width:0,height:12}, elevation:12}}>
        <Item testID="ctx-log" act={()=>onLog(ctx.id)} icon="plus" label={tr.t('ctx.log')} small={tr.sn(s)} hot/>
        <Item testID="ctx-ask" act={()=>onAsk(ctx.id)} icon="chat" label={others.length?tr.t('ai.comboQ'):tr.t('ai.shouldQ')} small={others.length?tr.t('ai.activeN',others.length):undefined}/>
        <Item testID="ctx-learn" act={()=>onLearn(ctx.id)} icon="book" label={tr.t('ctx.learn')}/>
        <Item testID="ctx-remove" act={()=>onRemove(ctx.id)} icon="minus" label={tr.t('ctx.remove')} dim/>
      </View>
    </Pressable>
  );
}
