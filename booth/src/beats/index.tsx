// Registry of per-room data beats. Each is a component filling its stage.

import type { ComponentType } from "react";
import type { RoomSlug } from "../content/rooms";
import ProcurementBeat from "./procurement";
import MiniBeat from "../components/MiniBeat";

export interface BeatProps {
  flipped: boolean;
}

// Temporary stand-in until a room's bespoke beat lands in M5.
function PlaceholderBeat({ slug }: { slug: RoomSlug }) {
  return (
    <div style={{ position: "absolute", inset: "6%" }}>
      <MiniBeat slug={slug} />
    </div>
  );
}

const legal = (p: BeatProps) => <PlaceholderBeat slug="legal" {...p} />;
const resident = (p: BeatProps) => <PlaceholderBeat slug="resident-coordinator" {...p} />;
const humanitarian = (p: BeatProps) => <PlaceholderBeat slug="humanitarian" {...p} />;
const chief = (p: BeatProps) => <PlaceholderBeat slug="chief-of-staff" {...p} />;

export const BEATS: Record<RoomSlug, ComponentType<BeatProps>> = {
  legal,
  procurement: ProcurementBeat,
  "resident-coordinator": resident,
  humanitarian,
  "chief-of-staff": chief,
};
