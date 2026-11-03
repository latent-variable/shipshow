// The editing devices a video uses, read from its scenes.html: entrances, pieces (a cued element's own class),
// memes, screenshots, portraits, footage, sound effects, transitions and camera. The review packet lists them beside
// how many of the person's other videos used each, and how each act opens, so `critic-novelty` can see a formula
// instead of guessing at one (the owner, 2026-11-03: "I'm starting to see the patterns"). DESIGN D96.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { REPO } from "./lib.mjs";

const attr = (attrs, name) => attrs.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1];

/** One pass over the page: each element with what it is, the scene and mood it sits in, and whether it is cued. */
function elements(html) {
  const body = html.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "");
  const out = [];
  let scene = null, mood = null;
  for (const m of body.matchAll(/<([a-zA-Z][\w-]*)((?:\s[^>]*)?)>/g)) {
    const [, tag, attrs] = m;
    if (tag.toLowerCase() === "section" && attr(attrs, "data-scene")) {
      scene = attr(attrs, "data-scene");
      mood = attr(attrs, "data-mood") ?? mood;
    }
    out.push({ tag: tag.toLowerCase(), attrs, scene, mood, classes: (attr(attrs, "class") || "").split(/\s+/).filter(Boolean) });
  }
  return out;
}

/** The devices in one page, as a Map from a device's name to how many times it is used. */
export function devicesIn(html) {
  const count = new Map();
  const add = (d) => count.set(d, (count.get(d) || 0) + 1);
  for (const el of elements(html)) {
    const { tag, attrs, classes } = el;
    if (tag === "section" && attr(attrs, "data-scene")) {
      const t = attr(attrs, "data-transition"), c = attr(attrs, "data-camera");
      if (t) add(`transition: ${t}`);
      if (c) add(`camera: ${c}`);
      continue;
    }
    if (classes.includes("ss-meme")) add(attr(attrs, "data-clip") ? "moving meme" : "meme");
    if (classes.includes("ss-shot")) add("screenshot");
    if (classes.includes("ss-portrait")) add("portrait");
    if (classes.includes("ss-footage")) add("footage");
    if (classes.includes("ss-frame")) add("frame");
    if (tag === "pre" || classes.includes("ss-code")) add("code");
    if (attr(attrs, "data-punch")) add("punch-in");
    if (attr(attrs, "data-drop")) add("music drop");
    const sfx = attr(attrs, "data-sfx");
    if (sfx) add(`sound: ${sfx}`);
    if (attr(attrs, "data-cue") !== undefined) {
      add(`entrance: ${attr(attrs, "data-anim") || "the theme's"}`);
      const piece = classes.find((c) => !c.startsWith("ss-"));
      if (piece) add(`piece: ${piece}`);
    }
  }
  for (const m of html.matchAll(/\bsfx\(\s*["'](\w+)["']/g)) add(`sound: ${m[1]}`);
  return count;
}

/** How each act opens: the first cued element of every scene whose mood differs from the scene before it. */
export function actOpenings(html) {
  const firsts = new Map(), moods = new Map(), order = [];
  for (const el of elements(html)) {
    if (!el.scene) continue;
    if (!moods.has(el.scene)) { moods.set(el.scene, el.mood); order.push(el.scene); }
    if (!firsts.has(el.scene) && el.tag !== "section" && attr(el.attrs, "data-cue") !== undefined) firsts.set(el.scene, el);
  }
  const out = [];
  order.forEach((scene, i) => {
    if (i > 0 && moods.get(scene) === moods.get(order[i - 1])) return;
    const el = firsts.get(scene);
    out.push({ scene, mood: moods.get(scene) || null, piece: el?.classes.find((c) => !c.startsWith("ss-")) || el?.classes[0] || null, entrance: el ? attr(el.attrs, "data-anim") || "the theme's" : null });
  });
  return out;
}

/** The person's other videos' devices: a Map from a video folder's name to its device set, across videos/,
 *  local/videos/ and SHIPSHOW_VIDEOS. Only videos made for YouTube (a video.json "youtube") count when there are any,
 *  since those are the ones a viewer sees one after another. */
export function channelDevices(root = REPO) {
  const local = process.env.SHIPSHOW_LOCAL || join(root, "local");
  const more = (process.env.SHIPSHOW_VIDEOS || "").split(":").filter(Boolean);
  const all = new Map(), published = new Map();
  for (const base of [join(root, "videos"), join(local, "videos"), ...more]) {
    if (!existsSync(base)) continue;
    for (const name of readdirSync(base)) {
      const f = join(base, name, "scenes.html");
      if (!existsSync(f)) continue;
      const set = new Set(devicesIn(readFileSync(f, "utf8")).keys());
      all.set(name, set);
      try { if (JSON.parse(readFileSync(join(base, name, "video.json"), "utf8")).youtube) published.set(name, set); } catch { /* no video.json */ }
    }
  }
  return published.size ? published : all;
}

/** Gaps between one change on screen and the next (cue times, seconds): their median, and the share that fall
 *  within a quarter of it, which is how regular the beat is. Cues within 0.3 s of each other count as one change. */
export function changeRhythm(ats) {
  const t = [...ats].sort((a, b) => a - b), gaps = [];
  for (let i = 1; i < t.length; i++) if (t[i] - t[i - 1] >= 0.3) gaps.push(t[i] - t[i - 1]);
  if (!gaps.length) return null;
  const s = [...gaps].sort((a, b) => a - b), median = s[Math.floor(s.length / 2)];
  return { changes: gaps.length + 1, median, regular: gaps.filter((g) => Math.abs(g - median) <= median / 4).length / gaps.length };
}
