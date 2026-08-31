/* Production hardening: extreme states, hostile persisted data, day-boundary
   maths, and a performance budget for journals far beyond realistic size. */
import {makeEngine} from '../src/engine/pk';
import {SUBS} from '../src/engine/catalog';
import type {Entry} from '../src/engine/types';

const byId = (id:string) => SUBS.find(s=>s.id===id);
const NOW = new Date(2026,7,31,21,30,0,0).getTime();
const M = (m:number) => NOW - m*60000;
const e = (id:string, min:number, q=1, sub:string|null=null, key?:string): Entry => ({id, t:M(min), q, sub, key:key||`${id}${min}`});

describe('extreme states', () => {
  test('empty journal: everything is quiet and nothing throws', () => {
    const g = makeEngine([], NOW, byId);
    expect(g.activeIds()).toEqual([]);
    expect(g.windowLeft('cig')).toBe(0);
    expect(g.closeAt('cig')).toBe(0);
    expect(g.sparkFor('cig')).toBeNull();
    expect(g.inWindowCount('cig')).toBe(0);
  });
  test('unknown / removed substance ids in the log are ignored', () => {
    const g = makeEngine([e('nope',10), e('cig',10)], NOW, byId);
    expect(g.activeIds()).toEqual(['cig']);
    expect(g.levelAt('nope',0)).toBe(0);
  });
  test('future-dated entries contribute nothing now but appear later', () => {
    const g = makeEngine([e('cig',-30)], NOW, byId);        /* 30 min in the future */
    expect(g.nowLevel('cig')).toBe(0);
    expect(g.levelAt('cig',40)).toBeGreaterThan(0);
    expect(g.inWindowCount('cig')).toBe(0);                 /* not in the body yet */
  });
  test('ancient entries (months old) contribute exactly zero', () => {
    const g = makeEngine([e('cig',60*24*90), e('can',60*24*365)], NOW, byId);
    expect(g.nowLevel('cig')).toBe(0);
    expect(g.activeIds()).toEqual([]);
  });
  test('absurd quantities: alcohol q=99 stays finite, capped intensity, window capped at 24h', () => {
    const g = makeEngine([e('alc',30,99)], NOW, byId);
    const v = g.nowLevel('alc');
    expect(Number.isFinite(v)).toBe(true);
    expect(v).toBeLessThanOrEqual(2.4);                     /* df cap */
    expect(g.windowLeft('alc')).toBeLessThanOrEqual(1440);
    const sp = g.sparkFor('alc');
    expect(sp).not.toBeNull();
    expect(sp!.d).not.toMatch(/NaN|Infinity/);
  });
  test('q=0 and negative q do not poison the maths', () => {
    const g = makeEngine([e('alc',30,0), e('cig',5,-3)], NOW, byId);
    for(const id of ['alc','cig']){
      expect(Number.isFinite(g.nowLevel(id))).toBe(true);
      const sp=g.sparkFor(id); if(sp) expect(sp.d).not.toMatch(/NaN/);
    }
  });
  test('many overlapping doses of one substance (chain smoker: 60 in 10 h)', () => {
    const log: Entry[] = Array.from({length:60},(_,i)=>e('cig', i*10, 1, null, 'c'+i));
    const g = makeEngine(log, NOW, byId);
    expect(g.nowLevel('cig')).toBeLessThanOrEqual(2.4*60);
    expect(g.inWindowCount('cig')).toBeGreaterThan(50);
    expect(g.windowLeft('cig')).toBeGreaterThan(0);
    expect(g.sparkFor('cig')!.d).not.toMatch(/NaN/);
  });
  test('chronic meds never open windows regardless of dose count', () => {
    const log: Entry[] = Array.from({length:30},(_,i)=>e('ssri', i*60, 10, null, 's'+i));
    const g = makeEngine(log, NOW, byId);
    expect(g.activeIds()).toEqual([]);
    expect(g.closeAt('ssri')).toBe(0);
    expect(g.todayCount('ssri')).toBeGreaterThan(0);        /* still journalled */
  });
  test('sub-type morph only fires on the exact key', () => {
    const a = makeEngine([e('can',120,1,'edible')], NOW, byId);
    const b = makeEngine([e('can',120,1,'EDIBLE')], NOW, byId);
    expect(a.nowLevel('can')).not.toBeCloseTo(b.nowLevel('can'));
  });
});

describe('day boundaries and clock edges', () => {
  test('todayCount flips exactly at local midnight', () => {
    const midnight = new Date(2026,7,31,0,0,30,0).getTime();  /* 00:00:30 local */
    const g = makeEngine([{id:'cig', t:midnight-60000, q:1, sub:null, key:'a'},
                          {id:'cig', t:midnight+1000,  q:1, sub:null, key:'b'}], midnight+120000, byId);
    expect(g.todayCount('cig')).toBe(1);
    expect(g.isYesterday(midnight-60000)).toBe(true);
  });
  test('Israel DST fall-back day (Oct 25 2026): day maths stays sane', () => {
    const now = new Date(2026,9,25,12,0,0,0).getTime();
    const g = makeEngine([{id:'cig', t:new Date(2026,9,25,0,30,0,0).getTime(), q:1, sub:null, key:'a'}], now, byId);
    expect(g.todayCount('cig')).toBe(1);
    expect(g.dayEnd - g.dayStart).toBeGreaterThanOrEqual(24*3600000);   /* 25h day */
  });
  test('engine built with clock skew (now before every entry) stays finite', () => {
    const g = makeEngine([e('cig',10), e('alc',20,2)], NOW - 3600000, byId);
    for(const id of ['cig','alc']) expect(Number.isFinite(g.levelAt(id,0))).toBe(true);
  });
});

describe('performance budget', () => {
  const big: Entry[] = [];
  for(let i=0;i<10000;i++){
    const s = SUBS[i % SUBS.length];
    big.push({id:s.id, t:M(i*7), q:(i%3)+1, sub:null, key:'k'+i});   /* ~48 days of heavy use */
  }
  test('10,000-entry journal: build + full chart sampling under 150 ms', () => {
    const t0 = performance.now();
    const g = makeEngine(big, NOW, byId);
    const ids = g.activeIds();
    for(const id of ids) for(let tau=-240; tau<=720; tau+=8) g.levelAt(id,tau);
    for(const s of SUBS){ g.inWindowCount(s.id); g.closeAt(s.id); g.sparkFor(s.id); }
    const ms = performance.now()-t0;
    expect(ms).toBeLessThan(150);
  });
  test('repeat cycles (steady state renders) stay under 80 ms each', () => {
    const t0 = performance.now();
    for(let k=0;k<5;k++){
      const g = makeEngine(big, NOW + k*30000, byId);
      for(const id of g.activeIds()) for(let tau=-240; tau<=720; tau+=8) g.levelAt(id,tau);
    }
    expect((performance.now()-t0)/5).toBeLessThan(80);
  });
});

describe('hostile persisted data (what restore must survive)', () => {
  test('entries with NaN / string / missing fields do not break the engine', () => {
    const hostile = [
      {id:'cig', t:NaN, q:1, sub:null, key:'x1'},
      {id:'cig', t:'yesterday', q:1, sub:null, key:'x2'},
      {id:'cig', t:M(5), q:'two', sub:null, key:'x3'},
      {id:'alc', t:M(5), q:Infinity, sub:null, key:'x4'},
      {id:'cig', t:M(5)} as any,
    ] as unknown as Entry[];
    const g = makeEngine(hostile, NOW, byId);
    /* nothing must throw; results must be finite or zero */
    for(const id of ['cig','alc']){
      const v=g.levelAt(id,0);
      expect(Number.isNaN(v)).toBe(false);
      expect(Number.isFinite(v)).toBe(true);
      g.sparkFor(id); g.windowLeft(id); g.closeAt(id);
    }
  });
});
