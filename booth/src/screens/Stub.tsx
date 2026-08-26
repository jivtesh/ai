// Temporary scaffold screen, replaced milestone by milestone.

import { motion } from "framer-motion";
import { ParallaxScene, Layer, SceneDressing } from "../components/ParallaxScene";
import LightCone from "../components/LightCone";
import { DUR, EASE } from "../lib/motion";

export default function Stub({ title }: { title: string }) {
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: DUR.fast, ease: EASE }}
    >
      <ParallaxScene>
        <Layer depth={0}>
          <LightCone x={0.5} spread={0.5} intensity={0.5} hue="cool" />
        </Layer>
        <Layer depth={0.6} className="flex items-center justify-center">
          <div className="type-display" style={{ fontSize: 72, opacity: 0.9 }}>
            {title}
          </div>
        </Layer>
        <SceneDressing />
      </ParallaxScene>
    </motion.div>
  );
}
