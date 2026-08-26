// GREETER. The camera eases 40 percent down the corridor. Two doors with
// light spilling out; choosing one widens its light until it fills the
// screen and lands on the gallery.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import FixedStage from "../components/FixedStage";
import Corridor from "../components/Corridor";
import DustCanvas from "../components/DustCanvas";
import LightCone from "../components/LightCone";
import MaskReveal from "../components/MaskReveal";
import { SceneDressing } from "../components/ParallaxScene";
import { spillNav } from "../components/SpillOverlay";
import { useBooth, type Audience } from "../state/store";
import { useT } from "../i18n/useT";
import { DUR, EASE } from "../lib/motion";
import { playCue } from "../lib/sound";

function ChoiceDoor({
  title,
  sub,
  hue,
  x,
  audience,
  delay,
}: {
  title: string;
  sub: string;
  hue: "future" | "gold";
  x: number; // stage px of door center
  audience: Audience;
  delay: number;
}) {
  const rgb = hue === "gold" ? "217, 164, 65" : "46, 155, 214";
  const W = 430;
  const H = 560;
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.slow, ease: EASE, delay }}
      className="touchable"
      style={{
        position: "absolute",
        left: x - W / 2,
        top: 400,
        width: W,
        height: H,
        cursor: "pointer",
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        playCue("touch");
        const s = useBooth.getState();
        s.setAudience(audience);
        spillNav(e.clientX / window.innerWidth, e.clientY / window.innerHeight, hue, () =>
          useBooth.getState().goto("gallery"),
        );
      }}
    >
      {/* light spilling from behind the door */}
      <div
        style={{
          position: "absolute",
          inset: -70,
          background: `radial-gradient(60% 58% at 50% 62%, rgba(${rgb}, 0.34) 0%, rgba(${rgb}, 0) 70%)`,
          filter: "blur(24px)",
        }}
      />
      {/* the slab, ajar: lit edge */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 4,
          background: `linear-gradient(102deg, rgba(16, 20, 28, 0.97) 0%, rgba(11, 15, 22, 0.96) 62%, rgba(${rgb}, 0.30) 100%)`,
          boxShadow: `inset 0 0 0 1px rgba(${rgb}, 0.4), inset -14px 0 34px rgba(${rgb}, 0.30), 0 30px 70px rgba(4, 6, 10, 0.8)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "38px 40px",
          gap: 16,
        }}
      >
        <div
          className="type-display"
          style={{ fontSize: 37, lineHeight: 1.08, color: "var(--paper)" }}
        >
          {title}
        </div>
        <div style={{ fontSize: 17.5, lineHeight: 1.5, color: "rgba(237, 234, 226, 0.72)" }}>
          {sub}
        </div>
        <div
          style={{
            marginTop: 8,
            height: 2,
            width: 84,
            background: `rgba(${rgb}, 0.85)`,
            boxShadow: `0 0 12px rgba(${rgb}, 0.7)`,
          }}
        />
      </div>
      {/* light pooling on the floor in front */}
      <div
        style={{
          position: "absolute",
          left: -50,
          right: -50,
          top: H - 16,
          height: 130,
          background: `radial-gradient(50% 62% at 50% 12%, rgba(${rgb}, 0.26) 0%, rgba(${rgb}, 0) 74%)`,
          filter: "blur(10px)",
        }}
      />
    </motion.div>
  );
}

export default function Greeter() {
  const t = useT();
  const [camera, setCamera] = useState(160);

  useEffect(() => {
    const id = requestAnimationFrame(() => setCamera(1120));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: DUR.base, ease: EASE }}
    >
      <FixedStage>
        <Corridor camera={camera} glow={0.55} />
        <LightCone x={0.5} spread={0.44} intensity={0.4} hue="cool" />
        <DustCanvas beams={[{ x: 0.5, spread: 0.44, hue: "cool" }]} density={60} />

        <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center" }}>
          <MaskReveal
            lines={["Do you work inside the UN system,", "or alongside it?"]}
            className="text-center"
            lineClassName="type-display"
            lineStyle={{ fontSize: 62, fontWeight: 800 }}
            delay={0.7}
            stagger={0.14}
          />
        </div>

        <ChoiceDoor
          title={t("greeter.door1.title")}
          sub={t("greeter.door1.sub")}
          hue="future"
          x={600}
          audience="staffer"
          delay={1.25}
        />
        <ChoiceDoor
          title={t("greeter.door2.title")}
          sub={t("greeter.door2.sub")}
          hue="gold"
          x={1320}
          audience="guest"
          delay={1.42}
        />

        <SceneDressing />
      </FixedStage>
    </motion.div>
  );
}
