// CHOICE. Five pedestals holding columns of light. Touching one brightens
// it and draws threads to the rooms it made possible. When all five are
// touched, the corridor behind fully illuminates.

import { useMemo } from "react";
import { motion } from "framer-motion";
import FixedStage from "../components/FixedStage";
import Corridor from "../components/Corridor";
import DustCanvas from "../components/DustCanvas";
import MaskReveal from "../components/MaskReveal";
import NavBar from "../components/NavBar";
import { SceneDressing } from "../components/ParallaxScene";
import { useBooth } from "../state/store";
import { useT } from "../i18n/useT";
import { translate, type StringId } from "../i18n/strings";
import { PILLARS, PILLAR_ROOMS, ROOMS, ROOM_ORDER, type PillarId } from "../content/rooms";
import { DUR, EASE } from "../lib/motion";
import { balanceLines } from "../lib/text";
import { playCue } from "../lib/sound";

const PED_X = [360, 660, 960, 1260, 1560];
const PED_TOP = 430;
const PED_BASE = 830;
const CHIP_Y = 268;

const chipX = (roomIndex: number) => 960 + (roomIndex - 3) * 96;

function Pedestal({ pillar, x, delay }: { pillar: PillarId; x: number; delay: number }) {
  const lang = useBooth((s) => s.lang);
  const touched = useBooth((s) => s.pillars.includes(pillar));
  const touchPillar = useBooth((s) => s.touchPillar);

  return (
    <motion.div
      className="touchable"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.slow, ease: EASE, delay }}
      style={{
        position: "absolute",
        left: x - 130,
        top: PED_TOP - 40,
        width: 260,
        height: 560,
        cursor: "pointer",
      }}
      onPointerDown={() => {
        playCue("touch");
        touchPillar(pillar);
      }}
    >
      {/* column of light */}
      <div
        style={{
          position: "absolute",
          left: 130 - 46,
          top: 0,
          width: 92,
          height: PED_BASE - PED_TOP + 40,
          background: touched
            ? "linear-gradient(to top, rgba(46, 155, 214, 0.42) 0%, rgba(46, 155, 214, 0.16) 55%, rgba(46, 155, 214, 0) 100%)"
            : "linear-gradient(to top, rgba(91, 100, 112, 0.22) 0%, rgba(91, 100, 112, 0.07) 55%, rgba(91, 100, 112, 0) 100%)",
          filter: "blur(6px)",
          transition: "background 0.9s",
        }}
      />
      {/* hot core */}
      <div
        style={{
          position: "absolute",
          left: 130 - 13,
          top: 26,
          width: 26,
          height: PED_BASE - PED_TOP + 8,
          background: touched
            ? "linear-gradient(to top, rgba(220, 242, 254, 0.75) 0%, rgba(46, 155, 214, 0.3) 60%, rgba(46, 155, 214, 0) 100%)"
            : "linear-gradient(to top, rgba(237, 234, 226, 0.2) 0%, rgba(91, 100, 112, 0.1) 60%, rgba(91, 100, 112, 0) 100%)",
          filter: "blur(2px)",
          transition: "background 0.9s",
        }}
      />
      {/* pedestal base */}
      <div
        style={{
          position: "absolute",
          left: 130 - 62,
          top: PED_BASE - PED_TOP + 40,
          width: 124,
          height: 26,
          background: "linear-gradient(to bottom, #1a212e 0%, #0c1017 100%)",
          boxShadow: touched
            ? "0 -2px 24px rgba(46, 155, 214, 0.4), inset 0 1px 0 rgba(140, 208, 245, 0.5)"
            : "inset 0 1px 0 rgba(91, 100, 112, 0.5)",
          borderRadius: 3,
          transition: "box-shadow 0.9s",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: PED_BASE - PED_TOP + 84,
          textAlign: "center",
        }}
      >
        <div
          className="type-label"
          style={{
            fontSize: 15,
            color: touched ? "rgba(140, 208, 245, 1)" : "rgba(237, 234, 226, 0.72)",
            transition: "color 0.6s",
            marginBottom: 10,
          }}
        >
          {translate(`choice.${pillar}.title` as StringId, lang)}
        </div>
        <motion.div
          initial={false}
          animate={{ opacity: touched ? 1 : 0, y: touched ? 0 : 8 }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{
            fontSize: 13.5,
            lineHeight: 1.5,
            color: "rgba(237, 234, 226, 0.66)",
            padding: "0 12px",
          }}
        >
          {translate(`choice.${pillar}.body` as StringId, lang)}
        </motion.div>
      </div>
    </motion.div>
  );
}

function Threads() {
  const pillars = useBooth((s) => s.pillars);
  const paths = useMemo(() => {
    const out: { d: string; key: string; on: boolean }[] = [];
    PILLARS.forEach((p, pi) => {
      const on = pillars.includes(p);
      const fromX = PED_X[pi];
      const fromY = PED_TOP + 10;
      PILLAR_ROOMS[p].forEach((slug) => {
        const idx = ROOMS[slug].index;
        const toX = chipX(idx);
        const toY = CHIP_Y + 22;
        const midY = Math.min(fromY, toY) - 70 - Math.abs(fromX - toX) * 0.06;
        out.push({
          key: `${p}-${slug}`,
          on,
          d: `M ${fromX} ${fromY} Q ${(fromX + toX) / 2} ${midY} ${toX} ${toY}`,
        });
      });
    });
    return out;
  }, [pillars]);

  return (
    <svg
      width={1920}
      height={1080}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {paths.map((p) => (
        <motion.path
          key={p.key}
          d={p.d}
          fill="none"
          stroke="rgba(46, 155, 214, 0.55)"
          strokeWidth={1.2}
          initial={false}
          animate={{ pathLength: p.on ? 1 : 0, opacity: p.on ? 1 : 0 }}
          transition={{ duration: 0.9, ease: EASE }}
        />
      ))}
    </svg>
  );
}

function RoomChips() {
  const pillars = useBooth((s) => s.pillars);
  const lit = new Set(pillars.flatMap((p) => PILLAR_ROOMS[p]));
  return (
    <>
      {ROOM_ORDER.map((slug) => {
        const idx = ROOMS[slug].index;
        const on = lit.has(slug);
        return (
          <div
            key={slug}
            style={{
              position: "absolute",
              left: chipX(idx) - 23,
              top: CHIP_Y - 23,
              width: 46,
              height: 46,
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${on ? "rgba(46, 155, 214, 0.85)" : "rgba(42, 52, 68, 0.9)"}`,
              background: on ? "rgba(46, 155, 214, 0.14)" : "rgba(11, 15, 22, 0.6)",
              boxShadow: on ? "0 0 22px rgba(46, 155, 214, 0.35)" : "none",
              transition: "border 0.7s, background 0.7s, box-shadow 0.7s",
            }}
          >
            <span
              className="type-label"
              style={{
                fontSize: 12,
                color: on ? "rgba(140, 208, 245, 1)" : "rgba(237, 234, 226, 0.5)",
                transition: "color 0.7s",
              }}
            >
              {String(idx).padStart(2, "0")}
            </span>
          </div>
        );
      })}
    </>
  );
}

export default function Choice() {
  const t = useT();
  const pillars = useBooth((s) => s.pillars);
  const allLit = pillars.length === PILLARS.length;

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: DUR.base, ease: EASE }}
    >
      <FixedStage>
        <div style={{ position: "absolute", inset: 0, opacity: 0.55 }}>
          <Corridor camera={0} glow={allLit ? 1 : 0.4} lit={allLit} />
        </div>
        {/* the payoff swell */}
        <motion.div
          initial={false}
          animate={{ opacity: allLit ? 1 : 0 }}
          transition={{ duration: 1.6, ease: EASE }}
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(60% 50% at 50% 42%, rgba(237, 234, 226, 0.10) 0%, rgba(46, 155, 214, 0.06) 45%, rgba(0, 0, 0, 0) 80%)",
            pointerEvents: "none",
          }}
        />
        <DustCanvas beams={[{ x: 0.5, spread: 0.65, hue: allLit ? "cool" : "blue" }]} density={40} />

        <div style={{ position: "absolute", left: 0, right: 0, top: 74, textAlign: "center" }}>
          <MaskReveal
            lines={balanceLines(t("choice.headline"), 2)}
            className="text-center"
            lineClassName="type-display"
            lineStyle={{ fontSize: 46, fontWeight: 800 }}
            delay={0.3}
            stagger={0.13}
          />
        </div>

        <Threads />
        <RoomChips />

        {PILLARS.map((p, i) => (
          <Pedestal key={p} pillar={p} x={PED_X[i]} delay={0.5 + i * 0.09} />
        ))}

        <motion.div
          className="type-label"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.slow, ease: EASE, delay: 1.3 }}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 54,
            textAlign: "center",
            fontSize: 13,
            color: allLit ? "rgba(217, 164, 65, 0.95)" : "rgba(237, 234, 226, 0.55)",
            transition: "color 1s",
          }}
        >
          {t("choice.sub")}
        </motion.div>

        <SceneDressing />
      </FixedStage>
      <NavBar back cont allRooms />
    </motion.div>
  );
}
