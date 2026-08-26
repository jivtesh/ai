// Five taps in the top-left corner within 3 seconds opens the drawer.

import { useRef } from "react";
import { useBooth } from "../state/store";

export default function FacilitatorCorner() {
  const taps = useRef<number[]>([]);
  const setOpen = useBooth((s) => s.setFacilitatorOpen);

  return (
    <div
      style={{ position: "absolute", top: 0, left: 0, width: 96, height: 96, zIndex: 80 }}
      onPointerDown={() => {
        const now = Date.now();
        taps.current = [...taps.current.filter((t) => now - t < 3000), now];
        if (taps.current.length >= 5) {
          taps.current = [];
          setOpen(true);
        }
      }}
    />
  );
}
