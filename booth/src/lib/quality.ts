// Frame-time watchdog. Degrades particle counts, never frame rate.
// Tiers: 1 = full, 0.6 = medium, 0.3 = low.

type Listener = (tier: number) => void;

let tier = 1;
const listeners = new Set<Listener>();
let slowStreak = 0;
let last = 0;
let running = false;

export function qualityTier(): number {
  return tier;
}

export function onQualityChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function setTier(next: number) {
  if (next === tier) return;
  tier = next;
  listeners.forEach((fn) => fn(tier));
}

function frame(now: number) {
  if (last > 0) {
    const dt = now - last;
    // Ignore tab-switch pauses
    if (dt < 250) {
      if (dt > 22) slowStreak += 1;
      else slowStreak = Math.max(0, slowStreak - 2);
      if (slowStreak > 90) {
        slowStreak = 0;
        if (tier > 0.6) setTier(0.6);
        else if (tier > 0.3) setTier(0.3);
      }
    }
  }
  last = now;
  requestAnimationFrame(frame);
}

export function startQualityWatch() {
  if (running) return;
  running = true;
  requestAnimationFrame(frame);
}
