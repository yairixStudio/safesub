# אסטרטגיית כניסה לחנויות

> חלק מ-[`../CLAUDE.md`](../CLAUDE.md) · עודכן: **2026-08-26**
>
> ⚠️ **נוסחי ה-guidelines והתקדימים כאן נכונים לתאריך הזה בלבד.** לפני בניית חבילת הגשה — משוך מחדש מ-[developer.apple.com/app-store/review/guidelines](https://developer.apple.com/app-store/review/guidelines/) וּודא שהתקדימים עדיין בחנות.

---

## השורה התחתונה

**זה לא תחום אסור. זה תחום שדורש מיצוב נכון.** יש תקדים ישיר בחנות, יש שלושה סעיפים שמכריעים, ויש שתי מלכודות ספציפיות למוצר הזה.

---

## התקדים

**[KnowDrugs Drug Checking](https://apps.apple.com/us/app/knowdrugs-drug-checking/id1152858301)** — app id `1152858301`, בחנות מאז 2016. אפליקציית harm reduction שעושה **יותר** ממה ש-safesub מתכננת: אגרגציה של תוצאות בדיקות חומרים מארגונים אירופיים (Saferparty Zurich, CheckIt! Vienna, The Loop), מידע על 200+ חומרים, ולפי [האתר שלהם](https://knowdrugs.app/) — גם `dosages, duration, side-effects and dangerous interactions`. במילותיהם: גרסה שמישה של TripSit ו-PsychonautWiki — **בדיוק מקור הנתונים של `RISK` אצלנו.** הם non-profit.

תקדים שני: [Transparency Harm Reduction](https://apps.apple.com/us/app/transparency-harm-reduction/id6504291757).

### היחס בין התקדים למלכודת — לקרוא ביחד

זה נשמע סותר ואינו סותר:

1. **הקטגוריה מותרת.** KnowDrugs מציגה מינונים ועומדת בחנות תשע שנים. אין איסור גורף על harm reduction.
2. **כלל אי-המינונים של safesub הוא ערך מוצרי** שקדם לשיקולי החנות — והוא **גם** קונה מרווח ציות רחב יותר משיש ל-KnowDrugs.
3. **שדה המ״ג הוא המקום היחיד שבו האפליקציה נראית כמו כלי מינון** — וזו מלכודת 1.4.2 למטה. המיטיגציה היא מסגור בלשון עבר בלבד.

---

## שלושת הסעיפים

### 1.4.3 — הסעיף שמכריע

> *"Apps that encourage consumption of tobacco and vape products, illegal drugs, or excessive amounts of alcohol are not permitted. Apps that encourage minors to consume any of these substances will be rejected. Facilitating the sale of controlled substances (except for licensed pharmacies and licensed or otherwise legal cannabis dispensaries), or tobacco is not allowed."*

המילים הן **encourage** ואחריה **sale**. safesub לא עושה אף אחת. כל האסטרטגיה היא להפוך את זה למובן מאליו לאדם שנותן לך ארבע דקות.

### 1.4.1 — הסעיף שנכתב בשביל המוצר הזה

> *"Apps must clearly disclose data and methodology to support accuracy claims relating to health measurements, and if the level of accuracy or methodology cannot be validated, we will reject your app."*
> *"Apps should remind users to check with a doctor in addition to using the app and before making medical decisions."*

safesub מציגה עקומות שנראות כמו מדידה. **הכנות האפיסטמית שכבר בנויה במוצר היא נכס הציות** — השורה `ערכים ממוצעים מהספרות — הערכה בלבד, לא מדידה` היא בדיוק מה שהסעיף מבקש.

שתי פעולות נדרשות:

- **פרסם מסמך מתודולוגיה ציבורי** עם המקורות שמהם הגיעו `tp` ו-`hl` לכל חומר ב-`SUBS`, ו-`RISK` לכל שילוב. קשר אליו מתוך האפליקציה. (זה כבר קיים כדוח מחקר — צריך לפרסם ולקשר.)
- **הוסף תזכורת מפורשת לפנות לרופא.** כרגע יש "לא ייעוץ רפואי" — הסעיף מבקש יותר מזה.

### 1.4.2 — המלכודת

> *"Drug dosage calculators must come from the drug manufacturer, a hospital, university, health insurance company, pharmacy or other approved entity, or receive approval by the FDA or one of its international counterparts."*

ב-`SUBS` יש שדות מ״ג עם `step:25, def:75` (MDMA), `step:10, def:40` (קטמין), ו-`doseFactor` שמשנה את גובה העקומה לפי הכמות. **בוחן שרואה קלט-מ״ג ← עקומה עלול לתייג "dosage calculator"** — ולדחות תחת סעיף שאין שום דרך לעמוד בו (אתה לא בית חולים ולא יצרן).

**המיטיגציה — לשון עבר בלבד, בלי יוצא מן הכלל:**

- האפליקציה לוקחת מינון **רק כתיעוד של מה שכבר נלקח.** לעולם לא כפלט, לעולם לא כהצעה.
- הכפתור בדמו כבר כתוב נכון: `לקחתי כעת`. **שמור על זה בכל מחרוזת בממשק** — כל טקסט בלשון עתיד או ציווי סביב כמות הוא באג ציות.
- אף מסך לא מציע כמות ולא ממליץ.
- ה-`def:` הממולא מראש הוא החלטה פתוחה — ראה [`stack.md`](stack.md).

---

## מה שיגרום לדחייה בפועל: היועץ

**הבוחן יקליד "כמה MDMA לקחת".** זה יקרה.

ה-`SYSTEM_PROMPT` אוסר מינונים — אבל זו הנחיה למודל, לא ערובה. נדרשת **שכבת סירוב דטרמיניסטית בצד השרת**, לפני המודל: שאילתות שמבקשות כמות / מינון / הכנה / השגה נחסמות בקוד ומחזירות תשובת harm-reduction קבועה, בלי להגיע ל-LLM בכלל.

זה גם הדבר היחיד בשכבת ה-AI שאפשר **להוכיח** בהערות לבוחן. פירוט: [`ai-advisor.md`](ai-advisor.md).

---

## חבילת ההגשה

הבוחן קורא את הליסטינג ואת הערות הבדיקה לפני שהוא נוגע באפליקציה. אל תשלח אותה עירומה.

### תיאור בחנות
פותח ב-harm reduction, לא בחומרים. "כלי לצמצום נזקים… לא מעודד שימוש… 18+… לא ייעוץ רפואי." **אל תקבור את זה בסוף.**

### App Review Notes
כתוב שם במפורש:
- זו אפליקציית harm reduction.
- אין מכירה, אין השגה, אין הוראות הכנה, **אין המלצות מינון**.
- שדות המינון הם תיעוד רטרוספקטיבי בלבד.
- מקורות הנתונים: TripSit והספרות הקלינית — **קישור לדוח המתודולוגיה**.
- יש שכבת סירוב דטרמיניסטית לשאלות מינון ביועץ.
- הנתונים נשמרים מקומית בלבד; אין חשבון ואין ענן.
- **הזכר את KnowDrugs (app id 1152858301) בשמו כתקדים.**

### גיבוי ארגוני — הלֶבֶר החזק ביותר
האפליקציה כבר מקשרת ל[אל-סם](https://alsam.org.il) ול[חוף מבטחים](https://safeshore.org.il). **קבל מהם מכתב תמיכה או שיתוף פעולה רשמי וצרף אותו.**

הפער בין "מפתח יחיד" ל"כלי שפועל בשיתוף ארגוני צמצום נזקים מוכרים" הוא הפער בין דחייה לאישור. KnowDrugs הוא non-profit — זה לא במקרה.

### דירוג גיל — 18+
Apple [החליפה את המדרג ב-2025](https://developer.apple.com/news/?id=ks775ehf): 12+ ו-17+ בוטלו, נוספו 13+ / 16+ / **18+**.

- בשאלון: סמן **frequent** references לחומרים (זה מה שדוחף ל-18+).
- בנוסף: **הגדר ידנית מינימום גיל 18** — Apple הוסיפה את היכולת הזו.
- **אל תנסה לרדת ל-16+.** 13+ מוגדר כ-"infrequent references"; זה לא אנחנו, וניסיון לרדת נראה כמו התחמקות.

### TestFlight חיצוני — מהלך זול לפני ההגשה
build חיצוני עובר Beta App Review אמיתי (קליל יותר מבדיקת שחרור). זה נותן אות מוקדם על המיצוב **לפני** שדחייה נכנסת לתיק שלך.

---

## Google Play

קל יותר, וגבול אחר.

[מדיניות Illegal Activities](https://play.google.com/about/restricted-content/illegal-activities) אוסרת:
- הקלה על **מכירה או רכישה** של סמים
- הצגה או עידוד שימוש **על ידי קטינים**
- **הוראות גידול או ייצור**

safesub לא נוגעת באף אחת מהשלוש.

הסעיף שכן רלוונטי הוא [Health Content and Services](https://support.google.com/googleplay/android-developer/answer/12261419) — מידע בריאותי מטעה או לא בטוח. **אותה תרופה בדיוק כמו 1.4.1:** מתודולוגיה גלויה, "הערכה ולא מדידה", מקורות מצוטטים.

---

## אם נדחית

זה לא סוף. דחיות 1.4.3 על אפליקציות harm reduction מתהפכות בדיוק על ההבחנה שבמילה *encourage*.

1. **Resolution Center** — טיעון ממוקד: הסעיף אומר *encourage*, והאפליקציה עושה את ההפך. צטט: מנגנון הסירוב הדטרמיניסטי למינונים, התקדים בחנות (בשם ובמספר), הגיבוי הארגוני, ומסמך המתודולוגיה.
2. **App Review Board** — אם ה-Resolution Center נתקע.
3. **בינתיים ה-web/PWA באוויר.** זו הסיבה השנייה ל-Capacitor — ראה [`stack.md`](stack.md).

---

## מקורות

- [App Review Guidelines — Apple](https://developer.apple.com/app-store/review/guidelines/)
- [KnowDrugs — App Store](https://apps.apple.com/us/app/knowdrugs-drug-checking/id1152858301) · [knowdrugs.app](https://knowdrugs.app/)
- [Transparency Harm Reduction — App Store](https://apps.apple.com/us/app/transparency-harm-reduction/id6504291757)
- [Updated age ratings in App Store Connect](https://developer.apple.com/news/?id=ks775ehf)
- [Google Play — Illegal Activities](https://play.google.com/about/restricted-content/illegal-activities)
- [Google Play — Health Content and Services](https://support.google.com/googleplay/android-developer/answer/12261419)
