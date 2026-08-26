// 10-second frame-time probe on attract and the Procurement flip.

import { spawn, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const EXECUTABLE =
  process.env.CHROMIUM_PATH ||
  (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);

if (!existsSync(path.join(root, "dist"))) {
  execSync("npx vite build", { cwd: root, stdio: "inherit" });
}

const preview = spawn("npx", ["vite", "preview", "--port", "4173", "--strictPort"], {
  cwd: root,
  stdio: "ignore",
  detached: true,
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function probe(page, label, seconds = 10) {
  const result = await page.evaluate(
    (secs) =>
      new Promise((resolve) => {
        const times = [];
        let last = performance.now();
        const end = last + secs * 1000;
        const tick = (now) => {
          times.push(now - last);
          last = now;
          if (now < end) requestAnimationFrame(tick);
          else resolve(times);
        };
        requestAnimationFrame(tick);
      }),
    seconds,
  );
  const sorted = [...result].sort((a, b) => a - b);
  const avg = result.reduce((a, b) => a + b, 0) / result.length;
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  const fps = 1000 / avg;
  console.log(
    `${label}: ${fps.toFixed(1)} fps avg, frame avg ${avg.toFixed(1)}ms, p95 ${p95.toFixed(1)}ms, p99 ${p99.toFixed(1)}ms, frames ${result.length}`,
  );
}

try {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch("http://localhost:4173/");
      if (res.ok) break;
    } catch {
      // not up yet
    }
    await sleep(400);
  }

  const browser = await chromium.launch({
    executablePath: EXECUTABLE,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto("http://localhost:4173/#/attract");
  await sleep(3000);
  await probe(page, "attract");

  await page.evaluate(() => window.__booth.goto("room", "procurement"));
  await sleep(1500);
  const flipProbe = probe(page, "procurement flip window");
  // keep flipping during the probe so the choreography stays hot
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.__booth.flip("procurement"));
    await sleep(3200);
  }
  await flipProbe;

  await browser.close();
} finally {
  try {
    process.kill(-preview.pid, "SIGTERM");
  } catch {
    preview.kill();
  }
  setTimeout(() => process.exit(0), 300).unref();
}
