// A video's own local recording, played once at its cue and held on its final frame (D77).
import { spawnSync } from "node:child_process";
import { die, round } from "./lib.mjs";
import { encodeClip, localClipFile, videoHtml } from "./meme.mjs";

const attr = (s, name) => s.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1];
const un = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

/** Source video length, not its audio track's length. */
export function footageLength(file) {
  const r = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration:format=duration", "-of", "json", file], { encoding: "utf8" });
  if (r.error?.code === "ENOENT") throw new Error("ffprobe is not installed; npm run doctor says how to get it");
  if (r.status !== 0) throw new Error(`ffprobe could not read footage ${file}`);
  const data = JSON.parse(r.stdout);
  const length = Number(data.streams?.[0]?.duration ?? data.format?.duration);
  if (!(Number.isFinite(length) && length > 0)) throw new Error(`no video length in ${file}`);
  return length;
}

/** Expand footage figures using the same cue clock and seekable video tracks as moving memes. */
export function footageScene(html, dir, scene, { start, end, at }) {
  return html.replace(/<figure([^>]*\bdata-footage="[^"]*"[^>]*)>([\s\S]*?)<\/figure>/g, (_, attrs) => {
    const src = un(attr(attrs, "data-footage"));
    try {
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(src)) throw new Error("a URL is refused; footage must be a local recording");
      const file = localClipFile(src, dir);
      const length = footageLength(file);
      const fromText = attr(attrs, "data-from");
      const from = fromText === undefined ? 0 : Number(fromText);
      if (fromText?.trim() === "" || !Number.isFinite(from) || from < 0 || from >= length) throw new Error(`data-from must be seconds from 0 to less than the file's length (${length} s)`);
      const cue = attr(attrs, "data-cue");
      const begins = cue === undefined ? start : at(cue);
      const window = round(end - begins);
      if (!(window > 0)) throw new Error("the footage cue must be before the scene ends");
      const clip = encodeClip(file, null, window, dir, { hold: true, from });
      const cls = (attr(attrs, "class") || "").split(/\s+/).filter(Boolean);
      if (!cls.includes("ss-footage")) cls.unshift("ss-footage");
      const style = attr(attrs, "style") || "";
      const rest = attrs.replace(/\s*(class|style)="[^"]*"/g, "");
      return `<figure${rest} class="${cls.join(" ")}" data-footage-length="${length}" data-footage-start="${round(begins - start)}" data-footage-hold="${round(Math.max(0, window - (length - from)))}" style="--ar:${clip.w / clip.h};${style}">${videoHtml(clip.file, begins, window, "footage")}</figure>`;
    } catch (e) { die(`scene ${scene}: data-footage="${src}": ${e.message}`); }
  });
}

/** Measurements for critics, kept apart from third-party memes and credits. */
export function footageIn(html) {
  return [...html.matchAll(/<section([^>]*)>([\s\S]*?)<\/section>/g)].flatMap((s) =>
    [...s[2].matchAll(/<figure([^>]*\bdata-footage="[^"]*"[^>]*)>/g)].map((f) => ({
      scene: attr(s[1], "data-scene"), file: un(attr(f[1], "data-footage")),
      length: +attr(f[1], "data-footage-length"), from: +(attr(f[1], "data-from") ?? 0),
      start: +attr(f[1], "data-footage-start"), hold: +attr(f[1], "data-footage-hold"),
    })));
}
