/* Theme tokens — the dark set is the original design; light swaps the set.
   Nothing in the UI may hard-code a surface or text colour. */
export const DARK = {
  ink:'#0A0D11', slate1:'#12171E', slate2:'#181F28', slate3:'#212B36',
  line:'#1E2630', lineHard:'#28323E', lineHover:'#39465E',
  bone:'#E7ECF2', haze:'#93A1B1', dust:'#5C6A79',
  iris:'#8B9DF7', irisHover:'#9BABF9', onAccent:'#0C1020',
  ember:'#E3A54F', clay:'#E0766B', leaf:'#6FC28A',
  chartDim:'#39434F', chartTotal:'#C4CDD6', chartFaint:'#3C4854',
  sparkLine:'rgba(147,161,177,.55)', sparkFill:'rgba(147,161,177,.10)',
  scrim:'rgba(4,6,9,.72)',
  isDark:true,
};
export const LIGHT: Colors = {
  ink:'#F5F7FA', slate1:'#FFFFFF', slate2:'#EEF1F5', slate3:'#E3E8EE',
  line:'#E2E7ED', lineHard:'#D2DAE3', lineHover:'#AEBBCA',
  bone:'#141A22', haze:'#4E5C6C', dust:'#8493A3',
  iris:'#4F63D9', irisHover:'#4356C9', onAccent:'#FFFFFF',
  ember:'#B97A1E', clay:'#C4534A', leaf:'#2E9E58',
  chartDim:'#C9D2DC', chartTotal:'#243040', chartFaint:'#AEB8C4',
  sparkLine:'rgba(78,92,108,.5)', sparkFill:'rgba(78,92,108,.08)',
  scrim:'rgba(4,6,9,.55)',
  isDark:false,
};
export type Colors = typeof DARK;

/* category tints (same in both themes) */
export const TINT: Record<string,string> = {
  nic:'#8FA3BF', caf:'#C9996B', alc:'#C97F8C', can:'#93AE84', psy:'#A594D4', stim:'#DE8A6A',
  rx:'#7FB2C4', dep:'#8C93CC', benzo:'#6E9BD8', opi:'#CB7FB5', oth:'#8B98A5',
};

/* font families — one family name per weight (RN does not synthesise weights) */
export const F = {
  sansLight:'IBMPlexSansHebrew_300Light',
  sans:'IBMPlexSansHebrew_400Regular',
  sansMed:'IBMPlexSansHebrew_500Medium',
  sansSemi:'IBMPlexSansHebrew_600SemiBold',
  sansBold:'IBMPlexSansHebrew_700Bold',
  mono:'IBMPlexMono_400Regular',
  monoMed:'IBMPlexMono_500Medium',
  monoSemi:'IBMPlexMono_600SemiBold',
};

/* tint with alpha: "#RRGGBB" + 0..1 → rgba() */
export function alpha(hex:string, a:number){
  const h=hex.replace('#',''); const n=parseInt(h.length===3?h.split('').map(c=>c+c).join(''):h,16);
  return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;
}
/* mix a tint into a surface (approximation of CSS color-mix) */
export function mix(hex:string, base:string, p:number){
  const H=(x:string)=>{ const h=x.replace('#',''); const n=parseInt(h.length===3?h.split('').map(c=>c+c).join(''):h,16); return [(n>>16)&255,(n>>8)&255,n&255]; };
  const a=H(hex), b=H(base); const c=a.map((v,i)=>Math.round(v*p+b[i]*(1-p)));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
