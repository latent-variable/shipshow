// The overlap check (bin/overlap.mjs, D72) on a page made for it: text on text is found, text under a full-frame
// cover is not, text under a cover's faded edge is, and the exemptions hold. Needs a Chrome (skipped without one).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { overlaps } from "../bin/overlap.mjs";
import { chromePath } from "../bin/shot.mjs";

let chrome = true;
try { chromePath(); } catch { chrome = false; }

const at = (x, y, text, attrs = "") => `<div ${attrs} style="position: absolute; left: ${x}px; top: ${y}px; font: 40px sans-serif; white-space: nowrap">${text}</div>`;

test("overlaps: text on text is found, a full-frame cover hides, its faded edge does not, exemptions hold", { skip: !chrome && "no Chrome" }, async () => {
  const dir = mkdtempSync(join(tmpdir(), "shipshow-overlap-"));
  writeFileSync(join(dir, "timing.json"), JSON.stringify({ total: 10, scenes: [{ id: "s1", start: 0, duration: 10, sentences: [] }] }));
  writeFileSync(join(dir, "index.html"), `<!doctype html><html><body style="margin: 0; width: 1920px; height: 1080px; position: relative; overflow: hidden">
<section data-scene="s1">
  <span data-at="1"></span><span data-at="6"></span>
  ${at(100, 100, "first words here")}${at(110, 110, "second words over")}
  ${at(100, 300, "a label on purpose", 'data-overlap="ok"')}${at(110, 310, "over a label")}
  <div style="position: absolute; left: 100px; top: 500px; font: 80px sans-serif; letter-spacing: -0.3em"><span>W</span><span>W</span></div>
  <figure style="position: absolute; left: 1000px; top: 100px; margin: 0">${at(0, 0, "a meme's words")}${at(5, 5, "on its own picture")}</figure>
  <div style="position: absolute; left: 1000px; top: 500px; transform: rotate(-6deg)">${at(0, 0, "tilted line one is rather long indeed")}${at(0, 48, "tilted line two is rather long indeed")}</div>
  <div style="position: absolute; left: 1000px; top: 300px; transform: rotate(5deg)"><div style="transform: translateX(4px)">${at(0, 0, "nested line one is rather long too")}${at(0, 48, "nested line two is rather long too")}</div></div>
  <div style="position: absolute; left: 1000px; top: 700px; transform: rotate(-4deg)">${at(0, 0, "tilted collide one")}${at(10, 10, "tilted collide two")}</div>
  ${at(100, 960, "under the faded edge")}
  <div id="scrim" style="display: none; position: absolute; inset: 0; z-index: 5; background: rgba(0, 0, 0, 0.8); mask-image: linear-gradient(to bottom, #000 80%, transparent 100%)">${at(100, 950, "the meme's last line")}</div>
</section>
<script>window.__timelines = { main: { pause() {}, seek(t) { document.getElementById("scrim").style.display = t > 5 ? "block" : "none"; } } };</script>
</body></html>`);
  const found = await overlaps(dir);
  const pairs = found.map((o) => `${o.a} | ${o.b} | ${o.from}-${o.to}`).sort();
  assert.deepEqual(pairs, [
    // Seen at 1.8 s; at 6.8 s the scrim's solid part covers both, so the overlap ends there.
    "first words here | second words over | 1.8-1.8",
    // Two lines that truly collide on a tilted card are found, measured untilted; two separate lines on one are not.
    "tilted collide one | tilted collide two | 1.8-1.8",
    // The scrim's faded bottom lets the line under it show through its own line, from 6.8 s to the scene's end.
    "under the faded edge | the meme's last line | 6.8-9.6",
  ]);
});

test("overlaps: persistent frame text colliding with scene text is measured", { skip: !chrome && "no Chrome" }, async () => {
  const dir = mkdtempSync(join(tmpdir(), "shipshow-frame-overlap-"));
  writeFileSync(join(dir, "timing.json"), JSON.stringify({ total: 5, scenes: [{ id: "s1", start: 0, duration: 5, sentences: [] }] }));
  writeFileSync(join(dir, "index.html"), `<!doctype html><html><body style="margin: 0">
<section data-scene="s1">${at(100, 100, "Scene words")}</section>
<div id="frame" style="position: absolute; inset: 0; z-index: 1; pointer-events: none"><div class="ss-frame">${at(100, 100, "Series plate")}</div></div>
<script>window.__timelines = { main: { pause() {}, seek() {} } };</script></body></html>`);
  const found = await overlaps(dir);
  assert.equal(found.length, 1);
  assert.equal(found[0].scene, "s1");
  assert.deepEqual([found[0].a, found[0].b], ["Scene words", "Series plate"]);
});
