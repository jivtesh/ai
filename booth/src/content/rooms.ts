// Structural configuration per room. Copy itself lives in i18n/strings.ts.

export type RoomSlug =
  | "legal"
  | "procurement"
  | "resident-coordinator"
  | "humanitarian"
  | "chief-of-staff";

export const ROOM_ORDER: RoomSlug[] = [
  "legal",
  "procurement",
  "resident-coordinator",
  "humanitarian",
  "chief-of-staff",
];

export interface DayBlock {
  // start and end as hours, 7 to 19
  start: number;
  end: number;
  kind: "routine" | "human";
}

export interface RoomConfig {
  slug: RoomSlug;
  index: number; // 1-based room number
  // hue accent used by the room's beat, within the shared palette
  accent: "future" | "gold";
  // day-strip content: NOW is dense routine, NEXT is few human blocks
  nowBlocks: DayBlock[];
  nextHumanBlocks: DayBlock[];
  nextAgentBlocks: DayBlock[];
}

// Deterministic pseudo-random generator so the strips are stable per room
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function denseDay(seed: number): DayBlock[] {
  const rnd = mulberry32(seed);
  const blocks: DayBlock[] = [];
  let t = 7 + rnd() * 0.4;
  while (t < 18.7) {
    const len = 0.35 + rnd() * 0.85;
    const end = Math.min(t + len, 19);
    blocks.push({ start: t, end, kind: rnd() < 0.16 ? "human" : "routine" });
    t = end + 0.06 + rnd() * 0.22;
  }
  return blocks;
}

function humanDay(seed: number): DayBlock[] {
  const rnd = mulberry32(seed);
  const anchors = [8.4, 11.2, 14.4, 16.9];
  return anchors.map((a, i) => {
    const start = a + (rnd() - 0.5) * 0.7;
    const cap = i < anchors.length - 1 ? anchors[i + 1] - 0.55 : 19;
    const end = Math.min(start + 1.5 + rnd() * 1.1, cap);
    return { start, end, kind: "human" as const };
  });
}

function agentRail(seed: number): DayBlock[] {
  const rnd = mulberry32(seed);
  const blocks: DayBlock[] = [];
  let t = 7 + rnd() * 0.3;
  while (t < 18.8) {
    const len = 0.5 + rnd() * 1.1;
    const end = Math.min(t + len, 19);
    blocks.push({ start: t, end, kind: "routine" });
    t = end + 0.1 + rnd() * 0.25;
  }
  return blocks;
}

function room(slug: RoomSlug, index: number, accent: "future" | "gold"): RoomConfig {
  const seed = 1000 + index * 77;
  return {
    slug,
    index,
    accent,
    nowBlocks: denseDay(seed),
    nextHumanBlocks: humanDay(seed + 5),
    nextAgentBlocks: agentRail(seed + 9),
  };
}

export const ROOMS: Record<RoomSlug, RoomConfig> = {
  legal: room("legal", 1, "future"),
  procurement: room("procurement", 2, "gold"),
  "resident-coordinator": room("resident-coordinator", 3, "future"),
  humanitarian: room("humanitarian", 4, "future"),
  "chief-of-staff": room("chief-of-staff", 5, "gold"),
};

export type PillarId = "skills" | "governance" | "data" | "operating-model" | "partnerships";

export const PILLARS: PillarId[] = ["skills", "governance", "data", "operating-model", "partnerships"];

// Which rooms each pillar made possible: threads drawn on the choice screen
export const PILLAR_ROOMS: Record<PillarId, RoomSlug[]> = {
  skills: ["legal", "procurement", "chief-of-staff"],
  governance: ["legal", "procurement", "humanitarian"],
  data: ["resident-coordinator", "humanitarian", "chief-of-staff"],
  "operating-model": ["procurement", "resident-coordinator", "chief-of-staff"],
  partnerships: ["resident-coordinator", "humanitarian", "legal"],
};
