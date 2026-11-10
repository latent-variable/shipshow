// Resolve named looks at build time; the kit owns their seekable transitions.
import { die, flairCss, themeCss } from "./lib.mjs";

export function cssTokens(css) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const roots = [...clean.matchAll(/(?:^|})\s*(?::root|#root)\s*\{([^}]*)}/g)];
  return Object.fromEntries(roots.flatMap((m) => [...m[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);?/g)].map((x) => [x[1], x[2].trim()])));
}

export const MOOD_BEAT = 1.2;   // seconds between a mood's start and its first word, below which the change is rushed

/** The one copy of the section-to-mood rule: [{name, scene, start}] for each scene where the mood named by its
 *  section's data-mood changes, in time order (a scene with no data-mood keeps the mood before it). Pure: the
 *  build's resolver and the review packet's Moods table both read this (D101). Stops on an unknown name. */
export function moodSchedule(cfg, timing, src) {
  const sections = new Map([...src.matchAll(/<section([^>]*)>/g)].map((m) => [m[1].match(/data-scene="([^"]+)"/)?.[1], m[1].match(/data-mood="([^"]*)"/)?.[1]]));
  const out = [];
  let current = null;
  for (const scene of timing.scenes) {
    const name = sections.get(scene.id);
    if (name === undefined) continue;
    if (!Object.hasOwn(cfg.moods ?? {}, name)) die(`scene ${scene.id}: unknown data-mood="${name}"`);
    if (name === current) continue;
    current = name;
    out.push({ name, scene: scene.id, start: scene.start });
  }
  return out;
}

/** The packet's Moods table rows, from that schedule: [mood, scenes, starts, theme, look overrides, ambient, music].
 *  A video whose first scene names no mood opens on its own look, which is a row of its own. */
export function moodRows(cfg, timing, src) {
  const sched = moodSchedule(cfg, timing, src);
  const first = timing.scenes[0];
  if (!sched.length || sched[0].start > first.start) sched.unshift({ name: null, scene: first.id, start: first.start });
  const music = (m) => (m ? (typeof m === "string" ? m : m.file) : "").split("/").pop();
  return sched.map((m, i) => {
    const last = i + 1 < sched.length ? timing.scenes[timing.scenes.findIndex((s) => s.id === sched[i + 1].scene) - 1] : timing.scenes.at(-1);
    const spec = m.name ? cfg.moods[m.name] : null;
    return [m.name ?? "(the video's own)", `${m.scene} to ${last.id}`, `${Math.round(m.start * 100) / 100}`, (spec ? spec.theme : null) ?? cfg.theme ?? "", spec ? Object.keys(spec.look ?? {}).join(", ") : "", (spec ? spec.ambient : null) ?? "base", music(spec ? spec.music : cfg.music) || "(previous)"];
  });
}

export function resolveMoods(cfg, timing, src, theme, dir) {
  const base = cssTokens(theme + "\n" + flairCss(cfg.flair));
  const schedule = [{ name: null, start: 0, tokens: base }];
  const cache = new Map();
  let fonts = "";
  const warnings = [];
  for (const { name, scene: id } of moodSchedule(cfg, timing, src)) {
    const scene = timing.scenes.find((x) => x.id === id);
    const spec = cfg.moods[name];
    if (!cache.has(name)) {
      const css = spec.theme ? themeCss(spec.theme, dir, spec.theme) : "";
      fonts += [...css.matchAll(/@font-face\s*\{[^}]*}/g)].map((m) => m[0]).join("\n");
      const themeTokens = cssTokens(css);
      // A sky belongs to its look, rather than leaking from the base theme.
      if (spec.theme && !Object.hasOwn(themeTokens, "--sky")) themeTokens["--sky"] = spec.look?.["--bg"] ?? themeTokens["--bg"] ?? base["--bg"];
      const tokens = { ...base, ...themeTokens, ...spec.look };
      if (spec.ambient !== undefined) flairCss({ ambient: spec.ambient });
      cache.set(name, { tokens, ambient: spec.ambient, music: spec.music });
    }
    schedule.push({ name, start: scene.start, ...cache.get(name) });
    // A new act is felt before it is heard: its look and music need a beat alone before the voice (owner, 2026-10-27).
    const first = scene.sentences?.[0]?.start;
    if (scene.start > 0 && first !== undefined && first - scene.start < MOOD_BEAT) {
      warnings.push(`scene ${scene.id} starts mood "${name}" ${(first - scene.start).toFixed(1)} s before its first word: give the change a beat of ${MOOD_BEAT} s or more (video.json "leads": {"${scene.id}": 1.5})`);
    }
  }
  if (schedule.length === 1) return { moods: [], fonts: "", warnings };
  const keys = new Set(schedule.flatMap((m) => Object.keys(m.tokens)));
  for (const mood of schedule) mood.tokens = Object.fromEntries([...keys].map((key) => [key, mood.tokens[key] ?? base[key] ?? ""]));
  return { moods: schedule, fonts, warnings };
}
