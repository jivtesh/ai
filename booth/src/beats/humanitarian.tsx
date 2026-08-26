// Room 4, Humanitarian Response. Dark terrain, a flood bloom slowly filling
// with needs over weeks; on flip the bloom resolves into a graded heat grid
// and supply routes draw themselves in from the edges, dots moving by dawn.

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useT } from "../i18n/useT";
import { useBooth } from "../state/store";
import { mulberry } from "../lib/rand";
import { clamp, lerp, easeInOut } from "../lib/motion";
import { qualityTier } from "../lib/quality";

const BLUE = "46, 155, 214";
const GOLD = "217, 164, 65";
const STEEL = "91, 100, 112";

const CX = 0.55; // bloom center
const CY = 0.5;

interface Cell {
  gx: number; // resolved grid position (fractions)
  gy: number;
  nx: number; // scattered NOW position
  ny: number;
  heat: number;
  inNow: boolean; // part of the sparse slow fill
  nowDelay: number; // seconds into the NOW fill
  snapDelay: number; // flip stagger, radiating outward
  ph: number;
}

function buildCells(): Cell[] {
  const rnd = mulberry(41);
  const cells: Cell[] = [];
  for (let gi = -7; gi <= 7; gi++) {
    for (let gj = -5; gj <= 5; gj++) {
      const u = gi / 7.4;
      const v = gj / 5.4;
      const d = Math.hypot(u, v);
      if (d > 1) continue;
      if (d > 0.78 && rnd() < 0.4) continue; // ragged edge
      if (rnd() < 0.08) continue;
      cells.push({
        gx: CX + gi * 0.0205,
        gy: CY + gj * 0.043,
        nx: CX + gi * 0.0205 + (rnd() - 0.5) * 0.016,
        ny: CY + gj * 0.043 + (rnd() - 0.5) * 0.028,
        heat: clamp(1 - d * 0.85 + (rnd() - 0.5) * 0.3, 0.08, 1),
        inNow: rnd() < 0.5,
        nowDelay: 0,
        snapDelay: Math.floor(d * 8) * 0.06 + rnd() * 0.05,
        ph: rnd() * Math.PI * 2,
      });
    }
  }
  const order = cells.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  order.forEach((ci, k) => {
    cells[ci].nowDelay = k * 1.1 + rnd() * 0.6 - 14;
  });
  return cells;
}

interface Route {
  x0: number;
  y0: number;
  cx: number;
  cy: number;
  x1: number;
  y1: number;
  delay: number;
  dur: number;
}

const ROUTES: Route[] = [
  { x0: -0.02, y0: 0.24, cx: 0.24, cy: 0.16, x1: 0.435, y1: 0.42, delay: 0.55, dur: 0.9 },
  { x0: 0.28, y0: -0.03, cx: 0.35, cy: 0.2, x1: 0.492, y1: 0.36, delay: 0.73, dur: 0.9 },
  { x0: 1.02, y0: 0.7, cx: 0.84, cy: 0.74, x1: 0.678, y1: 0.55, delay: 0.91, dur: 0.9 },
  { x0: 0.6, y0: 1.03, cx: 0.49, cy: 0.85, x1: 0.516, y1: 0.63, delay: 1.09, dur: 0.9 },
];

function quad(r: Route, W: number, H: number, tt: number): [number, number] {
  const u = 1 - tt;
  return [
    (u * u * r.x0 + 2 * u * tt * r.cx + tt * tt * r.x1) * W,
    (u * u * r.y0 + 2 * u * tt * r.cy + tt * tt * r.y1) * H,
  ];
}

export default function HumanitarianBeat({ flipped }: { flipped: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = useT();
  const reduced = useBooth((s) => s.reducedMotion);
  const anim = useRef({ to: flipped ? 1 : 0, start: -1e9 });
  const cells = useRef<Cell[]>(buildCells());
  const t0 = useRef(performance.now() / 1000);

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

    const strokeRoute = (r: Route, W: number, H: number, upTo: number, alpha: number) => {
      if (upTo <= 0.01 || alpha <= 0.004) return;
      ctx.strokeStyle = `rgba(${BLUE}, ${alpha})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      const steps = 24;
      for (let s = 0; s <= steps; s++) {
        const [px, py] = quad(r, W, H, (s / steps) * upTo);
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    };

    const draw = () => {
      if (!running) return;
      const now = performance.now() / 1000;
      const tm = now - t0.current;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const a = anim.current;
      const since = now - a.start;
      const tw = a.to === 1 ? 2.0 : 0.85;
      const flipProg = clamp(since / tw, 0, 1);
      // 0 = slow needs map at T+3 weeks, 1 = resolved picture at T+6 hours
      const state = a.to === 1 ? flipProg : 1 - flipProg;
      const settled = a.to === 1 && flipProg >= 1;

      const quality = qualityTier();
      const terrainStep = quality > 0.7 ? 7 : quality > 0.4 ? 11 : 16;
      const cellStep = quality > 0.7 ? 1 : 2;
      const dotsPerRoute = quality > 0.7 ? 3 : quality > 0.4 ? 2 : 1;

      // terrain: layered sinuous ridge hairlines, receding as heat takes over
      for (let i = 0; i < 6; i++) {
        const yBase = H * (0.13 + i * 0.15);
        const drift = reduced ? 0 : Math.sin(now * 0.13 + i * 1.7) * 0.35;
        ctx.strokeStyle = `rgba(${STEEL}, ${(0.15 + i * 0.014) * (1 - 0.35 * state)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= W; x += terrainStep) {
          const y =
            yBase +
            Math.sin(x * 0.006 + i * 2.1 + drift) * H * 0.028 +
            Math.sin(x * 0.017 + i * 4.7) * H * 0.01;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // the flood bloom: an irregular stain, growing almost imperceptibly
      const fill = reduced ? 0.5 : clamp(tm / 150, 0, 1);
      const pulse = reduced ? 0 : 0.003 * Math.sin(now * 0.25);
      const r = W * (0.125 + 0.025 * fill + pulse);
      const wob = reduced ? 0 : now * 0.03;
      const breatheA = settled && !reduced ? 0.15 * Math.sin(now * 0.5) : 0;
      const coreA = lerp(0.22, 0.09, easeInOut(state)) * (1 + breatheA);
      const bx = CX * W;
      const by = CY * H;
      const grad = ctx.createRadialGradient(bx, by, 0, bx, by, r * 1.25);
      grad.addColorStop(0, `rgba(${BLUE}, ${coreA})`);
      grad.addColorStop(1, `rgba(${BLUE}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      const blobSteps = 40;
      for (let s = 0; s <= blobSteps; s++) {
        const th = (s / blobSteps) * Math.PI * 2;
        const rr =
          r * (1 + 0.14 * Math.sin(3 * th + 0.7 + wob) + 0.09 * Math.sin(5 * th - 1.3 - wob * 0.6));
        const px = bx + Math.cos(th) * rr;
        const py = by + Math.sin(th) * rr * 0.88;
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      // needs cells: scattered and dim now, a graded heat grid after the flip
      const sNow = Math.max(3, W * 0.006);
      const sGrid = Math.max(6, W * 0.0115);
      for (let i = 0; i < cells.current.length; i++) {
        const c = cells.current[i];
        if (cellStep > 1 && i % cellStep !== 0 && c.heat < 0.7) continue;

        const p = a.to === 1 ? clamp((since - c.snapDelay) / 0.3, 0, 1) : state;
        const e = easeInOut(p);

        const fillIn = reduced ? 1 : clamp((tm - c.nowDelay) / 5, 0, 1);
        const breathe = reduced ? 1 : 0.85 + 0.15 * Math.sin(now * 0.5 + c.ph);
        const nowA = c.inNow ? 0.3 * fillIn * breathe : 0;

        let heatA = 0.16 + 0.64 * c.heat;
        if (settled && !reduced) heatA *= 0.9 + 0.1 * Math.sin(now * 1.2 + c.ph);

        const alpha = lerp(nowA, heatA, e);
        if (alpha <= 0.004) continue;

        const x = lerp(c.nx, c.gx, e) * W;
        const y = lerp(c.ny, c.gy, e) * H;
        const s = lerp(sNow, sGrid, e);
        if (a.to === 1 && p > 0 && p < 1) {
          ctx.shadowColor = `rgba(${BLUE}, ${0.6 * Math.sin(Math.PI * p)})`;
          ctx.shadowBlur = 10;
        }
        ctx.fillStyle = `rgba(${BLUE}, ${alpha})`;
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
        ctx.shadowBlur = 0;
      }

      // one cell at a time brightens, then relaxes
      if (settled && !reduced) {
        const cyc = 3.1;
        const k = (Math.floor(now / cyc) * 29 + 13) % cells.current.length;
        const bp = (now % cyc) / cyc;
        const flash = Math.sin(Math.PI * clamp(bp * 1.6, 0, 1));
        if (flash > 0.01) {
          const c = cells.current[k];
          const s = sGrid * (1 + 0.3 * flash);
          ctx.shadowColor = `rgba(${BLUE}, ${0.8 * flash})`;
          ctx.shadowBlur = 14;
          ctx.fillStyle = `rgba(${BLUE}, ${0.35 * flash})`;
          ctx.fillRect(c.gx * W - s / 2, c.gy * H - s / 2, s, s);
          ctx.shadowBlur = 0;
        }
      }

      // supply routes draw themselves in from the edges, then keep flowing
      if (state > 0.005 || a.to === 1) {
        for (let ri = 0; ri < ROUTES.length; ri++) {
          const rt = ROUTES[ri];
          const local = a.to === 1 ? clamp((since - rt.delay) / rt.dur, 0, 1) : state;
          if (local <= 0) continue;
          const upTo = easeInOut(local);
          strokeRoute(rt, W, H, upTo, a.to === 1 ? 0.42 : 0.42 * state);

          if (a.to === 1 && local > 0 && local < 1) {
            // bright drawing tip
            const [tx, ty] = quad(rt, W, H, upTo);
            ctx.shadowColor = `rgba(${BLUE}, 0.7)`;
            ctx.shadowBlur = 12;
            ctx.fillStyle = `rgba(${BLUE}, 0.9)`;
            ctx.beginPath();
            ctx.arc(tx, ty, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          // gold dots: aid moving along the route
          if (a.to === 1 && local >= 1) {
            for (let k = 0; k < dotsPerRoute; k++) {
              const u = reduced
                ? 0.3 + k * 0.25
                : (now * 0.16 + k / dotsPerRoute + ri * 0.23) % 1;
              const fade = clamp(Math.min(u, 1 - u) * 7, 0, 1);
              if (fade <= 0.01) continue;
              const [px, py] = quad(rt, W, H, u);
              ctx.shadowColor = `rgba(${GOLD}, ${0.6 * fade})`;
              ctx.shadowBlur = 10;
              ctx.fillStyle = `rgba(${GOLD}, ${0.8 * fade})`;
              ctx.beginPath();
              ctx.arc(px, py, 2.4, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }
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
      {/* the timer: T+3 weeks in the present, T+6 hours in five years */}
      <div
        style={{
          position: "absolute",
          top: "6%",
          left: "5.5%",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <motion.span
          initial={false}
          animate={reduced || flipped ? { opacity: 0.9 } : { opacity: [0.9, 0.15, 0.9] }}
          transition={
            reduced || flipped
              ? { duration: 0.4 }
              : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
          }
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: flipped ? `rgb(${BLUE})` : "rgb(160, 170, 184)",
            boxShadow: flipped ? `0 0 10px rgba(${BLUE}, 0.7)` : "none",
            transition: "background 0.9s, box-shadow 0.9s",
          }}
        />
        <div style={{ position: "relative", fontSize: 15 }}>
          <motion.div
            className="type-label"
            initial={false}
            animate={{ opacity: flipped ? 0 : 1 }}
            transition={{ duration: 0.6, delay: flipped ? 0.1 : 0.35 }}
            style={{ color: "rgba(160, 170, 184, 0.9)" }}
          >
            {t("beat.humanitarian.tnow")}
          </motion.div>
          <motion.div
            className="type-label"
            initial={false}
            animate={{ opacity: flipped ? 1 : 0 }}
            transition={{ duration: 0.6, delay: flipped ? 0.5 : 0.05 }}
            style={{
              position: "absolute",
              inset: 0,
              color: `rgba(${BLUE}, 0.95)`,
              textShadow: `0 0 18px rgba(${BLUE}, 0.45)`,
            }}
          >
            {t("beat.humanitarian.tnext")}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
