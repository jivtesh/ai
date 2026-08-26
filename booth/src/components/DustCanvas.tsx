// Slow dust drifting inside light beams. One canvas per scene; beams are
// described as cones and particles live inside them. Count scales with the
// quality tier and drops to a static sprinkle under reduced motion.

import { useEffect, useRef } from "react";
import { qualityTier, onQualityChange } from "../lib/quality";
import { useBooth } from "../state/store";

export interface Beam {
  x: number; // source x as fraction of width
  topY?: number; // fraction, default -0.1
  spread: number; // fraction of width at the bottom
  hue?: "cool" | "warm" | "blue";
}

interface Particle {
  bx: number; // beam index
  u: number; // 0..1 along the beam
  v: number; // -1..1 across the beam
  du: number;
  dv: number;
  r: number;
  tw: number; // twinkle phase
}

const HUES = {
  cool: [237, 234, 226],
  warm: [217, 164, 65],
  blue: [46, 155, 214],
} as const;

export default function DustCanvas({
  beams,
  density = 60,
  className = "",
}: {
  beams: Beam[];
  density?: number; // particles per beam at full quality
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useBooth((s) => s.reducedMotion);
  // callers pass inline beam arrays; diff by value so parent re-renders
  // do not tear the particle field down
  const beamsKey = JSON.stringify(beams);
  const beamsRef = useRef(beams);
  beamsRef.current = beams;

  useEffect(() => {
    const beams = beamsRef.current;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let raf = 0;
    let particles: Particle[] = [];
    let running = true;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      W = Math.max(1, Math.floor(rect.width));
      H = Math.max(1, Math.floor(rect.height));
      canvas.width = W;
      canvas.height = H;
    };

    const build = () => {
      const count = Math.round(density * qualityTier());
      particles = [];
      for (let b = 0; b < beams.length; b++) {
        for (let i = 0; i < count; i++) {
          particles.push({
            bx: b,
            u: Math.random(),
            v: Math.random() * 2 - 1,
            du: 0.008 + Math.random() * 0.02,
            dv: (Math.random() - 0.5) * 0.05,
            r: 0.6 + Math.random() * 1.6,
            tw: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    let last = performance.now();
    const draw = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "screen";
      for (const p of particles) {
        const beam = beams[p.bx];
        if (!reduced) {
          p.u += p.du * dt * 2.2;
          p.v += p.dv * dt * 2.2;
          p.tw += dt * 1.4;
          if (p.u > 1.05) {
            p.u = -0.02;
            p.v = Math.random() * 2 - 1;
          }
          if (p.v > 1) p.v = -1;
          if (p.v < -1) p.v = 1;
        }
        const topY = (beam.topY ?? -0.1) * H;
        const yy = topY + p.u * (H - topY);
        const halfW = ((beam.spread * W) / 2) * (0.25 + p.u * 0.75);
        const xx = beam.x * W + p.v * halfW;
        const edge = 1 - Math.abs(p.v) * 0.85;
        const alpha = (0.10 + 0.16 * (0.5 + 0.5 * Math.sin(p.tw))) * edge * (1 - p.u * 0.5);
        const [r, g, b] = HUES[beam.hue ?? "cool"];
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(xx, yy, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    build();
    raf = requestAnimationFrame(draw);
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    const offQuality = onQualityChange(build);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      offQuality();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beamsKey, density, reduced]);

  return (
    <canvas
      ref={ref}
      className={className}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    />
  );
}
