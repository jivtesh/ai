# Working rules for this project

The bar: a museum installation, not a web page. If a screen would look normal
in a browser tab, it fails. Every screen needs depth (3+ layers), light, and
one hero motion.

Process:
- Work through SPEC.md milestones M0 to M9 in order. Do not stop for approval
  between milestones. Stop only if genuinely blocked, and say exactly why.
- After every milestone: run `npm run qa`, open every screenshot, critique
  against the milestone DoD and the global bar, fix failures, re-shoot, then
  commit and append 5 lines to PROGRESS.md (done, decisions, open items).
- Never mark a milestone done without having looked at its screenshots.

Copy rules:
- Use the copy table in SPEC.md verbatim. Do not invent UI text beyond it.
- Never use em dashes anywhere, including comments and docs.
- Banned words: revolutionize, game-changer, unlock, leverage (as a verb),
  synergy, paradigm shift, best-in-class, cutting-edge, seamless, empower.
- No emojis in the product.

Venue safety (UN premises):
- No real country borders, maps, flags, logos, or agency marks anywhere.
  Geography is always the fictional island nation of Kestrel.
- Personas are diverse and fictional. Tone is invitation, never warning.

Tech guardrails:
- Fully offline at runtime: fonts self-hosted, zero CDN calls, all assets local.
- 60fps target on integrated graphics at 1920x1080. Degrade particles, never
  frame rate.
- Touch targets 64px minimum. prefers-reduced-motion gets a calm variant.
