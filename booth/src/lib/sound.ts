// Howler is wired but the lounge is silent: sound is off by default and
// only the facilitator can enable it. Cues are tiny generated data URIs so
// the bundle stays fully offline.

import { Howl, Howler } from "howler";

let enabled = false;

// A short, very quiet sine tick generated as a wav data URI at module load
function makeTick(freq: number, ms: number): string {
  const rate = 22050;
  const n = Math.floor((rate * ms) / 1000);
  const data = new Uint8Array(44 + n * 2);
  const view = new DataView(data.buffer);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) data[off + i] = s.charCodeAt(i);
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + n * 2, true);
  writeStr(8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    const t = i / rate;
    const env = Math.exp(-t * 26);
    const v = Math.sin(2 * Math.PI * freq * t) * env * 0.18;
    view.setInt16(44 + i * 2, Math.floor(v * 32767), true);
  }
  let bin = "";
  for (let i = 0; i < data.length; i++) bin += String.fromCharCode(data[i]);
  return `data:audio/wav;base64,${btoa(bin)}`;
}

const cues: Record<string, Howl> = {};

function ensureCues() {
  if (cues.touch) return;
  cues.touch = new Howl({ src: [makeTick(520, 90)], format: ["wav"], volume: 0.5 });
  cues.flip = new Howl({ src: [makeTick(300, 220)], format: ["wav"], volume: 0.5 });
  cues.note = new Howl({ src: [makeTick(660, 140)], format: ["wav"], volume: 0.5 });
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
  Howler.mute(!on);
  if (on) ensureCues();
}

export function playCue(name: "touch" | "flip" | "note") {
  if (!enabled) return;
  ensureCues();
  cues[name]?.play();
}
