/* Shared building blocks: direction-aware text and rows, chips, segmented
   control, buttons, and the full-page shell with a back button. */
import React, {useEffect, useRef} from 'react';
import {Animated, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type StyleProp, type TextStyle, type ViewStyle} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useApp} from '../state/AppContext';
import {F, alpha} from '../theme/tokens';
import {Icon} from './Icon';

/* text with the app font, colour and direction defaults */
export function T({children, f='sans', c, size=13, style, align, numberOfLines, testID, a11yHidden}:{
  children?:React.ReactNode; f?:keyof typeof F; c?:string; size?:number; style?:StyleProp<TextStyle>;
  align?:'left'|'right'|'center'; numberOfLines?:number; testID?:string;
  /* decorative text that changes constantly (a countdown): keep it out of the
     accessibility tree so screen readers and UI drivers see a stable screen */
  a11yHidden?:boolean;
}){
  const {colors, dir} = useApp();
  /* Android picks paragraph direction from the first strong character, so a
     Hebrew line that starts with a Latin word ("safesub …") would lay out LTR.
     An invisible directional mark pins the paragraph to the UI direction. */
  const first = typeof children==='string' ? children : (Array.isArray(children) && typeof children[0]==='string' ? children[0] : '');
  const strong = /[A-Za-z\u0590-\u05FF]/.exec(first)?.[0] || '';
  const mixed = /[A-Za-z]/.test(first) && /[\u0590-\u05FF]/.test(first);
  const opposite = mixed && (dir.rtl ? /[A-Za-z]/.test(strong) : /[\u0590-\u05FF]/.test(strong));
  const mark = opposite ? (dir.rtl ? '\u200F' : '\u200E') : '';
  return <Text testID={testID} numberOfLines={numberOfLines} accessible={!a11yHidden} importantForAccessibility={a11yHidden?'no-hide-descendants':'auto'} style={[{fontFamily:F[f], color:c||colors.bone, fontSize:size, textAlign:align||dir.textAlign, writingDirection:dir.rtl?'rtl':'ltr'}, style]}>{mark}{children}</Text>;
}

/* a row laid out in reading direction */
export function Row({children, style, gap=0, align='center', justify}:{children?:React.ReactNode; style?:StyleProp<ViewStyle>; gap?:number; align?:ViewStyle['alignItems']; justify?:ViewStyle['justifyContent']}){
  const {dir} = useApp();
  return <View style={[{flexDirection:dir.row, alignItems:align, justifyContent:justify, gap}, style]}>{children}</View>;
}

export function Chip({label, on, onPress, testID}:{label:string; on?:boolean; onPress?:()=>void; testID?:string}){
  const {colors} = useApp();
  return (
    <Pressable testID={testID} onPress={onPress} accessibilityRole="button" accessibilityState={{selected:!!on}}
      style={{paddingVertical:7, paddingHorizontal:12, borderRadius:3, borderWidth:1,
        backgroundColor:on?alpha(colors.iris,.12):colors.slate1, borderColor:on?alpha(colors.iris,.5):colors.lineHard}}>
      <T f="sansMed" size={12.5} c={on?colors.iris:colors.haze} align="center">{label}</T>
    </Pressable>
  );
}

export function Seg<V extends string>({opts, value, onChange, testIDPrefix}:{opts:[V,string][]; value:V; onChange:(v:V)=>void; testIDPrefix?:string}){
  const {colors, dir} = useApp();
  return (
    <View style={{flexDirection:dir.row, gap:4}}>
      {opts.map(([v,label])=>{ const on=v===value; return (
        <Pressable key={v} testID={testIDPrefix?`${testIDPrefix}-${v}`:undefined} onPress={()=>onChange(v)} accessibilityRole="button" accessibilityState={{selected:on}}
          style={{paddingVertical:6, paddingHorizontal:10, borderRadius:3, borderWidth:1,
            backgroundColor:on?alpha(colors.iris,.12):'transparent', borderColor:on?alpha(colors.iris,.5):colors.lineHard}}>
          <T f="sansMed" size={11.5} c={on?colors.iris:colors.haze} align="center">{label}</T>
        </Pressable>); })}
    </View>
  );
}

export function Btn({label, kind='primary', onPress, style, testID, icon}:{label:string; kind?:'primary'|'ghost'|'accent'|'danger'|'dangerArmed'; onPress?:()=>void; style?:StyleProp<ViewStyle>; testID?:string; icon?:string}){
  const {colors, dir} = useApp();
  const bg = kind==='primary'?colors.iris : kind==='dangerArmed'?colors.clay : 'transparent';
  const border = kind==='ghost'?colors.lineHard : kind==='accent'?alpha(colors.iris,.4) : kind==='danger'?alpha(colors.clay,.45) : 'transparent';
  const fg = kind==='primary'||kind==='dangerArmed'?colors.onAccent : kind==='ghost'?colors.haze : kind==='accent'?colors.iris : colors.clay;
  return (
    <Pressable testID={testID} onPress={onPress} accessibilityRole="button"
      style={[{height:40, borderRadius:3, borderWidth:1, borderColor:border, backgroundColor:bg, alignItems:'center', justifyContent:'center', flexDirection:dir.row, gap:6, paddingHorizontal:12}, style]}>
      {icon ? <Icon k={icon} size={14} color={fg} strokeWidth={1.9}/> : null}
      <T f="sansSemi" size={13} c={fg} align="center">{label}</T>
    </Pressable>
  );
}

/* horizontal chip row that reads in UI direction: in RTL the first item sits at
   the right edge and the row starts scrolled to that end */
export function HScroll({children, gap=6, style, contentStyle}:{children:React.ReactNode; gap?:number; style?:StyleProp<ViewStyle>; contentStyle?:StyleProp<ViewStyle>}){
  const {dir} = useApp();
  const ref = useRef<ScrollView>(null);
  const items = React.Children.toArray(children);
  const ordered = dir.rtl ? [...items].reverse() : items;
  return (
    <ScrollView ref={ref} horizontal showsHorizontalScrollIndicator={false} style={style}
      contentContainerStyle={[{flexDirection:'row', gap, flexGrow:1, justifyContent:dir.rtl?'flex-end':'flex-start'}, contentStyle]}
      onContentSizeChange={()=>{ if(dir.rtl) ref.current?.scrollToEnd({animated:false}); }}>
      {ordered}
    </ScrollView>
  );
}

/* the section heading used on pages */
export function SecHead({title, count}:{title:string; count?:number|string}){
  const {colors} = useApp();
  return (
    <Row justify="space-between" style={{marginBottom:8}} align="baseline">
      <T f="sansSemi" size={11.5} c={colors.haze} style={{letterSpacing:.5}}>{title}</T>
      {count!==undefined ? <T f="mono" size={9} c={colors.dust}>{String(count)}</T> : null}
    </Row>
  );
}

/* a full page sliding in from the inline-end edge, with its own back button */
export function Page({open, onClose, title, right, children, testID, headerExtra}:{
  open:boolean; onClose:()=>void; title?:string; right?:React.ReactNode; children?:React.ReactNode; testID?:string; headerExtra?:React.ReactNode;
}){
  const {colors, dir, tr} = useApp();
  const {width} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const x = useRef(new Animated.Value(open?0:1)).current;
  const [mounted, setMounted] = React.useState(open);
  useEffect(()=>{
    if(open){ setMounted(true); Animated.timing(x,{toValue:0,duration:280,useNativeDriver:true}).start(); }
    else Animated.timing(x,{toValue:1,duration:240,useNativeDriver:true}).start(({finished})=>{ if(finished) setMounted(false); });
  },[open]);
  if(!mounted) return null;
  const from = dir.rtl ? -width : width;   /* inline-end edge */
  return (
    <Animated.View testID={testID} style={[StyleSheet.absoluteFill, {paddingTop:insets.top, paddingBottom:insets.bottom, backgroundColor:colors.ink, transform:[{translateX:x.interpolate({inputRange:[0,1], outputRange:[0,from]})}]}]}>
      <Row gap={10} style={{paddingHorizontal:16, paddingTop:10, paddingBottom:12, borderBottomWidth:1, borderBottomColor:colors.line}}>
        <Pressable testID={testID?`${testID}-back`:undefined} onPress={onClose} accessibilityRole="button" accessibilityLabel={tr.t('common.back')}
          style={{width:32, height:32, borderRadius:3, borderWidth:1, borderColor:colors.lineHard, alignItems:'center', justifyContent:'center', transform:[{scaleX:dir.rtl?1:-1}]}}>
          <Icon k="chevR" size={15} color={colors.haze} strokeWidth={2}/>
        </Pressable>
        {headerExtra}
        {title ? <T f="sansSemi" size={17} style={{flex:1, letterSpacing:-.3}}>{title}</T> : null}
        {right}
      </Row>
      {children}
    </Animated.View>
  );
}
