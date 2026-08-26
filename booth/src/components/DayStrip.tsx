// The shared visualization: one working day, 07:00 to 19:00.
// NOW: dense steel blocks and an accumulating notification count.
// NEXT: routine work collapses into a thin agent rail beneath the line
// while fewer, larger, gold human blocks take the day.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { RoomConfig } from "../content/rooms";
import { EASE } from "../lib/motion";
import { useT } from "../i18n/useT";
import Counter from "./Counter";

const pct = (h: number) => ((h - 7) / 12) * 100;

const H = 150; // strip height in px
const BASE = 92; // baseline y
const RAIL = 118; // agent rail y

export default function DayStrip({
  config,
  mode,
  className = "",
}: {
  config: RoomConfig;
  mode: "now" | "next";
  className?: string;
}) {
  const t = useT();
  const isNext = mode === "next";
  const [pings, setPings] = useState(12);

  useEffect(() => {
    if (isNext) return;
    const iv = setInterval(() => setPings((p) => p + 1), 2400);
    return () => clearInterval(iv);
  }, [isNext]);

  return (
    <div className={className} style={{ position: "relative", height: H, width: "100%" }}>
      {/* baseline */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: BASE,
          height: 1,
          background: "var(--hairline)",
        }}
      />
      {/* hour ticks and labels */}
      {[7, 9, 11, 13, 15, 17, 19].map((h) => (
        <div key={h} style={{ position: "absolute", left: `${pct(h)}%`, top: BASE }}>
          <div style={{ width: 1, height: 5, background: "var(--hairline)" }} />
          {(h - 7) % 4 === 0 && (
            <div
              className="type-label"
              style={{
                position: "absolute",
                top: 9,
                left: 0,
                transform: h === 19 ? "translateX(-100%)" : h === 7 ? "none" : "translateX(-50%)",
                fontSize: 10,
                color: "rgba(237, 234, 226, 0.38)",
                whiteSpace: "nowrap",
              }}
            >
              {String(h).padStart(2, "0")}:00
            </div>
          )}
        </div>
      ))}

      {/* routine blocks: dense steel above the line, collapsing into the rail */}
      {config.nowBlocks.map((b, i) => {
        const left = pct(b.start);
        const width = pct(b.end) - pct(b.start);
        return (
          <motion.div
            key={`r${i}`}
            style={{
              position: "absolute",
              left: `${left}%`,
              width: `${width}%`,
              borderRadius: 2,
            }}
            initial={false}
            animate={
              isNext
                ? {
                    top: RAIL,
                    height: 4,
                    opacity: 0.85,
                    background: "rgba(46, 155, 214, 0.42)",
                    boxShadow: "0 0 6px rgba(46, 155, 214, 0.25)",
                  }
                : {
                    top: BASE - 30,
                    height: 26,
                    opacity: 1,
                    background: "rgba(91, 100, 112, 0.5)",
                    boxShadow: "inset 0 0 0 1px rgba(91, 100, 112, 0.55)",
                  }
            }
            transition={{ duration: 0.6, ease: EASE, delay: i * 0.06 * (isNext ? 1 : 0.5) }}
          />
        );
      })}

      {/* human blocks: fewer, gold, larger */}
      {config.nextHumanBlocks.map((b, i) => {
        const left = pct(b.start);
        const width = pct(b.end) - pct(b.start);
        return (
          <motion.div
            key={`h${i}`}
            style={{
              position: "absolute",
              left: `${left}%`,
              width: `${width}%`,
              top: BASE - 44,
              height: 40,
              borderRadius: 3,
              transformOrigin: "bottom center",
            }}
            initial={false}
            animate={
              isNext
                ? {
                    opacity: 1,
                    scaleY: 1,
                    background:
                      "linear-gradient(to bottom, rgba(217, 164, 65, 0.85), rgba(217, 164, 65, 0.55))",
                    boxShadow:
                      "0 0 18px rgba(217, 164, 65, 0.28), inset 0 0 0 1px rgba(217, 164, 65, 0.8)",
                  }
                : { opacity: 0, scaleY: 0.4, background: "rgba(217, 164, 65, 0)", boxShadow: "none" }
            }
            transition={{
              duration: 0.6,
              ease: EASE,
              delay: isNext ? 0.28 + i * 0.08 : i * 0.04,
            }}
          />
        );
      })}

      {/* agent rail label */}
      <motion.div
        className="type-label"
        style={{
          position: "absolute",
          left: 0,
          top: RAIL + 9,
          fontSize: 10,
          color: "rgba(46, 155, 214, 0.75)",
        }}
        initial={false}
        animate={{ opacity: isNext ? 1 : 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: isNext ? 0.5 : 0 }}
      >
        {t("daystrip.agents")}
      </motion.div>

      {/* notification count, NOW only */}
      <motion.div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
        initial={false}
        animate={{ opacity: isNext ? 0 : 1 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <motion.div
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: "rgba(91, 100, 112, 0.9)",
          }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <span
          className="type-label"
          style={{ fontSize: 12, color: "rgba(91, 100, 112, 1)" }}
        >
          <Counter value={pings} duration={0.5} />
        </span>
      </motion.div>
    </div>
  );
}
