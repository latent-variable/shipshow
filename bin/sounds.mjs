// The sounds a video's motion makes, drawn from a few lines of math rather than a library.
//   node bin/sounds.mjs preview <kit.json> <out.wav> [--tonic F#]   every sound in a kit, one after another
//
// Why synthesized: a sound made here is ours (no licence to track), the same samples on every
// render (noise is drawn from a fixed seed, so a swish repeats), and it can be TUNED: a pitched
// sound takes the key of the music bed it plays over, so a chime is a note of the music rather
// than a beep beside it. What a formula cannot make well (paper, a door, a crowd) comes from a
// file, named in the kit as {"file": "paper.wav"} (bin/sfx.mjs finds it).
//
// Every voice returns mono Float64Array at RATE, peaking at 1.0; bin/sfx.mjs sets the level.
// Each has a soft attack of a few milliseconds (a hard edge is what makes a click sound cheap)
// and a release (a sound cut off while it still rings ends on a click). A pitched voice takes
// `freq`; the kit turns a scale step into one (`pitch`).
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const RATE = 48000;
const NOTES = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
export const NOTE_NAMES = Object.keys(NOTES);
const PENTATONIC = [0, 2, 4, 7, 9];   // the major pentatonic: no semitone in it to rub against a chord
const SEED = 7;

/** The frequency of step `step` of the major pentatonic on `tonic` in `octave` (A4 = 440). Step 5 is the octave above step 0. */
export function pitch(tonic, octave, step = 0) {
  if (!(tonic in NOTES)) throw new Error(`no note named "${tonic}": ${NOTE_NAMES.join(" ")}`);
  const o = Math.floor(step / 5), k = ((step % 5) + 5) % 5;
  return 440 * 2 ** ((NOTES[tonic] + PENTATONIC[k] + 12 * (octave + o - 4) - 9) / 12);
}

/** A seeded stream of numbers in [0,1): the same noise every render. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** Gaussian noise (Box-Muller) from a seed. */
function noise(n, seed) {
  const r = rng(seed), out = new Float64Array(n);
  for (let i = 0; i < n; i++) out[i] = Math.sqrt(-2 * Math.log(r() || 1e-12)) * Math.cos(2 * Math.PI * r());
  return out;
}

const count = (seconds) => Math.max(1, Math.round(seconds * RATE));
const time = (n) => Float64Array.from({ length: n }, (_, i) => i / RATE);

function normalize(x) {
  let peak = 0;
  for (const v of x) peak = Math.max(peak, Math.abs(v));
  return peak > 0 ? x.map((v) => v / peak) : x;
}
function attack(x, seconds = 0.003) {
  const k = Math.min(x.length, Math.max(1, Math.round(seconds * RATE)));
  for (let i = 0; i < k; i++) x[i] *= Math.sin((i / k) * Math.PI / 2) ** 2;
  return x;
}
function release(x, share = 0.25) {
  const k = Math.max(1, Math.floor(x.length * share));
  for (let i = 0; i < k; i++) x[x.length - k + i] *= Math.cos((i / k) * Math.PI / 2) ** 2;
  return x;
}
const finish = (x, att, rel) => normalize(release(attack(x, att), rel));

/** In-place radix-2 FFT of (re, im), whose length is a power of two. */
export function fft(re, im, inverse = false) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (2 * Math.PI / len) * (inverse ? 1 : -1), wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = i + k + len / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti;
        re[a] += tr; im[a] += ti;
        const nr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = nr;
      }
    }
  }
  if (inverse) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
}

/** `x` kept between lo and hi Hz, with soft shoulders so the band has no ring. */
function band(x, lo, hi) {
  let n = 1;
  while (n < x.length) n <<= 1;
  const re = new Float64Array(n), im = new Float64Array(n);
  re.set(x);
  fft(re, im);
  for (let k = 0; k < n; k++) {
    const f = Math.min(k, n - k) * RATE / n;
    const g = 1 / (1 + (lo / Math.max(f, 1)) ** 8) / (1 + (f / hi) ** 8);
    re[k] *= g; im[k] *= g;
  }
  fft(re, im, true);
  return re.slice(0, x.length);
}

/** A small bell: a few partials, the higher ones fading first. */
export function chime({ freq, length = 1.4, decay = 0.6 }) {
  const n = count(length), t = time(n), x = new Float64Array(n);
  for (const [ratio, amp, tau] of [[1, 1, 1], [2, 0.32, 0.55], [2.76, 0.1, 0.32], [5.4, 0.05, 0.14]]) {
    for (let i = 0; i < n; i++) x[i] += amp * Math.sin(2 * Math.PI * freq * ratio * t[i]) * Math.exp(-t[i] / (decay * tau));
  }
  return finish(x, 0.004, 0.4);
}

/** Chimes one after another, each `gap` seconds after the last, ringing together. */
export function arpeggio({ freqs, gap = 0.1, length = 1.6, decay = 0.6 }) {
  const out = new Float64Array(count(length + gap * (freqs.length - 1)));
  freqs.forEach((f, i) => {
    const c = chime({ freq: f, length, decay }), s = Math.round(i * gap * RATE), g = 0.85 ** i;
    for (let k = 0; k < c.length && s + k < out.length; k++) out[s + k] += c[k] * g;
  });
  return normalize(release(out, 0.15));
}

/** Air moving past: band-limited noise that swells to `peak_at` of its length and falls away. Something sliding or rising into place. */
export function swish({ length = 0.32, lo = 1800, hi = 7000, peak_at = 0.65 }) {
  const n = count(length), t = time(n), p = peak_at * length;
  const x = band(noise(n, SEED + 1), lo, hi);
  for (let i = 0; i < n; i++) x[i] *= t[i] < p ? (t[i] / p) ** 2 : Math.exp(-(t[i] - p) / (0.18 * length));
  return finish(x, 0.003, 0.1);
}

/** A soft landing: a low note falling in pitch, and a small knock on top. Something set down. */
export function thump({ length = 0.22, start = 170, end = 68, knock = 0.25 }) {
  const n = count(length), t = time(n), x = new Float64Array(n);
  const k = band(noise(n, SEED + 2), 900, 4000);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    phase += 2 * Math.PI * (end + (start - end) * Math.exp(-t[i] / 0.03)) / RATE;
    x[i] = Math.sin(phase) * Math.exp(-t[i] / 0.06);
    x[i] += knock * k[i] * Math.exp(-t[i] / 0.006) / 2;
  }
  return finish(x, 0.002, 0.25);
}

/** A deep bass hit in the spirit of the vine boom: a sine that falls hard from a punch to a sub,
 *  pushed through a soft clip so it grows the harmonics a laptop speaker can actually play, a low
 *  growl an octave up, a short click, and a tail that rings down. Mark a punchline with it. */
export function boom({ length = 1.7, punch = 200, sub = 52, decay = 0.5, drive = 3.5 }) {
  const n = count(length), t = time(n), x = new Float64Array(n);
  const click = band(noise(n, SEED + 3), 150, 1400);
  let phase = 0, mid = 0;
  for (let i = 0; i < n; i++) {
    const f = sub + (punch - sub) * Math.exp(-t[i] / 0.045);       // falls from the punch to the sub in a tenth of a second
    phase += 2 * Math.PI * f / RATE;
    // The mid thud is what a small speaker plays: a note that falls from 330 to 120 Hz and dies in a fifth of a second.
    mid += 2 * Math.PI * (120 + 210 * Math.exp(-t[i] / 0.05)) / RATE;
    const body = 0.8 * Math.sin(phase) * Math.exp(-t[i] / decay) + 0.55 * Math.sin(mid) * Math.exp(-t[i] / 0.16);
    const growl = 0.35 * Math.sin(2 * phase + 0.6) * Math.exp(-t[i] / (decay * 0.5));
    x[i] = Math.tanh(drive * (body + growl)) / Math.tanh(drive) + 0.9 * click[i] * Math.exp(-t[i] / 0.012);
  }
  return finish(x, 0.0015, 0.4);
}

/** A record scratch: a harmonic buzz read off a platter that is dragged forward, back and stopped.
 *  The read speed is the pitch, so the buzz swoops up and down and winds to nothing; a hiss of
 *  surface noise follows the speed. `length` stretches the whole gesture. */
export function scratch({ length = 0.55, base = 110 }) {
  const table = count(1.6), src = new Float64Array(table), grit = band(noise(table, SEED + 4), 300, 3800);
  for (let i = 0; i < table; i++) {
    const ti = i / RATE;
    let v = 0;
    for (let k = 1; k <= 28; k++) {
      const f = k * base, formant = 1 + 3 * Math.exp(-(((f - 750) / 320) ** 2)) + 2 * Math.exp(-(((f - 2300) / 600) ** 2));
      v += (formant / k) * Math.sin(2 * Math.PI * f * ti + k * 1.7);
    }
    src[i] = v + 0.5 * grit[i];
  }
  // Platter speed over the gesture, in table-seconds per second: forward, back, forward, stop.
  const keys = [[0, 0], [0.025, 2.6], [0.1, 2.1], [0.15, 0.05], [0.19, -2.8], [0.26, -2.3], [0.3, 0], [0.34, 1.9], [0.4, 1.0], [0.5, 0.2], [0.55, 0]];
  const stretch = length / 0.55, n = count(length);
  const speed = (ts) => {
    const u = ts / stretch;
    for (let k = 1; k < keys.length; k++) {
      if (u <= keys[k][0]) {
        const [t0, v0] = keys[k - 1], [t1, v1] = keys[k], m = (1 - Math.cos(Math.PI * (u - t0) / (t1 - t0))) / 2;
        return v0 + (v1 - v0) * m;
      }
    }
    return 0;
  };
  const surface = band(noise(n, SEED + 5), 2500, 7000), x = new Float64Array(n);
  let pos = 0.4 * RATE;
  for (let i = 0; i < n; i++) {
    const v = speed(i / RATE), a = Math.min(1, Math.abs(v) / 0.9) ** 0.7;
    pos += v;
    const p = ((pos % table) + table) % table, i0 = Math.floor(p), fr = p - i0;
    x[i] = (src[i0] * (1 - fr) + src[(i0 + 1) % table] * fr) * a + 0.9 * surface[i] * Math.min(1, Math.abs(v) / 1.5);
  }
  return finish(x, 0.003, 0.15);
}

/** The sad trombone: four notes falling a half step each, "wah wah wah waaah", the last one long,
 *  sliding down and shaking. A brass tone (harmonics falling as 1/k) under a vowel that opens and
 *  closes on every note, which is the plunger mute's wah. Anchored at its start, not its peak. */
export function sad_trombone({ start = 233.08, tempo = 1 }) {
  const notes = [[0, 0.4], [-1, 0.4], [-2, 0.4], [-3, 1.35]];
  const gap = 0.06;
  const total = notes.reduce((a, [, d]) => a + d + gap, 0) * tempo + 0.2, n = count(total), x = new Float64Array(n);
  const breath = band(noise(n, SEED + 6), 900, 3500);
  let at = 0;
  notes.forEach(([semi, dur], idx) => {
    const last = idx === notes.length - 1, d = dur * tempo, s0 = count(at), len = count(d + 0.08);
    let phase = 0;
    for (let i = 0; i < len && s0 + i < n; i++) {
      const u = i / RATE / d;                                   // 0..1 through the note
      const slide = last ? -1.4 * Math.min(1, u) ** 1.5 : 0;     // the long note sags another semitone and a half
      const vib = last ? 0.35 * Math.min(1, u * 2) * Math.sin(2 * Math.PI * 5.6 * (i / RATE)) : 0;
      const scoop = -0.7 * Math.exp(-u * 18);                    // every note lips up from just under its pitch
      const f0 = start * 2 ** ((semi + slide + vib + scoop) / 12);
      phase += 2 * Math.PI * f0 / RATE;
      // The wah: the vowel's centre opens from a closed 380 Hz to about 1100 and closes again.
      const open = last ? Math.sin(Math.PI * Math.min(1, u * 1.6)) ** 2 * (1 - 0.4 * u) : Math.sin(Math.PI * Math.min(1, u * 1.1)) ** 1.5;
      const fc = 380 + 760 * open;
      let v = 0;
      for (let k = 1; k * f0 < 5200; k++) {
        const w = Math.log2((k * f0) / fc);
        v += (1 / k ** 1.05) * (0.12 + Math.exp(-(w * w) / 0.9)) * Math.sin(k * phase);
      }
      const env = Math.min(1, i / (0.035 * RATE)) * (last ? Math.exp(-u * 0.9) : Math.exp(-u * 0.7)) * Math.min(1, (len - i) / (0.06 * RATE));
      x[s0 + i] += (v + 0.5 * breath[s0 + i] * Math.exp(-i / (0.03 * RATE))) * env;
    }
    at += d + gap * tempo;
  });
  return finish(x, 0.004, 0.08);
}

/** A bright ding: a struck bar's inharmonic partials (1, 2.76, 5.4, 8.9 times the note), the
 *  fundamental ringing and the rest dying fast, and a pair slightly apart for a shimmer. A game
 *  show right answer, or a desk bell. */
export function ding({ freq, length = 1.3, decay = 0.55 }) {
  const n = count(length), t = time(n), x = new Float64Array(n);
  for (const [ratio, amp, tau, detune] of [[1, 1, 1, 0], [1, 0.5, 0.9, 1.7], [2.76, 0.75, 0.3, 0], [5.4, 0.45, 0.14, 0], [8.93, 0.25, 0.07, 0]]) {
    for (let i = 0; i < n; i++) x[i] += amp * Math.sin(2 * Math.PI * (freq * ratio + detune) * t[i]) * Math.exp(-t[i] / (decay * tau));
  }
  return finish(x, 0.0015, 0.4);
}

export const VOICES = { chime, arpeggio, swish, thump, boom, scratch, sad_trombone, ding };

/** A sound file of any format as mono samples at RATE, through ffmpeg. */
function decodeFile(path) {
  const r = spawnSync("ffmpeg", ["-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", String(RATE), "-"], { maxBuffer: 1 << 28 });
  if (r.error?.code === "ENOENT") throw new Error("sfx: ffmpeg is not installed; npm run doctor says how to get it");
  if (r.status !== 0) throw new Error(`sfx: ffmpeg could not read ${path}\n${r.stderr}`);
  const b = r.stdout;
  return Float64Array.from(new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length - (b.length % 4))));
}

/** One sound of a kit as mono samples at RATE, peaking at 1.0.
 *   {"voice": "swish", ...the voice's own arguments}            synthesized here
 *   {"voice": "arpeggio", "octave": 5, "steps": [0, 2, 5]}       a pitched chord, in scale steps
 *   {"voice": "ding", "octave": 6, "step": 0}                    a pitched note
 *   {"file": "paper.wav"}                                         a file, found by `findFile(name)`
 *  `step` moves a pitched voice along the scale (a call's own step). `gain` and `anchor` belong to the kit. */
export function render(spec, tonic, step = 0, findFile = (f) => f) {
  const { gain, anchor, about, ...rest } = spec;   // eslint-disable-line no-unused-vars
  if (rest.file) {
    const x = decodeFile(findFile(rest.file));
    return finish(x, 0.003, Math.min(0.5, 0.012 * RATE / Math.max(x.length, 1)));
  }
  const { voice, octave, steps, step: own = 0, ...args } = rest;
  if (!(voice in VOICES)) throw new Error(`no voice named "${voice}": the voices are ${Object.keys(VOICES).join(", ")}`);
  if (steps) args.freqs = steps.map((s) => pitch(tonic, octave, s + step));
  else if (octave !== undefined) args.freq = pitch(tonic, octave, own + step);
  return VOICES[voice](args);
}

/** Every sound in a kit, one after another with a pause between, as one 16-bit mono WAV. */
export function previewKit(kit, tonic = kit.tonic ?? "C", findFile) {
  const parts = [];
  for (const [name, spec] of Object.entries(kit.sounds)) {
    const x = render(spec, tonic, 0, findFile).map((v) => v * 10 ** ((spec.gain ?? 0) / 20) * 0.5);
    parts.push({ name, x });
  }
  const gap = count(0.6), total = parts.reduce((a, p) => a + p.x.length + gap, 0), out = Buffer.alloc(total * 2);
  let at = 0;
  for (const { name, x } of parts) {
    for (let i = 0; i < x.length; i++) out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, x[i])) * 32767), (at + i) * 2);
    console.log(`${name.padEnd(14)}${(x.length / RATE).toFixed(2)} s`);
    at += x.length + gap;
  }
  return out;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const a = process.argv.slice(2);
  if (a[0] === "preview" && a.length >= 3) {
    const kit = JSON.parse(readFileSync(a[1], "utf8"));
    const i = a.indexOf("--tonic");
    const pcm = previewKit(kit, i > 0 ? a[i + 1] : undefined, (f) => join(dirname(a[1]), f));
    const h = Buffer.alloc(44);
    h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVEfmt ", 8); h.writeUInt32LE(16, 16);
    h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(RATE, 24); h.writeUInt32LE(RATE * 2, 28);
    h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
    writeFileSync(a[2], Buffer.concat([h, pcm]));
    console.log(a[2]);
  } else {
    console.error("usage: node bin/sounds.mjs preview <kit.json> <out.wav> [--tonic F#]");
    process.exit(1);
  }
}
