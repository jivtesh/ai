// Room 5, Agentic Chief of Staff. Loose reading drifts around an empty
// outline; on flip the pages fly in and stack into a briefing pack, tabs
// slide from its edge, and three option cards fan out with weight bars.

import { useEffect, useRef } from "react";
import { useBooth } from "../state/store";
import { mulberry } from "../lib/rand";
import { clamp, lerp, easeInOut, decel } from "../lib/motion";
import { qualityTier } from "../lib/quality";

const BLUE = "46, 155, 214";
const GOLD = "217, 164, 65";
const STEEL = "91, 100, 112";
const PAPER = "237, 234, 226";
const INK = "42, 52, 68";

const PAGES = 16;
const PCX = 0.44; // pack center
const PCY = 0.55;

const PAGE_STAG = 0.055;
const PAGE_FLIGHT = 0.42;
const TAB_START = 0.85;
const TAB_STAG = 0.1;
const TAB_SLIDE = 0.26;
const CARD_START = 1.05;
const CARD_STAG = 0.13;
const CARD_FAN = 0.45;
const BAR_LAG = 0.25;
const BAR_DUR = 0.7;
const SETTLE_AT = 2.35;

interface Page {
  hx: number; // drifting home (fractions)
  hy: number;
  ang: number;
  ph: number;
  amp: number;
  delay: number;
}

function buildPages(): Page[] {
  const rnd = mulberry(53);
  const pages: Page[] = [];
  for (let i = 0; i < PAGES; i++) {
    pages.push({
      hx: 0.1 + rnd() * 0.8,
      hy: 0.16 + rnd() * 0.68,
      ang: (rnd() - 0.5) * 0.3,
      ph: rnd() * Math.PI * 2,
      amp: 4 + rnd() * 5,
      delay: i * PAGE_STAG + rnd() * 0.02,
    });
  }
  return pages;
}

const CARDS = [
  { tx: 0.715, ty: 0.3, rot: -6, wgt: 0.82 },
  { tx: 0.75, ty: 0.53, rot: 0, wgt: 0.55 },
  { tx: 0.715, ty: 0.76, rot: 6, wgt: 0.34 },
];

export default function ChiefBeat({ flipped }: { flipped: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useBooth((s) => s.reducedMotion);
  const anim = useRef({ to: flipped ? 1 : 0, start: -1e9 });
  const pages = useRef<Page[]>(buildPages());

  useEffect(() => {
    const to = flipped ? 1 : 0;
    if (anim.current.to !== to) {
      anim.current = { to, start: performance.now() / 1000 + (flipped ? 0.45 : 0.05) };
    }
  }, [flipped]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let running = true;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = Math.max(1, Math.floor(rect.width));
      canvas.height = Math.max(1, Math.floor(rect.height));
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const sheet = (
      cx: number,
      cy: number,
      w: number,
      hgt: number,
      rot: number,
      fillA: number,
      strokeA: number,
    ) => {
      if (fillA <= 0.004 && strokeA <= 0.004) return;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      if (fillA > 0.004) {
        ctx.fillStyle = `rgba(${PAPER}, ${fillA})`;
        ctx.fillRect(-w / 2, -hgt / 2, w, hgt);
      }
      if (strokeA > 0.004) {
        ctx.strokeStyle = `rgba(${STEEL}, ${strokeA})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(-w / 2, -hgt / 2, w, hgt);
      }
      ctx.restore();
    };

    const draw = () => {
      if (!running) return;
      const now = performance.now() / 1000;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const a = anim.current;
      const since = now - a.start;
      const tw = a.to === 1 ? 1.9 : 0.85;
      const flipProg = clamp(since / tw, 0, 1);
      // 0 = loose reading, 1 = the pack assembled and weighed
      const state = a.to === 1 ? flipProg : 1 - flipProg;
      const settled = a.to === 1 && since >= SETTLE_AT;
      const atRest = a.to === 0 && state < 0.02;

      const pcx = PCX * W;
      const pcy = PCY * H;
      const breathe = settled && !reduced ? 1 + 0.004 * Math.sin(now * 0.7) : 1;
      const ph = 0.42 * H * breathe;
      const pw = ph * 0.72;
      const packL = pcx - pw / 2;
      const packT = pcy - ph / 2;

      // how much of the pack has landed
      let build = 0;
      const pageLocal = (pg: Page) =>
        a.to === 1 ? clamp((since - pg.delay) / PAGE_FLIGHT, 0, 1) : state;
      for (const pg of pages.current) {
        build += clamp((pageLocal(pg) - 0.75) / 0.25, 0, 1);
      }
      build /= PAGES;

      // faint outline where the pack will sit
      if (build < 0.98) {
        ctx.strokeStyle = `rgba(${STEEL}, ${0.26 * (1 - build)})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(packL, packT, pw, ph);
      }

      // the assembled pack
      if (build > 0.01) {
        ctx.save();
        ctx.shadowColor = `rgba(0, 0, 0, ${0.55 * build})`;
        ctx.shadowBlur = 24 * build;
        ctx.shadowOffsetY = 8 * build;
        ctx.fillStyle = `rgba(${PAPER}, ${0.04 + 0.12 * build})`;
        ctx.fillRect(packL, packT, pw, ph);
        ctx.restore();

        // stacked-sheet thickness under the bottom edge
        for (let k = 1; k <= 4; k++) {
          ctx.fillStyle = `rgba(${PAPER}, ${(0.3 - k * 0.06) * build})`;
          ctx.fillRect(packL + k * 1.2, packT + ph + k * 2 - 1, pw - k * 2.4, 1);
        }

        ctx.strokeStyle = `rgba(${PAPER}, ${0.4 * build})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(packL, packT, pw, ph);

        // abstract header and body lines on the top sheet
        const pad = pw * 0.12;
        ctx.fillStyle = `rgba(${BLUE}, ${0.55 * build})`;
        ctx.fillRect(packL + pad, packT + ph * 0.09, pw * 0.4, Math.max(3, H * 0.008));
        const widths = [0.86, 0.7, 0.78, 0.5];
        for (let li = 0; li < widths.length; li++) {
          ctx.fillStyle = `rgba(${PAPER}, ${0.32 * build})`;
          ctx.fillRect(
            packL + pad,
            packT + ph * (0.2 + li * 0.055),
            (pw - pad * 2) * widths[li],
            Math.max(1.5, H * 0.004),
          );
        }
      }

      // tabs slide out of the right edge, one after another
      const glintU = now / 2.6;
      const glintIdx = Math.floor(glintU) % 4;
      const glintPh = glintU % 1;
      const glint = settled && !reduced && glintPh < 0.3 ? Math.sin((Math.PI * glintPh) / 0.3) : 0;
      const tabW = W * 0.02;
      const tabH = H * 0.03;
      for (let k = 0; k < 4; k++) {
        const local =
          a.to === 1 ? clamp((since - (TAB_START + k * TAB_STAG)) / TAB_SLIDE, 0, 1) : state;
        const e = easeInOut(local);
        if (e <= 0.01) continue;
        const tx = packL + pw - tabW + e * tabW * 0.78;
        const ty = packT + ph * (0.14 + k * 0.2);
        const color = k % 2 === 0 ? BLUE : STEEL;
        ctx.fillStyle = `rgba(${color}, ${0.6 * e})`;
        ctx.fillRect(tx, ty, tabW, tabH);
        if (k === glintIdx && glint > 0.01) {
          ctx.shadowColor = `rgba(${PAPER}, ${0.7 * glint})`;
          ctx.shadowBlur = 10;
          ctx.fillStyle = `rgba(${PAPER}, ${0.55 * glint})`;
          ctx.fillRect(tx, ty, tabW, tabH);
          ctx.shadowBlur = 0;
        }
      }

      // pages: drifting at rest, flying during the flip
      const quality = qualityTier();
      const maxDrift = quality > 0.7 ? PAGES : quality > 0.4 ? 12 : 9;
      for (let i = 0; i < pages.current.length; i++) {
        const pg = pages.current[i];
        if (atRest) {
          if (i >= maxDrift) continue;
          const dx = reduced ? 0 : Math.sin(now * 0.22 + pg.ph) * pg.amp;
          const dy = reduced ? 0 : Math.cos(now * 0.17 + pg.ph * 1.7) * pg.amp * 0.7;
          const wob = reduced ? 0 : 0.02 * Math.sin(now * 0.3 + pg.ph);
          sheet(pg.hx * W + dx, pg.hy * H + dy, pw * 0.6, ph * 0.6, pg.ang + wob, 0.07, 0.2);
          continue;
        }
        const local = pageLocal(pg);
        if (local >= 1) continue; // absorbed into the pack
        const p = easeInOut(local);
        const dx = Math.sin(now * 0.22 + pg.ph) * pg.amp * (1 - p);
        const dy = Math.cos(now * 0.17 + pg.ph * 1.7) * pg.amp * 0.7 * (1 - p);
        const cx = lerp(pg.hx * W + dx, pcx, p);
        const cy = lerp(pg.hy * H + dy, pcy, p);
        const sc = lerp(0.6, 1, p);
        // pages skipped at rest under low tiers fade in with their flight
        const vis = i < maxDrift ? 1 : clamp(local * 4, 0, 1);
        sheet(
          cx,
          cy,
          pw * sc,
          ph * sc,
          pg.ang * (1 - p),
          lerp(0.07, 0.16, p) * vis,
          lerp(0.2, 0.35, p) * vis,
        );
      }

      // three option cards fan out to the right
      const cw = W * 0.15;
      const chH = H * 0.2;
      const startX = pcx + pw * 0.25;
      for (let j = 0; j < CARDS.length; j++) {
        const cd = CARDS[j];
        const local =
          a.to === 1 ? clamp((since - (CARD_START + j * CARD_STAG)) / CARD_FAN, 0, 1) : state;
        const p = easeInOut(local);
        if (p <= 0.01) continue;
        const cx = lerp(startX, cd.tx * W, p);
        const cy = lerp(pcy, cd.ty * H, p);
        const sc = lerp(0.7, 1, p);
        const w = cw * sc;
        const hgt = chH * sc;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((cd.rot * Math.PI * p) / 180);

        const glowA =
          j === 0 && settled ? (reduced ? 0.3 : 0.25 + 0.12 * Math.sin(now * 0.9)) : 0;
        if (glowA > 0.01) {
          ctx.shadowColor = `rgba(${GOLD}, ${glowA})`;
          ctx.shadowBlur = 20;
        }
        ctx.fillStyle = `rgba(${INK}, ${0.92 * p})`;
        ctx.fillRect(-w / 2, -hgt / 2, w, hgt);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(${STEEL}, ${0.55 * p})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(-w / 2, -hgt / 2, w, hgt);

        // gold header bar and two abstract lines
        const pad = w * 0.1;
        ctx.fillStyle = `rgba(${GOLD}, ${0.8 * p})`;
        ctx.fillRect(-w / 2 + pad, -hgt / 2 + pad * 0.9, (w - pad * 2) * 0.5, Math.max(3, hgt * 0.05));
        const lines = [0.85, 0.62];
        for (let li = 0; li < lines.length; li++) {
          ctx.fillStyle = `rgba(${PAPER}, ${0.28 * p})`;
          ctx.fillRect(
            -w / 2 + pad,
            -hgt / 2 + hgt * (0.32 + li * 0.14),
            (w - pad * 2) * lines[li],
            Math.max(1.5, hgt * 0.02),
          );
        }

        // weight bar
        const barY = hgt / 2 - hgt * 0.24;
        const barH = Math.max(3, hgt * 0.06);
        const barW = w - pad * 2;
        ctx.fillStyle = `rgba(${STEEL}, ${0.32 * p})`;
        ctx.fillRect(-w / 2 + pad, barY, barW, barH);
        const rawBar =
          a.to === 1 ? clamp((since - (CARD_START + j * CARD_STAG + BAR_LAG)) / BAR_DUR, 0, 1) : state;
        const fillP = a.to === 1 ? decel(rawBar) : rawBar;
        const fw = barW * cd.wgt * fillP;
        if (fw > 0.5) {
          ctx.fillStyle = `rgba(${BLUE}, ${0.85 * p})`;
          ctx.fillRect(-w / 2 + pad, barY, fw, barH);
          if (a.to === 1 && rawBar > 0 && rawBar < 1) {
            ctx.shadowColor = `rgba(${BLUE}, 0.8)`;
            ctx.shadowBlur = 10;
            ctx.fillStyle = `rgba(${PAPER}, 0.9)`;
            ctx.fillRect(-w / 2 + pad + fw - 1.5, barY, 2, barH);
            ctx.shadowBlur = 0;
          }
        }
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reduced]);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />
    </div>
  );
}
