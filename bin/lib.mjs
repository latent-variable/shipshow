// Shared plumbing for the bin/ scripts: paths, the video's config, sentence splitting, WAV I/O.
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { basename, delimiter, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const HF = join(REPO, "node_modules", ".bin", "hyperframes");
export const VENV_PY = join(REPO, ".venv", "bin", "python");

/** Whether a Python can be run: a path that exists, or a bare command (`python3`, which a person may set
 *  in HYPERFRAMES_PYTHON) found on PATH. */
export function pythonExists(py) {
  if (!py) return false;
  if (py.includes("/") || py.includes("\\")) return existsSync(py);
  return (process.env.PATH || "").split(delimiter).some((d) => d && existsSync(join(d, py)));
}

export function die(msg) {
  console.error(msg);
  process.exit(1);
}

/** The video folder named on the command line, checked. */
export function videoDir(arg) {
  if (!arg) die("name a video folder, e.g. videos/how-it-works");
  const dir = resolve(arg);
  if (!existsSync(join(dir, "video.json"))) die(`${arg} has no video.json`);
  return dir;
}

// Speed is a multiplier on ShipShow's base pace, not Kokoro's own: at speed 1 Kokoro runs at
// BASE_PACE, about BASE_WPM words a minute (measured on the how-it-works video, 2026-10-17).
export const BASE_PACE = 0.85;
export const BASE_WPM = 160;
// Syllables a minute is the pace a listener hears; words a minute runs high on short words
// ("Each pull request waits on you" reads fast by words, not by ear). At speed 1, ShipShow
// speaks about 210 a minute (how-it-works, measured 2026-10-17).
export const BASE_SPM = 210;

/** Syllables in a word, by vowel groups: rough, and the same rough on every scene. */
export function syllables(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  const groups = w.replace(/e$/, "").match(/[aeiouy]+/g);
  return Math.max(1, groups ? groups.length : 1);
}
export const DEFAULT_SPEED = 1.25;
export const ESSAY_SPEED = 1.0;   // an essay is listened to for its own sake, at the voice's own pace (the owner, 2026-10-27: 1.2 "feels like speed reading")

/** A --name value from the command line: `--speed 1.4` or `--speed=1.4`; undefined if absent. */
export function flag(name, argv = process.argv) {
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === `--${name}`) return argv[i + 1];
    if (argv[i].startsWith(`--${name}=`)) return argv[i].slice(name.length + 3);
  }
}

const localDir = () => process.env.SHIPSHOW_LOCAL || join(REPO, "local");

/** This person's settings, local/config.json (tailor skill): {speed, voice, theme, sfx}. */
export function localConfig() {
  const p = join(localDir(), "config.json");
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : {};
}

/** A theme's folder: a client's own in local/themes/ first, then the shared themes/. */
export function themeDir(name) {
  for (const root of [join(localDir(), "themes"), join(REPO, "themes")]) {
    if (existsSync(join(root, name, "theme.css"))) return join(root, name);
  }
  const known = [join(localDir(), "themes"), join(REPO, "themes")].filter(existsSync).flatMap((r) => readdirSync(r));
  die(`no theme "${name}": the themes are ${[...new Set(known)].join(", ")} (skills/theme makes a new one)`);
}

/** A theme's CSS, with its relative url()s pointed at assets/theme/, where its files are
 *  copied (fonts, a logo), so a render needs no network. */
export function themeCss(name, videoFolder, namespace = "") {
  const src = themeDir(name);
  const dest = join(videoFolder, "assets", "theme", namespace);
  const prefix = `assets/theme/${namespace ? namespace + "/" : ""}`;
  const files = readdirSync(src).filter((f) => f !== "theme.css");
  if (files.length) {
    mkdirSync(dest, { recursive: true });
    for (const f of files) cpSync(join(src, f), join(dest, f), { recursive: true });
  }
  return readFileSync(join(src, "theme.css"), "utf8").replace(/url\(\s*(["']?)(?!data:|https?:|\/|assets\/)([^"')]+)\1\s*\)/g, (_, q, path) => `url(${q}${prefix}${path.replace(/^\.\//, "")}${q})`);
}

/** video.json "flair": a video's own motion, over its theme's. */
const FLAIR = { transition: ["none", "fade", "rise", "slide", "zoom", "wipe", "flash"], entrance: null, camera: ["none", "push"], ambient: ["none", "glow", "grid", "dots", "stars", "horizon", "blobs", "dust", "skyline", "grain", "scanlines", "vignette"], "ambient-strength": null, progress: ["on", "off"] };
export function flairCss(flair = {}) {
  const lines = Object.entries(flair).map(([k, v]) => {
    if (!(k in FLAIR)) die(`video.json flair has "${k}"; it takes ${Object.keys(FLAIR).join(", ")}`);
    if (FLAIR[k] && !String(v).split(/\s+/).every((x) => FLAIR[k].includes(x))) die(`video.json flair ${k} is "${v}"; it takes ${FLAIR[k].join(", ")}`);
    return `  --${k}: ${v};`;
  });
  return lines.length ? `#root {\n${lines.join("\n")}\n}` : "";
}

/** A number from the video's name, so each video's ambient motion is its own but repeatable. */
export function seedFor(name) {
  let h = 2166136261;
  for (const c of name) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

// The optional OmniVoice engine (bin/omnivoice.py): which model, and the built-in voices.
export const OMNI = JSON.parse(readFileSync(join(REPO, "bin", "omnivoice-voices.json"), "utf8"));
const OMNI_SPEEDS = [1.0, 1.3];  // the range it was tested at; mlx-audio's own pace at 1.0 is about BASE_WPM

// The optional Drama 3 engine (bin/drama.py): Fish Audio's directed voice, run on MLX in its own venv (.venv-drama,
// npm run setup:drama). The 4-bit community conversion, pinned; SHIPSHOW_DRAMA_MODEL or local/config.json "dramaModel"
// names a folder that already holds it. It reads at its own pace, slower than ShipShow's base (a 15 s clone of the owner:
// about 130 words a minute), and has no speed control, so a take is time-stretched to `speed` after it is made.
export const DRAMA = { repo: "mlx-community/fish-audio-drama-3-4bit", revision: "cc639e27aba7edb73429d3e3806f471dcd79d316" };
export const DRAMA_PY = join(REPO, ".venv-drama", "bin", "python");
// The optional second listen (bin/listen.py): Parakeet on MLX hears the finished narration (npm run setup:listen).
export const LISTEN_PY = join(REPO, ".venv-listen", "bin", "python");
const DRAMA_SPEEDS = [0.8, 1.5];

/** A voice for the omnivoice engine: a clone (local/voices/<name>.wav, and <name>.txt beside it
 *  with the words spoken in the clip) or a built-in one. `identity` is what a take was made from,
 *  so a clip replaced under the same name is a different voice and its takes are voiced again.
 *  Undefined when the name is neither. */
export function omniVoice(name) {
  const wav = join(localDir(), "voices", `${name}.wav`);
  if (existsSync(wav)) {
    const txt = wav.replace(/\.wav$/, ".txt");
    const text = existsSync(txt) ? readFileSync(txt, "utf8").trim() : null;
    const sha = createHash("sha256").update(readFileSync(wav)).update(text ?? "").digest("hex").slice(0, 16);
    return { name, wav, text, identity: `${name}@${sha}` };
  }
  if (OMNI.builtIn[name]) return { name, identity: `${name}@${OMNI.voicesRevision}` };
}

/** video.json with its defaults filled in. The most specific setting wins: --speed or --theme
 *  on the command line, then video.json, then local/config.json, then the defaults. */
export function config(dir, argv = process.argv) {
  const local = localConfig();
  const own = JSON.parse(readFileSync(join(dir, "video.json"), "utf8"));
  const cfg = {
    title: basename(dir),
    engine: local.engine || "kokoro",  // "kokoro", "omnivoice" (higher quality, cloned voices) or "drama" (directed delivery, cloned voices); both Apple Silicon
    voice: local.voice,                // a Kokoro voice (af_heart) or an omnivoice one (local/voices/<name>.wav, or a built-in)
    speed: local.speed ?? DEFAULT_SPEED,
    theme: local.theme || "shipshow",
    flair: {},
    sfx: local.sfx,    // sound effects (bin/sfx.mjs): false, a kit name, or {kit, under, tonic}; local/config.json sets one for every video
    say: {},           // written form -> what Kokoro is told to say ("HyperFrames": "hyper frames")
    lead: 0.5,         // silence before a scene's first sentence, seconds at speed 1
    gap: 0.35,         // between sentences
    tail: 0.9,         // after a scene's last sentence
    hold: 0,           // still frame after the video's last word, in plain seconds (not scaled by speed)
    pauses: {},        // extra plain seconds after a scene's last sentence: {"04-theory": 2}
    leads: {},         // extra plain seconds before a scene's first sentence: a new act's look and music arrive alone
    beat: 0.6,         // extra plain seconds where a blank line in the script separates two lines (beatsAfter)
    ...own,
  };
  // An essay with no speed of its own is read at the voice's pace; a person's local speed still wins.
  if (cfg.kind === "essay" && local.speed === undefined && own.speed === undefined) cfg.speed = ESSAY_SPEED;
  if (flag("engine", argv) !== undefined) cfg.engine = flag("engine", argv);
  if (flag("voice", argv) !== undefined) cfg.voice = flag("voice", argv);
  if (!["kokoro", "omnivoice", "drama"].includes(cfg.engine)) die(`engine is "${cfg.engine}"; it takes kokoro, omnivoice or drama`);
  if (flag("speed", argv) !== undefined) cfg.speed = Number(flag("speed", argv));
  if (flag("theme", argv) !== undefined) cfg.theme = flag("theme", argv);
  if (!(cfg.speed >= 0.5 && cfg.speed <= 2)) die(`speed ${cfg.speed} is outside 0.5 to 2`);
  if (!(typeof cfg.beat === "number" && cfg.beat >= 0 && cfg.beat <= 5)) die(`beat is ${JSON.stringify(cfg.beat)}; it takes 0 to 5 seconds`);
  for (const field of ["pauses", "leads"]) for (const [id, sec] of Object.entries(cfg[field] || {})) {
    if (!(typeof sec === "number" && sec >= 0 && sec <= 10)) die(`${field}["${id}"] is ${JSON.stringify(sec)}; it takes 0 to 10 seconds`);
  }
  if (cfg.engine === "omnivoice" || cfg.engine === "drama") {
    // Both clone from a recording: a clip in local/voices/ or one of the built-in ones. A Kokoro voice id (af_heart)
    // under these engines is the template's or a person's default, not a choice: it gives way to the default clip.
    // A name that is neither is a typo, and says so.
    cfg.omni = (cfg.voice && omniVoice(cfg.voice)) || (!cfg.voice || /^[a-z]{2}_[a-z]+$/.test(cfg.voice) ? omniVoice(OMNI.default) : undefined);
    if (!cfg.omni) {
      const clones = existsSync(join(localDir(), "voices")) ? readdirSync(join(localDir(), "voices")).filter((f) => f.endsWith(".wav")).map((f) => f.slice(0, -4)) : [];
      die(`no ${cfg.engine} voice "${cfg.voice}": the built-in ones are ${Object.keys(OMNI.builtIn).join(", ")}${clones.length ? `; yours (local/voices/) are ${clones.join(", ")}` : ""}. A clone is a recording at local/voices/<name>.wav (3 to 10 s for omnivoice, 3 to 30 s for drama)`);
    }
    cfg.voice = cfg.omni.name;
    const [lo, hi] = cfg.engine === "drama" ? DRAMA_SPEEDS : OMNI_SPEEDS;
    if (cfg.speed < lo || cfg.speed > hi) die(`speed ${cfg.speed} is outside ${lo} to ${hi}, the range ${cfg.engine} was tested at (kokoro takes 0.5 to 2)`);
    if (cfg.engine === "drama") cfg.dramaModel = process.env.SHIPSHOW_DRAMA_MODEL || local.dramaModel || null;
  } else {
    cfg.voice ||= "af_heart";
  }
  cfg.kokoroSpeed = Math.round(BASE_PACE * cfg.speed * 1000) / 1000;
  // A video that shows code or captured output gets critic-grounding (skills/critic-grounding): set
  // "shows_code" in video.json, or it is read from scenes.html (a <pre> or <code> element). Code in the scenes
  // always counts: "shows_code": false cannot lower the floor.
  const scenesHtml = join(dir, "scenes.html");
  const found = existsSync(scenesHtml) && /<(pre|code)\b|class=["'][^"']*\bss-code\b/i.test(readFileSync(scenesHtml, "utf8"));
  cfg.shows_code = cfg.shows_code === true || found;
  return cfg;
}

/** The scenes, in file-name order: [{id, text}]. */
export function scenes(dir) {
  const sdir = join(dir, "script");
  if (!existsSync(sdir)) die(`${dir} has no script/ folder`);
  const files = readdirSync(sdir).filter((f) => f.endsWith(".txt")).sort();
  if (!files.length) die(`${sdir} has no .txt files`);
  return files.map((f) => ({ id: f.replace(/\.txt$/, ""), text: readFileSync(join(sdir, f), "utf8").trim() }));
}

/** A scene's text as sentences. A sentence ends at . ! or ? followed by a space. */
export function sentences(text) {
  return text.replace(/\s+/g, " ").split(/(?<=[.!?])\s+(?=\S)/).filter(Boolean);
}

/** A stage direction in a script: `[deadpan]`, `[laughs]`, `[slowly, like it's obvious]`. Drama 3 performs it where it
 *  stands; nothing else ever shows or says it (DESIGN D55). */
export const DIRECTION = /\[[^\]\n]*\]/g;
/** Text with its stage directions taken out, as captions show it and the other engines read it. */
export const withoutDirections = (text) => text.replace(DIRECTION, " ").replace(/\s+/g, " ").replace(/\s+([,.!?;:])/g, "$1").trim();

/** A scene's sentences with their stage directions: [{text, directed}], `text` without them (what is shown and timed),
 *  `directed` with them (what Drama 3 is told). A full stop inside a direction never ends a sentence, and a direction
 *  stays on its own line when every line ends a sentence (each line is then a take, lineRuns): at a line's end
 *  (`It's fine. [laughs]`) it stays with that line's last sentence. Text whose lines do not each end a sentence is
 *  one paragraph, as `sentences` reads it. */
export function directedSentences(text) {
  const lines = text.split(/\n/).filter((l) => l.trim());
  const byLine = lines.every((l) => /[.!?]["')\u201d\u2019]*$/.test(withoutDirections(l)));
  return byLine ? lines.flatMap(directedLine) : directedLine(text);
}
function directedLine(text) {
  const kept = [];
  const masked = text.replace(DIRECTION, (d) => `\u0000${kept.push(d) - 1}\u0000`);
  const back = (s) => s.replace(/\u0000(\d+)\u0000/g, (_, i) => kept[+i]);
  const out = [];
  for (const piece of sentences(masked).map(back)) {
    const plain = withoutDirections(piece);
    if (!plain) {
      if (out.length) out[out.length - 1].directed += ` ${piece}`;
      else out.push({ text: "", directed: piece });   // a direction before any words: it joins the first sentence below
      continue;
    }
    if (out.length && !out[out.length - 1].text) out[out.length - 1] = { text: plain, directed: `${out[out.length - 1].directed} ${piece}` };
    else out.push({ text: plain, directed: piece });
  }
  return out.filter((s) => s.text);
}

/** What Kokoro is told to say for a sentence: video.json "say" applied, whole words only. */
export function spoken(sentence, say) {
  let out = sentence;
  for (const [written, said] of Object.entries(say)) {
    const esc = written.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`(?<![\\w])${esc}(?![\\w])`, "g"), said);
  }
  return out;
}

/** A sentence's written words, each with what the voice is told to say for it: [{w, say}]. A `say` key of
 *  several words ("the CTO") is one spoken unit, so its first written word carries it and the rest say
 *  nothing of their own; bin/wordtime.py puts a time on each written word from what is heard. */
export function spokenWords(sentence, say = {}) {
  const words = sentence.split(" ");
  const out = words.map((w) => ({ w, say: spoken(w, say) }));
  const starts = [];                                   // where each word begins in the sentence
  words.reduce((at, w) => (starts.push(at), at + w.length + 1), 0);
  for (const [written, said] of Object.entries(say)) {
    if (!written.includes(" ")) continue;
    const esc = written.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    for (const m of sentence.matchAll(new RegExp(`(?<![\\w])${esc}(?![\\w])`, "g"))) {
      const first = starts.indexOf(m.index);
      if (first < 0) continue;
      const n = written.split(" ").length;
      out[first].say = said;
      for (let k = 1; k < n; k++) out[first + k].say = "";
    }
  }
  return out;
}

/** The sentences of a scene (already `say`-mapped, as the voice will read them) grouped into runs of whole
 *  sentences of up to `limit` words: [[0, 1, 2], [3]] by sentence number. A sentence longer than the limit
 *  stands alone. One take per run, so a run keeps its own prosody across the sentences in it (DESIGN D47);
 *  45 words is what DAIS product-videos found a scene could be voiced in without dropping words. */
/** A scene's runs when its script file is written one thought per line: each line's sentences are one take, so sentences
 *  meant to land together are voiced together (Lino, 2026-10-27: takes cut by word count "don't sound like they're meant to
 *  be one after the other"). A line over LINE_MAX words is split by groupRuns, since OmniVoice drops words in long takes. A file
 *  that is one paragraph, or whose lines do not each end a sentence, falls back to groupRuns. Returns {runs, byLine}. */
export const LINE_MAX = 70;
/** The longest gap between two words of one sentence of a take, as text, when it is over 2.5 s; else null. Drama 3 read
 *  "Like animals." with 3 s between the words and passed every other check; the longest such gap in two videos' 1,204 word
 *  pairs was 1.9 s (a year said out loud). A pause between sentences is a beat and is never judged. bin/hearback.py
 *  `drawled` is the same rule, which bin/drama.py retakes on; this one flags takes already made. */
export function drawled(sentences) {
  let worst = null;
  for (const s of sentences || []) {
    const w = s.words || [];
    for (let i = 1; i < w.length; i++) {
      const gap = w[i].at - w[i - 1].at;
      if (gap > 2.5 && (!worst || gap > worst[0])) worst = [gap, w[i - 1].w, w[i].w];
    }
  }
  return worst && `${worst[0].toFixed(1)} s between "${worst[1]}" and "${worst[2]}"`;
}

/** The sentences a blank line follows in a scene's script: after each, the voice step leaves a beat (video.json `beat`
 *  seconds on top of the gap) so a punchline lands before the next point. Indices into directedSentences(text); empty
 *  when the lines do not split into whole sentences. */
export function beatsAfter(text) {
  const lines = text.split(/\n/).map((l) => l.trim());
  const counts = lines.map((l) => (l ? directedSentences(l).length : 0));
  if (counts.reduce((x, y) => x + y, 0) !== directedSentences(text).length) return new Set();
  const beats = new Set();
  let at = 0;
  lines.forEach((l, i) => {
    at += counts[i];
    if (!l && at > 0 && lines.slice(i + 1).some(Boolean) && lines[i - 1]) beats.add(at - 1);
  });
  return beats;
}

export function lineRuns(text, says) {
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return { runs: groupRuns(says), byLine: false };
  const counts = lines.map((l) => directedSentences(l).length);
  if (counts.reduce((x, y) => x + y, 0) !== says.length) return { runs: groupRuns(says), byLine: false };
  const runs = [];
  let at = 0;
  for (const n of counts) {
    const idx = Array.from({ length: n }, (_, k) => at + k);
    const words = idx.reduce((w, i) => w + says[i].split(/\s+/).filter(Boolean).length, 0);
    if (words <= LINE_MAX) runs.push(idx);
    else for (const sub of groupRuns(idx.map((i) => says[i]))) runs.push(sub.map((k) => idx[k]));
    at += n;
  }
  return { runs, byLine: true };
}

export function groupRuns(says, limit = 45) {
  const runs = [];
  let words = 0;
  says.forEach((text, i) => {
    const n = text.split(/\s+/).filter(Boolean).length;
    if (runs.length && words + n <= limit) {
      runs[runs.length - 1].push(i);
      words += n;
    } else {
      runs.push([i]);
      words = n;
    }
  });
  return runs;
}

export const norm = (w) => w.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Run a command, resolve with its stdout, reject with its output on failure. */
export function run(cmd, args, opts = {}) {
  return new Promise((ok, fail) => {
    const p = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"], ...opts });
    let out = "", err = "";
    p.stdout?.on("data", (d) => (out += d));
    p.stderr?.on("data", (d) => (err += d));
    p.on("error", fail);
    p.on("close", (code) => (code === 0 ? ok(out) : fail(new Error(`${basename(cmd)} exited ${code}\n${out.slice(-800)}${err.slice(-800)}`))));
  });
}

/** The environment `hyperframes tts` needs: this repo's venv as its Python, unless one is set. */
export function ttsEnv() {
  return { ...process.env, HYPERFRAMES_PYTHON: process.env.HYPERFRAMES_PYTHON || VENV_PY };
}

/** A 16-bit PCM WAV: {rate, channels, samples: Int16Array}. Kokoro writes 24 kHz mono. */
export function readWav(path) {
  const b = readFileSync(path);
  if (b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WAVE") die(`${path} is not a WAV file`);
  let fmt = null;
  for (let o = 12; o + 8 <= b.length; ) {
    const id = b.toString("ascii", o, o + 4), size = b.readUInt32LE(o + 4);
    if (id === "fmt ") {
      fmt = { format: b.readUInt16LE(o + 8), channels: b.readUInt16LE(o + 10), rate: b.readUInt32LE(o + 12), bits: b.readUInt16LE(o + 22) };
    } else if (id === "data") {
      if (!fmt || fmt.format !== 1 || fmt.bits !== 16) die(`${path} is not 16-bit PCM`);
      const data = b.subarray(o + 8, o + 8 + size);
      const samples = new Int16Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.length));
      return { rate: fmt.rate, channels: fmt.channels, samples };
    }
    o += 8 + size + (size % 2);
  }
  die(`${path} has no audio data`);
}

export function writeWav(path, { rate, channels, samples }) {
  const data = Buffer.from(samples.buffer, samples.byteOffset, samples.byteLength);
  const h = Buffer.alloc(44);
  h.write("RIFF", 0, "ascii");
  h.writeUInt32LE(36 + data.length, 4);
  h.write("WAVEfmt ", 8, "ascii");
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(channels, 22);
  h.writeUInt32LE(rate, 24);
  h.writeUInt32LE(rate * channels * 2, 28);
  h.writeUInt16LE(channels * 2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36, "ascii");
  h.writeUInt32LE(data.length, 40);
  writeFileSync(path, Buffer.concat([h, data]));
}

export const round = (x) => Math.round(x * 100) / 100;

/** A render's file name, from the video's path, so two folders that share a name do not
 *  overwrite each other: videos/how-it-works -> how-it-works, local/videos/a/demo -> local-videos-a-demo. */
export function outName(dir) {
  const rel = relative(REPO, resolve(dir));
  if (rel.startsWith("..")) return basename(dir);
  return rel.replace(/^videos[\\/]/, "").replace(/[\\/]+/g, "-");
}

// The critic loop's dials (skills/critic-loop). A preset sets them all; anything set more
// specifically wins: a flag on bin/critics.mjs, then video.json "review", then the person's
// local/config.json "review", then the preset (a decision video's default is quick).
const BASE_CRITICS = ["critic-accuracy", "critic-clarity", "critic-pacing", "critic-sync", "critic-visuals", "critic-consistency", "critic-engagement"];
const TASTE_CRITICS = ["critic-clarity", "critic-visuals", "critic-engagement"];
// The builder judges how much a video matters and records it in video.json "importance"
// (skills/critic-loop, *How much review*); each level picks a preset.
export const IMPORTANCE = { low: "quick", normal: "standard", high: "thorough" };
export const PRESETS = {
  quick: { critics: ["critic-accuracy", "critic-sync", "critic-visuals"], rounds: 1, until: "blocking", model: "sonnet", final: null, frames: "scenes", rerun: "failed" },
  standard: { critics: BASE_CRITICS, rounds: 2, until: "major", model: "sonnet", final: null, frames: "cues", rerun: "failed" },
  thorough: { critics: BASE_CRITICS, rounds: 3, until: "major", model: "sonnet", final: "opus", frames: "cues", rerun: "failed" },
};
const ONE_OF = { until: ["blocking", "major", "minor"], frames: ["cues", "scenes"], rerun: ["failed", "touched", "all"] };
// Wall-clock minutes for one critic, and thousands of tokens as a base plus a share per minute of
// video (a critic reads the whole packet and its frames). Measured on how-it-works (about 70 s),
// 2026-10-17, and eth-is-false (about 10 min), 2026-10-27: Sonnet 65k and about 110k (90 to 200k),
// Opus 110k and about 200k. The slowest critic sets a round's time. Haiku is a guess. Rough by design.
const CRITIC_COST = { haiku: { min: 0.5, k: 45, perMin: 3 }, sonnet: { min: 0.8, k: 60, perMin: 5 }, opus: { min: 2.0, k: 100, perMin: 10 } };
const PACKET_MIN = { cues: 0.15, scenes: 0.1 }, REBUILD_MIN = 0.3;

function dial(key, value) {
  if (key === "rounds") {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1 || n > 10) die(`review rounds is ${value}; it takes 1 to 10`);
    return n;
  }
  if (key === "critics") {
    const list = Array.isArray(value) ? value : String(value).split(",").map((s) => s.trim()).filter(Boolean);
    const unknown = list.filter((c) => !existsSync(join(REPO, "skills", c, "SKILL.md")) && !existsSync(join(localDir(), "skills", c, "SKILL.md")));
    if (unknown.length) die(`review critics has ${unknown.join(", ")}, which no skill in skills/ or local/skills/ defines`);
    return list;
  }
  if (key === "final") return value === "none" || value === null ? null : String(value);
  if (ONE_OF[key] && !ONE_OF[key].includes(String(value))) die(`review ${key} is "${value}"; it takes ${ONE_OF[key].join(", ")}`);
  return String(value);
}

/** `seconds`: the video's length, when known (timing.json), so the token estimate scales with it. */
export function reviewPlan(cfg, argv = process.argv, seconds = 70) {
  const kind = cfg.kind || "feature";
  if (!["decision", "feature", "release", "essay"].includes(kind)) die(`video.json kind is "${kind}"; it takes decision, feature, release, essay`);
  if (cfg.critics) die(`video.json "critics" moved into "review": {"critics": [...]} (skills/critic-loop)`);
  const cli = {};
  for (const k of ["preset", "rounds", "until", "model", "final", "frames", "rerun", "critics"]) if (flag(k, argv) !== undefined) cli[k] = flag(k, argv);
  if (cfg.importance !== undefined && !IMPORTANCE[cfg.importance]) die(`video.json importance is "${cfg.importance}"; it takes ${Object.keys(IMPORTANCE).join(", ")}`);
  // The agent's importance stands for a preset at the video's level, so it beats a person's
  // general default, while a preset set on the video or a flag in the moment beats it.
  const videoLayer = { ...(cfg.review || {}) };
  if (!videoLayer.preset && cfg.importance) videoLayer.preset = IMPORTANCE[cfg.importance];
  const layers = [localConfig().review || {}, videoLayer, cli];
  // A preset resets every dial set less specifically than it: a video's "quick" is not undone
  // by a person's "rounds": 4. Dials set at its own level or more specifically still apply.
  const from = layers.map((l) => !!l.preset).lastIndexOf(true);
  const preset = from >= 0 ? layers[from].preset : kind === "decision" ? "quick" : "standard";
  const presetFrom = from === 2 ? "flag" : from === 1 ? (cfg.review?.preset ? "video.json review" : "importance") : from === 0 ? "local/config.json" : `${kind} default`;
  if (!PRESETS[preset]) die(`review preset is "${preset}"; it takes ${Object.keys(PRESETS).join(", ")}`);
  const plan = { ...PRESETS[preset], critics: [...PRESETS[preset].critics] };
  const overrides = [];
  for (const layer of layers.slice(Math.max(0, from))) {
    for (const [k, v] of Object.entries(layer)) {
      if (k === "preset") continue;
      if (!(k in plan)) die(`review has "${k}"; it takes preset, ${Object.keys(plan).join(", ")}`);
      plan[k] = dial(k, v);
      if (!overrides.includes(k)) overrides.push(k);
    }
  }
  // The floor's critics run whatever list was asked for: no dial removes them.
  const floor = ["critic-accuracy", ...(kind === "decision" ? ["critic-decision"] : []), ...(cfg.shows_code ? ["critic-grounding"] : [])];
  // An essay is watched by choice, so its engagement critic runs unless a list was asked for; it is taste, never floor.
  if (kind === "essay" && !overrides.includes("critics") && !plan.critics.includes("critic-engagement")) plan.critics.push("critic-engagement");
  const added = floor.filter((c) => !plan.critics.includes(c));
  if (added.length) plan.critics = [...added.filter((c) => c === "critic-accuracy"), ...plan.critics, ...added.filter((c) => c !== "critic-accuracy")];
  const taste = plan.critics.filter((c) => TASTE_CRITICS.includes(c));

  // Critics run in parallel, so a round takes as long as its slowest critic, plus the packet.
  const cost = (model) => CRITIC_COST[model] || CRITIC_COST.sonnet;
  const round = (last) => {
    const models = plan.critics.map((c) => (last && plan.final && taste.includes(c) ? plan.final : plan.model));
    return { min: Math.max(...models.map((m) => cost(m).min)) + PACKET_MIN[plan.frames], k: models.reduce((a, m) => a + cost(m).k + cost(m).perMin * (seconds / 60), 0) };
  };
  const first = round(plan.rounds === 1), middle = round(false), last = round(true);
  const worst = plan.rounds === 1 ? first : { min: first.min + (plan.rounds - 2) * (middle.min + REBUILD_MIN) + last.min + REBUILD_MIN, k: first.k + (plan.rounds - 2) * middle.k + last.k };
  const r = (x) => Math.round(x * 10) / 10;
  return {
    video: cfg.title, kind, importance: cfg.importance || null, importanceReason: cfg.importance_reason || null, presetFrom, preset, ...plan, taste, floor, overrides, floorAdded: overrides.includes("critics") ? added : [],
    estimate: { firstRound: r(first.min), firstRoundTokens: Math.round(first.k), worst: r(worst.min), worstTokens: Math.round(worst.k) },
  };
}

/** video.json "music": {"file", "volume", "duck"}: a bed under the narration, lowered while
 *  the voice speaks. Writes <video>/assets/music.wav and returns true, or warns and returns
 *  false when the file is not there (music is often local: a teammate may not have it).
 *  "file" is relative to the video's folder, then the repo; "volume" is the bed's level in
 *  the gaps (0 to 1, default 0.22) and "duck" what it is multiplied by under speech (0.35). */
export function musicBed(dir, music, timing, moods = []) {
  if (moods.length > 1) return moodMusicBed(dir, music, timing, moods);
  if (!music) return false;
  const spec = typeof music === "string" ? { file: music } : music;
  const file = [join(dir, spec.file), join(REPO, spec.file), spec.file].find((p) => p && existsSync(p));
  if (!file) {
    console.warn(`music: ${spec.file} is not on this machine; building without a music bed`);
    return false;
  }
  const volume = spec.volume ?? 0.22, duck = spec.duck ?? 0.35, rate = 48000;
  const tmp = join(dir, "assets", "music-source.wav");
  mkdirSync(join(dir, "assets"), { recursive: true });
  const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", file, "-ac", "2", "-ar", String(rate), "-c:a", "pcm_s16le", tmp]);
  if (r.error?.code === "ENOENT") die("music: ffmpeg is not installed; npm run doctor says how to get it");
  if (r.status !== 0) die(`music: ffmpeg could not read ${file}\n${r.stderr}`);
  const src = readWav(tmp).samples, frames = Math.ceil(timing.total * rate), out = new Int16Array(frames * 2);
  // Where the voice speaks, padded a little, so the bed dips before a sentence and returns after.
  const spans = timing.scenes.flatMap((s) => s.sentences.map((x) => [x.start - 0.15, x.start + x.duration + 0.25]));
  const ramp = 0.3, srcFrames = src.length / 2;
  let si = 0;
  for (let f = 0; f < frames; f++) {
    const t = f / rate;
    while (si < spans.length && spans[si][1] + ramp < t) si++;
    // Distance into the nearest speech span, as a 0..1 blend toward the ducked level.
    let speech = 0;
    for (let k = si; k < spans.length && spans[k][0] - ramp <= t; k++) {
      const [a, b] = spans[k];
      speech = Math.max(speech, t < a ? 1 - (a - t) / ramp : t > b ? 1 - (t - b) / ramp : 1);
    }
    let gain = volume * (1 - speech * (1 - duck));
    gain *= Math.min(1, t / 0.8, (timing.total - t) / 2.5);   // fade in, and out over the end
    const s = (f % srcFrames) * 2;                                 // loop a shorter track
    out[f * 2] = Math.round(src[s] * gain);
    out[f * 2 + 1] = Math.round(src[s + 1] * gain);
  }
  writeWav(join(dir, "assets", "music.wav"), { rate, channels: 2, samples: out });
  return true;
}

/** Mix only explicit music changes; absent or missing tracks keep the previous playhead. */
function moodMusicBed(dir, music, timing, moods) {
  const rate = 48000, tracks = [];
  mkdirSync(join(dir, "assets"), { recursive: true });
  for (const mood of moods) {
    const musicSpec = mood.name === null ? music : mood.music;
    if (!musicSpec) continue;
    const spec = typeof musicSpec === "string" ? { file: musicSpec } : musicSpec;
    const file = [join(dir, spec.file), join(REPO, spec.file), spec.file].find((p) => existsSync(p));
    if (!file) {
      console.warn(`music: ${spec.file} is not on this machine; mood ${mood.name ?? "base"} continues the previous bed`);
      continue;
    }
    const tmp = join(dir, "assets", "music-source.wav");
    const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", file, "-ac", "2", "-ar", String(rate), "-c:a", "pcm_s16le", tmp]);
    if (r.error?.code === "ENOENT") die("music: ffmpeg is not installed; npm run doctor says how to get it");
    if (r.status !== 0) die(`music: ffmpeg could not read ${file}\n${r.stderr}`);
    const samples = readWav(tmp).samples;
    if (!samples.length) die(`music: ${file} has no samples`);
    tracks.push({ start: mood.start, samples, volume: spec.volume ?? 0.22, duck: spec.duck ?? 0.35 });
  }
  if (!tracks.length) return false;
  const frames = Math.ceil(timing.total * rate), out = new Int16Array(frames * 2);
  const spans = timing.scenes.flatMap((s) => s.sentences.map((x) => [x.start - 0.15, x.start + x.duration + 0.25]));
  const clamp = (x) => Math.max(0, Math.min(1, x));
  let si = 0, active = -1;
  for (let f = 0; f < frames; f++) {
    const t = f / rate;
    while (si < spans.length && spans[si][1] + 0.3 < t) si++;
    let speech = 0;
    for (let k = si; k < spans.length && spans[k][0] - 0.3 <= t; k++) {
      const [a, b] = spans[k];
      speech = Math.max(speech, t < a ? 1 - (a - t) / 0.3 : t > b ? 1 - (t - b) / 0.3 : 1);
    }
    const mixed = [0, 0];
    while (active + 1 < tracks.length && tracks[active + 1].start - 0.75 <= t) active++;
    let remaining = 1;
    for (let i = active; i >= 0 && remaining > 0; i--) {
      const track = tracks[i];
      const enter = track.start === 0 ? 1 : clamp((t - track.start + 0.75) / 1.5);
      let gain = enter * remaining;
      remaining *= 1 - enter;
      if (!gain) continue;
      gain *= track.volume * (1 - speech * (1 - track.duck));
      gain *= Math.min(1, t / 0.8, (timing.total - t) / 2.5);
      const n = track.samples.length / 2;
      // A track starts at the head of its crossfade, so what fades in is its own opening, never its looped-round end.
      const at = ((f - Math.round(Math.max(0, track.start - 0.75) * rate)) % n + n) % n * 2;
      mixed[0] += track.samples[at] * gain;
      mixed[1] += track.samples[at + 1] * gain;
    }
    out[f * 2] = Math.max(-32768, Math.min(32767, Math.round(mixed[0])));
    out[f * 2 + 1] = Math.max(-32768, Math.min(32767, Math.round(mixed[1])));
  }
  writeWav(join(dir, "assets", "music.wav"), { rate, channels: 2, samples: out });
  return true;
}

/** A run's take with a breath between its sentences: where Whisper heard sentence k end and k+1 start less than `minGap`
 *  seconds apart, silence is inserted at the quietest 10 ms near the boundary, with 5 ms fades either side, so the voice is
 *  never cut mid-word and its prosody is kept; a boundary with no window under BREATH_QUIET_DB near it is left alone. `bounds` is [[end of sentence k, start of sentence k+1], ...] in seconds into
 *  the take. Returns {samples, shifts}: the new interleaved Int16 samples, and for each boundary how many seconds everything
 *  after it moved (cumulative), to add to the times of the sentences that follow. */
export const BREATH_QUIET_DB = -40;   // a 10 ms window quieter than this (dBFS) is between words; speech sits around -23

export function breathe(samples, rate, channels, bounds, minGap) {
  const frames = samples.length / channels, win = Math.max(1, Math.round(rate * 0.01));
  const energy = (f0) => {
    let e = 0;
    for (let f = f0; f < Math.min(frames, f0 + win); f++) for (let c = 0; c < channels; c++) e += samples[f * channels + c] ** 2;
    return e;
  };
  const cuts = [];
  let total = 0;
  const shifts = bounds.map(([end, start]) => {
    const need = minGap - Math.max(0, start - end);
    if (need > 0.02) {
      const lo = Math.max(0, Math.round((Math.min(end, start) - 0.08) * rate)), hi = Math.min(frames - win, Math.round((Math.max(end, start) + 0.08) * rate));
      let at = Math.round(((end + start) / 2) * rate), best = Infinity;
      for (let f = lo; f <= hi; f += win) { const e = energy(f); if (e < best) { best = e; at = f + Math.floor(win / 2); } }
      // Only where it is really quiet: a boundary with no window under QUIET_DB near it is left as it is, never cut mid-word.
      const db = 20 * Math.log10(Math.sqrt(best / (win * channels)) / 32768 + 1e-9);
      if (db < BREATH_QUIET_DB) {
        cuts.push({ at: Math.min(Math.max(at, 0), frames), add: Math.round(need * rate) });
        total += need;
      }
    }
    return total;
  });
  if (!cuts.length) return { samples, shifts };
  // The take in pieces between the cuts, each faded out at its end and in at its start (5 ms), joined by the silences.
  const fade = Math.round(rate * 0.005), edges = [0, ...cuts.map((c) => c.at), frames];
  const out = new Int16Array(samples.length + cuts.reduce((a, c) => a + c.add, 0) * channels);
  let dst = 0;
  for (let p = 0; p < edges.length - 1; p++) {
    const piece = samples.slice(edges[p] * channels, edges[p + 1] * channels), n = piece.length / channels;
    for (let k = 0; k < Math.min(fade, n); k++) for (let ch = 0; ch < channels; ch++) {
      if (p > 0) piece[k * channels + ch] = Math.round(piece[k * channels + ch] * (k / fade));
      if (p < edges.length - 2) piece[(n - 1 - k) * channels + ch] = Math.round(piece[(n - 1 - k) * channels + ch] * (k / fade));
    }
    out.set(piece, dst * channels);
    dst += n + (p < cuts.length ? cuts[p].add : 0);
  }
  return { samples: out, shifts };
}

/** The loudness a render is mastered to, in LUFS, or null for none: video.json "loudness", then local/config.json, then
 *  -14 (what YouTube plays at: it turns louder videos down and never turns quieter ones up). false turns mastering off. */
export function loudnessTarget(dir) {
  const own = JSON.parse(readFileSync(join(dir, "video.json"), "utf8")).loudness;
  const value = own !== undefined ? own : localConfig().loudness !== undefined ? localConfig().loudness : DEFAULT_LOUDNESS;
  if (value === false || value === null) return null;
  if (!(typeof value === "number" && value >= -30 && value <= -9)) die(`loudness is ${JSON.stringify(value)}; it takes -30 to -9 LUFS, or false`);
  return value;
}
export const DEFAULT_LOUDNESS = -14;
export const TRUE_PEAK = -1;   // dBTP: room for the encoder's overshoot

/** ffmpeg loudnorm's first pass over a file's audio: {input_i, input_tp, input_lra, input_thresh, target_offset}. */
export function measureLoudness(file, target) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-vn", "-af", `loudnorm=I=${target}:TP=${TRUE_PEAK}:LRA=11:print_format=json`, "-f", "null", "-"], { encoding: "utf8" });
  const json = (r.stderr || "").match(/\{[^{}]*"input_i"[^{}]*\}/);
  if (r.status !== 0 || !json) die(`could not measure the loudness of ${file}\n${(r.stderr || "").trim().split("\n").slice(-3).join("\n")}`);
  return JSON.parse(json[0]);
}

/** The render's audio brought to `target` LUFS by one gain, its few peaks over TRUE_PEAK caught by a look-ahead limiter
 *  (alimiter, 5 ms attack), never by compression: loudnorm's own second pass switches to dynamic mode when the peaks do not fit,
 *  which is the squash the owner heard in narration (D44, D47). The gain is held back so the limiter takes at most MAX_LIMIT dB
 *  off a peak; a video whose peaks would need more lands under the target, and says so. The video stream is copied untouched.
 *  Returns {before, after, gain, limited}, or null for a file this already mastered to this target (its stamp), so running it
 *  twice does not stack. */
export const MAX_LIMIT = 3;
export function masterLoudness(file, target) {
  // A mastered file carries a stamp (its container comment), so a second run never stacks more gain and limiting on it.
  const stamp = `shipshow-mastered ${target} LUFS`;
  const tags = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format_tags=comment", "-of", "csv=p=0", file], { encoding: "utf8" }).stdout.trim();
  if (tags === stamp) return null;
  const m = measureLoudness(file, target);
  const before = Number(m.input_i), peak = Number(m.input_tp);
  const gain = Math.min(target - before, TRUE_PEAK + MAX_LIMIT - peak);
  const limited = Math.max(0, peak + gain - TRUE_PEAK);
  // the limiter's ceiling sits 0.5 dB under the true-peak line: it works on samples, and a reconstructed peak can sit a little higher
  const ceiling = (10 ** ((TRUE_PEAK - 0.5) / 20)).toFixed(4);
  const tmp = file.replace(/\.mp4$/, ".mastering.mp4");
  const af = `volume=${gain.toFixed(2)}dB,alimiter=limit=${ceiling}:attack=5:release=50:level=false`;
  const r = spawnSync("ffmpeg", ["-hide_banner", "-y", "-v", "error", "-i", file, "-map", "0", "-c:v", "copy", "-af", af, "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-metadata", `comment=${stamp}`, "-movflags", "+faststart", tmp], { encoding: "utf8" });
  if (r.status !== 0) die(`could not master the loudness of ${file}\n${r.stderr}`);
  renameSync(tmp, file);
  return { before, after: Number(measureLoudness(file, target).input_i), gain, limited };
}
