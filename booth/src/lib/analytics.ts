// Simple local analytics: counters only, stored in localStorage.

const KEY = "booth.analytics.v2";

export interface Counters {
  sessions: number;
  roomVisits: number;
  flips: number;
  notes: number;
}

const ZERO: Counters = { sessions: 0, roomVisits: 0, flips: 0, notes: 0 };

export function readCounters(): Counters {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...ZERO, ...(JSON.parse(raw) as Partial<Counters>) };
  } catch {
    // ignore
  }
  return { ...ZERO };
}

export function bumpCounter(name: keyof Counters) {
  const c = readCounters();
  c[name] += 1;
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    // ignore
  }
}

export function resetCounters() {
  try {
    localStorage.setItem(KEY, JSON.stringify(ZERO));
  } catch {
    // ignore
  }
}
