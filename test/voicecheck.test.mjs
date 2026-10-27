// The take checks (bin/voicecheck.py, bin/hearback.py, and how bin/voice.mjs and bin/review.mjs use
// them). CI has no venv, no OmniVoice and no Whisper: the Python logic that needs only the standard
// library runs on any python3, the signal logic needs numpy and soundfile (skipped without them), and
// the plumbing runs against fake workers the way the omnivoice tests do. The real models are run by
// hand: docs/DESIGN.md, *Checking every take*.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { BASE_PACE, REPO, VENV_PY, readWav, writeWav } from "../bin/lib.mjs";
import { CHECK_VERSION, HEARBACK_MIN, hearbackAvailable, levelStamp, listenSection, voiceCheckSection } from "../bin/hearback.mjs";

const BIN = join(REPO, "bin");
const python = (py, code, args = []) => spawnSync(py, ["-c", `import sys; sys.path.insert(0, ${JSON.stringify(BIN)})\n${code}`, ...args], { encoding: "utf8" });
const can = (py, mods) => !!py && spawnSync(py, ["-c", `import ${mods}`], { stdio: "ignore" }).status === 0;
const plain = ["python3", "python"].find((p) => can(p, "sys"));
const numeric = [VENV_PY, "python3"].find((p) => can(p, "numpy, soundfile"));

test("the version and threshold node reads are the ones the Python files define", () => {
  assert.ok(Number.isInteger(CHECK_VERSION) && CHECK_VERSION >= 1);
  assert.ok(HEARBACK_MIN > 0.5 && HEARBACK_MIN < 1);
  assert.equal(levelStamp("k"), `v${CHECK_VERSION}:${createHash("sha256").update("k").digest("hex").slice(0, 12)}`);
  assert.equal(hearbackAvailable("/nonexistent/python"), false);
});

test("hear-back compares letters: spaces, punctuation, marks and spelled numbers do not count, a dropped or wrong word does", { skip: !plain && "no python3" }, () => {
  const r = python(plain, `
import hearback as h
a = h.agreement
print(a("Open FindBusiness today.", "Open Find Business today"))
print(a("It took twenty nine point three seconds.", "It took 29.3 seconds."))
print(a("Meet at four fifty seven.", "Meet at 4:57."))
print(a("Ready [laughter] now.", "Ready now."))
words = "Kokoro is a small text to speech model that runs on a laptop."
print(a(words, words.replace(" small", "")))
print(a(words, words.replace("small", "banana")))
print(a(words, "something else entirely"))
print(h.MIN)
print(a("Go back to nineteen fifty two.", "Go back to 1952."))
print(a("Meet in 1905, not 2026.", "Meet in nineteen oh five, not twenty twenty six."))
`);
  assert.equal(r.status, 0, r.stderr);
  const [name, num, clock, mark, dropped, wrong, other, min, year, years] = r.stdout.trim().split("\n").map(Number);
  for (const x of [name, num, clock, mark, year, years]) assert.equal(x, 1);   // a year is read as a year or as a quantity, whichever the take matches
  assert.ok(dropped < min, `one dropped word in twelve is under the threshold (${dropped})`);
  assert.ok(wrong < min, `one wrong word in twelve is under the threshold (${wrong})`);
  assert.ok(other < 0.5);
});

test("voicecheck: the burst is cut, a voice running out of it is not clean, a shout is found, takes are levelled", { skip: !numeric && "no python with numpy and soundfile" }, () => {
  const r = python(numeric, `
import numpy as np, voicecheck as v
sr = 24000
t = np.arange(int(sr * 0.5)) / sr
tone = lambda amp, n=0.5: (amp * np.sin(2 * np.pi * 220 * np.arange(int(sr * n)) / sr)).astype(np.float32)
quiet = lambda n: np.zeros(int(sr * n), dtype=np.float32)
burst = (0.05 * np.random.RandomState(1).randn(int(sr * 0.025))).astype(np.float32)
# the model's opening: a burst, silence, the voice
after, ok = v.clean(np.concatenate([burst, quiet(0.2), tone(0.3)]), sr)
print(ok, len(after) / sr < 0.75, v.windows(after[: int(sr * 0.01)], sr, 0.01)[0][1] < v.SILENT)
# the voice runs straight out of the burst: nothing to cut at
_, ok2 = v.clean(np.concatenate([burst, tone(0.3)]), sr)
print(ok2)
# a calm read and one with a stressed stretch 12 dB over it
calm = tone(0.1, 4.0)
loud = calm.copy(); loud[int(sr * 2.0):int(sr * 2.4)] *= 4
print(v.shout(calm, sr) is None, v.shout(loud, sr) is not None)
# levelling: a quiet and a loud take end at one speech level, nothing over the ceiling
a, b = v.level(tone(0.02, 1.0), sr), v.level(tone(0.9, 1.0), sr)
print(round(abs(v.speech_level(a, sr) - v.speech_level(b, sr)), 1), max(abs(a).max(), abs(b).max()) <= v.PEAK_MAX + 1e-6)
`);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(r.stdout.trim().split("\n"), ["True True True", "False", "True True", "0.0 True"]);
});

test("voicecheck level: one gain, never a knee: a take reaches the target, a take with a spike stays quieter and is not clipped", { skip: !numeric && "no python with numpy and soundfile" }, () => {
  const r = python(numeric, `
import numpy as np, voicecheck as v
sr = 24000
body = (0.03 * np.random.RandomState(2).randn(sr * 2)).astype(np.float32)     # speech-level noise, peaks well under the ceiling
spiky = body.copy(); spiky[1000:1010] = 0.6                                   # one plosive, 26 dB over the body
for take in (body, spiky):
    out = v.level(take, sr)
    k = np.abs(take) > 1e-4
    ratio = out[k] / take[k]
    print(round(v.speech_level(out, sr), 1), round(float(np.abs(out).max()), 3), bool(np.allclose(ratio, ratio[0], rtol=1e-4)))
print(v.TARGET_DB, round(v.PEAK_MAX, 3))
`);
  assert.equal(r.status, 0, r.stderr);
  const [a, b, tgt] = r.stdout.trim().split("\n");
  const [target, ceiling] = tgt.split(" ").map(Number);
  const [lvA, peakA, linA] = a.split(" "), [lvB, peakB, linB] = b.split(" ");
  assert.equal(+lvA, target, "a take that fits reaches the target level");
  assert.ok(+peakA < ceiling && linA === "True");
  assert.ok(+lvB < target - 0.5, "a take with a spike stays quieter than the target");
  assert.ok(Math.abs(+peakB - ceiling) < 0.002, `the spike sits at the ceiling (${peakB} vs ${ceiling})`);
  assert.equal(linB, "True", "every sample is the take's own times one gain: nothing is clipped or squashed");
});

test("voicecheck level: Kokoro takes are levelled in place, once, and their cache key is untouched", { skip: !numeric && "no python with numpy and soundfile" }, () => {
  const dir = join(mkdtempSync(join(tmpdir(), "kx-test-")), "demo");
  cpSync(join(REPO, "template"), dir, { recursive: true });
  mkdirSync(join(dir, "assets", "voice"), { recursive: true });
  const local = mkdtempSync(join(tmpdir(), "kx-local-"));
  const cfg = JSON.parse(readFileSync(join(dir, "video.json"), "utf8"));
  const speed = Math.round(BASE_PACE * 1.25 * 1000) / 1000;
  // Seed every take the way Kokoro would have voiced it, so nothing is voiced again: the key is the
  // one from before levelling existed, and has to stay valid.
  const sentences = ["01-intro", "02-idea"].flatMap((id) =>
    readFileSync(join(dir, "script", `${id}.txt`), "utf8").trim().replace(/\s+/g, " ").split(/(?<=[.!?])\s+(?=\S)/).map((text, i) => ({ id, i, text })));
  const wavs = sentences.map(({ id, i, text }, n) => {
    const wav = join(dir, "assets", "voice", `${id}-${String(i + 1).padStart(2, "0")}.wav`);
    const samples = Int16Array.from({ length: 24000 }, (_, k) => Math.round(Math.sin(k / 9) * (n % 2 ? 2000 : 12000)));
    writeWav(wav, { rate: 24000, channels: 1, samples });
    const key = JSON.stringify({ say: text, voice: cfg.voice, speed });
    writeFileSync(wav.replace(/\.wav$/, ".key"), key);
    return { wav, key };
  });
  const level = (wav) => {
    const s = readWav(wav).samples;
    return 20 * Math.log10(Math.sqrt(s.reduce((a, x) => a + (x / 32768) ** 2, 0) / s.length));
  };
  const before = wavs.map((w) => level(w.wav));
  assert.ok(Math.max(...before) - Math.min(...before) > 10);
  const run = () => spawnSync(process.execPath, [join(BIN, "voice.mjs"), dir, "--no-hearback"], { encoding: "utf8", env: { ...process.env, SHIPSHOW_LOCAL: local, HYPERFRAMES_PYTHON: numeric === "python3" ? "python3" : numeric } });
  let r = run();
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.match(r.stdout, /every sentence already voiced/, "a levelled take is not voiced again");
  assert.match(r.stdout, /levelled 4 take/);
  const after = wavs.map((w) => level(w.wav));
  assert.ok(Math.max(...after) - Math.min(...after) < 1, `levels are even after: ${after}`);
  for (const w of wavs) {
    assert.equal(readFileSync(w.wav.replace(/\.wav$/, ".key"), "utf8"), w.key, "the key is unchanged");
    assert.equal(readFileSync(w.wav.replace(/\.wav$/, ".lvl"), "utf8"), levelStamp(w.key));
  }
  const stamped = statSync(wavs[0].wav).mtimeMs;
  r = run();
  assert.doesNotMatch(r.stdout, /levelled/, "once levelled, never again");
  assert.equal(statSync(wavs[0].wav).mtimeMs, stamped);
});

// A fake python that hears: `-c import faster_whisper` succeeds, bin/hearback.py scores each take
// from a table keyed by its text, and bin/omnivoice.py writes tones and records the job file.
const fakeHearer = (scores) => {
  const path = join(mkdtempSync(join(tmpdir(), "kx-py-")), "python");
  writeFileSync(path, `#!${process.execPath}
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { writeWav } from ${JSON.stringify(join(BIN, "lib.mjs"))};
const [, , first, second] = process.argv;
if (first === "-c") process.exit(second.includes("faster_whisper") ? 0 : 1);
const spec = JSON.parse(readFileSync(second, "utf8"));
appendFileSync(second + ".log", JSON.stringify({ script: first.split("/").pop(), spec }) + "\\n");
const scores = ${JSON.stringify(scores)};
const check = (j, faults = []) => writeFileSync(j.wav.replace(/\\.wav$/, ".check"), JSON.stringify({ key: j.key, text: j.text, score: scores.find(([w]) => j.text.includes(w))?.[1] ?? 1, heard: "heard: " + j.text, faults }));
if (first.endsWith("omnivoice.py")) {
  for (const j of spec.jobs) { writeWav(j.wav, { rate: 24000, channels: 1, samples: new Int16Array(24000) }); if (spec.hearback) check(j, j.text.includes("second") ? ["a shout at 0.4s, 9.1 dB over its own speech"] : []); }
} else if (first.endsWith("hearback.py")) {
  for (const j of spec.items) check(j);
}
`, { mode: 0o755 });
  return path;
};
const sentenceWith = (dir, word) => readFileSync(join(dir, "script", "02-idea.txt"), "utf8").includes(word);

test("voice hears every take back when it can, flags those under the threshold, and records them for the packet", () => {
  const dir = join(mkdtempSync(join(tmpdir(), "kx-test-")), "demo");
  cpSync(join(REPO, "template"), dir, { recursive: true });
  const local = mkdtempSync(join(tmpdir(), "kx-local-"));
  assert.ok(sentenceWith(dir, "second"), "the template's second scene says 'second'");
  const py = fakeHearer([["box", 0.5]]);
  const run = (...args) => spawnSync(process.execPath, [join(BIN, "voice.mjs"), dir, ...args], { encoding: "utf8", env: { ...process.env, SHIPSHOW_LOCAL: local, HYPERFRAMES_PYTHON: py } });
  const log = () => readFileSync(join(dir, "assets", "omnivoice-jobs.json.log"), "utf8").trim().split("\n").map((l) => JSON.parse(l));

  let r = run("--engine", "omnivoice");
  assert.equal(r.status, 0, r.stderr);
  const worker = log()[0].spec;
  assert.equal(worker.hearback, true, "the worker is told it may hear takes back");
  assert.equal(worker.min, HEARBACK_MIN);
  assert.equal(worker.jobs.length, 2, "with hear-back, the template's two scenes of two sentences are two runs (DESIGN D47)");
  assert.ok(worker.jobs.every((j) => j.key.includes(`"check":${CHECK_VERSION}`) && j.key.includes('"ref":"heard"')), "a take's key carries the rules and the reference transcript");
  const vc = JSON.parse(readFileSync(join(dir, "timing.json"), "utf8")).voiceCheck;
  assert.equal(vc.hearBack, true);
  assert.equal(vc.checked, worker.jobs.length);
  assert.deepEqual(vc.flagged.map((f) => [f.scene, f.score]), [["02-idea", 0.5]]);
  assert.match(vc.flagged[0].text, /box/);
  assert.equal(vc.faults.length, 1, "a fault the worker kept is carried too");
  assert.match(r.stdout, /LISTEN 02-idea sentence 1-2: 50% heard back/);

  const packet = voiceCheckSection(JSON.parse(readFileSync(join(dir, "timing.json"), "utf8")).voiceCheck).join("\n");
  assert.match(packet, /## Voice checks/);
  assert.match(packet, /\| 02-idea \| 1-2 \| 50% \| .*box.* \| heard: .*box/);
  assert.match(packet, /fault kept after retakes/);

  r = run("--engine", "omnivoice");
  assert.match(r.stdout, /every sentence already voiced/);
  assert.equal(log().length, 1, "takes already heard are not sent to the worker or heard again");

  // --no-hearback is a different read of the reference (no transcript), so its takes are voiced again
  const quiet = run("--engine", "omnivoice", "--no-hearback");
  assert.match(quiet.stdout, /voiced 4\/4/);
  assert.equal(log().at(-1).spec.hearback, false);
  assert.match(quiet.stdout, /hear-back is off/);
});

test("without faster-whisper nothing is required: takes are voiced, and the packet says nobody heard them", () => {
  const dir = join(mkdtempSync(join(tmpdir(), "kx-test-")), "demo");
  cpSync(join(REPO, "template"), dir, { recursive: true });
  const local = mkdtempSync(join(tmpdir(), "kx-local-"));
  const py = join(mkdtempSync(join(tmpdir(), "kx-py-")), "python");
  writeFileSync(py, `#!${process.execPath}
import { appendFileSync, readFileSync } from "node:fs";
import { writeWav } from ${JSON.stringify(join(BIN, "lib.mjs"))};
if (process.argv[2] === "-c") process.exit(1);
const spec = JSON.parse(readFileSync(process.argv[3], "utf8"));
appendFileSync(process.argv[3] + ".log", JSON.stringify(spec) + "\\n");
for (const j of spec.jobs) writeWav(j.wav, { rate: 24000, channels: 1, samples: new Int16Array(24000) });
`, { mode: 0o755 });
  const r = spawnSync(process.execPath, [join(BIN, "voice.mjs"), dir, "--engine", "omnivoice"], { encoding: "utf8", env: { ...process.env, SHIPSHOW_LOCAL: local, HYPERFRAMES_PYTHON: py } });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /not heard back/);
  const spec = JSON.parse(readFileSync(join(dir, "assets", "omnivoice-jobs.json.log"), "utf8").trim());
  assert.equal(spec.hearback, false);
  assert.ok(spec.jobs.every((j) => j.key.includes('"ref":"none"')));
  const vc = JSON.parse(readFileSync(join(dir, "timing.json"), "utf8")).voiceCheck;
  assert.equal(vc.hearBack, false);
  assert.match(voiceCheckSection(vc).join("\n"), /Not heard back/);
  assert.match(voiceCheckSection(undefined).join("\n"), /None recorded/);
  assert.ok(existsSync(join(dir, "assets", "narration.wav")));
});

test("omnivoice reference: a hissy clip goes to the model as recorded, and its hiss is not read as a voice that starts at once", { skip: !numeric && "no python with numpy and soundfile" }, () => {
  const dir = mkdtempSync(join(tmpdir(), "kx-ref-"));
  const r = python(numeric, `
import numpy as np, soundfile as sf, omnivoice as o, voicecheck as v
sr = 24000; rng = np.random.default_rng(1)
t = np.arange(int(sr * 4.0)) / sr
voice = (0.2 * np.sin(2 * np.pi * 180 * t) * (np.sin(2 * np.pi * 1.5 * t) > 0)).astype(np.float32)
hiss = lambda n: (rng.standard_normal(n) * 0.012).astype(np.float32)   # about -38 dBFS, the owner's room
sf.write(sys.argv[1] + "/hissy.wav", voice + hiss(len(t)), sr)
a = o.quiet(sys.argv[1] + "/hissy.wav", "hissy", sys.argv[1] + "/cache", 0.0, 4.0)
x, _ = sf.read(sys.argv[1] + "/hissy.wav", dtype="float32"); y, _ = sf.read(str(a), dtype="float32")
print(round(float(np.max(np.abs(x[: len(y)] - y))), 4))
# a take of a hissy clone: the decoder's burst, 0.2 s of the room's hiss, then the voice
burst = (rng.standard_normal(int(sr * 0.03)) * 0.3).astype(np.float32)
tone = (0.2 * np.sin(2 * np.pi * 180 * np.arange(int(sr * 1.0)) / sr)).astype(np.float32)
take = np.concatenate([burst, hiss(int(sr * 0.2)), tone + hiss(int(sr * 1.0))])
out, ok = v.clean(take, sr)
print(ok, len(take) - len(out) > int(sr * 0.03))
`, [dir]);
  assert.equal(r.status, 0, r.stderr);
  const [diff, verdict] = r.stdout.trim().split("\n");
  assert.equal(Number(diff), 0, "the reference is the recording, sample for sample (it was denoised, which made the voice hollow)");
  assert.equal(verdict, "True True", "the hiss after the burst counts as the silence to cut at, so the take is clean and its burst is cut");
});

test("drama: a stall of the clone's hiss inside a take counts as a gap, and a take's ordinary pauses do not", { skip: !numeric && "no python with numpy and soundfile" }, () => {
  // Voice at about -20 dBFS, a 3 s stall of hiss at -40 dBFS (above SILENT, so read as voice before), then voice again.
  const r = python(numeric, `
import numpy as np, drama
sr = 24000; rng = np.random.default_rng(1)
def voice(s): t = np.arange(int(sr * s)) / sr; return (0.14 * np.sin(2 * np.pi * 180 * t) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * t))).astype(np.float32)
hiss = lambda s: (rng.standard_normal(int(sr * s)) * 0.01).astype(np.float32)
stalled = np.concatenate([hiss(0.2), voice(1.5), hiss(3.0), voice(1.2), hiss(0.2)])
paused = np.concatenate([hiss(0.2), voice(1.5), hiss(0.5), voice(1.2), hiss(0.6), voice(1.0), hiss(0.2)])
for a in (stalled, paused):
    print(round(drama.longest_gap(a, sr, drama.voiced(a, sr)), 1))
lead = np.concatenate([hiss(2.0), voice(1.5), hiss(0.2)])
print(round(drama.voiced(lead, sr)[0] * 0.01, 1))
`);
  assert.equal(r.status, 0, r.stderr);
  const [stalled, paused, leadIn] = r.stdout.trim().split("\n").map(Number);
  assert.ok(leadIn >= 1.7, `2 s of hiss before the first word is not voice, so trim() cuts it: the voice starts at ${leadIn} s`);
  assert.ok(stalled > 2.0, `the 3 s stall of hiss reads as a gap over GAP_DROP: ${stalled} s`);
  assert.ok(paused < 1.0, `half-second pauses are not a stall: ${paused} s`);
});

test("hear-back finds a sentence that is missing altogether, which the letter score misses", { skip: !plain && "no python3" }, () => {
  const r = python(plain, `
import hearback, json
line = "So, have you ever read them? No. And does anyone today say you don't understand your code because of it? Also no."
print(json.dumps([
  hearback.vanished(line, "So have you ever read them? And does anyone today say you don't understand your code because of it? Also no."),
  hearback.vanished(line, "So have you ever read them? No. And does anyone today say you don't understand your code because of it? Also no."),
  hearback.vanished("Fair enough. Except by hand. Like animals.", "Fair enough, except by hand."),
  hearback.vanished("By the end of 2025, Karpathy had agents writing eighty percent of his code.", "By the end of 2025, Carpathi had agents writing 80% of his code."),
  round(hearback.agreement(line, "So have you ever read them? And does anyone today say you don't understand your code because of it? Also no."), 3),
]))
`);
  assert.equal(r.status, 0, r.stderr);
  const [dropped, whole, punchline, misheard, score] = JSON.parse(r.stdout);
  assert.deepEqual(dropped, ["No."], "the dropped two-letter answer is found");
  assert.deepEqual(whole, [], "nothing missing in a whole take");
  assert.deepEqual(punchline, ["Like animals."]);
  assert.deepEqual(misheard, [], "a misspelt name and digits for words are not a missing sentence");
  assert.ok(score > 0.97, `the letter score alone passes the dropped take: ${score}`);
});

test("drama: when every seed stalls, the take with the shortest stall is kept with its fault instead of stopping the video", { skip: !numeric && "no python with numpy and soundfile" }, () => {
  const r = python(numeric, `
import sys, types, numpy as np
sys.modules["mlx"] = types.ModuleType("mlx"); core = types.ModuleType("mlx.core"); core.random = types.SimpleNamespace(seed=lambda s: None)
sys.modules["mlx.core"] = core; sys.modules["mlx"].core = core
import drama
sr = 24000; rng = np.random.default_rng(2)
def voice(s): t = np.arange(int(sr * s)) / sr; return (0.14 * np.sin(2 * np.pi * 180 * t) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * t))).astype(np.float32)
hiss = lambda s: (rng.standard_normal(int(sr * s)) * 0.01).astype(np.float32)
class Model:
    def __init__(self, stalls): self.stalls = list(stalls)
    def generate(self, text, **_):
        s = self.stalls.pop(0)
        a = np.concatenate([voice(1.2), hiss(s), voice(1.0)]) if s else np.concatenate([voice(1.2), hiss(0.4), voice(1.0)])
        return [types.SimpleNamespace(audio=a, sample_rate=sr)]
job = {"seed": 1, "text": "x"}
a, _, fault = drama.one_take(Model([3.0, 2.4, 2.8]), job, 0, {})
print(fault, round(len(a) / sr, 1))
a, _, fault = drama.one_take(Model([3.0, 0, 2.8]), job, 0, {})
print(fault, round(len(a) / sr, 1))
`);
  assert.equal(r.status, 0, r.stderr);
  const [stalled, clean] = r.stdout.trim().split("\n");
  assert.match(stalled, /^stalled for 2\.\d s mid-line 4\.\d$/, `the 2.4 s stall is the one kept, with its fault: ${stalled}`);
  assert.match(clean, /^None 2\.\d$/, `a clean seed is taken as soon as it comes: ${clean}`);
});

test("hear-back finds letters spelled out that the script never spells: the respelling \"en\" said \"E N\"", { skip: !plain && "no python3" }, () => {
  const r = python(plain, `
import hearback as h, json
cases = [
  ("With n switches, there are two to the n settings.", "With en switches, there are two to the en settings.", "With EN switches, there are two to the EN settings."),
  ("the square root of n, for example", "the square root of en, for example", "the square root of E N, for example"),
  ("It grows like n over log n.", "It grows like en over log en.", "It grows like E.N. over log E-N."),
  ("c to the n is just two to the n", "c to the n is just two to the n", "C to the N is just two to the N"),
  ("In 2001 they made ETH, and OpenAI said NP.", "In 2001 they made E T H, and Open A I said N P.", "In 2001 they made ETH, and OpenAI said NP. AI. E.T.H."),
  ("I said a thing. A cat.", "I said a thing. A cat.", "I said a thing. A cat. I A."),
]
print(json.dumps([h.spelled_out(*c) for c in cases]))
`);
  assert.equal(r.status, 0, r.stderr);
  const [plainN, spaced, dotted, letterN, acronyms, words] = JSON.parse(r.stdout);
  assert.deepEqual(plainN, ["EN"], "Whisper's \"EN\" for the variable n, once however often it comes");
  assert.deepEqual(spaced, ["EN"], "Parakeet's \"E N\" joins into one group");
  assert.deepEqual(dotted, ["EN"], "\"E.N.\" and \"E-N\" are the same letters");
  assert.deepEqual(letterN, [], "a single letter said as itself is not spelled out");
  assert.deepEqual(acronyms, [], "acronyms the script writes, or tells the voice to spell, are fine");
  assert.deepEqual(words, [], "a capital A or I alone is a word");
});

test("drama: a take that spells out letters is voiced again, and kept with the fault only when every round does", { skip: !numeric && "no python with numpy and soundfile" }, () => {
  const dir = mkdtempSync(join(tmpdir(), "spelled-"));
  mkdirSync(join(dir, "model"));
  writeFileSync(join(dir, "model", "config.json"), "{}");
  const r = spawnSync(numeric, ["-c", `import sys; sys.path.insert(0, ${JSON.stringify(BIN)})
import json, types, numpy as np, soundfile as sf
sys.modules["mlx"] = types.ModuleType("mlx"); core = types.ModuleType("mlx.core"); core.random = types.SimpleNamespace(seed=lambda s: None)
sys.modules["mlx.core"] = core; sys.modules["mlx"].core = core
heard = {"lines": []}
class Model:
    def generate(self, text, **_):
        t = np.arange(24000) / 24000
        return [types.SimpleNamespace(audio=(0.14 * np.sin(2 * np.pi * 180 * t)).astype(np.float32), sample_rate=24000)]
utils = types.ModuleType("mlx_audio.tts.utils"); utils.load_model = lambda p: Model()
for m in ("mlx_audio", "mlx_audio.tts"): sys.modules[m] = types.ModuleType(m)
sys.modules["mlx_audio.tts.utils"] = utils
import drama, hearback
hearback.available = lambda: True
hearback.samples_from = lambda a, sr: a
def hear_words(_):
    said = heard["lines"].pop(0)
    return said, [{"w": w, "start": i * 0.2, "end": i * 0.2 + 0.15} for i, w in enumerate(said.split())]
hearback.hear_words = hear_words
d = sys.argv[1]
sf.write(d + "/ref.wav", np.zeros(48000, dtype=np.float32), 24000)
def run(lines, name):
    heard["lines"] = list(lines)
    job = {"text": "two to the en", "plain": "two to the en", "written": "two to the n", "wav": f"{d}/{name}.wav", "key": "k", "seed": 1,
           "parts": [[{"w": "two", "say": "two"}, {"w": "to", "say": "to"}, {"w": "the", "say": "the"}, {"w": "n", "say": "en"}]]}
    json.dump({"speed": 1.0, "voice": {"name": "x", "wav": d + "/ref.wav", "text": "hello"}, "model": {"path": d + "/model"}, "hearback": True, "min": 0.5, "jobs": [job]}, open(d + "/spec.json", "w"))
    drama.main(d + "/spec.json")
    c = json.load(open(f"{d}/{name}.check"))
    print(json.dumps([len(lines) - len(heard["lines"]), c["heard"], c["faults"]]))
run(["two to the EN", "two to the E N", "two to the N", "two to the EN", "two to the EN"], "fixed")
run(["two to the EN"] * 5, "kept")
`, dir], { encoding: "utf8", env: { ...process.env, SHIPSHOW_DRAMA_FORCE: "1" } });
  assert.equal(r.status, 0, r.stderr);
  const [fixed, kept] = r.stdout.trim().split("\n").filter((l) => l.startsWith("[")).map((l) => JSON.parse(l));
  assert.deepEqual(fixed, [3, "two to the N", []], "voiced again until the letter is said as a letter, then kept clean");
  assert.equal(kept[0], 5, "every round tried");
  assert.deepEqual(kept[2], ['spelled out: heard the letters "EN"'], "kept with the fault, so the voice step lists it to listen to");
});

test("the second listen: the packet says what Parakeet flagged, and says so when it heard an older narration", { skip: !plain && "no python3" }, () => {
  const listen = { model: "mlx-community/parakeet-tdt-0.6b-v3@ed2b7e8c", narration: "abc", min: 0.9, scenes: [
    { scene: "02-puzzle", score: 0.95, heard: "two to the E N settings", missing: [], spelled: ["EN"], flag: true },
    { scene: "03-doubling", score: 0.99, heard: "fine", missing: [], spelled: [], flag: false }] };
  const now = listenSection(listen, true).join("\n");
  assert.match(now, /\| 02-puzzle \| 95% \|  \| EN \| two to the E N settings \|/);
  assert.doesNotMatch(now, /03-doubling/, "only flagged scenes are listed");
  assert.match(listenSection(listen, false).join("\n"), /Stale/);
  assert.match(listenSection(null, false).join("\n"), /npm run setup:listen/);
  const r = python(plain, `
import listen
print(listen.said("two to the n, and ETH; n-th", {"n": "en", "ETH": "E T H"}))
`);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout.trim(), "two to the en, and E T H; en-th", "the same whole-word swap as bin/lib.mjs spoken()");
});
