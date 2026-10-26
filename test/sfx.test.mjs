// Sound effects (bin/sfx.mjs, bin/sounds.mjs): where a sound lands, the two refusals Lino set
// (a run of one sound, a sound on a sentence's first word), the level against the voice, and that
// a render repeats. No Kokoro and no browser: each test writes its own timing.json and a stand-in
// narration, as bin/voice.mjs would.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { REPO, readWav, writeWav } from "../bin/lib.mjs";
import { CLEAR_AFTER, detectKey, enforce, findRuns, integrated, markupEvents, mix, momentaryMax, monoAt48k, profile, renderAll, scriptEvents, sfxSettings } from "../bin/sfx.mjs";
import { RATE, VOICES, pitch, render } from "../bin/sounds.mjs";

const KIT = JSON.parse(readFileSync(join(REPO, "kit", "sfx.json"), "utf8"));

/** A 12 s video: one scene, sentence A 0.5 to 5.5 s and sentence B 7 to 11 s, with a stand-in narration. */
function video({ body, script = "", config = {}, local } = {}) {
  const dir = join(mkdtempSync(join(tmpdir(), "kx-sfx-")), "demo");
  cpSync(join(REPO, "template"), dir, { recursive: true });
  writeFileSync(join(dir, "scenes.html"), `<section data-scene="01-intro">\n${body ?? ""}\n</section>\n<section data-scene="02-idea">\n<div data-cue="+1">x</div>\n</section>\n${script ? `<script>\n${script}\n</script>` : ""}`);
  writeFileSync(join(dir, "video.json"), JSON.stringify({ title: "demo", ...config }));
  writeFileSync(join(dir, "timing.json"), JSON.stringify({
    total: 16,
    scenes: [
      { id: "01-intro", start: 0, duration: 12, sentences: [{ text: "Alpha beta gamma.", start: 0.5, duration: 5 }, { text: "Delta epsilon.", start: 7, duration: 4 }] },
      { id: "02-idea", start: 12, duration: 4, sentences: [{ text: "Zeta.", start: 12.5, duration: 2 }] },
    ],
  }));
  mkdirSync(join(dir, "assets"), { recursive: true });
  // Stand-in speech: a few steady tones at -20 dBFS or so, 24 kHz mono, the whole length.
  const n = 24000 * 16, samples = new Int16Array(n);
  for (let i = 0; i < n; i++) samples[i] = Math.round(2600 * (Math.sin(i * 0.05) + 0.6 * Math.sin(i * 0.13) + 0.4 * Math.sin(i * 0.31)));
  writeWav(join(dir, "assets", "narration.wav"), { rate: 24000, channels: 1, samples });
  return { dir, env: { ...process.env, SHIPSHOW_LOCAL: local ?? mkdtempSync(join(tmpdir(), "kx-local-")) } };
}
const build = (v) => spawnSync(process.execPath, [join(REPO, "bin", "build.mjs"), v.dir], { encoding: "utf8", env: v.env });
const events = (v) => JSON.parse(readFileSync(join(v.dir, "assets", "sfx.json"), "utf8"));

test("a sound is placed from the cue's own time, plus its offset, and from a script's cueAt", () => {
  const v = video({
    body: `<div id="a" data-cue="+3" data-sfx="thump">a</div>
<div id="b" data-cue="+9" data-sfx="swish" data-sfx-offset="-0.4" data-sfx-gain="-3">b</div>`,
    script: `sfx("ding", cueAt("#a") + 1.5);\n// sfx("boom", 1);\nsfx("up", sceneEnd("01-intro") - 0.9, { gain: -2 });`,
  });
  const r = build(v);
  assert.equal(r.status, 0, r.stderr);
  const e = events(v).events;
  assert.deepEqual(e.map((x) => [x.name, x.t, x.scene, x.source]), [
    ["thump", 3, "01-intro", "data-sfx"],
    ["ding", 4.5, "01-intro", "script"],
    ["swish", 8.6, "01-intro", "data-sfx"],
    ["up", 11.1, "01-intro", "script"],
  ]);
  assert.equal(e[2].gain, -3);
  assert.equal(e[3].gain, -2);
  const html = readFileSync(join(v.dir, "index.html"), "utf8");
  assert.match(html, /<audio id="sfx" src="assets\/sfx.wav" data-start="0" data-duration="16" data-track-index="32"/);

  // The thump (a "peak" sound) is loudest at its time in the file.
  const w = readWav(join(v.dir, "assets", "sfx.wav"));
  assert.equal(w.rate, RATE);
  assert.equal(w.channels, 2);
  assert.equal(w.samples.length / 2 / RATE, 16);
  let peakAt = 0, peak = 0;
  for (let i = 2.8 * RATE; i < 3.4 * RATE; i++) if (Math.abs(w.samples[2 * i]) > peak) { peak = Math.abs(w.samples[2 * i]); peakAt = i / RATE; }
  assert.ok(Math.abs(peakAt - 3) < 0.01, `the thump peaks at ${peakAt}, not 3`);
  // A "start" sound begins at its time: silence before, sound just after.
  const sad = video({ body: `<div data-cue="+9" data-sfx="sad_trombone">a</div>`, config: { sfx: { under: 12 } } });
  sad.dir && writeFileSync(join(sad.dir, "timing.json"), readFileSync(join(sad.dir, "timing.json"), "utf8").replace('"start":7,"duration":4', '"start":13,"duration":1'));
  const rr = build(sad);
  assert.equal(rr.status, 0, rr.stderr);
  const s = readWav(join(sad.dir, "assets", "sfx.wav")).samples;
  const at = (a, b) => { let m = 0; for (let i = a * RATE; i < b * RATE; i++) m = Math.max(m, Math.abs(s[2 * i])); return m; };
  assert.equal(at(8.5, 8.99), 0);
  assert.ok(at(9.0, 9.3) > 100);
});

test("a data-sfx with no data-cue, an unknown sound, and a call that cannot be evaluated are named, not guessed", () => {
  const noCue = build(video({ body: `<div data-sfx="thump">x</div>` }));
  assert.notEqual(noCue.status, 0);
  assert.match(noCue.stderr, /data-sfx but no data-cue/);
  const unknown = build(video({ body: `<div data-cue="+3" data-sfx="kaboom">x</div>` }));
  assert.notEqual(unknown.status, 0);
  assert.match(unknown.stderr, /named "kaboom" .* the kit has none: it has swish/);
  const loop = build(video({ script: `for (let i = 0; i < 3; i++) sfx("thump", 2 + i * 3);` }));
  assert.notEqual(loop.status, 0);
  assert.match(loop.stderr, /cannot be placed at build time/);
});

test("a run of one sound is refused; two, or three apart, are not", () => {
  const run = (...ts) => video({ body: ts.map((t, i) => `<div id="r${i}" data-cue="+${t}" data-sfx="swish">r</div>`).join("\n") });
  const bad = build(run(2, 2.8, 3.6));
  assert.notEqual(bad.status, 0);
  assert.match(bad.stderr, /3 "swish" sounds in a row from 2 s to 3.6 s/);
  assert.equal(build(run(2, 2.8)).status, 0, "two in a row is allowed");
  assert.equal(build(run(2, 4, 6)).status, 0, "three, each over 1.25 s apart, is not a run");
  assert.deepEqual(findRuns([{ name: "a", t: 1 }, { name: "a", t: 2 }, { name: "b", t: 2.1 }, { name: "a", t: 3 }]).map((r) => r.times), [[1, 2, 3]]);
  // Different sounds in quick succession are not a run.
  const mixed = video({ body: `<div data-cue="+2" data-sfx="swish">r</div><div data-cue="+2.5" data-sfx="thump">r</div><div data-cue="+3" data-sfx="up">r</div>` });
  assert.equal(build(mixed).status, 0);
});

test("a sound over a sentence's first word is refused, and the message says how far to move it", () => {
  // Sentence B starts at 7 s; a thump (peak 7.0) is audible from about 7.0 to 7.15.
  const bad = build(video({ body: `<div data-cue="+7" data-sfx="thump">x</div>` }));
  assert.notEqual(bad.status, 0);
  assert.match(bad.stderr, /lands on the start of a sentence/);
  assert.match(bad.stderr, /the sentence that starts at 7 s/);
  assert.match(bad.stderr, /s earlier \(into the gap before the sentence\) or [\d.]+ s later/);
  // The first sentence's start counts too (0.5 s), and a scene's first sentence in any scene.
  assert.notEqual(build(video({ body: `<div data-cue="+0.5" data-sfx="swish">x</div>` })).status, 0);
  assert.notEqual(build(video({ body: `<div data-cue="+12.5" data-sfx="swish">x</div>` })).status, 0);
  // In the gap before it, or a word inside it, it is fine.
  assert.equal(build(video({ body: `<div data-cue="+6.4" data-sfx="thump">x</div>` })).status, 0);
  assert.equal(build(video({ body: `<div data-cue="+7.9" data-sfx="thump">x</div>` })).status, 0);
  // A long sound is audible for longer, so the same time can be refused for a boom and fine for a thump.
  const rendered = renderAll([{ name: "boom", label: "x", step: 0 }, { name: "thump", label: "x", step: 0 }], { sounds: KIT.sounds, find: (f) => f }, "C");
  const timing = { total: 16, scenes: [{ id: "a", start: 0, duration: 16, sentences: [{ start: 6, duration: 2 }] }] };
  assert.throws(() => enforce([{ name: "boom", t: 4.9, label: "x", step: 0 }], rendered, timing), /lands on the start of a sentence/);
  enforce([{ name: "thump", t: 4.9, label: "x", step: 0 }], rendered, timing);
  assert.ok(CLEAR_AFTER > 0.3);
});

test("a sound lands the set number of dB under the voice, measured by loudness, and follows `under` and gain", () => {
  const v = video({ body: `<div data-cue="+3" data-sfx="thump">x</div><div data-cue="+9" data-sfx="up" data-sfx-gain="-6">x</div>` });
  assert.equal(build(v).status, 0);
  const rec = events(v);
  const voice = integrated(monoAt48k(join(v.dir, "assets", "narration.wav")));
  assert.equal(rec.reference, Math.round(voice * 100) / 100);
  const track = monoAt48k(join(v.dir, "assets", "sfx.wav"));
  const slice = (a, b) => track.slice(Math.floor(a * RATE), Math.floor(b * RATE));
  // thump: kit gain -2, under 14 by default.
  assert.ok(Math.abs(momentaryMax(slice(2.5, 3.5)) - (voice - 14 - 2)) < 0.25, `thump at ${momentaryMax(slice(2.5, 3.5))}, voice ${voice}`);
  // up: kit gain -3, the call's -6 more.
  assert.ok(Math.abs(momentaryMax(slice(8.5, 10.5)) - (voice - 14 - 3 - 6)) < 0.3);
  // A quieter setting moves every sound by exactly that much.
  const quiet = video({ body: `<div data-cue="+3" data-sfx="thump">x</div>`, config: { sfx: { under: 20 } } });
  assert.equal(build(quiet).status, 0);
  const q = monoAt48k(join(quiet.dir, "assets", "sfx.wav")).slice(Math.floor(2.5 * RATE), Math.floor(3.5 * RATE));
  assert.ok(Math.abs(momentaryMax(q) - (voice - 20 - 2)) < 0.25);
  // Against a voice twice as loud, the sound is 6 dB louder: the level is relative, not absolute.
  const rendered = renderAll([{ name: "thump", step: 0, label: "x" }], { sounds: KIT.sounds, find: (f) => f }, "C");
  const at = (ref) => mix([{ name: "thump", t: 1, gain: 0, step: 0 }], rendered, 3, ref, 14).levels.thump;
  assert.equal(at(-14) - at(-20), 6);
});

test("a sound that rings past the video's end is faded out, not cut on a click", () => {
  const rendered = renderAll([{ name: "boom", step: 0, label: "x" }], { sounds: KIT.sounds, find: (f) => f }, "C");
  const { samples } = mix([{ name: "boom", t: 1.0, gain: 0, step: 0 }], rendered, 1.3, -20, 14);
  assert.ok(Math.abs(samples[samples.length - 2]) < 20, "the last sample is near silence");
});

test("loudness agrees with ffmpeg's ebur128", { skip: spawnSync("ffmpeg", ["-version"]).status !== 0 && "ffmpeg is not installed" }, () => {
  const v = video();
  const file = join(v.dir, "assets", "narration.wav");
  const out = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-af", "ebur128", "-f", "null", "-"], { encoding: "utf8" }).stderr;
  const ffmpeg = +[...out.matchAll(/I:\s+(-?[\d.]+) LUFS/g)].at(-1)[1];
  assert.ok(Math.abs(integrated(monoAt48k(file)) - ffmpeg) < 0.3, `ours ${integrated(monoAt48k(file))}, ffmpeg ${ffmpeg}`);
});

test("a render repeats: the same bytes twice, and every voice is repeatable, finite and ends quietly", () => {
  const body = `<div data-cue="+3" data-sfx="boom">x</div><div data-cue="+9" data-sfx="scratch">x</div>`;
  const a = video({ body }), b = video({ body });
  assert.equal(build(a).status, 0);
  assert.equal(build(b).status, 0);
  assert.ok(readFileSync(join(a.dir, "assets", "sfx.wav")).equals(readFileSync(join(b.dir, "assets", "sfx.wav"))));
  for (const [name, spec] of Object.entries(KIT.sounds)) {
    const x = render(spec, "C"), y = render(spec, "C");
    assert.deepEqual(x, y, `${name} differs between two renders`);
    assert.ok(x.every(Number.isFinite), `${name} has a NaN`);
    assert.ok(Math.abs(x.reduce((m, v) => Math.max(m, Math.abs(v)), 0) - 1) < 1e-9, `${name} does not peak at 1`);
    assert.ok(Math.abs(x.at(-1)) < 1e-3, `${name} ends on a click`);
    assert.ok(Math.abs(x[0]) < 0.2, `${name} starts on a click`);
  }
});

test("the comedic sounds are what they say: a low boom, a descending trombone, a scratch that swoops, a ding on the key", () => {
  const spectrum = (x, from, len) => {
    let n = 1;
    while (n < len) n <<= 1;
    const peaks = [];
    for (let s = Math.round(from * RATE), k = 0; k < 1; k++) {
      const re = new Float64Array(n), im = new Float64Array(n);
      for (let i = 0; i < n; i++) re[i] = (x[s + i] ?? 0) * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / n));
      peaks.push(dominant(re, im, n));
    }
    return peaks[0];
  };
  const boom = render(KIT.sounds.boom, "C");
  assert.ok(boom.length / RATE >= 1.5);
  assert.ok(spectrum(boom, 0.3, 8192) < 80, "a boom rings in the sub-bass");
  const ding = render(KIT.sounds.ding, "C"), want = pitch("C", 6, 0);
  assert.ok(Math.abs(spectrum(ding, 0.05, 8192) - want) < 8, `a ding sings ${want} Hz, not ${spectrum(ding, 0.05, 8192)}`);
  assert.ok(Math.abs(spectrum(render(KIT.sounds.ding, "G"), 0.05, 8192) - pitch("G", 6, 0)) < 8, "and follows the bed's key");
  // The trombone's fourth note is lower than its first: compare the energy-weighted zero crossing rate of the two notes.
  const tb = render(KIT.sounds.sad_trombone, "C");
  const rate = (a, b) => { let c = 0; for (let i = Math.round(a * RATE); i < Math.round(b * RATE); i++) if (tb[i - 1] < 0 && tb[i] >= 0) c++; return c / (b - a); };
  assert.ok(tb.length / RATE > 2.5);
  assert.ok(rate(2.3, 2.7) < rate(0.1, 0.35), "the last wah is lower than the first");
  // The scratch changes direction: its pitch rises and falls, not a steady note.
  const sc = render(KIT.sounds.scratch, "C");
  const zc = (a, b) => { let c = 0; for (let i = Math.round(a * RATE); i < Math.round(b * RATE); i++) if (sc[i - 1] < 0 && sc[i] >= 0) c++; return c / (b - a); };
  assert.ok(Math.max(zc(0.04, 0.09), zc(0.2, 0.25)) > 1.8 * zc(0.38, 0.45), "a scratch swoops and winds down");
});
function dominant(re, im, n) {
  // The strongest bin above 20 Hz.
  const mag = new Float64Array(n / 2);
  fftIn(re, im);
  let best = 0, at = 0;
  for (let k = Math.ceil(20 * n / RATE); k < n / 2; k++) {
    mag[k] = re[k] ** 2 + im[k] ** 2;
    if (mag[k] > best) { best = mag[k]; at = k; }
  }
  return (at * RATE) / n;
}
import { fft as fftIn } from "../bin/sounds.mjs";

test("the bed's key: pitched sounds are tuned to it, and a minor key gives its relative major", () => {
  const scale = (tonic, intervals, minor = false) => {
    const x = new Float64Array(RATE * 8);
    const notes = minor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
    for (let i = 0; i < x.length; i++) {
      const bar = Math.floor(i / RATE * 2) % 8;
      for (const [d, a] of [[0, 1], [4, 0.6], [7, 0.5]]) {
        const semi = notes[(bar + (intervals ?? 0)) % 7] + d;
        x[i] += a * Math.sin(2 * Math.PI * 261.63 * 2 ** ((tonic + semi) / 12) * i / RATE);
      }
    }
    return x;
  };
  assert.equal(detectKey(scale(0)).tonic, "C");
  assert.equal(detectKey(scale(6)).tonic, "F#");
  // A minor starting on A (9) has C major's notes.
  assert.equal(detectKey(scale(9, 0, true)).tonic, "C");
});

test("the track keeps the music bed's key for pitched sounds, and a file in local/sfx can be a sound", () => {
  const local = mkdtempSync(join(tmpdir(), "kx-local-"));
  mkdirSync(join(local, "sfx", "mine"), { recursive: true });
  const n = RATE, tone = new Int16Array(n);
  for (let i = 0; i < n; i++) tone[i] = Math.round(9000 * Math.sin(2 * Math.PI * 500 * i / RATE) * Math.exp(-i / 9000));
  writeWav(join(local, "sfx", "mine", "pip.wav"), { rate: RATE, channels: 1, samples: tone });
  writeFileSync(join(local, "sfx", "mine", "sfx.json"), JSON.stringify({ tonic: "D", sounds: { pip: { file: "pip.wav", gain: -3 }, ding: { voice: "ding", octave: 5, step: 0 } } }));
  const v = video({ body: `<div data-cue="+3" data-sfx="pip">x</div><div data-cue="+9" data-sfx="ding">x</div>`, config: { sfx: { kit: "mine" } }, local });
  const r = build(v);
  assert.equal(r.status, 0, r.stderr);
  const rec = events(v);
  assert.equal(rec.tonic, "D", "no bed, so the kit's own tonic");
  assert.ok(rec.events.some((e) => e.name === "pip") && rec.events.some((e) => e.name === "boom") === false);
  // The kit adds to the default kit: its ding replaced the default's, and the default's boom is still there.
  const both = video({ body: `<div data-cue="+3" data-sfx="boom">x</div>`, config: { sfx: { kit: "mine", tonic: "A" } }, local });
  assert.equal(build(both).status, 0);
  assert.equal(events(both).tonic, "A");
  // A bed in a given key wins over the kit's tonic.
  const bed = video({ body: `<div data-cue="+9" data-sfx="ding">x</div>`, config: { sfx: { kit: "mine" }, music: { file: "bed.wav" } }, local });
  const sr = 48000, b = new Int16Array(sr * 8 * 2), steps = [0, 2, 4, 5, 7, 9, 11, 7];
  for (let i = 0; i < sr * 8; i++) {
    const note = steps[Math.floor(i / sr)];
    b[2 * i] = b[2 * i + 1] = Math.round(7000 * (Math.sin(2 * Math.PI * 261.63 * 2 ** (note / 12) * i / sr) + 0.6 * Math.sin(2 * Math.PI * 130.81 * i / sr) + 0.4 * Math.sin(2 * Math.PI * 392 * i / sr)));
  }
  writeWav(join(bed.dir, "bed.wav"), { rate: sr, channels: 2, samples: b });
  assert.equal(build(bed).status, 0);
  assert.equal(events(bed).tonic, "C");
  assert.ok(events(bed).key.fit > 0.5);
});

test("sound can be turned off, in video.json or for a person; no sound asked for means no track", () => {
  const body = `<div data-cue="+3" data-sfx="thump">x</div>`;
  const off = video({ body, config: { sfx: false } });
  assert.equal(build(off).status, 0);
  assert.ok(!existsSync(join(off.dir, "assets", "sfx.wav")));
  assert.doesNotMatch(readFileSync(join(off.dir, "index.html"), "utf8"), /id="sfx"/);
  assert.deepEqual(events(off).events, []);
  const local = mkdtempSync(join(tmpdir(), "kx-local-"));
  writeFileSync(join(local, "config.json"), JSON.stringify({ sfx: false }));
  const mine = video({ body, local });
  assert.equal(build(mine).status, 0);
  assert.ok(!existsSync(join(mine.dir, "assets", "sfx.wav")));
  const none = video({ body: `<div data-cue="+3">x</div>` });
  assert.equal(build(none).status, 0);
  assert.doesNotMatch(readFileSync(join(none.dir, "index.html"), "utf8"), /id="sfx"/);
  assert.throws(() => sfxSettings({ kit: "x", loud: 1 }), /has "loud"/);
  assert.throws(() => sfxSettings({ under: 90 }), /dB below the voice/);
  assert.throws(() => sfxSettings({ tonic: "H" }), /tonic/);
  assert.deepEqual(sfxSettings(undefined), { on: true, kit: undefined, under: 14, tonic: undefined });
});

test("a theme's own sfx.json is laid over the default kit by name", () => {
  const local = mkdtempSync(join(tmpdir(), "kx-local-"));
  mkdirSync(join(local, "themes", "mine"), { recursive: true });
  cpSync(join(REPO, "themes", "shipshow", "theme.css"), join(local, "themes", "mine", "theme.css"));
  writeFileSync(join(local, "themes", "mine", "sfx.json"), JSON.stringify({ sounds: { thump: { voice: "boom", length: 0.6, gain: -6 } } }));
  const v = video({ body: `<div data-cue="+3" data-sfx="thump">x</div><div data-cue="+9" data-sfx="swish">x</div>`, config: { theme: "mine" }, local });
  assert.equal(build(v).status, 0);
  assert.equal(events(v).levels.thump, events(v).reference - 14 - 6, "the theme's thump, at the theme's gain");
});

test("markup and script parsing: comments are skipped, attributes are read, a bad offset is named", () => {
  const html = `<div id="x" data-cue="a" data-at="4.5" data-sfx="swish" data-sfx-step="2"></div>`;
  assert.deepEqual(markupEvents(html, "s").map((e) => [e.name, e.t, e.step, e.label]), [["swish", 4.5, 2, "x"]]);
  assert.throws(() => markupEvents(`<div data-at="1" data-sfx="a" data-sfx-offset="soon"></div>`, "s"), /not a number of seconds/);
  const ctx = { ids: { x: 4.5 }, starts: { s: 10 }, ends: { s: 14 } };
  const ev = scriptEvents(`/* sfx("a", 1) */ // sfx("b", 2)\nconst note = "sfx('c', 3)";\nsfx("swish", cueAt("#x") + 0.25, { gain: -3 });\nsfx('thump', sceneStart('s') + 1)`, ctx);
  assert.deepEqual(ev.map((e) => [e.name, e.t, e.gain]), [["swish", 4.75, -3], ["thump", 11, 0]]);
  assert.throws(() => scriptEvents(`sfx("a", cueAt("#nope"))`, ctx), /names no element/);
  assert.deepEqual(profile(Float64Array.from([0, 0.5, 1, 0.5, 0])).peakAt, 2);
});

test("the review packet lists each sound with its time, scene, level and what is being said", async () => {
  const { soundRows } = await import("../bin/measure.mjs");
  const timing = { total: 16, scenes: [{ id: "a", start: 0, duration: 12, sentences: [{ text: "Alpha beta gamma.", start: 0.5, duration: 5 }, { text: "Delta epsilon.", start: 7, duration: 4 }] }] };
  const record = { reference: -22, events: [
    { name: "thump", t: 3, scene: "a", label: "x", level: -38, audible: [2.9, 3.2] },
    { name: "swish", t: 6.4, scene: "a", label: "y", level: -45, audible: [6.2, 6.8] },
  ] };
  const rows = soundRows(record, timing);
  assert.deepEqual(rows[0], [3, "a", "thump", "x", "Alpha beta gamma.", "-38 LUFS (-16 vs voice)", "2.9 to 3.2 s", ""]);
  assert.equal(rows[1][4], "(between sentences)");
  assert.match(rows[1][7], /ends 0.2 s before a sentence starts/);
  assert.deepEqual(soundRows({ events: [] }, timing), []);
});
