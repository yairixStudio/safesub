## What does this PR change?

<!-- one clear paragraph; for data changes, lead with the sources -->

## Checklist

- [ ] **No dosing content** — no amounts, schedules, preparation or sourcing info, anywhere (hard rule #1)
- [ ] Data changes (PK values, interactions, `ev` grades) cite **primary / peer-reviewed sources** above
- [ ] Content edited in `demo-reference.html` and regenerated via `node tools/gen-app-data.mjs` — no hand edits to generated files
- [ ] `node test/run.mjs` passes (intentional curve change: `--update` + justification)
- [ ] `cd app && npm test && npm run typecheck` pass
- [ ] UI changes: Maestro suite passes (`app/e2e/run.sh`); [docs/testing.md](../docs/testing.md) driver lessons followed
- [ ] New strings exist in **both** `L.he` and `L.en`; layout uses `dir.*`; colors use theme tokens
