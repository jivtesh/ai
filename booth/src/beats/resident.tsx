// Room 3 beat. The fictional island of Kestrel as eight misregistered
// acetate layers; on flip they settle into one registered composite and a
// sync pulse rings out from the centroid. Settled: a slow coastline sweep.

import { useEffect, useRef } from "react";
import { useBooth } from "../state/store";
import { mulberry } from "../lib/rand";
import { clamp, lerp, easeInOut } from "../lib/motion";
import { qualityTier } from "../lib/quality";

const BLUE = "46, 155, 214";
const GOLD = "217, 164, 65";
const STEEL = "91, 100, 112";
const HAIR = "42, 52, 68";

// Coastline points shared with the doorway mini (minis.ts keeps its own copy).
const KESTREL: [number, number][] = [
  [0.22, 0.18], [0.34, 0.14], [0.47, 0.17], [0.58, 0.13], [0.7, 0.2],
  [0.78, 0.3], [0.74, 0.42], [0.8, 0.53], [0.72, 0.64], [0.62, 0.7],
  [0.52, 0.66], [0.44, 0.74], [0.33, 0.78], [0.24, 0.7], [0.18, 0.58],
  [0.14, 0.44], [0.2, 0.32], [0.22, 0.18],
];

const CENTROID = (() => {
  let x = 0;
  let y = 0;
  const n = KESTREL.length - 1;
  for (let i = 0; i < n; i++) {
    x += KESTREL[i][0];
    y += KESTREL[i][1];
  }
  return [x / n, y / n] as const;
})();

// Coastline recentered on the island centroid, in island units.
const PTS: [number, number][] = KESTREL.map(([x, y]) => [x - CENTROID[0], y - CENTROID[1]]);

const ARC = (() => {
  const cum = [0];
  for (let i = 1; i < PTS.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(PTS[i][0] - PTS[i - 1][0], PTS[i][1] - PTS[i - 1][1]));
  }
  return cum;
})();
const ARC_LEN = ARC[ARC.length - 1];

function pointAt(u: number): [number, number] {
  const d = (((u % 1) + 1) % 1) * ARC_LEN;
  let i = 1;
  while (i < ARC.length - 1 && ARC[i] < d) i++;
  const t = (d - ARC[i - 1]) / (ARC[i] - ARC[i - 1]);
  return [lerp(PTS[i - 1][0], PTS[i][0], t), lerp(PTS[i - 1][1], PTS[i][1], t)];
}

interface Layer {
  dx: number; // base misregistration, island units
  dy: number;
  rot: number;
  scl: number;
  ph: number; // drift phase
  spd: number;
  amp: number;
  color: string;
  alpha: number;
}

const LAYERS: Layer[] = (() => {
  const rnd = mulberry(31);
  return Array.from({ length: 8 }, (_, i) => {
    const ang = (i / 8) * Math.PI * 2 + rnd() * 0.6;
    const dist = 0.022 + rnd() * 0.03;
    return {
      dx: Math.cos(ang) * dist,
      dy: Math.sin(ang) * dist * 0.85,
      rot: (rnd() * 2 - 1) * 0.07,
      scl: 1 + (rnd() * 2 - 1) * 0.035,
      ph: rnd() * Math.PI * 2,
      spd: 0.16 + rnd() * 0.22,
      amp: 0.005 + rnd() * 0.007,
      color: i % 3 === 1 ? BLUE : STEEL,
      alpha: 0.15 + rnd() * 0.08,
    };
  });
})();

const DOTS = [1, 4, 7, 10, 13]; // settlement points along the coast

const STAG = 0.06;
const LAYER_T = 1.1;
const LAND = STAG * (LAYERS.length - 1) + LAYER_T; // when the last layer is home
const PULSE_T = 0.9;

export default function ResidentBeat({ flipped }: { flipped: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useBooth((s) => s.reducedMotion);
  const anim = useRef({ to: flipped ? 1 : 0, start: -1e9 });

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
    let frameCount = 0;
    let driftNow = performance.now() / 1000;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = Math.max(1, Math.floor(rect.width));
      canvas.height = Math.max(1, Math.floor(rect.height));
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const trace = (
      cx: number,
      cy: number,
      S: number,
      dx: number,
      dy: number,
      rot: number,
      scl: number,
    ) => {
      const cos = Math.cos(rot);
      const sin = Math.sin(rot);
      ctx.beginPath();
      for (let i = 0; i < PTS.length; i++) {
        const x = PTS[i][0] * scl;
        const y = PTS[i][1] * scl;
        const px = cx + (x * cos - y * sin + dx) * S;
        const py = cy + (x * sin + y * cos + dy) * S;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
    };

    const draw = () => {
      if (!running) return;
      const now = performance.now() / 1000;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";

      const a = anim.current;
      const since = now - a.start;
      const S = Math.min(W * 0.55, H * 1.05);
      const cx = W * 0.5;
      const cy = H * 0.48;

      const quality = qualityTier();
      // degrade the drift clock rate under load, never what gets drawn
      frameCount++;
      const hold = quality > 0.7 ? 1 : quality > 0.4 ? 2 : 3;
      if (frameCount % hold === 0) driftNow = now;

      // 0 = misregistered NOW, 1 = registered; settle carries the composite
      const reg: number[] = [];
      let settle: number;
      let pulseP = -1;
      if (a.to === 1) {
        for (let i = 0; i < LAYERS.length; i++) {
          reg.push(easeInOut(clamp((since - i * STAG) / LAYER_T, 0, 1)));
        }
        settle = easeInOut(clamp((since - LAND) / 0.7, 0, 1));
        pulseP = (since - LAND) / PULSE_T;
      } else {
        const back = easeInOut(clamp(since / 0.85, 0, 1));
        for (let i = 0; i < LAYERS.length; i++) reg.push(1 - back);
        settle = 1 - easeInOut(clamp(since / 0.4, 0, 1));
      }

      // hairline frame and faint graticule around the map area
      const fx = cx - S * 0.46;
      const fy = cy - S * 0.415;
      const fw = S * 0.92;
      const fh = S * 0.83;
      ctx.lineWidth = 1;
      if (quality > 0.4) {
        const gStep = S * 0.115;
        const gSkip = quality > 0.7 ? 1 : 2;
        ctx.strokeStyle = `rgba(${STEEL}, 0.09)`;
        let k = 0;
        for (let gx = fx + gStep; gx < fx + fw - 1; gx += gStep, k++) {
          if (k % gSkip !== 0) continue;
          ctx.beginPath();
          ctx.moveTo(gx, fy);
          ctx.lineTo(gx, fy + fh);
          ctx.stroke();
        }
        k = 0;
        for (let gy = fy + gStep; gy < fy + fh - 1; gy += gStep, k++) {
          if (k % gSkip !== 0) continue;
          ctx.beginPath();
          ctx.moveTo(fx, gy);
          ctx.lineTo(fx + fw, gy);
          ctx.stroke();
        }
      }
      ctx.strokeStyle = `rgba(${HAIR}, 0.9)`;
      ctx.strokeRect(fx, fy, fw, fh);

      ctx.globalCompositeOperation = "lighter";

      // the eight acetate layers
      const driftOn = reduced ? 0 : 1;
      for (let i = 0; i < LAYERS.length; i++) {
        const L = LAYERS[i];
        const mis = 1 - reg[i];
        const fade = 1 - settle;
        if (mis < 0.004 && fade < 0.004) continue; // composite carries it
        const ddx = (L.dx + driftOn * Math.sin(driftNow * L.spd + L.ph) * L.amp) * mis;
        const ddy = (L.dy + driftOn * Math.cos(driftNow * L.spd * 0.83 + L.ph * 1.7) * L.amp) * mis;
        const breathe = driftOn * 0.03 * Math.sin(driftNow * 0.5 + L.ph);
        ctx.strokeStyle = `rgba(${L.color}, ${(L.alpha + breathe) * fade})`;
        ctx.lineWidth = 1;
        trace(cx, cy, S, ddx, ddy, L.rot * mis, 1 + (L.scl - 1) * mis);
        ctx.stroke();
      }

      // registered composite, full blue with a quiet glow
      if (settle > 0.01) {
        ctx.fillStyle = `rgba(${BLUE}, ${0.05 * settle})`;
        trace(cx, cy, S, 0, 0, 0, 1);
        ctx.fill();
        ctx.shadowColor = `rgba(${BLUE}, ${0.55 * settle})`;
        ctx.shadowBlur = 14;
        ctx.strokeStyle = `rgba(${BLUE}, ${0.92 * settle})`;
        ctx.lineWidth = 1.6;
        trace(cx, cy, S, 0, 0, 0, 1);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // sync pulse from the centroid when the last layer lands
      if (a.to === 1 && pulseP >= 0 && pulseP < 1) {
        const fade = 1 - pulseP;
        ctx.strokeStyle = `rgba(${BLUE}, ${0.55 * fade})`;
        ctx.lineWidth = 2.5 - 1.5 * pulseP;
        ctx.beginPath();
        ctx.arc(cx, cy, lerp(S * 0.04, S * 0.66, easeInOut(pulseP)), 0, Math.PI * 2);
        ctx.stroke();
        const flash = fade * fade * 0.3;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.24);
        grad.addColorStop(0, `rgba(${BLUE}, ${flash})`);
        grad.addColorStop(1, `rgba(${BLUE}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(cx - S * 0.24, cy - S * 0.24, S * 0.48, S * 0.48);
      }

      // settlement dots along the coast
      if (settle > 0.01) {
        for (let k = 0; k < DOTS.length; k++) {
          const p = PTS[DOTS[k]];
          const glow = driftOn * 0.2 * Math.sin(now * 1.1 + k * 1.9);
          const alpha = (0.6 + glow) * settle;
          if (alpha <= 0.01) continue;
          if (quality > 0.6) {
            ctx.shadowColor = `rgba(${GOLD}, ${0.7 * settle})`;
            ctx.shadowBlur = 10;
          }
          ctx.fillStyle = `rgba(${GOLD}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(cx + p[0] * S, cy + p[1] * S, 2.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // settled NEXT: a slow sweep travels the coastline
      if (a.to === 1 && settle > 0.99 && !reduced) {
        const head = (now * 0.055) % 1;
        ctx.lineWidth = 2.2;
        for (let k = 0; k < 22; k++) {
          const [x0, y0] = pointAt(head - k * 0.006);
          const [x1, y1] = pointAt(head - (k + 1) * 0.006);
          const fade = 1 - k / 22;
          ctx.strokeStyle = `rgba(${BLUE}, ${0.5 * fade * fade})`;
          ctx.beginPath();
          ctx.moveTo(cx + x0 * S, cy + y0 * S);
          ctx.lineTo(cx + x1 * S, cy + y1 * S);
          ctx.stroke();
        }
      }

      ctx.globalCompositeOperation = "source-over";
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
