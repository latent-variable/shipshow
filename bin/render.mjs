// Render a built video to out/<name>.mp4, the name taken from its path (lib.mjs outName).
//   node bin/render.mjs videos/<name> [--draft]
// and masters its audio to video.json "loudness" (LUFS; -14 by default, YouTube's; false for none).
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { HF, REPO, die, loudnessTarget, masterLoudness, outName, run, videoDir } from "./lib.mjs";

const dir = videoDir(process.argv[2]);
if (!existsSync(join(dir, "index.html"))) die("no index.html yet: node bin/build.mjs first");
const draft = process.argv.includes("--draft");
mkdirSync(join(REPO, "out"), { recursive: true });
const out = join(REPO, "out", `${outName(dir)}${draft ? "-draft" : ""}.mp4`);
const t0 = Date.now();
await run(HF, ["render", dir, "-o", out, "--fps", "30", "--quality", draft ? "draft" : "high", "--quiet"], { stdio: ["ignore", "inherit", "inherit"] })
  .catch((e) => die(e.message));
// Master the audio to the loudness the video is played at (video.json "loudness", default -14 LUFS; false turns it off).
const target = loudnessTarget(dir);
if (target !== null) {
  const m = masterLoudness(out, target);
  if (!m) console.log(`audio already at ${target} LUFS`);
  else console.log(`audio mastered from ${m.before} to ${m.after} LUFS (${m.gain >= 0 ? "+" : ""}${m.gain.toFixed(1)} dB, peaks limited by up to ${m.limited.toFixed(1)} dB)${m.after < target - 0.5 ? `; held under ${target} so no peak loses more than 3 dB` : ""}`);
}
console.log(`${out} in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
