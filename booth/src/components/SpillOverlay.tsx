// The light-spill transition: a chosen door's light widens until it fills
// the screen, the scene changes underneath, then the light recedes.

import { AnimatePresence, motion } from "framer-motion";
import { useBooth } from "../state/store";

export function spillNav(
  x: number,
  y: number,
  hue: "future" | "gold",
  navigate: () => void,
) {
  const s = useBooth.getState();
  s.setSpill({ x, y, hue });
  window.setTimeout(navigate, 640);
  window.setTimeout(() => useBooth.getState().setSpill(null), 1100);
}

export default function SpillOverlay() {
  const spill = useBooth((s) => s.spill);
  return (
    <AnimatePresence>
      {spill && (
        <motion.div
          key="spill"
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 90,
            pointerEvents: "none",
            background:
              spill.hue === "gold"
                ? "radial-gradient(circle at center, rgba(255, 235, 200, 0.98) 0%, rgba(217, 164, 65, 0.95) 42%, rgba(120, 90, 40, 0.92) 100%)"
                : "radial-gradient(circle at center, rgba(225, 242, 252, 0.98) 0%, rgba(46, 155, 214, 0.95) 42%, rgba(18, 60, 88, 0.92) 100%)",
            clipPath: `circle(0% at ${spill.x * 100}% ${spill.y * 100}%)`,
          }}
          initial={{ clipPath: `circle(1.5% at ${spill.x * 100}% ${spill.y * 100}%)`, opacity: 1 }}
          animate={{
            clipPath: `circle(142% at ${spill.x * 100}% ${spill.y * 100}%)`,
            transition: { duration: 0.7, ease: [0.3, 0, 0.15, 1] },
          }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeOut" } }}
        />
      )}
    </AnimatePresence>
  );
}
