// ATTRACT. The corridor at night, two light cones with dust, the headline
// revealing line by line, a teaser rotating through the rooms, and a
// breathing chip. This screen has to make people cross the lounge.

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FixedStage from "../components/FixedStage";
import Corridor from "../components/Corridor";
import DustCanvas from "../components/DustCanvas";
import LightCone from "../components/LightCone";
import MaskReveal from "../components/MaskReveal";
import { SceneDressing } from "../components/ParallaxScene";
import { useBooth } from "../state/store";
import { useT } from "../i18n/useT";
import { ROOM_ORDER } from "../content/rooms";
import { translate, type StringId } from "../i18n/strings";
import { DUR, EASE } from "../lib/motion";
import { playCue } from "../lib/sound";

function TeaserRotator() {
  const lang = useBooth((s) => s.lang);
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setIdx((i) => (i + 1) % ROOM_ORDER.length), 12000);
    return () => clearInterval(iv);
  }, []);
  const line = translate(`room.${ROOM_ORDER[idx]}.oneliner` as StringId, lang);
  return (
    <div style={{ height: 34, position: "relative" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: DUR.base, ease: EASE }}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            fontSize: 21,
            color: "rgba(46, 155, 214, 0.92)",
            letterSpacing: "0.01em",
          }}
        >
          {line}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function Attract() {
  const t = useT();
  const goto = useBooth((s) => s.goto);

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: DUR.base, ease: EASE }}
      onPointerDown={() => {
        playCue("touch");
        goto("greeter");
      }}
    >
      <FixedStage>
        {/* background: the corridor itself */}
        <Corridor camera={0} glow={0.75} animateCamera={false} />

        {/* midground: two cones of light with dust */}
        <LightCone x={0.27} spread={0.3} intensity={0.5} hue="cool" tilt={-2} />
        <LightCone x={0.73} spread={0.28} intensity={0.42} hue="blue" tilt={2} />
        <DustCanvas
          beams={[
            { x: 0.27, spread: 0.3, hue: "cool" },
            { x: 0.73, spread: 0.28, hue: "blue" },
          ]}
          density={70}
        />

        {/* foreground: the words */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 172,
          }}
        >
          <motion.div
            className="type-label"
            style={{ fontSize: 14, color: "rgba(237, 234, 226, 0.55)", marginBottom: 34 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.slow, ease: EASE, delay: 1.15 }}
          >
            {t("attract.sub")}
          </motion.div>

          <MaskReveal
            lines={["We can't have a 10x ambition", "if we can't imagine it."]}
            className="text-center"
            lineClassName="type-display"
            lineStyle={{
              fontSize: 92,
              fontWeight: 900,
              textShadow: "0 2px 60px rgba(11, 15, 22, 0.8)",
            }}
            delay={0.25}
            stagger={0.16}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.slow, ease: EASE, delay: 1.5 }}
            style={{ marginTop: 42, width: 900 }}
          >
            <TeaserRotator />
          </motion.div>
        </div>

        {/* the chip */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.slow, ease: EASE, delay: 2.0 }}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 84,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            className="chip-breathe type-label touchable"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 46px",
              height: 68,
              borderRadius: 999,
              border: "1px solid rgba(46, 155, 214, 0.5)",
              background: "rgba(11, 15, 22, 0.55)",
              fontSize: 14,
              color: "rgba(237, 234, 226, 0.92)",
              backdropFilter: "blur(4px)",
            }}
          >
            {t("attract.chip")}
          </div>
        </motion.div>

        <SceneDressing />
      </FixedStage>
    </motion.div>
  );
}
