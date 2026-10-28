# ShipShow: product requirements

Keep this file current: any change to what ShipShow must do, for whom, or how well, updates it
in the same change (`AGENTS.md`, *Docs that stay current*). How it is built and why is in
[DESIGN.md](DESIGN.md). Dates are absolute. Status is one of **done**, **in progress**,
**planned**, **open**.

Last reviewed: 2026-10-28 (after the overlap check and the music handoff were added).

## Problem

Agents change a code base faster than a person can follow. The person still has to decide
and ship, so they either read everything or ship what they do not understand. ShipShow's
answer is a short narrated video of what changed and what needs a decision, made by an agent
that is checked by other agents, so the person can ship code they understand. (`AGENTS.md`,
*What this is*.)

## Users

| Who | Needs |
|---|---|
| **A developer or reviewer** | Understand a change, a feature or a release quickly and correctly |
| **A person making a call** | Enough to decide, with the options priced and one recommended |
| **A working agent** | Hand a decision off mid-work and get an answer back without losing the thread |
| **An explainer agent** | A grounded way to learn a code base and turn it into a video |
| **A critic agent** | A bar to judge against, and evidence to judge with |
| **Someone with an idea to share** | A video of their argument in their own voice, true on every claim and fun to watch, to publish or pass around (the `essay` kind) |

The hackathon is for a company that main's README named amperium.ai (this branch removed the name), which does not resolve. The firm we can
read is **Aperiam** (aperiam.vc): "the leading adtech and martech venture capital firm", with a
ventures arm that backs adtech and martech startups, an advisory arm, an Ads arm doing "emerging tech
orchestration for supply chain, commerce, and identity", and a marketing arm. The person who asked for
the demo says it is now at `amperiu.vc`, which also does not resolve from here (unverified). The site says
nothing about AI, agents or **multimodal data**; that assumption, made earlier, is not supported and is
dropped (F19 stays open). The sample therefore speaks to an adtech company's pain: see
`sample_application/` (F18). The live hackathon demo is a decision video on a separate fictional code base,
`videos/invoice-leak` about `examples/ledgerly` (F29).

## Goals

1. A person can watch one short video and make a correct, informed call.
2. Every claim in a video traces to the code, and is checked by an agent that did not build it.
3. It runs on the person's own machine, with no cloud service for voice or video.
4. It ships as a **Claude Code plugin** (stated by the team, 2026-10-17), so it installs in
   other people's repositories.
5. Its cost in tokens and context is visible.

## Functional requirements

### Understand the code

| ID | Requirement | Status |
|---|---|---|
| F1 | An agent can get oriented in this repo before changing it (`repo-context`) | done |
| F2 | An agent can build a grounded context of any code base: purpose, functional and non-functional requirements, the behaviour of code and APIs, with unknowns listed (`code-context`) | done, being hardened |
| F3 | An agent can build a grounded context of a change (diff, PR, release): why, before and after, breaking, risk (`change-context`) | done, being hardened |
| F4 | Every statement of fact is tagged stated, read, ran or inferred, pinned to a commit or fallback, and absence claims are searchable (`evidence-standard`) | done, being hardened |

### Plan and make the video

| ID | Requirement | Status |
|---|---|---|
| F5 | Turn evidenced facts into a plan: viewer, outcome, one idea per scene, the picture for each (`explain-concept`) | done, being hardened |
| F6 | Write a script meant to be heard, at the pace the person set (`speed`, F25) (`narration-writing`) | done, being hardened |
| F7 | One name per concept across script, captions and scenes (`glossary`) | done, being hardened |
| F8 | Make a video from plain text: Kokoro voice, HyperFrames scenes, captions, MP4 (`bin/`, `kit/`, `explainer-video`) | done |
| F9 | A decision video: an agent hands a decision to a fresh explainer with options, costs and a pick (`decision-brief`) | done, being hardened |
| F10 | Elements appear on the word that names them (`data-cue`) | done |

### Judge it

| ID | Requirement | Status |
|---|---|---|
| F11 | Fresh critic agents judge a video; the builder never judges (`critic-loop`) | done |
| F12 | Nine critics, one skill each: `critic-accuracy`, `critic-clarity`, `critic-pacing`, `critic-sync`, `critic-visuals`, `critic-consistency`, `critic-engagement`, `critic-decision`, `critic-grounding` | done |
| F13 | A critic can verify that shown code and output match the source: a scripted excerpt check, capture files with a recomputable hash, a visible source file and range label, and a per-asset table (`critic-grounding`) | done, being hardened |
| F14 | A review packet gives critics measurements and frames (`npm run review`) | done |

### Hand it back and see the cost

| ID | Requirement | Status |
|---|---|---|
| F15 | A finished video is returned with its status, next step, what was checked and what is unsure (`explain-handoff`) | done, being hardened |
| F16 | Tokens and context per agent, subagents included, for a session (`npm run usage`) | done, **repo only**: it ships as an inert file but is not invokable from the plugin; output tokens are as recorded in the transcript and may undercount |

### Ship and extend

| ID | Requirement | Status |
|---|---|---|
| F17 | Package as a Claude Code plugin: `.claude-plugin/plugin.json` and `marketplace.json`, all skills, a `critic` agent with Read, Grep, Glob, Bash and Skill that cannot Write or Edit (Bash still can: DESIGN D45); validates (one expected warning: no `version`, deliberate) | done. Standalone in any repo: `code-context`, `change-context`, `evidence-standard`. The rest produce an artifact only the pipeline consumes (a brief, a plan, a script, a hand-back) or judge one, and need this repo cloned (open question 3). Packaging limits in DESIGN D13 |
| F18 | A sample application that makes the problem recognisable: `sample_application/`, a toy ad-spend pacer built by three agents in one day, each change correct for its task, with a bug only their interaction shows, a replayable git history and the hand-off notes a manager would have received | done |
| F19 | Take multimodal inputs (images, audio, video, documents) as evidence for a video | **open**: nothing we can read says the company has multimodal data |
| F23 | A video's look is a theme (`themes/shipshow`, `paper`, `launch`, `buildday`, `lofi`, `signal`, `chalk`, a client's in `local/themes/`) with motion and effects, made from a brand by the `theme` skill (main, #8) | done |
| F24 | How much critic review a video gets is a plan with presets and dials, set by the builder from the video's importance; a floor no dial lowers; `npm run critics` prints it (main, #9 and #10; this branch adds `critic-grounding` to the floor for a video that shows code) | done |
| F25 | The pace is the person's choice: `speed` is a multiplier on a base of about 160 words a minute, 1.25 by default; `critic-pacing` judges against about 210 syllables a minute times it (`BASE_SPM`) (main, #7) | done |
| F26 | A second voice engine, optional and Apple Silicon only: OmniVoice (MLX) for higher-quality and cloned voices, installed into the same `.venv` by `npm run setup:omnivoice`; Kokoro stays the default and runs anywhere (main, #11) | done |
| F27 | Captions a viewer follows word by word: a theme can light each word as it is spoken (`--cap-style: karaoke`), in short lines; `buildday` does (DESIGN D32) | done |
| F28 | Voices that read every word: OmniVoice takes are generated at their natural length and stretched to the speed, trimmed of dead air, and re-voiced if silent; `eve` is a built-in voice (DESIGN D31) | done; measured with Whisper, no dropped words in about 150 sentences |
| F29 | A decision video made through the real handoff, as the demo: a brief about a fictional code base, a fresh explainer agent, critics (`videos/invoice-leak`, `examples/ledgerly`; DESIGN D34) | done |
| F30 | A video ends on its finished frame, so a paused or ended player shows the answer while people discuss it; `hold` adds still seconds after the last word (DESIGN D36) | done |
| F34 | Sound effects keyed to cues: `data-sfx` on a cued element or `sfx()` in the scene script places a synthesized sound (a default kit, a theme's or a person's); the build refuses a run of one sound and any sound over a sentence's first word, sets each against the voice's measured loudness, tunes pitched ones to the bed's key, and the review packet lists every sound (DESIGN D43) | done; measured with ebur128 on how-it-works, the listening not verifiable by an agent |
| F35 | Every voiced take is checked: OmniVoice takes are cut of the model's opening burst and voiced again when they shout or start with no lead-in; every take of either engine is levelled (Kokoro's in place, key unchanged); with the optional faster-whisper (`npm run setup:hearback`) each take is heard back, OmniVoice keeps the best of three, and the review packet lists sentences under 0.97 (DESIGN D44) | done; measured on how-it-works with both engines, the listening not verifiable by an agent |
| F39 | A video about a person can show them: `<figure class="ss-portrait" data-commons="File:...">` resolves the file through the Wikimedia Commons API into a user cache, accepts only public domain, CC0, CC BY and CC BY-SA (anything else, or a CC file with no author, stops the build naming the scene and the file), draws `Photo: author · licence` on the photo, and the review packet lists file page, author, licence and licence link for `sources.md` (DESIGN D48) | done |
| F31 | Apply Anthropic's agent best practices: a smaller always-on context, hooks that enforce the hard rules, a read-only critic in fact, per-run results and evals with an independent judge. The step-by-step plan, with sources and what is unconfirmed, is `docs/PLAN.md` | planned |
| F32 | The hard rules are enforced, not only written: tracked project hooks refuse deleting and history-rewriting commands, edits to the demo's bugs and to recorded runs, and end a session on failing tests (first steps of F31; DESIGN D41) | done |
| F33 | A meme can land a beat: `<figure class="ss-meme" data-meme="<memegen id>">` with a span per line; the build fetches the template's config and clean picture from memegen (MIT) into a user cache, ShipShow draws each line itself (white with a black outline, fitted to the template's box at render time) so a line can arrive on its own word; `npm run memes` searches the catalog; the review packet lists each meme's template and source for credit (DESIGN D42). The template pictures are third-party and fetched at build, never committed; publishing a video with memes relies on fair use and commentary norms and is the publisher's call | done |
| F38 | OmniVoice with hear-back voices a scene in runs of whole sentences up to 45 words, one take per run, so the sentences keep one prosody; Whisper's word times from the same hearing place each sentence and written word inside the run (`timing.json` `words`), `build` cues on them; takes are levelled by one gain with a -3 dBFS ceiling, never clipped or squashed. Kokoro, and OmniVoice without faster-whisper, are unchanged (DESIGN D47) | done; measured on a test video in a cloned voice, the listening not verifiable by an agent |
| F40 | A meme can move: an animated memegen template (`data-meme`) or any GIF, MP4 or WebM (`data-clip` with an optional `data-crop` to cut a caption band) is fetched once, converted by ffmpeg to a cropped 30 fps H.264 video looped to cover the time the figure is on screen, and starts at the figure's cue, frame-seeked so a render is repeatable; top and bottom text is drawn over it as on a still; the packet lists its source (DESIGN D49) | done; frame-identical across renders and within a frame of the source on gif-test, the look to a viewer not verifiable by an agent |
| F36 | The judge cannot rewrite what it judges: the `critic` agent has Write, Edit and NotebookEdit denied, a turn cap and a default model (plan steps 3.1 and 3.2, DESIGN D45) | done; the Bash half (no writes outside a scratch directory) is open |
| F37 | A beat after one scene: `video.json` `pauses` gives a scene's last line time to land (a meme, a stamp) without slowing the rest (DESIGN D46) | done |
| F41 | A background with life that is the channel's own from any single frame: the `lofi` theme (a dusk sky over a seeded night skyline, drifting pools of light, dust, and film grain, scanlines and a vignette over the pictures but never over the captions), with photos and memes in a warm print frame; the layers are new ambients any theme can name, seeded and repeatable, and a theme that names none is unchanged pixel for pixel (DESIGN D50) | done; how-it-works passes `check` (71 of 71 text checks AA), `paper` frames identical to main |
| F42 | Sentences inside a run of narration never run together: a breath of at least the video's gap goes between them where Whisper heard less (DESIGN D51) | done |
| F43 | A render plays at the loudness its platform plays at: `render` masters the audio to -14 LUFS by default (`video.json` `loudness`), one gain and a capped look-ahead limiter, never compression, the picture untouched (DESIGN D52) | done |
| F44 | A writer decides which sentences are voiced together: with OmniVoice runs, each line of a script file is one take (DESIGN D54) | done |
| F45 | A writer directs the delivery: with the Drama 3 engine (`"engine": "drama"`, `npm run setup:drama`), a bracketed direction at the start of a script line (`[deadpan]`, `[sarcastic]`) is performed and never shown, cued or read by another engine; every take is heard back and retaken up to five times, and one still under 97% is kept and listed to listen to, as OmniVoice's are (DESIGN D55) | done; how each direction sounds is judged by ear, which an agent cannot |
| F46 | A quote is shown where it was said: `<figure class="ss-shot" data-shot="<url>" data-find="<words>">` is a screenshot of the real page (a PR comment, a contributing guide, a post), taken in headless Chrome at build, cached, with a marker on the words and a bar naming the page (DESIGN D56) | done; a page can change after it is captured, so the packet gives each capture's date |
| F47 | A photo's credit goes in the video's description, not on the photo: `review` writes *Credits* and `review/credits.txt` for every portrait and screenshot (DESIGN D57) | done |
| F49 | A word said wrongly is caught before render: hear-back retakes a Drama 3 take that spells out letters the script never spells, and an optional second listen (Parakeet, `npm run setup:listen`) hears the finished narration against the script as written (DESIGN D60) | done; a word said wrongly that both models mend from context still needs a person's ear |
| F48 | A theme for an argument: `signal`, near-black with a highlighter yellow, Bricolage Grotesque and Inter, karaoke captions, screenshots and photos flat on the desk (DESIGN D58) | done; judged by a fresh visual critic on never-about-the-code |
| F50 | Named moods selected by `data-mood` carry across scenes: optional theme and token overrides, seekable sky and ambient crossfades, midpoint type switches, and independent music beds with centred crossfades (DESIGN D61) | done; tests, and a demo rendered and looked at; first used by eth-is-false |
| F53 | A take that drawls is caught: Drama 3 retakes a take with more than 2.5 s between two words of one sentence, and the voice step lists any such take already made (DESIGN D65) | done; tests |
| F54 | Drama 3 voices a paragraph of up to 160 words per take, so the delivery carries through a thought; every explainer breathes (act cards, beats, structure never announced) and `critic-pacing` calls rushing a major (DESIGN D66) | done; first used by eth-is-false's third cut |
| F55 | Memes and GIFs by default: about one a minute in a video made to explain, every act with one, at least one moving, each tied to what is said; `critic-engagement` holds the bar (`explain-concept`) | done; eth-is-false's third cut has eleven |
| F56 | A narrator is invented from a description, never a real person's voice without consent; the person picks from a numbered audition and the take is kept as the clone every line uses, its description kept in `<name>.style` and told in every direction (`narration-writing`, *A narrator*; DESIGN D68) | done; `narrator-uk` |
| F57 | A finished video is packaged for YouTube: `npm run package` writes the upload folder (the render, a thumbnail set from `thumbnail.html`, and the title, description with chapters, sources, credits, tags and Studio's answers from `video.json` `"youtube"`), refusing anything YouTube would refuse or ignore (DESIGN D67); it stops when `sources.md` never names a clone or invented voice the video uses (DESIGN D74) | done; tests; first used by never-about-the-code |
| F58 | An explainer an AI narrates is self-aware and funny without cringe; comparisons are like for like on a picture that returns; memes compress one idea and are not reused across the person's videos (`npm run memes` and the packet say where one was used; DESIGN D70) | done; eth-is-false's fifth cut |
| F59 | Text drawn over other text or over a picture is measured at every cue, not left to stills: `npm run overlaps`, and the packet's *Overlaps* section (DESIGN D72) | done; eth-is-false's sixth cut has none |
| F60 | A new act's music hands off: the old bed fades from the act's last word, the new one swells in from its own opening under the act card (DESIGN D71) | done |
| F52 | An essay breathes: read at the voice's own pace (1.0 when it sets no speed), a beat before a new act (`video.json` `leads`, before a scene's first word, as `pauses` is after its last), a beat where a blank line separates two lines of a script (`beat`), and a build warning when a mood starts under 1.2 s before its first word (DESIGN D64) | done; tests; first used by never-about-the-code's eighth cut |
| F51 | An essay: `"kind": "essay"` is a video someone makes to share an idea in their own voice, built in sections, each with its own mood (a look and a music bed made for what it says); facts from `sources.md`, the author's view tagged as opinion, and enjoyment judged on top of truth (`critic-engagement`); the `archive` theme (a 1950s file drawer) is the first theme made to be one section's mood (DESIGN D62) | done; first used by never-about-the-code's seventh cut, the look and sound judged by its owner |
| F53 | Another repo builds on ShipShow: it pins a commit and runs it with its own layer (`SHIPSHOW_LOCAL`), venvs (`SHIPSHOW_VENVS`), render folder (`SHIPSHOW_OUT`) and video folders (`SHIPSHOW_VIDEOS`), so its videos, theme, rules and voices stay its own (DESIGN D75) | done; tests; first used by DAIS product-videos |
| F54 | Footage of the video's own app: local MP4, WebM or GIF figures start at their cue, optionally from an offset, play once at 1x and hold the final frame to the scene's end; independent frame tokens and packet measurements, outside memes and third-party credits (DESIGN D77) | done; tests; first used by DAIS product-videos |
| F55 | A series frame stays still across scenes: top-level ss-frame blocks share a persistent layer over scenes, below overlay and captions; scene-qualified arrival cues and optional fade-out cues use the shared timeline (DESIGN D78) | done; tests; first used by DAIS product-videos |
| F20 | Per-person preferences and private videos stay local (`tailor`, `local/`) | done in this repo; elsewhere a skill checks `local/` is ignored and uses `.git/info/exclude` |
| F21 | Run code to verify a claim without harm: a sandbox script, a faithful scratch copy, no network, writes confined (`evidence-standard`) | done on macOS; Linux untested |
| F22 | Scaffold and diagnose: `npm run new` from `template/`, `npm run setup` (picks a Python in 3.10 to 3.13, the range the pinned Kokoro supports, and upgrades the new venv's pip before installing), `npm run doctor` for what the machine lacks, a draft render mode | done |

## Non-functional requirements

| ID | Requirement | Where it shows | Status |
|---|---|---|---|
| N1 | **Local.** Voice and video are produced on the machine; nothing is sent to a cloud service for them | Kokoro-82M on CPU, HyperFrames headless | done |
| N2 | **Truth.** A fact the sources lack is reported as a gap, never filled | `sources.md`, `critic-accuracy`, `critic-grounding` | done |
| N3 | **Independence.** The builder never judges its own video; critics are fresh agents | `critic-loop` | done |
| N4 | **Public-safe.** A private code base's details never reach this public repo | `local/` is gitignored; `evidence-standard`, *Where the result goes* | done |
| N5 | **Safe to run.** Reading a code base does not change it, spend money or send data out | `evidence-standard`, `scripts/sandbox-run.sh` (DESIGN D9) | done on macOS, tested; refuses elsewhere; reads are not confined and it is not a defence against hostile code |
| N6 | **Cheap to carry.** Each skill's name and description count toward context on every turn once installed, so descriptions stay short and bodies stay under 500 lines | Measured 2026-10-27: 23 skills, 8,350 characters (about 2,088 tokens) of names and descriptions; longest SKILL.md 238 lines (a test checks these figures against the tree) | done |
| N7 | **Reproducible.** A voice take is cached by text, voice and speed; generated files are gitignored | `assets/voice/*.key` | done |
| N8 | **Observable.** Token and context use is readable per agent | `npm run usage` | done |
| N9 | **Tested without Kokoro.** `npm test` runs with no voice model; it is the only thing CI runs | `test/` (62 tests in `pipeline.test.mjs`, plus the voice-check and run tests in `voicecheck.test.mjs` and `runs.test.mjs`; the sandbox and capture tests run on macOS only, the CI docs check only on a pull request) | done; 7 tests need `npm install` (the cue-and-caption timing test, the caption function-word test, the bare-cue warning test, the flair test, both OmniVoice tests and the `hold` test) |
| N10 | **Portable.** The pipeline is tested on macOS; CI runs the unit tests on Linux (`ubuntu-latest`) | `README.md`, `.github/workflows/ci.yml` | open: pipeline on Linux untried |
| N13 | **Third-party pictures stay out of the repo.** Memegen's code and configs are MIT; its template images are third-party pictures, fetched at build into `~/.cache/shipshow/memes` and the video's `assets/memes/` (gitignored: `videos/*/assets/` covers it), never committed. The meme fonts (Titillium Web, Anton) are SIL OFL, shipped with their licences in `kit/fonts/` | `bin/meme.mjs`, `.gitignore`, `kit/fonts/` | done |
| N11 | **Attribution.** The sample is original (its `SOURCE.md` says what it is and is not based on); Kokoro-82M and HyperFrames are Apache 2.0; GSAP is under its standard licence | `sample_application/SOURCE.md`, `README.md` | done |
| N12 | **Reviewable.** Every change is a pull request with CI and an automated review; a rename changes the reviewer's allowlist | `AGENTS.md`, traps | done |

## Out of scope for now

- Speech recognition for timing, except in a run of sentences, where the Whisper that already hears the take back also times it (DESIGN D47, F38). Kokoro and a take per sentence are timed from where the take was placed (DESIGN D1).
- Publishing renders or audio. Generated files are never committed.
- A hosted service.

## Success criteria

- A fresh agent, given a code base and a question, produces a context in which a second agent
  can verify every line without asking the first.
- A video about the sample app (`sample_application/`) passes all of its critics, and `REVIEW.md` shows the
  rounds. The video answers the question a developer asks the morning after: which of three correct-looking
  changes made the Tokyo campaign spend 181% of its budget, and is anything else wrong.
- A decision video made through the handoff, on a code base it has never seen, passes its floor critics (accuracy and
  decision) within the review plan: met by `videos/invoice-leak` (`REVIEW.md`).
- Planted defects (a hidden behaviour change, a wrong brief claim, a fabricated output) are
  caught by the skills' own method rather than by luck. The red-team record is in
  [`skills/REVIEW.md`](../skills/REVIEW.md).
- The plugin installs from a marketplace and its standalone skills (`code-context`, `change-context`, `evidence-standard`) run in a repo that is not this one: **partly met**, since the video skills need this repo cloned.

## Open questions

1. What is the company's data and product, and is the firm at `aperiam.vc`, `amperiu.vc` or the README's
   `amperium.ai` (the address main's README used)? Nothing readable mentions multimodal data; F19 waits on an answer.
2. Does the hackathon prompt require a particular deliverable or judging criterion?
3. Should the video pipeline (Kokoro, about 340 MB, HyperFrames and Chrome, about 190 MB, a Python
   environment) be installed by the plugin, for example under `${CLAUDE_PLUGIN_DATA}`, or stay a repo the
   user clones? Until it is decided the pipeline skills, `critic-loop`, the critics and `tailor` need a
   clone (DESIGN D13).
