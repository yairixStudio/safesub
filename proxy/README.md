# safesub AI-advisor proxy

Thin Cloudflare Worker between the app and the Claude API ([docs/ai-advisor.md](../docs/ai-advisor.md)):
holds `ANTHROPIC_API_KEY`, enforces the **deterministic no-doses refusal layer in code**
(before any model call — see `src/refusal.mjs` + `test/`), rate-limits anonymously per IP,
and logs **no content whatsoever** (status-code counts only).

Contract: `POST / {lang, summary, question}` → `{text}` (the app falls back to its
local responder on any non-200).

## Deploy

```bash
cd proxy
npm install
npm test                                  # refusal-layer unit tests (no network)
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY # paste your key once; stored by Cloudflare
npm run deploy                            # → https://safesub-ai-proxy.<account>.workers.dev
```

Then build the app with the URL:

```bash
cd ../app
EXPO_PUBLIC_AI_PROXY=https://safesub-ai-proxy.<account>.workers.dev npm run android:release
```

Model: `claude-opus-5`, `effort: low`, server-side refusal fallbacks enabled
(`fallbacks: "default"`) — a policy decline re-routes inside the same call, and a
final refusal returns a calm, safe text instead of an error.
