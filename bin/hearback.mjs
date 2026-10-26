// The node side of the take checks: bin/voicecheck.py (burst, shout, level) and bin/hearback.py
// (faster-whisper hears each take back and compares it with its text). Shared by bin/voice.mjs,
// bin/doctor.mjs and bin/review.mjs.
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { REPO } from "./lib.mjs";

const constant = (file, name) => +readFileSync(join(REPO, "bin", file), "utf8").match(new RegExp(`^${name} = ([\\d.]+)`, "m"))[1];

/** The rules' version (voicecheck.py): in an OmniVoice take's key and a Kokoro take's .lvl stamp. */
export const CHECK_VERSION = constant("voicecheck.py", "VERSION");
/** A take hearing back under this share of its text is flagged to listen to (hearback.py). */
export const HEARBACK_MIN = constant("hearback.py", "MIN");

/** Whether `py` can hear takes back: faster-whisper installed (npm run setup:hearback). */
export function hearbackAvailable(py) {
  return !!py && existsSync(py) && spawnSync(py, ["-c", "import faster_whisper"], { stdio: "ignore" }).status === 0;
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
    ? `Each of ${vc.checked} sentences was heard back by faster-whisper and compared with its text; under ${pct(vc.min)} is flagged. Listen to those: a dropped or mangled word is the commonest fault in a voiced take. Hearing a take back cannot catch a word said wrongly that Whisper mends from context.`
    : "Not heard back (faster-whisper is not installed: npm run setup:hearback), so a dropped or mangled word would not have been caught by the pipeline.", "");
  if (vc.flagged.length) out.push(...table(["scene", "sentence", "heard back", "script", "heard"], vc.flagged.map((f) => [f.scene, f.sentence, pct(f.score), f.text, f.heard])));
  if (vc.faults.length) out.push(...table(["scene", "sentence", "script", "fault kept after retakes"], vc.faults.map((f) => [f.scene, f.sentence, f.text, f.faults.join("; ")])));
  if (!vc.flagged.length && !vc.faults.length) out.push("Nothing flagged.", "");
  return out;
}
