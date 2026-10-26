// Sound effects under a video: a sound on the moment the picture moves, set against the voice.
// bin/build.mjs calls this after the timing is known; it writes assets/sfx.wav (the pattern of the
// music bed, `musicBed` in bin/lib.mjs) and assets/sfx.json (what the review packet lists).
//
// WHERE A SOUND GOES is written beside the thing it sounds for. ShipShow already knows every
// cued element's time (`data-at`) and every sentence's exact start, so nothing is measured:
//   <div data-cue="Kokoro" data-sfx="whoosh">                  the sound PEAKS when the element lands
//   <div data-cue="box" data-sfx="thump" data-sfx-offset="0.2" data-sfx-gain="-3" data-sfx-step="2">
//   sfx("whoosh", cueAt("#t-name") + 0.45);                    in scenes.html's <script>
// `cueAt("#id")` is that element's data-at, `sceneStart("id")` and `sceneEnd("id")` a scene's
// edges (id is the script file's name). The script's calls are read from its TEXT at build time,
// not run, so the time must be a number or those helpers plus or minus a number: a call in a loop
// has nothing to evaluate (and a loop of one sound is a run, which is refused anyway).
//
// WHAT A SOUND IS lives in a kit (kit/sfx.json; a theme's sfx.json or local/sfx/ adds to or
// replaces it by name): synthesized by bin/sounds.mjs, or a file. A kit's `sounds` map each name to
// a voice and its arguments, a `gain` in dB, and `anchor`: "peak" (default; the loudest moment lands
// on the motion, right for a swish that swells) or "start" (the sound's first moment lands there,
// right for a trombone or a scratch).
//
// HOW OFTEN: a sound marks a thing moving, landing or arriving, never each item of a list (Lino,
// 2026-10-24: a rising tick on each of 17 checks was the one distracting thing in the mix). So a
// build REFUSES a run: RUN or more of one sound, each within RUN_GAP seconds of the last.
//
// NOT ON A SENTENCE'S FIRST WORD. A sound under the start of a sentence reads as a glitch in the
// voice (Lino, 2026-10-26: all five Market Spotlights put a swish on the narrator's first word and
// he heard the starts as clipped). So a build REFUSES any sound audible (within AUDIBLE_DB of its
// own peak) from CLEAR_BEFORE before a sentence's first word to CLEAR_AFTER after it. Every sentence's
// start is exact: each is voiced on its own. Move the sound into the gap before, or onto a word inside.
//
// HOW LOUD is measured, not guessed: each sound's loudest 400 ms (EBU R128 momentary loudness, what
// a listener hears) is set `under` dB below the voice's integrated loudness, plus the kit's and the
// call's own gain. Sound effects are felt, not heard: just there under the words.
//
// PITCH: a pitched sound plays the major pentatonic of the music bed's key, measured from the bed
// (Krumhansl-Kessler profiles over its chroma), or `sfx.tonic`, or the kit's, or C.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import vm from "node:vm";
import { REPO, readWav, round, themeDir, writeWav } from "./lib.mjs";
import { NOTE_NAMES, RATE, fft, render } from "./sounds.mjs";

export const UNDER = 14;                       // dB below the voice that a sound at gain 0 lands at
export const RUN = 3, RUN_GAP = 1.25;          // three of one sound, each within 1.25 s of the last, is a run
export const CLEAR_BEFORE = 0.05, CLEAR_AFTER = 0.45;   // no sound audible this close around a sentence's first word
export const AUDIBLE_DB = 20;                  // a sound is audible while within this many dB of its own peak
const MAX_PEAK = 0.5;                          // -6 dBFS: an effect under a voice never needs more

// ---------------------------------------------------------------- loudness (ITU-R BS.1770 / EBU R128)

const biquad = (x, b, a) => {
  const y = new Float64Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = b[0] * x[i] + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
  }
  return y;
};
/** The K-weighted signal: BS.1770's high shelf and low cut, at 48 kHz. */
export function kWeigh(x) {
  const shelf = biquad(x, [1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585]);
  return biquad(shelf, [1, -2, 1], [1, -1.99004745483398, 0.99007225036621]);
}
const lufs = (ms) => -0.691 + 10 * Math.log10(Math.max(ms, 1e-12));
/** Loudness of every 400 ms window (hop `hop` samples) of a K-weighted signal, in LUFS. */
function windows(k, hop) {
  const win = Math.round(0.4 * RATE), sums = new Float64Array(k.length + 1);
  for (let i = 0; i < k.length; i++) sums[i + 1] = sums[i] + k[i] * k[i];
  const out = [];
  for (let s = 0; s + win <= k.length; s += hop) out.push(lufs((sums[s + win] - sums[s]) / win));
  return out;
}
/** The loudest 400 ms of mono samples at 48 kHz, in LUFS (momentary loudness, what a listener hears of a short sound). */
export function momentaryMax(x) {
  const pad = new Float64Array(x.length + 2 * Math.round(0.4 * RATE));
  pad.set(x, Math.round(0.4 * RATE));
  return Math.max(...windows(kWeigh(pad), Math.round(0.01 * RATE)));
}
/** Integrated loudness of mono samples at 48 kHz, in LUFS: 400 ms blocks every 100 ms, gated at -70 and then 10 LU under the rest. */
export function integrated(x) {
  const pad = new Float64Array(Math.max(x.length, Math.round(0.4 * RATE)));
  pad.set(x);
  const blocks = windows(kWeigh(pad), Math.round(0.1 * RATE)).filter((l) => l > -70);
  if (!blocks.length) return -70;
  const mean = (a) => a.reduce((s, l) => s + 10 ** ((l + 0.691) / 10), 0) / a.length;
  const rel = lufs(mean(blocks)) - 10, kept = blocks.filter((l) => l > rel);
  return lufs(mean(kept.length ? kept : blocks));
}

/** Samples of a WAV as mono floats at 48 kHz (a channel mix, linear resample). */
export function monoAt48k(path) {
  const w = readWav(path), n = Math.floor(w.samples.length / w.channels), mono = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let c = 0; c < w.channels; c++) s += w.samples[i * w.channels + c];
    mono[i] = s / w.channels / 32768;
  }
  if (w.rate === RATE) return mono;
  const out = new Float64Array(Math.floor(n * RATE / w.rate));
  for (let i = 0; i < out.length; i++) {
    const p = i * w.rate / RATE, i0 = Math.floor(p), f = p - i0;
    out[i] = mono[i0] * (1 - f) + (mono[Math.min(n - 1, i0 + 1)]) * f;
  }
  return out;
}

// ---------------------------------------------------------------- the bed's key

const MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const corr = (a, b) => {
  const ma = a.reduce((s, v) => s + v, 0) / a.length, mb = b.reduce((s, v) => s + v, 0) / b.length;
  let n = 0, da = 0, db = 0;
  for (let i = 0; i < a.length; i++) { n += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; }
  return n / Math.sqrt(da * db || 1);
};
/** The key a track is in, as {tonic, heard, fit}: `tonic` is the major scale with the same notes
 *  (a minor key returns its relative major), which is what a pentatonic sound plays. Mono 48 kHz in. */
export function detectKey(x, seconds = 90) {
  const n = 16384, f = Array.from({ length: n / 2 + 1 }, (_, k) => k * RATE / n);
  const chroma = new Array(12).fill(0), win = Float64Array.from({ length: n }, (_, i) => 0.5 - 0.5 * Math.cos(2 * Math.PI * i / n));
  const pc = f.map((hz) => (hz > 60 && hz < 2000 ? (((Math.round(12 * Math.log2(hz / 440)) + 9) % 12) + 12) % 12 : -1));
  for (let s = 0; s + n <= Math.min(x.length, seconds * RATE); s += n) {
    const re = new Float64Array(n), im = new Float64Array(n);
    for (let i = 0; i < n; i++) re[i] = x[s + i] * win[i];
    fft(re, im);
    for (let k = 0; k <= n / 2; k++) if (pc[k] >= 0) chroma[pc[k]] += re[k] ** 2 + im[k] ** 2;
  }
  const total = chroma.reduce((a, b) => a + b, 0) || 1;
  const c = chroma.map((v) => v / total);
  let best = { r: -2 };
  for (let k = 0; k < 12; k++) {
    for (const [prof, mode] of [[MAJOR, "major"], [MINOR, "minor"]]) {
      const r = corr(c, prof.map((_, i) => prof[(i - k + 12) % 12]));
      if (r > best.r) best = { r, k, mode };
    }
  }
  return { tonic: best.mode === "major" ? NAMES[best.k] : NAMES[(best.k + 3) % 12], heard: `${NAMES[best.k]} ${best.mode}`, fit: round(best.r) };
}

// ---------------------------------------------------------------- where the sounds are

/** Blank comments out of script text (keeping its length), leaving strings alone. */
function stripComments(src, blankStrings = false) {
  let out = "", q = null;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) {
      out += blankStrings && c !== q ? " " : c;
      if (c === "\\") { const e = src[++i] ?? ""; out += blankStrings ? " " : e; }
      else if (c === q) q = null;
    } else if (c === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") { out += " "; i++; }
      out += "\n";
    } else if (c === "/" && src[i + 1] === "*") {
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) { out += src[i] === "\n" ? "\n" : " "; i++; }
      out += "  "; i++;
    } else {
      if (c === '"' || c === "'" || c === "`") q = c;
      out += c;
    }
  }
  return out;
}

/** The top-level arguments of the call whose "(" is at `open`, as source text. */
function callArgs(src, open) {
  const args = [];
  let depth = 0, q = null, cur = "";
  for (let i = open + 1; i < src.length; i++) {
    const c = src[i];
    if (q) {
      cur += c;
      if (c === "\\") cur += src[++i] ?? "";
      else if (c === q) q = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") q = c;
    else if ("([{".includes(c)) depth++;
    else if (")]}".includes(c)) {
      if (!depth) { if (cur.trim()) args.push(cur.trim()); return args; }
      depth--;
    } else if (c === "," && !depth) { args.push(cur.trim()); cur = ""; continue; }
    cur += c;
  }
  throw new Error("sfx( in scenes.html's script is never closed");
}

/** Every `id="x" ... data-at="N"` element in `html`: {x: N}. */
export function cueTimes(html) {
  const out = {};
  for (const m of html.matchAll(/<[a-zA-Z][^>]*>/g)) {
    const id = m[0].match(/\bid="([^"]+)"/), at = m[0].match(/\bdata-at="([\d.]+)"/);
    if (id && at) out[id[1]] = +at[1];
  }
  return out;
}

/** The sounds a scene's markup asks for: every element with data-sfx, at its data-at plus data-sfx-offset. */
export function markupEvents(html, scene) {
  const events = [];
  for (const m of html.matchAll(/<[a-zA-Z][^>]*\bdata-sfx="([^"]*)"[^>]*>/g)) {
    const tag = m[0], attr = (n) => tag.match(new RegExp(`\\bdata-sfx-${n}="([^"]*)"`))?.[1];
    const name = m[1].trim(), at = tag.match(/\bdata-at="([\d.]+)"/);
    if (!name) throw new Error(`scene ${scene}: an element has an empty data-sfx: name a sound from the kit`);
    if (!at) throw new Error(`scene ${scene}: ${tag.slice(0, 90)} has data-sfx but no data-cue, so it has no time. Add a data-cue, or place the sound from the scene's script: sfx("${name}", cueAt("#id") + 0.2)`);
    const offset = attr("offset") === undefined ? 0 : Number(attr("offset"));
    if (!Number.isFinite(offset)) throw new Error(`scene ${scene}: data-sfx-offset="${attr("offset")}" is not a number of seconds`);
    events.push({ name, t: round(+at[1] + offset), scene, source: "data-sfx", label: tag.match(/\bid="([^"]+)"/)?.[1] ?? tag.match(/data-cue="([^"]*)"/)?.[1] ?? name, gain: Number(attr("gain") ?? 0), step: Number(attr("step") ?? 0) });
  }
  return events;
}

/** The sounds a script asks for with sfx(name, time, {gain, step}), read from its text. */
export function scriptEvents(script, { ids, starts, ends }) {
  const src = stripComments(script), masked = stripComments(script, true), events = [];
  const sandbox = {
    Math,
    cueAt: (sel) => {
      const id = String(sel).match(/^#([\w-]+)$/)?.[1];
      if (!id || !(id in ids)) throw new Error(`cueAt("${sel}") names no element with an id and a data-cue; it takes "#id"`);
      return ids[id];
    },
    sceneStart: (id) => { if (!(id in starts)) throw new Error(`sceneStart("${id}"): no such scene`); return starts[id]; },
    sceneEnd: (id) => { if (!(id in ends)) throw new Error(`sceneEnd("${id}"): no such scene`); return ends[id]; },
  };
  for (const m of masked.matchAll(/(?<![\w.$])sfx\s*\(/g)) {
    const args = callArgs(src, m.index + m[0].length - 1), shown = `sfx(${args.join(", ")})`;
    try {
      const [name, t, opts] = args.map((a) => vm.runInNewContext(`(${a})`, { ...sandbox }, { timeout: 200 }));
      if (typeof name !== "string" || !Number.isFinite(t)) throw new Error("it needs a name and a time in seconds");
      events.push({ name, t: round(t), scene: null, source: "script", label: shown, gain: Number(opts?.gain ?? 0), step: Number(opts?.step ?? 0) });
    } catch (e) {
      throw new Error(`${shown} in scenes.html's script cannot be placed at build time (${e.message}). Give it a number, or cueAt("#id"), sceneStart("scene") or sceneEnd("scene") plus or minus a number: the script's text is read, not run, so a call in a loop has nothing to evaluate`);
    }
  }
  return events;
}

// ---------------------------------------------------------------- kits

const DEFAULT_KIT = join(REPO, "kit", "sfx.json");
const localDir = () => process.env.SHIPSHOW_LOCAL || join(REPO, "local");

/** video.json "sfx" (or local/config.json's) as {on, kit, under, tonic}. false turns sound off. */
export function sfxSettings(value) {
  if (value === false || value?.on === false) return { on: false };
  const v = typeof value === "string" ? { kit: value } : value ?? {};
  if (typeof v !== "object" || Array.isArray(v)) throw new Error(`video.json sfx is ${JSON.stringify(value)}; it takes false, a kit name, or {kit, under, tonic}`);
  for (const k of Object.keys(v)) if (!["on", "kit", "under", "tonic"].includes(k)) throw new Error(`video.json sfx has "${k}"; it takes kit, under, tonic, or false to turn sound off`);
  const under = v.under ?? UNDER;
  if (!(Number(under) >= 0 && Number(under) <= 40)) throw new Error(`video.json sfx under is ${under}; it is dB below the voice, 0 to 40 (default ${UNDER})`);
  if (v.tonic !== undefined && !NOTE_NAMES.includes(v.tonic)) throw new Error(`video.json sfx tonic is "${v.tonic}"; it takes ${NOTE_NAMES.join(" ")}`);
  return { on: true, kit: v.kit, under: Number(under), tonic: v.tonic };
}

/** The kit for a video: the default kit, with the named kit (or the theme's sfx.json) laid over it by sound name.
 *  Returns {sounds, tonic, find(file)}: `find` looks for a sound file in the kit's folder, local/sfx/, the theme and the video. */
export function loadKit(settings, dir, themeName) {
  const theme = themeName ? themeDir(themeName) : null;
  const place = (name) => [
    join(dir, name), join(REPO, name), join(localDir(), "sfx", name), join(localDir(), "sfx", `${name}.json`),
    join(localDir(), "sfx", name, "sfx.json"), join(localDir(), "themes", name, "sfx.json"), join(REPO, "themes", name, "sfx.json"),
  ].find((p) => existsSync(p) && /\.json$/.test(p));
  const files = [DEFAULT_KIT];
  if (settings.kit && settings.kit !== "default") {
    const p = place(settings.kit);
    if (!p) throw new Error(`no sound kit "${settings.kit}": a path, a name in local/sfx/ (<name>.json or <name>/sfx.json), or a theme with an sfx.json`);
    files.push(p);
  } else if (theme && existsSync(join(theme, "sfx.json"))) files.push(join(theme, "sfx.json"));
  const sounds = {}, roots = [];
  let tonic = "C";
  for (const f of files) {
    const kit = JSON.parse(readFileSync(f, "utf8"));
    for (const [n, spec] of Object.entries(kit.sounds ?? {})) sounds[n] = spec;
    if (kit.tonic) tonic = kit.tonic;
    roots.unshift(dirname(f));
  }
  const search = [...roots, join(localDir(), "sfx"), theme, dir].filter(Boolean);
  const find = (file) => {
    const p = search.map((r) => join(r, file)).find((q) => existsSync(q));
    if (!p) throw new Error(`sound file "${file}" is in none of: ${search.join(", ")}`);
    return p;
  };
  return { sounds, tonic, find };
}

// ---------------------------------------------------------------- the rules

/** Every run of one sound: RUN or more calls, each under RUN_GAP after the one before: [{name, times}]. */
export function findRuns(events) {
  const found = [];
  for (const name of new Set(events.map((e) => e.name))) {
    const times = events.filter((e) => e.name === name).map((e) => e.t).sort((a, b) => a - b);
    let group = times.slice(0, 1);
    for (const t of [...times.slice(1), null]) {
      if (t !== null && t - group.at(-1) < RUN_GAP) { group.push(t); continue; }
      if (group.length >= RUN) found.push({ name, times: group });
      group = t === null ? [] : [t];
    }
  }
  return found;
}

/** The sample index of a sound's loudest moment, and where it is audible: [first, last] sample
 *  indices of the blocks within AUDIBLE_DB of the peak. */
export function profile(x) {
  let peak = 0, at = 0;
  for (let i = 0; i < x.length; i++) if (Math.abs(x[i]) > peak) { peak = Math.abs(x[i]); at = i; }
  const block = Math.round(0.005 * RATE), thr = peak * 10 ** (-AUDIBLE_DB / 20);
  let first = -1, last = 0;
  for (let b = 0; b * block < x.length; b++) {
    let m = 0;
    for (let i = b * block; i < Math.min(x.length, (b + 1) * block); i++) m = Math.max(m, Math.abs(x[i]));
    if (m >= thr) { if (first < 0) first = b * block; last = Math.min(x.length, (b + 1) * block); }
  }
  return { peakAt: at, first: Math.max(0, first), last };
}

/** A rendered sound's key: its name, and the scale step when it is not the first. */
export const keyOf = (e) => (e.step ? `${e.name}@${e.step}` : e.name);

/** Where a call's sound begins, as a sample offset before its time: the kit's anchor. */
const anchorIndex = (spec, p) => (spec.anchor === "start" ? p.first : p.peakAt);

/** The seconds a call's sound is audible, as [from, to], given its time. */
export function audibleSpan(spec, x, t) {
  const p = profile(x), a = anchorIndex(spec, p);
  return [t + (p.first - a) / RATE, t + (p.last - a) / RATE];
}

/** Every sound audible over a sentence's first word: [{name, t, from, to, sentence}]. `starts` are sentence start times. */
export function sentenceStartClashes(events, rendered, starts) {
  const hits = [];
  for (const e of events) {
    const [from, to] = audibleSpan(rendered[keyOf(e)].spec, rendered[keyOf(e)].x, e.t);
    for (const s of starts) if (from < s + CLEAR_AFTER && to > s - CLEAR_BEFORE) hits.push({ name: e.name, t: e.t, from, to, sentence: s });
  }
  return hits;
}

/** Throw the refusal for a run, a sound on a sentence's first word, or a time outside the video. */
export function enforce(events, rendered, timing) {
  const total = timing.total;
  const late = events.find((e) => !(e.t >= 0 && e.t <= total));
  if (late) throw new Error(`the ${late.name} at ${late.t} s (${late.label}) falls outside the video's 0 to ${total} s`);
  const runs = findRuns(events);
  if (runs.length) {
    const { name, times } = runs[0];
    throw new Error(`${times.length} "${name}" sounds in a row from ${times[0]} s to ${times.at(-1)} s: a run of one sound pulls the ear off the voice. A sound marks a thing moving, landing or arriving, never each item of a list; sound the list arriving once, or not at all${runs.length > 1 ? ` (${runs.length} runs in all)` : ""}`);
  }
  const starts = timing.scenes.flatMap((s) => s.sentences.map((x) => x.start));
  const clash = sentenceStartClashes(events, rendered, starts);
  if (clash.length) {
    throw new Error(`${clash.length} sound${clash.length > 1 ? "s land" : " lands"} on the start of a sentence, where ${clash.length > 1 ? "they read" : "it reads"} as a glitch in the voice:\n` +
      clash.map((c) => `  "${c.name}" at ${c.t} s is audible from ${round(c.from)} s to ${round(c.to)} s, over the sentence that starts at ${c.sentence} s. Move it ${round(c.to - (c.sentence - CLEAR_BEFORE))} s earlier (into the gap before the sentence) or ${round(c.sentence + CLEAR_AFTER - c.from)} s later (onto a word inside it), with data-sfx-offset or the time in sfx(); or lengthen the pause with video.json "gap" or "lead"`).join("\n"));
  }
}

// ---------------------------------------------------------------- the track

/** Mix `events` into a stereo 48 kHz track `total` seconds long, each at its measured level against `reference` (the voice's LUFS).
 *  Returns {samples: Int16Array (interleaved), levels: {name: target LUFS}, peak}. */
export function mix(events, rendered, total, reference, under) {
  const out = new Float64Array(Math.round(total * RATE)), levels = {};
  const scaled = {};
  for (const [name, r] of Object.entries(rendered)) {
    const target = reference - under + (r.spec.gain ?? 0);
    const gainLin = 10 ** ((target - momentaryMax(r.x)) / 20);
    scaled[name] = r.x.map((v) => v * gainLin);
    levels[name.split("@")[0]] = round(target);
  }
  for (const e of events) {
    const r = rendered[keyOf(e)], x = scaled[keyOf(e)], g = 10 ** (e.gain / 20);
    const start = Math.round(e.t * RATE) - anchorIndex(r.spec, profile(r.x));
    for (let i = Math.max(0, -start); i < x.length && start + i < out.length; i++) out[start + i] += x[i] * g;
  }
  // A sound that rings past the video's end is cut there; fade the last 80 ms so the cut is not a click.
  const fade = Math.min(out.length, Math.round(0.08 * RATE));
  for (let i = 0; i < fade; i++) out[out.length - fade + i] *= Math.cos((i / fade) * Math.PI / 2) ** 2;
  let peak = 0;
  for (const v of out) peak = Math.max(peak, Math.abs(v));
  if (peak > MAX_PEAK) throw new Error(`the sound effects would peak at ${round(20 * Math.log10(peak))} dBFS: raise video.json sfx "under"`);
  const samples = new Int16Array(out.length * 2);
  for (let i = 0; i < out.length; i++) samples[2 * i] = samples[2 * i + 1] = Math.round(out[i] * 32767);
  return { samples, levels, peak };
}

/** Render each distinct sound the events use, once per name and scale step: {key: {spec, x}}. */
export function renderAll(events, kit, tonic) {
  const rendered = {};
  for (const e of events) {
    const spec = kit.sounds[e.name];
    if (!spec) throw new Error(`the video plays a sound named "${e.name}" (${e.label}) and the kit has none: it has ${Object.keys(kit.sounds).join(", ")}`);
    rendered[keyOf(e)] ??= { spec, x: render(spec, tonic, e.step, (f) => kit.find(f)) };
  }
  return rendered;
}

/** Gather the video's sounds, enforce the rules, and write assets/sfx.wav and assets/sfx.json.
 *  `html` is the processed scene markup (with data-at), `script` the scenes.html script text.
 *  Returns the events placed ([] when sound is off or none are asked for, and no track is written). */
export function sfxTrack({ dir, cfg, timing, sections, script }) {
  const settings = sfxSettings(cfg.sfx), record = join(dir, "assets", "sfx.json");
  const none = () => { mkdirSync(join(dir, "assets"), { recursive: true }); writeFileSync(record, JSON.stringify({ events: [] }) + "\n"); return null; };
  const ids = {}, starts = {}, ends = {};
  for (const sc of timing.scenes) { starts[sc.id] = sc.start; ends[sc.id] = round(sc.start + sc.duration); }
  const markup = [];
  for (const s of sections) { Object.assign(ids, cueTimes(s.body)); markup.push(...markupEvents(s.body, s.id)); }
  const events = [...markup, ...scriptEvents(script, { ids, starts, ends })];
  if (!settings.on || !events.length) return none();
  for (const e of events) e.scene = timing.scenes.find((s) => e.t >= s.start && e.t < s.start + s.duration)?.id ?? timing.scenes.at(-1).id;
  events.sort((a, b) => a.t - b.t);

  const kit = loadKit(settings, dir, cfg.theme);
  let tonic = settings.tonic, heard = null;
  const bed = join(dir, "assets", "music-source.wav");
  if (!tonic && cfg.music && existsSync(bed)) { heard = detectKey(monoAt48k(bed)); tonic = heard.tonic; }
  tonic ??= kit.tonic;
  const rendered = renderAll(events, kit, tonic);
  enforce(events, rendered, timing);

  const voice = join(dir, "assets", "narration.wav");
  if (!existsSync(voice)) throw new Error(`${voice} is missing: node bin/voice.mjs first (sound effects are set against the voice's loudness)`);
  const reference = round(integrated(monoAt48k(voice)));
  const { samples, levels } = mix(events, rendered, timing.total, reference, settings.under);
  for (const e of events) {
    const r = rendered[keyOf(e)], [from, to] = audibleSpan(r.spec, r.x, e.t);
    e.level = round(levels[e.name] + e.gain);      // LUFS, momentary, of this sound as placed
    e.audible = [round(from), round(to)];          // seconds, while within AUDIBLE_DB of its peak
  }
  writeWav(join(dir, "assets", "sfx.wav"), { rate: RATE, channels: 2, samples });
  writeFileSync(record, JSON.stringify({ reference, under: settings.under, tonic, key: heard, levels, events }, null, 2) + "\n");
  return { events, levels, reference, tonic };
}
