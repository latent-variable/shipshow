// `npm run critics -- <folder> --run` (bin/critics-run.mjs, D108): a fake `codex` on PATH records how it was started, so
// the test sees what each critic would have got: its own empty folder, every contact sheet as a separate `-i`, a
// read-only sandbox, and the brief on stdin. No Codex, no network.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { REPO } from "../bin/lib.mjs";
import { extractJson } from "../bin/critics-run.mjs";

// The fake records one JSON file per run, named by the critic in the brief's first line, then answers like a critic.
// FAKE_BAD names a critic that answers with prose and no JSON.
const FAKE = `#!/usr/bin/env node
const fs = require("node:fs");
const [, , ...argv] = process.argv;
if (argv[0] === "--version") { console.log("codex-cli fake"); process.exit(0); }
const stdin = fs.readFileSync(0, "utf8");
const critic = stdin.match(/Your critic: (critic-[a-z]+)/)[1];
fs.writeFileSync(process.env.FAKE_RECORD + "/" + critic + ".json", JSON.stringify({ argv, stdin, cwd: process.cwd(), cwdFiles: fs.readdirSync(process.cwd()) }));
if (process.env.FAKE_BAD === critic) { console.log("I looked at it and it seems fine."); process.exit(0); }
const verdict = { critic, round: 1, verdict: critic === "critic-sync" ? "fail" : "pass", findings: critic === "critic-sync" ? [{ id: "sync-1", severity: "major", objective: true, where: "01, 2 s", what: "w", evidence: "e", fix: "f" }] : [] };
console.log("thinking...\\n\`\`\`json\\n" + JSON.stringify(verdict) + "\\n\`\`\`");
`;

function setup(extraEnv = {}) {
  const root = mkdtempSync(join(tmpdir(), "shipshow-critics-run-"));
  const bin = join(root, "bin"), record = join(root, "record"), codexHome = join(root, "codex-home"), local = join(root, "local");
  for (const d of [bin, record, codexHome, local]) mkdirSync(d);
  writeFileSync(join(bin, "codex"), FAKE);
  chmodSync(join(bin, "codex"), 0o755);
  writeFileSync(join(codexHome, "models_cache.json"), JSON.stringify({ models: [{ slug: "gpt-6-luna" }, { slug: "gpt-6-sol" }] }));
  const dir = join(root, "video");
  mkdirSync(join(dir, "review", "frames"), { recursive: true });
  writeFileSync(join(dir, "video.json"), JSON.stringify({ title: "Fixture", kind: "feature", audience: "A developer who wants the fixture explained." }));
  writeFileSync(join(dir, "review", "packet.md"), "# packet\n");
  for (const f of ["contact-sheet-1.jpg", "contact-sheet-2.jpg", "contact-sheet-3.jpg", "frame-01.jpg"]) writeFileSync(join(dir, "review", "frames", f), "x");
  const run = (...args) => spawnSync(process.execPath, [join(REPO, "bin", "critics.mjs"), dir, "--run", ...args], {
    encoding: "utf8",
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, FAKE_RECORD: record, CODEX_HOME: codexHome, SHIPSHOW_LOCAL: local, FAKE_BAD: "", ...extraEnv },
  });
  const recorded = (c) => JSON.parse(readFileSync(join(record, `${c}.json`), "utf8"));
  return { root, dir, record, run, recorded };
}

test("critics --run: each critic is a fresh read-only Codex in its own empty folder, every sheet its own -i, the brief on stdin", () => {
  const { dir, run, recorded } = setup();
  const r = run("--critics", "critic-visuals,critic-sync", "--changed", "scene 02, the second card");
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const sheets = ["contact-sheet-1.jpg", "contact-sheet-2.jpg", "contact-sheet-3.jpg"].map((f) => join(dir, "review", "frames", f));
  const cwds = [];
  for (const c of ["critic-visuals", "critic-sync"]) {
    const x = recorded(c);
    assert.deepEqual(x.argv.slice(0, 3), ["exec", "--skip-git-repo-check", "--sandbox"]);
    assert.equal(x.argv[x.argv.indexOf("--sandbox") + 1], "read-only");
    assert.equal(x.argv[x.argv.indexOf("-m") + 1], "gpt-6-luna");
    assert.ok(x.argv.includes("model_reasoning_effort=medium"));
    // every contact sheet, and only the contact sheets, each as its own `-i <absolute path>`
    const images = x.argv.flatMap((a, i) => (a === "-i" ? [x.argv[i + 1]] : []));
    assert.deepEqual(images, sheets);
    assert.ok(images.every((p) => p.startsWith("/") && existsSync(p)), "each -i is one real absolute path");
    assert.deepEqual(x.cwdFiles, [], "the critic starts in an empty folder");
    assert.ok(!x.cwd.startsWith(REPO) && !x.cwd.startsWith(dir), "outside the repo and the video");
    cwds.push(x.cwd);
    // the brief: from critic-loop's template, with this critic, this video, absolute paths, round and changed scenes
    assert.ok(x.stdin.includes(`Your critic: ${c}.`));
    assert.ok(x.stdin.includes(join(REPO, "skills", c, "SKILL.md")), "the critic is told its SKILL.md's absolute path");
    assert.ok(x.stdin.includes(`Evidence, in ${dir}:`));
    assert.ok(x.stdin.includes("You are a critic for an explainer video. Review it yourself; do not delegate."), "the template's own words");
    assert.ok(x.stdin.includes("Round 1 of the critic loop"));
    assert.ok(x.stdin.includes("scene 02, the second card"));
    assert.ok(x.stdin.includes('"verdict": "pass" | "fail"'), "the JSON shape from critic-loop");
    assert.ok(!/<(critic|video dir|name|path)>/.test(x.stdin), "no placeholder left in the brief");
  }
  assert.notEqual(cwds[0], cwds[1], "one folder per critic");
  // the verdicts are saved where the loop reads them, and printed one to a line
  const sync = JSON.parse(readFileSync(join(dir, "review", "round-1", "critic-sync.json"), "utf8"));
  assert.equal(sync.verdict, "fail");
  assert.equal(JSON.parse(readFileSync(join(dir, "review", "round-1", "critic-visuals.json"), "utf8")).verdict, "pass");
  assert.match(r.stdout, /critic-sync\s+FAIL\s+1 finding \(0 blocking, 1 major, 0 minor\)/);
  assert.match(r.stdout, /critic-visuals\s+PASS\s+0 findings/);
});

test("critics --run: the plan's critics by default, the next round on disk, --model and --round", () => {
  const { dir, run, recorded } = setup();
  mkdirSync(join(dir, "review", "round-1"));
  const r = run("--model", "gpt-6-sol");
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.deepEqual(readdirSync(join(dir, "review", "round-2")).sort(), ["critic-accuracy.json", "critic-clarity.json", "critic-consistency.json", "critic-engagement.json", "critic-novelty.json", "critic-pacing.json", "critic-sync.json", "critic-visuals.json"]);
  const x = recorded("critic-accuracy");
  assert.equal(x.argv[x.argv.indexOf("-m") + 1], "gpt-6-sol", "--model is the Codex model, not the plan's");
  assert.ok(x.stdin.includes("Round 2 of the critic loop"));
  assert.ok(!x.stdin.includes("This is a re-run"), "no changed scenes named, so a whole pass");
  assert.equal(run("--critics", "critic-pacing", "--round", "5").status, 0);
  assert.ok(existsSync(join(dir, "review", "round-5", "critic-pacing.json")));
});

test("critics --run: output with no JSON fails that critic, keeps its raw text, and the others still land", () => {
  const { dir, run } = setup({ FAKE_BAD: "critic-sync" });
  const r = run("--critics", "critic-sync,critic-visuals");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /critic-sync\s+FAILED\s+no JSON object in its output/);
  assert.ok(!existsSync(join(dir, "review", "round-1", "critic-sync.json")));
  assert.match(readFileSync(join(dir, "review", "round-1", "critic-sync.raw.txt"), "utf8"), /it seems fine/);
  assert.ok(existsSync(join(dir, "review", "round-1", "critic-visuals.json")));
});

test("critics --run: refuses with no review packet, an unknown critic or a model Codex does not list", () => {
  const a = setup(), b = setup();
  renameSync(join(b.dir, "review", "packet.md"), join(b.dir, "review", "packet.old"));
  const r1 = b.run("--critics", "critic-visuals");
  assert.equal(r1.status, 1);
  assert.match(r1.stderr, /packet\.md is missing: run npm run review/);
  assert.equal(readdirSync(b.record).length, 0, "no critic was started");
  const r2 = a.run("--model", "gpt-nope");
  assert.equal(r2.status, 1);
  assert.match(r2.stderr, /does not list the model "gpt-nope"/);
  assert.equal(a.run("--critics", "critic-nonesuch").status, 1);
  assert.equal(readdirSync(a.record).length, 0);
});

test("extractJson finds the verdict in a fenced block, in chatter, or bare, and nothing in prose", () => {
  assert.deepEqual(extractJson('{"verdict":"pass"}'), { verdict: "pass" });
  assert.deepEqual(extractJson('Here:\n```json\n{"verdict":"fail","findings":[]}\n```\nDone.'), { verdict: "fail", findings: [] });
  assert.deepEqual(extractJson('I think {"verdict":"pass"} is right'), { verdict: "pass" });
  assert.equal(extractJson("no braces at all"), null);
  assert.equal(extractJson("{ not json }"), null);
});
