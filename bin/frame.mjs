// Lift only top-level frame blocks, preserving their markup and source order.
// Tokenise tags so nested divs, comments, quoted > signs and raw style/script bodies do not end a block.
const TAGS = /<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>|<\/?[a-zA-Z][\w:-]*(?:"[^"]*"|'[^']*'|[^'">])*>/gi;
const VOID = new Set("area base br col embed hr img input link meta param source track wbr".split(" "));

export function liftFrames(src, resolveCue) {
  const frames = [], stack = [];
  let begin = null, copied = 0, scenes = "";
  for (const m of src.matchAll(TAGS)) {
    const tag = m[0];
    if (/^<!--|^<(script|style)\b/i.test(tag)) continue;
    const name = tag.match(/^<\/?([\w:-]+)/)[1].toLowerCase();
    if (tag.startsWith("</")) {
      stack.pop();
    } else {
      const cls = tag.match(/\bclass\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
      if (!stack.length && (cls?.[1] ?? cls?.[2] ?? "").split(/\s+/).includes("ss-frame")) begin = m.index;
      if (!VOID.has(name) && !/\/\s*>$/.test(tag)) stack.push(name);
    }
    if (begin !== null && !stack.length) {
      scenes += src.slice(copied, begin);
      const end = m.index + tag.length;
      const block = src.slice(begin, end).replace(TAGS, (opening) => {
        if (/^<!--|^<\/|^<(script|style)\b/i.test(opening)) return opening;
        return opening.replace(/\bdata-(cue|leave)\s*=\s*(?:"([^"]*)"|'([^']*)')/g, (attr, kind, dq, sq) => {
          const cue = dq ?? sq;
          return `${attr} data-${kind === "cue" ? "at" : "leave-at"}="${resolveCue(cue, `frame element ${opening}`, kind)}"`;
        });
      });
      frames.push(block);
      copied = end;
      begin = null;
    }
  }
  if (begin !== null) throw new Error("scenes.html has an unclosed top-level ss-frame");
  return { scenes: scenes + src.slice(copied), frames: frames.join("\n") };
}
