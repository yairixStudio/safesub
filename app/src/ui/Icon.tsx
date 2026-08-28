import React from 'react';
import Svg, {Path, Rect, Circle, G} from 'react-native-svg';
import {ICONS, type IconEl} from './icons';

function els(list: IconEl[], keyPrefix=''): React.ReactNode[] {
  return list.map((e,i)=>{
    const k=keyPrefix+i;
    switch(e.t){
      case 'path': return <Path key={k} d={e.d}/>;
      case 'rect': return <Rect key={k} x={e.x} y={e.y} width={e.w} height={e.h} rx={e.rx}/>;
      case 'circle': return <Circle key={k} cx={e.cx} cy={e.cy} r={e.r}/>;
      case 'g': return <G key={k} transform={e.transform}>{els(e.el,k+'.')}</G>;
    }
  });
}

/* 24×24 line icon from the demo's icon set, stroked in `color` */
export function Icon({k, size=16, color, strokeWidth=1.6, fill='none'}:{k:string; size?:number; color:string; strokeWidth?:number; fill?:string}){
  const list=ICONS[k]||[];
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size} fill={fill} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {els(list)}
    </Svg>
  );
}
