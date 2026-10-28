// Make .venv with a Python Kokoro supports, upgrade its pip, and install requirements.txt into it.
//   node bin/setup.mjs           (npm run setup)
//   node bin/setup.mjs --drama   (npm run setup:drama: .venv-drama from requirements-drama.txt, for the Drama 3 engine)
//   node bin/setup.mjs --listen  (npm run setup:listen: .venv-listen from requirements-listen.txt, Parakeet's second listen)
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { REPO, VENVS, die } from "./lib.mjs";
import { existsSync, mkdirSync } from "node:fs";
import { MIN, MAX, pickPython, pythonVersion, setupSteps, supportedPython } from "./python.mjs";

const found = pickPython();
if (!found) die(`no Python ${MIN.join(".")} to ${MAX.join(".")} found (kokoro-onnx 0.6.1 does not support newer ones). Install one, for example: brew install python@3.12`);
// An existing .venv is not recreated (and this script never deletes one): if its Python is out of range, say so.
const flavour = ["drama", "listen"].find((f) => process.argv.includes(`--${f}`));
// --omnivoice and --hearback add their requirements to .venv (made first if missing) rather than making a venv of their own.
const extras = ["omnivoice", "hearback"].filter((f) => process.argv.includes(`--${f}`));
const venv = flavour ? `.venv-${flavour}` : ".venv";
const existing = join(VENVS, venv, "bin", "python");
mkdirSync(VENVS, { recursive: true });
if (existsSync(existing)) {
  const have = pythonVersion(existing);
  if (!have || !supportedPython(have)) die(`${venv} already exists with Python ${have || "unknown"}, outside ${MIN.join(".")} to ${MAX.join(".")}. Move it aside yourself (mv ${venv} ${venv}.old) and run npm run setup${flavour ? `:${flavour}` : ""} again`);
}
console.log(`using ${found.cmd} (Python ${found.version})`);
const requirements = flavour ? `requirements-${flavour}.txt` : "requirements.txt";
const steps = setupSteps(VENVS, found.cmd, existsSync(existing), join(VENVS, venv), join(REPO, requirements));
// OmniVoice always comes with hear-back, as npm run setup:omnivoice always installed both.
const extra = [...new Set(extras.flatMap((x) => (x === "omnivoice" ? ["omnivoice", "hearback"] : [x])))];
if (extra.length) steps.push([join(VENVS, venv, "bin", "pip"), ["install", ...extra.flatMap((x) => ["-r", join(REPO, `requirements-${x}.txt`)])]]);
if (VENVS !== REPO) console.log(`venvs in ${VENVS} (SHIPSHOW_VENVS)`);
for (const [cmd, args] of steps) {
  const r = spawnSync(cmd, args, { cwd: REPO, stdio: "inherit" });
  if (r.status !== 0) die(`${cmd} ${args.join(" ")} failed`);
}
