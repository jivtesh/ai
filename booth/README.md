# A Walk Through the Future · Booth System v2

Kiosk software for two large touchscreens: attract loop, greeter split,
a corridor gallery of five rooms, a Now / In Five Years flip per room, a
choice screen, a closing quote, and a graffiti wall that persists all week.

Built with Vite, React, TypeScript, Tailwind tokens, Framer Motion, Zustand
and hand-rolled 2D canvas beats. Fully offline at runtime: fonts and plates
ship in the bundle, there are zero network calls.

## Booth laptop setup

1. Install Node 20 or newer once, on a network connection:
   `npm install && npm run build`
2. The `dist/` folder is the whole product. Copy it to the booth laptops.
3. Serve it locally (any static server works, no internet needed):
   `npm run preview` serves on port 4173, or
   `npx serve dist` or a plain nginx root. file:// will not work; use a
   local server.
4. Open Chromium or Edge in kiosk mode on the touchscreen:
   `chromium --kiosk --noerrdialogs --disable-pinch http://localhost:4173`
5. First touch requests fullscreen and remembers the choice across refresh.
6. Set OS display sleep to never, disable screen savers and notifications.

The app targets 1920x1080. Other resolutions scale to cover; 4K works with
the same layout. 60fps on integrated graphics; particle density degrades
automatically under load, frame rate does not.

## Run of show

- Idle: the attract corridor loops. 120 seconds without touch always
  returns here and clears the visitor path. The wall persists.
- A visitor touches: greeter asks inside or alongside the system. The
  answer tunes the gallery subtitle and adds the guest lens line in rooms.
- Gallery: five doorways with live miniatures; brass placards navigate.
  Two thresholds at the end reach The Choice and The Wall directly.
- Each room: NOW state first. Continue (or Space, or the toggle) plays the
  flip: light sweep, temperature shift, day-strip reflow, the room's data
  beat, story crossfade with the final line typing on.
- Choice: touch all five pedestals to fully light the corridor.
- Why: the quote. Continue lands on the wall.
- Wall: the visitor types one line; it becomes a plaque with a settle
  animation and persists in localStorage across the week.

## Facilitator controls

- Five taps in the top left corner within 3 seconds opens the drawer:
  jump grid, language, sound, plaque removal arming, reset session, export
  wall CSV, clear wall (double confirm), session stats.
- To remove a single plaque: switch Remove plaques on in the drawer, then
  long-press the plaque for about a second. The switch disarms itself when
  the session resets, so visitors cannot delete notes.
- Keyboard and clicker: 1 to 5 open rooms, Space flips, arrow keys are
  Back and Continue, m gallery, c choice, w wall, Escape returns to
  attract.

## Working on the code

- `npm run dev` for the dev server.
- `npm run qa` builds, boots a preview server and screenshots every state
  into `qa/` (add `--uhd` for a 4K set, `--skip-build` to reuse `dist/`).
- `npm run qa:fps` runs a 10 second frame-time probe on attract and the
  Procurement flip.
- `npm run plates` regenerates the procedural background plates. Real
  plates can replace `public/scenes/<slug>/bg.webp` with no code changes;
  prompts for generating them are in `IMAGE-PROMPTS.md`.
- Copy lives in `src/i18n/strings.ts` keyed by string id. English is
  complete; `fr` and `es` fall back to English until their TODO values are
  filled in.
- `SPEC.md` is the build brief; `PROGRESS.md` is the working log per
  milestone.
