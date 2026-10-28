// A repo that builds on ShipShow (it pins a copy and runs it with its own layer, D75): where the layer, the venvs and the
// renders live comes from SHIPSHOW_LOCAL, SHIPSHOW_VENVS and SHIPSHOW_OUT, and a page with no meme still passes lint.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { REPO } from "../bin/lib.mjs";

/** What lib.mjs settles on in a fresh process with `env` set: the paths are read when the module loads. */
function paths(env) {
  const code = `import("${join(REPO, "bin", "lib.mjs")}").then((l) => console.log(JSON.stringify({ venv: l.VENV_PY, drama: l.DRAMA_PY, listen: l.LISTEN_PY, local: l.localDir(), out: l.outDir() })))`;
  const clean = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("SHIPSHOW_")));
  return JSON.parse(execFileSync(process.execPath, ["-e", code], { env: { ...clean, ...env }, encoding: "utf8" }));
}

test("without settings everything stays in this repo", () => {
  const p = paths({});
  assert.equal(p.venv, join(REPO, ".venv", "bin", "python"));
  assert.equal(p.drama, join(REPO, ".venv-drama", "bin", "python"));
  assert.equal(p.local, join(REPO, "local"));
  assert.equal(p.out, join(REPO, "out"));
});

test("a repo on top moves the layer, the venvs and the renders", () => {
  const p = paths({ SHIPSHOW_LOCAL: "/team/layer", SHIPSHOW_VENVS: "/cache/venvs", SHIPSHOW_OUT: "/team/out" });
  assert.equal(p.venv, "/cache/venvs/.venv/bin/python");
  assert.equal(p.drama, "/cache/venvs/.venv-drama/bin/python");
  assert.equal(p.listen, "/cache/venvs/.venv-listen/bin/python");
  assert.equal(p.local, "/team/layer");
  assert.equal(p.out, "/team/out");
});

test("SHIPSHOW_VIDEOS adds folders whose memes count as used", () => {
  const root = mkdtempSync(join(tmpdir(), "kx-layer-"));
  mkdirSync(join(root, "explainers", "a"), { recursive: true });
  writeFileSync(join(root, "explainers", "a", "scenes.html"), '<figure class="ss-meme" data-meme="astronaut"></figure>');
  const code = `import("${join(REPO, "bin", "meme.mjs")}").then((m) => console.log(JSON.stringify([...(m.memesUsed().get("astronaut") || [])])))`;
  const used = JSON.parse(execFileSync(process.execPath, ["-e", code], { env: { ...process.env, SHIPSHOW_VIDEOS: join(root, "explainers") }, encoding: "utf8" }));
  assert.ok(used.includes("a"));
});

test("a page with no meme still declares and ships the meme fonts base.css names (#103)", () => {
  const dir = join(mkdtempSync(join(tmpdir(), "kx-layer-")), "demo");
  cpSync(join(REPO, "template"), dir, { recursive: true });
  assert.ok(!readFileSync(join(dir, "scenes.html"), "utf8").includes("ss-meme"), "the template has no meme");
  writeFileSync(join(dir, "timing.json"), JSON.stringify({ total: 9, scenes: [
    { id: "01-intro", start: 0, duration: 4, sentences: [{ text: "This is the first scene. Each sentence is voiced on its own.", start: 0.5, duration: 3 }] },
    { id: "02-idea", start: 4, duration: 5, sentences: [{ text: "This is the second scene.", start: 4.5, duration: 2 }, { text: "A box appears when the voice says box.", start: 7, duration: 1.5 }] },
  ] }));
  mkdirSync(join(dir, "assets"), { recursive: true });
  execFileSync(process.execPath, [join(REPO, "bin", "build.mjs"), dir]);
  const html = readFileSync(join(dir, "index.html"), "utf8");
  for (const family of ["Titillium Web", "Anton"]) assert.match(html, new RegExp(`@font-face \\{ font-family: "${family}"`));
  assert.ok(existsSync(join(dir, "assets", "memes", "fonts", "anton-latin-400-normal.woff2")));
});
