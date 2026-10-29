// How long a video's steps take, from what each step recorded in review/timeline.jsonl (lib.mjs recordStep, DESIGN D86).
//   node bin/timeline.mjs videos/<name> [--json]
// For each step: how many times it ran, the last run and the median, and a rate that compares across videos: voicing in
// seconds per minute of narration and hear-back rounds per take, rendering as a multiple of real time. Then what a rebuild
// after a script change costs (the last voice, build and render together).
import { isEntry } from "./entry.mjs";
import { readTimeline, videoDir } from "./lib.mjs";

export const ORDER = ["voice", "build", "overlaps", "review", "render-draft", "render", "package"];

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null;
};

/** What a step costs, read the same way whatever the video: null when the row has nothing to compare it with. */
export function rate(row) {
  if (row.step === "voice" && row.audio) {
    const perMin = row.seconds / (row.audio / 60);
    const rounds = row.voiced ? row.rounds / row.voiced : null;
    return `${Math.round(perMin)} s per narration minute${rounds ? `, ${rounds.toFixed(1)} rounds a take (${row.voiced} of ${row.takes} voiced)` : ", nothing voiced again"}`;
  }
  if (row.step.startsWith("render") && row.video) return `${(row.video / row.seconds).toFixed(2)}x real time`;
  return null;
}

/** Per step, in pipeline order: runs, the last row, the median seconds; and the last voice + build + render as one rebuild. */
export function summarize(rows) {
  const steps = [...new Set([...ORDER, ...rows.map((r) => r.step)])].filter((s) => rows.some((r) => r.step === s));
  const per = steps.map((step) => {
    const mine = rows.filter((r) => r.step === step);
    return { step, runs: mine.length, last: mine.at(-1), median: median(mine.map((r) => r.seconds)) };
  });
  // One rebuild: the last voice, the first build after it, the first full render after that build. A voice run with no build or
  // render since is not added to older ones; the rebuild is unknown until they run.
  const at = (r) => Date.parse(r.at);
  const voice = rows.filter((r) => r.step === "voice").at(-1);
  const build = voice && rows.find((r) => r.step === "build" && at(r) >= at(voice));
  const render = build && rows.find((r) => r.step === "render" && at(r) >= at(build));
  const rebuild = render ? Math.round(voice.seconds + build.seconds + render.seconds) : null;
  return { steps: per, rebuild };
}

const clock = (s) => (s >= 60 ? `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}` : `${s.toFixed(1)} s`);

if (isEntry(import.meta.url)) {
  const dir = videoDir(process.argv[2]);
  const rows = readTimeline(dir);
  const sum = summarize(rows);
  if (process.argv.includes("--json")) console.log(JSON.stringify(sum, null, 2));
  else if (!rows.length) console.log("nothing timed yet: each step records itself in review/timeline.jsonl as it runs");
  else {
    for (const p of sum.steps) {
      const r = rate(p.last);
      console.log(`${p.step.padEnd(13)} last ${clock(p.last.seconds).padStart(7)}  median ${clock(p.median).padStart(7)}  ${String(p.runs).padStart(3)} run(s)  ${p.last.at.slice(0, 16).replace("T", " ")}${r ? `  ${r}` : ""}`);
    }
    if (sum.rebuild !== null) console.log(`a rebuild after a script change (the last voice + build + render): ${clock(sum.rebuild)}`);
  }
}
