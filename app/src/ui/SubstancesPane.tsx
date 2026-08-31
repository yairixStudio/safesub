import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Keyboard, Pressable, ScrollView, TextInput, View} from 'react-native';
import {useApp} from '../state/AppContext';
import {searchText} from '../i18n';
import {TINT, alpha} from '../theme/tokens';
import {Icon} from './Icon';
import {T, Row} from './common';
import {Tile, AddTile} from './Tile';
import type {Sub} from '../engine/types';

/* The grid shows ONLY what the user added (MY). The catalogue sits behind the
   search box: a hit joins the list on tap, and only then becomes a tile. */
export function SubstancesPane({onLog, onCtx, searchRef}:{onLog:(id:string)=>void; onCtx:(id:string,x:number,y:number)=>void; searchRef:React.RefObject<TextInput|null>}){
  const app = useApp(); const {colors, dir, tr, subs, my, byId} = app;
  const [q, setQ] = useState('');
  const [fresh, setFresh] = useState<string|null>(null);
  const freshT = useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>()=>{ if(freshT.current) clearTimeout(freshT.current); },[]);
  const v = q.trim();

  const hits = useMemo(()=>{
    if(!v) return [];
    const lc=v.toLowerCase();
    const h=subs.filter(s=>searchText(s).includes(lc));
    h.sort((a,b)=>(tr.sn(a).toLowerCase().startsWith(lc)?0:1)-(tr.sn(b).toLowerCase().startsWith(lc)?0:1));
    return h;
  },[v, subs, tr]);

  /* the keyboard must go away with the results, otherwise the next tap on the
     grid only dismisses it and the tile never fires */
  function add(id:string){
    app.addToList(id); setQ(''); Keyboard.dismiss(); searchRef.current?.blur(); setFresh(id);
    if(freshT.current) clearTimeout(freshT.current);
    freshT.current=setTimeout(()=>setFresh(f=>f===id?null:f),700);
  }
  function addCustom(){ const s=app.addCustom(v); setQ(''); Keyboard.dismiss(); searchRef.current?.blur(); setFresh(s.id);
    if(freshT.current) clearTimeout(freshT.current);
    freshT.current=setTimeout(()=>setFresh(null),700); }

  const mine = my.map(byId).filter(Boolean) as Sub[];
  const rows: (Sub|'add')[][] = [];
  const cells: (Sub|'add')[] = [...mine, 'add'];
  for(let i=0;i<cells.length;i+=3) rows.push(cells.slice(i,i+3));

  return (
    <View style={{flex:1, paddingHorizontal:16}}>
      {/* search */}
      <View style={{paddingTop:2, paddingBottom:9}}>
        <View style={{position:'absolute', top:12, [dir.start]:12, zIndex:1}} pointerEvents="none"><Icon k="search" size={15} color={colors.dust} strokeWidth={1.9}/></View>
        <TextInput ref={searchRef} testID="search" value={q} onChangeText={setQ} placeholder={tr.t('grid.search')} placeholderTextColor={colors.dust}
          autoCorrect={false} autoCapitalize="none" returnKeyType="search"
          style={{height:36, borderRadius:4, backgroundColor:colors.slate1, borderWidth:1, borderColor:colors.line, color:colors.bone, fontSize:14, fontFamily:'IBMPlexSansHebrew_400Regular',
            paddingVertical:0, [dir.rtl?'paddingRight':'paddingLeft']:38, [dir.rtl?'paddingLeft':'paddingRight']:34, textAlign:dir.textAlign}}/>
        {v ? <Pressable testID="search-clear" onPress={()=>setQ('')} accessibilityLabel={tr.t('grid.clear')} style={{position:'absolute', top:10, [dir.end]:8, width:20, height:20, borderRadius:3, backgroundColor:colors.slate3, alignItems:'center', justifyContent:'center'}}>
          <Icon k="close" size={9} color={colors.haze} strokeWidth={2.4}/></Pressable> : null}
      </View>

      {v ? (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingBottom:14}}>
          {hits.length ? (<>
            <T f="mono" size={9} c={colors.dust} style={{paddingVertical:4, paddingHorizontal:2, letterSpacing:.4}}>{tr.t('grid.hits',hits.length)}</T>
            {hits.map(s=>{ const inl=my.includes(s.id); const tint=TINT[s.c]; return (
              <Pressable key={s.id} testID={`hit-${s.id}`} onPress={()=>add(s.id)} accessibilityRole="button"
                style={({pressed})=>({flexDirection:dir.row, alignItems:'center', gap:10, paddingVertical:9, paddingHorizontal:4, borderBottomWidth:1, borderBottomColor:colors.line, backgroundColor:pressed?colors.slate2:'transparent'})}>
                <View style={{width:28, height:28, borderRadius:2, alignItems:'center', justifyContent:'center', backgroundColor:alpha(tint,.11)}}><Icon k={s.i} size={15} color={tint} strokeWidth={1.8}/></View>
                <View style={{flex:1}}>
                  <T f="sansMed" size={13.5}>{tr.sn(s)}</T>
                  <T f="mono" size={9.5} c={colors.dust}>{tr.cat(s.c)}{s.kind==='chronic'?' · '+tr.t('page.chronic'):' · t½ '+tr.hl(s.hl||s.tp)}</T>
                </View>
                <View style={{borderWidth:1, borderRadius:2, paddingVertical:4, paddingHorizontal:8, borderColor:inl?colors.lineHard:alpha(colors.iris,.45)}}>
                  <T f="monoMed" size={9.5} c={inl?colors.dust:colors.iris} align="center">{inl?tr.t('grid.inList'):tr.t('grid.addb')}</T>
                </View>
              </Pressable>); })}
          </>) : (
            <View style={{borderWidth:1, borderStyle:'dashed', borderColor:colors.lineHard, borderRadius:2, padding:20, alignItems:'center', gap:12}}>
              <T size={13} c={colors.dust} align="center">{tr.t('grid.noHit',v)}</T>
              <Pressable testID="add-custom" onPress={addCustom} accessibilityRole="button" style={{paddingVertical:9, paddingHorizontal:16, borderRadius:3, borderWidth:1, borderColor:alpha(colors.iris,.45)}}>
                <T f="sansSemi" size={12.5} c={colors.iris} align="center">{tr.t('grid.addCustom',v)}</T>
              </Pressable>
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView testID="grid" keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingBottom:14}}>
          <View style={{padding:1}}>
            {rows.map((r,i)=>(
              <View key={i} style={{flexDirection:dir.row}}>
                {r.map(c=> c==='add'
                  ? <AddTile key="add" onPress={()=>searchRef.current?.focus()}/>
                  : <Tile key={c.id} sub={c} fresh={fresh===c.id} onPress={()=>onLog(c.id)} onLongPress={(x,y)=>onCtx(c.id,x,y)}/>)}
                {r.length<3 ? Array.from({length:3-r.length}).map((_,k)=><View key={'e'+k} style={{flex:1}}/>) : null}
              </View>
            ))}
          </View>
          {!mine.length ? (
            <View testID="grid-empty" style={{marginTop:10, borderWidth:1, borderStyle:'dashed', borderColor:colors.lineHard, borderRadius:2, paddingVertical:34, paddingHorizontal:20, gap:6}}>
              <T f="sansSemi" size={13} c={colors.haze} align="center">{tr.t('grid.emptyT')}</T>
              <T size={13} c={colors.dust} align="center" style={{lineHeight:23}}>{String(tr.t('grid.emptyB')).replace('<br>','\n')}</T>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}
