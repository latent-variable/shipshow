import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { REPO } from "../bin/lib.mjs";
import { liftFrames } from "../bin/frame.mjs";

function build(frame) {
  const dir = mkdtempSync(join(tmpdir(), "shipshow-frame-"));
  writeFileSync(join(dir, "video.json"), JSON.stringify({ title: "Frame test", sfx: false }));
  writeFileSync(join(dir, "logo.png"), "");   // the picture the frame draws: build stops on a missing one (D87)
  writeFileSync(join(dir, "timing.json"), JSON.stringify({ total: 10, scenes: [
    { id: "01-a", start: 0, duration: 5, sentences: [{ text: "Hello.", start: 1, duration: 2 }] },
    { id: "02-x", start: 5, duration: 5, sentences: [{ text: "word word.", start: 6, duration: 2, words: [{ w: "word", at: 6 }, { w: "word.", at: 7 }] }] },
  ] }));
  writeFileSync(join(dir, "scenes.html"), `<style>.plate { color: var(--ink); }</style>
<section data-scene="01-a"><div>First scene</div></section>${frame}
<section data-scene="02-x"><div id="reference" data-cue="word">Second scene</div></section><script>window.frameTest = true;</script>`);
  const r = spawnSync(process.execPath, [join(REPO, "bin/build.mjs"), dir], { encoding: "utf8" });
  return { ...r, html: r.status === 0 ? readFileSync(join(dir, "index.html"), "utf8") : "" };
}

test("top-level frames are lifted in order outside every scene, with the scene's exact cue times", () => {
  const r = build(`<div class="ss-frame"><div class="plate">Logo<img src="logo.png"></div>
<div id="price" data-cue="02-x:word" data-anim="pop" data-leave="02-x:+3">Price</div>
<span data-cue="02-x:word#2">Later</span><span data-cue="02-x:+0.3">Offset</span></div>
<div class='ss-frame extra'>Rule</div>`);
  assert.equal(r.status, 0, r.stderr);
  const layer = r.html.match(/<div id="frame">([\s\S]*?)\n      <div class="caps">/);
  assert.ok(layer, "the built page must contain the lifted frame layer");
  const frame = layer[1];
  assert.match(frame, /Logo[\s\S]*Price[\s\S]*Rule/);
  assert.equal((frame.match(/class=["']ss-frame/g) || []).length, 2);
  for (const section of r.html.matchAll(/<section\b[\s\S]*?<\/section>/g)) assert.doesNotMatch(section[0], /ss-frame|Logo|Price|Rule/);
  const reference = r.html.match(/id="reference" data-cue="word" data-at="([^"]+)"/)[1];
  assert.match(frame, new RegExp(`id="price" data-cue="02-x:word" data-at="${reference}"`));
  assert.equal(+reference, 5.85);
  assert.match(frame, /data-cue="02-x:word#2" data-at="6.85"/);
  assert.match(frame, /data-cue="02-x:\+0.3" data-at="5.3"/);
  assert.match(frame, /data-leave="02-x:\+3" data-leave-at="8"/);
  assert.match(r.html, /window.frameTest = true/);
});

for (const [cue, message] of [["word", /scene-qualified/], ["missing:word", /unknown scene missing/]]) {
  test(`frame rejects ${cue}, naming the element`, () => {
    const r = build(`<div class="ss-frame"><div id="bad-price" data-cue="${cue}">Price</div></div>`);
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /frame element <div id="bad-price"/);
    assert.match(r.stderr, message);
  });
}

test("frame extraction ignores nested frames, comments and raw styles/scripts and balances nested tags", () => {
  const raw = `<style>.x:after { content: '<div class="ss-frame">'; }</style><script>const s = '<div>';</script><!-- <div> -->`;
  const nested = `<section data-scene="a"><div class="ss-frame">Nested</div></section>`;
  const frame = `<div class="ss-frame" title="x > y"><div><hr>Plate</div></div>`;
  assert.deepEqual(liftFrames(raw + frame + nested, () => 0), { scenes: raw + nested, frames: frame });
});

test("kit scene toggling and camera leave the frame visible; frame entrances and exits use the shared timeline", () => {
  const plate = { dataset: {} }, price = { dataset: { at: "5.85", anim: "pop", leaveAt: "8" } };
  const frame = { children: [plate, price] };
  const inner = {}, cam = {};
  inner.querySelector = () => cam;
  const scene = { dataset: { start: "0", duration: "5", transition: "slide", camera: "push" }, querySelector: () => inner };
  const calls = [], tl = {};
  for (const verb of ["to", "fromTo", "set"]) tl[verb] = (target, ...args) => { calls.push({ verb, target, args }); return tl; };
  const ctx = { TOTAL: 10, SEED: 1, window: {}, console,
    gsap: { timeline: () => tl, set: (target, vars) => calls.push({ verb: "set", target, args: [vars] }) },
    document: {
      getElementById: () => ({}),
      querySelectorAll: (s) => ({ "section.scene": [scene], "[data-at]": [price], "#frame [data-leave-at]": [price] }[s] || []),
    },
    getComputedStyle: () => ({ getPropertyValue: () => "" }),
  };
  runInNewContext(readFileSync(join(REPO, "kit/kit.js"), "utf8"), ctx);
  assert.ok(calls.some((c) => c.target === inner && c.args[0].opacity === 0), "scene really toggles");
  assert.ok(calls.some((c) => c.target === cam && c.args[1]?.scale === 1.04), "camera really pushes");
  assert.ok(!calls.some((c) => c.target === frame || c.target === plate), "uncued frame stays visible from zero through every cut");
  assert.ok(calls.some((c) => c.target === price && c.verb === "to" && c.args[1] === 5.85), "normal pop entrance");
  assert.ok(calls.some((c) => c.target === price && c.verb === "fromTo" && c.args[1].opacity === 0 && c.args[1].duration === 0.4 && c.args[2] === 8), "fade starts at leave time");
});
