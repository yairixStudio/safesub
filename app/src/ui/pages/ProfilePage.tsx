import React, {useEffect, useState} from 'react';
import {ScrollView, TextInput, View} from 'react-native';
import {useApp} from '../../state/AppContext';
import {Icon} from '../Icon';
import {T, Row, Chip, Btn, Page} from '../common';

export function ProfilePage({open, onClose}:{open:boolean; onClose:()=>void}){
  const app = useApp(); const {colors, dir, tr, profile} = app;
  const [name,setName]=useState(''); const [age,setAge]=useState(''); const [weight,setWeight]=useState(''); const [height,setHeight]=useState('');
  const [sex,setSex]=useState<'f'|'m'|'x'|null>(null); const [meds,setMeds]=useState(''); const [saved,setSaved]=useState(false);
  const closeT = React.useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>()=>{ if(closeT.current) clearTimeout(closeT.current); },[]);
  useEffect(()=>{ if(!open) return; setName(profile.name||''); setAge(profile.age?String(profile.age):''); setWeight(profile.weight?String(profile.weight):''); setHeight(profile.height?String(profile.height):''); setSex(profile.sex); setMeds(profile.meds||''); setSaved(false); },[open]);
  const Field=({label, value, onChange, placeholder, numeric, testID, flex}:{label:string; value:string; onChange:(v:string)=>void; placeholder:string; numeric?:boolean; testID:string; flex?:number})=>(
    <View style={{flex:flex??1, minWidth:0}}>
      <T f="mono" size={9.5} c={colors.dust} style={{letterSpacing:.5, marginBottom:5}}>{label}</T>
      <TextInput testID={testID} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={colors.dust} keyboardType={numeric?'numeric':'default'}
        style={{height:38, borderRadius:3, backgroundColor:colors.slate1, borderWidth:1, borderColor:colors.lineHard, paddingHorizontal:11, paddingVertical:0, color:colors.bone, fontFamily:numeric?'IBMPlexMono_400Regular':'IBMPlexSansHebrew_400Regular', fontSize:13.5, textAlign:dir.textAlign}}/>
    </View>
  );
  const save=()=>{ app.saveProfile({name:name.trim(), age:+age||null, weight:+weight||null, height:+height||null, sex, meds:meds.trim()}); setSaved(true); if(closeT.current) clearTimeout(closeT.current); closeT.current=setTimeout(onClose,550); };
  return (
    <Page open={open} onClose={onClose} title={tr.t('profile.title')} testID="page-profile"
      right={<Row gap={5}><Icon k="lock" size={10} color={colors.dust} strokeWidth={1.8}/><T f="mono" size={9} c={colors.dust} style={{letterSpacing:.2}}>{tr.t('profile.local')}</T></Row>}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingHorizontal:16, paddingTop:14, paddingBottom:26}}>
        <T size={11.5} c={colors.haze} style={{lineHeight:19, marginBottom:14}}>{tr.t('profile.sub')}</T>
        <Row gap={7} align="flex-start" style={{marginBottom:10}}>
          <Field testID="p-name" label={tr.t('profile.name')} value={name} onChange={setName} placeholder={tr.t('profile.optional')}/>
          <Field testID="p-age" label={tr.t('profile.age')} value={age} onChange={setAge} placeholder="—" numeric/>
        </Row>
        <Row gap={7} align="flex-start" style={{marginBottom:10}}>
          <Field testID="p-weight" label={tr.t('profile.weight')} value={weight} onChange={setWeight} placeholder="—" numeric/>
          <Field testID="p-height" label={tr.t('profile.height')} value={height} onChange={setHeight} placeholder="—" numeric/>
        </Row>
        <T f="mono" size={9.5} c={colors.dust} style={{letterSpacing:.5, marginBottom:5}}>{tr.t('profile.sex')}</T>
        <Row gap={6} style={{marginBottom:10}}>
          {(['f','m','x'] as const).map(v=><Chip key={v} testID={`sex-${v}`} label={tr.t('profile.sex'+v.toUpperCase())} on={sex===v} onPress={()=>setSex(sex===v?null:v)}/>)}
        </Row>
        <View style={{marginBottom:10}}><Field testID="p-meds" label={tr.t('profile.meds')} value={meds} onChange={setMeds} placeholder={tr.t('profile.medsPh')}/></View>
        <Btn testID="p-save" kind="primary" label={tr.t('profile.save')} onPress={save} style={{height:42, marginTop:3}}/>
        <T f="mono" size={9.5} c={colors.leaf} align="center" style={{marginTop:8, height:14}}>{saved?tr.t('profile.saved'):''}</T>
        <T f="mono" size={8.5} c={colors.dust} align="center" style={{marginTop:9, letterSpacing:.2, lineHeight:15}}>{tr.t('profile.note')}</T>
      </ScrollView>
    </Page>
  );
}
