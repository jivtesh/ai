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
