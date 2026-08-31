import {SUBS} from '../src/engine/catalog';
import {riskFor, medHits, explicitRisksOf} from '../src/engine/interactions';
import {makeEngine} from '../src/engine/pk';
import {makeTr, L} from '../src/i18n';
import {aiRead, localReply, stateSummary} from '../src/logic/advisor';
import {EMPTY_PROFILE} from '../src/engine/types';

const byId = (id:string) => SUBS.find(s=>s.id===id);

describe('interaction resolver', () => {
  test('explicit pair beats category rules and is symmetric', () => {
    const a = riskFor('alc','ket',byId)!, b = riskFor('ket','alc',byId)!;
    expect(a.sev).toBe('danger'); expect(a.k).toBe('alc_ket'); expect(b.k).toBe('alc_ket');
  });
  test('id × category rule: lithium with any psychedelic is dangerous', () => {
    for(const id of ['lsd','psi','dmt','mesc']) expect(riskFor('lith',id,byId)?.sev).toBe('danger');
  });
  test('category × category safety net: two opioids, benzo + alcohol', () => {
    expect(riskFor('oxy','cod',byId)?.k).toBe('opi_opi');
    expect(riskFor('alpr','alc',byId)?.k).toBe('benzo_alc');
  });
  test('the old dead rows are alive: stimulant + caffeine', () => {
    expect(riskFor('coc','cof',byId)?.k).toBe('stim_caf');
    expect(riskFor('mdma','nrg',byId)?.k).toBe('stim_caf');
  });
  test('no rule → undefined (coffee + melatonin)', () => {
    expect(riskFor('cof','mela',byId)).toBeUndefined();
  });
  test('every risk key resolves in both dictionaries', () => {
    const seen = new Set<string>();
    for(const s of SUBS) for(const o of SUBS){ if(s.id>=o.id) continue; const r=riskFor(s.id,o.id,byId); if(r) seen.add(r.k); }
    for(const k of seen){ expect((L.he.risk as any)[k]).toBeTruthy(); expect((L.en.risk as any)[k]).toBeTruthy(); }
    expect(seen.size).toBeGreaterThan(40);
  });
  test('profile meds: lithium flags psychedelics, benzo flags alcohol, unknown text flags nothing', () => {
    expect(medHits('ליתיום 300mg','psy')[0]?.sev).toBe('danger');
    expect(medHits('Xanax','alc')[0]?.k).toBe('benzo_dep');
    expect(medHits('vitamin c','psy')).toHaveLength(0);
  });
  test('explicit pairs for the learn page', () => {
    expect(explicitRisksOf('ghb').map(r=>r.o).sort()).toEqual(['alc','ket','n2o']);
  });
});

describe('advisor', () => {
  const now = new Date(2026,7,26,21,30,0,0).getTime();
  const log = [{id:'alc', t:now-30*60000, q:2, sub:'beer', key:'a'}, {id:'ket', t:now-10*60000, q:40, sub:null, key:'b'}];
  const eng = makeEngine(log, now, byId);
  test('reading names the dangerous active combination, in Hebrew and English', () => {
    const he = aiRead(eng, makeTr('he'), byId, EMPTY_PROFILE);
    const en = aiRead(eng, makeTr('en'), byId, EMPTY_PROFILE);
    expect(he.empty).toBe(false); expect(he.rec).toContain('מסוכן'); expect(he.rec).toContain('קטמין');
    expect(en.rec).toContain('Dangerous'); expect(en.rec).toContain('Ketamine');
  });
  test('empty journal → empty reading', () => {
    expect(aiRead(makeEngine([], now, byId), makeTr('he'), byId, EMPTY_PROFILE).empty).toBe(true);
  });
  test('anonymous summary carries age/sex/weight/height/meds but never the name', () => {
    const p = {...EMPTY_PROFILE, name:'Dana', age:31, weight:62, height:168, sex:'f' as const, meds:'lithium'};
    const s = stateSummary(eng, makeTr('en'), byId, p);
    expect(s).not.toContain('Dana');
    expect(s).toContain('31'); expect(s).toContain('62 kg'); expect(s).toContain('168 cm');
    expect(s).toContain('Female'); expect(s).toContain('lithium');
  });
  test('local responder answers the alcohol question against an open cannabis window', () => {
    const e2 = makeEngine([{id:'can', t:now-20*60000, q:1, sub:'joint', key:'c'}], now, byId);
    expect(localReply(e2, makeTr('he'), byId, EMPTY_PROFILE, 'אפשר לשתות אלכוהול?')).toContain('גרינ-אאוט');
    expect(localReply(e2, makeTr('en'), byId, EMPTY_PROFILE, 'can I drink alcohol?')).toContain('greening out');
  });
});
