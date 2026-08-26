// The reference beat. A stacked queue of 346 tickets; on flip they stream
// through a "cleared against policy" channel in 1.4s, leaving six gold
// exceptions floating. Counter 346 -> 6.

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Counter from "../components/Counter";
import { useT } from "../i18n/useT";
import { useBooth } from "../state/store";
import { mulberry } from "../lib/rand";
import { clamp, lerp, easeInOut } from "../lib/motion";
import { qualityTier } from "../lib/quality";

const TOTAL = 346;
const EXCEPTIONS = 6;

const BLUE = "46, 155, 214";
const GOLD = "217, 164, 65";
const STEEL = "91, 100, 112";

interface Ticket {
  sx: number; // stack position (fractions)
  sy: number;
  delay: number; // stream start, seconds into the flip
  exit: boolean; // one of the six exceptions
  fx: number; // float target for exceptions
  fy: number;
  bob: number;
  channelX: number; // where an exception leaves the channel
}

function buildTickets(): Ticket[] {
  const rnd = mulberry(77);
  const cols = 13;
  const tickets: Ticket[] = [];
  const exceptionIdx = new Set<number>();
  while (exceptionIdx.size < EXCEPTIONS) {
    exceptionIdx.add(40 + Math.floor(rnd() * (TOTAL - 80)));
  }
  let e = 0;
  for (let i = 0; i < TOTAL; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const exit = exceptionIdx.has(i);
    tickets.push({
      sx: 0.045 + col * 0.0195 + rnd() * 0.004,
      sy: 0.94 - row * 0.0305 - rnd() * 0.004,
      delay: (i / TOTAL) * 0.9 + rnd() * 0.05,
      exit,
      fx: exit ? 0.56 + (e / (EXCEPTIONS - 1)) * 0.32 : 0,
      fy: exit ? 0.2 + ((e * 37) % 100) / 100 * 0.16 : 0,
      bob: rnd() * Math.PI * 2,
      channelX: exit ? 0.52 + (e++ / EXCEPTIONS) * 0.3 : 0,
    });
  }
  return tickets;
}

const CH_Y = 0.52; // channel center y
const CH_X0 = 0.36;
const CH_X1 = 0.94;
const FLIGHT = 0.5; // seconds through the channel

export default function ProcurementBeat({ flipped }: { flipped: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = useT();
  const reduced = useBooth((s) => s.reducedMotion);
  const [labelOn, setLabelOn] = useState(flipped);
  const anim = useRef({ to: flipped ? 1 : 0, start: -1e9 });
  const tickets = useRef<Ticket[]>(buildTickets());

  useEffect(() => {
    const to = flipped ? 1 : 0;
    if (anim.current.to !== to) {
      anim.current = { to, start: performance.now() / 1000 + (flipped ? 0.45 : 0.05) };
    }
    const id = window.setTimeout(() => setLabelOn(flipped), flipped ? 700 : 150);
    return () => window.clearTimeout(id);
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

    const drawTicket = (
      x: number,
      y: number,
      w: number,
      hgt: number,
      color: string,
      alpha: number,
      glow = 0,
    ) => {
      if (alpha <= 0.004) return;
      if (glow > 0.01) {
        ctx.shadowColor = `rgba(${color}, ${Math.min(1, glow)})`;
        ctx.shadowBlur = 14;
      }
      ctx.fillStyle = `rgba(${color}, ${alpha})`;
      ctx.fillRect(x, y, w, hgt);
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
      // 0 = full stack, 1 = cleared
      const tw = a.to === 1 ? 1.9 : 0.85;
      const flipProg = clamp(since / tw, 0, 1);
      const state = a.to === 1 ? flipProg : 1 - flipProg;

      const tick = W * 0.019;
      const tickH = Math.max(4, H * 0.019);

      // channel
      const chY = CH_Y * H;
      const chGlow = a.to === 1 ? clamp(since / 0.5, 0, 1) : 1 - flipProg;
      if (chGlow > 0.01) {
        const grad = ctx.createLinearGradient(CH_X0 * W, 0, CH_X1 * W, 0);
        grad.addColorStop(0, `rgba(${BLUE}, 0)`);
        grad.addColorStop(0.18, `rgba(${BLUE}, ${0.30 * chGlow})`);
        grad.addColorStop(0.85, `rgba(${BLUE}, ${0.34 * chGlow})`);
        grad.addColorStop(1, `rgba(${BLUE}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(CH_X0 * W, chY - H * 0.032, (CH_X1 - CH_X0) * W, H * 0.064);
        // hairline rails
        ctx.fillStyle = `rgba(${BLUE}, ${0.4 * chGlow})`;
        ctx.fillRect(CH_X0 * W, chY - H * 0.034, (CH_X1 - CH_X0) * W, 1);
        ctx.fillRect(CH_X0 * W, chY + H * 0.034, (CH_X1 - CH_X0) * W, 1);
      }

      const quality = qualityTier();
      const step = quality > 0.7 ? 1 : quality > 0.4 ? 2 : 3;

      for (let i = 0; i < tickets.current.length; i++) {
        const tk = tickets.current[i];
        // degrade routine density under load, never the six exceptions
        if (step > 1 && !tk.exit && i % step !== 0) continue;
        const sx = tk.sx * W;
        const sy = tk.sy * H;

        if (a.to === 0 && state < 0.02) {
          // resting stack with a faint breathe
          const breathe = reduced ? 0 : 0.06 * Math.sin(now * 1.1 + tk.sy * 9);
          drawTicket(sx, sy, tick, tickH, STEEL, 0.56 + breathe);
          continue;
        }

        // flip in progress or settled NEXT
        const local = a.to === 1 ? clamp((since - tk.delay) / FLIGHT, 0, 1) : state;
        if (a.to === 1 || state > 0.02) {
          if (local <= 0) {
            drawTicket(sx, sy, tick, tickH, STEEL, 0.42);
            continue;
          }
          if (tk.exit) {
            // exception: into the channel, then rises to float, gold
            if (local < 0.55) {
              const p = easeInOut(local / 0.55);
              const x = lerp(sx, tk.channelX * W, p);
              const y = lerp(sy, chY - tickH / 2, p);
              drawTicket(x, y, tick, tickH, BLUE, 0.7);
            } else {
              const p = easeInOut((local - 0.55) / 0.45);
              const x = lerp(tk.channelX * W, tk.fx * W, p);
              const y = lerp(chY - tickH / 2, tk.fy * H, p);
              const bob = reduced ? 0 : Math.sin(now * 1.3 + tk.bob) * 3 * p;
              drawTicket(x, y + bob, tick * 2, tickH * 1.6, GOLD, 0.55 + 0.4 * p, 0.7 * p);
            }
          } else {
            // routine: through the channel and absorbed
            if (local >= 1) continue;
            const p = local;
            const enter = easeInOut(clamp(p / 0.45, 0, 1));
            const x = p < 0.45
              ? lerp(sx, CH_X0 * W + tick, enter)
              : lerp(CH_X0 * W + tick, CH_X1 * W, (p - 0.45) / 0.55);
            const y = p < 0.45 ? lerp(sy, chY - tickH / 2, enter) : chY - tickH / 2;
            const fade = p > 0.86 ? 1 - (p - 0.86) / 0.14 : 1;
            drawTicket(x, y, tick, tickH, p < 0.4 ? STEEL : BLUE, 0.5 * fade);
          }
        }
      }

      // settled NEXT: ambient ghosts keep streaming overnight
      if (a.to === 1 && flipProg >= 1 && !reduced) {
        const ghostT = (now * 0.55) % 1;
        const gx = lerp(CH_X0 * W, CH_X1 * W, ghostT);
        const fade = Math.sin(ghostT * Math.PI);
        drawTicket(gx, chY - tickH / 2, tick * 1.3, tickH, BLUE, 0.22 * fade);
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
      {/* the big number: 346 in the present, 6 in five years */}
      <div style={{ position: "absolute", top: -6, left: "36%" }}>
        <div
          className="type-display"
          style={{
            fontSize: 96,
            fontWeight: 900,
            lineHeight: 1,
            color: flipped ? "var(--gold)" : "rgba(160, 170, 184, 0.95)",
            textShadow: flipped ? "0 0 34px rgba(217, 164, 65, 0.4)" : "none",
            transition: "color 0.9s, text-shadow 0.9s",
          }}
        >
          <Counter value={flipped ? 6 : 346} duration={1.5} delay={flipped ? 0.75 : 0.1} />
        </div>
      </div>
      {/* channel label, verbatim copy */}
      <motion.div
        className="type-label"
        initial={false}
        animate={{ opacity: labelOn ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        style={{
          position: "absolute",
          left: `${CH_X0 * 100}%`,
          top: `${CH_Y * 100 + 6}%`,
          fontSize: 12,
          color: `rgba(${BLUE}, 0.9)`,
        }}
      >
        {t("beat.procurement.channel")}
      </motion.div>
    </div>
  );
}
