/* PK GOLDEN TEST — the RN engine must reproduce the demo's curves exactly.
   Same frozen log as ../../test/fixture.mjs, same golden file. */
import {readFileSync} from 'fs';
import {join} from 'path';
import {makeEngine} from '../src/engine/pk';
import {SUBS} from '../src/engine/catalog';

/* frozen clock: 2026-08-26T21:30:00 local */
const NOW = new Date(2026,7,26,21,30,0,0).getTime();
const M = (m:number) => NOW - m*60000;
const LOG = [
  {id:'cig',  t:M(5),   q:1, sub:'reg',     key:'k1'},
  {id:'cig',  t:M(45),  q:1, sub:null,      key:'k2'},
  {id:'cig',  t:M(200), q:1, sub:'thin',    key:'k3'},
  {id:'mdma', t:M(90),  q:100, sub:'crystal', key:'k4'},
  {id:'mdma', t:M(20),  q:50,  sub:null,    key:'k5'},
  {id:'alc',  t:M(150), q:3, sub:'beer',    key:'k6'},
  {id:'alc',  t:M(30),  q:1, sub:'shot',    key:'k7'},
  {id:'can',  t:M(120), q:1, sub:'edible',  key:'k8'},
  {id:'can',  t:M(15),  q:2, sub:'joint',   key:'k9'},
  {id:'mph',  t:M(300), q:20, sub:'la',     key:'k10'},
  {id:'mph',  t:M(60),  q:10, sub:'mg10',   key:'k11'},
  {id:'ssri', t:M(600), q:10, sub:'sert',   key:'k12'},
  {id:'cof',  t:M(1400),q:2, sub:'black',   key:'k13'},
  {id:'ket',  t:M(10),  q:40, sub:'powder', key:'k14'},
  {id:'lsd',  t:M(240), q:1, sub:'blotter', key:'k15'},
];
const IDS = ['cig','mdma','alc','can','mph','ssri','cof','ket','lsd','coc','tea','mela'];

const byId = (id:string) => SUBS.find(s=>s.id===id);
const gold = JSON.parse(readFileSync(join(__dirname,'..','..','test','golden-pk.json'),'utf8'));

describe('PK engine vs demo golden', () => {
  const eng = makeEngine(LOG, NOW, byId);
  test('curve samples are bit-identical (2,316 samples)', () => {
    let n=0, maxDiff=0;
    for(const id of IDS){
      const want:number[] = gold.levels[id];
      const got:number[] = [];
      for(let tau=-240; tau<=720; tau+=5) got.push(eng.levelAt(id,tau));
      expect(got.length).toBe(want.length);
      for(let i=0;i<want.length;i++){ const d=Math.abs(want[i]-got[i]); if(d>maxDiff) maxDiff=d; n++; }
    }
    expect(n).toBe(2316);
    expect(maxDiff).toBeLessThanOrEqual(1e-9);
  });
  test('windows, today counts and active ordering match', () => {
    for(const id of IDS){
      expect(Math.abs(gold.windows[id]-eng.windowLeft(id))).toBeLessThanOrEqual(10);
      expect(eng.todayCount(id)).toBe(gold.today[id]);
    }
    expect(eng.activeIds().join()).toBe(gold.active.join());
  });
  test('tile reads are consistent with the engine', () => {
    expect(eng.inWindowCount('cig')).toBe(3);
    expect(eng.inWindowCount('coc')).toBe(0);
    expect(eng.closeAt('cig')).toBe(eng.windowLeft('cig'));
    const sp = eng.sparkFor('cig');
    expect(sp).not.toBeNull();
    expect(sp!.nx).toBeGreaterThan(0); expect(sp!.nx).toBeLessThan(100);
    expect(eng.sparkFor('coc')).toBeNull();
  });
});
