// Every screen is a scene: background, midground, foreground layers that
// drift up to 12px against pointer or touch movement, plus grain and vignette.

import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useBooth } from "../state/store";

interface Drift {
  x: MotionValue<number>;
  y: MotionValue<number>;
}

const DriftContext = createContext<Drift | null>(null);

export function ParallaxScene({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useBooth((s) => s.reducedMotion);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 40, damping: 20, mass: 1.2 });
  const y = useSpring(rawY, { stiffness: 40, damping: 20, mass: 1.2 });

  useEffect(() => {
    if (reduced) {
      rawX.set(0);
      rawY.set(0);
      return;
    }
    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth) * 2 - 1);
      rawY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced, rawX, rawY]);

  return (
    <div className={`scene ${className}`}>
      <DriftContext.Provider value={{ x, y }}>{children}</DriftContext.Provider>
    </div>
  );
}

// depth: 0 static background, 1 foreground (12px of drift). Negative depths
// move opposite the pointer, which reads as being behind the glass.
export function Layer({
  depth,
  children,
  className = "",
  style,
}: {
  depth: number;
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const drift = useContext(DriftContext);
  const zero = useMotionValue(0);
  const px = useTransform(drift?.x ?? zero, (v) => v * 12 * depth);
  const py = useTransform(drift?.y ?? zero, (v) => v * 8 * depth);
  return (
    <motion.div className={`scene-layer ${className}`} style={{ ...style, x: px, y: py }}>
      {children}
    </motion.div>
  );
}

export function SceneDressing() {
  return (
    <>
      <div className="grain" />
      <div className="vignette" />
    </>
  );
}
