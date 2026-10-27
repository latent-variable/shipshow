// Resolve named looks at build time; the kit owns their seekable transitions.
import { die, flairCss, themeCss } from "./lib.mjs";

export function cssTokens(css) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const roots = [...clean.matchAll(/(?:^|})\s*(?::root|#root)\s*\{([^}]*)}/g)];
  return Object.fromEntries(roots.flatMap((m) => [...m[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);?/g)].map((x) => [x[1], x[2].trim()])));
}

export function resolveMoods(cfg, timing, src, theme, dir) {
  const sections = new Map([...src.matchAll(/<section([^>]*)>/g)].map((m) => [m[1].match(/data-scene="([^"]+)"/)?.[1], m[1].match(/data-mood="([^"]*)"/)?.[1]]));
  const base = cssTokens(theme + "\n" + flairCss(cfg.flair));
  const schedule = [{ name: null, start: 0, tokens: base }];
  const cache = new Map();
  let fonts = "", current = null;
  for (const scene of timing.scenes) {
    const name = sections.get(scene.id);
    if (name === undefined) continue;
    if (!Object.hasOwn(cfg.moods ?? {}, name)) die(`scene ${scene.id}: unknown data-mood="${name}"`);
    if (name === current) continue;
    current = name;
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
  }
  if (schedule.length === 1) return { moods: [], fonts: "" };
  const keys = new Set(schedule.flatMap((m) => Object.keys(m.tokens)));
  for (const mood of schedule) mood.tokens = Object.fromEntries([...keys].map((key) => [key, mood.tokens[key] ?? base[key] ?? ""]));
  return { moods: schedule, fonts };
}
