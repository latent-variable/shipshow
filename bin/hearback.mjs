// The node side of the take checks: bin/voicecheck.py (burst, shout, level) and bin/hearback.py
// (faster-whisper hears each take back and compares it with its text). Shared by bin/voice.mjs,
// bin/doctor.mjs and bin/review.mjs.
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { REPO, pythonExists } from "./lib.mjs";

const constant = (file, name) => +readFileSync(join(REPO, "bin", file), "utf8").match(new RegExp(`^${name} = ([\\d.]+)`, "m"))[1];

/** The rules' version (voicecheck.py): in an OmniVoice take's key and a Kokoro take's .lvl stamp. */
export const CHECK_VERSION = constant("voicecheck.py", "VERSION");
/** A take hearing back under this share of its text is flagged to listen to (hearback.py). */
export const HEARBACK_MIN = constant("hearback.py", "MIN");

/** Whether `py` can hear takes back: faster-whisper installed (npm run setup:hearback). */
export function hearbackAvailable(py) {
  return pythonExists(py) && spawnSync(py, ["-c", "import faster_whisper"], { stdio: "ignore" }).status === 0;
}

/** The .check file beside a take (written by hearback.py, or by omnivoice.py): {key, text, score, heard, faults}, or null. */
export function readCheck(wav, key) {
  const f = wav.replace(/\.wav$/, ".check");
  if (!existsSync(f)) return null;
  try {
    const c = JSON.parse(readFileSync(f, "utf8"));
    return c.key === key ? c : null;
  } catch {
    return null;
  }
}

/** What a Kokoro take's .lvl file holds once it is levelled (voicecheck.py `stamp`). */
export const levelStamp = (key) => `v${CHECK_VERSION}:${createHash("sha256").update(String(key)).digest("hex").slice(0, 12)}`;

/** The review packet's "Voice checks" section, as lines: the sentences the checks flagged (timing.json "voiceCheck"). */
export function voiceCheckSection(vc) {
  const table = (head, rows) => [`| ${head.join(" | ")} |`, `|${head.map(() => "---").join("|")}|`, ...rows.map((r) => `| ${r.join(" | ").replace(/\n/g, " ")} |`), ""];
  const pct = (x) => `${Math.round(x * 100)}%`;
  const out = ["## Voice checks", ""];
  if (!vc) return [...out, "None recorded (voiced before the checks existed): npm run voice again.", ""];
  out.push(vc.hearBack
    ? `Each of ${vc.checked} ${vc.runs ? "runs of sentences" : "sentences"} was heard back by faster-whisper and compared with its text; under ${pct(vc.min)} is flagged. Listen to those: a dropped or mangled word is the commonest fault in a voiced take. Hearing a take back cannot catch a word said wrongly that Whisper mends from context.`
    : "Not heard back (faster-whisper is not installed: npm run setup:hearback), so a dropped or mangled word would not have been caught by the pipeline.", "");
  if (vc.runs) out.push(`The takes are runs of whole sentences (DESIGN D47), so the sentence column names the sentences in the run, and the sentence and word times come from Whisper: ${vc.runs.matched} of ${vc.runs.words} words were matched to what was heard, and the rest were placed between their neighbours.`, "");
  if (vc.flagged.length) out.push(...table(["scene", "sentence", "heard back", "script", "heard"], vc.flagged.map((f) => [f.scene, f.sentence, pct(f.score), f.text, f.heard])));
  if (vc.faults.length) out.push(...table(["scene", "sentence", "script", "fault kept after retakes"], vc.faults.map((f) => [f.scene, f.sentence, f.text, f.faults.join("; ")])));
  if (!vc.flagged.length && !vc.faults.length) out.push("Nothing flagged.", "");
  return out;
}

/** The review packet's "Second listen" section: Parakeet's hearing of the finished narration (bin/listen.py, assets/listen.json),
 *  or why there is none. `current` is false when the narration changed after it was heard. */
export function listenSection(listen, current) {
  const out = ["## Second listen", ""];
  if (!listen) return [...out, "None: a second model has not heard the finished narration (npm run setup:listen, then npm run voice; Apple Silicon).", ""];
  if (!current) return [...out, "Stale: the narration changed after the last second listen. Run npm run voice again (it listens at the end).", ""];
  out.push(`Parakeet (${listen.model}) heard each scene of the finished track, compared with the script as written: under ${Math.round(listen.min * 100)}% of its letters, a sentence not heard, or letters spelled out that the script never spells are flagged. A different model from hear-back's, so it fails differently; listen to each flagged scene.`, "");
  const flagged = listen.scenes.filter((r) => r.flag);
  if (!flagged.length) return [...out, `Nothing flagged in ${listen.scenes.length} scenes.`, ""];
  out.push("| scene | heard | not heard | spelled out | what Parakeet heard |", "|---|---|---|---|---|");
  for (const r of flagged) out.push(`| ${r.scene} | ${Math.round(r.score * 100)}% | ${r.missing.join(" / ") || ""} | ${r.spelled.join(", ")} | ${r.heard.replace(/\|/g, "/").replace(/\n/g, " ")} |`);
  return [...out, ""];
}
