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
every turn (measured: 23 skills, 8,350 characters, about 2,088 tokens), so descriptions stay short
and SKILL.md under 500 lines (longest 248). A bundled script is found with `${CLAUDE_SKILL_DIR}`, so
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
middle of the first stretch of real silence that reaches past Whisper's end of sentence k and is followed by voice, searched from
80 ms before that end to 300 ms past the start of k+1 (`BREATH_BEFORE`, `BREATH_AFTER`), with a 5 ms fade out and in. A stretch
counts only when it is at least 30 ms long (`BREATH_RUN`), every 10 ms of it is under -50 dBFS (`BREATH_QUIET_DB`; speech sits
around -23, a trailing "s" at -40 to -46), and 30 ms of voice (over -35 dBFS, `BREATH_VOICE_DB`) follow within 150 ms
(`BREATH_ONSET`): a stop's closure inside the last word (the silence in "firs-t") is followed by a burst and quiet, not voice. The
first such stretch, never a later one, because a comma pause inside sentence k+1 would put the breath mid-sentence and move words
whose times do not move (the PR reviewer, #117). So no word is cut: a boundary with no such stretch near it is left as it is; the sentences and words after it move by the same amount in
`timing.json`. **Changed 2026-10-29.** The first rule took the quietest single window within 80 ms under -40 dBFS. In
qwen-phones-home that was the dip as "address" and "keys" began their final "s": the breath split the word, "addre... ss", and the
owner heard it at 6:43 and 6:49. Whisper ends a word before its sibilant has, so the real pause lay past the old window, and the
"s" itself, at about -42 dBFS, counted as quiet. Re-laid on that video's 39 runs from the cached takes; the measured gaps are in its REVIEW.md. Nothing is voiced again and the take on disk is unchanged. **Why.** Round 2 of the
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

### D60. Letters spelled out are a fault, and a second model listens to the finished track (2026-10-27)
**Decision.** `bin/hearback.py` `spelled_out` finds groups of capital letters in what Whisper heard ("EN", "E N", "E.N.")
that are not an acronym of the script line as written or as told to the voice; Drama 3 retakes such a take like one missing
a sentence (`DRAMA_RULES` 5), keeps the best of five, and lists any still faulty; Kokoro's check flags it. `bin/listen.py`
then has NVIDIA's Parakeet (parakeet-tdt-0.6b-v3, pinned, on MLX through parakeet-mlx, in `.venv-listen`) hear each scene of
the finished `narration.wav` and compares it with the script as written: letter score, missing sentences, spelled letters.
It flags and never re-voices; the packet shows it, and marks it stale when the narration's hash changes. **Why.** The owner
heard eth-is-false say "two to the E N" on almost every line: `say` mapped n to "en" and Drama 3 read the respelling as letters.
Hear-back passed every take, because it scored against the respelling and lowercased Whisper's "EN" into "en". Both models had
heard it (Whisper "EN", Parakeet "E N" and "Ean", measured on the published cut), so the fault was what we compared against,
not the ear: comparing with the written word, and reading Whisper's capitals as a signal, catches it. The owner asked for a
Parakeet pass; it is a transducer, not a decoder with a language model, so it mends less from context and fails differently,
which is what a second listen is for (it heard "Ed TEH" where an ETH sounded wrong). **Costs.** One more optional venv (about
200 MB) and model (about 2.5 GB); about a minute for a ten-minute track. A capital A or I alone is read as a word, so "A I"
spelled out where the script does not spell it is missed. **Tested** by unit tests on Whisper's and Parakeet's real
transcripts of the published cut, a Drama 3 run with a fake model and fake hearing (retaken until clean; kept with the fault
when every round spells), a control with the retake rule removed (the test fails), and an end-to-end voice and listen on a
throwaway Kokoro video. **Then** (same day): the missing-sentence check reads a run of single letters as one word on both
sides (`joined_letters`), because the script writes an initialism one way and each listener another: eth-is-false's "ETH."
(told to the voice as "E T H.") was reported unheard by both Whisper and Parakeet, which wrote "E.T.H.". Tested both ways
round, and that a dropped sentence starting with a letter ("A cat.") is still found.

### D61. Named moods give each act its own look and music (2026-10-27)
**Decision.** `video.json` `"moods"` names sets of look and music; a section's `data-mood` picks one, and it carries forward to
the following sections until another names a mood (`bin/moods.mjs`). A mood starts from the video's theme and flair, adds its
own `theme`'s tokens (its files copied under `assets/theme/<name>/`, its `@font-face` rules added), then its `look`. An `ambient`
builds that mood's own seeded layers with the shared builders; without one the base ambient stays. In the page, `kit/kit.js`
crossfades one backdrop per mood (over black, added with `plus-lighter`, so a crossfade is a true mix and never dips) and the
ambient containers over 1.2 s centred on the boundary, tweens colour and plain-number tokens on `#root` on the shared timeline,
and switches fonts, caption tokens and anything else it cannot tween at the midpoint. `musicBed` with moods mixes one track per
music change: each starts at the head of its 1.5 s crossfade, so its own opening fades in; a mood without music, or whose file
is missing, keeps the previous track playing. **Why.** The owner watched a ten-minute explainer and found every act felt the
same: one theme, one flair and one bed for its whole length. A mood is a named flair set, the same idea `flair` already is for
a whole video, so an act can span scenes, and a later act can come back to an earlier look. Timeline tweens and seeded ambient
keep any frame renderable alone (D50). **Costs.** More ambient DOM and theme files per distinct mood, one decoded track per music
change. A token with no base value switches at the midpoint. A video cannot return to its base look except through a mood that
restates it. **Tested** by `test/moods.test.mjs` (carry-forward, unknown names, namespaced fonts and files, midpoint switches,
tweens, synthetic tones before, during and after a music boundary), and a three-scene Kokoro demo built, checked and rendered:
frames at each boundary show navy turning into the paper theme's cream and serif type, then a lofi night with stars.
**Trap (2026-10-27, never-about-the-code).** `#overlay > *` gives every child `z-index: 1`, so a positioned `.mood-overlay` made a
stacking context and its grain, set to blend `overlay`, blended with nothing: flat grey noise over the whole picture, the opening's
blacks lifted from 25 to 44 mean luma and the file eight times larger (1.2 GB for 5.6 min). `.mood-overlay` now sets `z-index:
auto`, as `#overlay` itself must, and `test/moods.test.mjs` holds it.

### D62. The essay: a video to share an idea, in sections with their own moods; the archive theme (2026-10-27)
**Decision.** A fourth kind, `"kind": "essay"`: a video someone makes to convey their own ideas, in their own voice, to
publish or pass around (an opinion piece for a channel, a paper explained). It is reviewed like a feature video (`standard`
by default, accuracy on the floor), but the skills set a further bar: it is built in sections, the acts of the argument, and
each section gets its own mood (a look and a music bed made for what it says; moods are D61), so no two neighbouring sections
look or sound alike; and enjoyment is judged on top of truth (`critic-engagement`). `themes/archive` is the first theme made
to be a section's mood: sepia paper, typewriter ink, a red stamp and IBM blue, Playfair Display and Courier Prime (SIL OFL).
**Why.** The owner on never-about-the-code's sixth cut (2026-10-27): "each section ... should have dedicated looks and
feels and should be accompanied by music, relevant music, to help convey the specific message ... the priority is that it
should be fun", and "this type of explainer video, make your own explainer video that you can share with others in your
voice to convey your ideas, is another thing that we're doing now ... that we need to make sure is properly documented".
Neither of his two channel videos (never-about-the-code, eth-is-false) is a decision, feature or release video; both were
filed as `feature`. **Costs.** The kind changes no code path but the check that accepts it; the bar lives in the skills. Each
section's music is generated per video (ACE-Step, local, MIT) and kept in `local/music/`, so a teammate without it builds in
silence for those sections (D61's warning).

### D63. Critic spend is sized before the loop, and a revision gets one round (2026-10-27)
**Decision.** `thorough` is three rounds, not four, and re-runs only critics with an open blocking or major finding
(`rerun: failed`, as `quick` and `standard` already did). The token estimate grows with the video's length (`critics` reads
`timing.json`): a Sonnet critic is about 60k plus 5k a minute, Opus 100k plus 10k. The builder says the spend before round 1 and
stops past it; a re-run critic is told which scenes changed and judges those; a revision of a video that already cleared review
gets one round on what changed, not a fresh plan. **Why.** eth-is-false's second cut ran 22 critics, about 2.8M tokens, on top of
the first cut's four rounds, and the owner said it was excessive: `rerun: touched` re-ran nearly every critic each round, since a
script edit touches nearly everything, and every critic re-read the whole ten-minute video. The old estimate (520k a first round,
measured on a 70-second video) said nothing of that; seven critics on ten minutes measured about 800k. A narrow re-run of accuracy
on the changed lines cost 70k and caught the same class of finding. **Costs.** A fix can break something a critic that passed would
have caught; the builder's own look at the changed frames is the guard (it caught a reshaped chart curve bending the wrong way that
round). **Tested** by a unit test on the plan (rounds, rerun, the estimate at 70 s and ten minutes).

### D64. An essay breathes: the voice's own pace, and a beat at each act change (2026-10-27)
**Decision.** An essay with no `speed` of its own is read at 1.0 (`ESSAY_SPEED`; a person's `local/config.json` speed and
the video's own still win). `video.json` `"leads": {"<scene>": seconds}` adds plain seconds before a scene's first word, the
mirror of `pauses` (D46): the scene starts where it did, so a mood's look and music, which change at the scene's start (D61),
play alone for that long. A blank line between two lines of a script is a beat: `video.json` `beat` seconds (0.6) on top of the
gap after the take before it (`beatsAfter`), the one place a pause can be put between two lines of a scene, since `gap` moves every
sentence and `pauses` only a scene's end; no script used a blank line before, so no video's timing changed. The build warns when
a mood starts under `MOOD_BEAT` (1.2 s) before its first word. The skills
add what a beat holds: a title card in the act's own style, and room after a punchline.
**Why.** The owner on never-about-the-code's seventh cut (2026-10-27): "we shouldn't be afraid to let things breathe. It
feels like we're rushing from one piece to the next ... right now it feels like we're speed reading", and "setting the tone
and the transitions and creating interesting transitions ... as opposed to just rushing through it". That cut ran at 1.2
with every mood change landing 0.4 s before a word, so each new look and bed arrived under the voice. Drama 3's own pace is
about 230 syllables a minute while speaking; at 1.2 the packet measured 270 to 310. **Costs.** A slower essay is longer
(never-about-the-code went from 336.7 s to 429.9 s, 28% longer). Changing the speed re-voices every Drama take, because a take's key holds its
speed and the stretch happens before the take is heard back and chosen. `critic-pacing`'s 2-second pause rule now exempts an
act change carried by music and a card.
On the eighth cut the owner said the pace and transitions now play smoothly; what was left was register: the intro and
"That's due diligence in 2026" read as written prose, not as he talks, so `narration-writing` now says to write an essay in
someone's own voice the way they talk to camera, from their dictation.

### D65. A take that drawls inside a sentence is a fault (2026-10-27)
**Decision.** `bin/hearback.py` `drawled`: more than 2.5 s between two words of one sentence (by the word times hear-back
already makes) is a drawl. `bin/drama.py` retakes it like any other fault and lists it if every try drawls; `bin/voice.mjs`
applies the same rule (`bin/lib.mjs` `drawled`) to every take on the track and prints a LISTEN line, so a take made before the
rule is caught too. A pause between sentences is a beat and is never judged. `DRAMA_RULES` is not bumped: re-voicing every
Drama take to apply a rule that only rejects outliers would replace takes the owner has approved, and the voice step's flag
covers the ones already made. **Why.** Restoring "Like animals." on never-about-the-code, Drama 3 read a 25-word line in
23.1 s with 3.0 s between "Like" and "animals"; hear-back scored it 0.977, hiss filled the gap so the stall check passed it,
and the punchline landed 15 s after its setup. A retake read it in 10.3 s. **Tested** on that take's word times. The first
version judged words a second over the whole line and flagged "Wait. Fortran? The infantile disorder?", a double take slow on
purpose; across 1,204 word pairs in two videos the longest gap inside a sentence was 1.9 s (a year said out loud), hence 2.5.
**Costs.** A sentence directed to be slow with a long held pause in it is retaken; put the pause between sentences instead.

### D66. Drama 3 voices a paragraph per take, and an explainer breathes (2026-10-27)
**Decision.** With Drama 3 a script line (a paragraph) of up to 160 words is one take (`DRAMA_LINE_MAX`; OmniVoice keeps
`LINE_MAX`, 70); a scene is a few paragraphs, each under one direction written as an actor's note, with a blank line (a beat)
between. Every video made to explain, not only an essay (D64), reads at the voice's own pace with a wordless card opening each act
(`leads`), and `critic-pacing` calls rushing a major for all of them. A narrator is invented from a description, never borrowed
from a real person without consent. **Why.** The owner on eth-is-false's second cut: "too much inconsistency" and "we're moving
so fast through the content that it's hard to follow". Takes a line apart each start cold, and the port already splits a long
take into chunks that each hear the one before (mlx-audio `fish_drama3.generate`), so the paragraph is the unit that keeps one
delivery. **Costs.** A retake re-voices a whole paragraph; a dropped word in a long take is found by hear-back's
missing-sentence check, as before. **Tested** by a unit test on `lineRuns`, and by the eth-is-false pilot heard by the owner.

### D67. A video ships with its upload folder (2026-10-27)
**Decision.** `bin/package.mjs` (`npm run package`) writes one folder per video, the shape the owner's product-videos channel
already uses (`~/Movies/Explainers/findbusiness/youtube/`): the MP4, `<name>-thumbnail.png` and `<name>-youtube.txt` (title, other
titles considered, the description with chapters, sources and credits, tags, and what Studio asks). Everything comes from the
video's own files: `video.json` `"youtube"`, chapter times from `timing.json`'s scene starts (so they move with the cut), credits
from `review/credits.txt`, and `thumbnail.html` rendered at 1280 by 720 in the same headless Chrome as screenshots (`shot.mjs`
`chromePath`). It stops before writing on what YouTube refuses (a title over 100 characters, a description over 5000, `<` or `>`)
or silently ignores (chapters that do not start at 0:00, fewer than three, or one under ten seconds), and on a render older than
the timing. It copies; it never moves or deletes. **Why.** The owner, ready to publish never-about-the-code on his channel: "the
same thing that we do for the product videos: a dedicated thumbnail and a dedicated title, descriptions, all the other stuff",
and that every lesson feed back into ShipShow so the next video starts from it. **Costs.** The description is written by the
builder in the owner's voice and judged by a fresh critic, not generated; a thumbnail is a page the builder designs per video.
The bar for each (and the owner's call on "altered or synthetic content": his own clone saying his own words, disclosed in the
video, he marks No) is the `publish` skill, so the next video starts from what the first one learned.

### D68. An invented voice keeps its style in every direction (2026-10-27)
**Decision.** A clone in `local/voices/` may have `<name>.style`, the description it was invented from; Drama 3 is told it at
the start of every direction of every take (`styled` in `bin/lib.mjs`), and a Drama take's cache key carries the styled text, so
changing it voices a Drama video again and leaves OmniVoice takes alone. **Why.** eth-is-false's third cut cloned the owner's pick from its audition clip and read it with the
script's own directions ("measured, unhurried"): it came out flatter (pitch swing 97 Hz against the audition's 128) and darker,
and he said it sounded nothing like what he picked. A side-by-side of two clips, each with and without the style, had him pick
the one with it. **Costs.** A longer direction on every take; a style that fights a line's direction is the writer's to fix.
**Tested** by a unit test on `styled`, and the side-by-side the owner chose from.

### D69. The voice worker caps MLX's buffer cache (2026-10-27)
**Decision.** `bin/drama.py` sets MLX's cache limit to 2 GB (`SHIPSHOW_DRAMA_CACHE_GB`), empties the cache after each take, and
prints the GPU memory in use and the peak with every take. **Why.** The owner saw memory go from 30 GB to 120 GB whenever a video
was voiced and asked whether a bigger model than needed was running. It was not: the 4-bit model is about 24 GB, and `footprint`
showed the worker at 114 GB, 113 GB of it GPU buffers MLX had freed and kept to reuse, with no limit set; paragraph takes made it
grow faster. **Costs.** A buffer is allocated again instead of reused; the audio is the same. **Tested** by the suite (the fake
MLX module now has the cache calls) and by the memory each take prints on the next voice run.

### D70. An AI narrator is self-aware, comparisons are like for like, and memes are compression that is not reused (2026-10-28)
**Decision.** An explainer an AI narrates says so and is funny from that vantage, never with slang worn like a costume
(`narration-writing`, *Who is talking, and how it is funny*); a comparison is in one unit on one picture that comes back when
the result lands, and every mechanism gets numbers and an animation of why (`explain-concept`); a meme compresses one idea, a
recap meme is held and walked through, and `memesUsed` in `bin/meme.mjs` tells `npm run memes` and the packet's *Memes* table
("also in") which other videos used a template or clip, so a repeat is visible and `critic-engagement` can call it.
**Why.** The owner's notes on eth-is-false's fourth cut: cringe lines ("a very rude title", "a heist in three moves",
"cracking"), an under-sold hook, checking and solving never compared in the same terms, an exponent chart he could not read,
memes shown for two seconds as afterthoughts, and the same few templates across his videos. **Costs.** A longer video (the
fifth cut is 17.4 minutes); a scan of every video's scenes.html on each search and packet. **Tested** by a unit test on
`memesUsed`, and by the fifth cut's round (accuracy, clarity, engagement), whose findings were fixed.

### D71. A new act's music hands off instead of crossfading (2026-10-28)
**Decision.** Where a mood changes the music, the old bed fades out from the act's last word (no earlier than 4 s and no later than
1 s before the boundary), held at its ducked level so it never swells back up in the pause, and is gone 0.5 s after the boundary;
the new bed starts from its own opening at the boundary and swells in over 2 s under the act's card. Both curves are equal-power
(`MUSIC_OUT_MAX`, `MUSIC_OUT_MIN`, `MUSIC_OUT_PAST`, `MUSIC_IN` in `bin/lib.mjs`). This replaces D61's 1.5 s linear crossfade
centred on the boundary. **Why.** The owner, on eth-is-false's fifth cut: the music transitions need "a lot more care". The old
bed came back to full volume in the pause before each act card (its duck lifts 0.3 s after the last word), then two beds in
different keys played together for 1.5 s. **Costs.** A quiet beat between acts, which is the point; where an act starts speaking
at its boundary, the old bed fades under its first words. **Tested** by `test/moods.test.mjs`, which measures the level at points
of the handoff; without the hold, the paused bed measured 3535 where 1768 was wanted, so the test fails. Also tested on the sixth cut.

### D72. Overlaps are measured, not left to the critics' stills (2026-10-28)
**Decision.** `bin/overlap.mjs` (`npm run overlaps`, and the packet's *Overlaps* section through `npm run review`) loads the built
page in headless Chrome. It seeks the kit's timeline to 0.8 s after every cue and 0.4 s before every scene end, and lists visible
text sitting on other text or on a picture. Text is measured by the boxes of its lines, not its element's box. It skips:
- an element and its own ancestor;
- two things in one figure or one SVG;
- the letters of one animated word;
- the captions;
- anything inside `[data-overlap="ok"]`;
- anything under a full-frame cover. A cover masked solid to N% and then fading hides only what is above N%.

**Why.** The owner found three overlaps in the fifth cut after its critic round had passed: a still lands where it lands. On the
fifth cut the check found all three. It found five more where a pop meme's scrim, faded over its bottom 20%, let the scene's text
show through the meme, so that fade is gone. **Costs.** About 3 s for a 17-minute video. Without Chrome, the packet says it was
not measured. Any other mask counts as hiding nothing, so it may report too much. An overlap that starts and ends between two
samples is missed. **Tested** by `test/overlap.test.mjs`, which fails without the faded-edge rule, and on the fifth and sixth cuts. **Then (2026-10-28): tilted cards.** A line on a rotated card measures as its upright bounding box, which grows into the next line though the letters never touch: both of `built-on-shipshow`'s tilted cards (product-videos, the first video built on ShipShow from another repo) were reported. A pair under common transformed ancestors is now measured with every one of them set to `transform` and `rotate` none (a shifted wrapper inside a rotated card included) and restored exactly; a scale or a shift changes nothing by it, since both are measured in one space. Lines that truly collide on a tilted card are still found, and the test fails without the rule. Two elements each rotated on their own are still measured upright. The rule came back from product-videos' port of this check (its #220), where it was found first.

### D73. A joke's direction says what the joke is (2026-10-28)
**Decision.** A joke on the Drama 3 engine is directed with what it is and how it should land: who is joking, at whose expense,
and the feeling under it, for example `[telling a joke at my own expense: an AI grudgingly tipping its hat to a rival, mock-annoyed
that another AI got there first]` (`narration-writing`, *Direction*). The note describes the intent, never the line's words.
**Why.** The owner heard the self-aware jokes in the fifth cut as flat ("because of delivery") and asked whether telling the model
the intent would land them. The same line was voiced once under three directions. The short tags `[firm, quietly dramatic, then
dry]` gave a pitch range of 92 Hz, the intent note 108 Hz, and "through gritted teeth" 64 Hz. One note that restated its line
("one AI telling the humans not to trust either of us") made the take repeat a sentence and drop the punchline on all five tries;
a shorter note passed. **Costs.** One take per direction shows the read changed, not that it is funnier: the owner's ear decides.
**Tested** by that A/B (`local/videos/joke-ab`) and by the sixth cut's hear-back, which caught the repeat. The owner, on the sixth cut: "everything
landed really well" (2026-10-28), and it was published.

### D74. A clone or invented voice is credited by name, or the video is not packaged (2026-10-28)
**Decision.** `npm run package` stops when `video.json` uses a voice that is neither Kokoro's nor one of OmniVoice's built-in
voices, and `sources.md` never names it as a whole name (`voiceCreditProblem` in `bin/package.mjs`). **Why.** Packaging eth-is-false,
its `sources.md` still described the first narrator, an energetic American voice, three cuts after the owner replaced it with
`narrator-uk`. Nothing had read that section since. The description's credits are written from it, so a stale voice note becomes a
public credit for a voice the video does not use. **Costs.** A video that names its clone only in `youtube.credits` must also name it
in `sources.md`; never-about-the-code now does. **Tested** by a unit test (a stale name, a longer name that contains it, a built-in
voice, Kokoro) and by packaging eth-is-false and never-about-the-code.

### D75. Another repo can build on ShipShow: its layer, venvs and renders live where it says (2026-10-28)
**Decision.** Three settings, each read when a command starts and each defaulting to this repo, so nothing changes for anyone
who sets none: `SHIPSHOW_LOCAL` (already read for config, themes, voices and sound kits; now also for the review packet's
`preferences.md` and `critics.md`) is the layer on top, `SHIPSHOW_VENVS` is the folder holding `.venv`, `.venv-drama` and
`.venv-listen` (`npm run setup*` makes them there; `setup:omnivoice` and `setup:hearback` now go through `bin/setup.mjs` so they
follow it), and `SHIPSHOW_OUT` is where `render` and `package` write. `SHIPSHOW_VIDEOS` (folders, `:` between them) adds that
repo's videos to the ones `memesUsed` scans, so a template reused across its videos is still called. A video folder could
already be anywhere: `videoDir` takes any path with a `video.json`. **Why.** The owner, 2026-10-28: DAIS's internal
product-videos repo is to build on ShipShow rather than copy from it, "ShipShow improves, product videos improves", with its own
rules on top. That repo pins a ShipShow commit, keeps its videos, theme, rules and voices in its own layer, and shares one set of
venvs across every checkout (a venv per worktree costs minutes and gigabytes). **Also.** Every page now declares and ships the
meme fonts, because `kit/base.css` names them on every page and a page with no meme failed `hyperframes lint` (#103); and the
render's limiter is budgeted against its own ceiling, so it takes at most `MAX_LIMIT` (#104). **Costs.** A pinned copy runs the
code of its pin: a fix here reaches that repo when it moves the pin. **Tested** by `test/layered.test.mjs` (defaults, every
override, the extra video folders, the template built with no meme declaring its fonts; that test fails with the old conditional).

### D76. Karaoke's waiting words take a token, --cap-wait (2026-10-28)
**Decision.** A word a karaoke caption has not reached yet waits at `--cap-wait`'s opacity, read from `#root` like every token
(0.38 when unset, the old fixed value, so no video's look changes). **Why.** product-videos' first ShipShow video ran its critics
against that team's bar, words at 7:1 or better, and the waiting words failed it: white at 38% on the signal theme's caption box
is about 3.5:1, under WCAG's 4.5:1 for text too. A video or a team's theme now raises it (0.62 is about 7:1) without forking the kit.
Whether the default itself should rise is the owner's call: it is part of how karaoke reads, and the measurement is here for it.
**Tested** by `test/captions.test.mjs`: it builds the template on the signal theme, seeks Chrome to a moment a word is waiting, and
reads 0.38 unset and 0.62 set; with the old fixed value it fails.

### D77. Footage is the video's own recording, played once and held, never a meme (2026-10-28)

**Decision.** `ss-footage` figures name a local MP4, WebM or GIF with `data-footage` (relative to the video's folder or absolute; URLs refused). They play at 1x from their cue, or the scene's start when uncued. `data-from` selects an offset into the recording; an offset outside the recording fails with the scene and file named. A recording shorter than its remaining scene window holds its last frame with ffmpeg `tpad=stop_mode=clone`, without a warning or a restart.

**Why.** A product video built on ShipShow needs its app's footage. A moving meme loops to cover its scene, carries meme framing and text bands, and is listed as third-party material to credit. Those behaviours misrepresent our own recording and can restart an answer halfway through a scene.

**How.** `bin/footage.mjs` shares `bin/meme.mjs`'s local file validation, size probe, H.264 encoder (30 fps, a keyframe each second) and timed video element with a shared track counter. The footage branch never uses `-stream_loop`, strips audio and pads the final frame, writing `assets/footage/<key>.mp4`, keyed by source bytes, offset, window and encoding parameters. The scene retains `data-scene-start` and `data-scene-duration` as it does for any video. The figure has no meme text bands or generated meme attributes. `--footage-width` defaults to 1344px; the file sets its aspect ratio, and `--footage-radius`, `--footage-border` and `--footage-shadow` fall back to the card tokens. These opt-in styles leave existing figures and themes unchanged. The packet's *Footage* table gives scene, file, source length, offset, scene-relative start and whether and how long the final frame holds, outside memes and credits.

**Tested.** `test/footage.test.mjs` generates a tiny moving testsrc MP4 without Kokoro or network access, builds it into a scene, probes the encoded window and compares held frames. It captures actual encoder arguments to check that footage never loops, verifies offsets, cache identity, GIF and WebM input, scene-start playback, URL rejection with the scene named, and exclusion from meme discovery. The hold test is also run with padding removed and must fail before the implementation is restored.

### D78. A series frame lives outside the scenes and never moves (2026-10-28)

**Why.** A product series' plate and price tag dipped and slid at every cut when repeated per scene. A shared series frame belongs to the canvas, independent of each scene's transition and camera.

**Decision.** Every top-level `.ss-frame` block in `scenes.html` is lifted into one `#frame` layer in source order, over all scenes and under both `#overlay` and captions. The positioned full-canvas layer has `pointer-events: none`, inherits mood tokens, and exists from zero to the end. Its elements without cues are visible immediately; section show/hide and camera pushes never target it. Nested frame classes inside a scene stay in that scene.

**How.** `bin/frame.mjs` extracts balanced top-level blocks while preserving styles, scripts and comments. `build` resolves frame `data-cue="<scene>:<cue>"` through the same `cueTime()` as scene cues, including word, occurrence and relative-second forms, writing `data-at`. Missing qualification and unknown scenes stop the build with the element named. Optional `data-leave="<scene>:<cue>"` writes `data-leave-at`; the shared kit timeline fades that element to zero over 0.4 seconds starting at the resolved time. It works with or without an arrival cue. Entrances keep the usual `data-anim`. No per-frame visual styles are imposed.

**Tested.** `test/frame.test.mjs` builds multiple blocks with nested markup, verifies their position outside all scenes and exact cue-time equality, checks invalid cues, and runs the kit in a VM with recorded GSAP operations to prove scene visibility and camera operations leave the frame alone while arrival and exit animations run. `test/overlap.test.mjs` adds a frame/scene text collision to the whole-page measurement. The lifting control disables the layer output, runs the lifting test and requires it to fail, then restores the build file.

### D79. A script knows it is the one node runs by comparing real paths (2026-10-28)

**Why.** `npm run package` did nothing and exited 0 from a checkout whose path holds a space or a non-ASCII letter (#96): its guard compared `process.argv[1]` with the module URL's pathname, which is percent-encoded. `bin/overlap.mjs` compared against a hand-built `file://` URL and failed the same way; `bin/sounds.mjs` and the three hooks compared against `fileURLToPath`, which survives a space but not a symlink, and a hook that skips its body lets every command through without a word.

**Decision.** Every CLI in `bin/` and every hook asks `isEntry(import.meta.url)` (`bin/entry.mjs`): the real paths of `process.argv[1]` and the module, compared, and false on any error. It is the rule `bin/usage.mjs` already followed, now in one place.

**Tested.** `test/pipeline.test.mjs` copies `bin/` and the hooks under a folder named with a space and an accented letter, and reaches it again through a symlink, then runs `package`, `overlap`, `sounds`, `usage`, `guard-bash` and `protect-files` from both and requires each to do its job (a usage line and its exit code, or a refusal). With the old guards put back it fails on `package.mjs`.

### D80. The Bash guard's git rules are this repo's, and a landed branch may be deleted (2026-10-28; narrows D41)

**Why.** Two refusals cost work and protected nothing. `pr merge` ends a squash merge by saying to run `git branch -D <branch>` (a squash leaves the branch unmerged to git, so `-d` refuses), and the guard refused it, so merged branches piled up until `branch-gc.sh --apply` (#64). And the guard read every command from a session started here, so `cd ~/Documents/DAIS/product-videos && git branch -D <merged branch>` was refused although that repo has rules of its own (#105).

**Decision.** The git rules (restore, clean, reset --hard, checkout --, branch -D, stash drop, force push) apply when the command works in this repository: the directory it runs in, moved by `cd` (with `~` and `$HOME`) and by `git -C`, shares this checkout's git store, so a worktree of ShipShow counts and another clone does not. A directory git cannot place counts as this repo, and so does a command that points git elsewhere with `--git-dir`, `--work-tree`, `GIT_DIR=` or `GIT_WORK_TREE=`, which the guard does not follow. `git branch -D` here is allowed when every branch it names has a tip equal to the head of a pull request merged into the default branch from this repo, the test `branch-gc.sh` uses; `gh` answers it, and anything it cannot establish (no such branch, `gh` missing or offline, a moved tip, a fork's pull request) keeps the refusal. `rm` and the write and read rules are unchanged.

**How.** `.claude/hooks/guard-bash.mjs`: `isThisRepo` compares `git rev-parse --git-common-dir`, `landedBranch` asks `gh pr list --state merged --head <branch> --base <default>` (`SHIPSHOW_GH` names another `gh`, which is how the test answers).

**Tested.** `test/hooks.test.mjs` makes two throwaway repos and a worktree, and a `gh` that records its arguments: another repo's `branch -D`, `reset --hard`, `clean` and `stash drop` pass by path, `~`, `$HOME` and `-C`; this repo, its worktree, an unknown directory and a `cd` back here are refused; `-D` passes for a branch whose tip a merged pull request names, and is refused for a moved tip, a fork, `gh` failing or garbled, one branch of two unlanded, a missing branch and none named. With the old guard the test fails. Against the real `gh`, the guard allowed `-D` on three branches merged that day and refused `main`.
### D81. An animated template's box shows in its own part of the loop (2026-10-28; extends D49)

**Why.** memegen gives each text box of an animated template a `start` and `stop`, fractions of the GIF's loop. `crowd` (Soccer Celebration in a Bar) shows its first line from 0 to 0.54, while the bar watches the screen, and its second from 0.61 to 0.75, as it erupts, both in the same corner. D49 drew every box for the whole time, so the two lines sat on top of each other (never-about-the-code, #68).

**Decision.** For an animated template, a box whose times are not 0 to 1 (`boxSpan` in `bin/meme.mjs`) gets `data-show="<start> <stop>"`, and its figure gets `data-loop` (one pass of the GIF, from ffprobe) and `data-loop-start` (the figure's cue, where its video starts). `kit/kit.js` drives the box's opacity from the time alone through `driveBy` (D50): shown while the time's place in the loop, counted from the cue, is in its span. The box, not the line, so an entrance on the line still plays. A box with no times, 0 to 1, or times that make no span, and every still template and clip, are drawn as before. The `overlay` section's times (memegen's stickers) are not read.

**Tested.** `test/meme.test.mjs`: `boxSpan` on crowd's times and the cases that mean always; a fixture template with two timed boxes and one untimed builds with the loop, the cue and each span on the page, and an untimed animated template carries none; kit.js in a VM samples each box out of order across four loops (first line early, second in the middle, neither late). With the old kit.js or the old build the test fails. A scratch video with the real `crowd`, rendered: at 3.5 s only "Push to CI" on the screen, at 5.0 s only "It turns green", at 6.0 s neither, at 7.5 s the first line again.

### D82. A scene's own layout sits inside `.inner`, which already leaves out the caption band (2026-10-29)

**Why.** qwen-phones-home's first cut gave its `.stage` a 170 px bottom inset to keep clear of the captions. `.scene > .inner` already
stops 180 px above the bottom (`kit/base.css`), so the stage was 670 px tall instead of about 830, and any scene taller than that
centred itself by spilling over the top of the frame: a chart's title cut off, the 02b command block against the top edge. Two critic
rounds called it "top-heavy" before the cause was found. **Decision.** A scene's layout box insets from `.inner`, not from the
canvas: about 40 px at the top and 30 px at the bottom, as eth-is-false's `.stage` does. **Also learned.** `pauses` are laid into the narration by `voice`, not by `build`: a `pauses` change made after the
voice step is not in the render until `voice` runs again (it re-lays from cached takes in seconds); qwen-phones-home's round-3
pauses missed its first final render that way. **And** a critic's suggested fix can
be wrong: round 1's clarity critic proposed that curl's `-o` is followed by a web address, the builder took it, and round 2's accuracy
critic caught it (`-o` takes a file name). Accuracy re-runs after every revision for this reason, and a fix is checked against the
sources before it is applied, not only the finding.

### D83. Each Drama 3 line hears the video's first take and the take before it (2026-10-29; extends D66)

**Decision.** `bin/drama.py` voices each line as mlx-audio's `generate()` does a long text, chunk by chunk, but with the chunks it
hears passed in (`speak`): the video's first chunk, pinned, and the last chunk of the take kept for the line before, as if the
whole narration were one call. Each kept take saves its first and last chunk beside it (`<take>.turns.npz`); `voice.mjs` names
each job's `after` (the take before it in the video, across scenes) and `anchor` (the video's first take). A line voiced again
alone hears its neighbours' kept takes, and the lines after it are not voiced again: a line's key does not carry the take before
it, so one edit never re-voices the rest of a video. `DRAMA_RULES` 6 voices every Drama video once more. **Why.** Takes a line
apart reset the voice: the owner heard lines that "sound different" from each other on qwen-phones-home, preferred OmniVoice's
evenness but kept Drama 3 for its reliability, and asked for the published tips. Fish's technical report has the model condition on
the latest take; inside one `generate()` call mlx-audio already does it for chunks. A four-way test on qwen-phones-home's 10 lines
(four scenes), same seeds and the pipeline's own checks, compared today's takes, this, three reference clips (the report's only
measured lever: speaker similarity 0.605 to 0.633), and both. None dropped a sentence. Time for the 10 lines: 4.8, 5.4, 10.6 and
13.3 min (1x, 1.1x, 2.2x, 2.8x); lines needing another try 4, 4, 2, 2; three references alone froze 2.8 s mid-line on the payload
line on every seed. Three references re-read every clip for every chunk, which is the cost. The owner listened side by side and
chose hearing the line before as "the best trade-off" for the time. **Then learned.** Voiced in full (39 lines), two takes said part
of a take they had heard, on every round: one opened with the video's first line ("On October twenty sixth, the AI company Cohere
published this"), one ended with a piece of the line before. The letter score saw both (81%, 88%) but retakes heard the same takes
and repeated them again. So a take heard saying five or more words in a row that its line lacks (`hearback.added`, `ADDED_RUN`) is a
fault, and the rest of that line's rounds hear nothing, as before this decision: never worse than a cold take. Of the 88 takes on
disk (this video's 39, its published 49), only those two pass four words. The full run took 1,103 s against 620 s for the previous
full voicing of a shorter script (1,849 words to 2,073: about 1.6x for the length), much of it the two lines' five rounds each and the
number-heavy lines' retakes; an uneventful take costs about 0.7 s per second of audio. **Costs.** About a tenth more voicing time; `speak` uses
mlx-audio's private chunk methods (`build_frames`, `_frames`, `_result`, `_voice`), stable under the commit `requirements-drama.txt`
pins, and with no history it is `generate()` exactly (same seed, same samples, checked on the real model); a model without them
falls back to `generate()` and hears nothing. A line voiced after its neighbour changed hears the new take, so re-voicing a whole
video can differ from voicing lines one at a time. **Tested** by a unit test with a fake model (which chunks each line hears,
across lines, a one-chunk first take, and a line voiced alone), one where a take repeats what it heard and is voiced again
hearing nothing, a unit test of `added` on the two real takes and on digits and letters heard for words, controls with the
history and the fallback switched off that fail them, and qwen-phones-home voiced again in full on the real model.

### D84. A thumbnail is clickbait built on a true fact, from generated assets and our own type (2026-10-29)

**Decision.** `publish`'s thumbnail bar: make the viewer need to know what happened, leading with the most alarming undisputed
fact and a reaction to it, never the verdict; three or four concepts compared at 320 by 180 for the owner to pick; a generator
(the GPU box or this Mac, whichever the machine has) makes only the picture underneath, and every word, label, arrow and pin is
HTML and SVG drawn by us; with no generator, the picture is built from SVG, frames and captures. A generated asset stays in the
video's gitignored `assets/thumbnail/`, with its prompt, model and seed committed. And `npm run package` stops when a video
shows screenshots or portraits but `review/credits.txt` is missing, or older than `scenes.html` (a picture added since would go uncredited). **Why.** qwen-phones-home's package passed three truth
critics with a diagram thumbnail the owner called "very weak" and "mid"; three generated-picture drafts were "not clickbait"
because they argued the case ("Spy or fossil?") instead of asking it; the one he took is Earth at night with a red arc from a
laptop labelled "QWEN 3.8 / LOCAL AI" over the ocean to a Beijing pin, "WAIT... WHAT?!". He asked that a generator never make the
whole thumbnail ("it's just gonna immediately scream AI generated"). The image model ignored where it was asked to put a subject
in 4 of 4 tries, hence placing it in the layout. Separately, packaging from a fresh worktree wrote a description 560 characters
short, with none of the five screenshot credits, and said nothing. **Costs.** More drafts per video (each local image about
15 s); the generated asset is not in the repo, so a clone without it cannot package until it is made again: `npm run package`
stops on any local file `thumbnail.html` draws that is missing (`missingLocalFiles`, D87), rather than rendering it on black.
### D85. Hear-back stops failing takes for how Whisper writes numbers and names (2026-10-29)

**Decision.** `hearback.spoken_numbers` reads "a hundred" as "one hundred" and drops the "and" in "a hundred and seventy one", and
every comparison tries a third reading of a number, digit by digit (`READINGS`: quantity, year, digits), keeping the closest.
`spelled_out` no longer counts a single capital word of four letters or more that is nearly, but not exactly, a name of the line
(a capitalised script word, ratio 0.75 or more) as letters spelled out ("NODE" for a spelled-out "node" still counts): Whisper's "QUEN" for the narrator's "Kwen", written "Qwen". A short respelling ("EN" for "en") still
counts. **Why.** The owner asked for the voicing bottlenecks after qwen-phones-home took 18 minutes to voice: the number-heavy
lines failed at 96% with every word said ("171" against "a hundred and seventy one"; "ABC-123" against "A B C one two three") and
two lines were retaken five times each for "QUEN", every round, for nothing. Rescored with the old and new rules, the 47 takes on
disk: those four pass now and none that passed fails. **Costs.** A take that drops a digit of a number read digit by digit may now
pass by the closest reading; the missing-sentence check is unchanged. `CHECK_VERSION` is not bumped, so no video voices again for
this: kept takes are unaffected, and the next voicing simply retakes less.

### D86. Every step records how long it took (2026-10-29)

**Decision.** `voice`, `build`, `overlaps`, `review`, `render` and `package` each append one line to the video's
`review/timeline.jsonl` when they finish (`recordStep` in `bin/lib.mjs`): the step, when it started, its seconds, the commit that
ran it, and what it worked on (voice: engine, voice, speed, takes voiced of the total, hear-back rounds summed from each take's
`.check`, which Drama 3 now writes as `rounds`, and seconds of narration; build and render: seconds of video). `npm run timeline`
(`bin/timeline.mjs`) summarizes it. A failed step is not recorded, and a write that fails is skipped: timing is a record, never a
gate. The file is gitignored with the rest of `review/`, so it is per machine. **Why.** The owner asked what a video's timeline is
and said it should be tracked so the slow steps can be found; nothing recorded it, and the numbers had to be read back from
terminal logs and file times. Measured by hand on qwen-phones-home (15.6 min, 2026-10-29): Drama 3 voicing 1,103 s (about 0.7 s
of work per second of audio when no take is retaken; retakes were the rest), the second render 700 s (1.34x real time), build
under a minute (3.7 s with music and moods, measured by this step), the overlap check 4.3 s. **Costs.** One `git rev-parse` per
step; rounds are known only for Drama 3 takes (other engines count one a take).

### D87. A scene may use a generated image, as an illustration with our own labels (2026-10-29; extends D84)

**Decision.** When a picture proves a scene's point better than a diagram and the machine has an image or video generator, the
scene gets a generated image (`explainer-video`, *Scenes*; `explain-concept`'s idea-to-picture table): an illustration, never
evidence (no screenshot, chart, real person or recorded-looking event), with no words in it, every label drawn on top. It lives in
the video's gitignored `assets/`, its prompt, model and seed committed beside `scenes.html` and named in `sources.md`. `build` now
stops when `scenes.html` draws a local file that is not there (`missingLocalFiles` in `bin/lib.mjs`, shared with the thumbnail's
check in `package`), since a missing generated image would otherwise render as an empty scene. **Why.** The owner, after the
thumbnail's generated Earth worked: tap the generator for the video's own assets "to prove a point", worth the cost when it does.
**Costs.** A generated image that looks like a photograph can be taken as one; the rule against evidence-looking images and the
grounding critic are what hold that line. A video cloned without its generated images does not build until they are made again.

## Behaviour

What an agent or person observes. Each line is checkable against the cited file.

**The pipeline** (`bin/`, `kit/`)
- `voice` voices one sentence at a time (or, with OmniVoice and hear-back, runs of sentences up to 45 words, D47) and writes `timing.json`. A take is cached by its text,
  voice and speed, so inserting a sentence re-voices every later sentence in that scene (numbering restarts per
  scene; the cost per take has not been measured).
- A music file `video.json` names as `local/...` is looked for beside the video, then in the person's local layer (`SHIPSHOW_LOCAL`, D75), then in the repo (`musicFile` in `bin/lib.mjs`); before, a worktree rendering with `SHIPSHOW_LOCAL` set found none of it and qwen-phones-home lost five of its seven beds (2026-10-29).
- A bracketed stage direction in a script line reaches only the Drama 3 engine; captions, cues, `timing.json` and the other engines get the line without it, and a line's direction moves with the line, never to the next one (`directedSentences`, D55).
- A Drama 3 line is generated hearing the video's first take and the take kept for the line before it, and every kept take has a `<take>.turns.npz` beside it (`bin/drama.py` `speak`, D83). A take heard saying five or more words in a row that its line does not have is retaken, and the rest of that line's rounds hear nothing; one kept with it lists `said more than its line` in its `.check` faults (`hearback.added`).
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
  It compares a take with its text after spelling numbers out on both sides: a year read as a year or a quantity, a
  decimal, a time, an ordinal, and a percent sign as the word (Whisper writes "40%" for a take that said "forty percent", #61).
- `build` also places sound effects (D43): a `data-sfx` or `sfx()` call becomes a sound in `assets/sfx.wav`, peaking (or starting) at the cue; it stops on a run of one sound, on a sound over a sentence's first word, and on an unknown sound; `"sfx": false` turns it off. `review` lists each sound with its time, scene, level against the voice and audible span under *Sound effects*.
- `render` writes `out/<name>.mp4`; `make` chains voice, build, lint and render.
- `build` expands each `ss-portrait` figure (D48): a refused licence, a missing file or an unreachable Commons with nothing cached stops it naming the scene and the file; `review` lists each portrait under *Portraits*, and every portrait and screenshot under *Credits* and in `review/credits.txt`; the credit is not drawn on the photo (D57).
- `build` expands each `ss-shot` figure (D56) from the cache, or by capturing the page in headless Chrome: a page that cannot be loaded, a `data-select` with no match or `data-find` words not on the page stops it naming the scene and the page, and leaves nothing in the cache; `review` lists each under *Screenshots* with its capture date.
- `review` writes `review/packet.md` (words a minute while speaking, every pause, every cue's
  time and reading time, with code counted in tokens, the longest still stretch of each scene) and
  `review/frames/`. The packet measures; the critics judge.
  Text is read once (`newReadingText` in `bin/measure.mjs`): a highlight, a line inside a block already shown, and
  the same text on an element and one cued inside it (a meme and its backdrop, #62) add no reading time.
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
  exit outside the frame (D78), a swap and a connector between boxes need a custom `<script>`.

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
