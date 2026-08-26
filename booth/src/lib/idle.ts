// 120 seconds without interaction returns to attract and clears the
// visitor path. The wall persists (goto("attract") never touches notes).

import { useBooth } from "../state/store";

const IDLE_MS = 120_000;
let timer: number | undefined;

function arm() {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    const s = useBooth.getState();
    if (s.screen !== "attract") s.goto("attract");
  }, IDLE_MS);
}

export function startIdleWatch() {
  const events: (keyof WindowEventMap)[] = ["pointerdown", "pointermove", "keydown", "wheel"];
  events.forEach((ev) => window.addEventListener(ev, arm, { passive: true }));
  arm();
}
