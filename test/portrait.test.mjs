// Portraits (bin/portrait.mjs): the licence gate, the credit line, the cache, the markup and the packet.
// No network: SHIPSHOW_COMMONS_API is a folder of the API's replies (one <file name>.json each), and
// the thumbnails sit beside them; one test serves them over HTTP to check the request itself.
import assert from "node:assert/strict";
import { execFile, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import { REPO } from "../bin/lib.mjs";
import { checkLicence, creditFor, portraitsIn, stripHtml } from "../bin/portrait.mjs";

const run = promisify(execFile);
const PNG = join(REPO, "test", "fixtures", "memegen", "templates", "tiny", "default.png");   // 40 by 20

/** What Commons replies for one file: the fields the build reads, the licence fields as given. */
function reply(name, meta) {
  const ext = [name, `https://commons.wikimedia.org/wiki/File:${name.replace(/ /g, "_")}`];
  return { query: { pages: [{ title: `File:${name}`, imageinfo: [{
    url: `${name}.png`, thumburl: `${name}.png`, thumbwidth: 40, thumbheight: 20, width: 40, height: 20, descriptionurl: ext[1],
    extmetadata: Object.fromEntries(Object.entries(meta).map(([k, v]) => [k, { value: v }])),
  }] }] } };
}
const FILES = {
  "Free PD.png": { Artist: '<a href="//x">James S. Davis</a>', LicenseShortName: "Public domain", License: "pd", NonFree: "" },
  "Free BYSA.png": { Artist: '<a href="//commons.wikimedia.org/wiki/User:H"><span class="x">Hamilton</span> Richards</a> &amp; <i>Co</i>', LicenseShortName: "CC BY-SA 3.0", License: "cc-by-sa-3.0", LicenseUrl: "http://creativecommons.org/licenses/by-sa/3.0/" },
  "Nonfree.png": { Artist: "A. Photographer", LicenseShortName: "Fair use", License: "", NonFree: "true" },
  "Nc.png": { Artist: "A. Photographer", LicenseShortName: "CC BY-NC 4.0", License: "cc-by-nc-4.0" },
  "Nolicence.png": { Artist: "A. Photographer" },
  "Noauthor.png": { LicenseShortName: "CC BY 2.0", License: "cc-by-2.0" },
};
function source() {
  const api = mkdtempSync(join(tmpdir(), "kx-commons-api-"));
  for (const [name, meta] of Object.entries(FILES)) {
    writeFileSync(join(api, `${name.replace(/ /g, "_")}.json`), JSON.stringify(reply(name, meta)));
    cpSync(PNG, join(api, `${name}.png`));
  }
  return api;
}
function demo(figure) {
  const dir = join(mkdtempSync(join(tmpdir(), "kx-portrait-")), "demo");
  cpSync(join(REPO, "template"), dir, { recursive: true });
  writeFileSync(join(dir, "timing.json"), JSON.stringify({
    total: 6, scenes: [{ id: "01-intro", start: 0, duration: 6, sentences: [{ text: "Hopper wrote the first compiler.", start: 0.5, duration: 4 }] }],
  }));
  writeFileSync(join(dir, "scenes.html"), `<section data-scene="01-intro">${figure}</section>\n`);
  mkdirSync(join(dir, "assets"), { recursive: true });
  return dir;
}
const env = (api, extra = {}) => ({ ...process.env, SHIPSHOW_COMMONS_API: api, SHIPSHOW_COMMONS_CACHE: mkdtempSync(join(tmpdir(), "kx-commons-cache-")), ...extra });
const build = (dir, e) => spawnSync(process.execPath, [join(REPO, "bin", "build.mjs"), dir], { env: e, encoding: "utf8" });
const fig = (file, inner = "<figcaption>Grace Hopper<small>1906-1992</small></figcaption>") => `<figure class="ss-portrait" data-commons="File:${file}" data-cue="Hopper" data-anim="pop">${inner}</figure>`;

test("the gate accepts public domain, CC0, CC BY and CC BY-SA of any version", () => {
  for (const [LicenseShortName, License] of [["Public domain", "pd"], ["Public domain", "pd-us-navy"], ["CC0", "cc0"], ["CC BY 2.0", "cc-by-2.0"], ["CC BY-SA 3.0", "cc-by-sa-3.0"], ["CC BY-SA 4.0", ""], ["CC BY 3.0 NL", "cc-by-3.0-nl"]]) {
    assert.equal(checkLicence({ LicenseShortName, License }).ok, true, `${LicenseShortName} ${License}`);
  }
});

test("the gate refuses non-free, fair use, NC, ND, GFDL, unknown and missing licences", () => {
  for (const meta of [{ LicenseShortName: "Fair use" }, { LicenseShortName: "CC BY 4.0", NonFree: "true" }, { LicenseShortName: "CC BY-NC 4.0" }, { LicenseShortName: "CC BY-ND 2.0" },
    { LicenseShortName: "CC BY-NC-SA 3.0" }, { LicenseShortName: "GFDL" }, { LicenseShortName: "Attribution" }, { LicenseShortName: "All rights reserved" }, {}]) {
    assert.equal(checkLicence(meta).ok, false, JSON.stringify(meta));
  }
});

test("build stops on a non-free file, naming the scene and the file, and on a missing licence, an NC licence or no author", () => {
  const api = source();
  for (const [file, why] of [["Nonfree.png", /non-free/], ["Nc.png", /CC BY-NC 4.0.*not public domain/], ["Nolicence.png", /gives no licence/], ["Noauthor.png", /names no author/]]) {
    const dir = demo(fig(file));
    const r = build(dir, env(api));
    assert.equal(r.status, 1, file);
    assert.match(r.stderr, new RegExp(`scene 01-intro: data-commons="File:${file.replace(".", "\\.")}": .*${why.source}`), r.stderr);
    assert.ok(!existsSync(join(dir, "assets", "portraits", file)), "a refused file is not copied");
  }
});

test("build accepts public domain and CC BY-SA, copies the picture, and draws the credit from the metadata with the HTML stripped", () => {
  const api = source();
  const dir = demo(fig("Free PD.png") + fig("Free BYSA.png", "<figcaption>Edsger Dijkstra</figcaption>"));
  const r = build(dir, env(api));
  assert.equal(r.status, 0, r.stderr);
  const html = readFileSync(join(dir, "index.html"), "utf8");
  assert.match(html, /<span class="ss-portrait-credit">Photo: James S\. Davis · public domain<\/span>/);
  assert.match(html, /<span class="ss-portrait-credit">Photo: Hamilton Richards &amp; Co · CC BY-SA 3\.0<\/span>/);
  assert.match(html, /<figcaption>Grace Hopper<small>1906-1992<\/small><\/figcaption>/);
  assert.match(html, /<img class="ss-portrait-img" src="assets\/portraits\/Free_PD-[0-9a-f]{8}\.png" alt="Grace Hopper" \/>/);
  assert.match(html, /style="--ar:2;"/);
  assert.match(html, /data-cue="Hopper" data-at="[\d.]+"/);
  assert.ok(readdirSync(join(dir, "assets", "portraits")).some((f) => /^Free_PD-[0-9a-f]{8}\.png$/.test(f)));
  assert.deepEqual(portraitsIn(html).map((p) => [p.author, p.licence, p.licenceUrl, p.page]), [
    ["James S. Davis", "public domain", "", "https://commons.wikimedia.org/wiki/File:Free_PD.png"],
    ["Hamilton Richards & Co", "CC BY-SA 3.0", "http://creativecommons.org/licenses/by-sa/3.0/", "https://commons.wikimedia.org/wiki/File:Free_BYSA.png"],
  ]);  assert.deepEqual(portraitsIn(html).map((p) => p.name), ["Grace Hopper", "Edsger Dijkstra"], "the caption's name, without its small print, for the credit line");
});

test("the credit strips tags and entities from the artist, and a public-domain file with no artist credits Commons", () => {
  assert.equal(stripHtml('<a href="x">A &amp; B</a><br/> &quot;C&quot; &#233; &#x41;'), 'A & B "C" é A');
  assert.equal(stripHtml("<script>alert(1)</script>Safe"), "Safe");
  assert.equal(creditFor({ Artist: "", Credit: "", LicenseShortName: "Public domain", License: "pd" }).line, "Photo: Wikimedia Commons · public domain");
  assert.equal(creditFor({ Artist: "X", LicenseShortName: "CC0", License: "cc0" }).line, "Photo: X · CC0");
});

test("a fetched portrait is kept in the cache and used when Commons is gone", () => {
  const api = source(), e = env(api);
  assert.equal(build(demo(fig("Free PD.png")), e).status, 0);
  const again = build(demo(fig("Free PD.png")), { ...e, SHIPSHOW_COMMONS_API: join(tmpdir(), "no-such-commons") });
  assert.equal(again.status, 0, again.stderr);
  const cached = readdirSync(e.SHIPSHOW_COMMONS_CACHE).find((d) => d.startsWith("Free_PD-") && d.endsWith("-w900"));
  assert.match(readFileSync(join(e.SHIPSHOW_COMMONS_CACHE, cached, "meta.json"), "utf8"), /James S\. Davis/);
  // An unreachable source with nothing cached stops the build with the reason.
  const cold = build(demo(fig("Free PD.png")), env(join(tmpdir(), "no-such-commons")));
  assert.equal(cold.status, 1);
  assert.match(cold.stderr, /scene 01-intro: data-commons="File:Free PD\.png": .*no-such-commons.*is not there/);
});

test("the API is asked for the file's url, extmetadata and size at a thumbnail width, with a User-Agent", async () => {
  const seen = [];
  const api = source();
  const server = createServer((req, res) => {
    const u = new URL(req.url, "http://x");
    seen.push({ path: u.pathname, ua: req.headers["user-agent"], q: Object.fromEntries(u.searchParams) });
    if (u.pathname === "/w/api.php") {
      const body = JSON.parse(readFileSync(join(api, "Free_PD.png.json"), "utf8"));
      body.query.pages[0].imageinfo[0].thumburl = `http://127.0.0.1:${server.address().port}/thumb.png`;
      res.end(JSON.stringify(body));
    } else res.end(readFileSync(PNG));
  });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  try {
    const dir = demo(fig("Free PD.png"));
    const r = await run(process.execPath, [join(REPO, "bin", "build.mjs"), dir], { env: env(`http://127.0.0.1:${server.address().port}/w/api.php`) }).catch((x) => x);
    assert.ok(!r.code, r.stderr);
    assert.equal(seen[0].q.prop, "imageinfo");
    assert.equal(seen[0].q.iiprop, "url|extmetadata|size");
    assert.equal(seen[0].q.iiurlwidth, "900");
    assert.equal(seen[0].q.titles, "File:Free PD.png");
    assert.match(seen[0].ua, /^ShipShow\//);
    assert.ok(readdirSync(join(dir, "assets", "portraits")).some((f) => /^Free_PD-[0-9a-f]{8}\.png$/.test(f)));
  } finally {
    server.close();
  }
});

test("a name that is not a Commons file title never reaches the API or the cache", () => {
  const r = build(demo(`<figure class="ss-portrait" data-commons="../../etc/passwd"></figure>`), env(source()));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /"..\/..\/etc\/passwd" is not a Commons file name/);
});

test("two titles that read alike never share a cached picture", () => {
  const api = source(), e = env(api);
  assert.equal(build(demo(fig("Free PD.png")), e).status, 0);
  // "Free,PD.png" slugs like "Free PD.png"; with Commons gone it must not be served the other file's photo and credit.
  const other = build(demo(fig("Free,PD.png")), { ...e, SHIPSHOW_COMMONS_API: join(tmpdir(), "no-such-commons") });
  assert.equal(other.status, 1, "a different title was served from another file's cache");
  assert.match(other.stderr, /data-commons="File:Free,PD\.png"/);
});

test("the gate refuses a licence name and code that disagree", () => {
  assert.equal(checkLicence({ LicenseShortName: "Public domain", License: "cc-by-nc-4.0" }).ok, false);
  assert.equal(checkLicence({ LicenseShortName: "CC BY-NC 4.0", License: "pd" }).ok, false);
  assert.equal(checkLicence({ LicenseShortName: "CC BY 4.0", License: "cc-by-nd-4.0" }).ok, false);
  assert.equal(checkLicence({ LicenseShortName: "", License: "cc-by-sa-4.0" }).label, "CC-BY-SA-4.0");
});
