// Find text drawn over other text or over a picture, frame by frame (DESIGN D72).
//   node bin/overlap.mjs videos/<name> [--json]        (after bin/build.mjs)
//
// Critics judge stills, and a still lands where it lands: the owner found three overlaps in a cut the critics passed
// (eth-is-false, 2026-10-28). This loads the built page in headless Chrome, seeks the kit's own timeline to a moment
// after every cue lands and before every scene ends, and measures. Text is measured by its lines (a Range's rects), not
// its element's box, so a wide block beside a narrow one is not an overlap. A pair counts when both are visible (their
// opacity, multiplied up the tree, is at least MIN_OPACITY) and their boxes share at least MIN_SHARE of the smaller one.
// Never counted: an element and its own ancestor or descendant; two things in one figure (a meme's words on its picture,
// a portrait's caption); two things in one SVG (a chart's labels on its lines); anything inside `[data-overlap="ok"]`;
// letters of one word animated one by one; the captions; and anything under a full-frame cover (an act card, a pop meme's scrim: an element painted above it that
// spans most of the frame with a background). Writes review/overlaps.json; prints one OVERLAP line per pair, with when
// it starts and how long it lasts; exits 0 either way: the review packet lists them and the critic judges.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromePath } from "./shot.mjs";

export const MIN_OPACITY = 0.25, MIN_SHARE = 0.12, SETTLE = 0.8;

/** Runs in the page at one time: every visible pair that overlaps, as [a, b, shared px, the scene]. */
function scan({ minOpacity, minShare }) {
  const W = 1920, H = 1080;
  const opacity = (el) => {
    let o = 1;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === "none" || cs.visibility === "hidden") return 0;
      o *= parseFloat(cs.opacity);
      if (o < 0.01) return 0;
    }
    return o;
  };
  const skipped = (el) => el.closest(".caps, [data-overlap='ok'], script, style, #ambient, #overlay, #progress");
  const label = (el) => (el.textContent || el.getAttribute("src") || el.tagName).replace(/\s+/g, " ").trim().slice(0, 60) || el.tagName.toLowerCase();
  const items = [];
  // Text: each element's own text lines.
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const own = new Map();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    if (!el || skipped(el)) continue;
    if (!own.has(el)) own.set(el, []);
    own.get(el).push(n);
  }
  // A text item's lines, measured again on demand: a pair on a tilted card is measured a second time, untilted (below).
  const lines = (nodes) => nodes.flatMap((n) => { const r = document.createRange(); r.selectNodeContents(n); return [...r.getClientRects()].filter((q) => q.width > 2 && q.height > 2); });
  const rectsOf = (it) => (it.nodes ? lines(it.nodes) : [it.el.getBoundingClientRect()]);
  for (const [el, nodes] of own) { const rects = lines(nodes); if (rects.length) items.push({ el, nodes, rects }); }
  // Pictures.
  for (const el of document.querySelectorAll("img, video")) {
    if (skipped(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width > 2 && r.height > 2) items.push({ el, rects: [r] });
  }
  const shown = items.filter((it) => {
    it.o = opacity(it.el);
    if (it.o < minOpacity) return false;
    return it.rects.some((r) => r.right > 0 && r.bottom > 0 && r.left < W && r.top < H);
  });
  // Covered: something above it at its centre spans most of the frame, has a background, and is visible. A cover whose
  // lower edge is masked away (a gradient solid to N%, then fading) hides only what is above N%: the faded edge of a meme's
  // scrim let a line show through the meme (eth-is-false, 2026-10-28). Any other mask hides nothing.
  const covers = (el, y) => {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    if (r.width * r.height < 0.8 * W * H) return false;
    const rgba = (cs.backgroundColor.match(/[\d.]+/g) || []).map(Number);
    const alpha = rgba.length === 4 ? rgba[3] : rgba.length === 3 ? 1 : 0;
    if (!((cs.backgroundImage !== "none" || alpha >= 0.5) && opacity(el) >= 0.5)) return false;
    const mask = cs.maskImage || cs.webkitMaskImage || "none";
    if (mask === "none") return true;
    const solid = mask.match(/^linear-gradient\((?:to bottom, )?(?:rgb\(0, 0, 0\)|black|#000) ([\d.]+)%/);
    return Boolean(solid) && y <= r.top + (+solid[1] / 100) * r.height;
  };
  const visible = shown.filter((it) => {
    const r = it.rects[0], x = Math.min(W - 1, Math.max(0, r.left + r.width / 2)), y = Math.min(H - 1, Math.max(0, r.top + r.height / 2));
    for (const above of document.elementsFromPoint(x, y)) {
      if (above === it.el || above.contains(it.el)) return true;   // reached it (or its own ancestor) first: not covered
      if (!it.el.contains(above) && covers(above, Math.max(...it.rects.map((q) => q.bottom)) - 1)) return false;
    }
    return true;
  });
  const sameGroup = (a, b) => {
    for (const sel of ["figure", "svg"]) { const fa = a.closest(sel); if (fa && fa === b.closest(sel)) return true; }
    return false;
  };
  // The largest shared area of two sets of boxes that is at least minShare of the smaller box, else 0.
  const shared = (ra, rb) => {
    let best = 0;
    for (const x of ra) for (const y of rb) {
      const w = Math.min(x.right, y.right) - Math.max(x.left, y.left), h = Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top);
      if (w < 4 || h < 4) continue;
      if ((w * h) / Math.min(x.width * x.height, y.width * y.height) >= minShare) best = Math.max(best, Math.round(w * h));
    }
    return best;
  };
  // On a tilted card a line's box is its upright bounding box, which grows into the next line though the letters never
  // touch (built-on-shipshow's cards, 2026-10-28; product-videos' paper notes before it). So a pair under a common
  // transformed ancestor is measured with that ancestor's transform and rotate set to none, then restored exactly. A scale
  // or a shift changes nothing by this, since both are measured in the same space; only a rotation's grown boxes go.
  const untilted = (a, b) => {
    let t = null;
    for (let e = a.el.parentElement; e && !t; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (e.contains(b.el) && (cs.transform !== "none" || (cs.rotate && cs.rotate !== "none"))) t = e;
    }
    if (!t) return null;
    const keep = ["transform", "rotate"].map((k) => [k, t.style.getPropertyValue(k), t.style.getPropertyPriority(k)]);
    t.style.setProperty("transform", "none", "important"); t.style.setProperty("rotate", "none", "important");
    try { return shared(rectsOf(a), rectsOf(b)); }
    finally { for (const [k, v, pr] of keep) { if (v) t.style.setProperty(k, v, pr); else t.style.removeProperty(k); } }
  };
  const found = [];
  for (let i = 0; i < visible.length; i++) for (let j = i + 1; j < visible.length; j++) {
    const a = visible[i], b = visible[j];
    if (a.el.contains(b.el) || b.el.contains(a.el) || sameGroup(a.el, b.el)) continue;
    // Letters of one word animated one by one (type, scramble, glitch) sit in sibling spans whose glyph boxes touch.
    if (a.el.parentElement === b.el.parentElement && a.el.textContent.trim().length <= 2 && b.el.textContent.trim().length <= 2) continue;
    let best = shared(a.rects, b.rects);
    if (best) { const f = untilted(a, b); if (f !== null) best = f; }
    if (best) {
      const scene = (a.el.closest("[data-scene]") || b.el.closest("[data-scene]"))?.dataset.scene ?? "";
      found.push([label(a.el), label(b.el), best, scene]);
    }
  }
  return found;
}

/** Every overlap in the built video at `dir`, merged across consecutive sample times: [{scene, a, b, from, to, px}]. */
export async function overlaps(dir) {
  const root = resolve(dir);
  const timing = JSON.parse(readFileSync(join(root, "timing.json"), "utf8"));
  const html = readFileSync(join(root, "index.html"), "utf8");
  const cues = [...html.matchAll(/data-at="([\d.]+)"/g)].map((m) => +m[1]);
  const times = [...cues.map((t) => t + SETTLE), ...timing.scenes.map((s) => s.start + s.duration - 0.4)]
    .filter((t) => t > 0 && t < timing.total).map((t) => Math.round(t * 100) / 100).sort((a, b) => a - b)
    .filter((t, i, a) => i === 0 || t - a[i - 1] >= 0.1);
  const { default: puppeteer } = await import("puppeteer-core");
  const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ["--hide-scrollbars", "--mute-audio"] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(pathToFileURL(join(root, "index.html")).href, { waitUntil: "load", timeout: 120000 });
    // The kit builds its timeline synchronously as the page loads.
    if (!(await page.evaluate(() => Boolean(window.__timelines?.main)))) throw new Error(`the page made no timeline${errors.length ? ": " + errors.join("; ") : ""}`);
    // Fonts change where text wraps; wait for them, but never forever (a missing face leaves fonts.ready pending).
    await page.evaluate(() => Promise.race([document.fonts.ready, new Promise((ok) => setTimeout(ok, 10000))]).then(() => { window.__timelines.main.pause(); }));
    const open = new Map(), done = [];
    for (const t of times) {
      await page.evaluate((t) => { window.__timelines.main.seek(t, false); }, t);   // braces: a returned timeline would be serialized, and hangs
      const found = await page.evaluate(scan, { minOpacity: MIN_OPACITY, minShare: MIN_SHARE });
      const now = new Set();
      for (const [a, b, px, scene] of found) {
        const key = `${scene}\u0000${a}\u0000${b}`;
        now.add(key);
        const o = open.get(key);
        if (o) { o.to = t; o.px = Math.max(o.px, px); } else open.set(key, { scene, a, b, from: t, to: t, px });
      }
      for (const [key, o] of open) if (!now.has(key)) { done.push(o); open.delete(key); }
    }
    done.push(...open.values());
    return done.sort((x, y) => x.from - y.from);
  } finally {
    await browser.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = process.argv[2];
  if (!dir || !existsSync(join(dir, "index.html"))) { console.error("usage: node bin/overlap.mjs videos/<name> [--json]   (build it first)"); process.exit(2); }
  const found = await overlaps(dir);
  mkdirSync(join(dir, "review"), { recursive: true });
  writeFileSync(join(dir, "review", "overlaps.json"), JSON.stringify(found, null, 2) + "\n");
  if (process.argv.includes("--json")) console.log(JSON.stringify(found, null, 2));
  else {
    for (const o of found) console.log(`OVERLAP ${o.from.toFixed(1)} s (${(o.to - o.from).toFixed(1)} s) ${o.scene}: "${o.a}" and "${o.b}", ${o.px} px²`);
    console.log(`${found.length} overlap(s) -> ${join(dir, "review", "overlaps.json")}`);
  }
}
