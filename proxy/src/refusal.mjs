/* =========================================================================
   THE DETERMINISTIC REFUSAL LAYER — hard rule #1 in code, before any model.
   A store reviewer typing "how much MDMA should I take" must hit THIS, not
   a model's judgment (docs/ai-advisor.md). Errs toward refusing
   dose-adjacent asks, with carve-outs so distress/help/water/test-kit
   questions always pass through.
   ========================================================================= */

/* clauses about water are hydration questions, not dose asks — strip them
   before matching (a combined "how much X and how much water" clause is
   under-refused here; the system prompt still refuses doses downstream) */
const WATER_CLAUSE = /[^.?!\n]*(?:מים|water)[^.?!\n]*/g;

const RULES = [
  /* Hebrew: dose/amount */
  /מינון|מינונים|למנן/,
  /כמה\s+(?:מ["״׳']?ג|מיליגרם|גרם|גרמים|כדור|כדורים|טיפ(?:ה|ות)|שאיפ(?:ה|ות)|מנ(?:ה|ות))/,
  /כמה\s+(?:כדאי\s+|צריך\s+|אפשר\s+|בטוח\s+)?(?:לקחת|לצרוך|לשתות|לבלוע|להסניף|לעשן|להזריק)/,
  /מנה\s+נוספת|עוד\s+מנה|בוסטר/,
  /* Hebrew: preparation / sourcing */
  /איך\s+(?:מכינים|להכין(?!\s+את\s+עצמ)|לבשל|למצות|לזקק|לגדל|לייצר|מייצרים)/,
  /איפה\s+(?:משיגים|להשיג|קונים|לקנות)|טלגראס/,
  /* English: dose/amount */
  /\bdos(?:e|es|age|ing)\b|\bredos\w*|\bre-dose\b/,
  /\bhow\s+(?:much|many)\b[^?.!\n]{0,60}\b(?:take|use|drink|smoke|snort|swallow|ingest|drop)\b/,
  /* English: preparation ("how to make it/this stop" is distress — excluded) */
  /\bhow\s+(?:do\s+(?:i|you)\s+|to\s+|can\s+i\s+)?(?:make|cook|extract|synthesi[sz]e|grow)\b(?!\s+(?:it|this|that|them|me|the)\b)/,
  /* English: sourcing ("where to get help/tested/narcan" — excluded) */
  /\bwhere\s+(?:can\s+i\s+|do\s+(?:i|you)\s+|to\s+)?(?:buy|get|score|order|find)\b(?!\s+(?:help|support|test|tested|a\s+test|narcan|naloxone))/,
  /* numeric amounts in either language are dose talk */
  /\b\d+(?:\.\d+)?\s*(?:mg|milligrams?|mcg|µg|ug|grams?|g)\b/,
  /\d+(?:\.\d+)?\s*(?:מ["״׳']?ג|מיליגרם|גרם)/,
];

export function isBlockedAsk(question){
  const t = String(question || '').toLowerCase().replace(WATER_CLAUSE, ' ');
  return RULES.some(r => r.test(t));
}
