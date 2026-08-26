// Internal design-system page: every motion primitive, live.
// Not part of the visitor flow; reachable at #/demo and from the drawer.

import { useState } from "react";
import { motion } from "framer-motion";
import MaskReveal from "../components/MaskReveal";
import LightSweep from "../components/LightSweep";
import Counter from "../components/Counter";
import DayStrip from "../components/DayStrip";
import LightCone from "../components/LightCone";
import DustCanvas from "../components/DustCanvas";
import { ROOMS } from "../content/rooms";
import { EASE, DUR } from "../lib/motion";

function Section({
  title,
  children,
  onReplay,
}: {
  title: string;
  children: React.ReactNode;
  onReplay?: () => void;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--hairline)",
        borderRadius: 10,
        padding: "22px 26px",
        position: "relative",
        overflow: "hidden",
        background: "rgba(16, 20, 28, 0.5)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
        <div className="type-label" style={{ fontSize: 11, color: "rgba(237,234,226,0.5)" }}>
          {title}
        </div>
        {onReplay && (
          <button
            onClick={onReplay}
            className="type-label touchable"
            style={{
              fontSize: 10,
              color: "var(--future)",
              background: "none",
              border: "1px solid var(--hairline)",
              borderRadius: 999,
              padding: "0 18px",
              cursor: "pointer",
            }}
          >
            replay
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export default function Demo() {
  const [revealKey, setRevealKey] = useState(0);
  const [sweepKey, setSweepKey] = useState(0);
  const [count, setCount] = useState(12);
  const [stripMode, setStripMode] = useState<"now" | "next">("now");

  return (
    <motion.div
      className="absolute inset-0"
      style={{ overflowY: "auto", background: "var(--ink)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: DUR.fast, ease: EASE }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "48px 40px 120px", display: "grid", gap: 22 }}>
        <div className="type-display" style={{ fontSize: 44 }}>
          Design system
        </div>

        <Section title="palette and type">
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            {[
              ["ink", "#0B0F16"],
              ["ink2", "#10141C"],
              ["paper", "#EDEAE2"],
              ["hairline", "#2A3444"],
              ["future", "#2E9BD6"],
              ["gold", "#D9A441"],
              ["steel", "#5B6470"],
            ].map(([name, hex]) => (
              <div key={name} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 72,
                    height: 48,
                    borderRadius: 6,
                    background: hex,
                    border: "1px solid var(--hairline)",
                  }}
                />
                <div className="type-label" style={{ fontSize: 9, marginTop: 6, opacity: 0.6 }}>
                  {name}
                </div>
              </div>
            ))}
          </div>
          <div className="type-display" style={{ fontSize: 40 }}>
            Archivo 800 for display
          </div>
          <div style={{ fontSize: 17, margin: "8px 0", color: "rgba(237,234,226,0.85)" }}>
            Public Sans for body text, quiet and readable at a distance.
          </div>
          <div className="type-label" style={{ fontSize: 12, color: "var(--future)" }}>
            IBM Plex Mono for labels 07:00
          </div>
        </Section>

        <Section title="light cone and dust" >
          <div style={{ position: "relative", height: 260, overflow: "hidden", borderRadius: 8, background: "radial-gradient(120% 100% at 50% 0%, #10141C 0%, #0B0F16 70%)" }}>
            <LightCone x={0.3} spread={0.3} intensity={0.7} hue="cool" />
            <LightCone x={0.72} spread={0.26} intensity={0.6} hue="blue" />
            <DustCanvas beams={[{ x: 0.3, spread: 0.3 }, { x: 0.72, spread: 0.26, hue: "blue" }]} density={50} />
          </div>
        </Section>

        <Section title="mask reveal" onReplay={() => setRevealKey((k) => k + 1)}>
          <div key={revealKey}>
            <MaskReveal
              lines={["We can't have a 10x ambition", "if we can't imagine it."]}
              lineClassName="type-display"
              className=""
              stagger={0.14}
            />
          </div>
        </Section>

        <Section title="light sweep" onReplay={() => setSweepKey((k) => k + 1)}>
          <div style={{ position: "relative", height: 120, borderRadius: 8, overflow: "hidden", background: "#10141C" }}>
            <LightSweep playKey={sweepKey} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(237,234,226,0.4)", fontSize: 14 }}>
              the flip's opening gesture
            </div>
          </div>
        </Section>

        <Section
          title="counter with deceleration"
          onReplay={() => setCount((c) => (c === 12 ? 4800 : 12))}
        >
          <div className="type-display" style={{ fontSize: 64, color: "var(--future)" }}>
            <Counter value={count} duration={1.6} />
          </div>
        </Section>

        <Section
          title="day-strip stagger reflow"
          onReplay={() => setStripMode((m) => (m === "now" ? "next" : "now"))}
        >
          <div className="type-label" style={{ fontSize: 10, marginBottom: 8, color: stripMode === "now" ? "var(--steel)" : "var(--gold)" }}>
            {stripMode === "now" ? "NOW" : "IN FIVE YEARS"}
          </div>
          <DayStrip config={ROOMS.procurement} mode={stripMode} />
        </Section>
      </div>
    </motion.div>
  );
}
