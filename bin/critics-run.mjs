// Run a video's critics on Codex: `npm run critics -- <folder> --run` (DESIGN D108, issue #159).
// One fresh, read-only Codex agent per critic, in parallel, each from its own new empty folder, every contact sheet
// attached as its own `-i`, the brief on stdin. Each critic's JSON goes to review/round-<n>/<critic>.json.
//
// The agent is started with an argv array from node, never a shell string: a hand-rolled zsh launcher built the `-i`
// list in a variable, zsh does not split an unquoted variable, and all 16 sheets reached every critic as one bogus
// filename, so no critic saw a frame (the issue's evidence).
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { REPO, die, localDir } from "./lib.mjs";

export const DEFAULT_MODEL = "gpt-6-luna";
const TIMEOUT_MS = 30 * 60 * 1000;

/** The model slugs this Codex knows, from its models cache, or null when there is no cache to check against. */
export function codexModels(env = process.env) {
  const file = join(env.CODEX_HOME || join(homedir(), ".codex"), "models_cache.json");
  try { return JSON.parse(readFileSync(file, "utf8")).models.map((m) => m.slug); } catch { return null; }
}

/** The brief a critic gets: skills/critic-loop/SKILL.md's *The brief* template and *What a critic returns* section, read
 *  from the file so there is one copy, with the placeholders filled and every path made absolute (the critic runs in an
 *  empty folder outside the repo). */
export function buildBrief({ critic, skillPath, dir, round, changed, code, sheets }) {
  const loop = readFileSync(join(REPO, "skills", "critic-loop", "SKILL.md"), "utf8");
  const template = loop.match(/## The brief\n[\s\S]*?```\n([\s\S]*?)```/)?.[1];
  const returns = loop.match(/## What a critic returns\n([\s\S]*?)\nSave each one as/)?.[1];
  if (!template || !returns) die("skills/critic-loop/SKILL.md no longer has a *The brief* template and a *What a critic returns* section in the shape bin/critics-run.mjs reads");
  const local = localDir();
  let brief = template
    .replace(/skills\/<critic>\/SKILL\.md;? ?(`shipshow:<critic>` in the plugin)?/, skillPath)
    .replace(/<video dir> \([^)]*\)/, dir)
    .replace(/<video dir>/g, dir)
    .replace(/local\/preferences\.md, local\/critics\.md \(repo root\)/, `${join(local, "preferences.md")}, ${join(local, "critics.md")}`)
    .replace(/^ *code at pin:.*\n/m, code ? `  code at pin: ${code}   the code base at the pin, a throwaway copy\n` : "");
  const left = brief.match(/<[a-z ]+>/g);
  if (left) die(`the critic brief still has ${[...new Set(left)].join(", ")} after filling it: skills/critic-loop/SKILL.md's template changed shape`);
  const head = [
    `Round ${round} of the critic loop. Your critic: ${critic}. Put "critic": "${critic}" and "round": ${round} in your JSON.`,
    `You run read-only in an empty folder outside the repo, so every path below is absolute. The repo root is ${REPO}.`,
    `Your critic skill is ${skillPath}: read it first.`,
    `The ${sheets} contact sheet${sheets === 1 ? " is" : "s are"} attached to this message as images; the full frames are in ${join(dir, "review", "frames")}.`,
  ];
  if (changed) head.push(`This is a re-run. Judge what changed, not the whole video: ${changed}`);
  return `${head.join("\n")}\n\n${brief.trim()}\n\nThe JSON you return:\n${returns.trim()}\n`;
}

/** The JSON object in a critic's output: the whole text, a fenced block, or the span from the first "{" to the last "}". */
export function extractJson(text) {
  const tries = [text.trim(), text.match(/```(?:json)?\s*\n([\s\S]*?)```/)?.[1], text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)];
  for (const t of tries) {
    if (!t) continue;
    try { const v = JSON.parse(t); if (v && typeof v === "object" && !Array.isArray(v)) return v; } catch { /* next */ }
  }
  return null;
}

/** Why a critic's JSON cannot be trusted as its verdict, or null. A truncated or free-form answer must not count as a pass:
 *  the verdict is pass or fail, `findings` is a list whose severities are known, and a pass carries no blocking or major one. */
export function verdictProblem(json, critic) {
  if (!["pass", "fail"].includes(json.verdict)) return "its JSON has no pass or fail verdict";
  if (json.critic && json.critic !== critic) return `its JSON is for ${json.critic}`;
  if (!Array.isArray(json.findings)) return "its JSON has no findings list";
  if (json.findings.some((f) => !f || !["blocking", "major", "minor"].includes(f.severity))) return "a finding has no blocking, major or minor severity";
  if (json.verdict === "pass" && json.findings.some((f) => f.severity !== "minor")) return "it says pass with a blocking or major finding";
  return null;
}

function skillFor(critic) {
  return [join(REPO, "skills", critic, "SKILL.md"), join(localDir(), "skills", critic, "SKILL.md")].find(existsSync);
}

function runOne({ critic, model, round, dir, sheets, brief }) {
  const cwd = mkdtempSync(join(tmpdir(), `shipshow-${critic}-`));   // new and empty, one per critic
  const args = ["exec", "--skip-git-repo-check", "--sandbox", "read-only", "-m", model, "-c", "model_reasoning_effort=medium", ...sheets.flatMap((s) => ["-i", s])];
  return new Promise((done) => {
    const child = spawn("codex", args, { cwd, stdio: ["pipe", "pipe", "pipe"] });
    let out = "", err = "";
    const timer = setTimeout(() => { err += `\ntimed out after ${TIMEOUT_MS / 60000} minutes`; child.kill(); }, TIMEOUT_MS);
    child.stdout.on("data", (d) => { out += d; });
    child.stderr.on("data", (d) => { err += d; });
    child.on("error", (e) => { clearTimeout(timer); done({ critic, ok: false, why: `could not start codex: ${e.message}`, out, err }); });
    child.on("close", (code) => {
      clearTimeout(timer);
      const outDir = join(dir, "review", `round-${round}`);
      mkdirSync(outDir, { recursive: true });
      const json = extractJson(out);
      const bad = code !== 0 ? `codex exited ${code}` : !json ? "no JSON object in its output" : verdictProblem(json, critic);
      if (bad) {
        const raw = join(outDir, `${critic}.raw.txt`);
        writeFileSync(raw, `${out}${err ? `\n--- stderr ---\n${err}` : ""}`);
        return done({ critic, ok: false, why: `${bad}; raw output in ${raw}` });
      }
      const file = join(outDir, `${critic}.json`);
      writeFileSync(file, JSON.stringify(json, null, 2) + "\n");
      done({ critic, ok: true, file, json });
    });
    child.stdin.on("error", () => {});
    child.stdin.end(brief);
  });
}

/** Run the critics, print one verdict line each, and return the results. `critics`: the list to run. */
export async function runCritics({ dir, critics, model, round, changed, code }) {
  const packet = join(dir, "review", "packet.md");
  if (!existsSync(packet)) die(`${packet} is missing: run npm run review -- ${dir} first (the critics judge its packet and frames)`);
  const framesDir = join(dir, "review", "frames");
  const sheets = existsSync(framesDir) ? readdirSync(framesDir).filter((f) => /^contact-sheet.*\.jpe?g$/i.test(f)).sort().map((f) => join(framesDir, f)) : [];
  if (!sheets.length) die(`${framesDir} has no contact-sheet*.jpg: run npm run review -- ${dir} first`);
  const known = codexModels();
  if (known && !known.includes(model)) die(`Codex does not list the model "${model}" (~/.codex/models_cache.json has ${known.join(", ")})`);
  if (!known) console.error(`warning: no Codex models cache found; not checking that "${model}" exists`);
  const r = spawnSync("codex", ["--version"], { encoding: "utf8" });
  if (r.error) die("codex is not on PATH: --run starts Codex agents (skills/critic-loop, Who runs it)");
  const jobs = critics.map((critic) => {
    const skillPath = skillFor(critic);
    if (!skillPath) die(`no skill for ${critic} in skills/ or local/skills/`);
    return { critic, model, round, dir, sheets, brief: buildBrief({ critic, skillPath: resolve(skillPath), dir, round, changed, code, sheets: sheets.length }) };
  });
  console.log(`Running ${critics.length} critic${critics.length === 1 ? "" : "s"} on Codex ${model}, round ${round}, ${sheets.length} contact sheet${sheets.length === 1 ? "" : "s"} each, in parallel. Nothing may rebuild ${dir} until they finish.`);
  const results = await Promise.all(jobs.map(runOne));
  for (const x of results) {
    if (!x.ok) { console.log(`${x.critic.padEnd(20)} FAILED  ${x.why}`); continue; }
    const f = Array.isArray(x.json.findings) ? x.json.findings : [];
    const by = (s) => f.filter((y) => y.severity === s).length;
    console.log(`${x.critic.padEnd(20)} ${String(x.json.verdict).toUpperCase().padEnd(4)}  ${f.length} finding${f.length === 1 ? "" : "s"} (${by("blocking")} blocking, ${by("major")} major, ${by("minor")} minor)  ${x.file}`);
  }
  return results;
}
