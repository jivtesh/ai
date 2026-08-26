// Touch keyboard for the wall. 64px keys, letters only, no hover states.

import { motion } from "framer-motion";
import { EASE } from "../lib/motion";

const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

export default function OnScreenKeyboard({
  onKey,
  onBackspace,
  onSubmit,
  canSubmit,
}: {
  onKey: (ch: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
}) {
  const keyStyle: React.CSSProperties = {
    minWidth: 64,
    height: 64,
    borderRadius: 8,
    border: "1px solid rgba(42, 52, 68, 0.9)",
    background: "rgba(16, 20, 28, 0.92)",
    color: "rgba(237, 234, 226, 0.92)",
    fontFamily: "var(--font-mono)",
    fontSize: 20,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
  };

  return (
    <motion.div
      initial={{ y: 320, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 320, opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        margin: "0 auto",
        width: "fit-content",
        bottom: 26,
        padding: "18px 20px 20px",
        borderRadius: 16,
        background: "rgba(8, 11, 17, 0.94)",
        border: "1px solid rgba(42, 52, 68, 0.9)",
        boxShadow: "0 30px 80px rgba(4, 6, 10, 0.8)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        zIndex: 70,
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {ROWS.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {ri === 2 && (
            <button
              style={{ ...keyStyle, minWidth: 96, fontSize: 22 }}
              onPointerDown={(e) => {
                e.preventDefault();
                onBackspace();
              }}
            >
              {"⌫"}
            </button>
          )}
          {row.split("").map((ch) => (
            <button
              key={ch}
              style={keyStyle}
              onPointerDown={(e) => {
                e.preventDefault();
                onKey(ch);
              }}
            >
              {ch}
            </button>
          ))}
          {ri === 2 && (
            <button
              style={{
                ...keyStyle,
                minWidth: 96,
                fontSize: 24,
                borderColor: canSubmit ? "rgba(217, 164, 65, 0.8)" : "rgba(42, 52, 68, 0.9)",
                color: canSubmit ? "var(--gold)" : "rgba(237, 234, 226, 0.35)",
                boxShadow: canSubmit ? "0 0 22px rgba(217, 164, 65, 0.25)" : "none",
              }}
              onPointerDown={(e) => {
                e.preventDefault();
                if (canSubmit) onSubmit();
              }}
            >
              {"→"}
            </button>
          )}
        </div>
      ))}
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button
          style={{ ...keyStyle, minWidth: 520 }}
          onPointerDown={(e) => {
            e.preventDefault();
            onKey(" ");
          }}
        />
      </div>
    </motion.div>
  );
}
