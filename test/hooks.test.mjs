// The project hooks (.claude/settings.json): what they refuse, what they let through, and that the settings name files that exist.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import * as require_fs from "node:fs";
import { existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { REPO } from "../bin/lib.mjs";

const hook = (name, payload, env = {}) => spawnSync(process.execPath, [join(REPO, ".claude", "hooks", name)], {
  input: JSON.stringify(payload), encoding: "utf8", env: { ...process.env, CLAUDE_PROJECT_DIR: REPO, SHIPSHOW_ALLOW_DESTRUCTIVE: "", SHIPSHOW_EDIT_SAMPLE: "", SHIPSHOW_ALLOW_PRIVATE: "", ...env },
});
const bash = (command, env) => hook("guard-bash.mjs", { tool_name: "Bash", tool_input: { command } }, env);
const edit = (file_path, env) => hook("protect-files.mjs", { tool_name: "Edit", tool_input: { file_path }, cwd: REPO }, env);

test("hooks: the Bash guard refuses what deletes or rewrites work, and lets ordinary commands through", () => {
  for (const c of ["rm -rf build", "rm file.txt", "sudo rm -r x", "FOO=1 rm a", "ls && rm a", "echo hi | xargs rm", "bash -c 'rm -rf x'", "echo $(rm a)", "find . -name '*.tmp' -delete", "find . -exec rm {} \\;",
    "git restore .", "git checkout -- file", "git checkout .", "git clean -fd", "git reset --hard HEAD~1", "git branch -D feature", "git stash drop", "git push --force origin x", "git push -f", "git -C repo restore a", "/bin/rm a"]) {
    const r = bash(c);
    assert.equal(r.status, 2, `${c} should be refused`);
    assert.match(r.stderr, /Blocked: .*SHIPSHOW_ALLOW_DESTRUCTIVE/, c);
  }
  for (const c of ["git status", "git checkout -b new-branch", "git checkout main", "git push origin feature", "git push -u origin feature", "git branch -m new", "git stash", "git stash pop", "git rm --cached x",
    "mv a b", "rmdir empty", "npm test", "echo 'rm is a command'", "grep -rn \"git restore\" docs", "git commit -m 'never run git clean'", "node bin/make.mjs videos/x"]) {
    assert.equal(bash(c).status, 0, `${c} should pass`);
  }
  // text is not a command: a quoted heredoc (a PR body full of backticks), single quotes; but an unquoted heredoc or double quotes still run substitutions
  for (const c of ["gh pr create --body-file /dev/stdin <<'EOF'\nrefuses `rm`, `unlink` and git `restore`\nrm -rf notes\nEOF", "cat > f <<'EOF'\n`rm -rf x`\nEOF", "echo '`rm -rf x`'", "echo '$(rm a)'", "git commit -m 'note: `rm` is refused'"]) {
    assert.equal(bash(c).status, 0, `${JSON.stringify(c)} is text and should pass`);
  }
  for (const c of ["cat <<EOF\n$(rm a)\nEOF", "echo \"`rm x`\"", "cat <<'EOF'\nfine\nEOF\nrm after.txt"]) {
    assert.equal(bash(c).status, 2, `${JSON.stringify(c)} runs rm and should be refused`);
  }
  assert.equal(bash("rm -rf build", { SHIPSHOW_ALLOW_DESTRUCTIVE: "1" }).status, 0, "a person can allow it on purpose");
  assert.equal(hook("guard-bash.mjs", { tool_name: "Bash", tool_input: {} }).status, 0, "no command is not an error");
  assert.equal(spawnSync(process.execPath, [join(REPO, ".claude", "hooks", "guard-bash.mjs")], { input: "not json", encoding: "utf8" }).status, 0, "bad input does not block");
});

test("hooks: the Bash guard sees deletes inside groups and process substitution", () => {
  for (const c of ["(rm -f a)", "cat <(rm -f a)", "{ rm a; }", "if true; then rm a; fi", "echo x > >(rm a)", "(cd x && rm a)", "true && (git clean -fd)", "bash <<'EOF'\nrm a\nEOF", "sh <<EOF\nsed -i s/a/b/ package-lock.json\nEOF"]) assert.equal(bash(c).status, 2, `${c} should be refused`);
  for (const c of ["(cd docs && ls)", "echo '(rm a)'", "diff <(ls a) <(ls b)", "{ echo hi; }", "bash <<'EOF'\necho fine\nEOF"]) assert.equal(bash(c).status, 0, `${c} should pass`);
});

test("hooks: the Bash guard refuses writes to what the file guard protects (a seatbelt, not a sandbox)", () => {
  const S = "sample_application/src/pacing.mjs", R = "videos/pacer-dev-journey/review/scenario-before.txt";
  for (const c of [`printf x > ${S}`, `echo x >> ${S}`, `echo x>${S}`, `cat a >|${S}`, `echo x | tee ${S}`, `tee -a ${R} < a`, `sed -i 's/a/b/' ${S}`, `sed -i.bak s/a/b/ ${S}`, `sed -ni 's/a/b/p' ${S}`, `perl -pi -e 's/a/b/' ${S}`,
    `cp /tmp/x ${S}`, `cp -f /tmp/x sample_application/src/`, `cp -t sample_application/src /tmp/x`, `mv /tmp/x ${R}`, `mv ${S} /tmp/away`, `install -m 644 /tmp/x ${S}`, `ln -sf /tmp/x ${S}`, `truncate -s 0 ${S}`,
    `dd if=/tmp/x of=${S}`, `patch ${S} < fix.diff`, "echo x > package-lock.json", "sudo sed -i s/a/b/ package-lock.json", "cp /tmp/x videos/a/results/captures/tests.txt",
    `cd sample_application && sed -i s/a/b/ src/pacing.mjs`, `echo x > ./sample_application/../${S}`, `echo x > "${join(REPO, S)}"`, `bash -c "echo x > ${S}"`, `echo $(echo x > ${S})`,
    `python3 -c "open('${S}','w').write('x')"`, `node -e "require('fs').writeFileSync('package-lock.json','{}')"`]) {
    const r = bash(c);
    assert.equal(r.status, 2, `${c} should be refused`);
    assert.match(r.stderr, /^Blocked: it writes|^Blocked: inline code/, c);
  }
  for (const c of [`cat ${S}`, `grep -n pace ${S}`, `sed -n 1,5p ${S}`, `sed 's/a/b/' ${S} > /tmp/out`, `cp ${S} /tmp/copy`, `diff ${S} /tmp/x 2>&1`, "echo x > sample_application/README.md", "echo x > sample_application/test/a.mjs", "cp /tmp/x sample_application/test/",
    `echo 'x > ${S}'`, `git commit -m "fix: sed -i on ${S}"`, `cd /tmp && echo x > sample_application/src/y`, `python3 -c "print(open('${S}').read())"`, "npm install", "npm test 2>&1 | tail -5", "node bin/make.mjs videos/x > /tmp/log"]) {
    assert.equal(bash(c).status, 0, `${c} should pass`);
  }
  assert.equal(bash(`sed -i s/a/b/ ${S}`, { SHIPSHOW_EDIT_SAMPLE: "1" }).status, 0, "the sample override works through Bash too");
  assert.equal(bash(`echo x > package-lock.json`, { SHIPSHOW_ALLOW_DESTRUCTIVE: "1" }).status, 0, "so does the general override");
});

test("hooks: the Bash guard refuses reading .env and local/voices, and still lets a clip be copied in", () => {
  for (const c of ["cat .env", "cat .env.local", "head -3 ./.env", "grep KEY .env", "grep -r x local/voices", "cat local/voices/me.txt", "xxd local/voices/me.wav | head", "base64 local/voices/me.wav", "cp local/voices/me.wav /tmp/x", "cat < .env",
    "sed -n 1p .env", "cd local && cat voices/me.wav", "bash -c 'cat .env'", `python3 -c "print(open('.env').read())"`, "node -e \"console.log(require('fs').readFileSync('local/voices/a.txt'))\"", "awk 1 .env", "source .env", "cat -- local/voices/*"]) {
    const r = bash(c);
    assert.equal(r.status, 2, `${c} should be refused`);
    assert.match(r.stderr, /^Blocked: (it reads|inline code that names a private)/, c);
  }
  for (const c of ["cp ~/Downloads/me.wav local/voices/me.wav", "cp /tmp/me.wav /tmp/me.txt local/voices/", "mv /tmp/me.wav local/voices/me.wav", "echo 'words spoken' > local/voices/me.txt", "ls local/voices", "ls -la .env", "mkdir -p local/voices", "cat .envrc.md", "cat docs/.environment", "cat README.md", "grep -n env bin/lib.mjs", "echo '.env is private'",
    "ffprobe /tmp/me.wav", "node bin/voice.mjs videos/x --voice me", "npm run voice -- videos/x", "git commit -m 'cat .env'"]) {
    assert.equal(bash(c).status, 0, `${c} should pass`);
  }
  assert.equal(bash("cat .env", { SHIPSHOW_ALLOW_PRIVATE: "1" }).status, 0, "a person can allow it on purpose");
});

test("hooks: the file guard protects the demo's bugs, recorded runs and the lockfile, and nothing else", () => {
  for (const f of ["sample_application/src/pacing.mjs", join(REPO, "sample_application/src/ledger.mjs"), "videos/pacer-dev-journey/review/scenario-before.txt", "videos/x/review/a.txt.sha256", "videos/pacer-dev-journey/results/captures/tests-after.txt", "package-lock.json"]) {
    const r = edit(f);
    assert.equal(r.status, 2, `${f} should be refused`);
    assert.match(r.stderr, /^Blocked: /, f);
  }
  for (const f of ["sample_application/README.md", "sample_application/test/pacing.test.mjs", "videos/pacer-dev-journey/sources.md", "videos/pacer-dev-journey/review/packet.md", "docs/PRD.md", "bin/lib.mjs", "package.json", "/tmp/elsewhere/sample_application/src/x.mjs"]) {
    assert.equal(edit(f).status, 0, `${f} should pass`);
  }
  assert.equal(edit("sample_application/src/pacing.mjs", { SHIPSHOW_EDIT_SAMPLE: "1" }).status, 0, "a person can change the sample on purpose");
});

test("hooks: the Stop hook blocks on a failing test run once, never loops, and stays quiet when nothing it covers changed", () => {
  const stop = (payload, env) => hook("stop-tests.mjs", { cwd: REPO, ...payload }, { SHIPSHOW_STOP_ALWAYS: "1", ...env });
  const failing = stop({}, { SHIPSHOW_TEST_CMD: "echo 'not ok 3 - the docs rule holds'; exit 1" });
  assert.equal(failing.status, 2);
  assert.match(failing.stderr, /not ok 3 - the docs rule holds/);
  assert.equal(stop({ stop_hook_active: true }, { SHIPSHOW_TEST_CMD: "exit 1" }).status, 0, "the second stop is allowed");
  assert.equal(stop({}, { SHIPSHOW_TEST_CMD: "exit 0" }).status, 0, "passing tests let it stop");
  const quiet = hook("stop-tests.mjs", { cwd: "/tmp" }, { CLAUDE_PROJECT_DIR: "/tmp", SHIPSHOW_STOP_ALWAYS: "", SHIPSHOW_TEST_CMD: "exit 1" });
  assert.equal(quiet.status, 0, "not a git repository: nothing to check");
});

test("hooks: .claude/settings.json is valid, tracked, and names hook files that exist", () => {
  const s = JSON.parse(readFileSync(join(REPO, ".claude", "settings.json"), "utf8"));
  const commands = Object.values(s.hooks).flat().flatMap((m) => m.hooks.map((h) => h.command));
  assert.equal(commands.length, 3);
  for (const c of commands) {
    const file = c.match(/\$CLAUDE_PROJECT_DIR\/(\.claude\/hooks\/[\w-]+\.mjs)/)?.[1];
    assert.ok(file && existsSync(join(REPO, file)), `${c} names a hook file that does not exist`);
  }
  assert.deepEqual(s.hooks.PreToolUse.map((m) => m.matcher), ["Bash", "Edit|Write|MultiEdit|NotebookEdit"]);
  assert.ok(s.permissions.deny.includes("Read(./local/voices/**)"), "a voice clone is somebody's voice");
  for (const f of [".claude/settings.json", ".claude/hooks/lib.mjs"]) assert.equal(spawnSync("git", ["check-ignore", "-q", f], { cwd: REPO }).status, 1, `${f} must not be gitignored`);
  assert.equal(spawnSync("git", ["check-ignore", "-q", ".claude/skills/x"], { cwd: REPO }).status, 0, "the skill links stay ignored");
});

test("hooks: the git rules are this repo's; a squash-merged branch may be deleted with -D (#64, #105)", () => {
  const { mkdtempSync, writeFileSync, mkdirSync, chmodSync } = require_fs;
  const tmp = mkdtempSync(join(tmpdir(), "kx-hook-git-"));
  const sh = (cwd, ...args) => { const r = spawnSync("git", args, { cwd, encoding: "utf8" }); assert.equal(r.status, 0, r.stderr); return r.stdout.trim(); };
  const repo = (name) => {
    const d = join(tmp, name);
    mkdirSync(d);
    sh(d, "init", "-q", "-b", "main");
    sh(d, "-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "--allow-empty", "-m", "one");
    sh(d, "branch", "landed");
    sh(d, "-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "--allow-empty", "-m", "two");
    sh(d, "branch", "other");   // a commit of its own, so an answer about landed says nothing about it
    sh(d, "update-ref", "refs/remotes/origin/main", "HEAD");
    sh(d, "symbolic-ref", "refs/remotes/origin/HEAD", "refs/remotes/origin/main");
    return d;
  };
  const ours = repo("ours"), theirs = repo("theirs");
  sh(ours, "worktree", "add", "-q", join(tmp, "ours-wt"), "other");
  const tip = sh(ours, "rev-parse", "landed");
  // gh stands in: it records what it was asked and answers from $FAKE_GH_OUT, or fails
  const gh = join(tmp, "gh"), calls = join(tmp, "gh-calls");
  writeFileSync(gh, `#!/bin/sh\necho "$@" >> "${calls}"\n[ -n "$FAKE_GH_OUT" ] || exit 1\nprintf '%s' "$FAKE_GH_OUT"\n`);
  chmodSync(gh, 0o755);
  const run = (command, out, cwd = ours) => hook("guard-bash.mjs", { tool_name: "Bash", tool_input: { command }, cwd }, { CLAUDE_PROJECT_DIR: ours, SHIPSHOW_GH: gh, FAKE_GH_OUT: out ?? "", HOME: tmp });
  const merged = (oid, cross = false) => JSON.stringify([{ headRefOid: oid, isCrossRepository: cross }]);

  // #105: another repo's branches, stashes and resets are its business, however the command gets there
  for (const c of [`cd ${theirs} && git branch -D other`, "cd ~/theirs && git branch -D other", `git -C ${theirs} reset --hard`, "git -C ~/theirs clean -fd", "cd $HOME/theirs && git stash drop"]) {
    assert.equal(run(c).status, 0, `${c} is another repo's and should pass`);
  }
  // ...but this repo, a worktree of it, and a directory git cannot place still refuse
  for (const c of ["git reset --hard", `cd ${join(tmp, "ours-wt")} && git clean -fd`, `git -C ${join(tmp, "nowhere")} restore .`, `cd ${theirs} && cd ${ours} && git branch -D other`]) {
    assert.equal(run(c).status, 2, `${c} is this repo's and should be refused`);
  }

  // #64: -D on a branch whose tip is a merged pull request's head, here, is allowed; the guard asked gh about it
  writeFileSync(calls, "");
  assert.equal(run("git fetch -p && git branch -D landed", merged(tip)).status, 0, "a squash-merged branch can be deleted");
  assert.match(readFileSync(calls, "utf8"), /pr list --state merged --head landed --base main/, "the guard asked gh for merged pull requests from that branch into main");
  const refused = (c, out, why) => { const r = run(c, out); assert.equal(r.status, 2, why); assert.match(r.stderr, /git branch -D deletes a branch/, why); };
  refused("git branch -D landed", merged("0".repeat(40)), "a branch that moved after its pull request merged is refused");
  refused("git branch -D landed", merged(tip, true), "a fork's pull request with the same name does not count");
  refused("git branch -D landed", undefined, "gh failing (offline, signed out) keeps the refusal");
  refused("git branch -D landed", "not json", "an answer gh garbled keeps the refusal");
  refused("git branch -D landed other", merged(tip), "every branch named must have landed");
  refused("git branch -D missing", merged(tip), "a branch that is not there is refused");
  refused("git branch -D", merged(tip), "no branch named is refused");
});
