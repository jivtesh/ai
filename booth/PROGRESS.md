# Progress

Working log per milestone: done, decisions, open items.

## M0 Scaffold
- Done: Vite/React/TS scaffold, three font families self-hosted via fontsource, Tailwind v4 tokens, hash router, Zustand store, QA harness (23 shots at 1080p), stub screens.
- Decision: no R3F. Corridor and light are layered DOM gradients plus 2D canvases: keeps gz JS around 120KB against the 3MB budget and integrated graphics safe; the art direction (soft radial light, silhouettes) does not need a 3D scene graph.
- Decision: QA drives states through window.__booth hooks plus hash deep links; chromium launched with --no-sandbox for the container.
- Open: all screens are stubs; facilitator panel wired early since the store needed it.
- Next: M1 primitives demo page.
