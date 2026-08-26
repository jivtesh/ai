// ROOM. The shared template: background plate, midground beat canvas,
// foreground story column and the day-strip. The flip is the signature:
// light sweep, temperature shift, strip reflow, data beat, type-on line.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FixedStage from "../components/FixedStage";
import { Layer, ParallaxScene, SceneDressing } from "../components/ParallaxScene";
import LightCone from "../components/LightCone";
import DustCanvas from "../components/DustCanvas";
import LightSweep from "../components/LightSweep";
import DayStrip from "../components/DayStrip";
import NavBar from "../components/NavBar";
import TypeOn from "../components/TypeOn";
import { BEATS } from "../beats/index";
import { useBooth } from "../state/store";
import { useT } from "../i18n/useT";
import { translate, type StringId } from "../i18n/strings";
import { ROOMS, type RoomSlug } from "../content/rooms";
import { DUR, EASE } from "../lib/motion";
import { playCue } from "../lib/sound";

function splitFinalSentence(text: string): { main: string; final: string } {
  const idx = text.lastIndexOf(". ", text.length - 3);
  if (idx < 0) return { main: "", final: text };
  return { main: text.slice(0, idx + 1) + " ", final: text.slice(idx + 2) };
}

function FlipToggle({ flipped, onFlip }: { flipped: boolean; onFlip: (v: boolean) => void }) {
  const t = useT();
  return (
    <div
      style={{
        display: "inline-flex",
        border: "1px solid var(--hairline)",
        borderRadius: 999,
        background: "rgba(11, 15, 22, 0.6)",
        padding: 4,
        backdropFilter: "blur(6px)",
      }}
    >
      {([false, true] as const).map((v) => {
        const active = flipped === v;
        return (
          <button
            key={String(v)}
            className="type-label touchable"
            onPointerDown={() => onFlip(v)}
            style={{
              height: 56,
              padding: "0 30px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              letterSpacing: "0.18em",
              transition: "background 0.5s, color 0.5s, box-shadow 0.5s",
              background: active
                ? v
                  ? "rgba(46, 155, 214, 0.2)"
                  : "rgba(91, 100, 112, 0.28)"
                : "transparent",
              color: active
                ? v
                  ? "rgba(140, 208, 245, 1)"
                  : "rgba(178, 188, 202, 1)"
                : "rgba(237, 234, 226, 0.42)",
              boxShadow: active && v ? "0 0 22px rgba(46, 155, 214, 0.25)" : "none",
            }}
          >
            {t(v ? "flip.next" : "flip.now")}
          </button>
        );
      })}
    </div>
  );
}

export default function Room({ slug }: { slug: RoomSlug }) {
  const lang = useBooth((s) => s.lang);
  const audience = useBooth((s) => s.audience);
  const flipped = !!useBooth((s) => s.flipped[slug]);
  const setFlipped = useBooth((s) => s.setFlipped);
  const cfg = ROOMS[slug];
  const Beat = BEATS[slug];
  const [flipCount, setFlipCount] = useState(0);
  const [stripMode, setStripMode] = useState<"now" | "next">(flipped ? "next" : "now");
  const firstRender = useRef(true);

  // choreography: sweep at 0, strip reflow at 450ms (flip) / 80ms (back)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      setStripMode(flipped ? "next" : "now");
      return;
    }
    setFlipCount((c) => c + 1);
    playCue("flip");
    const id = window.setTimeout(() => setStripMode(flipped ? "next" : "now"), flipped ? 450 : 80);
    return () => window.clearTimeout(id);
  }, [flipped]);

  const tx = (k: string) => translate(`room.${slug}.${k}` as StringId, lang);
  const t = useT();
  const nextSplit = splitFinalSentence(tx("next"));

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: DUR.base, ease: EASE }}
    >
      <FixedStage>
        <ParallaxScene>
          {/* background plate, cool and warm exposures crossfading */}
          <Layer depth={0.18}>
            <img
              src={`/scenes/${slug}/bg.webp`}
              alt=""
              draggable={false}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "saturate(0.55) brightness(0.8)",
              }}
            />
            <motion.img
              src={`/scenes/${slug}/bg.webp`}
              alt=""
              draggable={false}
              initial={false}
              animate={{ opacity: flipped ? 1 : 0 }}
              transition={{ duration: 1.1, ease: EASE }}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "saturate(1.05) brightness(1.02)",
              }}
            />
            {/* temperature washes */}
            <motion.div
              initial={false}
              animate={{ opacity: flipped ? 0 : 1 }}
              transition={{ duration: 1.1, ease: EASE }}
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(140deg, rgba(91, 100, 112, 0.16) 0%, rgba(11, 15, 22, 0.4) 70%)",
              }}
            />
            <motion.div
              initial={false}
              animate={{ opacity: flipped ? 1 : 0 }}
              transition={{ duration: 1.1, ease: EASE }}
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(140deg, rgba(217, 164, 65, 0.10) 0%, rgba(11, 15, 22, 0.32) 55%, rgba(46, 155, 214, 0.10) 100%)",
              }}
            />
          </Layer>

          {/* light: steel key in the present, warm key plus living blue in five years */}
          <Layer depth={0.3}>
            <motion.div
              initial={false}
              animate={{ opacity: flipped ? 0 : 1 }}
              transition={{ duration: 1.2, ease: EASE }}
              style={{ position: "absolute", inset: 0 }}
            >
              <LightCone x={0.24} spread={0.34} intensity={0.42} hue="cool" tilt={-2} />
            </motion.div>
            <motion.div
              initial={false}
              animate={{ opacity: flipped ? 1 : 0 }}
              transition={{ duration: 1.2, ease: EASE }}
              style={{ position: "absolute", inset: 0 }}
            >
              <LightCone x={0.24} spread={0.36} intensity={0.5} hue="warm" tilt={-2} />
              <LightCone x={0.78} spread={0.3} intensity={0.36} hue="blue" tilt={3} />
            </motion.div>
            <DustCanvas beams={[{ x: 0.24, spread: 0.34, hue: flipped ? "warm" : "cool" }]} density={44} />
          </Layer>

          {/* midground: the data beat stage */}
          <Layer depth={0.55}>
            <div style={{ position: "absolute", left: 780, right: 90, top: 130, bottom: 340 }}>
              <Beat flipped={flipped} />
            </div>
          </Layer>

          {/* foreground: the story column and the day-strip */}
          <Layer depth={0.9}>
            <div style={{ position: "absolute", left: 110, top: 118, width: 590 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
                <span className="type-label" style={{ fontSize: 13, color: "var(--gold)" }}>
                  {String(cfg.index).padStart(2, "0")}
                </span>
                <span style={{ width: 34, height: 1, background: "var(--hairline)" }} />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={String(flipped)}
                    className="type-label"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    style={{
                      fontSize: 13,
                      color: flipped ? "rgba(140, 208, 245, 1)" : "rgba(148, 158, 172, 1)",
                    }}
                  >
                    {t(flipped ? "flip.next" : "flip.now")}
                  </motion.span>
                </AnimatePresence>
              </div>

              <div
                className="type-display"
                style={{ fontSize: 58, fontWeight: 800, marginBottom: 14 }}
              >
                {tx("title")}
              </div>
              <div style={{ fontSize: 21, color: "rgba(237, 234, 226, 0.85)", marginBottom: 26 }}>
                {tx("oneliner")}
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 30 }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 999,
                    background: "var(--gold)",
                    boxShadow: "0 0 10px rgba(217, 164, 65, 0.8)",
                  }}
                />
                <span
                  className="type-label"
                  style={{ fontSize: 12.5, color: "rgba(237, 234, 226, 0.68)" }}
                >
                  {tx("persona")}
                </span>
              </div>

              <div style={{ position: "relative", minHeight: 220 }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={String(flipped)}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.7, ease: EASE, delay: flipped ? 0.5 : 0.1 }}
                    style={{
                      fontSize: 19,
                      lineHeight: 1.62,
                      color: "rgba(237, 234, 226, 0.9)",
                    }}
                  >
                    {flipped ? (
                      <>
                        {nextSplit.main}
                        <TypeOn
                          text={nextSplit.final}
                          play={flipped}
                          delay={1.05}
                          cps={46}
                          style={{ color: "rgba(140, 208, 245, 0.98)" }}
                        />
                      </>
                    ) : (
                      tx("now")
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {audience === "guest" && (
                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    marginTop: 12,
                    paddingLeft: 2,
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      width: 3,
                      alignSelf: "stretch",
                      borderRadius: 2,
                      background: "rgba(46, 155, 214, 0.7)",
                    }}
                  />
                  <span style={{ fontSize: 15.5, lineHeight: 1.5, color: "rgba(174, 210, 232, 0.85)" }}>
                    {tx("lens")}
                  </span>
                </div>
              )}
            </div>

            {/* flip control */}
            <div style={{ position: "absolute", right: 90, top: 110 }}>
              <FlipToggle flipped={flipped} onFlip={(v) => setFlipped(slug, v)} />
            </div>

            {/* the day-strip */}
            <div style={{ position: "absolute", left: 110, right: 90, bottom: 116 }}>
              <DayStrip config={cfg} mode={stripMode} />
            </div>
          </Layer>

          {/* the flip's opening gesture */}
          <LightSweep playKey={flipCount} hue={flipped ? "warm" : "cool"} />
          {flipCount > 0 && (
            <motion.div
              key={`dim-${flipCount}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.12, 0] }}
              transition={{ duration: 0.55, times: [0, 0.4, 1] }}
              style={{ position: "absolute", inset: 0, background: "#04060a", pointerEvents: "none", zIndex: 30 }}
            />
          )}

          <SceneDressing />
        </ParallaxScene>
      </FixedStage>
      <NavBar back cont allRooms />
    </motion.div>
  );
}
