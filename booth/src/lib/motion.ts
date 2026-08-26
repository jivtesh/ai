// Shared motion language: museum, not app. Slow, weighted, certain.

export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";

export const DUR = {
  fast: 0.5,
  base: 0.7,
  slow: 0.9,
};

export const STAGGER = {
  tight: 0.04,
  base: 0.06,
  loose: 0.08,
};

// Decelerating counter curve: fast start, settles at the end
export function decel(t: number): number {
  return 1 - Math.pow(1 - t, 3.2);
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
