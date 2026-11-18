# AGENTS.md

Start here. This file says what the project is, where everything lives, which skill to load,
and what is expected of you. `README.md` is the same story for humans.

## Where to read

The rules are all in this file, one sentence each. The detail behind a rule (procedure, rationale, history, field shapes, command flags) is in the docs below; read the one for the work in front of you before you change it.

| Need | Read |
|---|---|
| Every `video.json` field, cues, voices, take checks, runs, themes, moods, frame, motion, review dials, memes, footage, portraits, screenshots, music, sound effects, speed | `docs/agent/video-files.md` |
| Every command with its flags, checks and refusals | `docs/agent/commands.md` |
| The full paths table, the layout, how the timing works | `docs/agent/layout-and-timing.md` |
| The full text of every trap, with measurements and incidents | `docs/agent/traps.md` |
| First-run downloads | `docs/agent/setup.md` |
| Requirements, and the design decisions (D-numbers) | `docs/PRD.md`, `docs/DESIGN.md` |

## What this is

ShipShow: turn a shit show into a ship show. When agents change a code base faster than a person can follow, a short narrated video of what changed and what needs deciding lets them ship code they understand.

A pipeline that turns plain text into narrated explainer videos on one machine (a Kokoro
voice, HyperFrames scenes), and a set of skills for agents to make them well. The everyday
use is a decision video: an agent working on a feature hands off to a fresh explainer agent,
which explains what the person needs to make a call. Feature and release explainers use the
same skills.

The skills in `skills/` are the team's baseline. Each person tailors on top of them in
`local/`, which is never committed (`tailor` skill).


## Where things are

| Path | What |
|---|---|
| `.claude-plugin/`, `agents/` | The Claude Code plugin: `plugin.json`, `marketplace.json`, and the `critic` agent (Write, Edit and NotebookEdit denied). Validate with `claude plugin validate .` |
| `docs/PRD.md`, `docs/DESIGN.md` | The requirements, and the design decisions and behaviour. Kept current (*Docs that stay current*) |
| `docs/agent/` | The detail moved out of this file (*Where to read*) |
| `skills/` | Every skill. `npm install` links them into `.claude/skills/` for Claude Code; other agents read them here |
| `videos/<name>/` | One video: `script/`, `scenes.html`, `video.json`, `sources.md`, `critics.md`, `REVIEW.md` |
| `bin/`, `kit/`, `themes/`, `template/`, `examples/` | The pipeline (`voice`, `build`, `render`, `make`, `review`, `new`, `doctor`, `critics`, `memes`, `usage`), the shared page and timeline, shared themes (a client's goes in `local/themes/`), what `npm run new` copies, fictional code bases for example videos |
| `.claude/settings.json`, `.claude/hooks/` | The project's Claude Code hooks and read denials (tracked; `.claude/skills/` is the generated skill links and is not) |
| `local/` | Gitignored, per person: `preferences.md`, `critics.md`, `skills/`, and `videos/` about code that is not this repo's |

## Skills

| Skill | Load it to |
|---|---|
| `repo-context` | Get oriented before changing this repo: shape, commands, traps, how to validate |
| `change-context` | Understand a change (diff, PR, release): why, before and after, breaking, risk |
| `evidence-standard` | The shared rules for evidence: tags, pins, safe running, absence, where results go |
| `code-context` | Understand any code base: purpose, functional and non-functional requirements, API behaviour, evidenced and with unknowns listed |
| `explain-concept` | Plan a video: viewer, outcome, one idea per scene, the picture for each |
| `decision-brief` | Hand a decision to a fresh explainer: options, costs, pick, exact commit |
| `narration-writing` | Write a script for the ear: pace, numbers, pronunciation |
| `glossary` | One name per concept, across script, captions and scenes |
| `explain-handoff` | Return a finished video with its status, next step and open questions |
| `explainer-video` | Make or update a video. You are the builder |
| `critic-loop` | Judge a video with fresh critics, fix, repeat until they pass; add a new critic |
| `publish` | Put a finished video on YouTube: title, thumbnail, description, the upload folder, then the link recorded |
| `tailor` | Record how one person wants their explainers, in `local/` |
| `theme` | Make a theme, usually from a client's brand |
| `critic-accuracy`, `critic-clarity`, `critic-pacing`, `critic-sync`, `critic-visuals`, `critic-consistency`, `critic-engagement`, `critic-novelty`, `critic-decision`, `critic-grounding` | Be one critic, when the loop assigns you |

## What is expected

- **The agent that builds a video never judges it.** Every critic is a fresh agent that has
  never seen the build: never a fork, never yourself. Its whole job is to find what is wrong.
- **A video is done when its critics pass or its review plan's cap is reached**, never when it
  merely renders: `REVIEW.md` records each round, and at the cap every open finding as
  accepted or declined with its reason. The floor (accuracy; decision for a decision video;
  grounding for a video that shows code) can never ship open. Which critics a video gets is in its `video.json`; its own bar is in `critics.md`.
- **Every claim traces to `sources.md`.** A fact the sources lack is a gap to report, never
  one to fill in.
- **A bar you keep wishing a video met becomes a critic** (`critic-loop`, *A new critic*).
- **A video about another code base goes in `local/videos/`.** This repo is public.
- **Skills set the bar, not the method** (team, 2026-10-17). They say what a good video is and
  how it is judged. How an agent manages its context or plans its steps is its own business,
  and a rule about it is friction the next model has to work around. The bars are not method:
  who builds, who judges (a fresh agent), and where facts come from (the code, `sources.md`)
  hold for every agent.

## Docs that stay current

Two files record what the project must do and why it is built the way it is. They are part of
the work, not paperwork after it:

| File | Holds | Update it when |
|---|---|---|
| `docs/PRD.md` | Problem, users, goals, functional and non-functional requirements with status, scope, open questions | A requirement is added, changed, dropped or finished; the status of an F or N line moves; an open question is answered or raised |
| `docs/DESIGN.md` | How it fits together, the decision log, observable behaviour, how the design was tested | You make a design decision, change how something behaves, reverse an earlier choice, or learn a trap |

**Update them in the same change as the code, skill or doc that moved them**, before you commit.
A change to `bin/`, `kit/`, `template/`, `themes/`, a skill, the critics, `agents/`, `test/`, `sample_application/`,
the plugin layout, CI, `package.json`, the lockfile, `requirements.txt`, the README, `AGENTS.md` or `CLAUDE.md`
that leaves both files without a substantive change (at least 40 characters of added text; whitespace, a
punctuation edit or the review date do not count) needs `docs: no change - <reason>` (a reason of ten characters
or more) in the PR title or the last non-merge commit message. The text added may be unrelated to the change:
the rule makes a stale number loud, not a stale claim, so read the docs you touch.

- Security gate: `npm run audit:deps && npm run audit:code` (both in CI as the `security` job). Fix a finding first; carry one only with its reason (`osv-scanner.toml`, or a `nosemgrep` / `gitleaks:allow` comment at the line).
- When you add or rename a skill, list it in the skills table above and in the PRD.
- How to write an entry, and what `npm test` and CI check: `docs/DESIGN.md`, *Keeping these files current*.
- **Bump nothing by hand in `plugin.json`:** it has no `version`, so the commit SHA versions the plugin.


## Set up

Node.js 22+, Python 3.10 to 3.13 (`npm run setup` picks one; `doctor` checks it) and ffmpeg; tested on macOS.

```
npm install                                                       # HyperFrames, GSAP; links skills into .claude/skills
npm run setup                                                     # .venv with Kokoro, which hyperframes tts runs
npm run doctor                                                    # what is missing, with the fix; voices one word
npm run setup:omnivoice                                           # optional, Apple Silicon: OmniVoice for better and cloned voices (and hear-back)
npm run setup:hearback                                            # optional, any engine: faster-whisper hears each take back (about 480 MB model)
npm run setup:drama                                               # optional, Apple Silicon: Drama 3, the directed voice, in its own .venv-drama
npm run setup:listen                                              # optional, Apple Silicon: Parakeet's second listen over the finished narration, in .venv-listen
```


First-run downloads (Kokoro, Chrome, OmniVoice) and the `doctor` flags: `docs/agent/setup.md`.

## Commands

The table is the short form; every flag, check and refusal is in `docs/agent/commands.md`.

| Command | What it does |
|---|---|
| `npm run new -- <folder>` | A new video from `template/` (`videos/x` for this repo, `local/videos/x` for any other code base) |
| `npm run voice -- <folder>` | One take per sentence (`--engine omnivoice`, `--engine drama`, `--no-hearback`), then `assets/narration.wav` and `timing.json` |
| `npm run build -- <folder>` | `index.html` from `scenes.html` and the timing |
| `npm run check -- <folder>` | HyperFrames' own check: lint, layout, motion, caption contrast |
| `npm run preview -- <folder>` | The HyperFrames studio |
| `npm run render -- <folder>` | `out/<name>.mp4`, audio mastered to `video.json` `loudness` (-14 LUFS by default; one gain and a limiter, never compression); runs with `HF_CAPTURE_PARALLEL_STREAM=true` unless you set it (D103) |
| `npm run make -- <folder>` | Voice, build, lint and render (`--speed` tries a pace) |
| `npm run review -- <folder>` | The critics' evidence: `review/packet.md` and `review/frames/` |
| `npm run overlaps -- <folder>` | Text over text or a picture, measured in headless Chrome (D72); `data-overlap="ok"` says the scene means it |
| `npm run package -- <folder>` | The upload folder `out/publish/<name>/`; it stops on anything YouTube would refuse or ignore, on a clone or invented voice `sources.md` never names (D74), on screenshots or portraits without `review/credits.txt` (D84), and on a missing `youtube.titleTag` (D95) |
| `npm run critics -- <folder>` | The critic plan; **`--run`** runs the critics on Codex (`bin/critics-run.mjs`, D108), refuses without `review/packet.md` and needs `codex` on PATH |
| `npm run memes -- <words>` | Search the memegen catalog for the id `data-meme` takes |
| `npm run skills` | Link new skills into `.claude/skills/` |
| `npm run usage` | Tokens and context per agent for the newest Claude Code session |
| `npm run timeline -- <folder>` | How long each step took, from `review/timeline.jsonl` (D86) |
| `claude plugin validate .` | The two manifests only; one warning is expected (no `version`, on purpose) |
| `npm test` | No Kokoro needed; CI runs only this |

A change to `bin/`, `kit/` or `template/` is validated by running `make` and `review` on
`videos/how-it-works` and looking at the contact sheets.


## A video's files

The full table of files, every `video.json` field and every section below is in `docs/agent/video-files.md`; each rule here is the short form of its text there.

| File | What it is |
|---|---|
| `script/01-intro.txt`, `02-...` | One file per scene, read aloud in file-name order; with OmniVoice one thought per line, each line one take (`lineRuns`, D54) |
| `scenes.html` | One `<section data-scene="01-intro">` per script file, a `<style>`, optionally a `<script>` |
| `video.json` | `title`, `builtBy`, `kind`, `importance` and `importance_reason`, `sfx`, `shows_code`, `voice`, `speed`, `theme`, `flair`, `moods`, `review`, `say`, `audience`, `youtube`, `seed`, `loudness` and the pause dials; every field is explained in the doc |
| `sources.md`, `critics.md`, `brief.md`, `REVIEW.md`, `thumbnail.html` | Claims and their sources; the video's own bar; a decision video's handoff; the critic rounds; the 1280 by 720 thumbnail |

- **Cues.** An element with `data-cue` arrives when the voice reaches that word, and `build` stops on a word the scene never says; `data-anim` picks the entrance and a `<script>` in `scenes.html` may add GSAP tweens to `tl`.
- **Voice.** Three engines set by `engine` (`kokoro` by default; `omnivoice` and `drama` on Apple Silicon only); never clone a voice without consent, a public video credits the VCTK voice `eve` ("Voice: VCTK corpus, CC BY 4.0"), `say` respells a word for the engine and captions keep the written form, and Drama 3's licence forbids a hosted service and any cloning without consent.
- **Checks on every take** (`bin/voicecheck.py`, `bin/hearback.py`): levelling, retakes, optional hear-back (`--no-hearback`) and second listen (`--no-listen`) flag and never block (Drama 3 retakes a take with `spelled_out` letters the script never spells, and one kept with it is listed, D60); without faster-whisper everything else still runs.
- **Runs of sentences** (D47): with OmniVoice and hear-back a scene is voiced in runs of whole sentences up to 45 words; Whisper word times reach `timing.json` only through `bin/wordtime.py`, and nothing requires faster-whisper.
- **Look.** A theme is `themes/<name>/theme.css` (or `local/themes/<name>/`, which wins); a scene's own styles should use the tokens, never a hard-coded colour.
- **Moods.** `video.json` `moods` and `data-mood` select a section's feel; an unknown name stops the build with its scene, and `MOOD_BEAT` warns when a change has no beat: use `leads`.
- **Frame.** Top-level `.ss-frame` blocks outside the sections form one full-canvas `#frame` layer; unqualified cues and unknown scene ids stop the build naming the element (D78).
- **Motion.** Theme tokens `--transition`, `--camera`, `--ambient`, `--progress`, `--entrance`, overridden by `flair` and `data-transition` or `data-camera`; moving motion is a pure function of time (`driveBy` in `kit/kit.js`, D50).
- **Review.** The plan's dials resolve in `reviewPlan` in `bin/lib.mjs`, the builder sets `importance`, and the builder says the spend before round 1 and stops past it (`critic-loop`, *Spend is part of the plan*); no dial lowers the floor (`skills/critic-loop`).
- **Memes.** `data-meme` fills the template's text boxes with a `<span>` per line; never memegen's rendered images (watermark, baked-in text); an unknown id, an unreachable source with nothing cached or too many spans stops the build; a scene holding a moving meme or footage keeps its times in `data-scene-start` and `data-scene-duration`, because HyperFrames refuses a video inside a timed element; the template pictures are fetched, never committed, and the review packet's template and `source` are credited in `sources.md` (D42, D49, D81).
- **Footage** (D77). `data-footage` plays a local file once at 1x and holds its last frame; URLs are refused (`bin/footage.mjs`).
- **Portraits.** `data-commons` fetches a Commons photo (`bin/portrait.mjs`); the licence gate accepts only public domain, CC0, CC BY and CC BY-SA, stops the build otherwise, and the credits from `review` go in `sources.md` and the description (D57); read the file page before publishing.
- **Screenshots** (D56). `data-shot` captures a real page in headless Chrome (`bin/shot.mjs`); a page that will not load or words not on it stops the build; `data-lines="1"` keeps only the lines holding the words and one more above and below; the pages are third-party, captured, never committed.
- **Music.** `video.json` `music` puts a bed under the narration (`musicBed` in `bin/lib.mjs`); a missing file warns and builds without music, and a generated track is never committed (its licence is its maker's); check it for vocals before using it.
- **Sound effects.** `data-sfx` on a cued element or `sfx()` in the `<script>`; `bin/sfx.mjs` refuses a run of one sound (3 within 1.25 s) and any sound audible from 0.05 s before to 0.45 s after a sentence's first word, and a call in a loop is an error; `"sfx": false` turns sound off.
- **Speed.** A multiplier on the base pace (1.25 by default, 1.0 for an essay); the most specific wins: `--speed`, `video.json`, `local/config.json`; a take is re-voiced when its speed changes.

## How the timing works

`bin/voice.mjs` voices each sentence on its own and places it on the track (Kokoro reports no word times); `bin/build.mjs` turns the times into `data-start`, `data-duration` and `data-at`, and `kit/kit.js` is the shared GSAP timeline. Detail: `docs/agent/layout-and-timing.md`.

## Layout

`bin/` the pipeline, `kit/` the shared page, `themes/`, `skills/`, `template/`, `videos/`, `examples/`, `sample_application/`, `docs/`, `test/`, `local/`. `never-about-the-code` and `eth-is-false` render only where their voices exist (`local/voices/lino-long.wav`, `local/voices/narrator-uk.wav`). What is in each, and the example videos: `docs/agent/layout-and-timing.md`.

## Traps

Each is one rule here; the measurements and incidents behind it are in `docs/agent/traps.md`.

- **Another repo may be running this code with its own layer** (D75): read paths through `localDir()`, `VENVS` and `outDir()` in `bin/lib.mjs`, never `join(REPO, "local")`, `.venv` or `out` directly.
- **Kokoro's Python is this repo's `.venv`**, passed as `HYPERFRAMES_PYTHON` (`bin/lib.mjs` `ttsEnv`); a user-set `HYPERFRAMES_PYTHON` wins.
- **`requirements.txt` pins phonemizer**: bump it and kokoro-onnx together and run `npm run doctor`.
- **espeak-ng fails when its data path is 160 characters or longer**; a venv deep in a temp or worktree path hits it, and `doctor` checks the length.
- **OmniVoice is Apple Silicon only, and opt-in** (`requirements-omnivoice.txt`, `bin/omnivoice.py`, `bin/omnivoice-voices.json` pins the model and clips).
- **A narrator is invented, not borrowed.** Never clone or vary a real person's voice without their consent (`narration-writing`, *A narrator*).
- **A clone is somebody's voice.** Clone yourself or someone who agreed; `local/` never leaves the machine, so a clone never reaches this public repo.
- **Drama 3 needs about 40 GB free** (`bin/drama.py` refuses below 40 unless `SHIPSHOW_DRAMA_FORCE=1`) and drops words, so `.venv-drama` always carries faster-whisper, never direct a pause, and listen to the lines the voice step lists.
- **OmniVoice drops words when its window is too short**, so a take of one sentence gets its speed after generation (ffmpeg `atempo`); `STEPS` stays 32, and a run of sentences (D47) uses `pace: "window"`.
- **A take's identity includes the voice's bytes**: a clip replaced under the same name, or its `.txt` edited, re-voices its takes.
- **Whisper times runs of sentences, and only runs** (D47): a word time reaches `timing.json` only through `bin/wordtime.py`, only for a run, only as `words`; a run's take is heard back with `word_timestamps=True`, never a whole video's track; never make faster-whisper required; fix a cue that is a few hundred ms off with `data-cue="+seconds"`.
- **A take's key carries the check rules and the reference transcript** (OmniVoice only): bump `voicecheck.py` `VERSION` when a rule changes and `REF_PREP` in `bin/voice.mjs` when `quiet()` changes; a reference goes to the model exactly as recorded, never denoised (D53).
- **Voicing one take again gives the same take**: Drama 3's seed is hashed from the key, so change the line's words or its `[direction]`, and a take that repeated another line is never kept while a clean one exists (D105).
- **Takes are cached by text, voice and speed** in `assets/voice/<scene>-<n>.key` and the shared cache `~/.cache/shipshow/takes/` (`SHIPSHOW_TAKES_CACHE`; `off` disables); a test that runs `voice.mjs` must set `SHIPSHOW_TAKES_CACHE=off` or a temp folder (D106).
- **Generated files are gitignored** (`videos/*/assets/`, `review/`, `index.html`, `meta.json`, `timing.json`); never commit audio, frames or renders.
- **The name is ShipShow**, one word, two capitals; a rename also changes the PR reviewer's allowlist (latent-git-agents `config/repos.json` and `tests/repo-allowlist.test.mjs`), or PRs stop being reviewed.
- **`hyperframes lint` warns `nested_structure_needs_subcomposition` and `timeline_track_too_dense`** on every video; advisory, errors still block.
- **Project hooks enforce the no-delete rule** (`.claude/settings.json`, `.claude/hooks/`, D41, D80): the Bash guard refuses file deletion and git commands that discard work, the file guard refuses `sample_application/src/` and recorded runs, the Stop hook runs `npm test`; override only on purpose with `SHIPSHOW_ALLOW_DESTRUCTIVE=1`, `SHIPSHOW_EDIT_SAMPLE=1` or `SHIPSHOW_ALLOW_PRIVATE=1`, and move things aside with `mv`.
- **One extra closing tag in a scene ends the page early**; `build` stops naming the scene and the tag (`unbalancedTags` in `bin/lib.mjs`, D97).
- **`glow` on a light mood paints the accents as big blobs**; on a light sky use `vignette` or nothing.
- The scripts never delete files: a stale take is overwritten, never removed.
- **Never write a literal style or script tag in a comment** inside `kit/` or `themes/`: the build inlines them and `hyperframes lint` reads an unclosed tag.
- **A theme cannot restyle a hard-coded colour or font**: use `var(--card)` and the other tokens.

## For the PR reviewer

- **Don't flag code-level reference in this file as belonging elsewhere.** The owner put
  all of it here on purpose (2026-10-17): the README stays short for people, and this file
  is where agents find the code. Raised and declined on #6 and #8.

## Agent context (scope + memory)
<!-- BEGIN agent-context (managed by ~/.agents/bin/project-sync.sh) -->
- You are in **PROJECT scope** (this repo). Everything that is true across projects lives in user-scope canon (`~/.agents/AGENTS.md` + skills) and is NOT repeated here; this file holds only what is true of THIS repo.
- Project memory + shared skills: `.agents/` (gitignored). Read `.agents/memory/MEMORY.md` first.
- `.claude`/`.agents` here may be symlinks; verify with `readlink` before claiming a write landed.
- This file holds project facts only. Check with `~/.agents/bin/canon-echo.sh .`; a real exception is marked `<!-- canon-override: <rule> — <why> (date) -->`.
- Refresh infra: `~/.agents/bin/project-sync.sh .`
<!-- END agent-context -->

