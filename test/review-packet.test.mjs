// Pieces of bin/review.mjs that are pure enough to test without Chrome (D101).
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { REPO, round } from "../bin/lib.mjs";
import { moodRows, moodSchedule } from "../bin/moods.mjs";
import { duplicateStills, moveAside } from "../bin/measure.mjs";
import { shotsIn } from "../bin/shot.mjs";

// The walk bin/review.mjs had before the schedule was shared, kept here as the reference the table must still match.
function oldRows(cfg, timing, src) {
  const named = new Map([...src.matchAll(/<section([^>]*)>/g)].map((m) => [m[1].match(/data-scene="([^"]+)"/)?.[1], m[1].match(/data-mood="([^"]*)"/)?.[1]]));
  const music = (m) => (m ? (typeof m === "string" ? m : m.file) : "").split("/").pop();
  const rows = [];
  let current = null, first = timing.scenes[0];
  const flush = (end) => current !== undefined && rows.push([current ?? "(the video's own)", `${first.id} to ${end.id}`, `${round(first.start)}`, (current ? cfg.moods[current]?.theme : null) ?? cfg.theme ?? "", current ? Object.keys(cfg.moods[current]?.look ?? {}).join(", ") : "", (current ? cfg.moods[current]?.ambient : null) ?? "base", music(current ? cfg.moods[current]?.music : cfg.music) || "(previous)"]);
  let prev = first;
  for (const s of timing.scenes) {
    const name = named.get(s.id);
    if (name !== undefined && name !== current) { if (s !== timing.scenes[0]) flush(prev); current = name; first = s; }
    prev = s;
  }
  flush(prev);
  return rows;
}
const timingOf = (ids) => ({ total: ids.length * 7.3, scenes: ids.map((id, i) => ({ id, start: round(i * 7.3), duration: 7.3, sentences: [] })) });
const section = (id, mood) => `<section data-scene="${id}"${mood === undefined ? "" : ` data-mood="${mood}"`}></section>`;

test("the packet's Moods table is what the old duplicate walk made, on synthetic cases", () => {
  const cfg = { theme: "shipshow", music: "m/base.wav", moods: { a: { theme: "paper", look: { "--accent": "#fff" }, music: { file: "x/a.wav" } }, b: { ambient: "stars" } } };
  const ids = ["s0", "s1", "s2", "s3", "s4", "s5"];
  for (const marks of [[undefined, "a", undefined, "b", undefined, "a"], ["a", undefined, "b", "b", "a", undefined], [undefined, undefined, undefined, undefined, undefined, undefined], ["a", "a", "a", "a", "a", "a"], ["b", undefined, undefined, undefined, undefined, undefined]]) {
    const src = ids.map((id, i) => section(id, marks[i])).join("");
    assert.deepEqual(moodRows(cfg, timingOf(ids), src), oldRows(cfg, timingOf(ids), src), JSON.stringify(marks));
  }
});

test("the Moods table is unchanged on the real mood videos (their scenes.html and video.json)", () => {
  let checked = 0;
  for (const name of ["binance-heist", "weight-space", "never-about-the-code"]) {
    const dir = join(REPO, "videos", name);
    if (!existsSync(join(dir, "scenes.html"))) continue;
    const src = readFileSync(join(dir, "scenes.html"), "utf8"), cfg = JSON.parse(readFileSync(join(dir, "video.json"), "utf8"));
    const ids = [...src.matchAll(/<section[^>]*data-scene="([^"]+)"/g)].map((m) => m[1]);
    const timing = timingOf(ids);
    const rows = moodRows(cfg, timing, src);
    assert.deepEqual(rows, oldRows(cfg, timing, src), name);
    assert.ok(rows.length >= 2, `${name} has more than one mood row`);
    checked++;
  }
  assert.ok(checked >= 1);
});

test("moodSchedule is the one walk: it keeps a returning mood", () => {
  const cfg = { moods: { a: {}, b: {} } };
  const t = timingOf(["s0", "s1", "s2"]);
  assert.deepEqual(moodSchedule(cfg, t, section("s0", "a") + section("s1", "b") + section("s2", "a")).map((m) => m.name), ["a", "b", "a"]);
});

test("identical stills in different scenes are reported, a held frame inside one scene is not", () => {
  assert.deepEqual(duplicateStills([{ file: "a", scene: "s1", hash: "h" }, { file: "b", scene: "s1", hash: "h" }, { file: "c", scene: "s2", hash: "g" }]), []);
  const d = duplicateStills([{ file: "a", scene: "s1", hash: "h" }, { file: "b", scene: "s3", hash: "h" }, { file: "c", scene: "s5", hash: "h" }, { file: "d", scene: "s2", hash: "g" }]);
  assert.deepEqual(d, [{ hash: "h", files: ["a", "b", "c"] }]);
});

test("moveAside moves a folder under a stamp, never overwrites one, and does nothing when there is none", () => {
  const root = mkdtempSync(join(tmpdir(), "shipshow-aside-"));
  assert.equal(moveAside(join(root, "none"), join(root, "stale"), "t"), null);
  for (let i = 0; i < 2; i++) {
    mkdirSync(join(root, "frames"));
    writeFileSync(join(root, "frames", "frame-00-at-1s.png"), `old${i}`);
    moveAside(join(root, "frames"), join(root, "stale"), "t");
  }
  assert.equal(existsSync(join(root, "frames")), false);
  assert.deepEqual(readdirSync(join(root, "stale")).sort(), ["t", "t-2"]);
  assert.equal(readFileSync(join(root, "stale", "t", "frame-00-at-1s.png"), "utf8"), "old0");
});

test("shotsIn names each screenshot's capture file from its picture", () => {
  const html = '<figure data-shot="https://x.test/a" class="ss-shot" data-shot-url="https://x.test/a" data-shot-taken="2026-11-01" data-shot-marked="yes" data-find="hi"><div><img src="assets/shots/abc123.png" /></div></figure>';
  assert.equal(shotsIn(html)[0].key, "abc123");
});
