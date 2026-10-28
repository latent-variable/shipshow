import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { REPO } from "../bin/lib.mjs";
import { footageIn, footageLength } from "../bin/footage.mjs";
import { memesIn, memesUsed } from "../bin/meme.mjs";

function run(cmd, args, options = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", ...options });
  assert.equal(r.status, 0, r.stderr || r.error?.message);
  return r.stdout;
}
const attr = (s, name) => s.match(new RegExp(`${name}="([^"]*)"`))?.[1];
function demo(extra = 'data-cue="paste" data-anim="fade"', src = 'footage/app.mp4') {
  const dir = join(mkdtempSync(join(tmpdir(), "ss-footage-")), "demo");
  cpSync(join(REPO, "template"), dir, { recursive: true });
  mkdirSync(join(dir, "footage"));
  run("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "testsrc=size=64x48:rate=30:duration=1", "-c:v", "libx264", "-pix_fmt", "yuv420p", join(dir, "footage/app.mp4")]);
  writeFileSync(join(dir, "timing.json"), JSON.stringify({ total: 6, scenes: [{ id: "01-intro", start: 1, duration: 5, sentences: [{ text: "Now paste here.", start: 1.5, duration: 2, words: [{ w: "Now", at: 1.5 }, { w: "paste", at: 2 }, { w: "here.", at: 3 }] }] }] }));
  writeFileSync(join(dir, "scenes.html"), `<section data-scene="01-intro"><figure class="ss-footage" data-footage="${src}" ${extra}></figure></section>`);
  return dir;
}
function build(dir, env = process.env) {
  return run(process.execPath, [join(REPO, "bin/build.mjs"), dir], { env });
}
const htmlAt = (dir) => readFileSync(join(dir, "index.html"), "utf8");
const video = (dir) => htmlAt(dir).match(/<video[^>]*>/)[0];
const encoded = (dir) => join(dir, attr(video(dir), "src"));
const pixels = (file, t) => {
  const r = spawnSync("ffmpeg", ["-v", "error", "-ss", String(t), "-i", file, "-frames:v", "1", "-pix_fmt", "rgb24", "-f", "rawvideo", "-"]);
  assert.equal(r.status, 0, r.stderr.toString());
  assert.ok(r.stdout.length > 0, "a decoded frame exists");
  return r.stdout;
};
const samePicture = (a, b) => {
  assert.equal(a.length, b.length);
  const error = a.reduce((sum, x, i) => sum + Math.abs(x - b[i]), 0) / a.length;
  assert.ok(error < 2, `mean pixel difference ${error}; allow H.264 quantization between encodes and keyframes`);
};
const frame = (file, t) => run("ffmpeg", ["-v", "error", "-ss", String(t), "-i", file, "-frames:v", "1", "-f", "md5", "-"]).trim();

test("footage builds at its word cue on a seekable track, separate from memes and credits", () => {
  const dir = demo();
  build(dir);
  const html = htmlAt(dir), tag = video(dir);
  assert.equal(attr(tag, "data-start"), "1.85");
  assert.equal(attr(tag, "data-duration"), "4.14");
  assert.match(tag, /class="clip ss-footage-img"/);
  assert.match(attr(tag, "src"), /^assets\/footage\/[a-f0-9]+\.mp4$/);
  assert.ok(existsSync(encoded(dir)));
  assert.ok(+attr(tag, "data-track-index") > 40);
  assert.match(tag, /muted playsinline/);
  assert.match(html, /data-scene-start="1" data-scene-duration="4.99"/);
  const figure = html.match(/<figure[^>]*>[\s\S]*?<\/figure>/)[0];
  assert.doesNotMatch(figure, /ss-meme|data-meme-|<span|font-family/);
  assert.deepEqual(memesIn(html), []);
  const root = mkdtempSync(join(tmpdir(), "ss-used-"));
  mkdirSync(join(root, "videos/demo"), { recursive: true });
  cpSync(join(dir, "scenes.html"), join(root, "videos/demo/scenes.html"));
  assert.equal(memesUsed(root).size, 0);
  assert.deepEqual(footageIn(html), [{ scene: "01-intro", file: "footage/app.mp4", length: 1, from: 0, start: 0.85, hold: 3.14 }]);
});

test("short footage holds its final frame through the window, without stream_loop", () => {
  const dir = demo();
  // Capture the actual encode arguments while still running the real encoder.
  const ffmpeg = run("which", ["ffmpeg"]).trim();
  const wrapper = join(dir, "tools");
  mkdirSync(wrapper);
  const log = join(dir, "ffmpeg-args.json");
  const shim = join(wrapper, "ffmpeg");
  writeFileSync(shim, `#!${process.execPath}\nconst fs = require('node:fs'); const cp = require('node:child_process'); const args = process.argv.slice(2); fs.writeFileSync(${JSON.stringify(log)}, JSON.stringify(args)); const r = cp.spawnSync(${JSON.stringify(ffmpeg)}, args, {stdio:'inherit'}); process.exit(r.status ?? 1);\n`);
  chmodSync(shim, 0o755);
  build(dir, { ...process.env, PATH: `${wrapper}:${process.env.PATH}` });
  const args = JSON.parse(readFileSync(log));
  assert.ok(args.includes("-i"), "the encode path ran");
  assert.ok(footageLength(encoded(dir)) >= +attr(video(dir), "data-duration"), "the encoded video covers its playback window");
  samePicture(pixels(encoded(dir), 2), pixels(encoded(dir), 4));
  assert.notEqual(frame(encoded(dir), 0), frame(encoded(dir), 0.5), "the recording moves before it holds");
  assert.ok(!args.includes("-stream_loop"));
  assert.match(args[args.indexOf("-vf") + 1], /tpad=stop_mode=clone/);
});

test("data-from offsets the first frame, changes the cache key and increases the hold", () => {
  const dir = demo();
  build(dir);
  const before = encoded(dir), atHalf = pixels(before, 0.5);
  const scenes = join(dir, "scenes.html");
  writeFileSync(scenes, readFileSync(scenes, "utf8").replace('data-anim="fade"', 'data-anim="fade" data-from="0.5"'));
  build(dir);
  assert.notEqual(encoded(dir), before);
  samePicture(pixels(encoded(dir), 0), atHalf);
  assert.deepEqual(footageIn(htmlAt(dir)).map((x) => [x.from, x.hold]), [[0.5, 3.64]]);
  const cached = encoded(dir);
  build(dir);
  assert.equal(encoded(dir), cached);
});

test("uncued footage starts at the scene start and accepts an absolute file path", () => {
  const dir = demo("");
  const scenes = join(dir, "scenes.html");
  writeFileSync(scenes, readFileSync(scenes, "utf8").replace('data-footage="footage/app.mp4"', `data-footage="${join(dir, "footage/app.mp4")}"`));
  build(dir);
  assert.equal(attr(video(dir), "data-start"), "1");
  assert.equal(attr(video(dir), "data-duration"), "4.99");
});

test("footage refuses URLs and invalid offsets, naming the scene", () => {
  for (const [src, extra, reason] of [
    ["https://example.com/app.mp4", "", /URL is refused/],
    ["file:///tmp/app.mp4", "", /URL is refused/],
    ["footage/missing.mp4", "", /no clip file/],
    ...["-1", "1", "NaN", ""].map((from) => ["footage/app.mp4", `data-from="${from}"`, /data-from must be seconds/]),
    ["footage/app.mp4", 'data-cue="+6"', /cue must be before/],
  ]) {
    const dir = demo(extra, src);
    const r = spawnSync(process.execPath, [join(REPO, "bin/build.mjs"), dir], { encoding: "utf8" });
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /scene 01-intro: data-footage=/);
    assert.match(r.stderr, reason);
  }
});

test("GIF and WebM footage play once, and source bytes and window affect the cache", () => {
  const dir = demo('data-cue="+1"');
  for (const ext of ["gif", "webm"]) {
    const input = join(dir, `footage/app.${ext}`);
    run("ffmpeg", ["-v", "error", "-i", join(dir, "footage/app.mp4"), input]);
    writeFileSync(join(dir, "scenes.html"), `<section data-scene="01-intro"><figure class="ss-footage" data-footage="footage/app.${ext}" data-cue="+1"></figure></section>`);
    build(dir);
    assert.ok(footageLength(encoded(dir)) >= 3.99);
    assert.equal(frame(encoded(dir), 2), frame(encoded(dir), 3));
  }
  const first = encoded(dir);
  const scenes = join(dir, "scenes.html");
  writeFileSync(scenes, readFileSync(scenes, "utf8").replace('+1', '+2'));
  build(dir);
  assert.notEqual(encoded(dir), first);
  const second = encoded(dir);
  run("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", "color=red:size=64x48:rate=30:duration=1", join(dir, "footage/app.webm")]);
  build(dir);
  assert.notEqual(encoded(dir), second);
});


test("an offset inside the last frame still holds, and a short window reports no hold", () => {
  const dir = demo('data-from="0.99"');
  build(dir);
  assert.ok(footageLength(encoded(dir)) >= 4.99);
  samePicture(pixels(encoded(dir), 0), pixels(encoded(dir), 4));
  writeFileSync(join(dir, "scenes.html"), `<section data-scene="01-intro"><figure class="ss-footage" data-footage="footage/app.mp4" data-cue="+4.5"></figure><figure class="ss-footage" data-footage="footage/app.mp4" data-cue="+4.6"></figure></section>`);
  build(dir);
  assert.deepEqual(footageIn(htmlAt(dir)).map((x) => x.hold), [0, 0]);
  const videos = [...htmlAt(dir).matchAll(/<video[^>]*>/g)].map((m) => m[0]);
  assert.equal(videos.length, 2);
  assert.notEqual(attr(videos[0], "data-track-index"), attr(videos[1], "data-track-index"));
});
