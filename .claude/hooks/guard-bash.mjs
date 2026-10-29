// PreToolUse on Bash: refuse the commands that delete or rewrite work. This repo's rule is that the scripts never
// delete files and an agent moves things aside instead (AGENTS.md, Traps). SHIPSHOW_ALLOW_DESTRUCTIVE=1 in the
// environment lets a person run one on purpose.
//
// It also covers what the Edit/Write hook (protect-files.mjs) and the Read denial in settings.json cannot see, because an
// agent often edits and reads through Bash: a command that WRITES a protected path (> and >>, tee, sed -i, perl -i, cp, mv,
// install, ln, rsync, truncate, dd of=, patch) is refused with protect-files' own rule, and a command that READS .env* or
// local/voices (cat, head, grep, cp from, < ...) is refused too. Copying a clip INTO local/voices is allowed (destination only).
//
// THIS IS A SEATBELT, NOT A SANDBOX. It reads the command text, so it stops a well-meaning agent's slip (sed -i on the
// sample's bug, cat .env), never a determined one: a path built in a variable, a glob that expands to it, a script that
// writes it from inside, a heredoc fed to python. sandbox-run.sh is the sandbox.
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { isAbsolute, relative, resolve } from "node:path";
import { deny, input, projectDir } from "./lib.mjs";
import { isEntry } from "../../bin/entry.mjs";
import { reason as protectedReason } from "./protect-files.mjs";

const WRAPPERS = new Set(["sudo", "command", "env", "time", "nice", "nohup", "xargs", "exec"]);
const SHELLS = new Set(["bash", "sh", "zsh", "dash"]);
// words that can start a segment without being the command: skip them to find it
const KEYWORDS = new Set(["{", "!", "if", "then", "else", "elif", "do", "while", "until"]);
// markers segments() puts in a segment for an unquoted > (or >>, >|) and <; the word after is the file
const OUT = "\u0000>", IN = "\u0000<";

// Split on ; & | ( ) and newlines outside quotes; return each segment as words with the quotes removed. Grouping parens
// split too, so (rm f), <(rm f) and $(rm f) each start a segment. An unquoted redirect leaves a marker word before its file.
export function segments(cmd) {
  const out = [];
  let words = [], cur = "", q = null, has = false;
  const endWord = () => { if (has) words.push(cur); cur = ""; has = false; };
  const endSeg = () => { endWord(); if (words.length) out.push(words); words = []; };
  for (let i = 0; i < cmd.length; i++) {
    const c = cmd[i];
    if (q) { if (c === q) q = null; else if (c === "\\" && q === '"' && i + 1 < cmd.length) cur += cmd[++i]; else cur += c; continue; }
    if (c === "'" || c === '"') { q = c; has = true; continue; }
    if (c === "\\" && i + 1 < cmd.length) { cur += cmd[++i]; has = true; continue; }
    if (c === ">" || (c === "<" && cmd[i + 1] !== "<" && cmd[i - 1] !== "<" && cmd[i + 1] !== "(")) {
      endWord();
      if (c === ">") { while (cmd[i + 1] === ">" || cmd[i + 1] === "|") i++; if (cmd[i + 1] === "&") { i++; continue; } }
      words.push(c === ">" ? OUT : IN);
      continue;
    }
    if (c === ";" || c === "&" || c === "|" || c === "\n" || c === "(" || c === ")") { endSeg(); continue; }
    if (c === " " || c === "\t") { endWord(); continue; }
    cur += c; has = true;
  }
  endSeg();
  return out;
}

// git's own options before the subcommand, the ones that take a value
const GIT_VALUE_OPTS = ["-C", "-c", "--git-dir", "--work-tree", "--namespace"];

function gitReason(args) {
  // skip git's own options (and the value of those that take one) to find the subcommand
  let i = 0;
  while (i < args.length && args[i].startsWith("-")) i += GIT_VALUE_OPTS.includes(args[i]) ? 2 : 1;
  const sub = args[i];
  const rest = args.slice(i + 1);
  if (sub === "restore") return "git restore overwrites uncommitted work";
  if (sub === "clean") return "git clean deletes untracked files";
  if (sub === "reset" && rest.includes("--hard")) return "git reset --hard discards work";
  if (sub === "checkout" && (rest.includes("--") || rest.includes("."))) return "git checkout -- discards uncommitted changes";
  if (sub === "branch" && rest.includes("-D")) return { why: "git branch -D deletes a branch that may be unmerged", branches: rest.filter((a) => !a.startsWith("-")) };
  if (sub === "stash" && ["drop", "clear"].includes(rest[0])) return "git stash drop loses stashed work";
  if (sub === "push" && rest.some((a) => a === "--force" || a === "-f" || a.startsWith("--force-with-lease"))) return "a force push rewrites shared history";
  return null;
}

// The directory a git command works in: where the command runs, moved by each -C.
function gitDir(args, cwd) {
  let dir = cwd;
  for (let i = 0; i < args.length && args[i].startsWith("-"); i += GIT_VALUE_OPTS.includes(args[i]) ? 2 : 1) if (args[i] === "-C" && args[i + 1]) dir = resolve(dir, home(args[i + 1]));
  return dir;
}

const git = (dir, ...args) => {
  const r = spawnSync("git", ["-C", dir, ...args], { encoding: "utf8", timeout: 10000 });
  return r.status === 0 ? r.stdout.trim() : null;
};

// Whether a directory is this repository: the same git store, so a worktree of ShipShow is ShipShow and another clone is
// not. The git rules are this repo's (#105); another repo's branches and stashes are that repo's business. A directory git
// cannot place (not there yet, not a repo) counts as this repo, so the rule still applies when we cannot tell.
export function isThisRepo(dir, root) {
  const store = (d) => git(d, "rev-parse", "--path-format=absolute", "--git-common-dir");
  const theirs = store(dir), ours = store(root);
  return !theirs || !ours || theirs === ours;
}

// A branch whose tip is exactly the head of a pull request merged into the default branch from this repo has landed:
// a squash merge leaves it unmerged to git, so -d refuses and `pr merge` says to use -D (#64). The same test as
// branch-gc.sh. Anything it cannot establish (no such branch, gh missing or offline, another head) keeps the refusal.
export function landedBranch(dir, branch, gh = process.env.SHIPSHOW_GH || "gh") {
  if (!branch || branch.startsWith("-")) return false;
  const tip = git(dir, "rev-parse", "--verify", "--quiet", `refs/heads/${branch}^{commit}`);
  const base = (git(dir, "symbolic-ref", "--short", "refs/remotes/origin/HEAD") || "").replace(/^origin\//, "");
  if (!tip || !base) return false;
  const r = spawnSync(gh, ["pr", "list", "--state", "merged", "--head", branch, "--base", base, "--limit", "100", "--json", "headRefOid,isCrossRepository"], { cwd: dir, encoding: "utf8", timeout: 20000 });
  if (r.status !== 0) return false;
  try { return JSON.parse(r.stdout).some((pr) => pr.headRefOid === tip && pr.isCrossRepository === false); } catch { return false; }
}

const home = (p) => (p === "~" || p.startsWith("~/") ? homedir() + p.slice(1) : p.replace(/^\$HOME(?=\/|$)/, homedir()));

// A heredoc body is text, not commands: cut it out of the command. One with a quoted delimiter is inert (nothing in
// it runs); one without can hold $( ) and backticks, which still run, so those bodies are returned to be scanned.
export function splitHeredocs(cmd) {
  const bodies = [], all = [];
  const rest = cmd.replace(/<<-?[ \t]*(['"]?)([A-Za-z_][A-Za-z0-9_]*)\1[^\n]*\n([\s\S]*?)(?:\n[ \t]*\2[ \t]*(?=\n|$)|$)/g, (m, q, _tag, body) => {
    all.push(body);
    if (!q) bodies.push(body);
    return m.slice(0, m.indexOf("\n"));
  });
  return { rest, bodies, all };
}

// The text of each $( ) and backtick substitution outside single quotes, where it would not run.
export function substitutions(s) {
  const out = [];
  let sq = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "\\") { i++; continue; }
    if (c === "'" && !sq) { sq = true; continue; }
    if (c === "'" && sq) { sq = false; continue; }
    if (sq) continue;
    if (c === "$" && s[i + 1] === "(") {
      let d = 1, j = i + 2;
      for (; j < s.length && d; j++) { if (s[j] === "(") d++; else if (s[j] === ")") d--; }
      out.push(s.slice(i + 2, j - 1));
    } else if (c === "`") {
      const j = s.indexOf("`", i + 1);
      if (j < 0) break;
      out.push(s.slice(i + 1, j));
      i = j;
    }
  }
  return out;
}

const PRIVATE_TEXT = /(^|[\/\s'"=])\.env(\.\w+)?(?![\w-])|local\/voices/;
const PROTECTED_TEXT = /sample_application\/src\/|package-lock\.json|videos\/[^/\s'"]+\/(review\/[^/\s'"]+\.(txt|sha256)|results\/captures\/)/;
const WRITE_WORDS = /write|open\s*\([^)]*['\"][wax+]|rename|replace|copy|move|unlink|truncate|\bsed\b|>/i;
const READERS = new Set(["cat", "tac", "head", "tail", "less", "more", "xxd", "od", "hexdump", "base64", "strings", "grep", "egrep", "fgrep", "rg", "awk", "sed", "cut", "sort", "uniq", "nl", "bat", "source", ".", "open", "afplay", "file", "diff", "cmp", "scp"]);
const INTERPRETERS = /^(python[0-9.]*|node|ruby|perl|deno|bun)$/;

const optionless = (a) => a.filter((x) => !x.startsWith("-"));
function relOf(ctx, p) {
  const abs = isAbsolute(p) ? p : resolve(ctx.cwd, p);
  return relative(ctx.root, abs).split("\\").join("/");
}
function isPrivate(rel) { return rel === ".env" || rel.startsWith(".env.") || rel === "local/voices" || rel.startsWith("local/voices/"); }
// protect-files' rule for a path a command writes (a directory target is tested as a file inside it)
function writeBlock(ctx, p, dir = false) {
  const rel = relOf(ctx, p);
  const r = protectedReason(rel) || (dir ? protectedReason(`${rel}/_`) : null);
  return r ? `it writes ${rel}: ${r}` : null;
}

// What a command writes: the files a write form names as its target, checked against protect-files' rule.
function writeReason(base, w, ctx) {
  const args = w.slice(1), files = optionless(args);
  const inPlace = args.some((a) => /^-[a-hj-z]*i|^--in-place/.test(a));
  let targets = [], dirs = [];
  if (base === "tee" || base === "truncate" || base === "patch") targets = files;
  else if ((base === "sed" || base === "perl") && inPlace) targets = files;
  else if (base === "dd") targets = args.filter((a) => a.startsWith("of=")).map((a) => a.slice(3));
  else if (base === "mv") dirs = files;                       // the source is removed, the destination written
  else if (["cp", "install", "ln", "rsync"].includes(base)) {
    const t = args.findIndex((a) => a === "-t" || a === "--target-directory");
    dirs = t >= 0 && args[t + 1] ? [args[t + 1]] : files.slice(-1);
  }
  for (const p of targets) { const r = writeBlock(ctx, p); if (r) return r; }
  for (const p of dirs) { const r = writeBlock(ctx, p, true); if (r) return r; }
  if (INTERPRETERS.test(base)) {
    const i = args.findIndex((a) => ["-c", "-e", "-p", "-pe", "-ne", "-pi", "--eval", "--print"].includes(a));
    const code = i >= 0 ? args[i + 1] : "";
    if (code && PROTECTED_TEXT.test(code) && WRITE_WORDS.test(code)) return "inline code that names a protected path and writes; use the Edit tool, which the file guard checks, or a script a person reviewed";
  }
  return null;
}

// What a command reads: .env* and local/voices, which settings.json denies the Read tool. Copying INTO local/voices is fine.
function readReason(base, w, ctx) {
  const args = w.slice(1);
  const bad = (p) => isPrivate(relOf(ctx, p));
  const msg = (p) => `it reads ${relOf(ctx, p)}, which is private (.env files and local/voices clones are denied to the Read tool too; SHIPSHOW_ALLOW_PRIVATE=1 if a person asked)`;
  let named = [];
  if (READERS.has(base)) named = args.filter((a) => !a.startsWith("-") || a.includes("=")).map((a) => (a.startsWith("-") ? a.split("=").slice(1).join("=") : a));
  else if (["cp", "rsync", "ln"].includes(base)) named = optionless(args).slice(0, -1);   // sources; the destination may be local/voices
  else if (["mv", "install"].includes(base) && !args.includes("-t")) named = optionless(args).slice(0, -1);
  for (const p of named) if (p && bad(p)) return msg(p);
  if (INTERPRETERS.test(base)) {
    const i = args.findIndex((a) => ["-c", "-e", "-p", "-pe", "-ne", "--eval", "--print"].includes(a));
    if (i >= 0 && args[i + 1] && PRIVATE_TEXT.test(args[i + 1])) return "inline code that names a private file (.env, local/voices); SHIPSHOW_ALLOW_PRIVATE=1 if a person asked";
  }
  return null;
}

// Why a command is refused, or null. ctx: the project root and the directory the command runs in (a `cd` moves it).
export function reason(full, depth = 0, ctx = { root: resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd()), cwd: null }) {
  if (depth > 3) return null;
  ctx = { ...ctx, cwd: ctx.cwd || ctx.root };
  const { rest: cmd, bodies, all } = splitHeredocs(full);
  let feedsShell = false;
  for (const inner of [...substitutions(cmd), ...bodies.flatMap(substitutions)]) {
    const r = reason(inner, depth + 1, ctx);
    if (r) return r;
  }
  for (let raw of segments(cmd)) {
    // redirects: collect the files, then drop the markers and their files from the words
    const outs = [], ins = [], w = [];
    for (let i = 0; i < raw.length; i++) {
      if (raw[i] === OUT || raw[i] === IN) { const f = raw[++i]; if (f !== undefined) (raw[i - 1] === OUT ? outs : ins).push(f); } else w.push(raw[i]);
    }
    for (const p of outs) { const r = writeBlock(ctx, p); if (r) return r; }
    for (const p of ins) if (isPrivate(relOf(ctx, p)) && process.env.SHIPSHOW_ALLOW_PRIVATE !== "1") return `it reads ${relOf(ctx, p)}, which is private`;
    while (w.length && (/^[A-Za-z_][A-Za-z0-9_]*=/.test(w[0]) || WRAPPERS.has(w[0]) || KEYWORDS.has(w[0]))) w.shift();
    if (!w.length) continue;
    const base = w[0].split("/").pop();
    if (base === "cd" && w[1]) { ctx = { ...ctx, cwd: resolve(ctx.cwd, home(w[1])) }; continue; }
    if (["rm", "unlink", "shred"].includes(base)) return `${base} deletes files, and this repo's scripts and agents never do: move it aside with mv (AGENTS.md, Traps)`;
    if (base === "find" && (w.includes("-delete") || (w.includes("-exec") && w.some((x) => ["rm", "unlink"].includes(x))))) return "find with -delete or -exec rm deletes files: move them aside instead";
    if (base === "git") {
      const r = gitReason(w.slice(1)), dir = r && gitDir(w.slice(1), ctx.cwd);
      if (r && isThisRepo(dir, ctx.root)) {
        if (typeof r === "string") return r;
        if (!r.branches.length || !r.branches.every((b) => landedBranch(dir, b))) return `${r.why} (one whose tip is a merged pull request's head is allowed)`;
      }
    }
    if (SHELLS.has(base) && !w.includes("-c") && all.length) feedsShell = true;   // bash <<EOF: the body runs, quoted delimiter or not
    if (SHELLS.has(base)) {
      const i = w.indexOf("-c");
      if (i > 0 && w[i + 1]) { const r = reason(w[i + 1], depth + 1, ctx); if (r) return r; }
    }
    if (base === "eval" && w[1]) { const r = reason(w.slice(1).join(" "), depth + 1, ctx); if (r) return r; }
    const wr = writeReason(base, w, ctx);
    if (wr) return wr;
    if (process.env.SHIPSHOW_ALLOW_PRIVATE !== "1") { const rr = readReason(base, w, ctx); if (rr) return rr; }
  }
  if (feedsShell) for (const b of all) { const r = reason(b, depth + 1, ctx); if (r) return r; }
  return null;
}

if (isEntry(import.meta.url)) {
  const i = input();
  const cmd = i.tool_input?.command;
  if (typeof cmd === "string" && process.env.SHIPSHOW_ALLOW_DESTRUCTIVE !== "1") {
    const root = projectDir(i);
    const r = reason(cmd, 0, { root, cwd: i.cwd ? resolve(i.cwd) : root });
    if (r) deny(`Blocked: ${r}. If a person asked for exactly this, they can set SHIPSHOW_ALLOW_DESTRUCTIVE=1 (or SHIPSHOW_EDIT_SAMPLE=1 / SHIPSHOW_ALLOW_PRIVATE=1 for the sample or private files).`);
  }
}
