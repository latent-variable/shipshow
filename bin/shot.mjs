// Screenshots of real pages, taken at build: the receipt for a quote, a rule or a comment the video talks about.
// bin/build.mjs calls shotScene() on each scene: every
//   <figure class="ss-shot" data-shot="https://github.com/ocaml/ocaml/pull/14369#issuecomment-3556593972"
//           data-select="#issuecomment-3556593972" data-find="very lightly tested" data-cue="OCaml" data-anim="pop"></figure>
// is captured once in headless Chrome (HyperFrames' own, or SHIPSHOW_CHROME), kept in the cache, copied to the video's
// assets/shots/, and drawn as the picture under a bar naming where it came from, with a marker over the words
// data-find names (data-mark-cue sweeps it in on a later word).
//
//   data-shot     the page: an http(s) URL, or a file in the video's folder
//   data-select   the element to capture (CSS), or several ("h3, table": the box around them all, plus the block holding
//                 data-find's words, looked for inside the nearest element holding them all); without it, that block
//   data-find     words on the page to mark (whitespace, case and curly quotes ignored); the build stops if they are absent
//   data-lines    keep only the lines holding data-find's words, and this many more above and below (0 to 10): for a
//                 long paragraph whose one sentence is the point
//   data-hide     CSS selectors to hide first, comma-separated (a cookie banner, a sticky header)
//   data-width    the browser's width in CSS px (default 1100); data-scheme "dark" (default) or "light"; data-pad, px
//                 of page kept around the element (default 20)
//   data-source   the address the bar shows, when the page captured is not the one to cite (an X post is captured
//                 through platform.twitter.com/embed/Tweet.html?id=<id>&theme=dark, which needs no sign-in)
//
// Where things come from (env, so tests and mirrors can stand in):
//   SHIPSHOW_SHOTS_CACHE  where captures are kept (default ~/.cache/shipshow/shots); delete a folder to take it again
//   SHIPSHOW_CHROME       the Chrome to capture with (default: `hyperframes browser path`)
// A screenshot is a third-party page: captured, never committed (assets/ is ignored), and shown as commentary.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { die, REPO } from "./lib.mjs";
import { imageSize } from "./meme.mjs";

export const VERSION = 7;   // how a capture is taken: bump when that changes, so cached shots are taken again
export const cacheDir = () => process.env.SHIPSHOW_SHOTS_CACHE || join(homedir(), ".cache", "shipshow", "shots");
const SCALE = 2;            // device pixels per CSS px: sharp when the figure is drawn larger than the page was
const TIMEOUT = 30000;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const unesc = (s) => String(s).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const attrOf = (attrs, name) => { const v = (attrs.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`)) || [])[1]; return v === undefined ? undefined : unesc(v); };

/** What a figure asks for, with defaults filled in and checked. Throws on a bad value. */
export function shotSpec(attrs, videoDir) {
  const raw = attrOf(attrs, "data-shot") || "";
  let url;
  if (/^https?:\/\//i.test(raw)) url = new URL(raw).href;
  else if (raw && !/^[a-z]+:/i.test(raw)) url = pathToFileURL(resolve(videoDir, raw)).href;
  else throw new Error(`data-shot="${raw}" is not an http(s) URL or a file in the video's folder`);
  const width = Number(attrOf(attrs, "data-width") ?? 1100), pad = Number(attrOf(attrs, "data-pad") ?? 20);
  if (!(width >= 320 && width <= 2560)) throw new Error(`data-width="${attrOf(attrs, "data-width")}" is not 320 to 2560`);
  if (!(pad >= 0 && pad <= 200)) throw new Error(`data-pad="${attrOf(attrs, "data-pad")}" is not 0 to 200`);
  const scheme = attrOf(attrs, "data-scheme") || "dark";
  if (!["dark", "light"].includes(scheme)) throw new Error(`data-scheme="${scheme}" is not dark or light`);
  const hide = (attrOf(attrs, "data-hide") || "").split(",").map((s) => s.trim()).filter(Boolean);
  const spec = { url, select: attrOf(attrs, "data-select") || "", find: attrOf(attrs, "data-find") || "", hide, width, pad, scheme };
  if (attrOf(attrs, "data-lines") !== undefined) {
    const lines = Number(attrOf(attrs, "data-lines"));
    if (!(Number.isInteger(lines) && lines >= 0 && lines <= 10)) throw new Error(`data-lines="${attrOf(attrs, "data-lines")}" is not a whole number from 0 to 10`);
    if (!spec.find) throw new Error("data-lines needs data-find: it keeps the lines holding those words");
    spec.lines = lines;
  }
  return spec;
}

/** The cache folder's name for a spec: every input that changes the picture. */
export function shotKey(spec) {
  return createHash("sha256").update(JSON.stringify({ v: VERSION, ...spec })).digest("hex").slice(0, 16);
}

/** Where a page came from, as a reader would say it: host and path, no scheme, no query. */
export function sourceLabel(url) {
  const u = new URL(url);
  if (u.protocol === "file:") return decodeURIComponent(u.pathname.split("/").pop());
  return (u.host.replace(/^www\./, "") + u.pathname.replace(/\/$/, "")).slice(0, 90);
}

function chromePath() {
  if (process.env.SHIPSHOW_CHROME) return process.env.SHIPSHOW_CHROME;
  try {
    return execFileSync(join(REPO, "node_modules", ".bin", "hyperframes"), ["browser", "path"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim().split("\n").pop();
  } catch { throw new Error("no Chrome to capture with: run `npx hyperframes browser ensure`, or set SHIPSHOW_CHROME"); }
}

/** Runs in the page: hides what was asked, finds the element and the words, and returns the clip and the mark in page px. */
function locate({ select, find, hide, pad, lines }) {
  for (const h of hide) for (const el of document.querySelectorAll(h)) el.style.setProperty("display", "none", "important");
  // data-select may name several elements ("h3, table"): the capture is the box around all of them.
  // Elements with no size (a hidden dialog's heading) are skipped: they sit at the page's top and would stretch the box.
  const roots = select ? [...document.querySelectorAll(select)].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }) : [];
  if (select && !roots.length) return { error: `no element on the page matches data-select="${select}"` };
  let range = null, block = null;
  if (find) {
    const norm = (c) => (/\s/.test(c) ? " " : c.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').toLowerCase());
    const needle = [...find.trim()].map(norm).join("").replace(/ +/g, " ");
    // The words are looked for inside the element named, or, when several are, inside the nearest element holding them all.
    let scope = document.body;
    if (roots.length) { const r = document.createRange(); r.setStartBefore(roots[0]); r.setEndAfter(roots[roots.length - 1]); scope = roots.length === 1 ? roots[0] : r.commonAncestorContainer; }
    const nodes = [], walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    let flat = "", map = [];
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if (!n.parentElement || n.parentElement.closest("script,style,noscript")) continue;
      for (let i = 0; i < n.data.length; i++) {
        const c = norm(n.data[i]);
        if (c === " " && flat.endsWith(" ")) continue;
        flat += c; map.push([nodes.length, i]);
      }
      nodes.push(n);
    }
    const at = flat.indexOf(needle);
    if (at < 0) return { error: `the page has no "${find}"${select ? ` inside ${select}` : ""}` };
    const [a, ai] = map[at], [b, bi] = map[at + needle.length - 1];
    range = document.createRange();
    range.setStart(nodes[a], ai); range.setEnd(nodes[b], bi + 1);
    block = range.startContainer.parentElement.closest("p,li,blockquote,pre,td,h1,h2,h3,h4,h5,h6") || range.startContainer.parentElement;
  }
  // What is captured: the elements named, plus the block holding the words when it lies outside them; or that block alone.
  const parts = roots.length ? [...roots] : block ? [block] : [];
  if (roots.length > 1 && block && !roots.some((r) => r.contains(block))) parts.push(block);
  if (parts.length) parts[0].scrollIntoView({ block: "center" });
  const sx = window.scrollX, sy = window.scrollY;
  const union = (rs) => { const l = Math.min(...rs.map((r) => r.left)), t = Math.min(...rs.map((r) => r.top)); return { left: l, top: t, width: Math.max(...rs.map((r) => r.right)) - l, height: Math.max(...rs.map((r) => r.bottom)) - t }; };
  let box = parts.length ? union(parts.map((e) => e.getBoundingClientRect())) : { left: 0, top: 0, width: document.documentElement.clientWidth, height: window.innerHeight };
  let padY = pad;
  // A block taller than a screen (a whole post in one <pre>) is cut to the paragraph around the words: the text between
  // the blank lines on either side, as wide as the block, with no page above or below it (that would be half a line).
  if (!select && range && box.height > window.innerHeight && range.startContainer === range.endContainer) {
    const t = range.startContainer.data, para = document.createRange();
    const from = t.lastIndexOf("\n\n", range.startOffset), to = t.indexOf("\n\n", range.endOffset);
    para.setStart(range.startContainer, from < 0 ? 0 : from + 2); para.setEnd(range.startContainer, to < 0 ? t.length : to);
    const p = para.getBoundingClientRect();
    box = { left: box.left, width: box.width, top: p.top, height: p.height };
    padY = 0;
  }
  // data-lines: only the lines holding the words, and that many more above and below, cut on line boundaries.
  if (lines !== undefined && range) {
    const rects = [...range.getClientRects()].filter((r) => r.width >= 1 && r.height >= 1);
    const el = range.startContainer.parentElement;
    const glyph = rects[0].height, lh = parseFloat(getComputedStyle(el).lineHeight) || glyph * 1.4;
    const half = Math.max(0, (lh - glyph) / 2);
    const top = Math.max(box.top, Math.min(...rects.map((r) => r.top)) - half - lines * lh);
    const bottom = Math.min(box.top + box.height, Math.max(...rects.map((r) => r.bottom)) + half + lines * lh);
    box = { left: box.left, width: box.width, top, height: bottom - top };
    padY = 0;
  }
  const clip = { x: Math.max(0, box.left + sx - pad), y: Math.max(0, box.top + sy - padY), width: box.width + 2 * pad, height: box.height + 2 * padY };
  clip.width = Math.min(clip.width, document.documentElement.scrollWidth - clip.x);
  // One box per line the words run over: the client rects of a range, merged where they share a line.
  let mark = null;
  if (range) {
    mark = [];
    for (const r of range.getClientRects()) {
      if (r.width < 1 || r.height < 1) continue;
      const line = mark.find((m) => Math.abs(m.top - r.top) < r.height / 2);
      if (line) { line.right = Math.max(line.right, r.right); line.left = Math.min(line.left, r.left); line.bottom = Math.max(line.bottom, r.bottom); }
      else mark.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom });
    }
    mark = mark.map((m) => ({ x: m.left + sx - clip.x, y: m.top + sy - clip.y, w: m.right - m.left, h: m.bottom - m.top }));
  }
  // Whether the page is light where it was captured: the first background up the tree that is not transparent.
  let light = true;
  for (let e = parts[0] || block || document.body; e; e = e.parentElement) {
    const m = getComputedStyle(e).backgroundColor.match(/[\d.]+/g);
    if (m && (m.length < 4 || +m[3] > 0.5)) { light = (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255 > 0.5; break; }
  }
  return { clip, mark, title: document.title, light };
}

/** Takes the screenshot: {png (Buffer), meta}. Throws with what went wrong. */
async function capture(spec) {
  const { default: puppeteer } = await import("puppeteer-core");
  const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ["--hide-scrollbars"] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: spec.width, height: 900, deviceScaleFactor: SCALE });
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: spec.scheme }]);
    const res = await page.goto(spec.url, { waitUntil: "networkidle2", timeout: TIMEOUT });
    if (res && !res.ok() && res.status() !== 304) throw new Error(`${spec.url} answered ${res.status()}`);
    await page.evaluate(() => document.fonts.ready);
    const found = await page.evaluate(locate, spec);
    if (found.error) throw new Error(found.error);
    const clip = Object.fromEntries(Object.entries(found.clip).map(([k, v]) => [k, Math.round(v)]));
    if (clip.width < 10 || clip.height < 10) throw new Error(`the element to capture is ${clip.width} by ${clip.height} px: nothing to show`);
    const png = Buffer.from(await page.screenshot({ clip, captureBeyondViewport: true, omitBackground: true, type: "png" }));
    const mark = found.mark && found.mark.map((m) => ({ x: m.x / clip.width, y: m.y / clip.height, w: m.w / clip.width, h: m.h / clip.height }));
    return { png, meta: { url: spec.url, select: spec.select, find: spec.find, title: found.title, capturedAt: new Date().toISOString().slice(0, 10), mark, light: found.light } };
  } finally { await browser.close(); }
}

/** {image, name, meta, size}: from the cache, captured first if it is not there. */
export async function loadShot(spec) {
  const key = shotKey(spec), dir = join(cacheDir(), key);
  const metaPath = join(dir, "meta.json");
  if (!existsSync(metaPath)) {
    const { png, meta } = await capture(spec);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "shot.png"), png);
    writeFileSync(metaPath, JSON.stringify(meta, null, 1));   // last, so a half-written capture is taken again
  }
  const meta = JSON.parse(readFileSync(metaPath, "utf8"));
  const image = join(dir, "shot.png");
  if (!existsSync(image)) throw new Error(`${dir} has no shot.png; delete the folder and build again`);
  return { image, name: `${key}.png`, meta, size: imageSize(readFileSync(image)) };
}

const pct = (v) => `${Math.round(v * 10000) / 100}%`;

/** One figure's HTML: a bar naming the source, the picture, the marker, then the builder's caption. */
export function figureHtml(attrs, inner, shot) {
  const cls = (attrs.match(/class="([^"]*)"/) || [, ""])[1].split(/\s+/).filter(Boolean);
  if (!cls.includes("ss-shot")) cls.unshift("ss-shot");
  if (shot.meta.light) cls.push("ss-shot-light");   // the marker multiplies under dark ink instead of washing it out
  const style = (attrs.match(/style="([^"]*)"/) || [, ""])[1];
  const markCue = attrOf(attrs, "data-mark-cue");
  const rest = attrs.replace(/\s*(class|style|data-mark-cue)="[^"]*"/g, "");
  const ar = Math.round((shot.size.w / shot.size.h) * 10000) / 10000;
  const m = shot.meta.mark;
  const boxes = (m || []).map((b) => `<span class="ss-shot-mark" style="left:${pct(b.x)};top:${pct(b.y)};width:${pct(b.w)};height:${pct(b.h)}"></span>`).join("");
  const mark = m ? `<span class="ss-shot-marks"${markCue ? ` data-cue="${esc(markCue)}" data-anim="grow"` : ""}>${boxes}</span>` : "";
  const cap = (inner.match(/<figcaption[\s\S]*?<\/figcaption>/) || [""])[0];
  const label = attrOf(attrs, "data-source") || sourceLabel(shot.meta.url);
  const data = `data-shot-url="${esc(shot.meta.url)}" data-shot-taken="${esc(shot.meta.capturedAt)}" data-shot-marked="${m ? "yes" : "no"}"`;
  return `<figure${rest} class="${cls.join(" ")}" ${data} style="--ar:${ar};${style}"><div class="ss-shot-bar">${esc(label)}</div><div class="ss-shot-photo"><img class="ss-shot-img" src="assets/shots/${shot.name}" alt="${esc(shot.meta.find || shot.meta.title || sourceLabel(shot.meta.url))}" />${mark}</div>${cap}</figure>`;
}

/** A scene's HTML with each screenshot figure expanded; copies each picture into <video>/assets/shots/.
 *  Stops naming the scene and the page when a page cannot be loaded, an element or the words are missing. */
export async function shotScene(html, dir, sceneId) {
  const figs = [...html.matchAll(/<figure([^>]*\bdata-shot="[^"]*"[^>]*)>([\s\S]*?)<\/figure>/g)];
  let out = html;
  for (const [whole, attrs, inner] of figs) {
    let shot;
    try { shot = await loadShot(shotSpec(attrs, dir)); } catch (e) { die(`scene ${sceneId}: data-shot="${attrOf(attrs, "data-shot")}": ${e.message}`); }
    mkdirSync(join(dir, "assets", "shots"), { recursive: true });
    cpSync(shot.image, join(dir, "assets", "shots", shot.name));
    out = out.replace(whole, () => figureHtml(attrs, inner, shot));
  }
  return out;
}

/** Every screenshot in a built index.html, for the review packet. */
export function shotsIn(html) {
  return [...html.matchAll(/<figure[^>]*\bdata-shot="([^"]*)"[^>]*data-shot-url="([^"]*)" data-shot-taken="([^"]*)" data-shot-marked="([^"]*)"[^>]*>/g)].map((m) => ({
    shot: unesc(m[1]), url: unesc(m[2]), taken: unesc(m[3]), marked: m[4] === "yes",
    find: unesc((m[0].match(/data-find="([^"]*)"/) || [, ""])[1]),
    source: unesc((m[0].match(/data-source="([^"]*)"/) || [, ""])[1]),
  }));
}
