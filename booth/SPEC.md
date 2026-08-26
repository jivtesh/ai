# A Walk Through the Future · Booth System v2 · Build Spec

This file is the complete brief for rebuilding the booth experience at exhibition quality.

The v1 prototype proved the flow (attract, greeter, five rooms, flip, choice, wall). v2 keeps the flow and the copy, and replaces the execution: v1 was text on a dark background, v2 is a lit gallery you move through.

## 4.1 What this is

A kiosk experience for two large touchscreens at a lounge during a major diplomatic week. Visitors are senior leaders in transit: 30 seconds to 7 minutes, walk-up, often facilitated. The app is the booth's software: attract loop, a greeter split, a navigable gallery of five rooms, a Now / In Five Years flip per room, a choice screen, a closing quote, and a graffiti wall.

Success: a visitor stops because it is beautiful, feels one room emotionally, and leaves having written one intention on the wall.

Anti-goals: no dashboards, no feature tours, no product names on screen, no fear, no text-on-flat-background screens.

## 4.2 Art direction: light is the medium

The world is a darkened gallery at night. Everything is lit, nothing is flat.

* Palette: ink `#0B0F16` to `#10141C` base; text `#EDEAE2`; hairlines `#2A3444`; the future is blue `#2E9BD6`; the human and the wall are gold `#D9A441`; NOW states sit in desaturated steel `#5B6470`.
* Light: every screen has at least one light cone (soft radial gradients + slow drifting dust particles inside the beam). Shadows are deep, edges glow slightly. Vignette on everything.
* Type: Archivo (700 to 900) for display, huge and confident; Public Sans for body; IBM Plex Mono for labels, timestamps, counters. Self-host all three.
* Motion language: museum, not app. Slow, weighted, certain. Standard ease `cubic-bezier(0.16, 1, 0.3, 1)`, durations 500 to 900ms, staggers 40 to 80ms. Nothing bounces. Counters tick with slight deceleration.
* Depth: parallax on pointer/touch drift (max 12px) across background, midground, foreground layers on every scene.

## 4.3 Experience map

attract -> greeter -> gallery (corridor of five doors) -> room 1..5 (each with the flip) -> choice -> why -> wall -> attract

The facilitator can jump anywhere at any time (4.8). "Continue" inside a room reveals the future first if it hasn't been flipped yet.

## 4.4 Screens

ATTRACT. A one-point-perspective gallery corridor rendered in layered silhouette: five doorways receding, each leaking a faint blue glow, dust drifting through two light cones. The headline mask-reveals line by line: "We can't have a 10x ambition if we can't imagine it." Below, a teaser line rotates every 12s through the five room one-liners. A breathing "Touch to begin" chip. This screen alone should make people cross the lounge.

GREETER. The camera eases 40 percent down the corridor. The question appears; the two answers are two doors with light spilling out, not buttons. Choosing one widens its light until it fills the screen (700ms) and lands on the gallery.

GALLERY. The corridor as navigation. Five doorways, each holding a live miniature of its room's data beat at low intensity (a tiny looping canvas), its number, title, and one-liner on a brass-style placard. Two dashed thresholds at the end for The Choice and The Wall. Touching a door plays the light-spill transition into that room.

ROOM (shared template). Three layers: background plate (lit gradient + noise + large soft shapes suggesting the workspace; swappable for AI images later), midground scene canvas where the data beat lives, foreground content: room eyebrow, title, one-liner, persona line, story text, and the day-strip.

The day-strip is the shared visualization: a horizontal 07:00 to 19:00 timeline at the bottom of the stage with task blocks. NOW: dense steel-grey blocks, a small notification counter accumulating. NEXT: most grey blocks have slid into a thin "agents, overnight" rail beneath the line; the human's blocks are fewer, gold, and larger.

The flip is the product's signature. Choreography, ~2.2s, same grammar in every room:

1. 0ms: light sweep crosses the stage left to right (450ms), screen dims 12%.
2. Color temperature shifts: steel NOW light to warm key light + living blue.
3. Day-strip reflows with 60ms staggers (600ms total).
4. The room's data beat plays (below).
5. Story text crossfades; the final line types on like an agent finishing a sentence. Counters settle last. Flipping back reverses it faster (900ms) and cools the light.

Per-room data beats (the midground canvas, bespoke per room):

1. Legal: a constellation of ~200 faint document nodes; on flip, threads draw between them and converge on the clause being written; counter "sources cross-referenced" climbs 12 -> 4,800.
2. Procurement: a stacked queue of 346 tickets; on flip they stream through a "cleared against policy" channel in 1.4s, leaving 6 gold exceptions floating; counter 346 -> 6. This is the reference room: build it first, make it perfect.
3. Resident Coordinator: the fictional island of Kestrel drawn as a thin coastline; eight translucent agency layers hover misaligned; on flip they settle into one registered composite with a sync pulse.
4. Humanitarian: dark terrain, a flood blooms; NOW shows a timer "T+3 weeks" over a slowly filling needs map; NEXT shows "T+6 hours", heat resolving fast, supply routes drawing themselves with moving dots.
5. Chief of Staff: a briefing pack self-assembles: pages fly in and stack, tabs label themselves, three option cards fan out with weight bars.

CHOICE. Five pedestals, each holding a column of light: Skills, Governance, Data, Operating model, Partnerships. Touch one: it brightens and draws threads to small icons of the rooms it made possible. When all five have been touched, the corridor in the background fully illuminates. Footer line: "Not just models. An invitation, not a warning."

WHY. Near-black. The quote in light: "We're imagining this with you, because we understand you." Small line beneath: "Built with the same tools, by a small team, in three weeks."

WALL. Gold era. Visitors type (on-screen keyboard for touch) one line: "What's the one thing you'll do now?" Notes land as glowing plaques with a soft physics settle (slight rotation, 1.04 overshoot), joining a wall that persists all week (localStorage). A ticker counts intentions. A shimmer crosses the plaques every 20s. Three next-step cards with QR placeholder slots sit beneath. Facilitator can long-press a plaque to remove it.

## 4.5 Copy (verbatim, English)

Attract: headline "We can't have a 10x ambition if we can't imagine it." · sub "Five rooms. One working week, five years out." · chip "Touch to begin"

Greeter: "Do you work inside the UN system, or alongside it?" · door 1 "I work inside the system / Walk a week of your own work, five years from now." · door 2 "I work alongside it / Civil society, academia, government. See what you could ask of it."

Gallery sub, staffer: "Five rooms. One working week, five years out." · guest: "Five rooms. Ask each one: what would I want from this?"

Rooms (title · one-liner · persona · NOW · NEXT · guest lens):

1. Office of Legal Affairs · AI removes friction. People drive judgment. · Amina, legal officer, Thursday 09:10 · NOW: "Copilot drafts the first pass of a standard agreement. Amina reviews it clause by clause. Research that took a week now takes a morning." · NEXT: "Every precedent, treaty and past agreement, cross-referenced as she types. Her week is judgment calls: the novel clause, the hard negotiation, the call only she can make." · Lens: "Visiting as a partner? Agreements move in days, not months."
2. Procurement & Operations · AI processes transactions. People make decisions. · Maria, procurement officer, Tuesday 08:40 · NOW: "Copilot compares bids, drafts purchase orders, summarises supplier history. The queue is still long, but every item moves faster." · NEXT: "Overnight, agents cleared 340 routine orders against policy. Maria reviews six flagged exceptions over coffee, then spends her afternoon negotiating the framework agreement that actually needs her." · Lens: "Visiting as a supplier or implementer? Faster, fairer, more transparent."
3. Resident Coordinator · AI gathers information. People build alignment. · Daniel, resident coordinator, Monday 07:30 · NOW: "The researcher agent assembles his country brief from agency reports. Meeting recaps land before he does. Negotiators now use AI to prepare cultural context before talks." · NEXT: "A live country picture across every agency, updated as partners report. His day goes where it counts: alignment between government, agencies and donors." · Lens: "Visiting from a ministry? One coordinated country picture to plug into."
4. Humanitarian Response · AI accelerates response. People deliver impact. · Leila, operations officer, Saturday 02:15 · NOW: "Situation reports drafted from field messages in any language. Damage mapped from imagery in hours, not days." · NEXT: "A needs assessment hours after the flood, not weeks. Supply routes suggested, checked, and moving by dawn. Leila's night goes to the calls that move aid, not the paperwork behind them." · Lens: "Visiting as a local responder? The same live picture the agencies see."
5. Agentic Chief of Staff · AI prepares the work. Leaders shape the future. · Grace, director, Friday 16:00 · NOW: "Briefing packs assembled by agents, sources cited. Meeting prep takes minutes, not evenings." · NEXT: "The work arrives prepared: options weighed, positions mapped, drafts ready. Leadership time goes to direction, relationships, and the decisions no agent should make." · Lens: "Visiting from civil society? Your evidence reaches the table, and reporting gets far easier."

Choice: headline "The future depends on skills, governance, data, operating model and partnerships." · sub "Not just models. An invitation, not a warning." · pillars: Skills "People who know how to use it. Everywhere, not just headquarters." · Governance "Clear rules for what AI may do, and what stays human." · Data "Trusted, protected, and ready to work." · Operating model "Workflows redesigned, not just tools added." · Partnerships "Built together, so no one figures it out alone."

Why: quote as in 4.4.

Wall: prompt "What's the one thing you'll do now?" · placeholder "One line. It joins the wall." · cards: "UN system staff / The 10-week programme. Any part of the system can join." · "Everyone / Free AI learning paths." · "Go further / Connect with the Changemakers community." · seed notes: "Pilot the researcher agent with my team" · "Map one workflow worth redesigning" · "Ask for a session with our country office"

Flip labels: "NOW" and "IN FIVE YEARS". Nav: "Back", "Continue", "All rooms", "Restart".

Language: ship an i18n table keyed by string id. English complete; `fr` and `es` keys present with TODO values.

## 4.6 Tech

Vite + React + TypeScript. Tailwind for layout tokens. Framer Motion for UI choreography. React Three Fiber + drei for the corridor, light cones and particles (or a single well-built canvas layer if R3F fights the frame budget; decide in the plan and say why). Zustand for state. Howler wired but sound off by default (silent lounge). localStorage for wall notes, language, and simple analytics counters (sessions, room visits, flips, notes), with CSV export in the facilitator panel. Everything bundles local; `npm run build` output must run with the network cable pulled.

## 4.7 Assets

`/public/scenes/<room-slug>/bg.webp` per room plus `/public/scenes/attract/`. Until real plates exist, generate procedural placeholders that are themselves designed: lit gradients, film-grain noise, large soft silhouettes. Grey boxes fail QA. Also write `IMAGE-PROMPTS.md`: one detailed image-generation prompt per plate (mood, camera, palette, no text, no logos, no real flags or maps) so real plates can be generated and dropped in without code changes.

## 4.8 Interaction and operations

* Touch first, 64px targets, no hover-dependent information.
* Keyboard/clicker: 1 to 5 rooms, Space flips, arrows back/continue, m gallery, c choice, w wall, Escape attract.
* Facilitator panel: five taps in the top-left corner within 3 seconds opens a drawer: jump grid, language, sound, reset session, export wall CSV, clear wall (double confirm), session stats.
* Idle: 120 seconds without interaction returns to attract and clears the visitor path; the wall persists.
* Fullscreen kiosk on first touch; survives refresh.

## 4.9 Milestones

* M0 Scaffold: Vite/React/TS, fonts self-hosted, Tailwind tokens, router, Zustand store, Playwright QA harness stub, PROGRESS.md. DoD: `npm run qa` produces screenshots of empty screens.
* M1 Design system: color and type tokens, motion primitives (light sweep, mask reveal, counter, stagger reflow), the day-strip component with NOW and NEXT states. DoD: a Storybook-style demo page shows each primitive.
* M2 Attract: corridor silhouette, light cones, dust particles, headline choreography, teaser rotation. DoD: screenshot could be mistaken for an exhibition poster.
* M3 Greeter and gallery: camera moves, door components with live miniature canvases, light-spill transition. DoD: transition at 60fps.
* M4 Reference room: Procurement complete end to end, day-strip, full flip choreography, 346 -> 6 data beat, parallax layers. Think hard. DoD: the flip gives a small chill.
* M5 Remaining rooms: the other four data beats on the shared template. DoD: each beat is distinct and on-grammar.
* M6 Choice and why: pedestal columns, thread draws, all-lit payoff, quote screen. Think hard.
* M7 Wall: on-screen keyboard, plaque physics, persistence, shimmer, ticker, next-step cards, long-press remove.
* M8 Operations: facilitator panel, idle return, kiosk fullscreen, i18n scaffold, analytics counters and export, reduced-motion variant.
* M9 Polish and QA: timing pass across every transition, perf pass (particle degradation tiers, bundle budget <= 3MB gz JS), full screenshot review at 1920x1080 and one 4K set, README with run-of-show and setup for booth laptops.

## 4.10 QA loop

`npm run qa`: boots `vite preview`, drives every state with Playwright: attract, greeter, gallery, each room in NOW, mid-flip and NEXT, choice untouched and all-lit, why, wall with six notes, facilitator panel open. Saves numbered PNGs to `/qa`. The review gate in CLAUDE.md applies after every milestone. `npm run qa:fps` logs a 10-second frame-time probe on attract and the Procurement flip.

## 4.11 Global definition of done

* No screen reads as text on a flat background; three depth layers, light, and one hero motion everywhere.
* The flip is a staged choreography with a room-specific data beat, never a text swap.
* Fully offline, kiosk-stable, wall persists across refresh.
* 60fps on integrated graphics at 1080p; graceful degradation, never jank.
* Copy verbatim from 4.5; no em dashes; banned words absent; no real borders, flags, logos or marks; tone is invitation throughout.
