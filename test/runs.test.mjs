// Voicing runs of sentences, and timing them from what Whisper heard (DESIGN D47). As in the other
// OmniVoice tests the model is not run: a fake python stands in for it (HYPERFRAMES_PYTHON), and the
// alignment, which is standard-library Python, runs for real on any python3. The model and Whisper are
// run by hand: docs/DESIGN.md, D47.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { test } from "node:test";
import { createHash } from "node:crypto";
import { BASE_PACE, DRAMA_LINE_MAX, LINE_MAX, styled, REPO, VENV_PY, breathe, groupRuns, lineRuns, pythonExists, readWav, sentences, spokenWords, writeWav } from "../bin/lib.mjs";
import { hearbackAvailable, levelStamp, voiceCheckSection } from "../bin/hearback.mjs";

const BIN = join(REPO, "bin");
const plain = ["python3", "python"].find((p) => spawnSync(p, ["-c", "import sys"], { stdio: "ignore" }).status === 0);
const python = (code) => spawnSync(plain, ["-c", `import sys, json; sys.path.insert(0, ${JSON.stringify(BIN)})\n${code}`], { encoding: "utf8" });

// A fake python that can hear (`-c import faster_whisper` succeeds) and stands in for bin/omnivoice.py:
// it writes four seconds of silence per job, and for a run (a job with `parts`) a .check whose timing puts
// sentence k at 2k + 0.1 to 2k + 1.9 seconds, its word i a tenth of a second after the one before.
const fakeRunner = () => {
  const path = join(mkdtempSync(join(tmpdir(), "kx-py-")), "python");
  writeFileSync(path, `#!${process.execPath}
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { writeWav } from ${JSON.stringify(join(BIN, "lib.mjs"))};
const [, , first, second] = process.argv;
if (first === "-c") process.exit(second.includes("faster_whisper") ? 0 : 1);
const spec = JSON.parse(readFileSync(second, "utf8"));
appendFileSync(second + ".log", JSON.stringify(spec) + "\\n");
for (const j of spec.jobs) {
  // a tone where each sentence is heard (2k + 0.1 to 2k + 1.9 s), silence between them, as a real take has
  const take = new Int16Array(24000 * 4);
  (j.parts || []).forEach((_, k) => { for (let f = Math.round((2 * k + 0.1) * 24000); f < Math.min(take.length, Math.round((2 * k + 1.9) * 24000)); f++) take[f] = Math.round(Math.sin(f / 4) * 8000); });
  writeWav(j.wav, { rate: 24000, channels: 1, samples: take });
  if (!spec.hearback) continue;
  const sentences = (j.parts || []).map((part, k) => ({ start: 2 * k + 0.1, end: 2 * k + 1.9, words: part.map((w, i) => ({ w: w.w, at: 2 * k + 0.1 + i * 0.1, end: 2 * k + 0.2 + i * 0.1 })) }));
  const n = (j.parts || []).flat().length;
  writeFileSync(j.wav.replace(/\\.wav$/, ".check"), JSON.stringify({ key: j.key, text: j.text, score: 1, heard: j.text, faults: [], ...(j.parts ? { timing: { sentences, matched: n - 1, words: n } } : {}) }));
}
`, { mode: 0o755 });
  return path;
};

// Sentences of exactly ten words, so a run of up to 45 words holds four of them.
const ten = (i) => `Sentence ${i} has exactly ten plain words in it, ok.`;
const fiftyWords = Array.from({ length: 50 }, (_, i) => `w${i}`).join(" ") + ".";
const longVideo = () => {
  const dir = join(mkdtempSync(join(tmpdir(), "kx-test-")), "demo");
  cpSync(join(REPO, "template"), dir, { recursive: true });
  writeFileSync(join(dir, "script", "01-intro.txt"), [1, 2, 3, 4, 5, 6].map(ten).join(" ") + "\n");
  writeFileSync(join(dir, "script", "02-idea.txt"), `${fiftyWords} Short one here.\n`);
  const cfg = JSON.parse(readFileSync(join(dir, "video.json"), "utf8"));
  writeFileSync(join(dir, "video.json"), JSON.stringify({ ...cfg, engine: "omnivoice", say: { plain: "simple" } }));
  return dir;
};
const local = () => mkdtempSync(join(tmpdir(), "kx-local-"));
const voice = (dir, py, ...args) => spawnSync(process.execPath, [join(BIN, "voice.mjs"), dir, ...args], { encoding: "utf8", env: { ...process.env, SHIPSHOW_LOCAL: local(), HYPERFRAMES_PYTHON: py } });
const jobsLog = (dir) => readFileSync(join(dir, "assets", "omnivoice-jobs.json.log"), "utf8").trim().split("\n").map((l) => JSON.parse(l));

test("runs: whole sentences up to 45 words, a longer one alone, in order", () => {
  const says = [ten(1), ten(2), ten(3), ten(4), ten(5), fiftyWords, "Short.", ten(6)];
  assert.deepEqual(groupRuns(says), [[0, 1, 2, 3], [4], [5], [6, 7]], "four ten-word sentences are 40 words; a fifth would be 50; the 50-word sentence stands alone");
  assert.deepEqual(groupRuns(["a b c d e f g h i j", "k l", "m n"], 10), [[0], [1, 2]], "a limit of ten words: a full sentence is a run, two short ones share one");
  assert.deepEqual(groupRuns([]), []);
  assert.deepEqual(groupRuns(["One two."], 1), [[0]], "a sentence over the limit is still voiced");
});

test("omnivoice with hear-back voices runs, each cached by its own text, and says what each written word is said as", () => {
  const dir = longVideo(), py = fakeRunner();
  let r = voice(dir, py, "--engine", "omnivoice", "--speed", "1.2");
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const jobs = jobsLog(dir)[0].jobs;
  assert.equal(jobsLog(dir)[0].pace, "window", "a run at a measured speed (up to 1.2) takes its speed from a shorter window");
  assert.equal(jobs.length, 4, "scene one is a run of four sentences and a run of two; scene two is a long sentence alone and a short one");
  assert.deepEqual(jobs.map((j) => j.parts.length), [4, 2, 1, 1]);
  assert.deepEqual(jobs.map((j) => j.wav.split("/").pop()), ["01-intro-r01.wav", "01-intro-r02.wav", "02-idea-r01.wav", "02-idea-r02.wav"]);
  assert.equal(jobs[0].text, [1, 2, 3, 4].map(ten).join(" ").replaceAll("plain", "simple"), "the run is said as one text, after `say`");
  assert.deepEqual(jobs[0].parts[0].find((w) => w.w === "plain"), { w: "plain", say: "simple" }, "a written word carries what it is said as");
  assert.ok(jobs.every((j) => j.key.includes('"take":"run+')), "a run take is a different take from a sentence take");

  // One take per run: editing sentence 5 re-voices its run and nothing else.
  r = voice(dir, py, "--engine", "omnivoice", "--speed", "1.2");
  assert.match(r.stdout, /every sentence already voiced/);
  writeFileSync(join(dir, "script", "01-intro.txt"), [1, 2, 3, 4].map(ten).join(" ") + " Sentence five has been rewritten completely. " + ten(6) + "\n");
  r = voice(dir, py, "--engine", "omnivoice", "--speed", "1.2");
  const again = jobsLog(dir);
  assert.equal(again.length, 2);
  assert.deepEqual(again[1].jobs.map((j) => j.wav.split("/").pop()), ["01-intro-r02.wav"], "only the edited sentence's run went back to the worker");
  assert.match(r.stdout, /voiced 1\/1/);

  // The unchanged paths: no hear-back, one take per sentence, no parts, the numbering of old.
  const quiet = voice(dir, py, "--engine", "omnivoice", "--no-hearback");
  assert.equal(quiet.status, 0, quiet.stderr);
  assert.equal(jobsLog(dir).at(-1).pace, "stretch", "a take of one sentence is time-stretched, as it always was");
  const sentenceJobs = jobsLog(dir).at(-1).jobs;
  assert.equal(sentenceJobs.length, 8, "the script's six + two sentences, one take each");
  assert.ok(sentenceJobs.every((j) => j.parts === undefined && /-\d\d\.wav$/.test(j.wav)));
});

test("a run's sentences and words are placed where the take says they are, at the run's place on the track", () => {
  const dir = longVideo(), py = fakeRunner();
  const r = voice(dir, py, "--engine", "omnivoice");
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const timing = JSON.parse(readFileSync(join(dir, "timing.json"), "utf8"));
  const [intro] = timing.scenes;
  // lead 0.5 / speed 1.25 = 0.4 s, then the run: sentence k is heard at 2k + 0.1 into its take. The fake leaves 0.2 s between
  // sentences, under the gap (0.35 / 1.25 = 0.28 s), so a boundary with voice after its pause gets a 0.08 s breath and the
  // sentences after it move. The second boundary falls at the 4 s take's end, with no voice after its pause, so it gets none.
  assert.deepEqual(intro.sentences.slice(0, 4).map((s) => [s.start, s.duration]), [[0.5, 1.8], [2.58, 1.8], [4.58, 1.8], [6.58, 1.8]]);
  assert.deepEqual(intro.sentences[1].words.slice(0, 3), [{ w: "Sentence", at: 2.58 }, { w: "2", at: 2.68 }, { w: "has", at: 2.78 }]);
  // the next run starts after the 4 s take, its one breath (0.08 s) and the gap
  assert.equal(intro.sentences[4].start, round2(0.4 + 4 + 0.08 + 0.28 + 0.1));
  assert.match(r.stdout, /2 breath\(s\) put between sentences/, "one in the first run, one in the second");
  assert.equal(intro.sentences.length, 6);
  const vc = timing.voiceCheck;
  assert.deepEqual(vc.runs, { takes: 4, words: 113, matched: 109 }, "the packet is told how many words Whisper matched: 60 + 50 + 3 words, one missed per take in the fake");
  assert.match(r.stdout, /voiced in 4 run\(s\) of sentences; \d+ of \d+ words timed from what was heard/);
  assert.match(voiceCheckSection(vc).join("\n"), /Each of 4 runs of sentences was heard back[\s\S]*109 of 113 words were matched/, "the packet says the takes are runs and how many words Whisper matched");
});

const round2 = (x) => Math.round(x * 100) / 100;

test("a run heard back with no word times is shared out by letters, not lost", () => {
  const dir = longVideo();
  const py = join(mkdtempSync(join(tmpdir(), "kx-py-")), "python");
  writeFileSync(py, `#!${process.execPath}
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { writeWav } from ${JSON.stringify(join(BIN, "lib.mjs"))};
const [, , first, second] = process.argv;
if (first === "-c") process.exit(second.includes("faster_whisper") ? 0 : 1);
const spec = JSON.parse(readFileSync(second, "utf8"));
for (const j of spec.jobs) {
  writeWav(j.wav, { rate: 24000, channels: 1, samples: new Int16Array(24000 * 4) });
  writeFileSync(j.wav.replace(/\\.wav$/, ".check"), JSON.stringify({ key: j.key, text: j.text, score: 1, heard: j.text, faults: [] }));
}
`, { mode: 0o755 });
  const r = voice(dir, py, "--engine", "omnivoice");
  assert.equal(r.status, 0, r.stderr);
  const s = JSON.parse(readFileSync(join(dir, "timing.json"), "utf8")).scenes[0].sentences;
  assert.equal(s.length, 6);
  assert.ok(s.every((x) => x.words === undefined && x.duration > 0.5));
  assert.ok(Math.abs(s[0].duration - 1) < 0.02 && Math.abs(s[1].start - s[0].start - 1) < 0.02, "four equal sentences share four seconds");
});

test("wordtime: sentences and written words are placed on the heard words, through `say` and a word that was missed", { skip: !plain && "no python3" }, () => {
  // The written words with what each is said as (bin/lib.mjs spokenWords), as the worker is given them.
  const sentence1 = spokenWords("In 1952, Grace had a compiler.", { 1952: "nineteen fifty two" });
  const sentence2 = spokenWords("It's a fair worry.", {});
  const sentence3 = spokenWords("The XYZ is great.", { XYZ: "zebra" });   // said as a word that shares no letters with how it is written
  assert.deepEqual(sentence1[1], { w: "1952,", say: "nineteen fifty two," });
  // What Whisper heard: the year as digits, "fair" never heard at all.
  const heard = [["In", 0.1, 0.3], ["1952", 0.35, 1.1], ["Grace", 1.2, 1.5], ["had", 1.5, 1.7], ["a", 1.7, 1.8], ["compiler.", 1.8, 2.5], ["It's", 3.0, 3.2], ["a", 3.2, 3.3], ["worry.", 3.9, 4.4], ["The", 5.0, 5.2], ["zebra", 5.6, 6.1], ["is", 6.5, 6.6], ["great.", 6.7, 7.2]]
    .map(([w, start, end]) => ({ w, start, end }));
  const r = python(`
import wordtime
print(json.dumps(wordtime.align(${JSON.stringify([sentence1, sentence2, sentence3])}, ${JSON.stringify(heard)}, 9.0)))
print(json.dumps(wordtime.align(${JSON.stringify([sentence2])}, [], 2.0)))
`);
  assert.equal(r.status, 0, r.stderr);
  const [aligned, nothing] = r.stdout.trim().split("\n").map((l) => JSON.parse(l));
  const [one, two, three] = aligned.sentences;
  assert.equal(aligned.words, 14);
  assert.equal(aligned.matched, 13, "every word but 'fair' was heard");
  assert.deepEqual([one.start, one.end, two.start, two.end, three.start], [0.1, 2.5, 3.0, 4.4, 5.0], "a sentence runs from its first heard word to the end of its last");
  assert.equal(three.end, 8.9, "the last word of a take is held to 0.1 s before the take ends, since Whisper cuts it short");
  const zebra = three.words[1];
  assert.deepEqual([zebra.w, zebra.at], ["XYZ", 5.6], "a written word is placed where what it is said as was heard");
  const at = Object.fromEntries([...one.words, ...two.words].map((w) => [w.w, w.at]));
  assert.equal(at.In, 0.1);
  assert.equal(at.Grace, 1.2);
  assert.equal(at.compiler, undefined);
  assert.equal(at["compiler."], 1.8);
  assert.ok(at["1952,"] >= 0.3 && at["1952,"] < 1.2, `the year is somewhere in what was heard as "1952" (${at["1952,"]})`);
  const fair = two.words[2];
  assert.deepEqual([fair.w, fair.at, fair.end], ["fair", 3.3, 3.9], `"fair" was never heard, so it fills the gap between "a" (ends 3.3) and "worry." (starts 3.9)`);
  assert.equal(at["worry."], 3.9);
  const ats = [...one.words, ...two.words, ...three.words].map((w) => w.at);
  assert.deepEqual(ats, [...ats].sort((a, b) => a - b), "times only go forward");
  // Nothing heard at all: the take is shared out by letters, as a sentence was before Whisper timed anything.
  assert.equal(nothing.matched, 0);
  const w = nothing.sentences[0].words;
  assert.equal(w[0].at, 0);
  assert.ok(w.every((x, i) => i === 0 || x.at > w[i - 1].at) && nothing.sentences[0].end === 2);
});

test("wordtime: a say key of several written words is one spoken unit that its first word carries", () => {
  assert.deepEqual(spokenWords("Ask the CTO today.", { "the CTO": "the C T O" }).map((w) => w.say), ["Ask", "the C T O", "", "today."]);
  assert.deepEqual(spokenWords("Ask the CTO today.", {}).map((w) => w.say), ["Ask", "the", "CTO", "today."]);
  assert.deepEqual(spokenWords("Open FindBusiness.", { FindBusiness: "Find Business" }).map((w) => w.say), ["Open", "Find Business."]);
});

test("build places a cue and a caption on the word Whisper heard, and on the letters when no word times came", () => {
  const dir = join(mkdtempSync(join(tmpdir(), "kx-test-")), "demo");
  cpSync(join(REPO, "template"), dir, { recursive: true });
  const first = "First fish the a to, then they swim away.";
  const words = first.split(" ").map((w, i) => ({ w, at: 1 + i * 0.3 }));
  // Scene one is timed from what was heard: "First" at 1.0 s, "the" at 1.6 s. Scene two has no word times.
  writeFileSync(join(dir, "timing.json"), JSON.stringify({
    total: 9,
    scenes: [
      { id: "01-intro", start: 0, duration: 4, sentences: [{ text: first, start: 1, duration: 2.7, words }] },
      { id: "02-idea", start: 4, duration: 5, sentences: [{ text: "A box appears when the voice says box.", start: 7, duration: 1.5 }, { text: "This is the second scene.", start: 4.5, duration: 2, words: [{ w: "This", at: 4.5 }] }] },
    ],
  }));
  mkdirSync(join(dir, "assets"), { recursive: true });
  execFileSync(process.execPath, [join(BIN, "build.mjs"), dir]);
  const html = readFileSync(join(dir, "index.html"), "utf8");
  assert.match(html, /data-cue="first" data-at="0.85"/, "'First' was heard at 1.0 s, less the 0.15 s lead (the letter share would say 1.0 too, so see the caption)");
  const caps = [...html.matchAll(/data-start="([\d.]+)" data-duration="[\d.]+" data-track-index="20"><span>([^<]*)<\/span>/g)].map((m) => [+m[1], m[2]]);
  assert.deepEqual(caps[0], [1, "First fish"]);
  assert.deepEqual(caps[1], [1.6, "the a to, then they swim away."], "a line starts on the word Whisper heard; the letter share would start it at 1.4");
  // a sentence whose word list does not fit its text is timed by letters, never by a wrong list
  assert.ok(caps.some(([t, text]) => text === "This is the second scene." && t === 4.5));
  assert.equal(+html.match(/data-cue="box#2" data-at="([\d.]+)"/)[1], round2(7 + (27 / 31) * 1.5 - 0.15));
});

test("a Kokoro take levelled by the rules before the knee was removed is voiced again; one levelled by the current rules is not", { skip: !existsSync(VENV_PY) && "needs the repo's .venv for the levelling step" }, () => {
  const dir = join(mkdtempSync(join(tmpdir(), "kx-test-")), "demo");
  cpSync(join(REPO, "template"), dir, { recursive: true });
  mkdirSync(join(dir, "assets", "voice"), { recursive: true });
  const cfg = JSON.parse(readFileSync(join(dir, "video.json"), "utf8"));
  const speed = Math.round(BASE_PACE * 1.25 * 1000) / 1000;
  const takes = ["01-intro", "02-idea"].flatMap((id) => sentences(readFileSync(join(dir, "script", `${id}.txt`), "utf8").trim()).map((text, i) => ({ id, i, text })));
  takes.forEach(({ id, i, text }, n) => {
    const wav = join(dir, "assets", "voice", `${id}-${String(i + 1).padStart(2, "0")}.wav`);
    writeWav(wav, { rate: 24000, channels: 1, samples: Int16Array.from({ length: 24000 }, (_, k) => Math.round(Math.sin(k / 9) * 6000)) });
    const key = JSON.stringify({ say: text, voice: cfg.voice, speed });
    writeFileSync(wav.replace(/\.wav$/, ".key"), key);
    // the first take was levelled by version 1 (the tanh knee); the rest by this version
    writeFileSync(wav.replace(/\.wav$/, ".lvl"), n === 0 ? `v1:${createHash("sha256").update(key).digest("hex").slice(0, 12)}` : levelStamp(key));
  });
  const r = spawnSync(process.execPath, [join(BIN, "voice.mjs"), dir, "--no-hearback"], { encoding: "utf8", env: { ...process.env, SHIPSHOW_LOCAL: local(), HYPERFRAMES_PYTHON: VENV_PY } });
  // Exactly the one stale take goes to Kokoro: it is voiced, or, where Kokoro is not installed, it is the one that fails.
  assert.match(r.stdout + r.stderr, /voiced 1\/1|Kokoro failed on: This is the first scene\./);
  assert.doesNotMatch(r.stdout, /every sentence already voiced/);
});

test("a bare python command in HYPERFRAMES_PYTHON counts as present: Kokoro takes are still levelled", { skip: spawnSync("python3", ["-c", "import numpy, soundfile"], { stdio: "ignore" }).status !== 0 && "python3 on PATH has no numpy and soundfile" }, () => {
  const dir = join(mkdtempSync(join(tmpdir(), "kx-test-")), "demo");
  cpSync(join(REPO, "template"), dir, { recursive: true });
  mkdirSync(join(dir, "assets", "voice"), { recursive: true });
  const cfg = JSON.parse(readFileSync(join(dir, "video.json"), "utf8"));
  const speed = Math.round(BASE_PACE * 1.25 * 1000) / 1000;
  const loud = (wav) => Math.max(...readWav(wav).samples.map(Math.abs));
  const wavs = ["01-intro", "02-idea"].flatMap((id) => sentences(readFileSync(join(dir, "script", `${id}.txt`), "utf8").trim()).map((text, i) => {
    const wav = join(dir, "assets", "voice", `${id}-${String(i + 1).padStart(2, "0")}.wav`);
    writeWav(wav, { rate: 24000, channels: 1, samples: Int16Array.from({ length: 24000 }, (_, k) => Math.round(Math.sin(k / 9) * 30000)) });
    writeFileSync(wav.replace(/\.wav$/, ".key"), JSON.stringify({ say: text, voice: cfg.voice, speed }));
    return wav;
  }));
  const before = wavs.map(loud);
  const r = spawnSync(process.execPath, [join(BIN, "voice.mjs"), dir, "--no-hearback"], { encoding: "utf8", env: { ...process.env, SHIPSHOW_LOCAL: local(), HYPERFRAMES_PYTHON: "python3" } });
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.match(r.stdout, /levelled 4 take/);
  assert.ok(wavs.every((w, i) => loud(w) < before[i] / 2), "the loud takes came down to the target level");
});

test("a Python named without a path is found on PATH, for the levelling and for the hear-back check", () => {
  const bin = mkdtempSync(join(tmpdir(), "kx-bin-"));
  writeFileSync(join(bin, "kxpython"), `#!${process.execPath}\nprocess.exit(process.argv[2] === "-c" ? 0 : 1);\n`, { mode: 0o755 });
  const saved = process.env.PATH;
  process.env.PATH = `${bin}${delimiter}${saved}`;
  try {
    assert.equal(pythonExists("kxpython"), true);
    assert.equal(pythonExists("kxpython-missing"), false);
    assert.equal(pythonExists(""), false);
    assert.equal(pythonExists("/nonexistent/python"), false);
    assert.equal(hearbackAvailable("kxpython"), true, "a bare command that imports faster_whisper can hear takes back");
  } finally {
    process.env.PATH = saved;
  }
});

test("a run above the measured speed is time-stretched, not squeezed", () => {
  const dir = longVideo(), py = fakeRunner();
  for (const speed of ["1.25", "1.3"]) {
    const r = voice(dir, py, "--engine", "omnivoice", "--speed", speed);
    assert.equal(r.status, 0, r.stderr + r.stdout);
    assert.equal(jobsLog(dir).at(-1).pace, "stretch", `speed ${speed} was never measured with a shorter window`);
  }
});

test("breathe: silence goes in at the quietest point between two sentences that ran together, and nowhere else", () => {
  const rate = 1000, tone = (n) => Array.from({ length: n }, (_, i) => Math.round(Math.sin(i) * 10000));
  // 1 s of voice, 50 ms of near-silence, 1 s of voice, 500 ms of silence, 1 s of voice
  const samples = Int16Array.from([...tone(1000), ...Array(50).fill(3), ...tone(1000), ...Array(500).fill(0), ...tone(1000)]);
  const { samples: out, shifts } = breathe(samples, rate, 1, [[0.99, 1.06], [2.04, 2.56]], 0.35);
  assert.deepEqual(shifts.map((x) => Math.round(x * 1000)), [280, 280], "the first boundary needed 0.28 s more (0.35 - 0.07); the second already had 0.52 s");
  assert.equal(out.length, samples.length + 280);
  // the inserted silence sits inside the quiet stretch, with the first sentence untouched before it
  assert.deepEqual([...out.slice(0, 990)], [...samples.slice(0, 990)], "the first sentence is not touched");
  const loud = [...out.slice(1000, 1330)].filter((x) => Math.abs(x) > 50).length;
  assert.equal(loud, 0, "the breath is silence, put where it was already quiet");
  assert.deepEqual([...out.slice(out.length - 1000)], [...samples.slice(samples.length - 1000)], "the last sentence is moved, not changed");
  // two sentences with no quiet point between them (the voice runs straight on) are left alone, never cut mid-word
  const run_on = Int16Array.from([...tone(1000), ...tone(1000)]);
  const kept = breathe(run_on, rate, 1, [[0.99, 1.01]], 0.35);
  assert.equal(kept.samples, run_on);
  assert.deepEqual(kept.shifts, [0]);
  // a take whose sentences already have their gap comes back as it was
  const calm = breathe(samples, rate, 1, [[2.04, 2.56]], 0.35);
  assert.equal(calm.samples, samples);
  assert.deepEqual(calm.shifts, [0]);
});

test("breathe: a word's trailing 's' is never split; the breath goes in the pause after it (qwen-phones-home, 'addre... ss')", () => {
  const rate = 1000, tone = (n, a = 10000) => Array.from({ length: n }, (_, i) => Math.round(Math.sin(i) * a));
  // "address": voice, a 10 ms dip as the s starts, 220 ms of s hiss at about -42 dBFS, a 60 ms pause, then the next sentence.
  // Whisper ends the word at the dip and starts the next sentence 40 ms later, inside the hiss.
  const hiss = (n) => Array.from({ length: n }, (_, i) => (i % 2 ? 1 : -1) * 260);
  const samples = Int16Array.from([...tone(1000), ...Array(10).fill(40), ...hiss(220), ...Array(60).fill(0), ...tone(1000)]);
  const { samples: out, shifts } = breathe(samples, rate, 1, [[1.0, 1.04]], 0.35);
  assert.equal(Math.round(shifts[0] * 1000), 310, "0.35 s wanted, 0.04 s already there");
  // The hiss is whole and in one piece: every sample of it is still followed by the next, with no silence inside it.
  const at = [...out].findIndex((x, i) => i > 1010 && x === 0);
  assert.ok(at >= 1230, `the breath went in at ${at} ms, inside the hiss (1010 to 1230)`);
  assert.deepEqual([...out.slice(1010, 1230)], [...samples.slice(1010, 1230)], "the s is untouched");
  // A longer, quieter pause further on (a comma inside the next sentence) is not taken: the first pause after the word is.
  const comma = Int16Array.from([...tone(1000), ...Array(10).fill(40), ...hiss(150), ...Array(60).fill(5), ...tone(40), ...Array(150).fill(0), ...tone(1000)]);
  const first = breathe(comma, rate, 1, [[1.0, 1.04]], 0.35).samples;
  const cut = [...first].findIndex((x, i) => i > 1010 && x === 0);
  assert.ok(cut >= 1160 && cut < 1220, `the breath went in at ${cut} ms, not in the 60 ms pause after the s (1160 to 1220)`);
  // "first": the s, a 40 ms closure, the t's burst, then the real pause before the next sentence. The closure is followed by a
  // burst and quiet, not voice, so the breath goes in the pause after the t, never between the s and the t.
  const first_t = Int16Array.from([...tone(1000), ...hiss(100), ...Array(40).fill(0), ...hiss(20), ...Array(150).fill(3), ...tone(1000)]);
  const t_out = breathe(first_t, rate, 1, [[1.0, 1.05]], 0.35).samples;
  assert.deepEqual([...t_out.slice(1000, 1160)], [...first_t.slice(1000, 1160)], "the s, the closure and the t's burst stay together");
  assert.ok(t_out.length > first_t.length, "the breath went in somewhere");
  // A dip shorter than BREATH_RUN with no real pause near it is not a pause: the boundary is left alone.
  const dip_only = Int16Array.from([...tone(1000), ...Array(10).fill(40), ...hiss(220), ...tone(1000)]);
  const kept = breathe(dip_only, rate, 1, [[1.0, 1.04]], 0.35);
  assert.equal(kept.samples, dip_only);
});

test("runs by line: a script written one thought per line is voiced a line at a time", () => {
  const one = (t) => sentences(t);
  // three lines, the middle one two sentences: three takes, the two sentences together
  let text = "First thought here.\nSecond thought. It goes with the second.\nThird thought.";
  assert.deepEqual(lineRuns(text, one(text)), { runs: [[0], [1, 2], [3]], byLine: true });
  // one paragraph: the word-count rule, as before
  text = "A. B. C.";
  assert.equal(lineRuns(text, one(text)).byLine, false);
  // a line that does not end its sentence would merge with the next: fall back rather than misplace a sentence
  text = "This line runs on\ninto this one. And ends.";
  assert.equal(lineRuns(text, one(text)).byLine, false);
  // a line over LINE_MAX words is split into runs of up to 45
  const long = Array.from({ length: 6 }, (_, i) => `Sentence ${i} ` + "word ".repeat(13).trim() + ".").join(" ");
  text = "Short line.\n" + long;
  const r = lineRuns(text, one(text));
  assert.ok(long.split(/\s+/).length > LINE_MAX);
  assert.deepEqual(r.runs[0], [0]);
  assert.ok(r.runs.length > 2 && r.runs.slice(1).flat().join() === [1, 2, 3, 4, 5, 6].join(), "the long line is split, in order, and nothing is lost");
});

test("Drama 3 voices a paragraph of up to DRAMA_LINE_MAX words in one take; OmniVoice still splits at LINE_MAX", () => {
  const sentence = "one two three four five six seven eight nine ten.";
  const para = Array.from({ length: 10 }, () => sentence).join(" ");          // 100 words, ten sentences
  const text = `${para}\n\n${sentence}`;
  const says = [...Array(10).fill(sentence), sentence];
  assert.deepEqual(lineRuns(text, says, DRAMA_LINE_MAX).runs, [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [10]], "the paragraph is one take");
  assert.ok(lineRuns(text, says).runs.length > 2, "at LINE_MAX the 100-word line is split");
  assert.deepEqual(lineRuns(para, says.slice(0, 10), DRAMA_LINE_MAX).runs, [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]], "a one-paragraph scene is one take too");
});

test("an invented voice's style is folded into every direction it is told, and leads a take that has none", () => {
  const style = "bright young British narrator, curious and calm";
  assert.equal(styled("[measured, letting it land] It holds.", style), `[${style}, measured, letting it land] It holds.`);
  assert.equal(styled("It holds. [dry] Barely.", style), `[${style}] It holds. [${style}, dry] Barely.`);
  assert.equal(styled("[dry] It holds.", null), "[dry] It holds.", "no style: the take is told as written");
});
