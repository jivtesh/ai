# Progress

Working log per milestone: done, decisions, open items.

## M0 Scaffold
- Done: Vite/React/TS scaffold, three font families self-hosted via fontsource, Tailwind v4 tokens, hash router, Zustand store, QA harness (23 shots at 1080p), stub screens.
- Decision: no R3F. Corridor and light are layered DOM gradients plus 2D canvases: keeps gz JS around 120KB against the 3MB budget and integrated graphics safe; the art direction (soft radial light, silhouettes) does not need a 3D scene graph.
- Decision: QA drives states through window.__booth hooks plus hash deep links; chromium launched with --no-sandbox for the container.
- Open: all screens are stubs; facilitator panel wired early since the store needed it.
- Next: M1 primitives demo page.

## M1 Design system
- Done: motion primitives (LightSweep, MaskReveal, Counter with deceleration, day-strip stagger reflow), LightCone, DustCanvas, palette and type demo at #/demo, verified by screenshot.
- Decision: primitives live as small standalone components; the day-strip owns its own reflow choreography so every room shares one grammar.
- Fixed: gold human blocks could overlap on the strip; ends now clamp to the next anchor.
- Fixed: QA scripts kill the vite preview process group; orphaned children were hanging the harness.
- Next: M2 attract corridor.

## M2 Attract
- Done: CSS 3D corridor (walls, floor, ceiling, end wall, depth fog, baseboards), five glowing doorways with floor spill, two light cones with dust, headline mask reveal, 12s teaser rotation, breathing chip.
- Decision: parallax on the corridor rides perspective-origin, which reads as a head move rather than a layer slide.
- Reviewed shots: seams around the end wall and hard cone edges found and fixed (depth fog plane, cone mask and wider blur).
- Open: dust density and cone tilt get a second look in the M9 timing pass.
- Next: M3 greeter and gallery on the same corridor.

## M3 Greeter and gallery
- Done: greeter camera ease to 40 percent with two glowing choice doors (blue staffer, gold guest), light-spill transition anchored to the touched point, gallery with five live miniatures in the doorways, brass placards in two columns with leader lines, dashed thresholds for The Choice and The Wall on the end wall.
- Decision: placards are screen-space cards with projected leader lines; placards on the wall planes were unreadable and far doors were too small to touch.
- Reviewed shots: first placard pass collided in the center, fixed by depth-ordered column slots; spill gradient recentered on the touch point.
- Open: miniature intensity gets a boost when the full beats land in M5.
- Next: M4 Procurement reference room.

## M4 Procurement reference room
- Done: shared room template (plate, temperature crossfade, cone swap, beat stage, story column, day-strip, flip toggle), full flip choreography (sweep, 12 percent dim, strip reflow at 450ms, beat, story crossfade with type-on final line, counter settles last), procurement beat: 346 tickets drain through the cleared-against-policy channel in about 1.4s leaving six floating gold exceptions.
- Decision: background plates are generated procedural webp files committed to the repo; IMAGE-PROMPTS.md will let real plates drop in unchanged.
- Fixed: counter collided with the flip toggle; quality degradation was culling gold exceptions (hero elements are now never skipped).
- Reviewed shots: NOW, mid-flip and settled NEXT all verified at 1080p.
- Next: M5 remaining four beats on the same template.

## M5 Remaining rooms
- Done: four bespoke beats via a parallel agent workflow, verified and tuned by screenshot: legal constellation with converging threads and the 12 to 4,800 counter, resident eight-layer Kestrel registration with sync pulse, humanitarian flood bloom with T+3 weeks to T+6 hours and self-drawing routes, chief of staff self-assembling pack with tabs and weighted option cards.
- Fixed: legal NOW nodes were nearly invisible at 1080p; alpha and radius raised.
- Decision: quality tiers thin background density only; hero elements always draw.
- IMAGE-PROMPTS.md written so real plates can replace the procedural ones.
- Next: M6 choice and why (already drafted, committing after review).

## M6 Choice and why
- Done: five pedestal light columns with touch reveal, SVG threads to room chips, all-lit corridor payoff with light swell, near-black quote screen under one cone with dust.
- Decision: headlines now flow through the i18n table and a two-line balancer, so translations keep the mask-reveal choreography.
- Reviewed shots: untouched and all-lit states verified; footer moved clear of pillar copy.
- Open: quote glow banding gets one more look in the M9 pass.
- Next: M7 wall (already drafted).

## M7 Wall
- Done: gold-era wall with on-screen keyboard (physical keys feed it too), plaque landing with 1.04 overshoot and rotation settle, localStorage persistence, intention ticker, 20s shimmer, three next-step cards with QR slots, long-press remove, seed notes on first empty visit.
- Fixed: keyboard centering fought framer transforms; caret got a real blink.
- Reviewed shots: wall with notes and keyboard-open state verified.
- Next: M8 operations wrap-up.

## M9 Polish and QA
- Done: full 46-shot review at 1080p and 4K, frame-time probes (software-rendered container, so numbers are relative: the flip window doubled after the pass), bundle at 140KB gz JS against the 3MB budget, copy audit clean for banned words and em dashes, README with run-of-show.
- Review workflow (4 dimensions, adversarial verify) confirmed 11 findings; all fixed: keyboard now dismisses on outside tap, plaque DOM capped at 40 with memoized plaques, idle listeners moved to capture phase and the drawer closes on idle, dust field no longer rebuilds on parent re-renders, plaque removal is facilitator-armed with multi-touch-safe timers, gallery doors got 64px+ projected hit pads, the on-screen keyboard gained digits and punctuation, QA-only invented seed strings removed.
- The wall persists across refresh, the app runs fully offline from dist, and every screen carries three layers, light, and a hero motion.
