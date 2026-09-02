/* =========================================================================
   safesub AI-advisor proxy — Cloudflare Worker. Thin by design:
   holds the key, blocks what's forbidden, remembers nothing.
   - ZERO content logging: requests, replies and state summaries are never
     logged; errors log status codes only (aggregate metrics).
   - Deterministic refusal layer runs BEFORE any model call.
   - Anonymous rate limit per IP; no accounts, no identifiers stored.
   Contract with the app: POST {lang, summary, question} -> {text}.
   ========================================================================= */
import Anthropic from '@anthropic-ai/sdk';
import {SYSTEM, QPREFIX, BLOCKED, SAFE_FAIL} from './prompts.mjs';
import {isBlockedAsk} from './refusal.mjs';

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const j = (o, status = 200) => new Response(JSON.stringify(o), {status, headers: HEADERS});

export default {
  async fetch(request, env){
    if (request.method === 'OPTIONS') return new Response(null, {headers: HEADERS});
    if (request.method !== 'POST') return j({error: 'method'}, 405);

    let body;
    try { body = await request.json(); } catch { return j({error: 'bad json'}, 400); }
    const lang = body.lang === 'en' ? 'en' : 'he';
    const summary = String(body.summary || '').slice(0, 4000);
    const question = String(body.question || '').trim().slice(0, 1000);
    if (!question) return j({error: 'empty question'}, 400);

    /* anonymous rate limit — the app falls back to its local responder on 429 */
    if (env.RATE_LIMITER) {
      const ip = request.headers.get('cf-connecting-ip') || 'unknown';
      const {success} = await env.RATE_LIMITER.limit({key: ip});
      if (!success) return j({error: 'rate'}, 429);
    }

    /* hard rule #1, enforced in code before any model sees the question */
    if (isBlockedAsk(question)) return j({text: BLOCKED[lang], refused: true});

    try {
      const client = new Anthropic({apiKey: env.ANTHROPIC_API_KEY});
      const msg = await client.beta.messages.create({
        model: 'claude-opus-5',
        max_tokens: 1024,                        /* replies are 2–4 sentences */
        system: SYSTEM[lang],
        output_config: {effort: 'low'},          /* cost + latency, per docs/ai-advisor.md */
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',                    /* policy declines re-route server-side */
        messages: [{role: 'user', content: `${summary}\n\n${QPREFIX[lang]}${question}`}],
      });
      if (msg.stop_reason === 'refusal') return j({text: SAFE_FAIL[lang]});
      const text = (msg.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
      return j({text: text || SAFE_FAIL[lang]});
    } catch (e) {
      console.log('advise_error', e?.status || e?.name || 'unknown');  /* status only — never content */
      return j({error: 'upstream'}, 502);        /* the app falls back to localReply */
    }
  },
};
