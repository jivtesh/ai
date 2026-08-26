// Generates the placeholder background plates: lit gradients, film grain,
// large soft silhouettes. Drawn in Chromium and saved as webp so the app
// ships with designed plates and zero runtime cost. Real AI plates drop
// into the same paths with no code changes (see IMAGE-PROMPTS.md).

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const EXECUTABLE =
  process.env.CHROMIUM_PATH ||
  (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);

// Painter runs inside the browser. One 1920x1080 canvas per slug.
const painterSource = `
function paint(slug) {
  const W = 1920, H = 1080;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d");

  const rnd = (() => { let a = 1234 + slug.length * 77; return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();

  // base: ink gradient
  const base = x.createLinearGradient(0, 0, 0, H);
  base.addColorStop(0, "#0d1119");
  base.addColorStop(0.55, "#0b0f16");
  base.addColorStop(1, "#070a10");
  x.fillStyle = base;
  x.fillRect(0, 0, W, H);

  const glow = (gx, gy, r, rgba) => {
    const g = x.createRadialGradient(gx, gy, 0, gx, gy, r);
    g.addColorStop(0, rgba);
    g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g;
    x.fillRect(gx - r, gy - r, r * 2, r * 2);
  };

  const silhouette = (points, fill) => {
    x.fillStyle = fill;
    x.beginPath();
    points.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py)));
    x.closePath();
    x.fill();
  };

  if (slug === "legal") {
    glow(1420, 300, 700, "rgba(46, 155, 214, 0.10)");
    glow(420, 860, 800, "rgba(91, 100, 112, 0.10)");
    // tall shelf silhouettes
    for (let i = 0; i < 7; i++) {
      const sx = 60 + i * 150 + rnd() * 30;
      x.fillStyle = "rgba(4, 6, 10, " + (0.5 + rnd() * 0.3) + ")";
      x.fillRect(sx, 90 + rnd() * 60, 104, H);
      for (let s = 0; s < 8; s++) {
        x.fillStyle = "rgba(46, 155, 214, " + (0.025 + rnd() * 0.03) + ")";
        x.fillRect(sx + 8, 170 + s * 108 + rnd() * 10, 88, 7);
      }
    }
    // arched window light, far right
    glow(1620, 420, 460, "rgba(140, 190, 226, 0.12)");
    x.fillStyle = "rgba(4, 6, 10, 0.72)";
    x.fillRect(1380, 0, 90, H);
  }

  if (slug === "procurement") {
    glow(1500, 260, 640, "rgba(217, 164, 65, 0.10)");
    glow(360, 240, 560, "rgba(91, 100, 112, 0.12)");
    // racking silhouettes receding
    for (let i = 0; i < 5; i++) {
      const sx = 120 + i * 360;
      const top = 200 + i * 26;
      x.fillStyle = "rgba(4, 6, 10, " + (0.62 - i * 0.06) + ")";
      x.fillRect(sx, top, 34, H - top);
      x.fillRect(sx + 240, top, 34, H - top);
      for (let s = 0; s < 4; s++) {
        x.fillRect(sx, top + 90 + s * 170, 274, 18);
      }
    }
    // hanging lamps
    for (let i = 0; i < 3; i++) {
      const lx = 420 + i * 480;
      x.strokeStyle = "rgba(4, 6, 10, 0.9)";
      x.lineWidth = 3;
      x.beginPath(); x.moveTo(lx, 0); x.lineTo(lx, 120 + i * 8); x.stroke();
      glow(lx, 150 + i * 8, 220, "rgba(226, 190, 120, 0.14)");
    }
  }

  if (slug === "resident-coordinator") {
    // wide window with the Kestrel horizon
    glow(960, 430, 900, "rgba(46, 155, 214, 0.10)");
    // sea line
    x.fillStyle = "rgba(46, 155, 214, 0.06)";
    x.fillRect(200, 470, 1520, 240);
    // island ridge silhouette (fictional Kestrel, no real geography)
    const ridge = [[200, 560]];
    for (let px = 200; px <= 1720; px += 60) {
      ridge.push([px, 560 - Math.sin((px - 200) * 0.004) * 60 - rnd() * 40]);
    }
    ridge.push([1720, 560], [1720, 640], [200, 640]);
    silhouette(ridge, "rgba(6, 9, 14, 0.85)");
    // mullions
    x.fillStyle = "rgba(4, 6, 10, 0.9)";
    for (let i = 0; i < 5; i++) x.fillRect(200 + i * 380, 220, 18, 560);
    x.fillRect(200, 220, 1520, 14);
    x.fillRect(200, 766, 1520, 14);
    glow(500, 900, 500, "rgba(91, 100, 112, 0.08)");
  }

  if (slug === "humanitarian") {
    glow(1360, 720, 760, "rgba(46, 155, 214, 0.08)");
    glow(500, 200, 600, "rgba(91, 100, 112, 0.10)");
    // terrain ridges
    for (let r = 0; r < 4; r++) {
      const baseY = 480 + r * 130;
      const pts = [[0, H]];
      for (let px = 0; px <= W; px += 80) {
        pts.push([px, baseY + Math.sin(px * 0.003 + r * 2.1) * 70 + rnd() * 30]);
      }
      pts.push([W, H]);
      silhouette(pts, "rgba(5, 7, 11, " + (0.45 + r * 0.13) + ")");
    }
    // ops tent glow on the ridge
    glow(430, 560, 200, "rgba(226, 190, 120, 0.16)");
    silhouette([[350, 570], [430, 500], [510, 570]], "rgba(4, 6, 10, 0.9)");
  }

  if (slug === "chief-of-staff") {
    // tall window blinds: bands of late light
    glow(1240, 420, 820, "rgba(217, 164, 65, 0.12)");
    for (let i = 0; i < 9; i++) {
      x.fillStyle = "rgba(226, 190, 130, " + (0.035 + rnd() * 0.03) + ")";
      x.fillRect(880 + i * 104, 80, 44, 800);
    }
    x.fillStyle = "rgba(4, 6, 10, 0.8)";
    x.fillRect(820, 0, 26, H);
    // long table silhouette
    silhouette([[120, 900], [1500, 880], [1560, 1080], [80, 1080]], "rgba(4, 6, 10, 0.85)");
    glow(430, 320, 420, "rgba(91, 100, 112, 0.10)");
  }

  if (slug === "attract") {
    glow(960, 500, 900, "rgba(46, 155, 214, 0.10)");
    glow(300, 200, 500, "rgba(91, 100, 112, 0.10)");
    glow(1620, 830, 560, "rgba(217, 164, 65, 0.07)");
  }

  // film grain
  const noise = x.createImageData(W, H);
  for (let i = 0; i < noise.data.length; i += 4) {
    const v = 118 + Math.floor(rnd() * 20);
    noise.data[i] = v; noise.data[i + 1] = v; noise.data[i + 2] = v;
    noise.data[i + 3] = Math.floor(rnd() * 18);
  }
  const nc = document.createElement("canvas");
  nc.width = W; nc.height = H;
  nc.getContext("2d").putImageData(noise, 0, 0);
  x.globalCompositeOperation = "overlay";
  x.drawImage(nc, 0, 0);
  x.globalCompositeOperation = "source-over";

  // vignette baked lightly into the plate
  const v = x.createRadialGradient(960, 480, 300, 960, 540, 1150);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(3, 4, 7, 0.55)");
  x.fillStyle = v;
  x.fillRect(0, 0, W, H);

  return c.toDataURL("image/webp", 0.88);
}
`;

const SLUGS = [
  "legal",
  "procurement",
  "resident-coordinator",
  "humanitarian",
  "chief-of-staff",
  "attract",
];

const browser = await chromium.launch({ executablePath: EXECUTABLE, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setContent("<html><body></body></html>");
await page.addScriptTag({ content: painterSource });

for (const slug of SLUGS) {
  const dataUrl = await page.evaluate((s) => paint(s), slug);
  const b64 = dataUrl.split(",")[1];
  const dir = path.join(root, "public", "scenes", slug);
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "bg.webp");
  writeFileSync(file, Buffer.from(b64, "base64"));
  console.log("wrote", path.relative(root, file), `${Math.round(Buffer.from(b64, "base64").length / 1024)}KB`);
}

await browser.close();
