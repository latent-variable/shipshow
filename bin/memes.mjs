// Search the memegen catalog for a template to use in a video.
//   node bin/memes.mjs <words> [--refresh] [--limit N] [--json]
// Prints each match's id (what data-meme takes), name, number of text lines, source (the
// knowyourmeme page, to credit in sources.md) and an example of what goes in the lines.
// The catalog is cached (SHIPSHOW_MEMES_CACHE); --refresh fetches it again. bin/meme.mjs has the env vars.
import { die, flag } from "./lib.mjs";
import { catalog, memesUsed, search } from "./meme.mjs";

const argv = process.argv.slice(2);
const refresh = argv.includes("--refresh");
const json = argv.includes("--json");
const limit = +(flag("limit") || 12);
const words = argv.filter((a, i) => !a.startsWith("--") && argv[i - 1] !== "--limit");

let list;
try { list = await catalog({ refresh }); } catch (e) { die(`the memegen catalog: ${e.message} (a cached copy is used when there is one; SHIPSHOW_MEMEGEN_API sets a mirror)`); }
const hits = search(list, words);
if (json) {
  console.log(JSON.stringify(hits.slice(0, limit).map((t) => ({ id: t.id, name: t.name, lines: t.lines, source: t.source, example: t.example?.text || [] })), null, 2));
} else if (!hits.length) {
  console.log(`no template matches "${words.join(" ")}" among ${list.length}; try fewer or other words`);
} else {
  const used = memesUsed();
  for (const t of hits.slice(0, limit)) {
    const ex = (t.example?.text || []).map((x) => `"${x}"`).join(" / ");
    const seen = used.get(t.id);
    console.log(`${t.id}  ${t.name}  (${t.lines} line${t.lines === 1 ? "" : "s"})${seen ? `  · already used in ${[...seen].join(", ")}` : ""}\n    e.g. ${ex}\n    ${t.source}`);
  }
  console.log(`\n${Math.min(limit, hits.length)} of ${hits.length} shown (${list.length} templates). Use <figure class="ss-meme" data-meme="<id>"> with one <span> per line.`);
}
