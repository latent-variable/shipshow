// Memes (bin/meme.mjs): the template's boxes become positioned lines, in order; a missing or
// unreachable template stops the build naming the scene; a fetched template is cached; the
// catalog search ranks. No network: a fixture template and catalog (test/fixtures/memegen),
// served from a folder or, for the URL path, from a local HTTP server.
import assert from "node:assert/strict";
import { execFile, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import { REPO } from "../bin/lib.mjs";
import { boxPlacement, cropRect, gifFrames, imageSize, memesIn, parseConfig, parseCrop, search } from "../bin/meme.mjs";

const FIX = join(REPO, "test", "fixtures", "memegen");
const tiny = readFileSync(join(FIX, "templates", "tiny", "config.yml"), "utf8");
const run = promisify(execFile);

/** A demo video with one scene holding `figure`, its timing written as bin/voice.mjs would. */
function demo(figure) {
  const dir = join(mkdtempSync(join(tmpdir(), "kx-meme-")), "demo");
  cpSync(join(REPO, "template"), dir, { recursive: true });
  writeFileSync(join(dir, "timing.json"), JSON.stringify({
    total: 6, scenes: [{ id: "01-intro", start: 0, duration: 6, sentences: [{ text: "Everyone thinks so. It was never about it. Always has been.", start: 0.5, duration: 5 }] }],
  }));
  writeFileSync(join(dir, "scenes.html"), `<section data-scene="01-intro">${figure}</section>\n`);
  mkdirSync(join(dir, "assets"), { recursive: true });
  return dir;
}
const env = (extra = {}) => ({ ...process.env, SHIPSHOW_MEMES_CACHE: mkdtempSync(join(tmpdir(), "kx-cache-")), SHIPSHOW_MEMEGEN_FILES: FIX, SHIPSHOW_MEMEGEN_API: FIX, ...extra });
const build = (dir, e) => spawnSync(process.execPath, [join(REPO, "bin", "build.mjs"), dir], { env: e, encoding: "utf8" });
const FIGURE = `<figure class="ss-meme" data-meme="tiny" data-cue="Everyone" data-anim="pop"><span>Top line</span><span data-cue="Always" data-anim="slam">Bottom <b>line</b></span></figure>`;

test("a config's boxes are read in order, with their position, angle and look", () => {
  const cfg = parseConfig(tiny);
  assert.equal(cfg.name, "Tiny Test Meme");
  assert.equal(cfg.source, "https://example.com/memes/tiny");
  assert.equal(cfg.boxes.length, 2);
  assert.deepEqual(boxPlacement(cfg.boxes[0]), { left: 10, top: 5, width: 80, height: 20, angle: 0, align: "center", font: "thick", fill: "white", stroke: "black" });
  // Black text gets a white outline; the angle and alignment carry over.
  assert.deepEqual(boxPlacement(cfg.boxes[1]), { left: 25, top: 70, width: 50, height: 25, angle: -12, align: "left", font: "thin", fill: "black", stroke: "white" });
});

test("a colour that could leave the style attribute is replaced, and a box with no size is refused", () => {
  assert.equal(boxPlacement({ scale_x: 1, scale_y: 1, color: 'red;" onload="x' }).fill, "white");
  assert.throws(() => boxPlacement({ anchor_x: 0.1 }, "bad"), /bad has a text box with no size/);
});

test("the size of a picture comes from its header", () => {
  assert.deepEqual(imageSize(readFileSync(join(FIX, "templates", "tiny", "default.png"))), { w: 40, h: 20 });
  assert.throws(() => imageSize(Buffer.from("hello world, not an image at all")), /not a PNG/);
});

test("build fills the template's boxes with the spans in order, puts each on its cue, and copies the picture and fonts", () => {
  const dir = demo(FIGURE);
  const r = build(dir, env());
  assert.equal(r.status, 0, r.stderr);
  const html = readFileSync(join(dir, "index.html"), "utf8");
  assert.match(html, /<figure[^>]*class="ss-meme"[^>]*data-meme-name="Tiny Test Meme" data-meme-source="https:\/\/example.com\/memes\/tiny" style="--ar:2;"/);
  const boxes = [...html.matchAll(/<span class="ss-meme-box" data-font="(\w+)" style="([^"]*)"><span class="ss-meme-line"([^>]*)>([\s\S]*?)<\/span><\/span>/g)];
  assert.equal(boxes.length, 2);
  assert.equal(boxes[0][1], "thick");
  assert.match(boxes[0][2], /^left:10%;top:5%;width:80%;height:20%;--rot:0deg;--fill:white;--stroke:black;text-align:center$/);
  assert.match(boxes[0][4], /^Top line$/);
  assert.equal(boxes[1][1], "thin");
  assert.match(boxes[1][2], /left:25%;top:70%;width:50%;height:25%;--rot:-12deg;--fill:black;--stroke:white;text-align:left/);
  assert.match(boxes[1][3], /data-cue="Always" data-at="[\d.]+" data-anim="slam"/);
  assert.match(boxes[1][4], /^Bottom <b>line<\/b>$/);
  // The figure arrives on "Everyone", the second line later, on "Always".
  const at = (cue) => +html.match(new RegExp(`data-cue="${cue}" data-at="([\\d.]+)"`))[1];
  assert.ok(at("Everyone") < at("Always"));
  assert.ok(existsSync(join(dir, "assets", "memes", "tiny.png")));
  assert.ok(existsSync(join(dir, "assets", "memes", "fonts", "titillium-web-latin-900-normal.woff2")));
  assert.match(html, /@font-face \{ font-family: "Titillium Web"; font-weight: 900; src: url\("assets\/memes\/fonts\//);
  assert.deepEqual(memesIn(html), [{ id: "tiny", name: "Tiny Test Meme", source: "https://example.com/memes/tiny", lines: ["Top line", "Bottom line"] }]);
});

test("an empty span leaves its box blank, a missing span leaves no box, and more spans than boxes stop the build", () => {
  const blank = demo(`<figure class="ss-meme" data-meme="tiny"><span></span><span>Second</span></figure>`);
  assert.equal(build(blank, env()).status, 0);
  assert.deepEqual(memesIn(readFileSync(join(blank, "index.html"), "utf8"))[0].lines, ["", "Second"]);
  const one = demo(`<figure class="ss-meme" data-meme="tiny"><span>Only</span></figure>`);
  assert.equal(build(one, env()).status, 0);
  assert.equal((readFileSync(join(one, "index.html"), "utf8").match(/class="ss-meme-box"/g) || []).length, 1);
  const many = demo(`<figure class="ss-meme" data-meme="tiny"><span>a</span><span>b</span><span>c</span></figure>`);
  const r = build(many, env());
  assert.equal(r.status, 1);
  assert.match(r.stderr, /scene 01-intro: data-meme="tiny".*2 text box\(es\) but the figure has 3 spans/);
});

test("an unknown template stops the build and names the scene", () => {
  const r = build(demo(`<figure class="ss-meme" data-meme="nope"><span>x</span></figure>`), env());
  assert.equal(r.status, 1);
  assert.match(r.stderr, /scene 01-intro: data-meme="nope": no template "nope" in the memegen catalog/);
});

test("a fetched template is kept in the cache and used when the source is gone", () => {
  const e = env();
  assert.equal(build(demo(FIGURE), e).status, 0);
  assert.ok(existsSync(join(e.SHIPSHOW_MEMES_CACHE, "tiny", "config.yml")));
  assert.ok(existsSync(join(e.SHIPSHOW_MEMES_CACHE, "tiny", "default.png")));
  // The second build finds nothing at the source, and does not need to.
  const again = build(demo(FIGURE), { ...e, SHIPSHOW_MEMEGEN_FILES: "http://127.0.0.1:1" });
  assert.equal(again.status, 0, again.stderr);
});

test("an unreachable source with nothing cached stops the build with the reason", () => {
  const r = build(demo(FIGURE), env({ SHIPSHOW_MEMEGEN_FILES: "http://127.0.0.1:1" }));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /scene 01-intro: data-meme="tiny": could not reach http:\/\/127.0.0.1:1\/templates\/tiny\/config.yml/);
});

test("a template is fetched over HTTP from a mirror, its picture tried by extension", async () => {
  const seen = [];
  const server = createServer((req, res) => {
    seen.push(req.url);
    const file = join(FIX, req.url.replace(/^\/mirror\//, ""));
    if (req.url.startsWith("/mirror/") && existsSync(file)) res.end(readFileSync(file));
    else { res.statusCode = 404; res.end(); }
  });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  try {
    const dir = demo(FIGURE);
    const e = env({ SHIPSHOW_MEMEGEN_FILES: `http://127.0.0.1:${server.address().port}/mirror` });
    const r = await run(process.execPath, [join(REPO, "bin", "build.mjs"), dir], { env: e }).catch((x) => x);
    assert.ok(!r.code, r.stderr);
    assert.ok(existsSync(join(dir, "assets", "memes", "tiny.png")));
    assert.deepEqual(seen, ["/mirror/templates/tiny/config.yml", "/mirror/templates/tiny/default.gif", "/mirror/templates/tiny/default.jpg", "/mirror/templates/tiny/default.png"]);
  } finally {
    server.close();
  }
});

test("a template id cannot reach outside the cache", () => {
  const r = build(demo(`<figure class="ss-meme" data-meme="../../etc"><span>x</span></figure>`), env());
  assert.equal(r.status, 1);
  assert.match(r.stderr, /"..\/..\/etc" is not a template id/);
});

test("the search ranks id and name over keywords over example text, and lists everything with no words", () => {
  const list = JSON.parse(readFileSync(join(FIX, "templates.json"), "utf8"));
  assert.deepEqual(search(list, ["drake"]).map((t) => t.id), ["drake"]);
  assert.deepEqual(search(list, ["ohio"]).map((t) => t.id), ["astro"]);          // a keyword
  assert.deepEqual(search(list, ["round"]).map((t) => t.id), ["astro"]);         // example text
  assert.deepEqual(search(list, ["always", "has"]).map((t) => t.id), ["astro"]); // the name
  assert.deepEqual(search(list, ["tiny", "fixture"]).map((t) => t.id), ["tiny"]);
  assert.deepEqual(search(list, ["zzz"]), []);
  assert.equal(search(list, []).length, 3);
});

test("npm run memes prints id, name, lines, example and source, and caches the catalog", () => {
  const e = env();
  const r = spawnSync(process.execPath, [join(REPO, "bin", "memes.mjs"), "always", "has"], { env: e, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /astro {2}Always Has Been {2}\(4 lines\)\n {4}e\.g\. "Wait, it's round\?" \/ "Always has been"\n {4}https:\/\/example.com\/memes\/astro/);
  assert.ok(existsSync(join(e.SHIPSHOW_MEMES_CACHE, "templates.json")));
  // Cached: the catalog is no longer read from its source, until --refresh.
  const cached = spawnSync(process.execPath, [join(REPO, "bin", "memes.mjs"), "drake"], { env: { ...e, SHIPSHOW_MEMEGEN_API: join(tmpdir(), "no-such-catalog") }, encoding: "utf8" });
  assert.match(cached.stdout, /^drake {2}Drakeposting/);
  const refreshed = spawnSync(process.execPath, [join(REPO, "bin", "memes.mjs"), "drake", "--refresh"], { env: { ...e, SHIPSHOW_MEMEGEN_API: join(tmpdir(), "no-such-catalog") }, encoding: "utf8" });
  assert.equal(refreshed.status, 1);
  assert.match(refreshed.stderr, /the memegen catalog: no catalog at/);
});

// ---- animated memes (DESIGN D49): a template's animated GIF, or a clip, becomes a video the renderer can seek ----

const CLIPS = join(REPO, "test", "fixtures", "clips");
const probe = (file) => {
  const r = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries", "stream=width,height,nb_read_frames,r_frame_rate", "-of", "json", file], { encoding: "utf8" });
  const v = JSON.parse(r.stdout).streams[0];
  return { w: v.width, h: v.height, frames: +v.nb_read_frames, rate: v.r_frame_rate };
};
const hashAt = (file, t) => spawnSync("ffmpeg", ["-v", "error", "-ss", String(t), "-i", file, "-frames:v", "1", "-f", "md5", "-"], { encoding: "utf8" }).stdout.trim();
const videoTag = (html) => html.match(/<video[^>]*>/)[0];
const attr = (tag, name) => tag.match(new RegExp(`${name}="([^"]*)"`))[1];
/** A demo whose video folder holds the fixture clips, for data-clip="clips/band.mp4". */
function demoWithClips(figure) {
  const dir = demo(figure);
  cpSync(CLIPS, join(dir, "clips"), { recursive: true });
  return dir;
}

test("a GIF's frames are counted from its blocks: a moving one has several, a still picture none", () => {
  assert.equal(gifFrames(readFileSync(join(FIX, "templates", "blink", "default.gif"))), 3);
  assert.equal(gifFrames(readFileSync(join(CLIPS, "band.gif"))), 10);
  assert.equal(gifFrames(readFileSync(join(FIX, "templates", "tiny", "default.png"))), 0);
});

test("an animated template becomes a video that starts at its cue and runs to the scene's end, with its text boxes over it", () => {
  const dir = demo(`<figure class="ss-meme" data-meme="blink" data-cue="Everyone" data-anim="pop"><span>Top line</span><span>Bottom line</span></figure>`);
  const e = env();
  const r = build(dir, e);
  assert.equal(r.status, 0, r.stderr);
  const html = readFileSync(join(dir, "index.html"), "utf8");
  assert.ok(!/<img class="ss-meme-img"/.test(html), "no still picture");
  const tag = videoTag(html);
  const at = +html.match(/<figure[^>]*data-cue="Everyone" data-at="([\d.]+)"/)[1];
  assert.equal(+attr(tag, "data-start"), at);                          // starts with the figure
  assert.equal(+attr(tag, "data-duration"), Math.round((5.99 - at) * 100) / 100);   // to the scene's end (6 s less 10 ms)
  assert.match(tag, /\bmuted\b/);
  assert.match(tag, /data-has-audio="false"/);
  assert.match(tag, /class="clip ss-meme-img"/);
  // The scene is not itself timed (HyperFrames cannot time a video inside a timed element); kit.js reads data-scene-*.
  assert.match(html, /<section[^>]*data-scene-start="0" data-scene-duration="5.99"/);
  assert.ok(!/<section[^>]*\sdata-start=/.test(html));
  const file = join(dir, attr(tag, "src"));
  const v = probe(file);
  assert.deepEqual([v.w, v.h, v.rate], [32, 16, "30/1"]);
  assert.ok(Math.abs(v.frames - Math.ceil(+attr(tag, "data-duration") * 30)) <= 1, `${v.frames} frames`);   // the 0.6 s GIF is looped to cover the window
  assert.notEqual(hashAt(file, 0), hashAt(file, 0.2));                // and it moves
  // A keyframe a second: HyperFrames warns of (and seeks badly in) a clip with sparse ones.
  const keys = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-skip_frame", "nokey", "-show_entries", "frame=pts_time", "-of", "csv=p=0", file], { encoding: "utf8" }).stdout.trim().split("\n");
  assert.ok(keys.length >= Math.floor(+attr(tag, "data-duration")), `${keys.length} keyframes`);
  assert.match(html, /style="--ar:2;/);
  assert.equal((html.match(/class="ss-meme-box"/g) || []).length, 2);
  assert.deepEqual(memesIn(html), [{ id: "blink", name: "Blink Test Meme", source: "https://example.com/memes/blink", lines: ["Top line", "Bottom line"], clip: `${FIX}/templates/blink/default.gif` }]);
  // The cache keeps the GIF, not the still beside it.
  assert.ok(existsSync(join(e.SHIPSHOW_MEMES_CACHE, "blink", "default.gif")));
  assert.ok(!existsSync(join(e.SHIPSHOW_MEMES_CACHE, "blink", "default.png")));
});

test("a template cached as a still before animated ones were kept is fetched again, and a window change makes a new video", () => {
  const e = env();
  const stale = join(e.SHIPSHOW_MEMES_CACHE, "blink");
  mkdirSync(stale, { recursive: true });
  cpSync(join(FIX, "templates", "blink", "default.png"), join(stale, "default.png"));
  cpSync(join(FIX, "templates", "blink", "config.yml"), join(stale, "config.yml"));
  const dir = demo(`<figure class="ss-meme" data-meme="blink"><span>x</span></figure>`);
  assert.equal(build(dir, e).status, 0);
  const first = attr(videoTag(readFileSync(join(dir, "index.html"), "utf8")), "src");
  assert.ok(existsSync(join(stale, "default.gif")));
  // Same video, a cue later in the scene: a shorter window, so another file.
  writeFileSync(join(dir, "scenes.html"), `<section data-scene="01-intro"><figure class="ss-meme" data-meme="blink" data-cue="Always"><span>x</span></figure></section>\n`);
  assert.equal(build(dir, e).status, 0);
  assert.notEqual(attr(videoTag(readFileSync(join(dir, "index.html"), "utf8")), "src"), first);
});

test("a clip with a crop is cropped to the expected size, looped over its window, and credited in the packet", () => {
  const fig = (crop) => `<figure class="ss-meme" data-clip="clips/band.mp4" ${crop} data-name="Band" data-credit="https://example.com/band" data-cue="Everyone" data-anim="pop"><span class="top">Up here</span><span class="bottom" data-cue="Always" data-anim="slam">Down here</span></figure>`;
  const dir = demoWithClips(fig(`data-crop="top 25%"`));
  const r = build(dir, env());
  assert.equal(r.status, 0, r.stderr);
  const html = readFileSync(join(dir, "index.html"), "utf8");
  const tag = videoTag(html);
  const file = join(dir, attr(tag, "src"));
  assert.deepEqual([probe(file).w, probe(file).h], [64, 72]);        // 96 rows less the white band's 24
  assert.ok(Math.abs(probe(file).frames - Math.ceil(+attr(tag, "data-duration") * 30)) <= 1);   // a 1 s clip, looped to about 5.5 s
  assert.match(html, /style="--ar:0.8889;/);
  // The bands are drawn at the top and the bottom, each on its own cue.
  const boxes = [...html.matchAll(/<span class="ss-meme-box" data-font="\w+" style="([^"]*)"><span class="ss-meme-line"([^>]*)>([^<]*)/g)];
  assert.equal(boxes.length, 2);
  assert.match(boxes[0][1], /top:3%/);
  assert.match(boxes[1][1], /top:77%/);
  assert.ok(!/class="top"|class="bottom"/.test(html));
  assert.match(boxes[1][2], /data-cue="Always" data-at="[\d.]+" data-anim="slam"/);
  assert.deepEqual(memesIn(html), [{ id: "clip", name: "Band", source: "https://example.com/band", lines: ["Up here", "Down here"], clip: "clips/band.mp4" }]);
  // Pixels work too, and a GIF is as good as an MP4.
  const px = demoWithClips(fig(`data-crop="top 24px"`).replace("band.mp4", "band.gif"));
  assert.equal(build(px, env()).status, 0);
  const pxFile = join(px, attr(videoTag(readFileSync(join(px, "index.html"), "utf8")), "src"));
  assert.deepEqual([probe(pxFile).w, probe(pxFile).h], [64, 72]);
  // No crop, no text: the whole picture, no boxes. One span with no class is the top band.
  const bare = demoWithClips(`<figure class="ss-meme" data-clip="clips/band.mp4"></figure>`);
  assert.equal(build(bare, env()).status, 0);
  const bareHtml = readFileSync(join(bare, "index.html"), "utf8");
  assert.deepEqual([probe(join(bare, attr(videoTag(bareHtml), "src"))).w, probe(join(bare, attr(videoTag(bareHtml), "src"))).h], [64, 96]);
  assert.ok(!/ss-meme-box/.test(bareHtml.replace(/\.ss-meme-box[^\n]*/g, "")));
});

test("a clip is fetched from a URL once into the cache, and an unreachable or wrong one stops the build naming the scene", async () => {
  const server = createServer((req, res) => {
    if (req.url === "/band.mp4") res.end(readFileSync(join(CLIPS, "band.mp4")));
    else if (req.url === "/page") res.end("<html>not a clip</html>");
    else { res.statusCode = 404; res.end(); }
  });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  const base = `http://127.0.0.1:${server.address().port}`;
  const fig = (url) => `<figure class="ss-meme" data-clip="${url}" data-crop="top 25%"><span>x</span></figure>`;
  try {
    const e = env();
    const ok = demo(fig(`${base}/band.mp4`));
    const r = await run(process.execPath, [join(REPO, "bin", "build.mjs"), ok], { env: e }).catch((x) => x);
    assert.ok(!r.code, r.stderr);
    assert.equal(readdirSync(join(e.SHIPSHOW_MEMES_CACHE, "clips")).length, 1);
    // The source goes away; the cached clip is used.
    server.close();
    const again = build(demo(fig(`${base}/band.mp4`)), e);
    assert.equal(again.status, 0, again.stderr);
    // Nothing cached, nobody home.
    const gone = build(demo(fig(`${base}/other.mp4`)), e);
    assert.equal(gone.status, 1);
    assert.match(gone.stderr, /scene 01-intro: data-clip="http:\/\/127.0.0.1:\d+\/other.mp4": could not reach/);
  } finally {
    server.close();
  }
});

test("a URL that answers 404 or is not a clip, and a file that is not there, stop the build naming the scene", async () => {
  const server = createServer((req, res) => {
    if (req.url === "/page") res.end("<html>not a clip</html>");
    else { res.statusCode = 404; res.end(); }
  });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    // Async, so this process can answer its own server.
    const abuild = (dir) => run(process.execPath, [join(REPO, "bin", "build.mjs"), dir], { env: env() }).catch((x) => x);
    const miss = await abuild(demo(`<figure class="ss-meme" data-clip="${base}/nope.mp4"><span>x</span></figure>`));
    assert.match(miss.stderr, /scene 01-intro: data-clip=".*nope.mp4": no clip at .* \(404\)/);
    const html = await abuild(demo(`<figure class="ss-meme" data-clip="${base}/page"><span>x</span></figure>`));
    assert.match(html.stderr, /scene 01-intro: data-clip=".*\/page": .* is not a GIF, MP4 or WebM clip/);
    const file = build(demo(`<figure class="ss-meme" data-clip="clips/none.mp4"><span>x</span></figure>`), env());
    assert.equal(file.status, 1);
    assert.match(file.stderr, /scene 01-intro: data-clip="clips\/none.mp4": no clip file /);
  } finally {
    server.close();
  }
});

test("a malformed crop, a crop of the whole picture, and the wrong number of spans stop the build naming the scene", () => {
  for (const crop of ["top", "top 14", "middle 10%", "top 10% top 5%", "top 100%", "top 60% bottom 60%", "top -3%"]) {
    const r = build(demoWithClips(`<figure class="ss-meme" data-clip="clips/band.mp4" data-crop="${crop}"><span>x</span></figure>`), env());
    assert.equal(r.status, 1, `crop "${crop}" should stop the build`);
    assert.match(r.stderr, /scene 01-intro: data-clip="clips\/band.mp4": (data-crop=|the crop leaves)/);
  }
  const three = build(demoWithClips(`<figure class="ss-meme" data-clip="clips/band.mp4"><span>a</span><span>b</span><span>c</span></figure>`), env());
  assert.match(three.stderr, /scene 01-intro: data-clip="clips\/band.mp4": a clip meme has a top and a bottom band, but the figure has 3 spans/);
  const twice = build(demoWithClips(`<figure class="ss-meme" data-clip="clips/band.mp4"><span class="top">a</span><span class="top">b</span></figure>`), env());
  assert.match(twice.stderr, /two spans for the same band/);
  const both = build(demoWithClips(`<figure class="ss-meme" data-meme="tiny" data-clip="clips/band.mp4"><span>a</span></figure>`), env());
  assert.match(both.stderr, /not both/);
});

test("a crop is read as sides and sizes, and kept to even pixels", () => {
  assert.deepEqual(parseCrop("top 14%"), { top: { v: 14, unit: "%" } });
  assert.deepEqual(parseCrop("TOP 40px, left 10.5%"), { top: { v: 40, unit: "px" }, left: { v: 10.5, unit: "%" } });
  assert.deepEqual(cropRect(parseCrop("top 25%"), 64, 96), { x: 0, y: 24, w: 64, h: 72 });
  assert.deepEqual(cropRect(parseCrop("top 1px left 1px"), 65, 97), { x: 1, y: 1, w: 64, h: 96 });   // 64 by 96 kept: even sizes
  assert.deepEqual(cropRect(null, 40, 20), { x: 0, y: 0, w: 40, h: 20 });
  assert.throws(() => parseCrop("top"), /expected a side and a size/);
  assert.throws(() => cropRect(parseCrop("top 95%"), 64, 96), /leaves 64x5 px/);
});
