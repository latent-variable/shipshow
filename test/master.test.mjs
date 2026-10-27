// Mastering a render's loudness (bin/lib.mjs masterLoudness, DESIGN D52): one gain to the target, a look-ahead limiter on the
// few peaks that would cross the true-peak line, the video stream copied untouched, and no second pass on a mastered file.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { DEFAULT_LOUDNESS, TRUE_PEAK, loudnessTarget, masterLoudness, measureLoudness } from "../bin/lib.mjs";

const ff = (args) => spawnSync("ffmpeg", ["-hide_banner", "-v", "error", "-y", ...args], { encoding: "utf8" });
const videoHash = (file) => ff(["-i", file, "-map", "0:v", "-c", "copy", "-f", "md5", "-"]).stdout.trim();

/** A 6 s clip: a test card, and a quiet tone with one loud burst, so the gain the target needs would push the burst over the peak. */
function clip(dir) {
  const file = join(dir, "clip.mp4");
  const r = ff(["-f", "lavfi", "-i", "testsrc=size=320x180:rate=30:duration=6", "-f", "lavfi", "-i", "sine=frequency=220:sample_rate=48000:duration=6",
    "-filter_complex", "[1:a]volume='if(between(t,3,3.2),0.9,0.06)':eval=frame[a]", "-map", "0:v", "-map", "[a]", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", file]);
  assert.equal(r.status, 0, r.stderr);
  return file;
}

test("master: the audio reaches the target with its peak under the line, the video is copied, and a mastered file is left alone", () => {
  const dir = mkdtempSync(join(tmpdir(), "kx-master-")), file = clip(dir), video = videoHash(file);
  const before = measureLoudness(file, -14);
  assert.ok(Number(before.input_i) < -20, `the clip starts quiet: ${before.input_i}`);
  const m = masterLoudness(file, -14);
  const after = measureLoudness(file, -14);
  assert.ok(m && Math.abs(Number(after.input_i) - m.after) < 0.01);
  assert.ok(Number(after.input_tp) <= TRUE_PEAK + 0.3, `the true peak stays near the line: ${after.input_tp}`);
  assert.ok(m.limited <= 3 + 1e-9, "the limiter never takes more than 3 dB off a peak");
  assert.ok(Number(after.input_i) <= -14 + 0.5, "never louder than the target");
  assert.equal(videoHash(file), video, "the picture is the same bytes");
  assert.equal(masterLoudness(file, -14), null, "a mastered file is not mastered again");
});

test("master: the target is video.json's, then local/config.json's, then -14; false turns it off; nonsense stops", () => {
  const dir = join(mkdtempSync(join(tmpdir(), "kx-loud-")), "v");
  mkdirSync(dir);
  const set = (v) => writeFileSync(join(dir, "video.json"), JSON.stringify(v === undefined ? {} : { loudness: v }));
  set(undefined); assert.equal(loudnessTarget(dir), DEFAULT_LOUDNESS);
  set(-16); assert.equal(loudnessTarget(dir), -16);
  set(false); assert.equal(loudnessTarget(dir), null);
  set("loud");
  const r = spawnSync(process.execPath, ["-e", `import(${JSON.stringify(new URL("../bin/lib.mjs", import.meta.url).href)}).then((m) => m.loudnessTarget(${JSON.stringify(dir)}))`], { encoding: "utf8" });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /loudness is "loud"; it takes -30 to -9 LUFS, or false/);
});
