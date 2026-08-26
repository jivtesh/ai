// Operations drawer: jump grid, language, sound, reset, CSV export,
// clear wall with double confirm, session stats.

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBooth, type ScreenName } from "../state/store";
import { ROOM_ORDER } from "../content/rooms";
import { LANGS, type Lang } from "../i18n/strings";
import { useT } from "../i18n/useT";
import { readCounters } from "../lib/analytics";
import { setSoundEnabled } from "../lib/sound";
import { EASE } from "../lib/motion";

const JUMPS: { label: string; screen: ScreenName; room?: string }[] = [
  { label: "Attract", screen: "attract" },
  { label: "Greeter", screen: "greeter" },
  { label: "Gallery", screen: "gallery" },
  ...ROOM_ORDER.map((slug, i) => ({
    label: `Room ${i + 1}`,
    screen: "room" as ScreenName,
    room: slug,
  })),
  { label: "Choice", screen: "choice" },
  { label: "Why", screen: "why" },
  { label: "Wall", screen: "wall" },
  { label: "Demo", screen: "demo" },
];

function csvEscape(s: string) {
  return `"${s.replace(/"/g, '""')}"`;
}

export default function FacilitatorPanel() {
  const open = useBooth((s) => s.facilitatorOpen);
  const setOpen = useBooth((s) => s.setFacilitatorOpen);
  const lang = useBooth((s) => s.lang);
  const setLang = useBooth((s) => s.setLang);
  const soundOn = useBooth((s) => s.soundOn);
  const setSound = useBooth((s) => s.setSound);
  const notes = useBooth((s) => s.notes);
  const t = useT();
  const [confirmClear, setConfirmClear] = useState(false);
  const [stats, setStats] = useState(readCounters());

  useEffect(() => {
    if (open) {
      setStats(readCounters());
      setConfirmClear(false);
    }
  }, [open]);

  const exportCsv = () => {
    const rows = [
      "timestamp,text",
      ...notes.map((n) => `${new Date(n.ts).toISOString()},${csvEscape(n.text)}`),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `wall-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const btn: React.CSSProperties = {
    minHeight: 64,
    padding: "0 18px",
    border: "1px solid var(--hairline)",
    borderRadius: 6,
    background: "rgba(16, 20, 28, 0.9)",
    color: "var(--paper)",
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    letterSpacing: "0.06em",
    cursor: "pointer",
    textAlign: "left" as const,
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="facilitator"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 100,
            display: "flex",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            style={{
              width: 430,
              height: "100%",
              background: "rgba(8, 11, 17, 0.97)",
              borderRight: "1px solid var(--hairline)",
              padding: "28px 26px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 22,
            }}
            initial={{ x: -440 }}
            animate={{ x: 0 }}
            exit={{ x: -440 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div className="type-label" style={{ fontSize: 12, color: "var(--gold)" }}>
              {t("facilitator.title")}
            </div>

            <div>
              <div className="type-label" style={{ fontSize: 10, opacity: 0.5, marginBottom: 10 }}>
                {t("facilitator.jump")}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {JUMPS.map((j) => (
                  <button
                    key={j.label}
                    style={btn}
                    onClick={() => {
                      useBooth.getState().goto(j.screen, j.room as never);
                      setOpen(false);
                    }}
                  >
                    {j.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="type-label" style={{ fontSize: 10, opacity: 0.5, marginBottom: 10 }}>
                {t("facilitator.language")}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {LANGS.map((l: Lang) => (
                  <button
                    key={l}
                    style={{
                      ...btn,
                      flex: 1,
                      textAlign: "center",
                      borderColor: l === lang ? "var(--gold)" : "var(--hairline)",
                      color: l === lang ? "var(--gold)" : "var(--paper)",
                    }}
                    onClick={() => setLang(l)}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                style={{
                  ...btn,
                  flex: 1,
                  borderColor: soundOn ? "var(--gold)" : "var(--hairline)",
                  color: soundOn ? "var(--gold)" : "var(--paper)",
                }}
                onClick={() => {
                  setSound(!soundOn);
                  setSoundEnabled(!soundOn);
                }}
              >
                {t("facilitator.sound")}: {soundOn ? "on" : "off"}
              </button>
              <button
                style={{ ...btn, flex: 1 }}
                onClick={() => {
                  useBooth.getState().resetSession();
                  setOpen(false);
                }}
              >
                {t("facilitator.reset")}
              </button>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...btn, flex: 1 }} onClick={exportCsv}>
                {t("facilitator.export")}
              </button>
              <button
                style={{
                  ...btn,
                  flex: 1,
                  borderColor: confirmClear ? "#b04a3a" : "var(--hairline)",
                  color: confirmClear ? "#e0836f" : "var(--paper)",
                }}
                onClick={() => {
                  if (confirmClear) {
                    useBooth.getState().clearWall();
                    setConfirmClear(false);
                  } else {
                    setConfirmClear(true);
                    window.setTimeout(() => setConfirmClear(false), 4000);
                  }
                }}
              >
                {confirmClear ? t("facilitator.clear.confirm") : t("facilitator.clear")}
              </button>
            </div>

            <div>
              <div className="type-label" style={{ fontSize: 10, opacity: 0.5, marginBottom: 10 }}>
                {t("facilitator.stats")}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  lineHeight: 1.9,
                  color: "rgba(237, 234, 226, 0.75)",
                  border: "1px solid var(--hairline)",
                  borderRadius: 6,
                  padding: "12px 16px",
                }}
              >
                {(
                  [
                    ["sessions", stats.sessions],
                    ["roomVisits", stats.roomVisits],
                    ["flips", stats.flips],
                    ["notes", stats.notes],
                    ["wall", notes.length],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ opacity: 0.6 }}>{k}</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <div style={{ flex: 1 }} onPointerDown={() => setOpen(false)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
