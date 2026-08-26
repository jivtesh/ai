// Test hooks for the Playwright QA harness. Attached to window.__booth.
// Also used by the facilitator jump grid indirectly through the store.

import { useBooth } from "../state/store";
import { ROOM_ORDER, PILLARS, type RoomSlug } from "../content/rooms";
import { strings } from "../i18n/strings";

declare global {
  interface Window {
    __booth: {
      goto: (screen: string, room?: string) => void;
      flip: (slug: string, value?: boolean) => void;
      touchAllPillars: () => void;
      seedWall: (count: number) => void;
      clearWall: () => void;
      openFacilitator: () => void;
      setReducedMotion: (on: boolean) => void;
      state: () => unknown;
    };
  }
}

export function attachQaHooks() {
  window.__booth = {
    goto: (screen, room) => {
      useBooth.getState().goto(screen as never, room as RoomSlug | undefined);
    },
    flip: (slug, value) => {
      const s = useBooth.getState();
      s.setFlipped(slug as RoomSlug, value ?? !s.flipped[slug as RoomSlug]);
    },
    touchAllPillars: () => {
      const s = useBooth.getState();
      PILLARS.forEach((p) => s.touchPillar(p));
    },
    seedWall: (count) => {
      const s = useBooth.getState();
      const seeds = [
        strings["wall.seed1"].en,
        strings["wall.seed2"].en,
        strings["wall.seed3"].en,
      ];
      for (let i = 0; i < count; i++) {
        s.addNote(seeds[i % seeds.length], true);
      }
    },
    clearWall: () => useBooth.getState().clearWall(),
    openFacilitator: () => useBooth.getState().setFacilitatorOpen(true),
    setReducedMotion: (on) => useBooth.getState().setReducedMotion(on),
    state: () => {
      const s = useBooth.getState();
      return {
        screen: s.screen,
        roomSlug: s.roomSlug,
        flipped: s.flipped,
        pillars: s.pillars,
        notes: s.notes.length,
        rooms: ROOM_ORDER,
      };
    },
  };
}
