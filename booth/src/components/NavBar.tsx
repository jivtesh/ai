// Shared corner navigation. Mono, quiet, 64px touch targets.

import { useBooth } from "../state/store";
import { useT } from "../i18n/useT";

const btnStyle: React.CSSProperties = {
  minHeight: 64,
  minWidth: 64,
  padding: "0 22px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  border: "1px solid rgba(42, 52, 68, 0.9)",
  borderRadius: 999,
  background: "rgba(11, 15, 22, 0.55)",
  color: "rgba(237, 234, 226, 0.82)",
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  cursor: "pointer",
  backdropFilter: "blur(6px)",
};

export default function NavBar({
  back = true,
  cont = true,
  allRooms = false,
  restart = false,
}: {
  back?: boolean;
  cont?: boolean;
  allRooms?: boolean;
  restart?: boolean;
}) {
  const t = useT();
  const s = useBooth;
  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        right: 40,
        bottom: 32,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 60,
        pointerEvents: "none",
      }}
    >
      <div style={{ display: "flex", gap: 12, pointerEvents: "auto" }}>
        {back && (
          <button style={btnStyle} onClick={() => s.getState().back()}>
            {t("nav.back")}
          </button>
        )}
        {allRooms && (
          <button style={btnStyle} onClick={() => s.getState().goto("gallery")}>
            {t("nav.allrooms")}
          </button>
        )}
      </div>
      <div style={{ display: "flex", gap: 12, pointerEvents: "auto" }}>
        {restart && (
          <button style={btnStyle} onClick={() => s.getState().goto("attract")}>
            {t("nav.restart")}
          </button>
        )}
        {cont && (
          <button
            style={{
              ...btnStyle,
              borderColor: "rgba(46, 155, 214, 0.55)",
              color: "rgba(237, 234, 226, 0.95)",
              boxShadow: "0 0 18px rgba(46, 155, 214, 0.14)",
            }}
            onClick={() => s.getState().continueFrom()}
          >
            {t("nav.continue")}
          </button>
        )}
      </div>
    </div>
  );
}
