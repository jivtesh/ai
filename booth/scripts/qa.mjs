// QA screenshot pass. Builds if needed, boots vite preview, drives every
// state with Playwright, saves numbered PNGs to /qa.
// Flags: --skip-build reuses dist, --uhd adds a 3840x2160 set.

import { spawn, execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const qaDir = path.join(root, "qa");
const skipBuild = process.argv.includes("--skip-build");
const uhd = process.argv.includes("--uhd");

const EXECUTABLE =
  process.env.CHROMIUM_PATH ||
  (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);

if (!skipBuild || !existsSync(path.join(root, "dist"))) {
  console.log("building...");
  execSync("npx vite build", { cwd: root, stdio: "inherit" });
}

mkdirSync(qaDir, { recursive: true });
for (const f of readdirSync(qaDir)) {
  if (f.endsWith(".png")) unlinkSync(path.join(qaDir, f));
}

const preview = spawn("npx", ["vite", "preview", "--port", "4173", "--strictPort"], {
  cwd: root,
  stdio: "ignore",
  detached: true,
});

const waitForServer = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch("http://localhost:4173/");
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error("vite preview did not start");
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let shot = 0;
async function snap(page, name, suffix = "") {
  shot += 1;
  const file = path.join(qaDir, `${String(shot).padStart(2, "0")}-${name}${suffix}.png`);
  await page.screenshot({ path: file });
  console.log("  ", path.basename(file));
}

async function drive(page, suffix = "") {
  const goto = async (hash, settle = 1800) => {
    await page.evaluate((h) => {
      window.__booth.goto(...h);
    }, hash);
    await sleep(settle);
  };

  // localStorage flags that would interfere with a clean run
  await page.goto("http://localhost:4173/#/attract");
  await page.evaluate(() => {
    localStorage.removeItem("booth.wall.v2");
    localStorage.removeItem("booth.kiosk.v2");
  });
  await page.reload();
  await sleep(3600); // full headline choreography
  await snap(page, "attract", suffix);

  await goto(["greeter"], 2200);
  await snap(page, "greeter", suffix);

  await goto(["gallery"], 2200);
  await snap(page, "gallery", suffix);

  const rooms = await page.evaluate(() => window.__booth.state().rooms);
  for (const slug of rooms) {
    await goto(["room", slug], 2000);
    await snap(page, `room-${slug}-now`, suffix);
    await page.evaluate((s) => window.__booth.flip(s, true), slug);
    await sleep(1050);
    await snap(page, `room-${slug}-midflip`, suffix);
    await sleep(2200);
    await snap(page, `room-${slug}-next`, suffix);
  }

  await goto(["choice"], 2200);
  await snap(page, "choice-untouched", suffix);
  await page.evaluate(() => window.__booth.touchAllPillars());
  await sleep(2600);
  await snap(page, "choice-all-lit", suffix);

  await goto(["why"], 2600);
  await snap(page, "why", suffix);

  await page.evaluate(() => window.__booth.seedWall(6));
  await goto(["wall"], 3000);
  await snap(page, "wall", suffix);

  await page.evaluate(() => window.__booth.openFacilitator());
  await sleep(900);
  await snap(page, "facilitator", suffix);
  await page.evaluate(() => window.__booth.clearWall());
}

try {
  await waitForServer();
  const browser = await chromium.launch({
    executablePath: EXECUTABLE,
    args: ["--no-sandbox", "--force-color-profile=srgb", "--disable-gpu-vsync"],
  });

  console.log("1920x1080 pass");
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await drive(page);
  await page.close();

  if (uhd) {
    console.log("3840x2160 pass");
    const page4k = await browser.newPage({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 2,
    });
    await drive(page4k, "-4k");
    await page4k.close();
  }

  await browser.close();
  console.log(`done: ${shot} screenshots in qa/`);
} finally {
  try {
    process.kill(-preview.pid, "SIGTERM");
  } catch {
    preview.kill();
  }
  setTimeout(() => process.exit(0), 300).unref();
}
