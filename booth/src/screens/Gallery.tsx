// GALLERY. The corridor as navigation: five doorways with live miniatures,
// brass placards in two calm columns with leader lines to their doors,
// two dashed thresholds waiting at the end.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import FixedStage from "../components/FixedStage";
import Corridor, { DOORS, projectDoor, projectEndWall } from "../components/Corridor";
import DustCanvas from "../components/DustCanvas";
import LightCone from "../components/LightCone";
import MiniBeat from "../components/MiniBeat";
import NavBar from "../components/NavBar";
import { SceneDressing } from "../components/ParallaxScene";
import { spillNav } from "../components/SpillOverlay";
import { useBooth } from "../state/store";
import { useT } from "../i18n/useT";
import { translate, type StringId } from "../i18n/strings";
import { ROOMS, type RoomSlug } from "../content/rooms";
import { DUR, EASE } from "../lib/motion";
import { playCue } from "../lib/sound";

const CAMERA = 520;
const CARD_W = 272;

// fixed slots: rooms 1, 3, 5 down the left, 2 and 4 down the right
// column order follows projected depth: far doors sit near the horizon,
// so their cards sit higher and the leader lines never cross
const SLOTS: Record<RoomSlug, { x: number; y: number }> = {
  "chief-of-staff": { x: 96, y: 356 },
  "resident-coordinator": { x: 96, y: 556 },
  legal: { x: 96, y: 756 },
  humanitarian: { x: 1920 - 96 - CARD_W, y: 440 },
  procurement: { x: 1920 - 96 - CARD_W, y: 660 },
};

function enterRoom(slug: RoomSlug, e: { clientX: number; clientY: number }) {
  playCue("touch");
  spillNav(e.clientX / window.innerWidth, e.clientY / window.innerHeight, "future", () =>
    useBooth.getState().goto("room", slug),
  );
}

function Placard({ slug, delay }: { slug: RoomSlug; delay: number }) {
  const lang = useBooth((s) => s.lang);
  const slot = SLOTS[slug];
  const cfg = ROOMS[slug];
  return (
    <motion.div
      className="touchable"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.slow, ease: EASE, delay }}
      style={{
        position: "absolute",
        left: slot.x,
        top: slot.y,
        width: CARD_W,
        cursor: "pointer",
        zIndex: 20,
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        enterRoom(slug, e);
      }}
    >
      <div
        style={{
          borderRadius: 4,
          padding: "15px 20px 16px",
          background:
            "linear-gradient(155deg, rgba(64, 54, 34, 0.92) 0%, rgba(44, 38, 26, 0.94) 45%, rgba(34, 30, 22, 0.96) 100%)",
          boxShadow:
            "inset 0 0 0 1px rgba(217, 164, 65, 0.35), inset 0 1px 0 rgba(237, 220, 180, 0.25), 0 16px 40px rgba(4, 6, 10, 0.65)",
        }}
      >
        <div
          className="type-label"
          style={{ fontSize: 10, color: "rgba(217, 164, 65, 0.95)", marginBottom: 7 }}
        >
          {String(cfg.index).padStart(2, "0")}
        </div>
        <div
          className="type-display"
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "rgba(240, 234, 220, 0.97)",
            marginBottom: 6,
          }}
        >
          {translate(`room.${slug}.title` as StringId, lang)}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.45, color: "rgba(237, 234, 226, 0.62)" }}>
          {translate(`room.${slug}.oneliner` as StringId, lang)}
        </div>
      </div>
    </motion.div>
  );
}

function Leaders() {
  return (
    <svg
      width={1920}
      height={1080}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 15 }}
    >
      {DOORS.map((d) => {
        const slot = SLOTS[d.slug];
        const p = projectDoor(d, CAMERA);
        const fromX = d.side === "left" ? slot.x + CARD_W : slot.x;
        const fromY = slot.y + 52;
        const toX = p.x + (d.side === "left" ? 10 : -10);
        const toY = p.y;
        return (
          <g key={d.slug}>
            <motion.line
              x1={fromX}
              y1={fromY}
              x2={toX}
              y2={toY}
              stroke="rgba(217, 164, 65, 0.34)"
              strokeWidth={1}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: DUR.slow, ease: EASE, delay: 0.7 }}
            />
            <circle cx={toX} cy={toY} r={3} fill="rgba(217, 164, 65, 0.55)" />
          </g>
        );
      })}
    </svg>
  );
}

function Threshold({
  which,
  offset,
  delay,
}: {
  which: "choice" | "wall";
  offset: number;
  delay: number;
}) {
  const t = useT();
  const p = projectEndWall(CAMERA);
  const hue = which === "wall" ? "217, 164, 65" : "46, 155, 214";
  const H = 132;
  return (
    <motion.div
      className="touchable"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DUR.slow, ease: EASE, delay }}
      style={{
        position: "absolute",
        left: 960 + offset - 105,
        top: p.floorY - H,
        width: 210,
        height: H,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        zIndex: 20,
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        playCue("touch");
        spillNav(
          e.clientX / window.innerWidth,
          e.clientY / window.innerHeight,
          which === "wall" ? "gold" : "future",
          () => useBooth.getState().goto(which),
        );
      }}
    >
      <div
        style={{
          width: 118,
          height: 96,
          border: `1.5px dashed rgba(${hue}, 0.6)`,
          borderBottom: "none",
          borderRadius: "6px 6px 0 0",
          background: `radial-gradient(70% 80% at 50% 100%, rgba(${hue}, 0.2) 0%, rgba(${hue}, 0) 75%)`,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: 12,
        }}
      >
        <div className="type-label" style={{ fontSize: 11, color: `rgba(${hue}, 0.95)` }}>
          {t(which === "wall" ? "gallery.threshold.wall" : "gallery.threshold.choice")}
        </div>
      </div>
    </motion.div>
  );
}

export default function Gallery() {
  const audience = useBooth((s) => s.audience);
  const t = useT();
  const [camera, setCamera] = useState(340);

  useEffect(() => {
    const id = requestAnimationFrame(() => setCamera(CAMERA));
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
        <Corridor
          camera={camera}
          glow={0.85}
          doorChildren={(door) => (
            <div
              style={{ position: "absolute", inset: 14, cursor: "pointer" }}
              onPointerDown={(e) => {
                e.stopPropagation();
                enterRoom(door.slug, e);
              }}
            >
              <MiniBeat slug={door.slug} />
            </div>
          )}
        />
        <LightCone x={0.5} spread={0.4} intensity={0.34} hue="cool" />
        <DustCanvas beams={[{ x: 0.5, spread: 0.4, hue: "cool" }]} density={50} />

        <motion.div
          className="type-label"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.slow, ease: EASE, delay: 0.5 }}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 74,
            textAlign: "center",
            fontSize: 14,
            color: "rgba(237, 234, 226, 0.6)",
          }}
        >
          {t(audience === "guest" ? "gallery.sub.guest" : "gallery.sub.staffer")}
        </motion.div>

        <Leaders />
        {DOORS.map((d, i) => (
          <Placard key={d.slug} slug={d.slug} delay={0.35 + i * 0.09} />
        ))}

        <Threshold which="choice" offset={-130} delay={0.9} />
        <Threshold which="wall" offset={130} delay={1.0} />

        <SceneDressing />
      </FixedStage>
      <NavBar back cont />
    </motion.div>
  );
}
