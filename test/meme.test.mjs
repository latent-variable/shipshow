// Memes (bin/meme.mjs): the template's boxes become positioned lines, in order; a missing or
// unreachable template stops the build naming the scene; a fetched template is cached; the
// catalog search ranks. No network: a fixture template and catalog (test/fixtures/memegen),
// served from a folder or, for the URL path, from a local HTTP server.
import assert from "node:assert/strict";
import { execFile, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import { REPO } from "../bin/lib.mjs";
import { boxPlacement, imageSize, memesIn, parseConfig, search } from "../bin/meme.mjs";

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
    assert.deepEqual(seen, ["/mirror/templates/tiny/config.yml", "/mirror/templates/tiny/default.jpg", "/mirror/templates/tiny/default.png"]);
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
