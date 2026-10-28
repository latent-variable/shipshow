// Portraits from Wikimedia Commons, credited and licence-checked at build.
// bin/build.mjs calls portraitScene() on each scene: every
//   <figure class="ss-portrait" data-commons="File:Edsger Wybe Dijkstra.jpg" data-cue="Dijkstra" data-anim="pop">
//     <figcaption>Edsger Dijkstra<small>1930-2002 · structured programming</small></figcaption></figure>
// asks the Commons API for the file's thumbnail and metadata (once; kept in the cache), refuses a file whose
// licence is not public domain, CC0, CC BY or CC BY-SA, copies the picture to the video's assets/portraits/,
// and writes the <img>, the caption and a credit line ("Photo: author · licence") into the figure.
//
// Where things come from (env, so tests and mirrors can stand in):
//   SHIPSHOW_COMMONS_API    the API endpoint (default https://commons.wikimedia.org/w/api.php), or a folder
//                           holding <file name without "File:", ":" and "/" kept as "_">.json, each the API's reply
//   SHIPSHOW_COMMONS_CACHE  where fetched pictures and metadata are kept (default ~/.cache/shipshow/commons)
// Pictures are third-party and CC-licensed: fetched, never committed (assets/ is ignored).
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { extname, join, resolve } from "node:path";
import { die } from "./lib.mjs";

export const WIDTH = 900;   // thumbnail width asked of Commons: sharp at the default 640 px card, small on disk
const UA = "ShipShow/1 (https://github.com/latent-variable/shipshow; portraits)";
const api = () => process.env.SHIPSHOW_COMMONS_API || "https://commons.wikimedia.org/w/api.php";
export const cacheDir = () => process.env.SHIPSHOW_COMMONS_CACHE || join(homedir(), ".cache", "shipshow", "commons");
const isUrl = (s) => /^https?:\/\//.test(s);
const slug = (title) => title.replace(/^File:/i, "").replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^[._]+/, "").slice(0, 120);
// The cache and asset name: the slug for reading, plus a hash of the whole title, so two titles that slug alike never share one.
const key = (title) => `${slug(title).replace(/\.\w+$/, "")}-${createHash("sha256").update(title).digest("hex").slice(0, 8)}`;

async function getBytes(location) {
  if (!isUrl(location)) {
    if (!existsSync(location)) throw new Error(`${location} is not there`);
    return readFileSync(location);
  }
  let res;
  try {
    res = await fetch(location, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(60000) });
  } catch (e) {
    throw new Error(`could not reach ${location} (${e.cause?.code || e.message})`);
  }
  if (!res.ok) throw new Error(`${location} answered ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Plain text from Commons' HTML: tags gone, entities decoded, whitespace folded. */
export function stripHtml(s) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return String(s || "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
      if (e[0] === "#") { const n = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return n > 0 && n < 0x110000 ? String.fromCodePoint(n) : ""; }
      return named[e.toLowerCase()] ?? m;
    })
    .replace(/\s+/g, " ").trim();
}

/** The licence gate. Accepts public domain, CC0, CC BY and CC BY-SA (any version); everything else, and
 *  anything Commons does not say, is refused. Returns {ok, label, reason}; `label` is the short name to credit. */
export function checkLicence(meta) {
  const short = stripHtml(meta.LicenseShortName), code = String(meta.License || "").toLowerCase();
  const refuse = (reason) => ({ ok: false, reason });
  if (!short && !code) return refuse("Commons gives no licence for it");
  if (/^(true|yes|1)$/i.test(String(meta.NonFree || ""))) return refuse("Commons marks it non-free");
  if (/fair.?use|non.?free/i.test(short) || /^(fair|non-?free)/.test(code)) return refuse(`its licence is "${short || code}"`);
  // Each field Commons gives must pass on its own: a "Public domain" name beside a cc-by-nc code is refused.
  const shortPd = /^(public domain|pd\b|no restrictions)/i.test(short), codePd = /^pd(-|$)/.test(code);
  const shortCc0 = /^cc0\b/i.test(short), codeCc0 = code === "cc0";
  // "CC BY 4.0", "CC BY-SA 3.0", "CC BY 3.0 NL": the word after BY is a version, never NC or ND.
  const shortCc = /^cc[- ]by(-sa)?[- ]\d(\.\d)?(\s+[a-z]{2,3})?$/i.test(short), codeCc = /^cc-by(-sa)?-\d(\.\d)?(-[a-z]{2,3})?$/.test(code);
  const bad = (short && !(shortPd || shortCc0 || shortCc)) ? short : (code && !(codePd || codeCc0 || codeCc)) ? code : "";
  if (bad) return refuse(`its licence is "${bad}", which is not public domain, CC0, CC BY or CC BY-SA`);
  const pd = short ? shortPd : codePd, cc0 = short ? shortCc0 : codeCc0;
  return { ok: true, pd, label: pd ? "public domain" : cc0 ? "CC0" : short || code.toUpperCase() };
}

/** What a file's metadata says, reduced to what the gate and the credit use. */
function reduce(title, ii) {
  const m = Object.fromEntries(Object.entries(ii.extmetadata || {}).map(([k, v]) => [k, v?.value]));
  return {
    title, page: ii.descriptionurl, thumb: ii.thumburl || ii.url, width: ii.thumbwidth || ii.width, height: ii.thumbheight || ii.height,
    Artist: stripHtml(m.Artist).slice(0, 200), Credit: stripHtml(m.Credit).slice(0, 200),
    LicenseShortName: stripHtml(m.LicenseShortName), License: m.License || "", LicenseUrl: m.LicenseUrl || "", NonFree: m.NonFree || "",
  };
}

async function query(title) {
  const base = api();
  let bytes;
  if (isUrl(base)) {
    const q = new URLSearchParams({ action: "query", format: "json", formatversion: "2", prop: "imageinfo", iiprop: "url|extmetadata|size", iiurlwidth: String(WIDTH), titles: title });
    bytes = await getBytes(`${base}${base.includes("?") ? "&" : "?"}${q}`);
  } else {
    bytes = await getBytes(join(base, `${slug(title)}.json`));
  }
  const page = JSON.parse(bytes.toString("utf8"))?.query?.pages?.[0];
  if (!page || page.missing || !page.imageinfo?.[0]) throw new Error(`Commons has no file "${title}" (the name is the file page's title, with File:)`);
  return reduce(title, page.imageinfo[0]);
}

/** The author and the credit line for a file the gate accepted. */
export function creditFor(meta, licence = checkLicence(meta)) {
  const author = meta.Artist || (licence.pd ? meta.Credit.slice(0, 80) : "");
  return { author: author || "Wikimedia Commons", line: `Photo: ${author || "Wikimedia Commons"} · ${licence.label}` };
}

/** {meta, image, ext, licence, author, credit}: from the cache, fetched first if it is not there. Throws on a refused or missing file. */
export async function loadPortrait(title) {
  if (!/^File:[^\0<>[\]{}|#]+\.\w{2,5}$/i.test(title)) throw new Error(`"${title}" is not a Commons file name (it looks like File:Name.jpg)`);
  const dir = join(cacheDir(), `${key(title)}-w${WIDTH}`);
  const metaPath = join(dir, "meta.json");
  let meta;
  if (existsSync(metaPath)) meta = JSON.parse(readFileSync(metaPath, "utf8"));
  if (meta && meta.title !== title) meta = undefined;   // a cache written for another title is never trusted
  if (!meta) {
    meta = await query(title);
    const g = checkLicence(meta);
    if (!g.ok) throw new Error(`${title} cannot be used: ${g.reason} (${meta.page}). Only public domain, CC0, CC BY and CC BY-SA are allowed`);
    if (!meta.Artist && !g.pd) throw new Error(`${title} names no author, and ${g.label} needs one to credit (${meta.page})`);
    const bytes = await getBytes(isUrl(meta.thumb) ? meta.thumb : resolve(api(), meta.thumb));
    mkdirSync(dir, { recursive: true });
    const ext = (extname(new URL(meta.thumb, "file:///x/").pathname).slice(1) || "jpg").toLowerCase();
    writeFileSync(join(dir, `image.${ext}`), bytes);
    writeFileSync(metaPath, JSON.stringify(meta, null, 1));   // last, so a half-fetched portrait is fetched again
  }
  // The gate runs on every build, cached or not, so a tightened rule reaches a cached file too.
  const licence = checkLicence(meta);
  if (!licence.ok) throw new Error(`${title} cannot be used: ${licence.reason} (${meta.page})`);
  const ext = ["jpg", "jpeg", "png", "gif", "webp"].find((e) => existsSync(join(dir, `image.${e}`)));
  if (!ext) throw new Error(`${title} is in the cache with no picture; delete ${dir} and build again`);
  const { author, line } = creditFor(meta, licence);
  return { meta, image: join(dir, `image.${ext}`), ext, licence, author, credit: line, name: `${key(title)}.${ext}` };
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** One figure's HTML: the picture with its credit, then the builder's caption. */
export function figureHtml(attrs, inner, p) {
  const cls = ((attrs.match(/class="([^"]*)"/) || [, ""])[1].split(/\s+/).filter(Boolean));
  if (!cls.includes("ss-portrait")) cls.unshift("ss-portrait");
  const style = (attrs.match(/style="([^"]*)"/) || [, ""])[1];
  const rest = attrs.replace(/\s*(class|style)="[^"]*"/g, "");
  const ar = Math.round((p.meta.width / p.meta.height) * 10000) / 10000;
  const cap = (inner.match(/<figcaption[\s\S]*?<\/figcaption>/) || [""])[0];
  const alt = stripHtml(cap.replace(/<small[\s\S]*?<\/small>/, "")) || stripHtml(p.meta.title.replace(/^File:/i, ""));
  const data = `data-portrait-file="${esc(p.meta.page)}" data-portrait-author="${esc(p.author)}" data-portrait-licence="${esc(p.licence.label)}" data-portrait-licence-url="${esc(p.meta.LicenseUrl)}"`;
  return `<figure${rest} class="${cls.join(" ")}" ${data} style="--ar:${ar};${style}"><div class="ss-portrait-photo"><img class="ss-portrait-img" src="assets/portraits/${p.name}" alt="${esc(alt)}" /><span class="ss-portrait-credit">${esc(p.credit)}</span></div>${cap}</figure>`;
}

/** A scene's HTML with each portrait figure expanded; copies each picture into <video>/assets/portraits/.
 *  Stops with the scene's name and the file on a refused licence, a missing file or a fetch failure. */
export async function portraitScene(html, dir, sceneId) {
  const figs = [...html.matchAll(/<figure([^>]*\bdata-commons="([^"]*)"[^>]*)>([\s\S]*?)<\/figure>/g)];
  if (!figs.length) return html;
  let out = html;
  for (const m of figs) {
    const [whole, attrs, rawTitle, inner] = m;
    const title = stripHtml(rawTitle);
    let p;
    try { p = await loadPortrait(title); } catch (e) { die(`scene ${sceneId}: data-commons="${title}": ${e.message}`); }
    mkdirSync(join(dir, "assets", "portraits"), { recursive: true });
    cpSync(p.image, join(dir, "assets", "portraits", p.name));
    out = out.replace(whole, () => figureHtml(attrs, inner, p));
  }
  return out;
}

/** Every portrait in a built index.html, for the review packet. */
export function portraitsIn(html) {
  const un = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
  return [...html.matchAll(/<figure[^>]*data-commons="([^"]*)"[^>]*data-portrait-file="([^"]*)" data-portrait-author="([^"]*)" data-portrait-licence="([^"]*)" data-portrait-licence-url="([^"]*)"[^>]*>([\s\S]*?)<\/figure>/g)].map((m) => ({
    file: un(m[1]), page: un(m[2]), author: un(m[3]), licence: un(m[4]), licenceUrl: un(m[5]),
    credit: un((m[6].match(/class="ss-portrait-credit">([\s\S]*?)<\/span>/) || [, ""])[1]),
    name: un(((m[6].match(/<figcaption[^>]*>([\s\S]*?)(?:<small|<\/figcaption>)/) || [, ""])[1]).replace(/<[^>]+>/g, "").trim()),
  }));
}

/** The video's credits, one line each, for its description: each portrait (CC BY and CC BY-SA ask for credit in a
 *  manner reasonable to the medium, and a video's credits go in its description, D57) and each screenshot's page. */
export function creditLines(portraits, shots = []) {
  return [...new Set([
    // named as the caption names the person ("John Backus: photo by ..."); a Commons file name reads badly to a viewer
    ...portraits.map((x) => x.name ? `${x.name}: photo by ${x.author}, ${x.licence}, ${x.page}` : `Photo of ${x.file.replace(/^File:/, "").replace(/\.\w+$/, "")}: ${x.author} · ${x.licence}, ${x.page}`),
    ...shots.map((x) => `Screenshot: ${x.source ? `https://${x.source.replace(/^https?:\/\//, "")}` : x.url} (captured ${x.taken})`),
  ])];   // one line per page: two captures of one page are one credit
}

