#!/usr/bin/env node
// The upload folder for a finished video: the render, a thumbnail and everything YouTube Studio asks for.
//
//   node bin/package.mjs videos/<name> [--to <folder>]
//
// Reads video.json "youtube" (title, description, chapters by scene, tags, studio answers, extra credits), timing.json
// (where each chapter starts), review/credits.txt (the photos and pages to credit, written by `npm run review`) and
// thumbnail.html beside the video (set at 1280 by 720 in headless Chrome). Writes, into out/publish/<name>/ or --to:
//   <name>.mp4                the render, copied from out/
//   <name>-thumbnail.png      thumbnail.html, rendered
//   <name>-youtube.txt        title, description with chapters and credits, tags, and Studio's questions
// The rules YouTube enforces are checked before anything is written (youtubeProblems), so a folder never holds a
// description Studio would refuse or chapters it would ignore. Copies only: nothing is moved or deleted.
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { REPO, config, die, flag, outName, videoDir } from "./lib.mjs";

/** "m:ss" (or "h:mm:ss") for a time in seconds, as YouTube writes a chapter. */
export function stamp(seconds) {
  const s = Math.floor(seconds), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${r}` : `${m}:${r}`;
}

/** Chapters from video.json's {"<scene>": "title"} and timing.json's scene starts, in time order. */
export function chapters(timing, byScene = {}) {
  const starts = Object.fromEntries(timing.scenes.map((s) => [s.id, s.start]));
  for (const id of Object.keys(byScene)) if (!(id in starts)) die(`youtube.chapters names scene ${id}, which the video does not have`);
  return Object.entries(byScene).map(([id, title]) => ({ at: starts[id], title })).sort((a, b) => a.at - b.at);
}

/** What YouTube would refuse or ignore: a title over 100 characters or with < or >, a description over 5000, and
 *  chapters that do not start at 0:00, number fewer than three or last under ten seconds (YouTube then shows none). */
export function youtubeProblems({ title, description, chapters: ch, total }) {
  const out = [];
  if (!title) out.push("no title");
  else if (title.length > 100) out.push(`the title is ${title.length} characters; YouTube takes 100`);
  if (/[<>]/.test(title || "") || /[<>]/.test(description || "")) out.push("YouTube refuses < and > in a title or description");
  if ((description || "").length > 5000) out.push(`the description is ${description.length} characters; YouTube takes 5000`);
  if (ch.length) {
    if (Math.floor(ch[0].at) !== 0) out.push(`the first chapter starts at ${stamp(ch[0].at)}; YouTube needs one at 0:00`);
    if (ch.length < 3) out.push(`${ch.length} chapters; YouTube shows chapters only when there are three or more`);
    ch.forEach((c, i) => {
      const end = i + 1 < ch.length ? ch[i + 1].at : total;
      if (end - c.at < 10) out.push(`chapter "${c.title}" lasts ${(end - c.at).toFixed(1)} s; YouTube needs ten or more`);
    });
  }
  return out;
}

/** The description as pasted into Studio: the text, the chapters, sources, then credits. */
/** A clone or an invented voice is credited by name: `sources.md` must name the voice `video.json` uses, so credits written
 *  for an earlier voice are caught (eth-is-false's still named its first narrator after the third cut replaced it,
 *  2026-10-28). Kokoro's voices and OmniVoice's built-in ones are exempt. Returns the problem, or null. */
export function voiceCreditProblem(cfg, sourcesText, builtIn) {
  const engine = cfg.engine || "kokoro";
  if (engine === "kokoro" || !cfg.voice || cfg.voice in builtIn) return null;
  // A name is a whole name: "lino" is not mentioned by "lino-long".
  if (new RegExp(`(?<![\\w-])${cfg.voice.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w-])`).test(sourcesText)) return null;
  return `sources.md never names the voice "${cfg.voice}" that video.json uses: say what it is (a clone, or an invented voice and how it was made), so the credits match the narration`;
}

export function descriptionText(yt, ch, credits) {
  const parts = [[].concat(yt.description || []).join("\n\n")];
  if (ch.length) parts.push(ch.map((c) => `${stamp(c.at)} ${c.title}`).join("\n"));
  if (yt.sources?.length) parts.push(["Sources", ...yt.sources].join("\n"));
  const lines = [...(yt.credits || []), ...credits];
  if (lines.length) parts.push(["Credits", ...lines].join("\n"));
  return parts.filter(Boolean).join("\n\n");
}

const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname);
if (isMain) {
  const dir = videoDir(process.argv[2]);
  const cfg = config(dir);
  const yt = cfg.youtube;
  if (!yt) die(`${dir}/video.json has no "youtube": give it a title, a description and chapters (explainer-video, *Publish*)`);
  const name = outName(dir);
  const render = join(REPO, "out", `${name}.mp4`);
  if (!existsSync(render)) die(`no render at ${render}: npm run render -- ${process.argv[2]}`);
  const timingFile = join(dir, "timing.json");
  if (!existsSync(timingFile)) die(`no timing.json in ${dir}: npm run voice -- ${process.argv[2]}`);
  const timing = JSON.parse(readFileSync(timingFile, "utf8"));
  if (statSync(timingFile).mtimeMs > statSync(render).mtimeMs) die(`the render is older than the timing: render again before packaging`);
  const ch = chapters(timing, yt.chapters);
  const creditsFile = join(dir, "review", "credits.txt");
  const credits = existsSync(creditsFile) ? readFileSync(creditsFile, "utf8").split("\n").map((l) => l.trim()).filter(Boolean) : [];
  const description = descriptionText(yt, ch, credits);
  const problems = youtubeProblems({ title: yt.title, description, chapters: ch, total: timing.total });
  if (problems.length) die(`not packaged, YouTube would refuse or ignore it:\n  ${problems.join("\n  ")}`);
  const builtIn = JSON.parse(readFileSync(join(REPO, "bin", "omnivoice-voices.json"), "utf8")).builtIn;
  const voiceProblem = voiceCreditProblem(cfg, existsSync(join(dir, "sources.md")) ? readFileSync(join(dir, "sources.md"), "utf8") : "", builtIn);
  if (voiceProblem) die(`not packaged: ${voiceProblem}`);
  const thumbHtml = join(dir, "thumbnail.html");
  if (!existsSync(thumbHtml)) die(`no thumbnail.html in ${dir}: a 1280 by 720 page (explainer-video, *Publish*)`);

  const to = resolve(flag("to") || join(REPO, "out", "publish", name));
  mkdirSync(to, { recursive: true });
  const thumb = join(to, `${name}-thumbnail.png`);
  const { chromePath } = await import("./shot.mjs");
  const { default: puppeteer } = await import("puppeteer-core");
  const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ["--hide-scrollbars", "--allow-file-access-from-files"] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(thumbHtml).href, { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: thumb, clip: { x: 0, y: 0, width: 1280, height: 720 } });
  } finally {
    await browser.close();
  }
  copyFileSync(render, join(to, `${name}.mp4`));

  const length = stamp(timing.total);
  const studio = Object.entries(yt.studio || {}).map(([k, v]) => `  ${k}: ${v}`);
  const txt = [
    name,
    "",
    `Video rendered:    ${new Date(statSync(render).mtimeMs).toLocaleDateString("en-CA")}`,
    `Length:            ${length}`,
    "",
    "Files in this folder",
    `  ${name}.mp4            the video to upload`,
    `  ${basename(thumb)}  its thumbnail`,
    "",
    ...(studio.length ? ["What Studio asks", ...studio, ""] : []),
    "TITLE",
    "",
    yt.title,
    ...(yt.alternatives?.length ? ["", "Other titles considered", ...yt.alternatives.map((t) => `  ${t}`)] : []),
    "",
    "DESCRIPTION",
    "",
    description,
    "",
    ...(yt.tags?.length ? ["TAGS", "", yt.tags.join(", "), ""] : []),
  ].join("\n");
  writeFileSync(join(to, `${name}-youtube.txt`), txt);
  console.log(`${to}\n  ${name}.mp4, ${basename(thumb)}, ${name}-youtube.txt (${ch.length} chapters, description ${description.length} characters)`);
}
