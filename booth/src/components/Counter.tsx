// A number that ticks between values with slight deceleration and settles.

import { useEffect, useRef, useState } from "react";
import { decel } from "../lib/motion";

const fmt = new Intl.NumberFormat("en-US");

export default function Counter({
  value,
  duration = 1.4,
  delay = 0,
  className = "",
}: {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    if (from === value) return;
    let start = 0;
    const step = (now: number) => {
      if (!start) start = now + delay * 1000;
      const t = Math.max(0, Math.min(1, (now - start) / (duration * 1000)));
      const v = Math.round(from + (value - from) * decel(t));
      setShown(v);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else fromRef.current = value;
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration, delay]);

  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {fmt.format(shown)}
    </span>
  );
}
