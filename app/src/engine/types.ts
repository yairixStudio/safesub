export type Cat = 'nic'|'caf'|'alc'|'can'|'psy'|'stim'|'rx'|'dep'|'benzo'|'opi'|'oth';
export type Kind = 'std'|'zero'|'edible'|'chronic';
export type Sev = 'danger'|'unsafe'|'caution';
export type Unit = 'unit'|'cup'|'dose'|'time'|'session'|'mg'|'gram'|'can'|'tab'|'hit'|'balloon';
export type Evidence = 'A'|'B'|'C';

/* one catalogue record — language-neutral; names/notes/tips live in i18n */
export interface Sub {
  id: string;
  c: Cat;
  i: string;            /* icon key */
  u: Unit;
  kind: Kind;
  tp: number;           /* time-to-peak, min */
  hl?: number;          /* half-life, min (absent for zero-order) */
  dur: number;
  ev: Evidence;
  s: string[];          /* sub-type keys */
  editSub?: string;     /* the sub-type that morphs the curve */
  rate?: number;        /* zero-order clearance factor */
  step?: number;
  def?: number;
  nonlinear?: boolean;
  /* custom (user-created) substances carry their own name */
  n?: string;
  custom?: boolean;
}

/* one journal entry */
export interface Entry {
  id: string;
  t: number;            /* epoch ms */
  q: number;
  sub: string | null;
  key: string;
}

export interface Profile {
  name: string;
  age: number | null;
  weight: number | null;
  height: number | null;
  sex: 'f'|'m'|'x'|null;
  meds: string;
}

export type Lang = 'he'|'en';
export type Theme = 'system'|'dark'|'light';

export interface Settings {
  lang: Lang;
  theme: Theme;
  onb: boolean;
}

export const SEVRANK: Record<Sev, number> = {danger:3, unsafe:2, caution:1};
