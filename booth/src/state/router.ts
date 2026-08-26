// Tiny hash router so QA and the facilitator can deep-link any state.
// #/attract #/greeter #/gallery #/room/<slug> #/choice #/why #/wall #/demo

import { ROOM_ORDER, type RoomSlug } from "../content/rooms";
import { useBooth, type ScreenName } from "./store";

const SCREENS: ScreenName[] = [
  "attract",
  "greeter",
  "gallery",
  "room",
  "choice",
  "why",
  "wall",
  "demo",
];

let applyingHash = false;

function parseHash(): { screen: ScreenName; room?: RoomSlug } | null {
  const h = window.location.hash.replace(/^#\/?/, "");
  if (!h) return null;
  const [head, tail] = h.split("/");
  if (head === "room" && tail && ROOM_ORDER.includes(tail as RoomSlug)) {
    return { screen: "room", room: tail as RoomSlug };
  }
  if (SCREENS.includes(head as ScreenName) && head !== "room") {
    return { screen: head as ScreenName };
  }
  return null;
}

function applyHash() {
  const parsed = parseHash();
  if (!parsed) return;
  const s = useBooth.getState();
  if (parsed.screen === s.screen && (parsed.screen !== "room" || parsed.room === s.roomSlug)) {
    return;
  }
  applyingHash = true;
  s.goto(parsed.screen, parsed.room);
  applyingHash = false;
}

export function startRouter() {
  applyHash();
  window.addEventListener("hashchange", applyHash);
  useBooth.subscribe((s, prev) => {
    if (applyingHash) return;
    if (s.screen === prev.screen && s.roomSlug === prev.roomSlug) return;
    const next = s.screen === "room" ? `#/room/${s.roomSlug}` : `#/${s.screen}`;
    if (window.location.hash !== next) {
      history.replaceState(null, "", next);
    }
  });
}
