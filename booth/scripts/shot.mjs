// Quick single-state screenshot for iterating on one screen.
// Usage: node scripts/shot.mjs <hash-path> [outfile] [waitMs] [--eval "js"]
// Example: node scripts/shot.mjs /demo qa/demo.png 2500

import { spawn, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const evalIdx = args.indexOf("--eval");
const evalJs = evalIdx >= 0 ? args[evalIdx + 1] : null;
if (evalIdx >= 0) args.splice(evalIdx, 2);
const skipBuild = args.includes("--skip-build");
if (skipBuild) args.splice(args.indexOf("--skip-build"), 1);
const [hashPath = "/attract", outfile = "qa/shot.png", waitMs = "2500", evalWaitMs = "1200"] = args;

const EXECUTABLE =
  process.env.CHROMIUM_PATH ||
  (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);

if (!skipBuild) execSync("npx vite build --logLevel error", { cwd: root, stdio: "inherit" });

const preview = spawn("npx", ["vite", "preview", "--port", "4174", "--strictPort"], {
  cwd: root,
  stdio: "ignore",
  detached: true,
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch("http://localhost:4174/");
      if (res.ok) break;
    } catch {
      // not up yet
    }
    await sleep(300);
  }
  const browser = await chromium.launch({ executablePath: EXECUTABLE, args: ["--no-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(`http://localhost:4174/#${hashPath}`);
  await sleep(Number(waitMs));
  if (evalJs) {
    await page.evaluate(evalJs);
    await sleep(Number(evalWaitMs));
  }
  await page.screenshot({ path: path.join(root, outfile) });
  console.log("saved", outfile);
  await browser.close();
} finally {
  try {
    process.kill(-preview.pid, "SIGTERM");
  } catch {
    preview.kill();
  }
  setTimeout(() => process.exit(0), 300).unref();
}
