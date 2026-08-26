// Registry of per-room data beats. Each is a component filling its stage.

import type { ComponentType } from "react";
import type { RoomSlug } from "../content/rooms";
import ProcurementBeat from "./procurement";
import LegalBeat from "./legal";
import ResidentBeat from "./resident";
import HumanitarianBeat from "./humanitarian";
import ChiefBeat from "./chief";

export interface BeatProps {
  flipped: boolean;
}

export const BEATS: Record<RoomSlug, ComponentType<BeatProps>> = {
  legal: LegalBeat,
  procurement: ProcurementBeat,
  "resident-coordinator": ResidentBeat,
  humanitarian: HumanitarianBeat,
  "chief-of-staff": ChiefBeat,
};
