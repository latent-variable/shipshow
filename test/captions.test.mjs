// Karaoke captions: a word not yet spoken waits at --cap-wait's opacity (0.38 when unset), so a video or a team's
// theme can raise it to meet a contrast bar (D76). Builds the template with the signal theme (karaoke) and reads a
// waiting word in headless Chrome; skipped without one.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";
import { REPO } from "../bin/lib.mjs";
import { chromePath } from "../bin/shot.mjs";

let chrome = true;
try { chromePath(); } catch { chrome = false; }

async function waitingOpacity(style) {
  const dir = join(mkdtempSync(join(tmpdir(), "kx-caps-")), "demo");
  cpSync(join(REPO, "template"), dir, { recursive: true });
  const cfg = JSON.parse(readFileSync(join(dir, "video.json"), "utf8"));
  writeFileSync(join(dir, "video.json"), JSON.stringify({ ...cfg, theme: "signal" }));
  writeFileSync(join(dir, "scenes.html"), style + readFileSync(join(dir, "scenes.html"), "utf8"));
  writeFileSync(join(dir, "timing.json"), JSON.stringify({ total: 9, scenes: [
    { id: "01-intro", start: 0, duration: 4, sentences: [{ text: "This is the first scene. Each sentence is voiced on its own.", start: 0.5, duration: 3 }] },
    { id: "02-idea", start: 4, duration: 5, sentences: [{ text: "This is the second scene.", start: 4.5, duration: 2 }, { text: "A box appears when the voice says box.", start: 7, duration: 1.5 }] },
  ] }));
  mkdirSync(join(dir, "assets"), { recursive: true });
  execFileSync(process.execPath, [join(REPO, "bin", "build.mjs"), dir]);
  const { default: puppeteer } = await import("puppeteer-core");
  const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ["--allow-file-access-from-files"] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(pathToFileURL(join(dir, "index.html")).href, { waitUntil: "load" });
    return await page.evaluate(() => {
      const tl = window.__timelines.main;
      tl.seek(4.52, false);
      const cap = [...document.querySelectorAll(".cap")].find((c) => +c.dataset.start <= 4.52 && 4.52 < +c.dataset.start + +c.dataset.duration);
      const words = [...cap.querySelectorAll(".w")];
      return +getComputedStyle(words[words.length - 1]).opacity;   // "scene." is not yet spoken at 4.52 s
    });
  } finally {
    await browser.close();
  }
}

test("a word not yet spoken waits at 0.38, or at --cap-wait when a video sets it", { skip: !chrome && "no Chrome" }, async () => {
  assert.equal(await waitingOpacity(""), 0.38);
  assert.equal(await waitingOpacity("<style>#root { --cap-wait: 0.62; }</style>\n"), 0.62);
});
