import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { REPO, musicBed, readWav, themeCss, writeWav } from "../bin/lib.mjs";
import { resolveMoods } from "../bin/moods.mjs";

const scratch = () => mkdtempSync(join(tmpdir(), "shipshow-moods-"));
const timing = { total: 16, scenes: [0, 4, 8, 12].map((start, i) => ({ id: `s${i}`, start, duration: 4, sentences: [] })) };
const source = '<section data-scene="s0"></section><section data-scene="s1" data-mood="history"></section><section data-scene="s2"></section><section data-scene="s3" data-mood="night"></section>';

test("moods follow timing, carry forward, and reset absent tokens to the base", () => {
  const dir = scratch();
  const cfg = { flair: { ambient: "glow" }, moods: { history: { theme: "paper", look: { "--accent": "#aabbcc" } }, night: { look: { "--ink": "#ffffff" }, ambient: "stars glow" } } };
  const { moods } = resolveMoods(cfg, timing, source, themeCss("shipshow", dir), dir);
  assert.deepEqual(moods.map((m) => [m.name, m.start]), [[null, 0], ["history", 4], ["night", 12]]);
  assert.equal(moods[1].tokens["--accent"], "#aabbcc");
  assert.equal(moods[1].tokens["--sky"], "#f6f1e7");
  assert.equal(moods[2].tokens["--accent"], moods[0].tokens["--accent"]);
  assert.equal(moods[2].tokens["--sky"], "");
  assert.equal(moods[1].ambient, undefined, "theme ambient does not replace the base ambient");
  assert.equal(moods[2].ambient, "stars glow");
  cfg.moods.history.look["--sky"] = "linear-gradient(#000000, #112233)";
  const customSky = resolveMoods(cfg, timing, source, themeCss("shipshow", dir), dir);
  assert.equal(customSky.moods[1].tokens["--sky"], cfg.moods.history.look["--sky"]);
  const same = resolveMoods(cfg, timing, source.replace('data-scene="s2"', 'data-scene="s2" data-mood="history"'), themeCss("shipshow", dir), dir);
  assert.equal(same.moods.length, 3, "naming the active mood does not restart it");
});

test("unknown mood stops the build with the scene name", () => {
  const dir = scratch();
  writeFileSync(join(dir, "video.json"), JSON.stringify({ title: "test", sfx: false }));
  writeFileSync(join(dir, "timing.json"), JSON.stringify(timing));
  writeFileSync(join(dir, "scenes.html"), source);
  const r = spawnSync(process.execPath, [join(REPO, "bin/build.mjs"), dir], { encoding: "utf8" });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /scene s1: unknown data-mood="history"/);
});

test("mood theme fonts and assets are namespaced, leaving the base theme path alone", () => {
  const dir = scratch(), local = scratch();
  const theme = join(local, "themes", "test-font");
  mkdirSync(theme, { recursive: true });
  writeFileSync(join(theme, "font.woff2"), "font fixture");
  writeFileSync(join(theme, "theme.css"), '@font-face {font-family:Demo;src:url("font.woff2")} :root {--font:Demo;--bg:#123456;}');
  const previous = process.env.SHIPSHOW_LOCAL;
  process.env.SHIPSHOW_LOCAL = local;
  try {
    const cfg = { moods: { history: { theme: "test-font" }, night: {} } };
    const { moods, fonts } = resolveMoods(cfg, timing, source, ":root {--bg:#ffffff;}", dir);
    assert.match(fonts, /url\("assets\/theme\/test-font\/font.woff2"\)/);
    assert.doesNotMatch(fonts, /:root/);
    assert.equal(readFileSync(join(dir, "assets/theme/test-font/font.woff2"), "utf8"), "font fixture");
    assert.equal(moods[1].tokens["--font"], "Demo");
    assert.match(themeCss("test-font", dir), /url\("assets\/theme\/font.woff2"\)/);
  } finally {
    if (previous === undefined) delete process.env.SHIPSHOW_LOCAL;
    else process.env.SHIPSHOW_LOCAL = previous;
  }
});

test("music crossfades around the boundary and missing or absent music keeps the playhead", () => {
  const dir = scratch(), rate = 48000;
  for (const [file, frequency] of [["a.wav", 220], ["b.wav", 880]]) {
    const samples = Int16Array.from({ length: rate * 4 }, (_, i) => Math.round(10000 * Math.sin(2 * Math.PI * frequency * Math.floor(i / 2) / rate)));
    writeWav(join(dir, file), { rate, channels: 2, samples });
  }
  const moods = [{ name: null, start: 0 }, { name: "b", start: 4, music: { file: "b.wav", volume: 0.5, duck: 1 } }, { name: "keep", start: 8 }, { name: "missing", start: 12, music: "missing.wav" }];
  assert.equal(musicBed(dir, { file: "a.wav", volume: 0.5, duck: 1 }, timing, moods), true);
  const { samples } = readWav(join(dir, "assets/music.wav"));
  const amplitude = (time, hz) => {
    const start = Math.round(time * rate), count = rate / 20;
    let re = 0, im = 0;
    for (let i = start; i < start + count; i++) {
      re += samples[i * 2] * Math.cos(2 * Math.PI * hz * i / rate);
      im += samples[i * 2] * Math.sin(2 * Math.PI * hz * i / rate);
    }
    return Math.hypot(re, im) * 2 / count;
  };
  assert.ok(amplitude(3, 220) > 4900);
  assert.ok(amplitude(3, 880) < 10);
  assert.ok(Math.abs(amplitude(3.975, 220) - 2500) < 20);
  assert.ok(Math.abs(amplitude(3.975, 880) - 2500) < 20);
  assert.ok(amplitude(5, 220) < 10);
  for (const t of [5, 8, 12]) assert.ok(amplitude(t, 880) > 4900);
  const before = samples.slice();
  musicBed(dir, { file: "a.wav", volume: 0.5, duck: 1 }, timing, moods.slice(0, 2));
  assert.deepEqual(readWav(join(dir, "assets/music.wav")).samples, before);
});

// Record the real kit's timeline, including the exact midpoint of discrete changes.
function kitTimeline(moods) {
  const made = [], calls = [];
  const element = () => {
    const el = { style: { setProperty(k, v) { this[k] = v; } }, dataset: {}, children: [],
      appendChild(c) { this.children.push(c); }, insertBefore(c) { this.children.push(c); },
      setAttribute() {}, querySelectorAll() { return []; } };
    made.push(el); return el;
  };
  const root = element(), ambient = element(), progress = element(), caps = element();
  const tl = {};
  for (const method of ["to", "fromTo", "set"]) tl[method] = (target, ...args) => { calls.push({ method, target, args }); return tl; };
  const gsap = { timeline: () => tl, set: (target, props) => calls.push({ method: "initial", target, args: [props] }) };
  const document = { createElement: element, getElementById: (id) => ({ root, ambient, progress }[id]), querySelector: () => caps, querySelectorAll: () => [] };
  runInNewContext(readFileSync(join(REPO, "kit/kit.js"), "utf8"), {
    TOTAL: 16, SEED: 123, MOODS: structuredClone(moods), document, gsap, window: {},
    CSS: { supports: (_, x) => /^#/.test(x) },
    getComputedStyle: (el) => ({ getPropertyValue: (key) => el.style[key] || moods[0].tokens[key] || "" }),
  });
  return { calls, root, made };
}

test("fonts and caption tokens switch at midpoint; colours and numbers tween on the shared timeline", () => {
  const base = { "--bg": "#000000", "--accent": "#ff0000", "--font": "Arial", "--display-weight": "700", "--cap-bg": "#000000", "--ambient-strength": "0.2", "--ambient": "none" };
  const next = { ...base, "--accent": "#00ff00", "--font": "Georgia", "--display-weight": "800", "--cap-bg": "#ffffff", "--ambient-strength": "0.5" };
  const { calls, root } = kitTimeline([{ name: null, start: 0, tokens: base }, { name: "history", start: 4, tokens: next }]);
  for (const key of ["--font", "--display-weight", "--cap-bg"]) {
    const change = calls.find((c) => c.method === "set" && c.target === root && key in c.args[0]);
    assert.equal(change.args[1], 4);
    assert.equal(change.args[0][key], next[key]);
  }
  for (const key of ["--accent", "--ambient-strength"]) {
    const change = calls.find((c) => c.method === "fromTo" && c.target === root && key in c.args[0]);
    assert.equal(change.args[2], 3.4);
    assert.ok(Math.abs(change.args[1].duration - 1.2) < 1e-8);
    assert.equal(change.args[1].immediateRender, false);
  }
});

test("ambient mood containers are seeded, reused on return, and base ambient survives an absent override", () => {
  const tokens = { "--bg": "#000000", "--sky": "", "--ambient": "glow" };
  const moods = [{ name: null, start: 0, tokens }, { name: "night", start: 4, tokens, ambient: "stars glow" }, { name: "paper", start: 8, tokens }, { name: "night", start: 12, tokens, ambient: "stars glow" }];
  const a = kitTimeline(moods), b = kitTimeline(moods);
  const ambientContainers = a.made.filter((el) => el.className === "mood-ambient");
  assert.equal(a.made.find((el) => el.className === "mood-backdrop").style["--bg"], "#000000");
  assert.equal(a.made.find((el) => el.className === "mood-backdrop").style["--sky"], "initial", "a sky absent from the base cannot inherit the next mood sky");
  assert.equal(ambientContainers.length, 2, "base and night are built once, even on return");
  assert.equal(ambientContainers[0].children.length, 2, "the base glow remains the base ambient");
  assert.equal(ambientContainers[1].children.length, 5, "three star layers plus two glows");
  assert.deepEqual(a.made.map((el) => Object.fromEntries(Object.entries(el.style).filter(([key]) => key !== "setProperty"))), b.made.map((el) => Object.fromEntries(Object.entries(el.style).filter(([key]) => key !== "setProperty"))), "the same mood seed draws identical layers");
  const fades = a.calls.filter((c) => c.method === "to" && Array.isArray(c.target) && c.args[0].opacity === 1);
  assert.deepEqual(fades.map((c) => c.args[1]), [3.4, 7.4, 11.4]);
});
