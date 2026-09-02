import test from 'node:test';
import assert from 'node:assert/strict';
import {isBlockedAsk} from '../src/refusal.mjs';

const REFUSED = [
  'כמה לקחת?', 'כמה כדאי לקחת מזה', 'מה המינון של MDMA', 'מינון בטוח לקטמין',
  'כמה מ"ג זה בסדר', 'כמה גרם', 'כמה כדורים אפשר', 'עוד מנה עכשיו?', 'מתי אפשר מנה נוספת',
  'איך מכינים DMT', 'איך למצות קודאין', 'איפה משיגים את זה', 'איפה קונים בטלגראס',
  'how much mdma should i take', 'how many pills can i take', 'what is a good dose',
  'safe dosage for ketamine?', 'when can i redose', 'how to extract dxm',
  'how to grow mushrooms', 'where can i buy lsd', 'is 100mg a lot', 'האם 200 מ"ג זה הרבה',
];
const ALLOWED = [
  'כמה זמן זה יימשך?', 'עוד כמה זמן החלון נסגר', 'מה החפיפה בין אלכוהול לקנאביס',
  'אפשר לישון עכשיו?', 'כמה מים כדאי לשתות', 'מסוכן לנהוג עכשיו?', 'איך להכין את עצמי לירידה',
  'how long until it wears off', 'how much is still active in my system',
  'how much water should i drink', 'is it safe to drive', 'can i sleep now',
  'how to make it stop', 'where can i get help', 'where to get tested',
  'what does the overlap between alcohol and cannabis mean', 'i feel anxious, what helps',
];

for (const q of REFUSED) test(`refuses: ${q}`, () => assert.equal(isBlockedAsk(q), true));
for (const q of ALLOWED) test(`allows: ${q}`, () => assert.equal(isBlockedAsk(q), false));
