// The final line of a story types on like an agent finishing a sentence.

import { useEffect, useRef, useState } from "react";
import { useBooth } from "../state/store";

export default function TypeOn({
  text,
  play,
  delay = 0,
  cps = 34,
  className = "",
  style,
}: {
  text: string;
  play: boolean;
  delay?: number; // seconds before typing starts
  cps?: number; // characters per second
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduced = useBooth((s) => s.reducedMotion);
  const [count, setCount] = useState(reduced ? text.length : 0);
  const timer = useRef<number>(0);

  useEffect(() => {
    if (!play) {
      setCount(0);
      return;
    }
    if (reduced) {
      setCount(text.length);
      return;
    }
    setCount(0);
    let i = 0;
    const startAt = window.setTimeout(() => {
      const tick = () => {
        i += 1;
        setCount(i);
        if (i < text.length) {
          // slight variance so it reads as typed, not printed
          timer.current = window.setTimeout(tick, 1000 / cps + (Math.random() - 0.5) * 14);
        }
      };
      tick();
    }, delay * 1000);
    return () => {
      window.clearTimeout(startAt);
      window.clearTimeout(timer.current);
    };
  }, [play, text, delay, cps, reduced]);

  const done = count >= text.length;
  return (
    <span className={className} style={style}>
      {text.slice(0, count)}
      {play && !reduced && (
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: "1em",
            marginLeft: 2,
            verticalAlign: "-0.15em",
            background: "rgba(46, 155, 214, 0.9)",
            opacity: done ? 0 : 1,
            transition: "opacity 0.8s ease 0.6s",
          }}
        />
      )}
    </span>
  );
}
