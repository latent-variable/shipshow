// Voice a video's script, one sentence at a time, and time every sentence. Kokoro by default;
// "engine": "omnivoice" in video.json (or --engine omnivoice) is the higher-quality one.
//   node bin/voice.mjs videos/<name> [--speed 1.25] [--engine omnivoice] [--voice caro_davy]
// Writes, in the video folder (all generated, none committed):
//   assets/voice/<scene>-<n>.wav   one take per sentence; a take whose text, voice and speed
//                                  are unchanged is kept, so editing one sentence re-voices one
//   assets/narration.wav           every take on one track, with the pauses from video.json
//   assets/voice/<scene>-<n>.check what the take was judged by: hear-back score, faults (see below)
//   timing.json                    when each scene and each sentence starts and how long it is, and
//                                  "voiceCheck": the sentences to listen to (bin/review.mjs prints them)
// Voicing each sentence on its own is what makes timing exact without speech recognition:
// a sentence starts where we placed its take.
// Every take is also checked, never required: OmniVoice takes are cut of their opening burst, made
// again when they shout, and levelled (bin/omnivoice.py, bin/voicecheck.py); Kokoro takes are levelled
// where they lie, without voicing them again; and when faster-whisper is installed (npm run
// setup:hearback) each take is heard back and compared with its text (bin/hearback.py). --no-hearback
// turns the last off. Hearing a take back is verification: timing stays as above.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { REPO, HF, VENV_PY, config, die, readWav, round, run, scenes, sentences, spoken, ttsEnv, videoDir, writeWav } from "./lib.mjs";
import { CHECK_VERSION, HEARBACK_MIN, hearbackAvailable, levelStamp, readCheck } from "./hearback.mjs";

const PARALLEL = 3;

const dir = videoDir(process.argv[2]);
const cfg = config(dir);
if (!existsSync(HF)) die("HyperFrames is not installed here: npm install");
const vdir = join(dir, "assets", "voice");
mkdirSync(vdir, { recursive: true });

const omni = cfg.engine === "omnivoice";
const py = process.env.HYPERFRAMES_PYTHON || VENV_PY;
const noHear = process.argv.includes("--no-hearback");
const hear = !noHear && hearbackAvailable(py);

// Every sentence, with the take it needs and whether that take is current.
const jobs = [];
const plan = scenes(dir).map((s) => ({
  id: s.id,
  sentences: sentences(s.text).map((text, i) => {
    const say = spoken(text, cfg.say);
    const wav = join(vdir, `${s.id}-${String(i + 1).padStart(2, "0")}.wav`);
    // A Kokoro take's key is unchanged from before omnivoice existed, so its takes stay valid.
    const key = JSON.stringify(omni
      // check: the rules a take is cut, retaken and levelled by (voicecheck.py VERSION); ref: whether
      // the voice's reference has a transcript, given or heard back, which clones it better
      ? { engine: "omnivoice", say, voice: cfg.omni.identity, speed: cfg.speed, take: "natural+trim+stretch", check: CHECK_VERSION, ref: cfg.omni.text ? "given" : hear ? "heard" : "none" }
      : { say, voice: cfg.voice, speed: cfg.kokoroSpeed });
    const keyFile = wav.replace(/\.wav$/, ".key");
    const fresh = existsSync(wav) && existsSync(keyFile) && readFileSync(keyFile, "utf8") === key;
    if (!fresh) jobs.push({ say, wav, key, keyFile });
    return { text, say, wav, key };
  }),
}));

if (!plan.some((s) => s.sentences.length)) die("the script has no sentences to voice");

async function voiceOne({ say, wav, key, keyFile }) {
  writeFileSync(wav.replace(/\.wav$/, ".lvl"), "");   // this take is not levelled yet (a wav voiced again under the same key)
  await run(HF, ["tts", say, "-v", cfg.voice, "-s", String(cfg.kokoroSpeed), "-o", wav, "--json"], { env: ttsEnv() });
  writeFileSync(keyFile, key);
}

// OmniVoice loads a model of about 1.5 GB, so one process voices every stale sentence.
// A seed from each take's key makes a sentence voice the same way every run.
async function voiceAllOmni() {
  if (!existsSync(py)) die("omnivoice needs this repo's .venv: npm run setup:omnivoice");
  const spec = join(dir, "assets", "omnivoice-jobs.json");
  writeFileSync(spec, JSON.stringify({
    speed: cfg.speed,
    voice: { name: cfg.omni.name, wav: cfg.omni.wav, text: cfg.omni.text },
    cache: join(dir, "assets", "omnivoice"),
    hearback: hear,
    min: HEARBACK_MIN,
    jobs: jobs.map((j) => ({ text: j.say, wav: j.wav, key: j.key, seed: parseInt(createHash("sha256").update(j.key).digest("hex").slice(0, 8), 16) })),
  }));
  try {
    await run(py, [join(REPO, "bin", "omnivoice.py"), spec]);
  } catch (e) {
    die(`OmniVoice failed\n${e.message}\nnpm run doctor -- --omnivoice says what is missing.`);
  }
  for (const j of jobs) writeFileSync(j.keyFile, j.key);
  console.log(`voiced ${jobs.length}/${jobs.length}`);
}

const t0 = Date.now();
if (omni && jobs.length) await voiceAllOmni();
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
const takes = plan.flatMap((s) => s.sentences);
const pyRun = (script, items, extra = {}) => {
  const spec = join(dir, "assets", `${script}-spec.json`);
  writeFileSync(spec, JSON.stringify({ items, min: HEARBACK_MIN, ...extra }));
  return spawnSync(py, [join(REPO, "bin", `${script}.py`), ...(script === "voicecheck" ? ["level"] : []), spec], { encoding: "utf8" });
};
if (!omni && existsSync(py)) {
  const todo = takes.filter((t) => !existsSync(t.wav.replace(/\.wav$/, ".lvl")) || readFileSync(t.wav.replace(/\.wav$/, ".lvl"), "utf8") !== levelStamp(t.key));
  if (todo.length) {
    const r = pyRun("voicecheck", todo.map((t) => ({ wav: t.wav, key: t.key })));
    if (r.status === 0) console.log(`levelled ${todo.length} take(s) to one speech level`);
    else console.warn(`not levelled (${(r.stderr || r.stdout).trim().split("\n").pop()}); the takes are as the engine made them`);
  }
}
if (hear) {
  const todo = takes.filter((t) => readCheck(t.wav, t.key)?.score == null);
  if (todo.length) {
    console.log(`hearing ${todo.length} take(s) back with faster-whisper`);
    const r = pyRun("hearback", todo.map((t) => ({ text: t.say, wav: t.wav, key: t.key })));
    if (r.status !== 0) console.warn(`hear-back failed (${(r.stderr || r.stdout).trim().split("\n").pop()}); takes are not checked`);
  }
}

// Lay the takes out on one track and record where each landed.
let rate = 0, channels = 0, t = 0;
const timing = { engine: cfg.engine, voice: cfg.voice, speed: cfg.speed, scenes: [] };
const placed = [];
for (const s of plan) {
  const scene = { id: s.id, start: round(t), sentences: [] };
  t += cfg.lead / cfg.speed;
  s.sentences.forEach((sen, i) => {
    const wav = readWav(sen.wav);
    if (!rate) ({ rate, channels } = wav);
    if (wav.rate !== rate || wav.channels !== channels) die(`${sen.wav} is ${wav.rate} Hz, the others ${rate} Hz`);
    const dur = wav.samples.length / channels / rate;
    placed.push({ at: t, samples: wav.samples });
    scene.sentences.push({ text: sen.text, start: round(t), duration: round(dur) });
    t += dur + (i < s.sentences.length - 1 ? cfg.gap / cfg.speed : 0);
  });
  t += cfg.tail / cfg.speed;
  t += cfg.pauses[s.id] || 0;                         // a beat after this scene: a meme or a stamp is read in it
  if (s === plan[plan.length - 1]) t += cfg.hold;   // the finished last frame stays up
  scene.duration = round(t - scene.start);
  timing.scenes.push(scene);
}
timing.total = round(t);

// What the checks found, for the review packet (bin/review.mjs): sentences that heard back under the
// threshold, and takes kept with a fault after the retries.
const voiceCheck = { hearBack: false, min: HEARBACK_MIN, checked: 0, flagged: [], faults: [] };
for (const s of plan) s.sentences.forEach((sen, i) => {
  const c = readCheck(sen.wav, sen.key);
  if (!c) return;
  const at = { scene: s.id, sentence: i + 1, text: sen.text };
  if (c.score != null) {
    voiceCheck.checked++;
    if (c.score < HEARBACK_MIN) voiceCheck.flagged.push({ ...at, score: c.score, heard: c.heard });
  }
  if (c.faults?.length) voiceCheck.faults.push({ ...at, faults: c.faults });
});
voiceCheck.hearBack = voiceCheck.checked > 0;
timing.voiceCheck = voiceCheck;

const track = new Int16Array(Math.ceil(t * rate) * channels);
for (const p of placed) track.set(p.samples, Math.round(p.at * rate) * channels);
writeWav(join(dir, "assets", "narration.wav"), { rate, channels, samples: track });
writeFileSync(join(dir, "timing.json"), JSON.stringify(timing, null, 1) + "\n");

if (voiceCheck.hearBack) console.log(`heard back: ${voiceCheck.checked} sentence(s), ${voiceCheck.flagged.length} under ${Math.round(HEARBACK_MIN * 100)}%`);
else console.log(noHear ? "not heard back: hear-back is off (--no-hearback)" : "not heard back (npm run setup:hearback lets the pipeline hear its takes and catch a dropped word)");
for (const f of voiceCheck.flagged) console.log(`  LISTEN ${f.scene} sentence ${f.sentence}: ${Math.round(f.score * 100)}% heard back. Script: "${f.text}" Heard: "${f.heard}"`);
for (const f of voiceCheck.faults) console.log(`  LISTEN ${f.scene} sentence ${f.sentence}: ${f.faults.join("; ")}`);
const n = timing.scenes.reduce((a, s) => a + s.sentences.length, 0);
console.log(`${timing.scenes.length} scenes, ${n} sentences, ${timing.total} s -> assets/narration.wav, timing.json`);
