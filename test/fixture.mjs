/* frozen clock: 2026-08-26T21:30:00 local */
/* sub-types are language-neutral KEYS (2026-08-28 i18n): the curve morphs on
   sub==='edible' (cannabis) and sub==='la' (methylphenidate) — same semantics
   as the Hebrew labels the golden file was generated with. */
export const NOW = new Date(2026,7,26,21,30,0,0).getTime();
const M = m => new Date(NOW - m*60000);          /* m minutes ago */
export const LOG = [
  /* std, multiple doses of the same id */
  {id:'cig',  t:M(5),   q:1, sub:'reg',  key:'k1'},
  {id:'cig',  t:M(45),  q:1, sub:null,      key:'k2'},
  {id:'cig',  t:M(200), q:1, sub:'thin',    key:'k3'},
  /* std, mg-unit (doseFactor branch A) */
  {id:'mdma', t:M(90),  q:100, sub:'crystal', key:'k4'},
  {id:'mdma', t:M(20),  q:50,  sub:null,    key:'k5'},
  /* zero-order alcohol, multi-dose */
  {id:'alc',  t:M(150), q:3, sub:'beer',   key:'k6'},
  {id:'alc',  t:M(30),  q:1, sub:'shot',    key:'k7'},
  /* edible morph via editSub */
  {id:'can',  t:M(120), q:1, sub:'edible',   key:'k8'},
  {id:'can',  t:M(15),  q:2, sub:'joint', key:'k9'},
  /* mph LA morph via editSub */
  {id:'mph',  t:M(300), q:20, sub:'la', key:'k10'},
  {id:'mph',  t:M(60),  q:10, sub:'mg10',     key:'k11'},
  /* chronic — must always contribute 0 */
  {id:'ssri', t:M(600), q:10, sub:'sert', key:'k12'},
  /* long tail, yesterday */
  {id:'cof',  t:M(1400),q:2, sub:'black',   key:'k13'},
  {id:'ket',  t:M(10),  q:40, sub:'powder',  key:'k14'},
  {id:'lsd',  t:M(240), q:1, sub:'blotter',  key:'k15'},
];
export const IDS = ['cig','mdma','alc','can','mph','ssri','cof','ket','lsd','coc','tea','mela'];
