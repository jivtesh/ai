import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useBooth } from "./state/store";
import { ROOM_ORDER } from "./content/rooms";
import Attract from "./screens/Attract";
import Greeter from "./screens/Greeter";
import Gallery from "./screens/Gallery";
import Room from "./screens/Room";
import Choice from "./screens/Choice";
import Why from "./screens/Why";
import Wall from "./screens/Wall";
import Demo from "./screens/Demo";
import SpillOverlay from "./components/SpillOverlay";
import FacilitatorPanel from "./components/FacilitatorPanel";
import FacilitatorCorner from "./components/FacilitatorCorner";

export default function App() {
  const screen = useBooth((s) => s.screen);
  const roomSlug = useBooth((s) => s.roomSlug);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      const s = useBooth.getState();
      const n = Number(e.key);
      if (n >= 1 && n <= 5) {
        s.goto("room", ROOM_ORDER[n - 1]);
        return;
      }
      switch (e.key) {
        case " ":
          if (s.screen === "room") {
            e.preventDefault();
            s.toggleFlip(s.roomSlug);
          }
          break;
        case "ArrowRight":
          s.continueFrom();
          break;
        case "ArrowLeft":
          s.back();
          break;
        case "m":
          s.goto("gallery");
          break;
        case "c":
          s.goto("choice");
          break;
        case "w":
          s.goto("wall");
          break;
        case "Escape":
          s.goto("attract");
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const key = screen === "room" ? `room-${roomSlug}` : screen;

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      <AnimatePresence mode="wait">
        {screen === "attract" && <Attract key={key} />}
        {screen === "greeter" && <Greeter key={key} />}
        {screen === "gallery" && <Gallery key={key} />}
        {screen === "room" && <Room key={key} slug={roomSlug} />}
        {screen === "choice" && <Choice key={key} />}
        {screen === "why" && <Why key={key} />}
        {screen === "wall" && <Wall key={key} />}
        {screen === "demo" && <Demo key={key} />}
      </AnimatePresence>
      <SpillOverlay />
      <FacilitatorCorner />
      <FacilitatorPanel />
    </div>
  );
}
