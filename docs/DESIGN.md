# ShipShow: design decisions and behaviour

Keep this file current: a decision, or a change to how ShipShow behaves, is recorded here in
the same change (`AGENTS.md`, *Docs that stay current*). Requirements are in
[PRD.md](PRD.md). Add decisions at the end of the log; do not rewrite a past one, supersede it
with a new entry that names it. Dates are absolute.

## Keeping these files current

The rule itself is in `AGENTS.md`; the detail that does not need to be in every agent's context is here.

- A new decision is a new entry at the end of the log: number, date, decision, why, what it
  costs. Never rewrite a past entry; supersede it with a new one that names it.
- A requirement keeps its ID. Move its status (done, in progress, planned, open) rather than
  deleting it.
- Behaviour lines name the file they come from, so they can be checked. Verify a line before
  you write it: read the code or run it.
- Ground a decision in evidence: a file, a measurement, a finding in `skills/REVIEW.md`, or a
  source you read. What you do not know goes in the PRD's open questions, not in a guess.
- `npm test` fails if either file is missing or empty, if `AGENTS.md` loses its *Docs that stay current* heading, if a skill
  is missing from the skills table or the PRD, if a critic is missing from `docs/assets/critics.svg`, if
  a number the docs quote (skills, characters of descriptions, longest `SKILL.md`, tests, critics) is not
  the tree's, or, in CI on a pull request, if code, skills, the plugin, CI, `package.json` or the README
  changed and the docs got no real change (whitespace and the `Last reviewed` date do not count) and no
  `docs: no change - <reason>`. It makes a stale number loud, not a stale claim: read the docs you touch.

## How it fits together

```
 facts ─► plan ─► script ─► voice ─► scenes ─► lint ─► render ─► MP4
 (sources.md,    (explain-   (Kokoro,   (HyperFrames           │
  Terms)         concept)    per        + kit/)                 ▼
   ▲                         sentence)                 review packet + frames
   │                                                            │
 code-context / change-context / decision-brief                 ▼
 (evidence-standard)                              fresh critics ─► findings ─► fix ─► repeat
                                                                │
                                                                ▼
                                                       explain-handoff (status, next step, unsure)
```

Three layers: **understand** (the context skills and `evidence-standard`), **make** (`bin/`,
`kit/`, `explainer-video`, `explain-concept`, `narration-writing`, `glossary`), **judge**
(`critic-loop` and nine critics). `explain-handoff` closes it. `npm run usage` watches the cost.

## Decision log

### D1. No speech recognition for timing (2026-10-17; narrowed by D44, reversed for runs of sentences by D47)
**Decision.** Word timing comes from voicing each sentence on its own, and placing a word by
its share of the sentence's letters. No ASR step in timing. (D44 adds an optional ASR that
verifies takes and never times them; D47 later lets Whisper time runs of sentences.) **Why.** `hyperframes transcribe` built
whisper.cpp and then timed out downloading its model after six minutes; a second model is a
larger download. **Consequence.** A cue can be a few hundred milliseconds off; fix it by
splitting the sentence or using `data-cue="+seconds"`. A spoken alias made through `say`
changes the voiced text but not the cue arithmetic (D16). Source: `AGENTS.md`, traps.

### D2. The builder never judges (2026-10-17)
**Decision.** Every critic is a fresh agent that never saw the build; never a fork, never the
builder. A video is done when its critics pass. **Why.** The builder sees its intent, not the
frames, and is biased to finish. Research on model judges also finds self-preference bias, a
judge favouring output like its own, which argues for a judge that differs from the builder.
**Consequence.** The loop spends agents per round; use a stronger model for the final round.
Source: `skills/critic-loop`; self-preference bias, <https://arxiv.org/html/2410.21819v1>.

### D3. `sources.md` is the ground truth (2026-10-17)
**Decision.** A claim not in `sources.md` does not go in the video. A fact the sources lack is a
gap to report. **Why.** A video that teaches a developer something false is worse than none.

### D4. Skills set the bar, not the method (team, 2026-10-17)
**Decision.** Skills say what good is and how it is judged. How an agent manages its context or
plans its steps is its own business. **Why.** A method rule is friction the next model has to
work around. **Consequence.** Who builds, who judges, and where facts come from stay fixed for
every agent. Round-two red-teaming found several of our skills still prescribing method
(templates, fixed order); those were marked as suggestions in round three, and round four found the
alias rule and the 0.8 starting speed each stated in several places (D15, D16). Source: `AGENTS.md`.

### D5. This repo is public (2026-10-17)
**Decision.** A video about another code base goes in `local/videos/`; a decision video always
does, unless it is an example about code in this repo that we mean to publish (D34: `videos/invoice-leak`,
about `examples/ledgerly`). Only this repo's own videos, the sample app's and such examples live in `videos/`. **Why.** A private
code base's details must not reach a public repo. **Superseded in part.** An earlier draft of
`evidence-standard` routed any public, licensed code to `videos/`; the red team showed it clashed
with `AGENTS.md` (round 2), so the rule is the narrower one above.

### D6. One shared evidence standard (2026-10-17)
**Decision.** `evidence-standard` holds the rules every context, brief and critic skill shares:
four tags (`[stated]`, `[read]`, `[ran]`, `[inferred]`), a pin, safe running, absence claims,
where the result goes. **Why.** Round one found the same five gaps in four skills; one place
cannot drift. **Alternative.** Restating the rules per skill, which is what had drifted.
Research points the same way: a citation looks like evidence but is only a claim about a source,
so it must be checked like any other claim (<https://kodekloud.com/blog/ground-llm-answers-with-citations/>),
and one preprint reports checking each citation mechanically against retrieved code
(<https://arxiv.org/pdf/2512.12117>, self-reported, one study).

### D7. Pinning when there is no commit (2026-10-17)
**Decision.** Committed code is pinned to a full SHA. Vendored code needs both pins: this repo's
HEAD (what cites resolve against) and the upstream SHA from `SOURCE.md`, labelled, with an
uncompared upstream SHA counted as `[stated]`. Uncommitted code is handed over as a patch or a
content hash, not a branch. **Why.** The sample app has no history here, and a branch name
moves. **Superseded in part by D18:** the offline tree hash now exists.

### D8. Read-only by default, run in a throwaway copy (2026-10-17)
**Decision.** Understanding a code base must not change it. Runs happen in a scratch copy with
a scrubbed environment; installs are a network call and need consent. **Why.** Red-teaming
showed commands writing into the repo and a `.env` being loaded.

### D9. The safe-running envelope is a script, not advice (2026-10-17)
**Decision.** Running goes through `skills/evidence-standard/scripts/sandbox-run.sh`: an empty environment (PATH
and LANG only), `HOME` and `TMPDIR` inside the copy, no network, writes confined to the copy, **no controlling
terminal** (a new session with stdin from `/dev/null`, so a command cannot type into the caller's shell with
`TIOCSTI`: found and tested under a real pty), no signalling or inspecting other processes, the clipboard,
preference, window-server, keychain and LaunchServices daemons denied, a list of credential, history and
shell-startup files under the real home unreadable, and `open`, `osascript`, `screencapture`, `say` and
`shortcuts` denied. macOS only (`sandbox-exec`); elsewhere it refuses rather than run unsandboxed. Paths are
profile parameters, never text, and risky scratch directories are refused (system roots, home and its
ancestors, dot-directories and `~/Library` under home, `/Users/Shared`, the firmlink alias) before anything is
created in them. **Why.** Testing showed `env -i` does not block the network, a copy does not stop a command
writing to `../`, `cp -R` carries a `.env`, a failed `cd` wrote into the real repo, a quote in a directory name
spliced into the profile string and added write access (round five), a sandboxed command could type into the
caller's terminal (round six), and denying a tool by name does not deny the capability (the screen was readable
through CoreGraphics until the window server was denied). **It is not a confidentiality boundary.** Reads
outside the denied list are open, and any daemon not listed is reachable; treat what a sandboxed command can read
as disclosed to it. Claude Code itself isolates with Seatbelt and Bubblewrap, and sandboxing limits damage without
making untrusted code trustworthy.
Sources: <https://medium.com/@Koukyosyumei/how-claude-code-and-codex-sandbox-untrusted-code-ba39b493046a>
(returned 403 to an automated fetch; unverified), <https://dev.to/traceseal/how-to-sandbox-an-ai-coding-agent-and-what-a-sandbox-cannot-prove-h9b>.

### D10. Tokens and context come from the transcripts Claude Code already writes (2026-10-17)
**Decision.** `npm run usage` reads `~/.claude/projects/<repo>/<session>.jsonl` and its
`subagents/agent-*.jsonl`, counting each API call once (a call is streamed over several lines).
**Why.** Nothing to instrument, and it covers subagents. **Consequence.** It depends on Claude
Code's transcript format; `CLAUDE_PROJECTS_DIR` points it elsewhere. Output tokens are as recorded in the
transcript and may undercount a call still streaming when it was logged. A test covers the counting on a
synthetic file and on a content-free fixture cut from a real subagent transcript (14 lines, 8 calls); the
script also runs from a path with a space or a symlink (it used to print nothing and exit 0 there).

### D11. A sample application to test the skills on (2026-10-17; replaced by D21)
**Decision.** `sample_application/` was Miguel Grinberg's microblog (MIT), vendored unmodified with its
`.git` removed: familiar, about 1,800 lines, real engineering to find. It served as the target of the first
four red-team rounds. **Superseded by D21**, which replaces it.

### D12. Merge, do not rebase, a long-lived branch (2026-10-17)
**Decision.** `main`'s rename to ShipShow and its README and `AGENTS.md` rewrite were merged
into the feature branch. **Why.** The branch was already pushed; a merge avoids a force-push.
**Consequence.** Reference material (commands, files, layout) lives in `AGENTS.md`; the README
is short. Skills point at `AGENTS.md`.

### D13. The end goal is a Claude Code plugin (team, 2026-10-17)
**Decision.** The repo root is the plugin: `.claude-plugin/plugin.json` (name `shipshow`, **no
`version`**), `skills/`, `agents/critic.md`, and a one-plugin `.claude-plugin/marketplace.json` with
`source: "./"`. `claude plugin validate .` passes for the marketplace and the manifest (it checks only those two); its
only warning, and the only thing `--strict` rejects, is the missing `version`, which is deliberate
(below). Install (Claude Code 2.1.275 or later):
`claude plugin install shipshow --marketplace latent-variable/shipshow` (the form `claude plugin install --help`
lists; not run here, since installing changes the user's settings), which works once this is on `main`.
**Why.** It installs in other repositories, with updates from the marketplace. Setting `version`
pins users to it until someone bumps it, so it is omitted and the commit SHA versions the plugin.
**Facts from the docs that shaped it.** Only `name` is required, in kebab-case, and may not start
with `claude-`, `anthropic-`, `anthropics-` or `cc-plugin-`, or equal a reserved name. Skills load
namespaced as `/<plugin>:<skill>`. An enabled plugin's skill names and descriptions sit in context
every turn (measured: 22 skills, 7,891 characters, about 1,973 tokens), so descriptions stay short
and SKILL.md under 500 lines (longest 217). A bundled script is found with `${CLAUDE_SKILL_DIR}`, so
the scripts live inside their skills, not in `bin/`. `${CLAUDE_PLUGIN_ROOT}` is substituted in skill
and agent bodies, hooks and MCP configs, but is not exported to Bash-tool commands. A `CLAUDE.md` at
a plugin root is not loaded as context. A plugin runs with the user's privileges.
**The critic agent.** `agents/critic.md` gives a critic Read, Grep, Glob, Bash and Skill and tells it
not to write. Bash can write, so it is told, not enforced; the sandbox script is the enforcement for
anything it runs. `critic-loop` names `shipshow:critic` for Claude Code.
**Known limits, not fixed.**
- `source: "./"` copies every tracked file (`git ls-files` counts them; about half a megabyte when this was
  written, a fifth of it skills, agents and manifests; not checked by a test). The rest (the sample app, videos,
  docs, tests, `package-lock.json`) is dead weight in the user's plugin cache. A plugin in a subdirectory would fix it, but the skills,
  `npm run skills` and this repo's conventions live at the root; that restructuring is deferred.
- A `bin/` at a plugin root is the reserved executables directory: its files go on the Bash tool's
  `PATH`, and claude.ai and Cowork do not install a plugin that has one. Ours are non-executable,
  extension-named Node files, so they are inert on `PATH`; the target is Claude Code, so the second
  point does not bite.
- Installed in a clone of this repo, every skill loads twice (the plugin and `.claude/skills`).
- Skills refer to each other by bare name (`critic-loop`); how that resolves under the
  `/shipshow:` namespace is untested.
- Which skills work outside a clone: three. `code-context`, `change-context` and `evidence-standard` need
  no repo files (running code needs macOS, for the sandbox). The rest produce an artifact only the pipeline
  consumes (`decision-brief`, `explain-concept`, `glossary`, `narration-writing`, `explain-handoff`: a brief,
  a plan, names, a script, a hand-back) or run or judge it (`explainer-video`, `critic-loop`, the nine
  critics, `theme`, `tailor`), and need this repo cloned and set up. They also cite `AGENTS.md`. `local/` is
  gitignored only here, so a skill that writes private material elsewhere first checks `git check-ignore
  local/` and uses `.git/info/exclude` with the person's consent. `repo-context` is for this repo only.
- `claude plugin validate .` passes with one warning, the missing version, and looks only at the two manifests
  (a broken skill or agent file does not change its output: checked); `validate skills` and `validate agents`
  look at components but are lenient. So a test runs `validate .` when the CLI is present and asserts the
  warning is the version and nothing else, and another parses every `SKILL.md` and `agents/critic.md` front
  matter (name, description, tools).
- The root has a `package.json` and a lockfile, so an install may try to install Node dependencies into
  the plugin cache (the docs describe runtime dependencies; whether `devDependencies` such as
  `hyperframes` are installed is untested).
**Open.** The Kokoro and HyperFrames pipeline (a 340 MB model, about 190 MB of Chrome, a Python
virtual environment) is not installed by the plugin (PRD, open question 3). Sources:
<https://code.claude.com/docs/en/plugins>, <https://code.claude.com/docs/en/skills>,
<https://code.claude.com/docs/en/plugins/manifest-reference>,
<https://code.claude.com/docs/en/plugins/create-marketplace>.

### D14. A ninth critic, grounding (2026-10-17)
**Decision.** `critic-grounding` judges that every shown excerpt, command and output is genuine
and from the named pin. It owns shown code and output; `critic-accuracy` owns claims and prose;
`critic-sync` owns timing. **Why.** A claim can be true while the output shown for it was never
produced. **Consequence.** The check is decidable, so it is scripted (`skills/critic-grounding/scripts/check-excerpt.mjs`,
tested) rather than left as prose: each `…`-separated segment must be contiguous lines of the file, in order, and every
omitted gap is listed and flagged if it contains a guard, branch, return or default. Capture files carry command, working
directory, pin, exit code, date, an output hash and the full output. A critic returns a
per-asset table with its verdict.

### D15. Pace comes from measurement, not a formula (2026-10-17; superseded by D24)
**Decision (withdrawn).** Start `speed` at 0.8 and adjust it from the review packet, because words a
minute is not 190 times `speed`: the repo's own `videos/how-it-works/REVIEW.md` shows scenes at 176 to 209
words a minute at speed 1.0 and the 0.85 video at 168 and 171, and the packet's rate is speech-only, so
cutting words does not change it. **Superseded** when main (#7) made `speed` a multiplier on a base of about
160 words a minute that the person chooses; the measurement that a scene's rate varies stands.

### D16. A spoken alias is written into the script (2026-10-17)
**Decision.** Where two identifiers sound alike or one name covers two things, write the alias
in the script itself and show the literal on screen on the same cue. Captions come from the script,
so a caption shows the alias; `critic-accuracy`, `critic-consistency` and `critic-sync` are told that
a recorded alias with its literal on screen is not a mismatch. `video.json` `say` is for
pure pronunciation of a one-meaning word. **Why.** `say` is global, case-sensitive and
whole-word, so it cannot disambiguate one written name across scenes; it also changes the
voiced text while captions and cue timing use the written text, which trips `critic-sync`.

### D17. Decision videos hand back a checked brief (2026-10-17)
**Decision.** The explainer checks every claim in the brief against the code and lists each as
confirmed, contradicted or not checked; it derives each option's costs from the code, treating
the brief's list as a floor; an assumption it cannot check is named in the video and the
hand-back. A hand-back is `ready` only when every required critic passed. **Why.** Round one's
red team planted a wrong claim and a hidden cost; the first version of the skill surfaced
neither, and round two surfaced the wrong claim but not the thin cost. Round three added: briefs
number their claims (`C1`..), a cost needs a mechanism, the explainer re-runs absence searches over
the whole tree and traces the recommended option end to end, the working agent (not the explainer)
judges whether the pick still holds, `critic-decision` sees the code at the pin, and `ready` requires
the full required critic set, defined in `explain-handoff`.

### D18. The offline tree hash exists (2026-10-17; supersedes the open item in D7)
**Decision.** A vendored directory's `SOURCE.md` records the upstream commit's tree hash, and
`skills/evidence-standard/scripts/verify-vendored.sh <dir> <hash>` checks it offline: it rebuilds the
directory's committed tree (without `SOURCE.md`) from this repo's own objects, compares it, and fails on
edits and on untracked files. It writes no object into `.git` (tested by counting objects) and works from
any directory in the repo. **History.** It was first a recipe in the microblog's `SOURCE.md`; running that
verbatim found two bugs (a `git write-tree` that wrote into `.git`, and a diff check run against the
temporary index), and round four showed it printed "no uncommitted edits" while an untracked file existed.
It is now a script with tests.

### D19. Decidable checks are scripts, and every recipe in a skill is run as written (2026-10-17)
**Decision.** Where a check is decidable it is code with tests, not prose: the excerpt check
(`skills/critic-grounding/scripts/`: `excerpt.mjs` and the CLI `check-excerpt.mjs`), the sandbox runner
(D9), `capture.mjs` (record and verify a capture; the sidecar is the SHA-256 of the whole file, so a changed
exit code is caught too) and `verify-vendored.sh` (D18). **Why.** Round three found a blocking bug in the
first excerpt script (a path with a space or a symlink printed nothing and exited 0, a false pass) plus
blank-line, empty-input, ambiguity and indentation defects; round four found that segments were not checked
against each other (a statement could be shown inside a block it is not in), that piping the script to node
exited 0 silently, and that large inputs crashed. Several recipes I had put in skills were wrong when run
literally (`|| stop`, `git grep -E` with `\b`, a diff check against the wrong index, a sandbox that let
`pbcopy` and `defaults write` through, a recorder that read a command's own exit 3 as a refusal).
**Consequence.** A script fails closed: no segments, a missing `--ranges`, a bad path or bad input never
exits 0, and the CLI has no entry-point guard to fail silently. Each reported bug has a test in
`test/pipeline.test.mjs`. A command written into a skill is run verbatim before it ships.

### D20. Judges are Sonnet only here (2026-10-17)
**Decision.** The red-team rounds ran on Sonnet 5.5. **Why.** The workspace limits agents to Sonnet:
six Opus agents were rejected at once with HTTP 429 (a configured limit of one request per minute).
**Consequence.** Every judge shares the builder's model family, so self-preference bias applies
(<https://arxiv.org/html/2410.21819v1>) and the red-team record is evidence of what a Sonnet attacker
finds, not proof. `critic-loop` still recommends a stronger model for a public release "where the
account allows it".

### D21. The sample is a pacing service built by three agents in one day (2026-10-17; replaces D11)
**Decision.** `sample_application/` is `pacer-demo`, a toy ad-spend pacer of about 80 lines of
dependency-free Node (about 250 with its tests and scenario), written for this demo and not Aperiam's code. Three agents each take one task: budget
pacing, batched ledger writes, and EUR and JPY campaigns. Each is correct for its task and each gets its
tests green; the morning after, the same traffic gives a US campaign 111% of budget, a EUR one 93% and a
yen one 181%, and no note says why. **Why.** The goal is a problem a developer who manages many agents would
recognise ("that could have been me"). Aperiam describes itself as an adtech and martech investor with an
Ads arm doing "emerging tech orchestration" and portfolio companies it helps grow; budget pacing is a
plausible service for one of them, and an overspend nobody can explain is a familiar one. The earlier
assumption that the company handles multimodal data is not supported by its site and is dropped.
**Design.** The bug is in the interaction, not in any change: pacing compares USD cents with a budget in the
campaign's own minor units (yen have none, so a 15,000-yen budget is read as $150); the throughput agent's
batching makes pacing read stale spend, and it edited the older tests to `flushEvery: 1`; the currency agent's
note says pacing needs no change; the one test that would catch it is marked `todo`. Real history: five
commits as patches, replayable (`history/replay.sh`) and checked by a test; the three hand-off notes each hold
one confident claim that turns out false; `ANSWER.md` is a labelled spoiler. **Why zero dependencies.** The
microblog needed Flask and an install the skills' safe-running rules forbid, so no agent could run anything;
this runs with `node --test`. **Checked** by a root test: the tests pass with two `todo` cases (EUR under budget, JPY over), the scenario prints
the documented percentages, and the README table matches.

### D22. The docs rule is structural and count-driven (2026-10-17; replaces the first form of the docs test)
**Decision.** `npm test` checks that both docs have content, that every skill is in the `AGENTS.md` table and
the PRD, every critic is in `critics.svg`, the plugin names match, that the numbers the docs quote (skills,
characters of descriptions, longest `SKILL.md`, test count, the number of critics) are the tree's as whole
numbers, that the PRD's `Last reviewed` date is not older than its last edit, and that every script a skill names
exists at the path it gives. In CI, a change to `bin/`, `kit/`, `template/`, `skills/`, `agents/`, `themes/`,
`test/`, `sample_application/`, `.claude-plugin/`, `.github/`, `package.json`, the lockfile, `requirements.txt`,
`README.md`, `AGENTS.md` or `CLAUDE.md` needs a docs change that adds at least 40 characters of text (a
punctuation edit or the review date does not count), or `docs: no change - <reason>` in the PR title or the
last non-merge commit (the CI checkout is a merge commit, which says nothing). **Why.** The round-four and
round-five auditors met earlier forms in letter while docs rotted: a trailing space, a punctuation edit, an
override on any commit, a substring match (`longest 142` satisfies `1420`), a reversed decision with its entry
untouched. **Still not caught:** a docs change that is real but wrong, a reversed decision whose entry someone
leaves true-sounding, and a PR title edit does not re-run CI unless the workflow listens for it. The rule makes
a stale number loud, not a stale claim.

### D23. The packet measures stillness and counts code in tokens (2026-10-17)
**Decision.** `bin/measure.mjs` holds the two measurements the review packet makes about on-screen time.
Reading time for code counts identifier tokens (`Author.followers.of_type` is four: an underscore splits one)
at 1.5 a second instead of words at 3.3, because a two-line query counted as 9 words passed the "short" check
while taking about ten seconds to read; a new *Stillness* table gives each scene's longest stretch with nothing new on screen.
`critic-pacing` holds the limit, so the number lives in one place.

### D24. Main's speed, themes and review plans are adopted (2026-10-17; supersedes D15)
**Decision.** After main moved (#7 to #10) this branch was merged and its own pace guidance withdrawn.
`speed` is the person's multiplier on a base of about 160 words a minute (1.25 by default;
`--speed`, `video.json` or `local/config.json`), `critic-pacing` judges each scene against about 210 syllables a
minute times it (main measures syllables, since words a minute runs high on short words; `BASE_SPM`),
and an off-target scene is fixed with fewer or plainer words. How much review a video gets is a plan with
presets, dials and a floor (`npm run critics`; the builder sets `importance`), so `video.json` no longer
takes a `critics` list and the template does not carry one. A video's look is a theme with motion tokens.
**What this branch added to that design.** `critic-grounding` is on the floor for a video that shows code or
output (`shows_code` in `video.json`, or a `<pre>` or `<code>` in `scenes.html`), so no preset or critics
list removes it, and `explain-handoff` takes the critic set from the plan instead of listing it. The
template keeps `audience`, which two skills read. **Consequence.** The docs and `narration-writing` no longer
say "start at 0.8"; the review packet prints the speed and the target.

### D25. Rounds five and six hardened the scripts, and the reading check queues (2026-10-17)
**Decision.** `verify-vendored.sh` fails on gitignored files and on `--assume-unchanged` or `--skip-worktree`
edits, validates its arguments, forces off the repo-local settings that hide edits (`core.fsmonitor`, whose hook
it therefore never runs, `core.fileMode=false`, submodule `ignore=all`), uses the repo's common directory so a
linked worktree works, and leaves `.git/index` alone; it creates no new object, ref or index entry, and may
refresh the timestamp of an existing object. `capture.mjs` JSON-encodes its header (the command as an argv
array, so a newline cannot forge a header line or an exit status), compares hashes case-insensitively, exits 2
on unreadable input, refuses a command that is missing, starts with a dash or was killed, and writes each file
to a random temporary name and renames it into place, so a symlink the sandboxed command planted at the capture
path or its sidecar cannot redirect the write (found: it overwrote a victim file; a swapped parent directory is
refused too). Its `ok` means integrity, not provenance: an unkeyed hash can be forged, and a critic still re-runs
the command. The packet's reading check is a queue: a viewer reads in order, so text that lands together waits,
and anything unreadable before its scene ends is `late`; a highlight, or a line cued inside a block already
shown, adds no reading; a count, pulse or type entrance is photographed after it finishes. **Known limit:** a
closed stdout cannot be detected, because Node reopens it as `/dev/null` at startup; "no output is not a pass"
is the rule.

### D26. Setup picks a Python Kokoro supports (2026-10-17)
**Decision.** `npm run setup` runs `bin/setup.mjs`, which takes the first of python3.13 to 3.10, then
`python3`, that is in range; `doctor` checks the version. **Why.** The pinned `kokoro-onnx 0.6.1` requires
Python 3.10 to 3.13, and `python3` is 3.14 on a current Homebrew machine, where pip refuses it (checked).

### D27. OmniVoice is an optional second voice engine (main, #11; adopted 2026-10-17)
**Decision.** `engine` in `video.json` or `local/config.json` picks `kokoro` (the default, anywhere) or
`omnivoice` (higher quality, clones a voice from a 3 to 10 second clip, Apple Silicon only through MLX). It installs
into the same `.venv` through `npm run setup:omnivoice`, which runs `npm run setup` only when no `.venv` exists, so this
branch's supported-Python pick (D26) applies to a fresh install; an existing `.venv` needs `npm run setup` first (D35). `doctor` lists the engine as optional until asked with `--omnivoice`.
**Consequences recorded by main.** A clone is somebody's voice (clone yourself or someone who agreed; `local/` never
leaves the machine); OmniVoice can drop or repeat a word and nothing here heard it back (later, D44, an optional check does);
a take's identity includes the voice file's bytes (the dropped words were fixed later, D31). This branch did not change any of it; the merge only combined
`doctor` (its version check and main's engine lines), `package.json` (both setup scripts) and the tests.

### D28. Review of #12: code in the scenes always gets the grounding critic; the scripts say "move aside", not "delete" (2026-10-17)
**Decision.** `shows_code` is true when `video.json` says so or when `scenes.html` holds code, so `"shows_code": false`
cannot lower the floor (`bin/lib.mjs`, `config`). `bin/setup.mjs` tells a person with an out-of-range `.venv` to
`mv .venv .venv.old`, and `verify-vendored.sh` leaves its temp directory to the operating system instead of
deleting it, in line with "the scripts never delete files".
**Costs.** A video cannot opt out of the grounding critic once it shows code; a verifier run leaves a small temp folder.

### D29. Main's launch theme, music bed and why-shipshow pitch video adopted (main, #13; 2026-10-17)
**Decision.** Merged main's third theme (`launch`), the optional music bed under the narration (needs `ffmpeg`, so `npm test`
needs it too, as CI already installs it) and the `videos/why-shipshow` pitch. In `bin/review.mjs` the packet keeps main's
syllables-a-minute pace target next to this branch's measured reading queue and stillness table; both import from
`bin/lib.mjs` and `bin/measure.mjs`. The skill count and description size did not change.
**Costs.** A machine without `ffmpeg` cannot load the test file (the music helper exits the process); install it first.

### D30. Main's caption rule for function words adopted (main, #14; 2026-10-17)
**Decision.** Merged main's caption fixes (a caption never ends on a function word, and carried function words never push one
past the 12-word limit) and the `how-we-built-it` video. Nothing on this branch touches captions; the merge was clean.
**Costs.** None known; the test count is now 47.

### D31. OmniVoice speed is a stretch after generation, never a shorter window (2026-10-17; corrects D27's consequence; a run of sentences is the exception, D47)
**Decision.** `bin/omnivoice.py` asks OmniVoice for each sentence at its natural length (mlx-audio's own sizing, padded
15%), trims the padding's silence from the take's edges, then applies `speed` with ffmpeg `atempo`, which keeps the pitch.
A take that comes out silent is voiced again with another seed (three tries). A reference clip over 10 s is trimmed at its
silent edges first, which keeps a transcript true, and cut at a pause only if it is still too long. A take's key records
the method, so old takes re-voice once.
**Why.** OmniVoice fills the duration it is given. Squeezed to 1.3x, 7 of 24 sentences of `why-shipshow` lost or garbled
words ("not a" vanished from "not a wall of logs"); generated at the natural length and stretched, none did, and none in
about 150 sentences across six videos (measured 2026-10-17 with Whisper, a diagnostic outside the pipeline: D1 stands).
The padding's silence was 13.8 s of a 67 s video. Eve's clip (built in, VCTK p361, CC BY 4.0) is one unbroken 9.3 s
sentence; cut at exactly 10 s it ended mid-word and short lines came out silent.
**Costs.** A changed speed re-voices every take, as before. `atempo` past about 1.5 starts to smear consonants; the
tested range stays 1.0 to 1.3.

### D43. Sound effects are placed on cues, refuse two habits, and are set against the voice (2026-10-26)
**Decision.** Ported in spirit from DAIS product-videos (`studio/sfx.py`), fitted to ShipShow, where every cued element's time
(`data-at`) and every sentence's start are already known at build, so nothing is measured from a browser. `data-sfx="name"`
on a cued element (offset, gain, step in `data-sfx-*`) or `sfx(name, time, {gain, step})` in the scene script; the script is
read as text, with `cueAt`, `sceneStart` and `sceneEnd` evaluated in a sandbox, so CI needs no Chrome (kit.js defines the same
helpers and a no-op `sfx` so the page still runs). `bin/sfx.mjs` writes `assets/sfx.wav` (stereo, 48 kHz, track 32, as the
music bed) and `assets/sfx.json`. Synthesis is Node (`bin/sounds.mjs`), seeded, so a render repeats and CI tests it; there is
no Python. **Two refusals**, both Lino's: a run (3 of one sound within 1.25 s: a rising tick on each of 17 checks distracted,
2026-10-24) and any sound audible (within 20 dB of its own peak) from 0.05 s before to 0.45 s after a sentence's first word
(read as a glitch in the voice, 2026-10-26). A refusal names how far to move the sound. **Level** is relative and measured
(K-weighted 400 ms momentary loudness, checked against ffmpeg's ebur128 in a test): `under` dB, 14 by default, below the voice's
integrated loudness, plus the kit's and the call's gain. Pitched sounds take the key of the bed (Krumhansl-Kessler over its
chroma) or `sfx.tonic`. A sound's `anchor` is `peak` (a swish swells to its cue) or `start` (a trombone begins at it).
**Why not.** A browser to read `sfx()` times (heavy, absent in CI, a second copy of the timing); sound files only (licences,
cannot be tuned); a limit of N sounds a minute (a count cannot tell a landing from a list). **Alternatives kept open.** Sounds on
the first word are allowed by nothing; a person who disagrees turns sound off or edits the kit.
**Not verified.** How the sounds sound: every synthesis was checked by spectrum, envelope and click tests, and no agent can
listen. The boom, scratch and trombone are the likeliest to want a person's ear and a tweak in `kit/sfx.json`.

### D44. Every take is cleaned, levelled and, optionally, heard back (2026-10-26)
**Decision.** Ported from DAIS product-videos, where the owner heard these faults in published videos before anything
measured them. `bin/voicecheck.py`: OmniVoice takes have the opening burst cut at the silence after it, are voiced again
(three seeds) when the voice starts with no lead-in or a 400 ms stretch runs over 8 dB above the take's own median, and
every take of either engine is set to a median speech of -20 dBFS with peaks capped at -6 dBFS (a tanh knee, not a hard clip; D47 replaced the knee).
Kokoro takes are levelled in place after voicing; the take's key is unchanged and a `.lvl` stamp (rules' version and a hash of
the key) says it is done, so nothing is voiced again. `bin/hearback.py`: with faster-whisper installed (`npm run
setup:hearback`, `requirements-hearback.txt`; small.en pinned by revision) each take is transcribed and scored against the
text the engine was told to say, by letters with spaces and punctuation gone and numbers spelled out; OmniVoice keeps the best
of three; a take under 0.97 is flagged. Results live beside the take as `<scene>-<n>.check`, are collected into `timing.json`
`voiceCheck`, and `bin/review.mjs` prints them (*Voice checks*). A voice with no transcript is given one by hearing its
reference back as the model sees it (decoded from its tokens), cached beside it. **Why.** The models sample: two takes of one
line differ and now and then one mangles a word, shouts, or opens on a click. Levelling is cheap and helps both engines.
Hear-back is verification: D1 stands because timing still comes from voicing each sentence on its own, and the check is optional
(CI, Kokoro-only users and machines without the 480 MB model skip it). **Measured (2026-10-26, this Mac).** how-it-works with
Kokoro: speech level spread 5.8 dB before (-20.8 to -26.6 dBFS), 0.8 dB after; every take's peak at -6 dBFS; 17 of 17 heard back
at 100%. Under OmniVoice 17 of 17 at 100%, no shout, no take starting at once; openings -45 to -82 dBFS. In this mlx-audio
revision the opening burst of a built-in voice is small (peak about -56 dBFS, 4 of 10 takes had voice within 100 ms of it) so
the cut mostly removes it and some leading silence; a clone cut from a VCTK clip started speaking at the first sample on 23 of
24 seeds, which no retry or longer window changed, so such takes are kept and listed. Calibration of the 0.97: a take
against its own text 100%; one word dropped or wrong in a 12-word sentence 91 to 95%, a dropped leading "A" 96%, a phantom leading "And" 90%, a doubled word 91%; so the DAIS scene threshold of 0.90
would have missed a single wrong word. **Costs.** A changed rule or installing hear-back voices OmniVoice takes again once
(the key carries both). Hear-back adds about 1 s a take on CPU, and a Whisper that mends a slurred word passes it. What
nobody can measure here: how any of it sounds.

### D32. Karaoke captions are a theme option (2026-10-17)
**Decision.** A theme sets `--cap-style: karaoke` and `--cap-words` (the line length); `bin/build.mjs` reads them from the
theme's CSS and wraps each caption word with its time as `data-word-at`; `kit/kit.js` lights the word being spoken (the
`--cap-hot` colour, a lift and a glow), keeps spoken words in the ink colour and unspoken ones dimmed. `plain` stays the
default, so `shipshow`, `paper` and `launch` are unchanged; `buildday` turns it on.
**Traps found building it.** A word timed as `data-at` was picked up by the cue engine and given the theme's entrance, so
unspoken words sat lower; hence `data-word-at`. A scaled word grows into the spaces beside it, so the lit word lifts and
glows instead. A line that continues its sentence appears at once and the gap between lines is 20 ms, under one frame:
fading each line in from nothing made the caption blink between lines (a sync critic caught it at 63.8 s).

### D33. The buildday theme and the horizon ambient (2026-10-17)
**Decision.** `themes/buildday` takes the LA AI Hackathon page's look (deep space navy, ember, ice and iris; Space Grotesk
and JetBrains Mono, both SIL OFL, in the theme folder) without its logo or name. `--ambient: horizon` draws a lit planet
rim low in the frame, rising slowly; it is marked as intentional overflow for HyperFrames' layout check. The README's
diagrams are drawn in the same look by `docs/assets/make-assets.mjs`, which embeds the fonts cut to the letters each
image uses, because an SVG shown as an image cannot load a font from anywhere else.
**Costs.** A scene written for a dark theme can look muddy in `paper` where it uses a light-on-dark gradient on text
(`invoice-leak`'s headings); the theme grid in the README shows it.

### D34. A decision video's folder may start with only the brief (2026-10-17)
**Decision.** `npm run new` scaffolds into a folder that holds nothing but the working agent's `brief.md` and keeps the
brief; any other file still refuses, so a video is never overwritten. The skill told the working agent to write the brief
first and `new` refused the folder, so the handoff could not run as written. `videos/invoice-leak` is the handoff run end
to end: a brief about `examples/ledgerly` (a fictional invoicing API with one authorization bug), a fresh Sonnet explainer
agent that built it, and four critic rounds with a floor re-check.
**Costs.** None known.

### D35. Setup upgrades pip before it installs (2026-10-17)
**Decision.** `npm run setup` runs `bin/setup.mjs`, whose steps come from `setupSteps` in `bin/python.mjs`: make `.venv`
unless one exists, upgrade the venv's pip, install `requirements.txt`. An existing `.venv` is not recreated, but its pip is
upgraded too. `doctor` now tells a person whose Kokoro install is missing to run `npm run setup`, not a bare `pip install`.
**Why.** A new venv's pip can be too old to find a current wheel. Python 3.10.9 ships pip 22.3.1, which cannot find
`onnxruntime>=1.20.1` and stops with "No matching distribution found" (reproduced from scratch; with pip 26.2.1 the same
requirements install). A test locks the order in, so the upgrade cannot slip behind the install.
**Costs.** One more pip call, and a network fetch, on every setup. `npm run setup:omnivoice` still installs with the venv's
current pip, so an old venv needs `npm run setup` first.

### D36. The last scene holds; `hold` adds still time (2026-10-17)
**Decision.** Every scene but the last fades out at its end; the last stays up, so the video's final frame is the finished
picture (`kit/kit.js`). `video.json` `"hold"` adds plain seconds (not scaled by speed) after the last word, laid onto the
last scene (`bin/voice.mjs`); the default is 0.
**Why.** The team presents a decision video live and talks over its recommendation after it ends. The last scene used to
fade over its final 0.3 s and then go blank, so an ended player showed an empty screen.
**Costs.** None known; the music bed already fades out on its own over the last 2.5 s.

### D37. `make` passes its flags to `build`; the docs were reconciled with the code (2026-10-17)
**Decision.** `npm run make -- <folder> --theme paper` now previews a theme, as the README and the `theme` skill
always said; `make` had passed its flags to `voice` and `render` but not to `build`, so the theme was silently ignored.
A consistency pass, an independent audit against the code, also aligned the pacing target everywhere (about 210
syllables a minute times the speed), where a published example decision video lives (D5, D34), the entrance list (to
`slam`), what `setup:omnivoice` does to an existing `.venv` (D27, D35), the floor (grounding for a video that shows
code), the caption tokens a theme can set, the layout (`examples/`, all four videos) and the voice credit for `eve`.
**Costs.** None known.

### D38. Code excerpts show their source and range in the shared kit (2026-10-21)
**Decision.** `kit/base.css` renders `.ss-code`'s `data-source` and `data-ranges` in a `::before` label. The
label stays outside the code node so `extract-excerpts.mjs` can validate only the excerpt text; the grounding critic
reports a major finding when the rendered file or range label is absent. **Why.** The explainer skill described a
gutter that the kit did not render, leaving the shown code without attribution. **Costs.** Code scenes must provide
both attributes, and the shared theme tokens determine the label's typography and color. Sources: issue #46;
`kit/base.css`, `skills/explainer-video/SKILL.md`, `skills/critic-grounding/SKILL.md` and
`skills/critic-grounding/scripts/extract-excerpts.mjs`.

### D39. A plan, not a change: Claude best practices (2026-10-17)
**Decision.** Wrote `docs/PLAN.md` from Anthropic's docs and engineering posts (read by a research agent on 2026-10-17) and
measured facts about this repo: `AGENTS.md` is 267 lines against a 200-line yardstick, no skill description puts its trigger
first, `agents/critic.md` is read-only only by instruction, there are no hooks, and `.claude/` is gitignored whole, so
project settings and rules cannot be committed. Nothing in the plan is done.
**Why.** Hard rules here ("never delete", "docs stay current", "the sample stays buggy") are prose plus CI, and no run's
cost or critic agreement is recorded. **Costs.** None yet; each step names how to tell it worked and the unconfirmed items
to check first (plugin-shipped agent hooks, how a missing `version` resolves).

### D40. CI installs a pinned static ffmpeg, not the apt package (2026-10-26)
**Decision.** The `test` job downloads ffmpeg 6.0.1's static build (johnvansickle.com old-releases, a stable URL), checks its
SHA-256, and installs `ffmpeg` and `ffprobe` into `/usr/local/bin`; the step has a five minute limit and the job fifteen.
**Why.** `apt-get update && apt-get install ffmpeg` sat silent on the Ubuntu mirror for 33 minutes on main and 26 on the
security-gate branch (2026-10-26), and stalled again on #55, while the same step usually takes under a minute. **Costs.** The
version is pinned and moves only by hand; the host is one person's site, so a dead URL fails the step loudly in seconds.

### D41. Project hooks enforce the rules that were only prose (2026-10-17; plan steps 2.0 to 2.3, 2.7 of `docs/PLAN.md`)
**Decision.** `.claude/settings.json` and `.claude/hooks/` are tracked (`.gitignore` ignores only `.claude/skills/`, the links
`npm install` makes, and `.claude/settings.local.json`). Three hooks: **`guard-bash`** (PreToolUse on Bash) refuses `rm`,
`unlink`, `shred`, `find -delete`, and the git commands that discard or rewrite work (`restore`, `clean`, `reset --hard`,
`checkout --`, `branch -D`, `stash drop`, a force push), looking inside `sudo`, `xargs`, `bash -c`, `$( )` and backticks;
**`protect-files`** (PreToolUse on Edit and Write) refuses `sample_application/src/` (the bugs are the demo), the recorded runs
beside their SHA-256 and `package-lock.json`; **`stop-tests`** (Stop) runs `npm test` if the session changed anything the tests
cover and exits 2 on a failure, once: `stop_hook_active` lets the second stop through, so an unfixable failure cannot loop.
`permissions.deny` keeps `.env*` and `local/voices/` unread (a clone is somebody's voice). A person overrides on purpose with
`SHIPSHOW_ALLOW_DESTRUCTIVE=1`, `SHIPSHOW_EDIT_SAMPLE=1` or `SHIPSHOW_ALLOW_PRIVATE=1`.
**Bash is covered too (review of #21).** Agents here edit and read through Bash, so `protect-files` and the Read denial alone
left holes. `guard-bash` now (1) refuses a command that names a protected path as the target of a write form (`>`, `>>`, `tee`,
`sed -i`, `perl -i`, `cp`/`mv`/`install`/`ln`/`rsync` destination, `truncate`, `dd of=`, `patch`, and inline `python -c` or
`node -e` that names one and writes), using `protect-files`' own rule and override; (2) refuses a command that reads `.env*`
or `local/voices` (`cat`, `head`, `grep`, `sed -n`, `< file`, a `cp` source, inline interpreter code); (3) splits on grouping
parens, so `(rm f)` and `<(rm f)` are seen, and scans a heredoc fed to a shell (`bash <<EOF`). It follows a simple `cd`. Copying a clip INTO `local/voices` (`cp`, `mv`, `>`)
stays allowed, and the voice pipeline reads the clips from node, never from a command line, so it is untouched. **It is a
seatbelt, not a sandbox**: it reads the command text, so a path built in a variable, a glob that expands to it, a script
that writes it inside, a heredoc fed to python, or `grep -r x .` from the root get through. Real isolation is `sandbox-run.sh`.
**Why.** CLAUDE.md is advisory and hooks are enforced (Anthropic's memory and permissions docs); the repo's hard rules were prose
plus CI. **Checked** by `test/hooks.test.mjs`, which feeds each hook payloads on stdin: 21 refused commands, 16 allowed ones,
the override, bad input; Bash writes, reads and grouping each have a refused list and an allowed list.
**Found by using it.** The hook was live in the session that wrote it and, on its first run, refused a pull-request body
(a heredoc whose markdown had `rm` in backticks): it read backticks as command substitution everywhere. A heredoc body with a
quoted delimiter is now text, and substitutions are looked for only outside single quotes (an unquoted heredoc and double
quotes still run them, so `"`rm x`"` is refused, correctly).
**Costs.** The guard reads the command string, not what the shell will do: a script that deletes inside itself, or a command
built from a variable, gets through; it is a seatbelt, not a sandbox (`sandbox-run.sh` is that). `npm test` needs `ffmpeg`
(`doctor` says), and a machine without it hears about it at every first stop. Hooks run in the person's session and are
loaded when it starts.

### D42. Memes come from the memegen catalog, and ShipShow draws the text (2026-10-26)
**Decision.** A `<figure class="ss-meme" data-meme="<id>">` with a span per line is a meme. `bin/meme.mjs` fetches the
template's `config.yml` (the text boxes: `anchor_x`, `anchor_y`, `scale_x`, `scale_y`, `angle`, `align`, `color`, `font`) and
its clean `default.<ext>` from github.com/jacebrowning/memegen (extension tried in turn: gif, jpg, png, jpeg; D49), once, into
`~/.cache/shipshow/memes/<id>/`; `bin/build.mjs` copies the picture to `assets/memes/`, and positions each span by its box in
percent of the picture with the box's angle; spans fill boxes in order. `kit/kit.js` fits each line to its box (the largest
font size at which the wrapped text fits both ways), synchronously and again when the fonts are ready, then the cue engine
animates each span on its own word. Text is white with a black outline (black text gets white), upper case, Titillium Web Black
or SemiBold (memegen's `thick` and `thin`), Anton for `impact`; the font files and their OFL licences are in `kit/fonts/`.
`npm run memes` searches the catalog (cached, `--refresh`); `SHIPSHOW_MEMEGEN_API`, `SHIPSHOW_MEMEGEN_FILES` and
`SHIPSHOW_MEMES_CACHE` move the catalog, the repo's files and the cache, and either source may be a folder, which is also how
the tests run without a network. The review packet lists each meme's template, name and source.
**Why.** Memegen's own rendered images carry a "Memegen.link" watermark and bake the text in, so a line cannot arrive on its
word and the text is a raster at the picture's size. Drawing it ourselves keeps it crisp at 1920 by 1080 and cueable. Reading
the config at build time keeps the catalog out of this repo: the whole 211-template catalog follows memegen without a copy.
**Licensing.** Memegen's code and configs are MIT. The template images are third-party pictures (each template's `source` is a
Know Your Meme page): they are fetched at build, never committed, and `videos/*/assets/` is ignored, which covers
`assets/memes/`. Publishing a video with memes relies on fair use and commentary norms; that is the publisher's call, and the
packet's `source` is there so it can be credited. Fonts: Titillium Web and Anton are SIL OFL.
**Costs.** A first build of a new template needs the network (or a mirror); a cached one does not. The config is parsed by a
small reader for memegen's flat YAML, not a YAML library, so a template with a richer config than the 211 today (every one
has a `text:` list of maps) needs it extended. Templates with `overlay` image slots keep the plain picture, with no overlay. A line too long for its box even at 6 px is clipped to the box (`data-overflow`) and logged as a warning, so the frames show the fault where it is. A word never breaks inside itself (`overflow-wrap: normal`): with `break-word` the fitter took the largest size at which "ENGINEERING" fit by splitting it across two lines (never-about-the-code, 2026-10-26), so now it shrinks until the longest word fits whole. A line also keeps a 2% margin each side: at full width, "ENGINEERING" ended 4 px from the picture's edge (round 5).
An id is checked to be a plain name before it reaches the cache path, and a colour from a config is accepted only as a name or
hex, since both go into the page.

### D45. The critic cannot Write or Edit, and stops after 40 turns (2026-10-17; supersedes the critic agent paragraph of D13)
**Decision.** `agents/critic.md` adds `disallowedTools: ["Write", "Edit", "NotebookEdit"]`, `maxTurns: 40` and `model: sonnet`
(was `inherit`). The loop's `model` dial still overrides the agent's model, so a person who asks for another judge gets it.
D13 said the critic was "told, not enforced"; the writing tools are now enforced, Bash is not (it can still redirect or
`mv`), and the agent is still told to work in a temporary directory. `maxTurns` is above the most a critic used in two rounds
of `videos/pacer-dev-journey` (20 tool calls, a grounding critic) so it stops a runaway, not a careful run.
**Checked.** `claude plugin validate .` and `validate agents --strict` pass; a test asserts the three fields and that no writing
tool is in `tools`; and a headless run (`claude --plugin-dir . -p`, asked to write a file through the `shipshow:critic` agent)
reported it had no Write or Edit tool and created nothing. That agent also listed only Read, Bash and Skill: Grep and Glob were not
among the tools it saw, which this change did not cause (`tools` is unchanged) and was not investigated.
**Not done.** A frontmatter hook to deny Bash writes outside a scratch directory (plan step 3.1's second half): whether a
plugin-shipped agent's own hooks run is unconfirmed, so the Bash limit stays a stated one. **Costs.** A critic that needs more than 40 turns
stops early and returns what it has; raise `maxTurns` if a longer video needs it.


### D46. A pause after one scene, not only at the end (2026-10-26)
**Decision.** `video.json` `"pauses": {"<scene>": seconds}` adds plain seconds (not scaled by speed, 0 to 10) after that scene's
last sentence: the scene lasts longer, its sentences do not move, and every later scene starts that much later. `bin/voice.mjs`
adds it where it adds `tail`; `bin/lib.mjs` refuses a value that is not a number in range.
**Why.** `never-about-the-code` puts memes on punchlines that end their scenes, and the critics found every one cut away before it
could be read (round 1, pacing). `gap`, `lead` and `tail` apply to every scene, and `hold` only to the last, so the only way to give
one punchline a beat was to slow the whole video. product-videos has the same thing as a per-scene `hold`. **Costs.** A long pause
is dead air for the ear: at 1.6 to 2.2 s on top of the scene gap, round 2's pacing critic heard four three-second silences, so
the video settled on 0.8 to 1.3 s.

### D47. OmniVoice voices runs of sentences, Whisper times them, and levelling no longer squashes (2026-10-26)
**Decision.** Three changes from one listening. The owner heard a video in his cloned voice and called it "really choppy",
with short words that "sound really bad, like I'm really close to my mic". (1) **Levelling** (`bin/voicecheck.py` VERSION 2):
a take is multiplied by one gain that moves its median speech toward -23 dBFS and is held back so its loudest sample stays at or
below -3 dBFS. Nothing is clipped or soft-clipped. The old rule set the median to -20 dBFS and squashed everything over 0.4 into a
tanh knee at 0.5; natural speech peaks 19 to 25 dB over the median, so short takes lived in the knee (samples over 0.4, on 14
sentences: "It's a fair worry." 16.9%, "Sound familiar?" 11.0%, mean 4.1%, up to 13% of a take's samples piled against the 0.5
ceiling). A Kokoro take stamped by the old rules is voiced again (a `.lvl` stamp from an older VERSION), since levelling it again
cannot undo a squash. (2) **Runs.** With OmniVoice and faster-whisper installed (and without `--no-hearback`) a scene is grouped,
after `say`, into runs of whole sentences up to 45 words (`groupRuns` in `bin/lib.mjs`; a longer sentence stands alone), and
each run is one take, `<scene>-r<n>.wav`, cached by its written and spoken text, voice, speed, check version and method, so
editing a sentence re-voices its run. It keeps the per-take checks (opening burst cut, shout and silence retakes, best of three by
hear-back score) and tries a clean start five times, as DAIS product-videos does, not three. Gaps are the existing `gap` between
runs and none inside them. Why: voicing every sentence alone restarts its prosody; product-videos voices runs of up to 45 words
(a 268-word scene in one call lost a quarter of its words, every scene over about 150 words fell to 90 to 94%) and the owner
approved its narration. (3) **Whisper times the run.** The same transcription that scores the take is run with
`word_timestamps=True` (`hearback.hear_words`), and `bin/wordtime.py` lays the script over it: script and transcript are compared
as letters (the hear-back normalisation, numbers spelled out, a year read as a year or a quantity, whichever matches), difflib
matches them, and a written word is placed where its first matched letter was heard once half its letters matched. `say` is
respected because the worker is given each written word with what it is said as (`spokenWords`); a `say` key of several words
belongs to its first. A word nobody heard is placed between its matched neighbours by letters. A sentence starts at its first word
and ends at its last, the last of a take no earlier than 0.1 s before the take ends (Whisper cuts the final word short).
`timing.json` keeps its shape and each timed sentence gains `words: [{"w", "at"}]`, absolute seconds; `build` uses them for cues
(`wordTimes`) and caption lines, and uses the letter share for a sentence without. **Speed** for a run is a shorter window
(`pace: "window"`), not atempo (D31): at speed 1.2 on the five runs of the test video, three takes each way, both scored a mean
0.998 heard back and none fell under 0.988, so the squeeze that dropped words at 1.3x on single sentences did not at 1.2 on runs, and
it is what the owner has heard approved. D31 stands for a take of one sentence. The window is used only up to speed 1.2 (`WINDOW_MAX` in `bin/voice.mjs`), the speed it was measured at; above it
(the 1.25 default, up to 1.3) a run is generated at its natural length and stretched, as D31 says. **Unchanged:** Kokoro, and OmniVoice without
faster-whisper or with `--no-hearback`, keep one take per sentence, atempo and the letter share.
**Why this reverses D1.** D1 refused ASR because `hyperframes transcribe` timed out downloading a model. faster-whisper is already
installed for hear-back, so timing costs no second download; a take per sentence sounded choppy; product-videos times its cues this
way. **Measured (2026-10-26, this Mac, the cloned voice).** Whisper's sentence start against the first speech onset in the audio
(energy, after a 120 ms pause), 8 sentences that follow a pause: median +0.01 s, mean 0.04 s, worst 0.21 s. The other six sentences
run on from the one before with no pause to detect. Letter-share cue estimates for the same words were off from the heard time by
up to 0.8 s ("Hopper" -0.81, "1952" +0.71). Every one of 132 words matched in all six runs. Hear-back per run 0.988 to 1.0.
Levelling: samples over 0.4 on the same 14 sentences 16.9% at worst before, 1.0% after, and the runs 0.5% at worst, none piled against a
ceiling; run takes sit within 1.4 dB of each other (-23.2 to -24.6 dBFS), while single short sentences under the new rule can end up
10 dB under their neighbours ("Sound familiar?" -33 dBFS) because their peak is the limit. **Costs and not verified.** A run is
re-voiced whole for one edited word; hear-back is now timing, so a machine without it falls back to the sentence path and a
different sound. **A hissy reference is cleaned (reversed by D53: it made the voice hollow).** The clone copies the room of its clip: the owner's (background -39 dBFS) gave takes with no
silence after the opening burst, so every run was "starts at once" and the fallback cut 30 ms into its first syllable, heard as
choppy. `bin/omnivoice.py` `quiet()` measures a reference's background (10th percentile of its 50 ms levels) and, above -52 dBFS,
runs it through a 70 Hz high-pass and two mild `afftdn` passes (background about -57, speech level unchanged) before cloning: 0 of 5
runs flagged, against 5 of 5 raw and 2 of 5 with one stronger pass (nf -20, nr 30); every run heard back at 97% or more. The built-in
clips (-56 to -87) are left alone. `REF_PREP` in the take's key voices takes again when the preparation changes. (Fixes #60.)
Whisper's word times are good to a tenth of a second and its last words in a take run short. Nobody here can listen: whether runs
sound less choppy, and whether window beats atempo to the ear, is the owner's to judge.

### D48. Portraits come from Wikimedia Commons, behind a licence gate (2026-10-26)
**Decision.** `<figure class="ss-portrait" data-commons="File:Name.jpg">` is a credited photo. `bin/portrait.mjs` asks the Commons API
(`prop=imageinfo`, `iiprop=url|extmetadata|size`, `iiurlwidth=900`, a `User-Agent` naming ShipShow, as Wikimedia asks) for the file,
keeps its thumbnail and a reduced copy of its metadata in `~/.cache/shipshow/commons/<name>-w900/`, and `build` copies the picture to
`assets/portraits/` and writes the `<img>`, the builder's `<figcaption>` and a credit line. The gate reads `LicenseShortName`, `License`
and `NonFree`: it accepts public domain (`pd*`), CC0, and CC BY or CC BY-SA with a version (an optional jurisdiction suffix), and refuses
the rest, including a licence Commons leaves empty. A CC file whose `Artist` is empty is refused (the licence needs a name); a public-domain
one is credited to its `Credit` text, else "Wikimedia Commons". The gate runs on every build, over the cached metadata too, so tightening it
reaches files already fetched. `Artist` is stripped of tags and entities before it reaches the page. `review` lists each portrait's file page,
author, licence and licence link. `SHIPSHOW_COMMONS_API` (a URL, or a folder of replies for tests) and `SHIPSHOW_COMMONS_CACHE` move the source and cache.
**Why.** A builder would otherwise download, credit and style each photo by hand and get a licence wrong; a CC BY-SA photo without its
author is a licence breach, and a non-free file is worse. The gate is the point: it fails at build, before a render, with the file named.
**Look.** `ss-portrait` in `kit/base.css`: the photo in the theme's card, border, radius and shadow, the credit on a dark gradient at its
foot (white text in every theme, so contrast does not depend on the photo), the name in `--font-display` and the line under it in `--muted`.
Opt-in `ss-portrait-gray` and `ss-portrait-duo` (grayscale multiplied over `--accent`). Checked on `shipshow` and `paper` (2026-10-26).
**Costs.** Commons' metadata is as good as its uploaders: a file can be mislabelled (the research note flags two YouTube stills), the gate
trusts what Commons says, and "no attribution required" public domain files are still credited. A non-image or a very odd thumbnail type
(TIFF, SVG) is not handled. The first build of a file needs the network; the 900 px thumbnail of a small original is the original, upscaled
by the frame, so a 238 px photo looks soft at the default size (Backus): set `--portrait-height` smaller.

### D49. A moving meme is a video the build writes, and its scene is not timed (2026-10-26)
**Decision.** Two sources, one pipeline. `data-meme="rollsafe"` plays a template whose clean `default.gif` is animated (17 of
memegen's 211 have one); `<figure class="ss-meme" data-clip="<url or file>" data-crop="top 98px">` plays any GIF, MP4 or WebM
(an Imgflip clean MP4, `https://i.imgflip.com/<id>.mp4`, is the usual one). `bin/meme.mjs` fetches a URL once into
`<cache>/clips/<hash>` (a file is read from the video's folder; the first bytes must say GIF, MP4 or WebM, so an error page is never
cached), reads the crop (`top|right|bottom|left` with `%` or `px`, several allowed, kept to even pixels), and `ffmpeg` writes
`assets/memes/clips/<key>.mp4`: cropped, 30 fps, no sound, H.264 at CRF 14 with a keyframe a second, **looped to the time the
figure is on screen** (its cue to the scene's end). The key hashes the source bytes and every parameter, so a changed clip,
crop or cue is a new file and an unchanged one is not encoded again. The figure holds a `<video class="clip" data-start data-duration muted>`
with the figure's own `data-at` as its start, so it plays at real speed from the figure's arrival. Text is optional: `<span class="top">`
and `<span class="bottom">` (or first and second in order) are drawn in the meme style in bands at 3% and 77% of the picture, fitted and
cued like a template's. The packet lists each animated meme with its source URL; `data-name` and `data-credit` set the name and the
page to credit. An unreachable clip with nothing cached, a file that is not a clip, a malformed or all-consuming crop, too many spans
and a figure with both `data-meme` and `data-clip` stop the build naming the scene.
**Why.** HyperFrames renders frame by frame, seeking a `<video>` through ffmpeg frame extraction (so the same frame number gives the
same picture); an `<img src="x.gif">` is turned into a video by HyperFrames itself, but one that starts at time 0 and loops over the whole
composition, not at the figure's cue. Baking the loop into the file, not a `loop` attribute, keeps the playback a function of the time
alone and independent of how the renderer treats `loop`. The memegen picture is tried as gif first because some of them keep a
still beside it (`fine` has a `default.png`, `rollsafe` a `default.jpg`) and the old order took the still.
**The scene is not timed.** `hyperframes lint` refuses a `<video>` inside an element that also has `data-start` (its frame extractor
and its visibility disagree about the offset). A scene that holds a video therefore has no `data-start`, `data-duration` or `clip` class,
and keeps its times in `data-scene-start` and `data-scene-duration`, which `kit/kit.js` reads (`sceneSpan`); it already showed and hid
every scene on the GSAP timeline, so nothing else changes. Other scenes keep `data-start`.
**Measured (gif-test, 15.7 s, three clips, 2026-10-26).** Two renders of the build with no `slam` gave 470 identical frames (the render
uses parallel workers that seek out of order); against the source clip, the picture matched the clip's time within one frame at three
points in each of three clips, and a 1.6 s clip's frame at 2.0 s matched the source at 0.4 s (the loop). Render time was 15 s with three
stills and 17 to 21 s with three clips (standard quality). A `slam` text entrance is not frame-identical across two renders (about
270 pixels, in the text only; the kit's `tl.to` with a yoyo, not touched here).
**Costs.** A first build of a clip needs the network, and ffmpeg and ffprobe (already required). A GIF's transparency is flattened, not
kept. A clip is looped, never held on its last frame, and its own sound is dropped. The look is bound to the source's size: Imgflip
clips are 266 to 960 px, soft at 800 px. The white caption band some clips carry (Dafoe's was 29%, found by measuring a frame, not guessed)
is cut with `data-crop`. Clips are third-party and unlicensed: fetched, never committed, a published video relies on fair use and
commentary norms, and that is the publisher's call (D42).

### D50. The lofi theme, and ambient layers that sway, wrap and jump (2026-10-26)
**Decision.** `themes/lofi` is a late-night study room: a dusk sky (`--sky`, a gradient on the canvas), lamp amber, mint and
rose, Fraunces for headlines and quotes, Nunito for text and captions, IBM Plex Mono for code (all SIL OFL, in the theme
folder). Six ambients join the kit, any theme may name them: `blobs` (pools of light as radial gradients, never a blur filter),
`dust`, `skyline` (two rows of seeded buildings drawn once as SVG, drifting apart, a few windows switching on and off),
and `grain`, `scanlines` and `vignette`, which go in an `#overlay` made only when a theme names one, after the scenes and
before the captions: they lie on pictures and text like film but never on the captions. Photos and memes get a cream print
frame and a warming filter (`--meme-border`, `--photo-filter`), and the `--frame` and `--portrait-*` tokens are set for the
framed portrait being built alongside. Every new token is read with a fallback that is the old value, so `paper` renders
pixel-identical to main (all ten review frames of how-it-works, 2026-10-26).
**How the motion stays repeatable.** A sway, a wrap or a jump is not a tween between two values, so each is a pure function
of the time: one linear tween of the property from 0 to TOTAL, mapped by a GSAP modifier (`driveBy` in `kit/kit.js`). No
callback is involved (a seek with suppressed events still draws it), the grain's jump is a hash of its step and the seed, and
the value at time 0 is set when the layer is made, because a timeline sought to 0 on a fresh page does not render. A test runs
`kit/kit.js` in a Node sandbox with a recording GSAP, Math.random and Date.now throwing, and samples every driven property
backwards across the video: the same seed gives the same page and motion, another seed another layout.
**Traps found building it.** `scale` cannot take a modifier (CSSPlugin splits it into scaleX and scaleY); unmodified, the
pools grew to 21 times their size and washed the frame mauve. A z-index on `#overlay` made it a stacking context, so the
grain's `mix-blend-mode` blended with nothing and greyed the frame; the children carry the z-index instead. HyperFrames'
layout check reads a gradient background over text as a cover, so the vignette is an inset box-shadow, and the allow-flags
only count on the text, not on the cover.
**Costs.** Measured by seeking and screenshotting 120 frames in headless Chrome: lofi with every layer 67 ms a frame, with
none 39, the default `shipshow` theme 135 to 169 (its `glow` is a 140 px blur), so lofi is cheaper than the default; grain is
most of the added 28 ms. A full draft render of how-it-works took 30 to 33 s with `shipshow` and 38 s with `lofi`, run to
run swings on this machine were up to 8 s; the shipped fonts account for much of it (`launch`, which also ships fonts, took
39 s). The skyline sits behind the bottom 200 px of every scene, so a scene that puts content there sits on buildings.

### D51. A run gets a breath between sentences that ran together (2026-10-27)
**Decision.** When `voice` lays out a run that Whisper timed, every boundary where sentence k's last word ends less than the
video's `gap` (divided by speed) before sentence k+1's first word starts gets silence for the difference. It goes in at the
quietest 10 ms window within 80 ms of the boundary, with a 5 ms fade out and in, and only if that window is under -40 dBFS (`BREATH_QUIET_DB`; speech sits around -23), so no word is cut: a boundary with no quiet point near it is left as it is; the sentences and words after
it move by the same amount in `timing.json`. Nothing is voiced again and the take on disk is unchanged. **Why.** Round 2 of the
never-about-the-code critics measured gaps of 0 to 0.25 s inside runs (eight of them, four at 0 or 0.02 s) next to 3 s pauses
between scenes, the rushed-then-stopped rhythm the owner had called choppy. Runs keep one prosody (D47); this keeps their sentences
apart. **Measured (2026-10-27, the 12-scene video, speed 1.0, gap 0.35).** 5 breaths inserted across 23 runs; every one of 66
sentence gaps now at least 0.34 s (Whisper's word ends are rounded), none under 0.25. **Costs.** The breath is digital silence,
not room tone, under a music bed it is not heard as a drop; a boundary Whisper placed wrongly gets its breath at the quietest
point near the wrong place, which is still between words.


### D52. A render is mastered to the loudness it is played at (2026-10-27)
**Decision.** After HyperFrames writes the MP4, `render` brings its audio to `video.json` `"loudness"` (LUFS; `local/config.json`
next; -14 by default, what YouTube plays at; `false` for none): ffmpeg's loudnorm measures it, one `volume` gain moves it to the
target, and an `alimiter` (5 ms attack, 50 ms release, ceiling 0.5 dB under -1 dBTP) catches the few peaks the gain pushes over.
The gain is held back so the limiter takes at most 3 dB off any peak (`MAX_LIMIT`); a video whose peaks would need more lands under
its target and the render says so. The video stream is copied, never re-encoded; the file is stamped (`comment`) so a second run
does nothing. **Why.** The never-about-the-code second cut came out at -19 LUFS once the narration stopped being squashed (D47):
YouTube turns loud videos down to about -14 and never turns quiet ones up, so it would have played 5 dB under its neighbours.
loudnorm's own second pass was not used: when the peaks do not fit at the target it silently switches to dynamic mode, which
compresses, the sound the owner rejected. **Measured (that render).** -19.0 to -14.7 LUFS, true peak -1.3 dBFS, a 4.6 dB gain; the
limiter acted on 0.055% of samples (3.4% of 50 ms windows), against 4% on average and 13% at worst of every take under the old
tanh levelling. **Costs.** A second AAC encode of the audio (192 kb/s); a video with music much louder than its voice is still
mastered by its whole mix.

### D53. A clone's reference is used as recorded; a take's silence is read against its own background (2026-10-27; reverses D47's cleaning)
**Decision.** `quiet()` in `bin/omnivoice.py` cuts and resamples a reference and does nothing else. `voicecheck.clean` finds the
silence after the decoder's opening burst with `quiet_level`: SILENT (-45 dBFS), or 6 dB over the take's own background (its 10th
percentile 10 ms window) when that is louder, never closer than 8 dB to the take's median window. `voicecheck.py` VERSION 3 and
`REF_PREP` 2 voice every OmniVoice take again once. **Why.** D47 denoised a reference whose background was over -52 dBFS (two afftdn
passes) because the owner's clip, hiss at about -39, gave takes that all read as "starts at once" and were trimmed into their first
syllable. The owner listened to the result: his voice "doesn't sound clear at all ... like I'm talking through a paper towel roll",
and the original recording "sounds way cleaner" than the cleaned one. The measurement had chased the wrong cause: the takes did have
a pause after the burst, but it carried the clip's hiss and never fell under the fixed -45 dBFS, so the check could not see it, and
`trim()` then cut 30 ms of good audio. **Measured (2026-10-27, scenes 01 to 04 of never-about-the-code, the uncleaned clip, fresh
takes).** Fixed threshold: 6 of 6 runs flagged and trimmed. Background-relative, capped 12 dB under the median: 3 of 6. Capped 8 dB
under: 0 of 6, every run heard back at 97% or more. 0.35 s of extra start room (product-videos' LEAD) made no difference to the flags
and slowed the read, so it was not kept. **Lesson.** A change to how the voice sounds is judged by ear before it ships; D47's
numbers improved while the voice got worse, and nobody listened until the video was done.

### D54. With runs, a script line is a take (2026-10-27)
**Decision.** When a scene's script file has more than one line, and every line ends its last sentence, `voice` makes each line one
take (`lineRuns` in `bin/lib.mjs`); a line over 70 words (`LINE_MAX`) is split by the old rule. A one-paragraph file keeps the
45-word runs of D47. **Why.** On the third cut of never-about-the-code the owner heard sentences "broken up in awkward places ...
they don't sound like they're meant to be one after the other": a word count cut thoughts in half and joined unrelated ones. The
writer knows where a thought ends; a line break says so. **Costs.** A long line is a long take, where OmniVoice drops words more often
(D47's measurements); hear-back's best of three and the 97% flag still catch it, and lines over 70 words are split.

### D55. Drama 3 is the directed engine: the script carries stage directions (2026-10-27)
**Decision.** A third engine, `"engine": "drama"`: Fish Audio Drama 3 (the 4-bit MLX conversion, pinned in `bin/lib.mjs`
`DRAMA`), run by `bin/drama.py` from its own venv, `.venv-drama` (`npm run setup:drama`), because it needs an mlx-audio commit
newer than the 0.5.9 OmniVoice is pinned to; the venv carries faster-whisper, so its takes are always heard back. A script line
may carry stage directions in brackets: `directedSentences` (`bin/lib.mjs`) keeps them in what Drama 3 is told and takes them
out of everything else (captions, cues, `timing.json`, word counts, and the text Kokoro and OmniVoice are told). Each line is one
take (D54), cached by the line as told, so changing a direction voices that line again. A take is retaken when it is silent,
stalls 2 s inside or ends in 3 s of silence, is time-stretched to `speed` (0.8 to 1.5; the model has no speed control and reads
at about 130 words a minute from the owner's clip), levelled, heard back, and the best of five kept. **Why.** The owner, on
hearing Drama 3 against OmniVoice: use it, because it lets the script "drive the narrative ... the quality, the tone", so that
"where we're using humor, sarcasm, whatever, it comes across", and make that "available for others going forward". OmniVoice
reads every line the same way; a direction is the only place a writer can say how a joke lands. **Measured (2026-10-27, the owner's
15 s clip, one line on two or three seeds per direction).** At a line's start: `[excited]` widened the pitch range from about
2 semitones to 3.1 to 3.6 and quickened the read, `[deadpan]` narrowed it to 1.3 to 1.6, `[whispers]` dropped the level 6 dB on
one seed of two, `[dry, matter-of-fact]` and `[playful, mock-serious]` kept every word on 6 of 6. Timing directions broke the take:
`[pause]` and `[long pause]` 4 of 4, `[slowly]` 2 of 2 (seconds of silence, the rest of the line never said), `[shouting]` 1 of 2.
A direction in the middle of a line lost the words after it on 5 of 6; `[laughs]` mid-line or at the end lost a sentence on 3 of 5;
with no direction, a short last sentence was dropped on 1 seed of 3. So the rules in `narration-writing` (*Direction*): one tone
direction per line, at its start, a new line where the subject changes (a joke stays in one take: below), never a pause. **Costs.** About 40 GB of free memory while it
runs; once the model is loaded a line, heard back and retaken, took about 11 s, so never-about-the-code's 52 lines voiced in about
8 minutes. The licence (Fish Audio Community License) is free under $500K a year in revenue and forbids a hosted service and
cloning without consent; the weights are downloaded by whoever runs it, never shipped here. What a direction sounds like is judged
by ear: hear-back proves the words, not the tone. **Names (2026-10-27).** A `say` respelling with a hyphen is read as two words:
the owner heard "Dike-stra" as "Di... kistra", and Whisper heard it as "Dekeestra" and "Dikestra". Voiced twice each, "Dykstra"
came back as the name both times and "Dijkstra" as written once in two; Veracode, Quattro and Redis were right as written. So with
Drama a name is written as it is spelled, and respelled only as one word, checked by voicing it. **Stalls of hiss
(2026-10-27).** A take that is mostly the clone's hiss has its quiet level pinned at SILENT (-45 dBFS) while the hiss sits near
-40, so a 3 s stall of hiss inside "Both true. So ... you don't trust the output" read as voice, passed every check, and only a
sync critic heard the dead air. Silence inside a take is now also anything 18 dB under the take's loud level (its 90th percentile,
`GAP_BELOW_VOICE`): over that video's 62 takes it caught the stall alone (2.5 s; the next longest gap was 1.5 s). The same flaw kept a take's edges: one opened on 2 s of hiss (-33 to -37 dBFS, inside 18 dB of the voice), so a
take's edges are now where its level holds 15 dB under the voice for 50 ms, walked back up to 0.25 s while within 6 dB of that
line so a soft first syllable stays (D53); on all 62 takes the start found was within 0.1 s of Whisper's first word. `DRAMA_RULES`
went to 3, so every Drama take is made again under both once. **A joke is one take (2026-10-27, reverses this entry's
"a new line where the tone turns").** Split from its setup, "Like animals." and "No. ... Also no." were each voiced with no
memory of what came before and landed, the owner said, "almost like they were written separately". So a setup, its turn and its
punchline share a line, and the opening direction carries the arc ("[teasing, then deadpan]"; "each answered deadpan" paused 2.2 to 2.7 s before "No." on three seeds running); a new line
starts where the subject changes. A punchline is also the sentence Drama 3 drops: the first merged take lost "No." and still
scored 98.8%, because two letters barely move a letter score. So hear-back now also lists a sentence that is missing
altogether, each of its words short in what Whisper heard (`hearback.vanished`), and Drama retakes such a take like one under
97% (`DRAMA_RULES` 4); over the video's 44 takes it found that "No." alone. A take that stalls on every seed no longer stops the video: the shortest stall is kept with its fault, ranked
below any clean round, and listed to listen to.

### D56. A quote is shown where it was said: screenshots taken at build (2026-10-27)
**Decision.** `<figure class="ss-shot" data-shot="<url>" data-find="<words>">` is a screenshot of a real page. `bin/shot.mjs`
opens it in headless Chrome (HyperFrames' own, `hyperframes browser path`, through `puppeteer-core`, now a direct dev
dependency; `SHIPSHOW_CHROME` overrides), in dark mode by default at 2 device pixels per CSS pixel, finds the words (whitespace,
case and curly quotes ignored), and captures the element `data-select` names (or the box around several, the words looked for inside
the nearest element holding them, elements with no size skipped: GitHub hides empty dialog headings inside a review, and one at the
page's top made a 9,450 px capture) or else the block holding the words (a paragraph, a list item; a block taller than a screen,
like a whole post in one `<pre>`, is cut to the paragraph between blank lines). `data-lines` keeps only the lines holding the words
and N more, cut on line boundaries, because a critic found a whole METR paragraph unreadable at 14 px for a ten-word point. It
records one box per line the words run over, so the kit draws a marker on exactly those words; `data-mark-cue` sweeps it in on
a later word. The figure shows a bar naming the page (`data-source` names the address to cite when the page captured is an
embed: an X post is captured through `platform.twitter.com/embed/Tweet.html?id=<id>&theme=dark`, which needs no sign-in). The
capture is kept in `~/.cache/shipshow/shots/<key>/` (`SHIPSHOW_SHOTS_CACHE`), keyed by every input that changes the picture and
`VERSION`; a page that cannot be loaded, an element or words not on it, stops the build naming the scene and the page; nothing is
cached for a failed capture. `review` lists each under *Screenshots* with the date it was captured. **Why.** The owner, on the
fifth cut of never-about-the-code: "if we could get screenshots of 'you don't understand this code' in people's PRs that we can
reference, as opposed to just making a note of it". A card that paraphrases a comment asks the viewer to trust the video; the
page itself is the evidence, and a mock comment (the fifth cut's "senior-reviewer commented on PR #4021") reads as invented.
**Costs.** A capture takes 3 to 8 s and needs the network once; a page can change or vanish, so the cached picture is what the
video shows, and its capture date is in the packet. The pictures are third-party, never committed, shown as commentary.

### D57. A photo's credit goes in the description, not on the photo (2026-10-27; changes D48's look)
**Decision.** The portrait's credit line stays in the built page and the packet, but is hidden unless a theme or figure sets
`--portrait-credit: block`. `review` writes *Credits*, a line per portrait and per screenshot ready to paste into the video's
description, and `review/credits.txt`. The licence gate is unchanged. **Why.** The owner: "why are we saying where the pictures of
the people come from ... nobody does that when they make videos like this". CC BY and CC BY-SA ask for credit in a manner
reasonable to the medium, and a video's credits go in its description; a credit drawn on a face covered a third of a 300 px photo.
**Costs.** The credit now depends on the publisher pasting it: the packet says so, and `critic-accuracy` checks that it is there.

### D58. The signal theme (2026-10-27)
**Decision.** `themes/signal`: near-black graphite under a soft top light, warm white text, a highlighter yellow (`--accent-3`,
the progress bar, the karaoke word, a screenshot's marker) for the one thing to look at, hot red for a complaint, green for what
held up, sky blue for a source. Bricolage Grotesque 800 for headlines, Inter for text and captions, JetBrains Mono for code (SIL
OFL, in `fonts/` with their licences). Pictures sit flat with a hairline edge and a long shadow; a faint grid, a vignette and light
grain are the only ambient motion. **Why.** The owner on the fifth cut, in `lofi`: the motion "does kind of feel cool, but ... the
colours and the fonts, we can do much better". `lofi` is a mood (dusk, a serif, dust); an argument with screenshots as evidence
wants contrast, a type that reads at a glance, and one colour that means "look here". **Costs.** None for other themes: it only
sets tokens the kit already reads.

by ear: hear-back proves the words, not the tone.
### D59. The chalk theme: a blackboard for math and theory explainers (2026-10-27)
**Decision.** `themes/chalk` is a blackboard at night: a slate-green board with a soft lamp in the middle (`--sky`), chalk white
ink, chalk yellow for the thing to look at, chalk blue and pink as second and third voices, chalk dust drifting (`dust`), faint
pools of light (`blobs`), grain and a vignette over the pictures, and `wipe` between scenes like an eraser. It reuses the lofi
theme's fonts (Fraunces, Nunito, IBM Plex Mono, SIL OFL), copied beside it. **Why.** The first video about a math result
(`videos/eth-is-false`, OpenAI's ETH preprint) needed a look made for its story, a hypothesis written on a board and erased, and the
owner's canon gives every video a look of its own; lofi is the opinion channel's study room and the others are product looks. It
is token-only, built on the layers D50 added, so no kit code changed. **Costs.** One more theme folder (about 270 KB of fonts,
duplicated from lofi so each theme stays self-contained).

## Behaviour

What an agent or person observes. Each line is checkable against the cited file.

**The pipeline** (`bin/`, `kit/`)
- `voice` voices one sentence at a time (or, with OmniVoice and hear-back, runs of sentences up to 45 words, D47) and writes `timing.json`. A take is cached by its text,
  voice and speed, so inserting a sentence re-voices every later sentence in that scene (numbering restarts per
  scene; the cost per take has not been measured).
- A bracketed stage direction in a script line reaches only the Drama 3 engine; captions, cues, `timing.json` and the other engines get the line without it, and a line's direction moves with the line, never to the next one (`directedSentences`, D55).
- A sentence timed from a run carries `words: [{"w", "at"}]` in `timing.json`; `build` places cues and caption lines on those times (`bin/build.mjs`, `heardAts`), and on the letter share for a sentence without.
- `build` writes `index.html` from `scenes.html` and the timing. It stops on a cue word its
  scene never says and warns when a bare cue word occurs more than once in its scene. A cue
  matches the start of a spoken word across the whole scene, so use `word#n` or a distinctive
  word.
- `build` expands each `ss-meme` figure (D42, and D49 for a `data-clip` or an animated template, which becomes a video): an unknown template, an unreachable source with nothing cached, or more spans than
  the template has boxes stops it naming the scene; `review` lists each meme's template and source; `memes <words>` searches the catalog.
- `voice` also levels every take and, with faster-whisper installed, hears each back (`bin/voice.mjs`,
  `bin/hearback.py`, `bin/voicecheck.py`; D44): it prints `LISTEN` for a sentence under 0.97 or kept with a fault, and
  records them in `timing.json` `voiceCheck`, which `review` prints as *Voice checks*.
- `build` also places sound effects (D43): a `data-sfx` or `sfx()` call becomes a sound in `assets/sfx.wav`, peaking (or starting) at the cue; it stops on a run of one sound, on a sound over a sentence's first word, and on an unknown sound; `"sfx": false` turns it off. `review` lists each sound with its time, scene, level against the voice and audible span under *Sound effects*.
- `render` writes `out/<name>.mp4`; `make` chains voice, build, lint and render.
- `build` expands each `ss-portrait` figure (D48): a refused licence, a missing file or an unreachable Commons with nothing cached stops it naming the scene and the file; `review` lists each portrait under *Portraits*, and every portrait and screenshot under *Credits* and in `review/credits.txt`; the credit is not drawn on the photo (D57).
- `build` expands each `ss-shot` figure (D56) from the cache, or by capturing the page in headless Chrome: a page that cannot be loaded, a `data-select` with no match or `data-find` words not on the page stops it naming the scene and the page, and leaves nothing in the cache; `review` lists each under *Screenshots* with its capture date.
- `review` writes `review/packet.md` (words a minute while speaking, every pause, every cue's
  time and reading time, with code counted in tokens, the longest still stretch of each scene) and
  `review/frames/`. The packet measures; the critics judge.
- `usage` prints, per agent, API calls, input, output, cache-write and cache-read tokens,
  peak and last context, wall time and model, and a total; `--json` for data.
- `critic-grounding` runs `check-excerpt.mjs <source> <excerpt> --ranges ...`: exit 0 and `ok: true`
  only when every `…`-separated segment is consecutive source lines (blank lines ignored, relative
  indentation and text exact) at the stated lines and the segments sit at the same relative depth as in
  the source; exit 1 on a mismatch, an empty excerpt or an
  ambiguous or wrong range; exit 2 on bad usage or input. It lists each gap with a preview and flags
  guards, branches, decorators and early exits.
- `sandbox-run.sh <dir> <cmd>` runs with no network, writes confined to `<dir>` (paths are profile parameters, not
  text), the clipboard and preference daemons denied, and credential folders under the real home unreadable; it refuses (exit 3) where it cannot sandbox
  and exits 2 for `$HOME`, `/`, a directory holding `.git`, or bad usage.
- `capture.mjs record <dir> <file> -- <cmd>` writes a header, a `---` line and the raw output plus a
  `.sha256` of the whole file, and keeps the command's own exit code; `verify` exits 0 matching, 1 altered,
  2 unsupported (no sidecar). `verify-vendored.sh <dir> <hash>` prints MATCH only for the upstream tree with
  no edits and no untracked files.
- Scripts never delete files. Generated files are gitignored. The kit renders entrances on a
  cue (the list, `up` to `slam` including `type`, `draw`, `count`, `highlight`, `scramble` and `glitch`, is in `AGENTS.md`); an
  exit, a swap and a connector between boxes need a custom `<script>`.

**The skills**
- A context line is `[tag] claim. path:line`, with `tested` or `untested` on behaviour lines.
  Nothing cites a line for absence, so it is `absent: <thing>; searched: <command>; result: none`.
- A change is read commit by commit as well as by range, because a range diff hides what a
  commit label disguises. A commit's label is a claim, not evidence.
- A decision brief states the decision as a question, every option with gains and costs, doing
  nothing as an option, the pick as the working agent's, and at least one assumption it has not
  verified. The explainer returns a hand-back whose first line is `Status: ready | not ready`.

**The loop** (`critic-loop`)
- One fresh agent per critic per round, run in parallel; nothing is rebuilt while a round runs.
  Findings carry a severity; a verdict is `fail` on any blocking or major finding. A finding
  that survives three rounds, two critics that contradict, or a round that only finds problems
  in the last round's fixes escalates to a human.

## How the design was tested

The skills and scripts were red-teamed by fresh adversarial agents, six per round, who planted defects of
their own choosing in a sample app and then attacked the skills, the scripts and these docs. Each round's
findings, what changed, and what is still open are in [`skills/REVIEW.md`](../skills/REVIEW.md); the
rounds so far found fewer blocking problems each time and caught more planted defects by the skills' own
method, while each fix exposed the next layer. Every judge was Sonnet (D20). The numbers belong in that
file, not here.
