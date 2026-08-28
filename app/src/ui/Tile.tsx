import React, {useEffect, useRef} from 'react';
import {Animated, Pressable, StyleSheet, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {useApp} from '../state/AppContext';
import {TINT, alpha, mix} from '../theme/tokens';
import {Icon} from './Icon';
import {T} from './common';
import type {Sub} from '../engine/types';

/* Tile — icon over name at inline-start; active dot hugging the wall at
   inline-end with the in-window count inboard of it; translucent sparkline
   of the whole curve (earliest active dose → window close) with a "now" dot. */
export function Tile({sub, fresh, onPress, onLongPress}:{sub:Sub; fresh?:boolean; onPress:()=>void; onLongPress:(x:number,y:number)=>void}){
  const {colors, dir, tr, eng} = useApp();
  const live = eng.closeAt(sub.id)>0;
  const n = eng.inWindowCount(sub.id);
  const sp = live ? eng.sparkFor(sub.id) : null;
  const tint = TINT[sub.c];
  const flash = useRef(new Animated.Value(fresh?1:0)).current;
  useEffect(()=>{ if(fresh){ flash.setValue(1); Animated.timing(flash,{toValue:0,duration:650,useNativeDriver:false}).start(); } },[fresh]);
  const bg = live ? mix(colors.ember, colors.slate1, .05) : colors.slate1;
  return (
    <Pressable testID={`tile-${sub.id}`} onPress={onPress} onLongPress={e=>onLongPress(e.nativeEvent.pageX, e.nativeEvent.pageY)} delayLongPress={450}
      accessibilityRole="button" accessibilityLabel={tr.sn(sub)}
      style={({pressed})=>[st.tile, {borderColor:colors.lineHard, backgroundColor:pressed?colors.slate3:bg}]}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill,{backgroundColor:alpha(colors.iris,.25), opacity:flash}]}/>
      {sp ? (
        <View pointerEvents="none" style={st.spark}>
          <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <Path d={sp.d+'L100 100L0 100Z'} fill={colors.sparkFill}/>
            <Path d={sp.d} fill="none" stroke={colors.sparkLine} strokeWidth={1.3} strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
          </Svg>
          <View style={{position:'absolute', left:`${sp.nx}%`, top:`${sp.ny}%`, marginLeft:-3, marginTop:-3, width:6, height:6, borderRadius:3, backgroundColor:colors.bone, borderWidth:2, borderColor:colors.slate1}}/>
        </View>
      ) : null}
      <View style={{flexDirection:dir.row, alignItems:'flex-start', justifyContent:'space-between', gap:4}}>
        <View style={{alignItems:dir.rtl?'flex-end':'flex-start', gap:4, flexShrink:1}}>
          <Icon k={sub.i} size={16} color={tint}/>
          <T f="sansSemi" size={11.5} numberOfLines={2} style={{lineHeight:14, letterSpacing:-.15}}>{tr.sn(sub)}</T>
        </View>
        {/* dot at the wall, count inboard */}
        <View style={{flexDirection:dir.rtl?'row':'row-reverse', alignItems:'center', gap:4, paddingTop:3}}>
          <View style={{width:6, height:6, borderRadius:3, backgroundColor:live?colors.leaf:colors.dust, opacity:live?1:.45,
            ...(live?{shadowColor:colors.leaf, borderWidth:2, borderColor:alpha(colors.leaf,.22), width:10, height:10, borderRadius:5}:{})}}/>
          {n ? <T f="monoMed" size={9.5} c={colors.haze} testID={`tile-${sub.id}-count`} style={{writingDirection:'ltr'}}>{`(${n})`}</T> : null}
        </View>
      </View>
    </Pressable>
  );
}

export function AddTile({onPress}:{onPress:()=>void}){
  const {colors, dir, tr} = useApp();
  return (
    <Pressable testID="tile-add" onPress={onPress} accessibilityRole="button" accessibilityLabel={tr.t('grid.add')}
      style={({pressed})=>[st.tile, {borderColor:colors.lineHard, backgroundColor:pressed?colors.slate3:colors.ink}]}>
      <View style={{alignItems:dir.rtl?'flex-end':'flex-start', gap:4}}>
        <Icon k="plus" size={16} color={colors.dust}/>
        <T f="sansMed" size={11.5} c={colors.haze} numberOfLines={2} style={{lineHeight:14}}>{tr.t('grid.add')}</T>
      </View>
    </Pressable>
  );
}

const st = StyleSheet.create({
  tile:{flex:1, aspectRatio:1, borderWidth:StyleSheet.hairlineWidth, paddingTop:9, paddingHorizontal:9, paddingBottom:8, overflow:'hidden'},
  spark:{position:'absolute', left:'8%', right:'8%', top:'50%', bottom:'12%'},
});
