import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { REPO, musicBed, readWav, themeCss, writeWav } from "../bin/lib.mjs";
import { MOOD_BEAT, resolveMoods } from "../bin/moods.mjs";

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

test("music hands off at a mood change: the old bed fades from the last word, the new one swells in from its opening", () => {
  const dir = scratch(), rate = 48000;
  for (const [file, frequency] of [["a.wav", 220], ["b.wav", 880]]) {
    const samples = Int16Array.from({ length: rate * 4 }, (_, i) => Math.round(10000 * Math.sin(2 * Math.PI * frequency * Math.floor(i / 2) / rate)));
    writeWav(join(dir, file), { rate, channels: 2, samples });
  }
  const moods = [{ name: null, start: 0 }, { name: "b", start: 4, music: { file: "b.wav", volume: 0.5, duck: 1 } }, { name: "keep", start: 8 }, { name: "missing", start: 12, music: "missing.wav" }];
  const level = (timingIn, base) => {
    assert.equal(musicBed(dir, { file: "a.wav", volume: 0.5, duck: 1, ...base }, timingIn, moods), true);
    const { samples } = readWav(join(dir, "assets/music.wav"));
    return (time, hz) => {
      const count = rate / 20, start = Math.round(time * rate) - count / 2;   // 50 ms centred on the time: whole cycles of both tones
      let re = 0, im = 0;
      for (let i = start; i < start + count; i++) {
        re += samples[i * 2] * Math.cos(2 * Math.PI * hz * i / rate);
        im += samples[i * 2] * Math.sin(2 * Math.PI * hz * i / rate);
      }
      return Math.hypot(re, im) * 2 / count;
    };
  };
  // No speech: the old bed fades over the last MUSIC_OUT_MIN (1 s) and MUSIC_OUT_PAST (0.5 s) after the boundary.
  let amplitude = level(timing);
  const near = (got, want, why) => assert.ok(Math.abs(got - want) < 120, `${why}: ${Math.round(got)}, wanted about ${want}`);
  near(amplitude(2.5, 220), 5000, "the old bed is whole before its handoff");
  assert.ok(amplitude(2.5, 880) < 10);
  near(amplitude(3.75, 220), 5000 * Math.cos(Math.PI / 4), "halfway out at 0.75 s of 1.5");
  assert.ok(amplitude(3.75, 880) < 10, "the new bed waits for its boundary");
  assert.ok(amplitude(4.6, 220) < 10, "the old bed is gone just after the boundary");
  near(amplitude(5, 880), 5000 * Math.sin(Math.PI / 4), "the new bed is halfway in at 1 s of 2");
  for (const t of [6.5, 8, 12]) near(amplitude(t, 880), 5000, `the new bed is whole at ${t} s, through a mood with no music and one whose file is missing`);
  // A last word at 2 s: the bed fades from there at its ducked level, never swelling back up in the pause.
  const spoken = { ...timing, scenes: timing.scenes.map((s, i) => (i === 0 ? { ...s, sentences: [{ start: 1, duration: 1 }] } : s)) };
  amplitude = level(spoken, { duck: 0.5 });
  near(amplitude(3.25, 220), 2500 * Math.cos(Math.PI / 4), "ducked and halfway out at 1.25 s of 2.5");
  // A mood with no music, and one whose file is missing, leave the bed exactly as it was.
  const before = readWav(join(dir, "assets/music.wav")).samples.slice();
  musicBed(dir, { file: "a.wav", volume: 0.5, duck: 0.5 }, spoken, moods.slice(0, 2));
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

test("a mood's overlay layers make no stacking context, so grain blends with the scenes under it", () => {
  // #overlay > * gets z-index 1; a positioned .mood-overlay with it would isolate its grain, which then blends with
  // nothing and lays flat grey noise over the picture (never-about-the-code's seventh cut: blacks lifted from 25 to 44
  // mean luma, the file eight times larger).
  const css = readFileSync(join(REPO, "kit", "base.css"), "utf8");
  const rule = css.match(/#overlay \.mood-overlay \{([^}]*)\}/);
  assert.ok(rule, "base.css has no #overlay .mood-overlay rule");
  assert.match(rule[1], /z-index:\s*auto/);
});

test("a mood that starts with its first word close behind is named, so a new act gets a beat before the voice", () => {
  const dir = scratch();
  const cfg = { moods: { history: { look: { "--accent": "#aabbcc" } }, night: { look: { "--ink": "#ffffff" } } } };
  const voiced = (beat) => ({ total: 16, scenes: [0, 4, 8, 12].map((start, i) => ({ id: `s${i}`, start, duration: 4, sentences: [{ text: "x", start: start + (i ? beat : 0.4), duration: 1 }] })) });
  const rushed = resolveMoods(cfg, voiced(0.4), source, themeCss("shipshow", dir), dir).warnings;
  assert.equal(rushed.length, 2, "both mood changes are named");
  assert.match(rushed[0], /scene s1 starts mood "history" 0\.4 s before its first word.*"leads": \{"s1"/);
  assert.deepEqual(resolveMoods(cfg, voiced(MOOD_BEAT + 0.3), source, themeCss("shipshow", dir), dir).warnings, [], "a beat long enough says nothing");
  assert.deepEqual(resolveMoods(cfg, timing, source, themeCss("shipshow", dir), dir).warnings, [], "no sentences, nothing to judge");
});
