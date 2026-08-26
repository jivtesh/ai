// WHY. Near-black. The quote in light.

import { motion } from "framer-motion";
import FixedStage from "../components/FixedStage";
import LightCone from "../components/LightCone";
import DustCanvas from "../components/DustCanvas";
import MaskReveal from "../components/MaskReveal";
import NavBar from "../components/NavBar";
import { Layer, ParallaxScene, SceneDressing } from "../components/ParallaxScene";
import { useT } from "../i18n/useT";
import { DUR, EASE } from "../lib/motion";
import { balanceLines } from "../lib/text";

export default function Why() {
  const t = useT();
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: DUR.slow, ease: EASE }}
    >
      <FixedStage>
        <ParallaxScene>
          <Layer depth={0.2}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(90% 70% at 50% 30%, #0c1019 0%, #06080d 75%)",
              }}
            />
            <LightCone x={0.5} spread={0.5} intensity={0.42} hue="cool" />
          </Layer>
          <Layer depth={0.45}>
            <DustCanvas beams={[{ x: 0.5, spread: 0.5, hue: "cool" }]} density={70} />
          </Layer>
          <Layer depth={0.8}>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 44,
                padding: "0 200px",
              }}
            >
              <MaskReveal
                lines={balanceLines(t("why.quote"), 2)}
                className="text-center"
                lineClassName="type-display"
                lineStyle={{
                  fontSize: 74,
                  fontWeight: 800,
                  textShadow: "0 0 80px rgba(237, 234, 226, 0.18)",
                }}
                delay={0.5}
                stagger={0.2}
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: DUR.slow, ease: EASE, delay: 1.7 }}
                className="type-label"
                style={{ fontSize: 13, color: "rgba(237, 234, 226, 0.5)" }}
              >
                {t("why.sub")}
              </motion.div>
            </div>
          </Layer>
          <SceneDressing />
        </ParallaxScene>
      </FixedStage>
      <NavBar back cont />
    </motion.div>
  );
}
