// Headline choreography: each line rises out of an overflow mask.

import { motion } from "framer-motion";
import { EASE, DUR } from "../lib/motion";
import { useBooth } from "../state/store";

export default function MaskReveal({
  lines,
  className = "",
  lineClassName = "",
  lineStyle,
  delay = 0,
  stagger = 0.14,
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  lineStyle?: React.CSSProperties;
  delay?: number;
  stagger?: number;
}) {
  const reduced = useBooth((s) => s.reducedMotion);
  return (
    <div className={className}>
      {lines.map((line, i) => (
        <div key={i} style={{ overflow: "hidden", paddingBottom: "0.08em", marginBottom: "-0.08em" }}>
          <motion.div
            className={lineClassName}
            style={lineStyle}
            initial={reduced ? { y: 0, opacity: 0 } : { y: "112%" }}
            animate={reduced ? { opacity: 1 } : { y: "0%" }}
            transition={{
              duration: reduced ? 0.4 : DUR.slow,
              ease: EASE,
              delay: delay + i * stagger,
            }}
          >
            {line}
          </motion.div>
        </div>
      ))}
    </div>
  );
}
