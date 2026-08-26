// The gallery corridor: one-point perspective built from CSS 3D planes.
// Five doorways recede along the walls, each leaking blue light. Used by
// attract (camera at the lobby), greeter (eased 40 percent in), gallery
// (as navigation) and choice (fully illuminated payoff in the distance).

import { useEffect, useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ROOM_ORDER, type RoomSlug } from "../content/rooms";
import { EASE } from "../lib/motion";
import { useBooth } from "../state/store";

export const DEPTH = 2800;
const INNER_LEFT = 340;
const INNER_RIGHT = 1580;
const INNER_W = INNER_RIGHT - INNER_LEFT;
const H = 1080;

export interface CorridorDoor {
  slug: RoomSlug;
  side: "left" | "right";
  depth: number; // fraction along the corridor
}

export const DOORS: CorridorDoor[] = [
  { slug: ROOM_ORDER[0], side: "left", depth: 0.14 },
  { slug: ROOM_ORDER[1], side: "right", depth: 0.28 },
  { slug: ROOM_ORDER[2], side: "left", depth: 0.43 },
  { slug: ROOM_ORDER[3], side: "right", depth: 0.58 },
  { slug: ROOM_ORDER[4], side: "left", depth: 0.72 },
];

const DOOR_W = 340; // along the wall
const DOOR_H = 640;

const PERSPECTIVE = 1150;
const ORIGIN_X = 960;
const ORIGIN_Y = 486; // 45% of 1080

// Project a door's corridor-side edge to stage coordinates for a given
// camera dolly, so screen-space labels can sit beside their doorways.
export function projectDoor(door: CorridorDoor, camera: number) {
  const z = -(door.depth * DEPTH + DOOR_W / 2) + camera;
  const scale = PERSPECTIVE / (PERSPECTIVE - z);
  const wx = door.side === "left" ? INNER_LEFT : INNER_RIGHT;
  const wy = H - 22 - DOOR_H / 2;
  return {
    x: ORIGIN_X + (wx - ORIGIN_X) * scale,
    y: ORIGIN_Y + (wy - ORIGIN_Y) * scale,
    scale,
  };
}

export function projectEndWall(camera: number) {
  const z = -DEPTH + camera;
  const scale = PERSPECTIVE / (PERSPECTIVE - z);
  return {
    x: ORIGIN_X,
    y: ORIGIN_Y + (540 - ORIGIN_Y) * scale,
    floorY: ORIGIN_Y + (H - 22 - ORIGIN_Y) * scale,
    scale,
  };
}

const wallShade =
  "linear-gradient(to bottom, rgba(13, 17, 25, 0.55) 0%, rgba(26, 33, 46, 0.32) 34%, rgba(13, 17, 25, 0.6) 100%), linear-gradient(to right, rgba(30, 38, 52, 0.95) 0%, rgba(20, 26, 36, 0.9) 30%, rgba(11, 15, 22, 0.92) 70%, rgba(6, 8, 13, 0.96) 100%)";

export default function Corridor({
  camera = 0,
  glow = 0.7,
  lit = false,
  animateCamera = true,
  doorChildren,
  children,
}: {
  camera?: number; // px of dolly toward the far end
  glow?: number;
  lit?: boolean; // the all-lit payoff
  animateCamera?: boolean;
  // rendered inside each doorway, on the wall plane (miniatures, placards)
  doorChildren?: (door: CorridorDoor, i: number) => ReactNode;
  children?: ReactNode; // extra content on the end wall
}) {
  const reduced = useBooth((s) => s.reducedMotion);
  const rootRef = useRef<HTMLDivElement>(null);

  // pointer parallax through perspective-origin: reads as a head move
  useEffect(() => {
    const el = rootRef.current;
    if (!el || reduced) return;
    let raf = 0;
    let tx = 50;
    let ty = 45;
    let cx = 50;
    let cy = 45;
    const onMove = (e: PointerEvent) => {
      tx = 50 + ((e.clientX / window.innerWidth) * 2 - 1) * 2.2;
      ty = 45 + ((e.clientY / window.innerHeight) * 2 - 1) * 1.6;
    };
    const tick = () => {
      cx += (tx - cx) * 0.05;
      cy += (ty - cy) * 0.05;
      el.style.perspectiveOrigin = `${cx}% ${cy}%`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const glowColor = lit ? "237, 234, 226" : "46, 155, 214";
  const g = lit ? Math.max(glow, 0.9) : glow;

  return (
    <div
      ref={rootRef}
      style={{
        position: "absolute",
        inset: 0,
        perspective: 1150,
        perspectiveOrigin: "50% 45%",
        overflow: "hidden",
        background: "#07090e",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
        }}
        initial={false}
        animate={{ z: camera }}
        transition={animateCamera ? { duration: 1.6, ease: EASE } : { duration: 0 }}
      >
        {/* end wall */}
        <div
          style={{
            position: "absolute",
            left: INNER_LEFT,
            top: 0,
            width: INNER_W,
            height: H,
            transform: `translateZ(${-DEPTH}px)`,
            background: `radial-gradient(70% 62% at 50% 58%, rgba(${glowColor}, ${lit ? 0.4 : 0.26}) 0%, rgba(13, 17, 24, 1) 78%)`,
            boxShadow: "inset 0 0 140px 70px rgba(7, 9, 14, 0.95)",
          }}
        >
          {children}
        </div>

        {/* depth fog just in front of the end wall, swallows the seams */}
        <div
          style={{
            position: "absolute",
            left: INNER_LEFT - 260,
            top: -160,
            width: INNER_W + 520,
            height: H + 320,
            transform: "translateZ(-2540px)",
            background:
              "radial-gradient(56% 50% at 50% 52%, rgba(7, 9, 14, 0) 30%, rgba(7, 9, 14, 0.45) 56%, rgba(7, 9, 14, 0.95) 84%)",
            pointerEvents: "none",
          }}
        />

        {/* left wall */}
        <div
          style={{
            position: "absolute",
            left: INNER_LEFT,
            top: 0,
            width: DEPTH,
            height: H,
            transformOrigin: "left center",
            transform: "rotateY(90deg)",
            background: wallShade,
          }}
        >
          <WallDoors side="left" glow={g} glowColor={glowColor} lit={lit} doorChildren={doorChildren} />
        </div>

        {/* right wall */}
        <div
          style={{
            position: "absolute",
            left: INNER_RIGHT,
            top: 0,
            width: DEPTH,
            height: H,
            transformOrigin: "left center",
            transform: "rotateY(-90deg) scaleX(-1)",
            background: wallShade,
          }}
        >
          <WallDoors side="right" glow={g} glowColor={glowColor} lit={lit} doorChildren={doorChildren} mirrored />
        </div>

        {/* floor */}
        <div
          style={{
            position: "absolute",
            left: INNER_LEFT,
            top: H,
            width: INNER_W,
            height: DEPTH,
            transformOrigin: "top left",
            transform: "rotateX(-90deg)",
            background:
              "linear-gradient(to bottom, rgba(20, 26, 36, 0.95) 0%, rgba(10, 13, 19, 0.98) 40%, rgba(5, 7, 11, 1) 100%)",
          }}
        >
          {/* light spilling from each door onto the floor */}
          {DOORS.map((d, i) => (
            <div
              key={d.slug}
              className={reduced ? undefined : "door-pulse"}
              style={{
                position: "absolute",
                top: d.depth * DEPTH - 40,
                left: d.side === "left" ? -140 : INNER_W - 340,
                width: 480,
                height: DOOR_W + 140,
                background: `radial-gradient(55% 50% at ${d.side === "left" ? "18%" : "82%"} 50%, rgba(${glowColor}, ${0.34 * g}) 0%, rgba(${glowColor}, 0) 70%)`,
                filter: "blur(6px)",
                animationDelay: `${i * 0.9}s`,
              }}
            />
          ))}
          {/* center runner hairline */}
          <div
            style={{
              position: "absolute",
              left: INNER_W / 2 - 1,
              top: 0,
              width: 2,
              height: DEPTH,
              background:
                "linear-gradient(to bottom, rgba(42, 52, 68, 0.0) 0%, rgba(42, 52, 68, 0.5) 18%, rgba(42, 52, 68, 0.14) 90%)",
            }}
          />
        </div>

        {/* ceiling */}
        <div
          style={{
            position: "absolute",
            left: INNER_LEFT,
            top: 0,
            width: INNER_W,
            height: DEPTH,
            transformOrigin: "top left",
            transform: "rotateX(-90deg)",
            background:
              "linear-gradient(to bottom, rgba(12, 16, 23, 0.98) 0%, rgba(6, 8, 12, 1) 60%)",
          }}
        />
      </motion.div>

      <style>{`
        @keyframes door-pulse {
          0%, 100% { opacity: 0.75; }
          50% { opacity: 1; }
        }
        .door-pulse { animation: door-pulse 5.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function WallDoors({
  side,
  glow,
  glowColor,
  lit,
  doorChildren,
  mirrored = false,
}: {
  side: "left" | "right";
  glow: number;
  glowColor: string;
  lit: boolean;
  doorChildren?: (door: CorridorDoor, i: number) => ReactNode;
  mirrored?: boolean;
}) {
  return (
    <>
      {DOORS.map((d, i) => {
        if (d.side !== side) return null;
        const x = d.depth * DEPTH;
        return (
          <div
            key={d.slug}
            style={{
              position: "absolute",
              left: x,
              top: H - DOOR_H - 22,
              width: DOOR_W,
              height: DOOR_H,
              // door frame
              boxShadow: `inset 0 0 0 2px rgba(42, 52, 68, 0.9), 0 0 ${40 * glow}px rgba(${glowColor}, ${0.28 * glow})`,
              background: `
                radial-gradient(85% 70% at 50% 100%, rgba(${glowColor}, ${(lit ? 0.5 : 0.34) * glow}) 0%, rgba(${glowColor}, ${0.1 * glow}) 55%, rgba(7, 10, 15, 0.9) 100%)`,
            }}
          >
            {/* light leaking through the gap */}
            <div
              style={{
                position: "absolute",
                inset: -26,
                background: `radial-gradient(60% 60% at 50% 80%, rgba(${glowColor}, ${0.2 * glow}) 0%, rgba(${glowColor}, 0) 70%)`,
                filter: "blur(14px)",
                pointerEvents: "none",
              }}
            />
            <div style={mirrored ? { position: "absolute", inset: 0, transform: "scaleX(-1)" } : { position: "absolute", inset: 0 }}>
              {doorChildren?.(d, i)}
            </div>
          </div>
        );
      })}
      {/* faint hung frames between doors, museum furniture */}
      {DOORS.filter((d) => d.side === side).map((d) => (
        <div
          key={`frame-${d.slug}`}
          style={{
            position: "absolute",
            left: d.depth * DEPTH + DOOR_W + 170,
            top: 300,
            width: 150,
            height: 190,
            border: "1px solid rgba(42, 52, 68, 0.55)",
            background: "rgba(16, 20, 28, 0.4)",
          }}
        />
      ))}
      {/* baseboard hairline where wall meets floor */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: H - 24,
          width: DEPTH,
          height: 1,
          background:
            "linear-gradient(to right, rgba(72, 88, 112, 0.6) 0%, rgba(42, 52, 68, 0.35) 45%, rgba(42, 52, 68, 0) 92%)",
        }}
      />
      {/* picture rail hairline near the ceiling */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 148,
          width: DEPTH,
          height: 1,
          background:
            "linear-gradient(to right, rgba(60, 74, 96, 0.4) 0%, rgba(42, 52, 68, 0.2) 45%, rgba(42, 52, 68, 0) 92%)",
        }}
      />
    </>
  );
}
