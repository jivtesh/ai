// Room 1, Office of Legal Affairs. A constellation of faint document nodes;
// on flip, threads draw node to node and converge on the clause being
// written. Counter 12 -> 4,800.

import { useEffect, useRef } from "react";
import Counter from "../components/Counter";
import { useT } from "../i18n/useT";
import { useBooth } from "../state/store";
import { mulberry } from "../lib/rand";
import { clamp, lerp, easeInOut } from "../lib/motion";
import { qualityTier } from "../lib/quality";

const NODES = 200;
const THREADS = 64;

const BLUE = "46, 155, 214";
const GOLD = "217, 164, 65";
const STEEL = "91, 100, 112";
const PAPER = "237, 234, 226";

const CLX = 0.62; // the clause
const CLY = 0.55;
const SPLIT = 0.42; // share of a thread spent reaching its relay node

interface DocNode {
  x: number;
  y: number;
  ph: number;
  blue: boolean;
  tw: boolean; // one of the few that twinkle
}

interface Thread {
  a: number; // source node
  b: number; // relay node on the way to the clause
  c1x: number;
  c1y: number;
  c2x: number;
  c2y: number;
  delay: number;
  dur: number;
}

function bowCtrl(x0: number, y0: number, x1: number, y1: number, amt: number): [number, number] {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  return [(x0 + x1) / 2 - (dy / len) * amt, (y0 + y1) / 2 + (dx / len) * amt];
}

function buildField() {
  const rnd = mulberry(21);
  const nodes: DocNode[] = [];
  for (let i = 0; i < NODES; i++) {
    nodes.push({
      x: 0.04 + rnd() * 0.92,
      y: 0.07 + rnd() * 0.86,
      ph: rnd() * Math.PI * 2,
      blue: rnd() < 0.3,
      tw: rnd() < 0.16,
    });
  }
  const srcIdx = new Set<number>();
  while (srcIdx.size < THREADS) srcIdx.add(Math.floor(rnd() * NODES));
  const threads: Thread[] = [];
  const anchors = new Set<number>();
  let i = 0;
  for (const a of srcIdx) {
    // relay: whichever random candidate sits closest to the halfway point
    const mx = (nodes[a].x + CLX) / 2;
    const my = (nodes[a].y + CLY) / 2;
    let b = (a + 1) % NODES;
    let bestD = 1e9;
    for (let k = 0; k < 7; k++) {
      const cand = Math.floor(rnd() * NODES);
      if (cand === a) continue;
      const d = (nodes[cand].x - mx) ** 2 + (nodes[cand].y - my) ** 2;
      if (d < bestD) {
        bestD = d;
        b = cand;
      }
    }
    const [c1x, c1y] = bowCtrl(nodes[a].x, nodes[a].y, nodes[b].x, nodes[b].y, (rnd() - 0.5) * 0.14);
    const [c2x, c2y] = bowCtrl(nodes[b].x, nodes[b].y, CLX, CLY, (rnd() - 0.5) * 0.12);
    threads.push({
      a,
      b,
      c1x,
      c1y,
      c2x,
      c2y,
      delay: (i / THREADS) * 0.95 + rnd() * 0.06,
      dur: 0.55 + rnd() * 0.3,
    });
    anchors.add(a);
    anchors.add(b);
    i++;
  }
  return { nodes, threads, anchors };
}

export default function LegalBeat({ flipped }: { flipped: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = useT();
  const reduced = useBooth((s) => s.reducedMotion);
  const anim = useRef({ to: flipped ? 1 : 0, start: -1e9 });
  const field = useRef(buildField());

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

    const quad = (
      x0: number,
      y0: number,
      cx: number,
      cy: number,
      x1: number,
      y1: number,
      tt: number,
    ): [number, number] => {
      const u = 1 - tt;
      return [
        u * u * x0 + 2 * u * tt * cx + tt * tt * x1,
        u * u * y0 + 2 * u * tt * cy + tt * tt * y1,
      ];
    };

    const strokeQuad = (
      x0: number,
      y0: number,
      cx: number,
      cy: number,
      x1: number,
      y1: number,
      upTo: number,
      alpha: number,
    ) => {
      if (upTo <= 0.01 || alpha <= 0.004) return;
      ctx.strokeStyle = `rgba(${BLUE}, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const steps = 14;
      for (let s = 0; s <= steps; s++) {
        const [px, py] = quad(x0, y0, cx, cy, x1, y1, (s / steps) * upTo);
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    };

    const dot = (x: number, y: number, r: number, color: string, alpha: number, glow = 0) => {
      if (alpha <= 0.004) return;
      if (glow > 0.01) {
        ctx.shadowColor = `rgba(${color}, ${Math.min(1, glow)})`;
        ctx.shadowBlur = 12;
      }
      ctx.fillStyle = `rgba(${color}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
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
      // 0 = constellation at rest, 1 = the web converged on the clause
      const state = a.to === 1 ? flipProg : 1 - flipProg;
      const settled = a.to === 1 && flipProg >= 1;

      const { nodes, threads, anchors } = field.current;
      const quality = qualityTier();
      const nodeStep = quality > 0.7 ? 1 : quality > 0.4 ? 2 : 3;
      const threadStep = quality > 0.7 ? 1 : quality > 0.4 ? 2 : 3;

      const clx = CLX * W;
      const cly = CLY * H;

      // nodes
      for (let n = 0; n < nodes.length; n++) {
        if (nodeStep > 1 && n % nodeStep !== 0 && !anchors.has(n)) continue;
        const nd = nodes[n];
        const drift = reduced ? 0 : Math.sin(now * 0.32 + nd.ph) * 1.6;
        const twk = nd.tw && !reduced ? 0.14 * (0.5 + 0.5 * Math.sin(now * 1.3 + nd.ph)) : 0;
        const base = nd.blue ? 0.5 : 0.52;
        dot(
          nd.x * W + drift,
          nd.y * H,
          nd.blue ? 2.4 : 2,
          nd.blue ? BLUE : STEEL,
          (base + twk) * (1 - 0.3 * state),
        );
      }

      // threads and the arrival tally that lights the clause
      let arrived = 0;
      if (state > 0.005 || a.to === 1) {
        for (let ti = 0; ti < threads.length; ti++) {
          const th = threads[ti];
          const local = a.to === 1 ? clamp((since - th.delay) / th.dur, 0, 1) : state;
          if (local >= 1) arrived++;
          if (threadStep > 1 && ti % threadStep !== 0) continue;
          if (local <= 0) continue;

          const ax = nodes[th.a].x * W;
          const ay = nodes[th.a].y * H;
          const bx = nodes[th.b].x * W;
          const by = nodes[th.b].y * H;

          let alpha: number;
          if (a.to === 1) {
            alpha =
              local < 1
                ? 0.34
                : lerp(0.34, 0.12, clamp((since - th.delay - th.dur) / 0.8, 0, 1));
          } else {
            alpha = 0.3 * state;
          }

          const p1 = clamp(local / SPLIT, 0, 1);
          strokeQuad(ax, ay, th.c1x * W, th.c1y * H, bx, by, p1, alpha);
          if (local > SPLIT) {
            const p2 = (local - SPLIT) / (1 - SPLIT);
            strokeQuad(bx, by, th.c2x * W, th.c2y * H, clx, cly, p2, alpha);
          }

          if (a.to === 1 && local < 1) {
            // bright drawing tip
            const [tx, ty] =
              local < SPLIT
                ? quad(ax, ay, th.c1x * W, th.c1y * H, bx, by, local / SPLIT)
                : quad(bx, by, th.c2x * W, th.c2y * H, clx, cly, (local - SPLIT) / (1 - SPLIT));
            dot(tx, ty, 2, BLUE, 0.85, 0.6);
            // nodes flash as the thread leaves them
            if (local < 0.16) dot(ax, ay, 2.6, BLUE, 0.9 * Math.sin((Math.PI * local) / 0.16), 0.7);
            const rel = local - SPLIT;
            if (rel > 0 && rel < 0.14) {
              dot(bx, by, 2.6, BLUE, 0.9 * Math.sin((Math.PI * rel) / 0.14), 0.7);
            }
          }
        }
      }

      // settled NEXT: slow pulses ride random threads into the clause
      if (settled && !reduced) {
        const kept = Math.ceil(threads.length / threadStep);
        for (let k = 0; k < 3; k++) {
          const u = now * 0.16 + k * 0.37;
          const pt = easeInOut(u % 1);
          const th = threads[((Math.floor(u) * 13 + k * 7) % kept) * threadStep];
          const ax = nodes[th.a].x * W;
          const ay = nodes[th.a].y * H;
          const bx = nodes[th.b].x * W;
          const by = nodes[th.b].y * H;
          const [px, py] =
            pt < SPLIT
              ? quad(ax, ay, th.c1x * W, th.c1y * H, bx, by, pt / SPLIT)
              : quad(bx, by, th.c2x * W, th.c2y * H, clx, cly, (pt - SPLIT) / (1 - SPLIT));
          dot(px, py, 2.2, BLUE, 0.55 * Math.sin((u % 1) * Math.PI), 0.5);
        }
      }

      // the clause
      let clauseA: number;
      if (a.to === 1) {
        const pre = 0.25 * easeInOut(clamp(since / 0.6, 0, 1));
        clauseA = Math.max(pre, arrived / threads.length);
      } else {
        clauseA = state;
      }
      if (clauseA > 0.01) {
        const breathe = settled && !reduced ? 0.5 + 0.5 * Math.sin(now * 0.9) : clauseA * 0.5;
        const cw = W * 0.085;
        const ch = H * 0.075;
        const r = cw * (1.15 + 0.3 * breathe);
        const grad = ctx.createRadialGradient(clx, cly, 0, clx, cly, r);
        grad.addColorStop(0, `rgba(${GOLD}, ${0.3 * clauseA * (0.6 + 0.4 * breathe)})`);
        grad.addColorStop(1, `rgba(${GOLD}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(clx, cly, r, 0, Math.PI * 2);
        ctx.fill();

        const bxr = clx - cw / 2;
        const byr = cly - ch / 2;
        ctx.fillStyle = `rgba(${GOLD}, ${0.09 * clauseA})`;
        ctx.fillRect(bxr, byr, cw, ch);
        ctx.shadowColor = `rgba(${GOLD}, ${0.6 * clauseA})`;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = `rgba(${GOLD}, ${0.8 * clauseA})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(bxr, byr, cw, ch);
        ctx.shadowBlur = 0;

        // the paragraph being written
        const widths = [0.84, 0.94, 0.9, 0.52];
        const pad = cw * 0.1;
        for (let li = 0; li < widths.length; li++) {
          const ly = byr + ch * 0.2 + li * ch * 0.19;
          ctx.fillStyle = `rgba(${PAPER}, ${0.5 * clauseA})`;
          ctx.fillRect(bxr + pad, ly, (cw - pad * 2) * widths[li], Math.max(1.5, H * 0.004));
        }
        if (settled && !reduced && Math.sin(now * 2.6) > 0) {
          const lastY = byr + ch * 0.2 + 3 * ch * 0.19;
          ctx.fillStyle = `rgba(${GOLD}, 0.9)`;
          ctx.fillRect(bxr + pad + (cw - pad * 2) * 0.52 + 3, lastY - 2, 2, Math.max(4, H * 0.011));
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
      {/* sources cross-referenced: 12 in the present, 4,800 in five years */}
      <div style={{ position: "absolute", top: "6%", left: "5.5%" }}>
        <div
          className="type-display"
          style={{
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1,
            color: flipped ? "var(--gold)" : "rgba(160, 170, 184, 0.95)",
            textShadow: flipped ? "0 0 30px rgba(217, 164, 65, 0.4)" : "none",
            transition: "color 0.9s, text-shadow 0.9s",
          }}
        >
          <Counter value={flipped ? 4800 : 12} duration={1.6} delay={flipped ? 0.7 : 0.1} />
        </div>
        <div
          className="type-label"
          style={{
            marginTop: 8,
            fontSize: 12,
            color: flipped ? `rgba(${GOLD}, 0.85)` : "rgba(160, 170, 184, 0.7)",
            transition: "color 0.9s",
          }}
        >
          {t("beat.legal.counter")}
        </div>
      </div>
    </div>
  );
}
