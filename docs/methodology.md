# מתודולוגיה — מקורות הנתונים הפרמקוקינטיים ומטריצת הסיכונים

> עודכן: **2026-08-31** · נדרש לפי [`app-store.md`](app-store.md) (סעיף 1.4.1) · מקושר מחוק 3 ב-[`../CLAUDE.md`](../CLAUDE.md)

## מה המודל, ומה הוא לא

כל עקומה ב-safesub היא **הערכת אוכלוסייה, לא מדידה**. המנוע (חד-תאי, מסדר ראשון; אלכוהול מסדר-אפס; מורף לאכילים ולשחרור מושהה) מקבל שלושה פרמטרים לחומר:

| פרמטר | משמעות | מקור טיפוסי |
|---|---|---|
| `tp` | דקות עד שיא (מרישום ועד שיא ההשפעה המורגשת) | tmax פלזמה, מתוקן לפי ספרות אפקט סובייקטיבי |
| `hl` | מחצית חיים אפקטיבית של הדעיכה המורגשת (דקות) | t½ אלימינציה; כשהאפקט קצר מהפלזמה — פרמטר-אפקט מוצהר |
| `dur` | חלון אקוטי משוער (דקות) | ספרות אפקט סובייקטיבי |

`ev` מדרג את חוזק הביסוס: **A** — נתוני PK אנושיים מוצקים; **B** — נתונים בינוניים/מוסקים מנתיב דומה; **C** — דלים/אקסטרפולציה. הדירוג מוצג למשתמש במסך הלמידה (חוק 3).

**שונות בין-אישית גדולה בכוונה אינה במודל** (CYP2D6/CYP1A2, משקל, מין, כבד, סבילות) — היא מוצגת טקסטואלית. אין במסד שום נתון מינון.

## אימות מול הספרות (2026-08-31)

נבדקו ~35 רשומות מפתח מול מקורות קליניים. ארבעה ערכים תוקנו בעקבות האימות, אחד שודרג במטריצה:

| תיקון | לפני → אחרי | מקור |
|---|---|---|
| קוקאין `tp` | 20 → **30 דק׳** | tmax תוך-אפי ‎~26±20 דק׳ (McGrath 2020); 15–60 דק׳ (Jeffcoat) |
| מסקלין `hl` | 360 → **210 דק׳** | t½ ‎≈3.5 שע׳ (Basel, Ley 2024) |
| גת `hl` | 190 → **120 דק׳** | קתינון t½ ‎1.5±0.8 שע׳ (Toennes 2003) |
| גז צחוק `hl` | 3 → **5 דק׳** | t½ אלימינציה ~5 דק׳ (דו-תאי 2.4/31 דק׳) |
| סנוס `tp` | 30 → **60 דק׳** | tmax ~1 שע׳ (Digard 2013, NTR) |
| DXM+SSRI | לא בטוח → **מסוכן** | TripSit: Dangerous; דיווחי תסמונת סרוטונין |

## טבלת המקורות (רשומות מרכזיות)

| חומר | tp/hl/dur במסד (דק׳) | ביסוס עיקרי |
|---|---|---|
| ניקוטין (סיגריה) | 9/120/35 | t½ ~2 שע׳; הצטברות לאורך יום (Benowitz; SGR 1988) |
| פאוץ׳/מסטיק/סנוס | 30–60/120/45–60 | tmax 30–60 דק׳ (Digard 2013; Nicorette PI) |
| קפאין (קפה/תה/אנרגיה) | 40–45/280–300/120–240 | t½ 4–5 שע׳, טווח 1.5–9.5; tmax 30–60 דק׳ (StatPearls; Alsabri 2018) |
| אלכוהול | 35/קצב ~מנה·שע׳/90 | סדר-אפס ~0.015 g/dL·h (Jones; StatPearls Zero-Order) |
| THC בעישון | 10/120/180 | שיא פלזמה 3–10 דק׳; אפקט מרבי 15–30 דק׳, דועך 2–3 שע׳ (Grotenhermen 2003; Huestis 2005) |
| אכיל (מורף) | עיכוב 60–150 דק׳ | ספיגה איטית ולא-צפויה (Grotenhermen) |
| MDMA | 120/510/300 | t½ 8–9 שע׳; tmax ~2 שע׳; לא-לינארי CYP2D6 (de la Torre; Huestis 2025 popPK) |
| קוקאין | 30/75/75 | t½ ~1–1.5 שע׳; tmax IN ~26–36 דק׳ (Cone; McGrath 2020) |
| מתאמפטמין | 30/600/480 | t½ 10.1 שע׳ (6.4–15) (Cruickshank 2009) |
| ד-אמפטמין (אטנט/וייבנס) | 180/600/420 | tmax ~3 שע׳ IR; t½ 10–12 שע׳ (StatPearls; FDA label) |
| מתילפנידאט | 90/180/210; LA: 120/360 | t½ ~2–3.5 שע׳; קונצרטה ~12 שע׳ חלון (FDA Concerta label) |
| מפדרון/קתינונים | 45/130/150 | t½ 2.15 שע׳ (Papaseit 2016, Neuropsychopharmacology) |
| גת | 120/120/180 | קתינון t½ 1.5 שע׳; tmax 1.5–2.5 שע׳ (Toennes 2003) |
| LSD | 120/210/540 | t½ 3.6 שע׳; tmax 1.7 שע׳; משך 8.2–11.6 שע׳ (Dolder/Holze/Liechti) |
| פסילוסיבין | 120/150/360 | פסילוצין t½ 1.4–3 שע׳; tmax ~2 שע׳; משך 5.5–6.4 שע׳ (Holze 2023) |
| 2C-B | 90/120/300 | onset 0.5–1.2 שע׳; t½ 1.2–2.5 שע׳; משך 3–5 שע׳ (Papaseit 2018) |
| מסקלין | 120/210/600 | tmax ~2 שע׳; t½ ~3.5 שע׳; משך ~9–11 שע׳ (Ley 2024) |
| DMT בעישון | 3/15/15 | שיא 2–8 דק׳; משך <30 דק׳ (Strassman; MNT) |
| קטמין | 22/180/55 | tmax IN ‎22.5 דק׳; t½ 2–3 שע׳; נורקטמין t½ ~12 שע׳ (Drugs.com monograph; Yanagihara) |
| GHB | 45/40/120 | t½ ~35 דק׳; tmax 20–60 דק׳ (Xyrem PI; Abanades) |
| גז צחוק | 1/5/3 | t½ ~5 דק׳, ריאתי (StatPearls; Lindholm 2026) |
| בנזודיאזפינים | — | אלפרזולם ~12; קלונאזפאם 20–80; דיאזפאם ~43+; לוראזפאם 10–20; זולפידם ~2.5; ברוטיזולם 3.6–7.9 (Griffin; PsychiatryRx; Springer) |
| אוקסיקודון | 60/210/300 | t½ 3–5 שע׳ IR (StatPearls) |
| טרמדול | 120/360/360 | t½ ~6 שע׳ (9+ במנת-יתר) (Hassanian-Moghaddam 2015) |
| קודאין | 60/180/270 | t½ ~3 שע׳; CYP2D6 → מורפין |
| הרואין | 15/180/240 | הרואין t½ 2–6 דק׳ → ‎6-MAM 6–25 דק׳ → מורפין 2–4 שע׳; העקומה מודלת את שלב המורפין (StatPearls Heroin) |
| פנטניל | 5/220/60 | t½ 3–7 שע׳ (רה-דיסטריבוציה שומנית) |
| מתדון | chronic | t½ 8–59 שע׳, הצטברות (StatPearls) |
| בופרנורפין | chronic | t½ 24–42 שע׳ (Suboxone PI) |
| פרגבלין | 90/380/480 | t½ 6.3 שע׳ מבוגרים (Lyrica PI) |
| DXM | 150/240/360 | t½ 2–4 שע׳ (EM); 2–24 שע׳ טווח CYP2D6 (StatPearls) |
| קראטום | 60/200/240 | ⚠️ מיטרגינין t½ טרמינלי ~24 שע׳ (Trakulsrichai 2015); `hl` כאן הוא **פרמטר-אפקט** למשך המורגש (~3–4 שע׳) — לא t½ פלזמה. ev=C |
| מודפיניל | 150/780/600 | t½ 12–15 שע׳ (Provigil PI) |
| קווטיאפין | 90/420/480 | t½ ~7 שע׳ (StatPearls) |
| סילדנפיל | 60/240/240 | t½ ~4 שע׳ (Viagra PI) |
| פסאודואפדרין | 120/360/300 | t½ 5–8 שע׳ ב-pH שתן רגיל (Kanfer) |
| מלטונין | 50/50/120 | t½ 40–60 דק׳ (Tordjman; PMC11510348) |
| אקמול | 45/150/270 | t½ 2–3 שע׳ (StatPearls Acetaminophen) |
| איבופרופן | 90/120/360 | t½ ~2 שע׳ (StatPearls Ibuprofen) |
| דיפירון | 90/160/300 | MAA t½ 2.6–3.5 שע׳ (Levy 1995; Brinkman 2025) |
| SSRI/SNRI/ליתיום/MAOI | chronic | steady-state; פלואוקסטין+נורפלואוקסטין שבועות (PI) |

## מטריצת האינטראקציות

בסיס: **טבלת השילובים של TripSit** (wiki.tripsit.me/wiki/Drug_combinations) + ספרות קלינית, בשלוש רמות רזולוציה: זוג מפורש → חומר×קטגוריה → קטגוריה×קטגוריה. אומתה מול הטבלה ב-2026-08-31.

**מקומות שבהם אנחנו מחמירים מ-TripSit בכוונה** (צמצום נזקים ללא ניטור רפואי):

| זוג | TripSit | safesub | נימוק |
|---|---|---|---|
| MDMA+אלכוהול | Caution | לא בטוח | התייבשות/היפרתרמיה; ספרות ER |
| MDMA+קוקאין | Caution | לא בטוח | עומס קרדיווסקולרי כפול |
| אלכוהול+קנאביס | Low Risk & Synergy | זהירות | green-out, פגיעה מוטורית מוכפלת |

ליתיום+פסיכדלים (מסוכן אצלנו) אינו בטבלת TripSit — מבוסס סדרת מקרים (Nayak 2021: פרכוסים ב-47% מדיווחי שילוב ליתיום+פסיכדל).

## מקורות מרכזיים (קריאה ישירה)

- Benowitz NL — Nicotine pharmacology; [SGR 1988 ch.2](https://whyquit.com/CDC/SGR_1988_Chapter_2_Nicotine_Pharmacokinetics.pdf)
- [StatPearls: Caffeine](https://www.ncbi.nlm.nih.gov/books/NBK519490/) · [Zero-Order Kinetics](https://www.ncbi.nlm.nih.gov/books/NBK499866/) · [Quetiapine](https://www.ncbi.nlm.nih.gov/books/NBK459145/) · [DXM Toxicity](https://www.ncbi.nlm.nih.gov/books/NBK538502/) · [Heroin Toxicity](https://www.ncbi.nlm.nih.gov/books/NBK430736/) · [Kratom](https://www.ncbi.nlm.nih.gov/books/NBK585120/) · [Nitrous Oxide](https://www.ncbi.nlm.nih.gov/books/NBK532922/) · [Dextroamphetamine](https://www.ncbi.nlm.nih.gov/books/NBK507808/)
- Dolder/Holze/Liechti — [LSD PK/PD](https://academic.oup.com/ijnp/article/19/1/pyv072/2910049), [Holze 2024 BJCP](https://bpspubs.onlinelibrary.wiley.com/doi/10.1111/bcp.15887)
- Holze 2023 — [Psilocybin PK/PD, CPT](https://ascpt.onlinelibrary.wiley.com/doi/10.1002/cpt.2821)
- Ley 2024 — [Mescaline dose-response, Basel](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11442856/)
- Papaseit 2016 — [Mephedrone vs MDMA](https://www.nature.com/articles/npp201675) · Papaseit 2018 — [2C-B](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5859368/)
- Huestis 2025 — [MDMA popPK, CPT:PSP](https://ascpt.onlinelibrary.wiley.com/doi/10.1002/psp4.13282)
- McGrath 2020 — [Intranasal cocaine PK](https://journals.sagepub.com/doi/10.1177/1945892419896241)
- Cruickshank 2009 — [Methamphetamine clinical pharmacology](https://pubmed.ncbi.nlm.nih.gov/19426289/)
- Toennes 2003 — [Khat alkaloids PK](https://pubmed.ncbi.nlm.nih.gov/12848785/)
- Grotenhermen 2003 — [Cannabinoid PK](https://pubmed.ncbi.nlm.nih.gov/12648025/)
- Trakulsrichai 2015 — [Mitragynine PK in man](https://pubmed.ncbi.nlm.nih.gov/25995615/)
- Brinkman 2025 — [Metamizole pharmacology, BJCP](https://bpspubs.onlinelibrary.wiley.com/doi/full/10.1002/bcp.70101)
- [TripSit combination chart](https://wiki.tripsit.me/wiki/Drug_combinations)
- FDA labels: Concerta, Lyrica, Provigil, Viagra, Xyrem, Suboxone (accessdata.fda.gov)

## גבולות ידועים

1. **קראטום** — פער מוצהר בין t½ פלזמה (יום) למשך האפקט (שעות); המודל עוקב אחר האפקט. ev=C.
2. **MDMA** — קינטיקה לא-לינארית; המודל לינארי ומסומן כפחות מדויק (בקטלוג ובמסך הלמידה).
3. **אכילים** — שונות הספיגה עצומה; המורף (עיכוב 60–150 דק׳) הוא מרכז הטווח.
4. **מינון-תלות** — `df` הוא סקלר גס של עוצמה יחסית, לא סימולציית ריכוז.
5. חומרים בקטגוריית ev=C (סינתטיים, 5-MeO-DMT, סלוויה) — הערכות גסות במוצהר.
