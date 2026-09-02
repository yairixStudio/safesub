# safesub

**Harm-reduction companion: what is active in your body right now.**
Hebrew-first (RTL) with English, local-only data, React Native (Expo).

safesub does not encourage use and is not a quitting tool. It shows, in real time, the
estimated rise / peak / decline of what you logged — population-average pharmacokinetics
from the literature — and flags dangerous overlaps between active substances
(dangerous / unsafe / caution). No doses, ever. Not medical advice. Everything stays on
the device.

> The full orientation for contributors and AI agents is in [`CLAUDE.md`](CLAUDE.md) (Hebrew).

## Screenshots (Android emulator, captured by the Maestro flows)

| | | | |
|---|---|---|---|
| ![](docs/screenshots/01-onb-he.png) | ![](docs/screenshots/01-onb-en.png) | ![](docs/screenshots/01-empty-grid.png) | ![](docs/screenshots/02-search-hits.png) |
| ![](docs/screenshots/02-live-tile.png) | ![](docs/screenshots/02-sheet.png) | ![](docs/screenshots/03-danger-flag.png) | ![](docs/screenshots/03-intensity-combo.png) |
| ![](docs/screenshots/04-edit.png) | ![](docs/screenshots/06-lithium-flag.png) | ![](docs/screenshots/07-ctx.png) | ![](docs/screenshots/07-learn.png) |
| ![](docs/screenshots/09-chat.png) | ![](docs/screenshots/05-light-he.png) | ![](docs/screenshots/05-main-en.png) | ![](docs/screenshots/10-wipe-armed.png) |

## Layout

| path | what |
|---|---|
| [`app/`](app/) | the React Native app (Expo SDK 57, TypeScript) |
| `app/src/engine` | PK engine, 68-entry substance catalogue, interaction rules |
| `app/src/i18n` | Hebrew / English dictionaries (Hebrew is the source of truth) |
| `app/__tests__` | Jest: golden PK test (2,316 samples, zero drift) + interaction/advisor tests |
| `app/e2e` | Maestro user-flow simulations for the Android emulator |
| [`demo-reference.html`](demo-reference.html) | the original single-file reference demo — design and logic source of truth |
| [`test/`](test/) | the demo's golden PK test |
| [`docs/`](docs/) | stack decision, App Store strategy, AI-advisor architecture, [testing](docs/testing.md), [methodology & sources](docs/methodology.md), [production readiness](docs/production.md) |

## Run

```bash
cd app
npm install
npm test               # engine golden + interaction tests
npm run typecheck
npm run android:release   # builds a release APK and installs it on the running emulator
./e2e/run.sh           # Maestro flows against the emulator (screenshots in test-artifacts/)
```

Requirements: Node ≥ 20, JDK 17, Android SDK (API 34+), an AVD, Maestro.

## The four hard rules

1. **Never doses.** No amounts, no redosing schedules, no instructions. Timing, overlaps and general safety principles only.
2. **Not medical advice.** Emergency: MDA 101 · emotional first aid: ERAN 1201.
3. **Everything is an estimate.** Population averages; individual variation is shown, and so is how strong the data is (A/B/C per substance).
4. **Privacy above all.** No account, no cloud. The only thing that ever leaves the device is an anonymous state summary for the AI advisor — and only when you ask.

## Contributing

Contributions are very welcome — especially **pharmacokinetic data with sources,
interaction rules, translations, and tests**. Start with
[CONTRIBUTING.md](CONTRIBUTING.md): it explains exactly what we're looking for,
the workflow (the demo file is the source of truth; generated files are never
edited by hand; the golden curve test must pass), and the red lines — any
dosing content is closed on sight.

## License & attribution

[The Unlicense](LICENSE) — **public domain.** Use it, fork it, sell it, embed
it, for any purpose; no conditions, no notice to keep — not even attribution
is required.

**One ask (a request, not a requirement):** if you ship something built on
safesub — an app, a fork, a study — we'd love a credit to
**“safesub by Yairix Studio”** with a link to this repository.

## Legal & disclaimer

**safesub is an informational tool — not a medical device, and not medical advice.**

- Every number in the app is a **population-average estimate** from published
  literature, not a measurement of your body. Individual response varies widely
  (weight, sex, genetics, liver function, tolerance, interactions). Never use
  the app to conclude you are "safe" to drive, work, or take anything.
- The app **deliberately contains no dosing information** and will not provide any.
- Nothing in the app or this repository encourages the use of any substance.
  safesub exists to **reduce harm for adults (18+)** who have already made their
  own choices.
- Using safesub creates **no doctor–patient relationship**. For medical questions
  see a clinician. **In an emergency in Israel: MDA 101** · emotional first aid:
  ERAN 1201.
- Some substances in the catalogue are **illegal to possess or use** in Israel
  and elsewhere. Nothing here is legal advice, and the project does not assist
  in obtaining anything.
- The software is provided **“as is”, without warranty of any kind**; the authors
  and contributors accept **no liability** for anything done or not done based on
  it — see [LICENSE](LICENSE).

<details><summary><b>עברית</b></summary>

**safesub הוא כלי מידע — לא מכשיר רפואי ולא ייעוץ רפואי.** כל מספר באפליקציה
הוא הערכת ממוצע-אוכלוסייה מהספרות המקצועית, לא מדידה של הגוף שלך; השונות
הבין-אישית גדולה (משקל, מין, גנטיקה, תפקוד כבד, סבילות). אל תשתמש באפליקציה
כדי להסיק שאתה "בסדר" לנהוג, לעבוד או לקחת משהו. האפליקציה אינה מכילה מידע
מינונים — בכוונה. אין כאן עידוד לשימוש בשום חומר; המטרה היא צמצום נזקים
למבוגרים 18+ שכבר קיבלו את החלטותיהם. השימוש אינו יוצר יחסי רופא–מטופל;
**בחירום: מד״א 101** · עזרה נפשית: ער״ן 1201. חלק מהחומרים בקטלוג אינם חוקיים
להחזקה או לשימוש; אין כאן ייעוץ משפטי ואין סיוע בהשגה. התוכנה ניתנת
**"כמות שהיא" (AS IS) ללא כל אחריות**, והמחברים והתורמים אינם נושאים בכל חבות —
ראו [LICENSE](LICENSE).

</details>
