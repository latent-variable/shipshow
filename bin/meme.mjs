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
//
// Animated memes (DESIGN D49). A frame-seeked renderer cannot play a GIF in an img, so a moving meme is
// a video the build writes: ffmpeg turns the picture into H.264 at 30 fps, cropped, and looped to cover
// the time the figure is on screen, and a video element starts it at the figure's cue. Two sources:
//   data-meme="rollsafe"   a memegen template whose clean default.gif is animated (17 of them)
//   data-clip="<url|file>" any GIF, MP4 or WebM: a URL (fetched once into <cache>/clips/), or a file in
//                          the video's folder. data-crop="top 14%" cuts a caption band off first.
// Their text is drawn exactly like a still meme's: a span each for the top and the bottom band,
// <span class="top"> or <span class="bottom">, or first and second in order.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, isAbsolute, join, resolve } from "node:path";
import { REPO, die, round } from "./lib.mjs";

const EXTS = ["gif", "jpg", "png", "jpeg"];   // gif first: a template with an animated default.gif keeps a still beside it
const FPS = 30;                                // the composition's frame rate
const CACHE_STAMP = ".v2";                     // a cache entry written since animated GIFs were kept
const MAX_PX = { w: 1920, h: 1080 };           // a clip larger than the canvas is scaled down to it
const api = () => (process.env.SHIPSHOW_MEMEGEN_API || "https://api.memegen.link").replace(/\/+$/, "");
const files = () => (process.env.SHIPSHOW_MEMEGEN_FILES || "https://raw.githubusercontent.com/jacebrowning/memegen/main").replace(/\/+$/, "");
export const cacheDir = () => process.env.SHIPSHOW_MEMES_CACHE || join(homedir(), ".cache", "shipshow", "memes");
const isUrl = (s) => /^https?:\/\//.test(s);

/** Bytes from a URL or a local path; null when it is not there. A network failure is an Error. */
export const MAX_BYTES = 25e6;   // largest meme picture or clip fetched (Imgflip clips are 40-860 KB)

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
  // A meme is a few hundred KB; stop reading past MAX_BYTES rather than buffer whatever a URL sends.
  if (+res.headers.get("content-length") > MAX_BYTES) throw new Error(`${location} is ${res.headers.get("content-length")} bytes, over the ${MAX_BYTES / 1e6} MB a meme may be`);
  const parts = [];
  let size = 0;
  for await (const chunk of res.body) {
    size += chunk.length;
    if (size > MAX_BYTES) throw new Error(`${location} sent more than the ${MAX_BYTES / 1e6} MB a meme may be`);
    parts.push(chunk);
  }
  return Buffer.concat(parts);
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

/** Frames in a GIF: the image descriptors, walked block by block (a header scan would count bytes in the pixel data). */
export function gifFrames(buf) {
  if (buf.length < 14 || buf.toString("latin1", 0, 3) !== "GIF") return 0;
  let i = 13;
  if (buf[10] & 0x80) i += 3 * (1 << ((buf[10] & 7) + 1));
  const skipBlocks = () => { while (i < buf.length && buf[i]) i += buf[i] + 1; i++; };
  let frames = 0;
  while (i < buf.length) {
    const b = buf[i++];
    if (b === 0x3b) break;
    if (b === 0x21) { i++; skipBlocks(); }                 // extension: label, then sub-blocks
    else if (b === 0x2c) {                                  // image: descriptor, colour table, LZW size, sub-blocks
      const flags = buf[i + 8];
      i += 9;
      if (flags & 0x80) i += 3 * (1 << ((flags & 7) + 1));
      i++;
      skipBlocks();
      frames++;
    } else break;
  }
  return frames;
}

/** The template's files in the cache, fetched first if they are not there. {config, image, ext, animated, source, name, boxes}
 *  A template with an animated default.gif is kept as that; one with a still beside it keeps the GIF only when it moves. */
export async function loadTemplate(id) {
  if (!/^[a-z0-9_.-]+$/i.test(id) || id.startsWith(".")) throw new Error(`"${id}" is not a template id`);
  const dir = join(cacheDir(), id);
  const cached = () => EXTS.find((e) => existsSync(join(dir, `default.${e}`)));
  if (!existsSync(join(dir, "config.yml")) || !cached() || !existsSync(join(dir, CACHE_STAMP))) {
    const base = `${files()}/templates/${id}`;
    const config = await get(isUrl(base) ? `${base}/config.yml` : join(base, "config.yml"));
    if (!config) throw new Error(`no template "${id}" in the memegen catalog (npm run memes -- <words> searches it)`);
    let found = null, still = null;
    for (const ext of EXTS) {
      const bytes = await get(isUrl(base) ? `${base}/default.${ext}` : join(base, `default.${ext}`));
      if (!bytes) continue;
      if (ext === "gif" && gifFrames(bytes) < 2) { still = { ext, bytes }; continue; }   // a one-frame GIF is a still: prefer a real still's format
      found = { ext, bytes };
      break;
    }
    found ||= still;
    if (!found) throw new Error(`template "${id}" has a config but no default image (tried ${EXTS.join(", ")})`);
    mkdirSync(dir, { recursive: true });
    for (const e of EXTS) if (e !== found.ext && existsSync(join(dir, `default.${e}`))) renameSync(join(dir, `default.${e}`), join(dir, `default.${e}.old`));   // a stale picture of another kind must not win
    writeFileSync(join(dir, `default.${found.ext}`), found.bytes);
    writeFileSync(join(dir, "config.yml"), config);
    writeFileSync(join(dir, CACHE_STAMP), "");   // last, so a half-fetched template is fetched again
  }
  const ext = cached();
  const parsed = parseConfig(readFileSync(join(dir, "config.yml"), "utf8"));
  if (!parsed.boxes.length) throw new Error(`template "${id}" has no text boxes`);
  const image = join(dir, `default.${ext}`);
  return { id, ext, image, animated: ext === "gif" && gifFrames(readFileSync(image)) > 1, ...parsed };
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
const attrOf = (attrs, name) => (attrs.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`)) || [])[1];

/** One figure's HTML: the picture (an img, or the video element of an animated meme), a box per span.
 *  `lines` are the spans as written: {attrs, html}. `extra` is added to the figure's attributes. */
export function figureHtml(attrs, tpl, size, lines, where, { media, extra = "" } = {}) {
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
  const tagged = `${rest} class="${cls.join(" ")}" data-meme-name="${esc(tpl.name)}" data-meme-source="${esc(tpl.source)}"${extra} style="--ar:${ar};${style}"`;
  return `<figure${tagged}>${media ?? `<img class="ss-meme-img" src="assets/memes/${tpl.id}.${tpl.ext}" alt="" />`}${boxes.join("")}</figure>`;
}

// ---- animated memes: a clip turned into a video the renderer can seek ----

const FFMPEG_MISSING = "ffmpeg is not installed; npm run doctor says how to get it";

/** A crop as written, `top 14%` or `top 40px, left 10%`: {top, right, bottom, left}, each {v, unit}. */
export function parseCrop(text) {
  const syntax = `expected a side and a size, like "top 14%" or "top 40px bottom 5%" (sides: top, right, bottom, left)`;
  const toks = String(text).trim().split(/[\s,]+/).filter(Boolean);
  if (!toks.length || toks.length % 2) throw new Error(`data-crop="${text}": ${syntax}`);
  const out = {};
  for (let i = 0; i < toks.length; i += 2) {
    const side = toks[i].toLowerCase(), m = toks[i + 1].match(/^(\d+(?:\.\d+)?)(%|px)$/);
    if (!["top", "right", "bottom", "left"].includes(side) || !m) throw new Error(`data-crop="${text}": ${syntax}`);
    if (out[side]) throw new Error(`data-crop="${text}": "${side}" is given twice`);
    out[side] = { v: +m[1], unit: m[2] };
    if (m[2] === "%" && out[side].v >= 100) throw new Error(`data-crop="${text}": ${side} ${toks[i + 1]} crops away the whole picture`);
  }
  return out;
}

/** The pixels a crop keeps of a `w` by `h` source: {x, y, w, h}, even sizes (H.264's 4:2:0 needs them). */
export function cropRect(crop, w, h) {
  const px = (c, dim) => (c ? Math.round(c.unit === "%" ? (dim * c.v) / 100 : c.v) : 0);
  const l = px(crop?.left, w), r = px(crop?.right, w), t = px(crop?.top, h), b = px(crop?.bottom, h);
  const kw = w - l - r, kh = h - t - b;
  if (kw < 16 || kh < 16) throw new Error(`the crop leaves ${Math.max(kw, 0)}x${Math.max(kh, 0)} px of a ${w}x${h} picture`);
  return { x: l, y: t, w: kw - (kw % 2), h: kh - (kh % 2) };
}

function ffprobeSize(file) {
  const r = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", file], { encoding: "utf8" });
  if (r.error?.code === "ENOENT") throw new Error(FFMPEG_MISSING);
  const m = r.status === 0 && r.stdout.trim().match(/^(\d+)x(\d+)/);
  if (!m) throw new Error(`ffprobe could not read a picture from ${file}`);
  return { w: +m[1], h: +m[2] };
}

/** What a clip file is, from its first bytes: gif, mp4 or webm; null for anything else (an HTML error page, say). */
function clipKind(buf) {
  if (buf.toString("latin1", 0, 3) === "GIF") return "gif";
  if (buf.length > 12 && buf.toString("latin1", 4, 8) === "ftyp") return "mp4";
  if (buf.length > 4 && buf.readUInt32BE(0) === 0x1a45dfa3) return "webm";
  return null;
}

/** A clip as a local file: a URL is fetched once into <cache>/clips/ (kept if it was there), a path is
 *  taken from the video's folder. Throws with the reason. */
export async function clipFile(src, videoDir) {
  if (isUrl(src)) {
    const file = join(cacheDir(), "clips", createHash("sha256").update(src).digest("hex").slice(0, 20));
    if (!existsSync(file) || statSync(file).size === 0) {
      const bytes = await get(src);
      if (!bytes) throw new Error(`no clip at ${src} (404)`);
      if (!clipKind(bytes)) throw new Error(`${src} is not a GIF, MP4 or WebM clip`);
      mkdirSync(join(cacheDir(), "clips"), { recursive: true });
      writeFileSync(`${file}.part`, bytes);
      renameSync(`${file}.part`, file);   // whole or not there: a half-fetched clip is never read
    }
    return file;
  }
  const file = isAbsolute(src) ? src : resolve(videoDir, src);
  if (!existsSync(file) || !statSync(file).isFile()) throw new Error(`no clip file ${file}`);
  if (!clipKind(readFileSync(file).subarray(0, 16))) throw new Error(`${file} is not a GIF, MP4 or WebM clip`);
  return file;
}

/** Turn a GIF, MP4 or WebM into assets/memes/clips/<key>.mp4: cropped, 30 fps, no sound, looped to
 *  `window` seconds. The key names the source bytes and every parameter, so a changed clip, crop or window
 *  is a new file and an unchanged one is not encoded again. Returns {file, w, h}. */
export function encodeClip(input, crop, window, videoDir) {
  const bytes = readFileSync(input);
  const src = ffprobeSize(input);
  const rect = cropRect(crop, src.w, src.h);
  const k = Math.min(1, MAX_PX.w / rect.w, MAX_PX.h / rect.h);
  const out = k < 1 ? { w: Math.max(2, 2 * Math.round((rect.w * k) / 2)), h: Math.max(2, 2 * Math.round((rect.h * k) / 2)) } : { w: rect.w, h: rect.h };
  const length = Math.ceil(window * FPS) / FPS;   // whole frames
  const key = createHash("sha256").update(`clip2|${FPS}|${rect.x},${rect.y},${rect.w},${rect.h}|${out.w}x${out.h}|${length}|`).update(bytes).digest("hex").slice(0, 16);
  const rel = join("assets", "memes", "clips", `${key}.mp4`), file = join(videoDir, rel);
  if (existsSync(file) && statSync(file).size > 0) return { file: rel, ...out };
  mkdirSync(join(videoDir, "assets", "memes", "clips"), { recursive: true });
  const vf = [`fps=${FPS}`, `crop=${rect.w}:${rect.h}:${rect.x}:${rect.y}`, ...(k < 1 ? [`scale=${out.w}:${out.h}:flags=lanczos`] : []), "format=yuv420p"].join(",");
  const tmp = `${file}.part.mp4`;
  const args = ["-v", "error", "-y", "-stream_loop", "-1", ...(clipKind(bytes.subarray(0, 16)) === "gif" ? ["-ignore_loop", "1"] : []), "-i", input,
    "-t", String(length), "-an", "-vf", vf, "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-r", String(FPS), "-g", String(FPS), "-keyint_min", String(FPS),   // a keyframe a second: HyperFrames seeks a clip with sparse ones badly
     "-movflags", "+faststart", tmp];
  const r = spawnSync("ffmpeg", args, { encoding: "utf8" });
  if (r.error?.code === "ENOENT") throw new Error(FFMPEG_MISSING);
  if (r.status !== 0) throw new Error(`ffmpeg could not make a video of ${basename(input)}\n${r.stderr}`);
  renameSync(tmp, file);
  return { file: rel, ...out };
}

let videos = 0;
/** The video element for a figure: it starts when the figure does (`start`, seconds on the video's timeline) and
 *  runs `window` seconds. The figure carries the entrance animation, never the video: the renderer owns a
 *  timed element's opacity. */
function videoHtml(rel, start, window) {
  return `<video class="clip ss-meme-img" id="meme-video-${++videos}" src="${rel.split("\\").join("/")}" data-start="${round(start)}" data-duration="${round(window)}" data-track-index="${40 + videos}" data-has-audio="false" muted playsinline preload="auto"></video>`;
}

/** Where the two text bands of a clip meme sit, in a memegen config's own terms. */
const BANDS = {
  top: { color: "white", font: "thick", anchor_x: 0.04, anchor_y: 0.03, scale_x: 0.92, scale_y: 0.2 },
  bottom: { color: "white", font: "thick", anchor_x: 0.04, anchor_y: 0.77, scale_x: 0.92, scale_y: 0.2 },
};

/** The spans of a clip figure in band order: `class="top"` or `"bottom"`, else first then second. {bands, lines} */
function clipLines(inner, where) {
  const spans = [...inner.matchAll(/<span([^>]*)>([\s\S]*?)<\/span>/g)].map((s) => {
    const cls = (attrOf(s[1], "class") || "").split(/\s+/);
    return { side: cls.includes("top") ? "top" : cls.includes("bottom") ? "bottom" : null, attrs: s[1].replace(/\s*class="[^"]*"/, ""), html: s[2].trim() };
  });
  if (spans.length > 2) die(`${where}: a clip meme has a top and a bottom band, but the figure has ${spans.length} spans`);
  const taken = new Set(spans.map((s) => s.side).filter(Boolean));
  const free = ["top", "bottom"].filter((b) => !taken.has(b));
  spans.forEach((s) => { s.side ||= free.shift(); });
  if (new Set(spans.map((s) => s.side)).size < spans.length) die(`${where}: two spans for the same band`);
  spans.sort((a, b) => (a.side === "top" ? -1 : 1) - (b.side === "top" ? -1 : 1));
  return { bands: spans.map((s) => s.side), lines: spans.map(({ attrs, html }) => ({ attrs, html })) };
}

/** A scene's HTML with each meme figure expanded: `data-meme` (a memegen template, still or animated) and
 *  `data-clip` (a GIF, MP4 or WebM). Copies a still template's image into <video>/assets/memes/, writes an
 *  animated one's video to assets/memes/clips/, and the fonts to assets/memes/fonts/. `ctx` gives the scene's
 *  `start` and `end` and `at(cue)`, so a video starts at its figure's cue and runs to the end of the scene.
 *  Stops with the scene's name on an unknown template, a fetch failure, a bad crop or too many spans. */
export async function memeScene(html, dir, sceneId, ctx = { start: 0, end: 10, at: () => 0 }) {
  const figs = [...html.matchAll(/<figure([^>]*\b(?:data-meme|data-clip)="([^"]*)"[^>]*)>([\s\S]*?)<\/figure>/g)];
  if (!figs.length) return html;
  let out = html;
  for (const m of figs) {
    const [whole, attrs, id, inner] = m;
    const clip = attrOf(attrs, "data-clip");
    const where = `scene ${sceneId}: ${clip !== undefined ? "data-clip" : "data-meme"}="${id}"`;
    const cue = attrOf(attrs, "data-cue");
    const start = cue ? ctx.at(cue) : ctx.start, window = ctx.end - start;
    mkdirSync(join(dir, "assets", "memes"), { recursive: true });
    if (clip !== undefined) {
      if (attrOf(attrs, "data-meme") !== undefined) die(`${where}: a figure takes data-meme or data-clip, not both`);
      let file, video, band;
      try {
        file = await clipFile(clip, dir);
        const crop = attrOf(attrs, "data-crop");
        video = encodeClip(file, crop === undefined ? null : parseCrop(crop), window, dir);
        band = clipLines(inner, where);
      } catch (e) { die(`${where}: ${e.message}`); }
      const tpl = { id: "clip", name: attrOf(attrs, "data-name") || basename(clip.split(/[?#]/)[0]), source: attrOf(attrs, "data-credit") || clip, boxes: band.bands.map((b) => BANDS[b]) };
      const rest = attrs.replace(/\s*data-(crop|name|credit)="[^"]*"/g, "");
      out = out.replace(whole, () => figureHtml(rest, tpl, video, band.lines, where, { media: videoHtml(video.file, start, window), extra: ` data-meme-clip="${esc(clip)}"` }));
      continue;
    }
    let tpl;
    try { tpl = await loadTemplate(id); } catch (e) { die(`${where}: ${e.message}`); }
    const lines = [...inner.matchAll(/<span([^>]*)>([\s\S]*?)<\/span>/g)].map((s) => ({ attrs: s[1], html: s[2].trim() }));
    if (tpl.animated) {
      let video;
      try { video = encodeClip(tpl.image, null, window, dir); } catch (e) { die(`${where}: ${e.message}`); }
      out = out.replace(whole, () => figureHtml(attrs, tpl, video, lines, where, { media: videoHtml(video.file, start, window), extra: ` data-meme-clip="${esc(`${files()}/templates/${id}/default.gif`)}"` }));
      continue;
    }
    let size;
    try { size = imageSize(readFileSync(tpl.image)); } catch (e) { die(`${where}: ${tpl.image}: ${e.message}`); }
    cpSync(tpl.image, join(dir, "assets", "memes", `${id}.${tpl.ext}`));
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

/** Every meme in a built index.html: {id, name, source, lines}, for the review packet. An animated one
 *  (a clip, or a template that moves) also has `clip`, the file it was made from: a URL or a path. */
export function memesIn(html) {
  const text = (s) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").trim();
  const un = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&amp;/g, "&");
  return [...html.matchAll(/<figure([^>]*\bdata-meme-name="[^"]*"[^>]*)>([\s\S]*?)<\/figure>/g)].map((m) => {
    const clip = attrOf(m[1], "data-meme-clip");
    return {
      id: attrOf(m[1], "data-meme") ?? "clip", name: un(attrOf(m[1], "data-meme-name")), source: un(attrOf(m[1], "data-meme-source")),
      lines: [...m[2].matchAll(/<span class="ss-meme-line"[^>]*>([\s\S]*?)<\/span>/g)].map((l) => text(l[1])),
      ...(clip === undefined ? {} : { clip: un(clip) }),
    };
  });
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
