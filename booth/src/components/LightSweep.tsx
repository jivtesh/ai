// The flip's opening gesture: a blade of light crossing the stage.
// Re-plays whenever playKey changes (and skips the very first mount).

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LightSweep({
  playKey,
  duration = 0.45,
  hue = "cool",
}: {
  playKey: string | number;
  duration?: number;
  hue?: "cool" | "warm" | "blue";
}) {
  const [sweeping, setSweeping] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setSweeping(true);
    const t = setTimeout(() => setSweeping(false), duration * 1000 + 120);
    return () => clearTimeout(t);
  }, [playKey, duration]);

  const colors = {
    cool: "237, 234, 226",
    warm: "217, 164, 65",
    blue: "46, 155, 214",
  }[hue];

  return (
    <AnimatePresence>
      {sweeping && (
        <motion.div
          key={String(playKey)}
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 40,
            background: `linear-gradient(100deg, transparent 38%, rgba(${colors}, 0.16) 47%, rgba(${colors}, 0.42) 50%, rgba(${colors}, 0.16) 53%, transparent 62%)`,
            mixBlendMode: "screen",
          }}
          initial={{ x: "-70%" }}
          animate={{ x: "70%" }}
          exit={{ opacity: 0 }}
          transition={{ duration, ease: [0.3, 0, 0.2, 1] }}
        />
      )}
    </AnimatePresence>
  );
}
