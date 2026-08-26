import { create } from "zustand";
import { ROOM_ORDER, type PillarId, type RoomSlug } from "../content/rooms";
import type { Lang } from "../i18n/strings";
import { bumpCounter } from "../lib/analytics";

export type ScreenName =
  | "attract"
  | "greeter"
  | "gallery"
  | "room"
  | "choice"
  | "why"
  | "wall"
  | "demo";

export type Audience = "staffer" | "guest" | null;

export interface WallNote {
  id: string;
  text: string;
  ts: number;
  rot: number; // resting rotation in degrees
  seed: boolean;
}

export interface Spill {
  x: number; // viewport fraction 0..1
  y: number;
  hue: "future" | "gold";
}

const WALL_KEY = "booth.wall.v2";
const LANG_KEY = "booth.lang.v2";

function loadNotes(): WallNote[] {
  try {
    const raw = localStorage.getItem(WALL_KEY);
    if (raw) return JSON.parse(raw) as WallNote[];
  } catch {
    // storage unavailable: run without persistence
  }
  return [];
}

function saveNotes(notes: WallNote[]) {
  try {
    localStorage.setItem(WALL_KEY, JSON.stringify(notes));
  } catch {
    // ignore
  }
}

function loadLang(): Lang {
  try {
    const raw = localStorage.getItem(LANG_KEY);
    if (raw === "en" || raw === "fr" || raw === "es") return raw;
  } catch {
    // ignore
  }
  return "en";
}

let noteSeq = 0;
function noteId() {
  noteSeq += 1;
  return `n${Date.now().toString(36)}${noteSeq}`;
}

export interface BoothState {
  screen: ScreenName;
  roomSlug: RoomSlug;
  audience: Audience;
  flipped: Partial<Record<RoomSlug, boolean>>;
  visited: RoomSlug[];
  pillars: PillarId[];
  lang: Lang;
  soundOn: boolean;
  reducedMotion: boolean;
  facilitatorOpen: boolean;
  notes: WallNote[];
  spill: Spill | null;

  goto: (screen: ScreenName, roomSlug?: RoomSlug) => void;
  setAudience: (a: Audience) => void;
  setFlipped: (slug: RoomSlug, value: boolean) => void;
  toggleFlip: (slug: RoomSlug) => void;
  touchPillar: (p: PillarId) => void;
  continueFrom: () => void;
  back: () => void;
  setLang: (lang: Lang) => void;
  setSound: (on: boolean) => void;
  setReducedMotion: (on: boolean) => void;
  setFacilitatorOpen: (open: boolean) => void;
  addNote: (text: string, seed?: boolean) => void;
  removeNote: (id: string) => void;
  clearWall: () => void;
  resetSession: () => void;
  setSpill: (s: Spill | null) => void;
}

export const useBooth = create<BoothState>((set, get) => ({
  screen: "attract",
  roomSlug: "procurement",
  audience: null,
  flipped: {},
  visited: [],
  pillars: [],
  lang: loadLang(),
  soundOn: false,
  reducedMotion:
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  facilitatorOpen: false,
  notes: loadNotes(),
  spill: null,

  goto: (screen, roomSlug) => {
    const prev = get();
    if (prev.screen === "attract" && screen === "greeter") {
      // a visitor path begins when someone steps past the attract loop
      bumpCounter("sessions");
    }
    if (screen === "room" && roomSlug) {
      if (!prev.visited.includes(roomSlug)) {
        bumpCounter("roomVisits");
        set({ visited: [...prev.visited, roomSlug] });
      }
      set({ screen, roomSlug });
      return;
    }
    if (screen === "attract" && prev.screen !== "attract") {
      // returning to attract starts a fresh visitor path; the wall persists
      set({
        screen: "attract",
        audience: null,
        flipped: {},
        visited: [],
        pillars: [],
        facilitatorOpen: false,
      });
      return;
    }
    set({ screen });
  },

  setAudience: (a) => set({ audience: a }),

  setFlipped: (slug, value) => {
    const flipped = { ...get().flipped };
    if (flipped[slug] === value) return;
    flipped[slug] = value;
    if (value) bumpCounter("flips");
    set({ flipped });
  },

  toggleFlip: (slug) => {
    const now = !!get().flipped[slug];
    get().setFlipped(slug, !now);
  },

  touchPillar: (p) => {
    const cur = get().pillars;
    if (!cur.includes(p)) set({ pillars: [...cur, p] });
  },

  continueFrom: () => {
    const s = get();
    switch (s.screen) {
      case "attract":
        s.goto("greeter");
        break;
      case "greeter":
        s.goto("gallery");
        break;
      case "gallery":
        s.goto("room", ROOM_ORDER[0]);
        break;
      case "room": {
        if (!s.flipped[s.roomSlug]) {
          s.setFlipped(s.roomSlug, true);
          return;
        }
        const i = ROOM_ORDER.indexOf(s.roomSlug);
        if (i < ROOM_ORDER.length - 1) s.goto("room", ROOM_ORDER[i + 1]);
        else s.goto("choice");
        break;
      }
      case "choice":
        s.goto("why");
        break;
      case "why":
        s.goto("wall");
        break;
      case "wall":
        s.goto("attract");
        break;
      default:
        break;
    }
  },

  back: () => {
    const s = get();
    switch (s.screen) {
      case "greeter":
        s.goto("attract");
        break;
      case "gallery":
        s.goto("greeter");
        break;
      case "room": {
        const i = ROOM_ORDER.indexOf(s.roomSlug);
        if (i > 0) s.goto("room", ROOM_ORDER[i - 1]);
        else s.goto("gallery");
        break;
      }
      case "choice":
        s.goto("room", ROOM_ORDER[ROOM_ORDER.length - 1]);
        break;
      case "why":
        s.goto("choice");
        break;
      case "wall":
        s.goto("why");
        break;
      default:
        break;
    }
  },

  setLang: (lang) => {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      // ignore
    }
    set({ lang });
  },

  setSound: (on) => set({ soundOn: on }),
  setReducedMotion: (on) => set({ reducedMotion: on }),
  setFacilitatorOpen: (open) => set({ facilitatorOpen: open }),

  addNote: (text, seed = false) => {
    const trimmed = text.trim().slice(0, 80);
    if (!trimmed) return;
    const note: WallNote = {
      id: noteId(),
      text: trimmed,
      ts: Date.now(),
      rot: (Math.random() - 0.5) * 3.2,
      seed,
    };
    const notes = [...get().notes, note];
    saveNotes(notes);
    if (!seed) bumpCounter("notes");
    set({ notes });
  },

  removeNote: (id) => {
    const notes = get().notes.filter((n) => n.id !== id);
    saveNotes(notes);
    set({ notes });
  },

  clearWall: () => {
    saveNotes([]);
    set({ notes: [] });
  },

  resetSession: () => {
    set({
      screen: "attract",
      audience: null,
      flipped: {},
      visited: [],
      pillars: [],
      facilitatorOpen: false,
      spill: null,
    });
  },

  setSpill: (spill) => set({ spill }),
}));
