// Voice a video's script and time every sentence. Kokoro by default; "engine": "omnivoice" in video.json
// (or --engine omnivoice) is the higher-quality one, and "drama" (Fish Audio Drama 3) the directed one: it performs
// the [stage directions] written in the script, which every other engine and every caption leaves out (DESIGN D55).
// A take is one sentence, except for OmniVoice with hear-back installed, and Drama 3: then it is a run of whole
// sentences, a line of the script (see below).
//   node bin/voice.mjs videos/<name> [--speed 1.25] [--engine omnivoice|drama] [--voice caro_davy]
// Writes, in the video folder (all generated, none committed):
//   assets/voice/<scene>-<n>.wav   one take per sentence; a take whose text, voice and speed
//                                  are unchanged is kept, so editing one sentence re-voices one
//   assets/voice/<scene>-r<n>.wav  or, for a run of sentences, one take per run (OmniVoice with hear-back)
//   assets/narration.wav           every take on one track, with the pauses from video.json
//   assets/voice/<scene>-<n>.check what the take was judged by: hear-back score, faults (see below)
//   assets/listen.json             the second listen: Parakeet on the finished track, scene by scene (bin/listen.py)
//   timing.json                    when each scene and each sentence starts and how long it is, and
//                                  "voiceCheck": the sentences to listen to (bin/review.mjs prints them)
// Voicing each sentence on its own makes its start exact without speech recognition: a sentence starts
// where we placed its take, and a word inside it is placed by its share of the letters. But every
// sentence on its own restarts its prosody, which the owner heard as choppy (2026-10-26), so when the
// worker can also hear its takes back (faster-whisper) OmniVoice voices a scene in runs of whole
// sentences up to 45 words and Whisper's word times place the sentences and words inside the run
// (bin/wordtime.py, DESIGN D47). Kokoro, and OmniVoice without hear-back, stay one take per sentence.
// Every take is also checked, never required: OmniVoice takes are cut of their opening burst, made
// again when they shout, and levelled (bin/omnivoice.py, bin/voicecheck.py); Kokoro takes are levelled
// where they lie, without voicing them again; and when faster-whisper is installed (npm run
// setup:hearback) each take is heard back and compared with its text (bin/hearback.py). --no-hearback
// turns the last off. Hearing a take back is verification: timing stays as above.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { DRAMA, DRAMA_LINE_MAX, DRAMA_PY, LISTEN_PY, REPO, HF, VENV_PY, beatsAfter, breathe, drawled, config, styled, die, directedSentences, lineRuns, pythonExists, readWav, round, run, scenes, spoken, spokenWords, ttsEnv, videoDir, writeWav, recordStep } from "./lib.mjs";
import { CHECK_VERSION, HEARBACK_MIN, hearbackAvailable, levelStamp, readCheck } from "./hearback.mjs";

const PARALLEL = 3;

const STARTED = Date.now();   // the whole step, listen included, for review/timeline.jsonl (D86)
const dir = videoDir(process.argv[2]);
const cfg = config(dir);
if (!existsSync(HF)) die("HyperFrames is not installed here: npm install");
const vdir = join(dir, "assets", "voice");
mkdirSync(vdir, { recursive: true });

const omni = cfg.engine === "omnivoice";
const drama = cfg.engine === "drama";
// Drama 3 has its own venv (a newer mlx-audio than OmniVoice's pin); it carries faster-whisper too.
const py = drama ? process.env.SHIPSHOW_DRAMA_PYTHON || DRAMA_PY : process.env.HYPERFRAMES_PYTHON || VENV_PY;
const noHear = process.argv.includes("--no-hearback");
const hear = !noHear && hearbackAvailable(py);
const RUNS = (omni && hear) || drama;   // OmniVoice voices runs of sentences when it can hear them back (D47); Drama 3 always does (D55)
// The rules bin/drama.py makes, retakes and finishes a take by. Bump it when they change, so takes are voiced again.
const DRAMA_RULES = 6;   // bin/drama.py's rules: 2 reads a stall against the voice (GAP_BELOW_VOICE), 3 trims edges by it, 4 retakes a take missing a whole sentence, 5 one that spells out letters (2026-10-27), 6 each line hears the first take and the take before it (D83, 2026-10-29)
// A run takes its speed from a shorter window, as DAIS product-videos does, not from atempo: measured 2026-10-26
// at speed 1.2 on 5 runs three times each, both heard back at 0.998 and none under 0.988 (DESIGN D47).
// Measured only up to 1.2; above it (the 1.25 default, up to 1.3) a run is generated at its natural length and
// time-stretched, as one sentence always was: a window squeezed to 1.3x dropped words in 7 of 24 sentences
// (2026-10-17). Raise WINDOW_MAX only with a hear-back measurement at the new speed.
const WINDOW_MAX = 1.2;
// How bin/omnivoice.py prepares a reference (quiet(): a hissy clip is cleaned first). Bump it when that changes,
// so takes cloned from the old preparation are voiced again.
const REF_PREP = 2;
const PACE = cfg.speed <= WINDOW_MAX + 1e-9 ? "window" : "stretch";

// Every take (a sentence, or a run of sentences) and whether it is current.
const jobs = [];
const plan = scenes(dir).map((s) => {
  // Stage directions ([deadpan], [laughs]) are Drama 3's: the written and timed text never has them, and only Drama 3 is told them.
  const ds = directedSentences(s.text);
  const texts = ds.map((d) => d.text);
  const says = texts.map((t) => spoken(t, cfg.say));
  const directed = ds.map((d) => spoken(d.directed, cfg.say));
  // a script written one thought per line is voiced a line at a time (lineRuns); otherwise up to 45 words a take
  const groups = RUNS ? lineRuns(s.text, says, cfg.engine === "drama" ? DRAMA_LINE_MAX : undefined).runs : texts.map((_, i) => [i]);
  const beats = beatsAfter(s.text);
  return {
    id: s.id,
    beats: groups.map((idx) => beats.has(idx[idx.length - 1])),   // a blank line follows this take: a beat after it
    units: groups.map((idx, n) => {
      const text = idx.map((i) => texts[i]).join(" "), say = idx.map((i) => says[i]).join(" ");
      const told = drama ? styled(idx.map((i) => directed[i]).join(" "), cfg.omni?.style) : idx.map((i) => directed[i]).join(" ");
      const wav = join(vdir, RUNS ? `${s.id}-r${String(n + 1).padStart(2, "0")}.wav` : `${s.id}-${String(idx[0] + 1).padStart(2, "0")}.wav`);
      // A Kokoro take's key is unchanged from before omnivoice existed, so its takes stay valid.
      const key = JSON.stringify(drama
        // the model's revision, the clip and its words, and the line as told (directions in): a changed direction voices the line again
        ? { engine: "drama", text, say: told, voice: cfg.omni.identity, speed: cfg.speed, model: DRAMA.revision, take: "line+stretch", rules: DRAMA_RULES, check: CHECK_VERSION, ref: cfg.omni.text ? "given" : "heard" }
        : omni
        // check: the rules a take is cut, retaken and levelled by (voicecheck.py VERSION); ref: whether
        // the voice's reference has a transcript, given or heard back, which clones it better; a run's
        // key also carries its written text, since its word times depend on it
        ? { engine: "omnivoice", ...(RUNS ? { text } : {}), say, voice: cfg.omni.identity, speed: cfg.speed, take: RUNS ? `run+${PACE}` : "natural+trim+stretch", check: CHECK_VERSION, refPrep: REF_PREP, ref: cfg.omni.text ? "given" : hear ? "heard" : "none" }
        : { say, voice: cfg.voice, speed: cfg.kokoroSpeed });
      const keyFile = wav.replace(/\.wav$/, ".key");
      // A Kokoro take levelled by older rules (voicecheck.py VERSION) was squashed by them: voice it again.
      const lvl = wav.replace(/\.wav$/, ".lvl");
      const older = !omni && existsSync(lvl) && /^v\d+:/.test(readFileSync(lvl, "utf8")) && !readFileSync(lvl, "utf8").startsWith(`v${CHECK_VERSION}:`);
      const fresh = existsSync(wav) && existsSync(keyFile) && readFileSync(keyFile, "utf8") === key && !older;
      if (!fresh) jobs.push({ text, say, told, wav, key, keyFile, parts: RUNS ? idx.map((i) => spokenWords(texts[i], cfg.say)) : undefined });
      return { idx, texts: idx.map((i) => texts[i]), text, say, wav, key };
    }),
  };
});

if (!plan.some((s) => s.units.length)) die("the script has no sentences to voice");

async function voiceOne({ say, wav, key, keyFile }) {
  writeFileSync(wav.replace(/\.wav$/, ".lvl"), "");   // this take is not levelled yet (a wav voiced again under the same key)
  await run(HF, ["tts", say, "-v", cfg.voice, "-s", String(cfg.kokoroSpeed), "-o", wav, "--json"], { env: ttsEnv() });
  writeFileSync(keyFile, key);
}

// OmniVoice loads a model of about 1.5 GB, so one process voices every stale sentence.
// A seed from each take's key makes a sentence voice the same way every run.
async function voiceAllOmni() {
  if (!pythonExists(py)) die("omnivoice needs this repo's .venv: npm run setup:omnivoice");
  const spec = join(dir, "assets", "omnivoice-jobs.json");
  writeFileSync(spec, JSON.stringify({
    speed: cfg.speed,
    voice: { name: cfg.omni.name, wav: cfg.omni.wav, text: cfg.omni.text },
    cache: join(dir, "assets", "omnivoice"),
    hearback: hear,
    min: HEARBACK_MIN,
    pace: RUNS ? PACE : "stretch",
    jobs: jobs.map((j) => ({ text: j.say, written: j.text, wav: j.wav, key: j.key, parts: j.parts, seed: parseInt(createHash("sha256").update(j.key).digest("hex").slice(0, 8), 16) })),
  }));
  try {
    await run(py, [join(REPO, "bin", "omnivoice.py"), spec]);
  } catch (e) {
    die(`OmniVoice failed\n${e.message}\nnpm run doctor -- --omnivoice says what is missing.`);
  }
  for (const j of jobs) writeFileSync(j.keyFile, j.key);
  console.log(`voiced ${jobs.length}/${jobs.length}`);
}

// Drama 3 loads a model of about 22 GB, so one process voices every stale line too.
async function voiceAllDrama() {
  if (!pythonExists(py)) die("drama needs its own venv: npm run setup:drama (Apple Silicon)");
  const spec = join(dir, "assets", "drama-jobs.json");
  const order = plan.flatMap((s) => s.units.map((u) => u.wav));   // every take of the video, in the order it is heard
  writeFileSync(spec, JSON.stringify({
    speed: cfg.speed,
    voice: { name: cfg.omni.name, wav: cfg.omni.wav, text: cfg.omni.text },
    model: cfg.dramaModel ? { path: cfg.dramaModel } : DRAMA,
    hearback: hear,
    min: HEARBACK_MIN,
    // keyFile: the worker writes each take's key as soon as the take is kept, so a long run stopped halfway keeps what it made.
    // after and anchor: the take before this line in the video and the video's first take, which the line hears (D83). Jobs go
    // in the video's order, so a stale line after a stale line hears the take just made for it.
    jobs: jobs.map((j) => {
      const at = order.indexOf(j.wav);
      return { text: j.told, plain: j.say, written: j.text, wav: j.wav, key: j.key, keyFile: j.keyFile, parts: j.parts, seed: parseInt(createHash("sha256").update(j.key).digest("hex").slice(0, 8), 16),
        after: at > 0 ? order[at - 1] : null, anchor: at > 0 ? order[0] : null };
    }),
  }));
  try {
    await run(py, [join(REPO, "bin", "drama.py"), spec]);
  } catch (e) {
    die(`Drama 3 failed\n${e.message}\nnpm run doctor -- --drama says what is missing.`);
  }
  for (const j of jobs) writeFileSync(j.keyFile, j.key);
  console.log(`voiced ${jobs.length}/${jobs.length}`);
}

const t0 = Date.now();
if (drama && jobs.length) await voiceAllDrama();
else if (omni && jobs.length) await voiceAllOmni();
else {
  let done = 0;
  const queue = [...jobs];
  await Promise.all(
    Array.from({ length: Math.min(PARALLEL, queue.length) }, async () => {
      while (queue.length) {
        const job = queue.shift();
        try {
          await voiceOne(job);
        } catch (e) {
          die(`Kokoro failed on: ${job.say}\n${e.message}\nnpm run doctor says what is missing.`);
        }
        process.stdout.write(`\rvoiced ${++done}/${jobs.length}`);
      }
    }),
  );
}
if (jobs.length) console.log(` in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
else console.log("every sentence already voiced");

// Check the takes. Kokoro's are set to one speech level in place (the key does not change, so nothing
// is voiced again; a .lvl stamp says which are done); OmniVoice's were levelled as they were made.
// Neither check is required: a missing numpy or faster-whisper skips it and says so.
const takes = plan.flatMap((s) => s.units);
const pyRun = (script, items, extra = {}) => {
  const spec = join(dir, "assets", `${script}-spec.json`);
  writeFileSync(spec, JSON.stringify({ items, min: HEARBACK_MIN, ...extra }));
  return spawnSync(py, [join(REPO, "bin", `${script}.py`), ...(script === "voicecheck" ? ["level"] : []), spec], { encoding: "utf8" });
};
if (!omni && !drama && pythonExists(py)) {
  const todo = takes.filter((t) => !existsSync(t.wav.replace(/\.wav$/, ".lvl")) || readFileSync(t.wav.replace(/\.wav$/, ".lvl"), "utf8") !== levelStamp(t.key));
  if (todo.length) {
    const r = pyRun("voicecheck", todo.map((t) => ({ wav: t.wav, key: t.key })));
    if (r.status === 0) console.log(`levelled ${todo.length} take(s) to one speech level`);
    else console.warn(`not levelled (${(r.stderr || r.stdout).trim().split("\n").pop()}); the takes are as the engine made them`);
  }
}
if (hear) {
  // a take heard before letters spelled out were looked for is read again from what was heard (no new hearing)
  const todo = takes.filter((t) => { const c = readCheck(t.wav, t.key); return c?.score == null || !c.spelledChecked; });
  if (todo.length) {
    console.log(`checking ${todo.length} take(s) with faster-whisper`);
    const r = pyRun("hearback", todo.map((t) => ({ text: t.say, written: t.text, wav: t.wav, key: t.key })));
    if (r.status !== 0) console.warn(`hear-back failed (${(r.stderr || r.stdout).trim().split("\n").pop()}); takes are not checked`);
  }
}

// Where each sentence of a take is, as {text, start, duration, words?}: Whisper's word times when the take
// is a run that was heard back (the .check file's `timing`), else a take of one sentence is where we put
// it with its words by their share of the letters (build.mjs), and a run without word times shares the
// take out by letters.
function sentenceTimes(unit, at, dur, shifts = []) {
  const timed = readCheck(unit.wav, unit.key)?.timing?.sentences;
  if (timed?.length === unit.texts.length) {
    return unit.texts.map((text, k) => {
      const x = timed[k], d = k ? shifts[k - 1] || 0 : 0, start = at + x.start + d;
      return { text, start: round(start), duration: round(Math.max(at + x.end + d - start, 0.05)), words: x.words.map((w) => ({ w: w.w, at: round(at + w.at + d) })) };
    });
  }
  const letters = unit.texts.map((x) => x.replace(/\s/g, "").length || 1);
  const total = letters.reduce((a, b) => a + b, 0);
  let before = 0;
  return unit.texts.map((text, k) => {
    const out = { text, start: round(at + (before / total) * dur), duration: round((letters[k] / total) * dur) };
    before += letters[k];
    return out;
  });
}

// Lay the takes out on one track and record where each landed.
let rate = 0, channels = 0, t = 0, breaths = 0;
const timing = { engine: cfg.engine, voice: cfg.voice, speed: cfg.speed, scenes: [] };
const placed = [];
for (const s of plan) {
  const scene = { id: s.id, start: round(t), sentences: [] };
  t += cfg.lead / cfg.speed + (cfg.leads[s.id] || 0);   // a beat before this scene: a new act's look and music arrive first
  s.units.forEach((unit, i) => {
    const wav = readWav(unit.wav);
    if (!rate) ({ rate, channels } = wav);
    if (wav.rate !== rate || wav.channels !== channels) die(`${unit.wav} is ${wav.rate} Hz, the others ${rate} Hz`);
    // A run keeps one prosody but can run its sentences together: where Whisper heard less than the video's gap between
    // two of them, a breath of silence goes in at the quietest point between them (bin/lib.mjs breathe, DESIGN D51).
    const timed = readCheck(unit.wav, unit.key)?.timing?.sentences;
    let samples = wav.samples, shifts = [];
    if (timed?.length > 1 && timed.length === unit.texts.length) {
      ({ samples, shifts } = breathe(wav.samples, rate, channels, timed.slice(1).map((x, k) => [timed[k].end, x.start]), cfg.gap / cfg.speed));
      breaths += shifts.filter((x, k) => x > (shifts[k - 1] || 0)).length;
    }
    const dur = samples.length / channels / rate;
    placed.push({ at: t, samples });
    scene.sentences.push(...sentenceTimes(unit, t, dur, shifts));
    t += dur + (i < s.units.length - 1 ? cfg.gap / cfg.speed + (s.beats[i] ? cfg.beat : 0) : 0);
  });
  t += cfg.tail / cfg.speed;
  t += cfg.pauses[s.id] || 0;                         // a beat after this scene: a meme or a stamp is read in it
  if (s === plan[plan.length - 1]) t += cfg.hold;   // the finished last frame stays up
  scene.duration = round(t - scene.start);
  timing.scenes.push(scene);
}
timing.total = round(t);

// What the checks found, for the review packet (bin/review.mjs): takes that heard back under the
// threshold, and takes kept with a fault after the retries. A run is named by its sentences, "2-4".
const voiceCheck = { hearBack: false, min: HEARBACK_MIN, checked: 0, flagged: [], faults: [] };
let timed = 0, words = 0, runs = 0;
for (const s of plan) s.units.forEach((unit) => {
  const c = readCheck(unit.wav, unit.key);
  if (!c) return;
  const at = { scene: s.id, sentence: unit.idx.length > 1 ? `${unit.idx[0] + 1}-${unit.idx.at(-1) + 1}` : unit.idx[0] + 1, text: unit.text };
  if (c.score != null) {
    voiceCheck.checked++;
    if (c.score < HEARBACK_MIN) voiceCheck.flagged.push({ ...at, score: c.score, heard: c.heard });
  }
  const drawl = drawled(c.timing?.sentences);   // a sentence dragged apart, flagged on a take made before the rule too
  const faults = [...(c.faults || []), ...(drawl && !(c.faults || []).some((f) => f.startsWith("drawled")) ? [`drawled: ${drawl}`] : [])];
  if (faults.length) voiceCheck.faults.push({ ...at, faults });
  if (c.timing) { runs++; timed += c.timing.matched; words += c.timing.words; }
});
voiceCheck.hearBack = voiceCheck.checked > 0;
if (runs) voiceCheck.runs = { takes: runs, words, matched: timed };   // word times from Whisper: how many words it heard
timing.voiceCheck = voiceCheck;

const track = new Int16Array(Math.ceil(t * rate) * channels);
for (const p of placed) track.set(p.samples, Math.round(p.at * rate) * channels);
writeWav(join(dir, "assets", "narration.wav"), { rate, channels, samples: track });
writeFileSync(join(dir, "timing.json"), JSON.stringify(timing, null, 1) + "\n");

if (voiceCheck.hearBack) console.log(`heard back: ${voiceCheck.checked} ${voiceCheck.runs ? "run(s)" : "sentence(s)"}, ${voiceCheck.flagged.length} under ${Math.round(HEARBACK_MIN * 100)}%`);
else console.log(noHear ? "not heard back: hear-back is off (--no-hearback)" : "not heard back (npm run setup:hearback lets the pipeline hear its takes and catch a dropped word)");
if (voiceCheck.runs) console.log(`voiced in ${voiceCheck.runs.takes} run(s) of sentences; ${voiceCheck.runs.matched} of ${voiceCheck.runs.words} words timed from what was heard, the rest placed between their neighbours`);
if (breaths) console.log(`${breaths} breath(s) put between sentences that ran together inside a run (at least the video's gap, ${round(cfg.gap / cfg.speed)} s)`);
for (const f of voiceCheck.flagged) console.log(`  LISTEN ${f.scene} sentence ${f.sentence}: ${Math.round(f.score * 100)}% heard back. Script: "${f.text}" Heard: "${f.heard}"`);
for (const f of voiceCheck.faults) console.log(`  LISTEN ${f.scene} sentence ${f.sentence}: ${f.faults.join("; ")}`);
const n = timing.scenes.reduce((a, s) => a + s.sentences.length, 0);
console.log(`${timing.scenes.length} scenes, ${n} sentences, ${timing.total} s -> assets/narration.wav, timing.json`);

// A second listen over the finished track, by another model (Parakeet), against the script as written (bin/listen.py).
// Optional (npm run setup:listen); --no-listen skips it. It flags, never re-voices.
if (!process.argv.includes("--no-listen")) {
  const listenPy = process.env.SHIPSHOW_LISTEN_PYTHON || LISTEN_PY;
  if (pythonExists(listenPy)) {
    const r = spawnSync(listenPy, [join(REPO, "bin", "listen.py"), dir], { stdio: "inherit" });
    if (r.status !== 0) console.warn("second listen failed; the narration is written, but nobody listened to it again");
  } else console.log("no second listen (npm run setup:listen lets Parakeet hear the finished narration against the script, Apple Silicon)");
}

// How long this voicing took and what it did, for `npm run timeline` (D86). `rounds`: hear-back rounds summed over the takes
// voiced this time, from each take's .check (Drama 3 writes it; a take with none counts one).
const roundsOf = (wav) => { try { return JSON.parse(readFileSync(wav.replace(/\.wav$/, ".check"), "utf8")).rounds ?? 1; } catch { return 1; } };
recordStep(dir, "voice", STARTED, { engine: cfg.engine, voice: cfg.voice, speed: cfg.speed, voiced: jobs.length,
  takes: plan.reduce((a, s) => a + s.units.length, 0), rounds: jobs.reduce((a, j) => a + roundsOf(j.wav), 0), audio: timing.total });
