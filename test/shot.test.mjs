// Screenshots (bin/shot.mjs): what a figure asks for, the cache, the markup, the packet's rows, a real capture
// of a local page when a Chrome is there, and the credits a video's description carries (D56, D57).
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { REPO } from "../bin/lib.mjs";
import { creditLines } from "../bin/portrait.mjs";
import { loadShot, shotKey, shotSpec, shotsIn, sourceLabel } from "../bin/shot.mjs";

const PNG = join(REPO, "test", "fixtures", "memegen", "templates", "tiny", "default.png");   // 40 by 20
const URL1 = "https://github.com/ghostty-org/ghostty/blob/main/CONTRIBUTING.md";

function demo(figure, sentence = "You must understand your code, says the guide.") {
  const dir = join(mkdtempSync(join(tmpdir(), "kx-shot-")), "demo");
  cpSync(join(REPO, "template"), dir, { recursive: true });
  writeFileSync(join(dir, "timing.json"), JSON.stringify({
    total: 6, scenes: [{ id: "01-intro", start: 0, duration: 6, sentences: [{ text: sentence, start: 0.5, duration: 4 }] }],
  }));
  writeFileSync(join(dir, "scenes.html"), `<section data-scene="01-intro">${figure}</section>\n`);
  mkdirSync(join(dir, "assets"), { recursive: true });
  return dir;
}
/** A cache holding one capture, as loadShot leaves it, for the spec a figure's attributes make. */
function cached(attrs, dir, meta) {
  const cache = mkdtempSync(join(tmpdir(), "kx-shots-cache-"));
  const spec = shotSpec(attrs, dir);
  const at = join(cache, shotKey(spec));
  mkdirSync(at, { recursive: true });
  cpSync(PNG, join(at, "shot.png"));
  writeFileSync(join(at, "meta.json"), JSON.stringify({ url: spec.url, select: spec.select, find: spec.find, title: "t", capturedAt: "2026-10-27", mark: null, ...meta }));
  return cache;
}
const build = (dir, env) => spawnSync(process.execPath, [join(REPO, "bin", "build.mjs"), dir], { env: { ...process.env, ...env }, encoding: "utf8" });

test("a figure's spec: defaults, a file in the video's folder, and refused values", () => {
  const s = shotSpec(`data-shot="${URL1}" data-find="you must understand your code"`, "/v");
  assert.deepEqual(s, { url: URL1, select: "", find: "you must understand your code", hide: [], width: 1100, pad: 20, scheme: "dark" });
  assert.equal(shotSpec(`data-shot="page.html"`, "/v/demo").url, "file:///v/demo/page.html");
  assert.equal(shotSpec(`data-shot="https://x.test/?a=1&amp;b=2" data-hide=".a, .b"`, "/v").url, "https://x.test/?a=1&b=2");
  assert.deepEqual(shotSpec(`data-shot="https://x.test/" data-hide=".a, .b"`, "/v").hide, [".a", ".b"]);
  assert.throws(() => shotSpec(`data-shot="javascript:alert(1)"`, "/v"), /not an http\(s\) URL or a file/);
  assert.throws(() => shotSpec(`data-shot=""`, "/v"), /not an http\(s\) URL/);
  assert.throws(() => shotSpec(`data-shot="https://x.test/" data-width="90"`, "/v"), /data-width="90" is not 320 to 2560/);
  assert.throws(() => shotSpec(`data-shot="https://x.test/" data-scheme="sepia"`, "/v"), /not dark or light/);
  // Every input that changes the picture changes the key; the order attributes are written in does not.
  const k = (a) => shotKey(shotSpec(a, "/v"));
  assert.equal(k(`data-shot="${URL1}" data-find="a"`), k(`data-find="a" data-shot="${URL1}"`));
  assert.notEqual(k(`data-shot="${URL1}" data-find="a"`), k(`data-shot="${URL1}" data-find="b"`));
  assert.notEqual(k(`data-shot="${URL1}"`), k(`data-shot="${URL1}" data-scheme="light"`));
});

test("the bar names a page as a reader would say it", () => {
  assert.equal(sourceLabel("https://www.github.com/ocaml/ocaml/pull/14369?x=1#c"), "github.com/ocaml/ocaml/pull/14369");
  assert.equal(sourceLabel("file:///v/demo/my%20page.html"), "my page.html");
});

test("a cached screenshot becomes a figure: the picture, the bar, one marker box per line, a cue on the marker", () => {
  const attrs = `data-shot="${URL1}" data-find="you must understand your code" data-mark-cue="must"`;
  const dir = demo(`<figure class="ss-shot" ${attrs} data-cue="+0.2" data-anim="up"><figcaption>Ghostty</figcaption></figure>`);
  const marks = [{ x: 0.1, y: 0.2, w: 0.5, h: 0.1 }, { x: 0.02, y: 0.32, w: 0.3, h: 0.1 }];
  const cache = cached(attrs, dir, { mark: marks });
  // No Chrome at all: a cached shot never starts one.
  const r = build(dir, { SHIPSHOW_SHOTS_CACHE: cache, SHIPSHOW_CHROME: "/nonexistent/chrome" });
  assert.equal(r.status, 0, r.stderr);
  const html = readFileSync(join(dir, "index.html"), "utf8");
  const key = shotKey(shotSpec(attrs, dir));
  assert.match(html, new RegExp(`<img class="ss-shot-img" src="assets/shots/${key}\\.png" alt="you must understand your code" />`));
  assert.match(html, /<div class="ss-shot-bar">github\.com\/ghostty-org\/ghostty\/blob\/main\/CONTRIBUTING\.md<\/div>/);
  assert.match(html, /style="--ar:2;/);
  assert.equal((html.match(/<span class="ss-shot-mark" /g) || []).length, 2, "one box per line");
  assert.match(html, /left:10%;top:20%;width:50%;height:10%/);
  // The marker sweeps in on "must": its own cue, timed like any other.
  assert.match(html, /<span class="ss-shot-marks" data-cue="must" data-at="[\d.]+" data-anim="grow">/);
  assert.match(html, /<figcaption>Ghostty<\/figcaption>/);
  assert.ok(existsSync(join(dir, "assets", "shots", `${key}.png`)));
  assert.deepEqual(shotsIn(html).map((s) => [s.url, s.taken, s.marked, s.find, s.source]), [[URL1, "2026-10-27", true, "you must understand your code", ""]]);
});

test("data-source names the page to cite when the one captured is an embed", () => {
  const attrs = `data-shot="https://platform.twitter.com/embed/Tweet.html?id=1&amp;theme=dark" data-source="x.com/karpathy/status/1"`;
  const dir = demo(`<figure class="ss-shot" ${attrs}></figure>`);
  const r = build(dir, { SHIPSHOW_SHOTS_CACHE: cached(attrs, dir, {}), SHIPSHOW_CHROME: "/nonexistent/chrome" });
  assert.equal(r.status, 0, r.stderr);
  const html = readFileSync(join(dir, "index.html"), "utf8");
  assert.match(html, /<div class="ss-shot-bar">x\.com\/karpathy\/status\/1<\/div>/);
  assert.equal(shotsIn(html)[0].source, "x.com/karpathy/status/1");
  assert.ok(!/<span class="ss-shot-marks"/.test(html), "no words to find, no marker");
});

test("a shot that cannot be taken stops the build, naming the scene and the page", () => {
  const dir = demo(`<figure class="ss-shot" data-shot="${URL1}"></figure>`);
  const r = build(dir, { SHIPSHOW_SHOTS_CACHE: mkdtempSync(join(tmpdir(), "kx-shots-empty-")), SHIPSHOW_CHROME: "/nonexistent/chrome" });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, new RegExp(`scene 01-intro: data-shot="${URL1.replace(/[.?]/g, "\\$&")}": `));
  const bad = build(demo(`<figure class="ss-shot" data-shot="ftp://x"></figure>`), {});
  assert.match(bad.stderr, /scene 01-intro: data-shot="ftp:\/\/x": .*not an http\(s\) URL/);
});

test("the credits for a description: a line per portrait and per screenshot, the embed cited by its real address", () => {
  assert.deepEqual(creditLines(
    [{ file: "File:Edsger Wybe Dijkstra.jpg", author: "Hamilton Richards", licence: "CC BY-SA 3.0", page: "https://commons.wikimedia.org/wiki/File:Edsger_Wybe_Dijkstra.jpg" }],
    [{ url: URL1, taken: "2026-10-27", source: "" }, { url: "https://platform.twitter.com/embed/Tweet.html?id=1", taken: "2026-10-27", source: "x.com/karpathy/status/1" }],
  ), [
    "Photo of Edsger Wybe Dijkstra: Hamilton Richards · CC BY-SA 3.0, https://commons.wikimedia.org/wiki/File:Edsger_Wybe_Dijkstra.jpg",
    `Screenshot: ${URL1} (captured 2026-10-27)`,
    "Screenshot: https://x.com/karpathy/status/1 (captured 2026-10-27)",
  ]);
});

test("the portrait credit is off the photo unless a theme or figure asks for it", () => {
  const css = readFileSync(join(REPO, "kit", "base.css"), "utf8");
  assert.match(css, /\.ss-portrait-credit \{\s*display: var\(--portrait-credit, none\);/);
});

// A real capture, when a Chrome is installed (CI may have none): a local page, its words found and marked per line.
let chrome = process.env.SHIPSHOW_CHROME;
try { chrome ||= execFileSync(join(REPO, "node_modules", ".bin", "hyperframes"), ["browser", "path"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 20000 }).trim().split("\n").pop(); } catch { chrome = ""; }
test("a local page is captured, the block holding the words cut out and the words marked", { skip: !chrome || !existsSync(chrome) ? "no Chrome to capture with" : false, timeout: 60000 }, async () => {
  const dir = mkdtempSync(join(tmpdir(), "kx-shot-page-"));
  writeFileSync(join(dir, "page.html"), `<!doctype html><body style="margin:0;font:20px sans-serif;width:400px">
    <h1>Contributing</h1><p id="rule"><b>The most important rule: you must understand your code.</b> If you can’t explain what your changes do, don’t send them.</p><p>Other text.</p></body>`);
  // A second section with the same words: words looked for beside several elements stay inside the section holding them.
  writeFileSync(join(dir, "two.html"), `<!doctype html><body style="margin:0;font:20px sans-serif;width:400px"><section><h2>Round 1</h2><p>Other text.</p></section>
    <section id="last"><dialog><h2>hidden</h2></dialog><h2>Round 3</h2><table><tr><td>0 open</td></tr></table><p>Other text.</p></section></body>`);
  process.env.SHIPSHOW_SHOTS_CACHE = mkdtempSync(join(tmpdir(), "kx-shots-real-"));
  try {
    const shot = await loadShot(shotSpec(`data-shot="page.html" data-find="YOU MUST understand   your code" data-width="400" data-pad="0"`, dir));
    assert.equal(shot.size.w, 800, "the paragraph, at 2 device pixels per CSS pixel");
    assert.ok(shot.size.h > 40 && shot.size.h < 400, `the paragraph only, not the page: ${shot.size.h} px high`);
    assert.ok(shot.meta.mark.length >= 1 && shot.meta.mark.every((m) => m.x >= 0 && m.y >= 0 && m.x + m.w <= 1.001 && m.y + m.h <= 1.001), JSON.stringify(shot.meta.mark));
    // Curly quotes on the page match straight ones in data-find.
    const q = await loadShot(shotSpec(`data-shot="page.html" data-find="If you can't explain" data-width="400" data-pad="0"`, dir));
    assert.equal(q.meta.mark.length, 1);
    await assert.rejects(loadShot(shotSpec(`data-shot="page.html" data-find="not on the page" data-width="400"`, dir)), /the page has no "not on the page"/);
    await assert.rejects(loadShot(shotSpec(`data-shot="page.html" data-select="#missing" data-width="400"`, dir)), /no element on the page matches data-select="#missing"/);
    // Several elements make one capture, with the words' block added when it lies outside them.
    const one = await loadShot(shotSpec(`data-shot="page.html" data-select="h1" data-width="400" data-pad="0"`, dir));
    const all = await loadShot(shotSpec(`data-shot="page.html" data-select="h1, #rule" data-find="Other text" data-width="400" data-pad="0"`, dir));
    assert.ok(all.size.h > one.size.h * 2, `h1, the rule and the third paragraph: ${all.size.h} px against ${one.size.h}`);
    assert.ok(all.meta.mark[0].y > 0.6, "the words found are near the bottom of the capture");
    const last = await loadShot(shotSpec(`data-shot="two.html" data-select="#last h2, #last table" data-find="Other text" data-width="400" data-pad="0"`, dir));
    const round = await loadShot(shotSpec(`data-shot="two.html" data-select="#last" data-width="400" data-pad="0"`, dir));
    assert.equal(last.size.h, round.size.h, "the last section only, not from the first round's words down");
    assert.ok(readdirSync(process.env.SHIPSHOW_SHOTS_CACHE).length === 6, "a failed capture leaves nothing in the cache");
  } finally { delete process.env.SHIPSHOW_SHOTS_CACHE; }
});
