// The two measurements the review packet makes about on-screen time, kept here so they can be tested.
//   readingSeconds(text)       how long a viewer needs to read a piece of on-screen text while listening
//   stillStretches(scene, ats) the longest stretch of a scene in which nothing new appears
// Prose is read at 3.3 words a second. Code is counted in identifier tokens (`Author.followers.of_type`
// is four: an underscore splits one), because it is harder to read than the same number of words, at 1.5 tokens a second.
export const READ_WPS = 3.3;
export const READ_CODE_TPS = 1.5;

const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu;
// Letters and digits in any script; a CJK character is read as a word of its own.
// A hyphen joins two spoken words ("eighty-one" is said as two), so it does not join one here.
export const words = (s) => (s.replace(CJK, " x ").match(/[\p{L}\p{N}][\p{L}\p{N}_'.]*/gu) || []).length;
export const tokens = (s) => (s.replace(CJK, " x ").match(/[\p{L}\p{N}]+/gu) || []).length;
// Parentheses alone do not make code (prose has them); a call, a brace, an operator, an underscore or a dotted name does.
export const looksLikeCode = (s) => /[{}=<>_\[\]]|[\p{L}\p{N}_]\(|[\p{L}\p{N}_]{2,}\.[\p{L}_(]{2,}|(?:^|\s)--?[A-Za-z][\w-]*|^\s*\$ /u.test(s);

export function readingSeconds(text) {
  return looksLikeCode(text) ? tokens(text) / READ_CODE_TPS : words(text) / READ_WPS;
}

/** The longest gap between things appearing in a scene: its start, each cue's time, its end. */
export function stillStretches(scene, cueTimes) {
  if (![scene.start, scene.duration, ...cueTimes].every(Number.isFinite) || scene.duration <= 0) throw new Error(`stillStretches: a scene needs a finite start and a positive duration (got ${scene.start}, ${scene.duration})`);
  const end = scene.start + scene.duration;
  const points = [scene.start, ...cueTimes.filter((t) => t > scene.start && t < end).sort((a, b) => a - b), end];
  let best = { seconds: 0, from: scene.start, to: end };
  for (let i = 1; i < points.length; i++) {
    const seconds = points[i] - points[i - 1];
    if (seconds > best.seconds) best = { seconds, from: points[i - 1], to: points[i] };
  }
  return best;
}

/**
 * A viewer reads in the order things appear and cannot read two things at once. Given the elements of one
 * scene as [{ at, text }] and the scene's end, return when each is read by: it starts when it lands or when
 * the viewer finishes the one before, whichever is later, and takes its reading time. `late` means the
 * viewer cannot finish it before the scene ends. Text that lands together queues, so three paragraphs on one
 * cue are not each judged as if they stood alone.
 */
export function readingQueue(items, sceneEnd) {
  if (!Number.isFinite(sceneEnd)) throw new Error("readingQueue: the scene end must be a finite number");
  for (const it of items) if (!Number.isFinite(it.at) || typeof it.text !== "string") throw new Error(`readingQueue: each element needs a finite \`at\` and a string \`text\` (got ${JSON.stringify({ at: it.at, text: typeof it.text })})`);
  let done = -Infinity;
  return [...items].sort((a, b) => a.at - b.at).map((it) => {
    const need = readingSeconds(it.text);
    done = Math.max(done, it.at) + need;
    return { ...it, need, readBy: done, late: done > sceneEnd + 1e-9 };
  });
}

// How long an entrance takes to finish, so a still taken "after the cue" is of the finished state: a number that
// counts up, a pulse and typing run past the default settle time (kit/kit.js).
const DEFAULT_SETTLE = 0.8;
const ENTRANCE_SETTLE = { count: 1.4, pulse: 1.4, type: 1.4 };
export const settleFor = (anim) => ENTRANCE_SETTLE[anim] ?? DEFAULT_SETTLE;

/**
 * The text a cue adds for the viewer to read. A highlight marks text already shown, and an element whose text is
 * part of an earlier cued element in the same scene (a line cued inside a code block that has already landed) is
 * already counted there: neither is new reading. The same text twice is one read when one element holds the other
 * (`span`, where each sits in the page): a meme's backdrop and its figure cued together (#62). Two separate elements
 * that say the same thing are each read.
 */
export function newReadingText(cue, earlierInScene) {
  if (cue.anim === "highlight") return "";
  const nested = (a, b) => a?.span && b?.span && ((a.span[0] <= b.span[0] && b.span[1] <= a.span[1]) || (b.span[0] <= a.span[0] && a.span[1] <= b.span[1]));
  if (cue.text && earlierInScene.some((e) => e.text.includes(cue.text) && (e.text !== cue.text || nested(e, cue)))) return "";
  return cue.text;
}

/** The sound effects as the review packet lists them: one row per sound with its time and scene,
 *  what is being said, its level against the voice, how long it is audible, and how close the next
 *  sentence's first word is. `record` is a video's assets/sfx.json. A critic judges the rows. */
export function soundRows(record, timing) {
  const r2 = (x) => Math.round(x * 100) / 100;
  const sentences = timing.scenes.flatMap((sc) => sc.sentences);
  return (record.events ?? []).map((e) => {
    const saying = sentences.find((x) => e.t >= x.start && e.t < x.start + x.duration);
    const next = sentences.find((x) => x.start > e.t);
    const to = e.audible?.[1] ?? e.t;
    const flags = [];
    if (next && next.start - to < 0.3) flags.push(`ends ${r2(next.start - to)} s before a sentence starts`);
    return [e.t, e.scene, e.name, e.label.length > 50 ? `${e.label.slice(0, 47)}...` : e.label, saying ? saying.text.slice(0, 60) : "(between sentences)",
      e.level === undefined ? "" : `${e.level} LUFS (${r2(e.level - record.reference)} vs voice)`, e.audible ? `${e.audible[0]} to ${e.audible[1]} s` : "", flags.join("; ")];
  });
}
