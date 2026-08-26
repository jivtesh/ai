// Low-intensity looping miniatures of each room's data beat, drawn inside
// the gallery doorways. Each painter gets a normalized time in seconds and
// a canvas already scaled to its logical size.

import type { RoomSlug } from "../content/rooms";
import { mulberry } from "../lib/rand";

export type MiniPainter = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void;

const BLUE = "46, 155, 214";
const GOLD = "217, 164, 65";
const STEEL = "91, 100, 112";

const legalNodes = (() => {
  const rnd = mulberry(21);
  return Array.from({ length: 46 }, () => ({
    x: 0.1 + rnd() * 0.8,
    y: 0.12 + rnd() * 0.76,
    p: rnd() * Math.PI * 2,
  }));
})();

const legal: MiniPainter = (ctx, w, h, t) => {
  for (const n of legalNodes) {
    const a = 0.16 + 0.14 * (0.5 + 0.5 * Math.sin(t * 0.7 + n.p));
    ctx.fillStyle = `rgba(${BLUE}, ${a})`;
    ctx.beginPath();
    ctx.arc(n.x * w, n.y * h, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  // one slow thread at a time
  const k = Math.floor(t / 2.4) % legalNodes.length;
  const j = (k * 17 + 11) % legalNodes.length;
  const prog = Math.min(1, (t % 2.4) / 1.2);
  const a = legalNodes[k];
  const b = legalNodes[j];
  ctx.strokeStyle = `rgba(${BLUE}, ${0.4 * (1 - Math.abs(prog - 0.5) * 1.2)})`;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(a.x * w, a.y * h);
  ctx.lineTo(a.x * w + (b.x - a.x) * w * prog, a.y * h + (b.y - a.y) * h * prog);
  ctx.stroke();
};

const procurement: MiniPainter = (ctx, w, h, t) => {
  const rows = 9;
  const cols = 5;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const drift = ((t * 8 + i * 7) % (h + 30)) - 15;
      const y = h - drift;
      const gold = i % 19 === 3;
      ctx.fillStyle = gold ? `rgba(${GOLD}, 0.5)` : `rgba(${STEEL}, 0.34)`;
      ctx.fillRect(w * 0.18 + c * w * 0.14, y, w * 0.1, 3);
    }
  }
};

const KESTREL: [number, number][] = [
  [0.22, 0.18], [0.34, 0.14], [0.47, 0.17], [0.58, 0.13], [0.7, 0.2],
  [0.78, 0.3], [0.74, 0.42], [0.8, 0.53], [0.72, 0.64], [0.62, 0.7],
  [0.52, 0.66], [0.44, 0.74], [0.33, 0.78], [0.24, 0.7], [0.18, 0.58],
  [0.14, 0.44], [0.2, 0.32], [0.22, 0.18],
];

function drawKestrel(ctx: CanvasRenderingContext2D, w: number, h: number, dx: number, dy: number, alpha: number, color: string) {
  ctx.strokeStyle = `rgba(${color}, ${alpha})`;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  KESTREL.forEach(([x, y], i) => {
    const px = (x + dx) * w;
    const py = (y + dy) * h;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();
}

const resident: MiniPainter = (ctx, w, h, t) => {
  for (let i = 0; i < 5; i++) {
    const dx = Math.sin(t * 0.5 + i * 1.9) * 0.02 * (i + 1) * 0.4;
    const dy = Math.cos(t * 0.4 + i * 1.3) * 0.015 * (i + 1) * 0.4;
    drawKestrel(ctx, w, h, dx, dy, 0.14, BLUE);
  }
  drawKestrel(ctx, w, h, 0, 0, 0.36, BLUE);
};

const humanitarian: MiniPainter = (ctx, w, h, t) => {
  // terrain hairlines
  ctx.strokeStyle = `rgba(${STEEL}, 0.22)`;
  ctx.lineWidth = 0.7;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    for (let x = 0; x <= w; x += 6) {
      const y = h * (0.25 + i * 0.14) + Math.sin(x * 0.05 + i * 2.2) * 4;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // the bloom
  const pulse = 0.5 + 0.5 * Math.sin(t * 0.9);
  const r = w * (0.1 + 0.1 * pulse);
  const gx = w * 0.55;
  const gy = h * 0.5;
  const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, r);
  grad.addColorStop(0, `rgba(${BLUE}, ${0.4 * (0.4 + 0.6 * pulse)})`);
  grad.addColorStop(1, `rgba(${BLUE}, 0)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(gx, gy, r, 0, Math.PI * 2);
  ctx.fill();
};

const chief: MiniPainter = (ctx, w, h, t) => {
  const phase = (t % 3.6) / 3.6;
  const count = 5;
  for (let i = 0; i < count; i++) {
    const arrive = Math.min(1, Math.max(0, phase * 6 - i * 0.9));
    const x = w * 0.3 + (1 - arrive) * w * 0.5;
    const y = h * 0.62 - i * 5 - (1 - arrive) * 24;
    ctx.fillStyle = `rgba(237, 234, 226, ${0.1 + 0.08 * i * arrive})`;
    ctx.strokeStyle = `rgba(${GOLD}, ${0.3 * arrive})`;
    ctx.lineWidth = 0.7;
    ctx.fillRect(x, y, w * 0.36, h * 0.05);
    ctx.strokeRect(x, y, w * 0.36, h * 0.05);
  }
};

export const MINIS: Record<RoomSlug, MiniPainter> = {
  legal,
  procurement,
  "resident-coordinator": resident,
  humanitarian,
  "chief-of-staff": chief,
};
