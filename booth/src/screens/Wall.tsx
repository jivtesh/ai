// WALL. Gold era. One line per visitor, landing as a glowing plaque that
// persists all week. A ticker counts intentions; a shimmer crosses the
// plaques; three next-step cards wait beneath.

import { memo, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FixedStage from "../components/FixedStage";
import LightCone from "../components/LightCone";
import DustCanvas from "../components/DustCanvas";
import OnScreenKeyboard from "../components/OnScreenKeyboard";
import NavBar from "../components/NavBar";
import Counter from "../components/Counter";
import { Layer, ParallaxScene, SceneDressing } from "../components/ParallaxScene";
import { useBooth, type WallNote } from "../state/store";
import { useT } from "../i18n/useT";
import { translate, type StringId } from "../i18n/strings";
import { DUR, EASE } from "../lib/motion";
import { playCue } from "../lib/sound";

const MAX_LEN = 80;
// only the newest plaques stay mounted; persistence and the ticker use all
const MAX_PLAQUES = 40;

const Plaque = memo(function Plaque({
  note,
  index,
  fresh,
}: {
  note: WallNote;
  index: number;
  fresh: boolean;
}) {
  const removeNote = useBooth((s) => s.removeNote);
  const removeArmed = useBooth((s) => s.removeArmed);
  const holdTimer = useRef<number>(0);
  const [holding, setHolding] = useState(false);

  const clearHold = () => {
    setHolding(false);
    window.clearTimeout(holdTimer.current);
  };
  useEffect(() => () => window.clearTimeout(holdTimer.current), []);

  return (
    <motion.div
      layout
      initial={fresh ? { opacity: 0, y: -140, scale: 0.86, rotate: note.rot * 3 } : false}
      animate={{ opacity: 1, y: 0, scale: [null, 1.04, 1], rotate: note.rot }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.7, ease: EASE, scale: { duration: 0.5, times: [0, 0.7, 1] } }}
      style={{
        position: "relative",
        padding: "16px 22px",
        maxWidth: 330,
        borderRadius: 5,
        background:
          "linear-gradient(160deg, rgba(74, 60, 34, 0.95) 0%, rgba(52, 43, 26, 0.96) 50%, rgba(40, 34, 22, 0.97) 100%)",
        boxShadow: holding
          ? "inset 0 0 0 1px rgba(230, 120, 80, 0.8), 0 6px 30px rgba(4, 6, 10, 0.6)"
          : "inset 0 0 0 1px rgba(217, 164, 65, 0.4), inset 0 1px 0 rgba(240, 220, 170, 0.28), 0 6px 30px rgba(4, 6, 10, 0.6), 0 0 24px rgba(217, 164, 65, 0.12)",
        overflow: "hidden",
        transition: "box-shadow 0.3s",
      }}
      onPointerDown={() => {
        // removal is a facilitator action, armed from the drawer
        if (!removeArmed) return;
        window.clearTimeout(holdTimer.current);
        setHolding(true);
        holdTimer.current = window.setTimeout(() => {
          removeNote(note.id);
        }, 800);
      }}
      onPointerUp={clearHold}
      onPointerLeave={clearHold}
      onPointerCancel={clearHold}
    >
      {/* shimmer that crosses every 20s, offset per plaque */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: 60,
          background:
            "linear-gradient(to right, rgba(240, 220, 170, 0) 0%, rgba(240, 220, 170, 0.16) 50%, rgba(240, 220, 170, 0) 100%)",
          animation: `plaque-shimmer 20s linear infinite`,
          animationDelay: `${(index % 10) * 0.35}s`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          fontSize: 16.5,
          lineHeight: 1.45,
          color: "rgba(244, 234, 214, 0.96)",
        }}
      >
        {note.text}
      </div>
    </motion.div>
  );
});

export default function Wall() {
  const t = useT();
  const lang = useBooth((s) => s.lang);
  const notes = useBooth((s) => s.notes);
  const addNote = useBooth((s) => s.addNote);
  const [draft, setDraft] = useState("");
  const [kbOpen, setKbOpen] = useState(false);
  const freshIds = useRef<Set<string>>(new Set());
  const seeded = useRef(false);

  // seed the wall the first time it is ever empty
  useEffect(() => {
    if (!seeded.current && notes.length === 0) {
      seeded.current = true;
      (["wall.seed1", "wall.seed2", "wall.seed3"] as StringId[]).forEach((id) =>
        addNote(translate(id, lang), true),
      );
    }
  }, [notes.length, addNote, lang]);

  // physical keyboard feeds the draft while the on-screen keyboard is open,
  // and must not trigger the app-level shortcuts
  useEffect(() => {
    if (!kbOpen) return;
    const onKey = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === "Enter") {
        submitRef.current();
      } else if (e.key === "Backspace") {
        setDraft((d) => d.slice(0, -1));
      } else if (e.key === "Escape") {
        setKbOpen(false);
      } else if (e.key.length === 1) {
        setDraft((d) => (d + e.key).slice(0, MAX_LEN));
      }
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, [kbOpen]);

  const submitRef = useRef(() => {});
  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    const before = useBooth.getState().notes.map((n) => n.id);
    addNote(text);
    const after = useBooth.getState().notes;
    after.forEach((n) => {
      if (!before.includes(n.id)) freshIds.current.add(n.id);
    });
    playCue("note");
    setDraft("");
    setKbOpen(false);
  };
  submitRef.current = submit;

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: DUR.base, ease: EASE }}
      onPointerDown={() => setKbOpen(false)}
    >
      <FixedStage>
        <ParallaxScene>
          <Layer depth={0.18}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(110% 80% at 50% 20%, #141118 0%, #0d0b10 55%, #08070b 100%)",
              }}
            />
            {/* warm wall wash */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(70% 52% at 50% 40%, rgba(217, 164, 65, 0.10) 0%, rgba(217, 164, 65, 0) 70%)",
              }}
            />
            <LightCone x={0.28} spread={0.3} intensity={0.5} hue="warm" tilt={-2} />
            <LightCone x={0.72} spread={0.3} intensity={0.5} hue="warm" tilt={2} />
          </Layer>
          <Layer depth={0.4}>
            <DustCanvas
              beams={[
                { x: 0.28, spread: 0.3, hue: "warm" },
                { x: 0.72, spread: 0.3, hue: "warm" },
              ]}
              density={55}
            />
          </Layer>

          <Layer depth={0.75}>
            {/* prompt and input */}
            <div style={{ position: "absolute", left: 0, right: 0, top: 56, textAlign: "center" }}>
              <div className="type-display" style={{ fontSize: 46, fontWeight: 800 }}>
                {t("wall.prompt")}
              </div>
              <div
                className="touchable"
                style={{
                  margin: "26px auto 0",
                  width: 760,
                  minHeight: 64,
                  borderRadius: 10,
                  border: `1px solid ${kbOpen ? "rgba(217, 164, 65, 0.75)" : "rgba(42, 52, 68, 1)"}`,
                  background: "rgba(11, 15, 22, 0.7)",
                  boxShadow: kbOpen ? "0 0 30px rgba(217, 164, 65, 0.15)" : "none",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 26px",
                  cursor: "text",
                  transition: "border 0.4s, box-shadow 0.4s",
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setKbOpen(true);
                }}
              >
                <span
                  style={{
                    fontSize: 19,
                    color: draft ? "rgba(244, 234, 214, 0.96)" : "rgba(237, 234, 226, 0.38)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {draft || t("wall.placeholder")}
                </span>
                {kbOpen && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 2,
                      height: 26,
                      marginLeft: 4,
                      background: "rgba(217, 164, 65, 0.9)",
                      animation: "caret-blink 1.1s steps(1) infinite",
                    }}
                  />
                )}
              </div>
            </div>

            {/* intentions ticker */}
            <div
              style={{
                position: "absolute",
                right: 90,
                top: 64,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "0 22px",
                height: 56,
                borderRadius: 999,
                border: "1px solid rgba(217, 164, 65, 0.4)",
                background: "rgba(11, 15, 22, 0.6)",
              }}
            >
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  background: "var(--gold)",
                }}
              />
              <span className="type-label" style={{ fontSize: 15, color: "var(--gold)" }}>
                <Counter value={notes.length} duration={0.7} />
              </span>
            </div>

            {/* the wall itself */}
            <div
              style={{
                position: "absolute",
                left: 130,
                right: 130,
                top: 236,
                height: 520,
                display: "flex",
                flexWrap: "wrap",
                gap: 20,
                alignContent: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <AnimatePresence>
                {(notes.length > MAX_PLAQUES ? notes.slice(-MAX_PLAQUES) : notes).map((n, i) => (
                  <Plaque key={n.id} note={n} index={i} fresh={freshIds.current.has(n.id)} />
                ))}
              </AnimatePresence>
            </div>

            {/* next steps */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 40,
                display: "flex",
                justifyContent: "center",
                gap: 26,
              }}
            >
              {(["1", "2", "3"] as const).map((n) => (
                <div
                  key={n}
                  style={{
                    width: 400,
                    borderRadius: 10,
                    border: "1px solid rgba(42, 52, 68, 0.9)",
                    background: "rgba(11, 15, 22, 0.72)",
                    padding: "20px 22px",
                    display: "flex",
                    gap: 18,
                    alignItems: "center",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      className="type-label"
                      style={{ fontSize: 11.5, color: "var(--gold)", marginBottom: 8 }}
                    >
                      {t(`wall.card${n}.title` as StringId)}
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.5, color: "rgba(237, 234, 226, 0.72)" }}>
                      {t(`wall.card${n}.body` as StringId)}
                    </div>
                  </div>
                  {/* QR placeholder slot */}
                  <div
                    style={{
                      width: 84,
                      height: 84,
                      flexShrink: 0,
                      borderRadius: 6,
                      border: "1.5px dashed rgba(217, 164, 65, 0.45)",
                      background:
                        "repeating-linear-gradient(0deg, rgba(217, 164, 65, 0.06) 0 6px, transparent 6px 12px), repeating-linear-gradient(90deg, rgba(217, 164, 65, 0.06) 0 6px, transparent 6px 12px)",
                    }}
                  />
                </div>
              ))}
            </div>
          </Layer>

          <SceneDressing />
        </ParallaxScene>

        <AnimatePresence>
          {kbOpen && (
            <OnScreenKeyboard
              onKey={(ch) => setDraft((d) => (d + ch).slice(0, MAX_LEN))}
              onBackspace={() => setDraft((d) => d.slice(0, -1))}
              onSubmit={submit}
              canSubmit={draft.trim().length > 0}
            />
          )}
        </AnimatePresence>
      </FixedStage>
      {!kbOpen && <NavBar back cont restart />}
    </motion.div>
  );
}
