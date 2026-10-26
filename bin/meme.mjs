// Memes from the memegen catalog (github.com/jacebrowning/memegen, MIT), text drawn by ShipShow.
//   node bin/memes.mjs <words>      search the catalog (bin/memes.mjs is the CLI over this module)
// bin/build.mjs calls memeScene() on each scene: every
//   <figure class="ss-meme" data-meme="astronaut"> <span>line one</span> <span>line two</span> </figure>
// gets the template's clean background image (fetched once into the cache, copied into the video's
// assets/memes/) and one positioned box per span, in the template's own order. The text itself is
// fitted to its box by kit/kit.js at render time, so each line can arrive on its own word.
//
// Where things come from (env, so a mirror or a self-hosted memegen works):
//   SHIPSHOW_MEMEGEN_API    the catalog: <api>/templates (default https://api.memegen.link),
//                           or a folder holding templates.json
//   SHIPSHOW_MEMEGEN_FILES  the repo's templates/<id>/{config.yml,default.<ext>}
//                           (default https://raw.githubusercontent.com/jacebrowning/memegen/main),
//                           a URL, or a folder (a clone of the repo)
//   SHIPSHOW_MEMES_CACHE    where fetched templates are kept (default ~/.cache/shipshow/memes)
// The template images are third-party pictures: they are fetched, never committed (assets/ is ignored).
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { REPO, die } from "./lib.mjs";

const EXTS = ["jpg", "png", "gif", "jpeg"];
const api = () => (process.env.SHIPSHOW_MEMEGEN_API || "https://api.memegen.link").replace(/\/+$/, "");
const files = () => (process.env.SHIPSHOW_MEMEGEN_FILES || "https://raw.githubusercontent.com/jacebrowning/memegen/main").replace(/\/+$/, "");
export const cacheDir = () => process.env.SHIPSHOW_MEMES_CACHE || join(homedir(), ".cache", "shipshow", "memes");
const isUrl = (s) => /^https?:\/\//.test(s);

/** Bytes from a URL or a local path; null when it is not there. A network failure is an Error. */
async function get(location) {
  if (!isUrl(location)) return existsSync(location) ? readFileSync(location) : null;
  let res;
  try {
    res = await fetch(location, { signal: AbortSignal.timeout(30000) });
  } catch (e) {
    throw new Error(`could not reach ${location} (${e.cause?.code || e.message})`);
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${location} answered ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** A memegen config.yml, the parts ShipShow uses: name, source, and the text boxes in order.
 *  Hand-parsed (the file is flat: scalars, then `text:` as a list of maps), so there is no YAML dependency. */
export function parseConfig(yaml) {
  const scalar = (v) => {
    v = v.replace(/\s+#.*$/, "").trim().replace(/^(['"])(.*)\1$/, "$2");
    return /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v;
  };
  const out = { name: "", source: "", boxes: [] };
  let section = "", box = null;
  for (const raw of yaml.split(/\r?\n/)) {
    if (!raw.trim() || raw.trim().startsWith("#")) continue;
    const top = raw.match(/^(\w+):\s*(.*)$/);
    if (top) {
      section = top[1];
      if (section === "name" || section === "source") out[section] = String(scalar(top[2]));
      continue;
    }
    if (section !== "text") continue;
    const item = raw.match(/^\s*-\s+(\w+):\s*(.*)$/);
    const prop = raw.match(/^\s+(\w+):\s*(.*)$/);
    if (item) { box = {}; out.boxes.push(box); box[item[1]] = scalar(item[2]); }
    else if (prop && box) box[prop[1]] = scalar(prop[2]);
  }
  return out;
}

/** Where a box sits, as the percentages and angle the page uses. A box with no size, or one that
 *  falls outside the picture, is a config this module does not understand: say so. */
export function boxPlacement(box, id = "?") {
  const n = (k, d) => (Number.isFinite(box[k]) ? box[k] : d);
  const left = n("anchor_x", 0), top = n("anchor_y", 0), w = n("scale_x", 0), h = n("scale_y", 0);
  if (!(w > 0 && h > 0)) throw new Error(`template ${id} has a text box with no size`);
  const pct = (x) => Math.round(x * 10000) / 100;
  // A colour goes into a style attribute: a name or hex only, never something that closes it.
  const colour = (c, d) => (typeof c === "string" && /^(#[0-9a-fA-F]{3,8}|[a-zA-Z]{3,20})$/.test(c) ? c : d);
  const fill = colour(box.color, "white");
  const dark = /^(black|#0{3,6})$/i.test(fill);
  return {
    left: pct(left), top: pct(top), width: pct(w), height: pct(h), angle: n("angle", 0),
    align: ["left", "right"].includes(box.align) ? box.align : "center",
    font: box.font === "thin" ? "thin" : box.font === "impact" ? "impact" : "thick",
    fill, stroke: dark ? "white" : "black",
  };
}

/** The template's files in the cache, fetched first if they are not there. {config, image, ext, source, name, boxes} */
export async function loadTemplate(id) {
  if (!/^[a-z0-9_.-]+$/i.test(id) || id.startsWith(".")) throw new Error(`"${id}" is not a template id`);
  const dir = join(cacheDir(), id);
  const cached = () => EXTS.find((e) => existsSync(join(dir, `default.${e}`)));
  if (!existsSync(join(dir, "config.yml")) || !cached()) {
    const base = `${files()}/templates/${id}`;
    const config = await get(isUrl(base) ? `${base}/config.yml` : join(base, "config.yml"));
    if (!config) throw new Error(`no template "${id}" in the memegen catalog (npm run memes -- <words> searches it)`);
    let found = null;
    for (const ext of EXTS) {
      const bytes = await get(isUrl(base) ? `${base}/default.${ext}` : join(base, `default.${ext}`));
      if (bytes) { found = { ext, bytes }; break; }
    }
    if (!found) throw new Error(`template "${id}" has a config but no default image (tried ${EXTS.join(", ")})`);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `default.${found.ext}`), found.bytes);
    writeFileSync(join(dir, "config.yml"), config);   // last, so a half-fetched template is fetched again
  }
  const ext = cached();
  const parsed = parseConfig(readFileSync(join(dir, "config.yml"), "utf8"));
  if (!parsed.boxes.length) throw new Error(`template "${id}" has no text boxes`);
  return { id, ext, image: join(dir, `default.${ext}`), ...parsed };
}

/** Width and height of a PNG, JPEG or GIF, read from its header. */
export function imageSize(buf) {
  if (buf.length > 24 && buf.toString("latin1", 1, 4) === "PNG") return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  if (buf.toString("latin1", 0, 3) === "GIF") return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  throw new Error("not a PNG, JPEG or GIF it can read");
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** One figure's HTML: the image, a box per span. `lines` are the spans as written: {attrs, html}. */
export function figureHtml(attrs, tpl, size, lines, where) {
  if (lines.length > tpl.boxes.length) {
    die(`${where}: meme "${tpl.id}" has ${tpl.boxes.length} text box(es) but the figure has ${lines.length} spans`);
  }
  const boxes = lines.map((line, i) => {
    const p = boxPlacement(tpl.boxes[i], tpl.id);
    const style = `left:${p.left}%;top:${p.top}%;width:${p.width}%;height:${p.height}%;--rot:${p.angle}deg;--fill:${p.fill};--stroke:${p.stroke};text-align:${p.align}`;
    return `<span class="ss-meme-box" data-font="${p.font}" style="${style}"><span class="ss-meme-line"${line.attrs}>${line.html}</span></span>`;
  });
  const ar = Math.round((size.w / size.h) * 10000) / 10000;
  const cls = ((attrs.match(/class="([^"]*)"/) || [, ""])[1].split(/\s+/).filter(Boolean));
  if (!cls.includes("ss-meme")) cls.unshift("ss-meme");
  const style = (attrs.match(/style="([^"]*)"/) || [, ""])[1];
  const rest = attrs.replace(/\s*(class|style)="[^"]*"/g, "");
  const tagged = `${rest} class="${cls.join(" ")}" data-meme-name="${esc(tpl.name)}" data-meme-source="${esc(tpl.source)}" style="--ar:${ar};${style}"`;
  return `<figure${tagged}><img class="ss-meme-img" src="assets/memes/${tpl.id}.${tpl.ext}" alt="" />${boxes.join("")}</figure>`;
}

/** A scene's HTML with each meme figure expanded. Copies each template's image into
 *  <video>/assets/memes/, and the fonts into assets/memes/fonts/. Stops with the scene's name
 *  on an unknown template, a fetch failure, or more spans than boxes. */
export async function memeScene(html, dir, sceneId) {
  const figs = [...html.matchAll(/<figure([^>]*\bdata-meme="([^"]*)"[^>]*)>([\s\S]*?)<\/figure>/g)];
  if (!figs.length) return html;
  let out = html;
  for (const m of figs) {
    const [whole, attrs, id, inner] = m;
    const where = `scene ${sceneId}: data-meme="${id}"`;
    let tpl;
    try { tpl = await loadTemplate(id); } catch (e) { die(`${where}: ${e.message}`); }
    let size;
    try { size = imageSize(readFileSync(tpl.image)); } catch (e) { die(`${where}: ${tpl.image}: ${e.message}`); }
    mkdirSync(join(dir, "assets", "memes"), { recursive: true });
    cpSync(tpl.image, join(dir, "assets", "memes", `${id}.${tpl.ext}`));
    const lines = [...inner.matchAll(/<span([^>]*)>([\s\S]*?)<\/span>/g)].map((s) => ({ attrs: s[1], html: s[2].trim() }));
    out = out.replace(whole, () => figureHtml(attrs, tpl, size, lines, where));
  }
  cpSync(join(REPO, "kit", "fonts"), join(dir, "assets", "memes", "fonts"), { recursive: true });
  return out;
}

/** @font-face rules for the meme fonts (Titillium Web Black and SemiBold, Anton: SIL OFL, kit/fonts). */
export const MEME_FONTS_CSS = [
  ["Titillium Web", 900, "titillium-web-latin-900-normal"],
  ["Titillium Web", 600, "titillium-web-latin-600-normal"],
  ["Anton", 400, "anton-latin-400-normal"],
].map(([family, weight, file]) => `@font-face { font-family: "${family}"; font-weight: ${weight}; src: url("assets/memes/fonts/${file}.woff2") format("woff2"); }`).join("\n");

/** Every meme in a built index.html: {id, name, source, lines}, for the review packet. */
export function memesIn(html) {
  const text = (s) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").trim();
  return [...html.matchAll(/<figure[^>]*data-meme="([^"]*)"[^>]*data-meme-name="([^"]*)"[^>]*data-meme-source="([^"]*)"[^>]*>([\s\S]*?)<\/figure>/g)].map((m) => ({
    id: m[1], name: m[2].replace(/&quot;/g, '"'), source: m[3].replace(/&quot;/g, '"'),
    lines: [...m[4].matchAll(/<span class="ss-meme-line"[^>]*>([\s\S]*?)<\/span>/g)].map((l) => text(l[1])),
  }));
}

// ---- the catalog ----

/** The catalog list, from the cache unless `refresh` (or there is none yet). */
export async function catalog({ refresh = false } = {}) {
  const cached = join(cacheDir(), "templates.json");
  if (!refresh && existsSync(cached)) return JSON.parse(readFileSync(cached, "utf8"));
  const bytes = await get(isUrl(api()) ? `${api()}/templates` : join(api(), "templates.json"));
  if (!bytes) throw new Error(`no catalog at ${api()}`);
  const list = JSON.parse(bytes.toString("utf8"));
  mkdirSync(cacheDir(), { recursive: true });
  writeFileSync(cached, JSON.stringify(list));
  return list;
}

/** Templates ranked by how many of the words hit their id, name, keywords or example text; no words lists them all. */
export function search(list, words) {
  const terms = words.map((w) => w.toLowerCase()).filter(Boolean);
  const scored = list.map((t) => {
    const fields = [[t.id, 4], [t.name, 3], [(t.keywords || []).join(" "), 2], [(t.example?.text || []).join(" "), 1]].map(([s, w]) => [String(s || "").toLowerCase(), w]);
    const score = terms.reduce((a, term) => a + Math.max(0, ...fields.map(([s, w]) => (s.includes(term) ? w : 0))), 0);
    return { t, score, all: terms.every((term) => fields.some(([s]) => s.includes(term))) };
  });
  return scored.filter((x) => !terms.length || x.score > 0).sort((a, b) => Number(b.all) - Number(a.all) || b.score - a.score || a.t.id.localeCompare(b.t.id)).map((x) => x.t);
}
