# Contributing to safesub

**תקציר בעברית:** תרומות מתקבלות בשמחה — בעיקר נתוני פרמקוקינטיקה עם מקורות, כללי אינטראקציות, תרגומים וטסטים. הקווים האדומים: שום תוכן מינונים, שום ייעוץ רפואי, שום טלמטריה. שינויי תוכן נעשים ב-`demo-reference.html` ומג׳ונרטים משם; ה-golden test חייב לעבור. הפרטים למטה באנגלית; מסמך ההתמצאות המלא בעברית: [`CLAUDE.md`](CLAUDE.md).

---

safesub is a harm-reduction app. That mission comes with hard lines that are
not up for debate in code review — please read this page before opening a PR.

## The red lines (PRs crossing them are closed, kindly but firmly)

1. **No dosing content of any kind.** No amounts, no mg/kg tables, no
   redosing schedules, no preparation or sourcing instructions — not in code,
   strings, comments, docs, or issue discussions. Timing, overlap detection,
   and general safety principles only.
2. **No medical advice.** The app estimates and informs; it never diagnoses
   or prescribes. Emergency paths always point to humans (MDA 101, ERAN 1201).
3. **Estimates stay honest.** Every number is a population average from
   published literature, carries an evidence grade (`ev: 'A'|'B'|'C'`), and the
   UI must keep saying so. Nothing may present an estimate as a measurement.
4. **Privacy is architecture, not a setting.** No telemetry, no analytics, no
   accounts, no cloud sync, no crash reporting. Nothing leaves the device
   except the documented anonymous advisor summary ([docs/ai-advisor.md](docs/ai-advisor.md)).

Also not welcome: moralizing or fear-based copy (the product tone is sober and
non-judgmental), and hand edits to generated files (see workflow below).

## What we'd love help with

| Area | What it looks like | Where |
|---|---|---|
| **PK data** | Corrections or additions to onset/peak/half-life/duration, with primary sources (DOI/PMID) and an evidence grade per [docs/methodology.md](docs/methodology.md) | `SUBS` in `demo-reference.html` |
| **Interaction rules** | New or corrected substance-pair / category risks, with sources | `RISK`/`IDCAT`/`CATRISK` in the demo |
| **Translations** | A new language is a new ~730-key dictionary; Hebrew is the source of truth. Native-level fluency required | `L` in the demo → `app/src/i18n` |
| **Tests** | Jest edge cases for the engine; new Maestro flows (read [docs/testing.md](docs/testing.md) first — the driver lessons are hard-won) | `app/__tests__`, `app/e2e` |
| **UI / accessibility** | Font scaling, screen readers, RTL edge cases, small-screen layouts | `app/src/ui` |
| **Docs** | Clarifications, corrections, English versions of Hebrew docs | `docs/` |

Best first step for data changes: **open a "Data correction" issue** with your
sources before writing code — agreement on the evidence is the real review.

## Workflow (the part that surprises people)

- **`demo-reference.html` is the source of truth** for the catalogue, rules,
  strings, and design tokens. Content changes are made there first, then
  regenerated into the app: `node tools/gen-app-data.mjs`. Never hand-edit
  `app/src/engine/catalog.ts`, `rules.ts`, `app/src/i18n/he.ts`, `en.ts`, or
  `app/src/ui/icons.ts` — they are generated and will be overwritten.
- **The PK curves are the product.** `node test/run.mjs` compares 2,316 curve
  samples against a golden file; it must PASS. If you intend to change the
  curves (a data correction), run `node test/run.mjs --update` deliberately and
  justify the change with sources in the PR.
- **App checks:** `cd app && npm test && npm run typecheck` before every PR.
- **UI changes:** run the Maestro suite (`app/e2e/run.sh`) against an Android
  emulator, and read the "UI driver lessons" in [docs/testing.md](docs/testing.md)
  — several innocent-looking patterns (animated native text, overflowing
  menus, open keyboards) break the suite invisibly.
- **Style invariants:** direction comes from the app, not the OS — use
  `dir.row`/`dir.textAlign` (never React Native `start`/`end`); every color
  goes through theme tokens (no hardcoded surface/text colors, including in
  JS-built SVG); every user-facing string exists in **both** `L.he` and `L.en`
  and is accessed via `t()`.
- Keep PRs small and focused; fill in the PR template checklist.

## Conduct

This project serves people at vulnerable moments. Be kind in reviews, keep
discussions free of judgment about substance use, and remember that the person
on the other side of an issue may be sharing something personal.
