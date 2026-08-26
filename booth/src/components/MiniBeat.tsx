// A small looping canvas that plays a room's data beat at low intensity.

import { useEffect, useRef } from "react";
import type { RoomSlug } from "../content/rooms";
import { MINIS } from "../beats/minis";
import { useBooth } from "../state/store";

export default function MiniBeat({
  slug,
  className = "",
}: {
  slug: RoomSlug;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useBooth((s) => s.reducedMotion);

  useEffect(() => {
    const canvas = ref.current;
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

    const start = performance.now();
    const draw = (now: number) => {
      if (!running) return;
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      MINIS[slug](ctx, canvas.width, canvas.height, reduced ? 1.4 : t);
      if (reduced) return; // a single still frame
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [slug, reduced]);

  return (
    <canvas
      ref={ref}
      className={className}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    />
  );
}
