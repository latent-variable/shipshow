# Layout and how the timing works

## Moved from AGENTS.md (2026-11-17)

The full original text, unedited. The rule for each item is kept in one sentence in `AGENTS.md`; these details bind as the rule's own text.

Kokoro does not report word times. So `bin/voice.mjs` voices each sentence on its own and places it on
the track: a sentence's start is exact because we put it there. A word inside a sentence is
placed by its share of the sentence's letters, close enough for a card to land on the word
that names it. OmniVoice with hear-back voices runs of sentences instead, and the words
Whisper hears in each run time its sentences and words (see *Runs of sentences*). `bin/build.mjs` turns those times into `data-start` and `data-duration` on each
scene and caption and `data-at` on each cued element; `kit/kit.js` is the shared GSAP timeline;
HyperFrames renders the page frame by frame in headless Chrome and muxes in the narration.

```
bin/        devices (the editing moves a video makes, against the person's other videos), sfx and sounds (sound effects: placement, rules, synthesis), voice, build, render, make, review, timeline (how long each step took), overlap (text on text, measured), critics, memes, footage.mjs (local recordings, played once and held), new, doctor, setup, link-skills, usage; lib.mjs is shared, entry.mjs says whether a file is the script node runs (D79), measure.mjs holds the packet's measurements, python.mjs the supported Python range; voicecheck.py and hearback.py (and hearback.mjs, their node side) check every take; omnivoice.py and drama.py are the two MLX engines' workers
kit/        shell.html (the page), base.css (canvas, captions, ss- pieces), kit.js (timeline, effects, meme text fitting), sfx.json (the default sound kit), fonts/ (the meme fonts)
themes/     shipshow, paper, launch, buildday, lofi, signal, chalk, archive, ripple, vault, redline and stadium; each a theme.css of tokens, plus fonts (Space Grotesk, Space Mono, JetBrains Mono, Fraunces, Nunito, IBM Plex Mono, Bricolage Grotesque, Inter, Playfair Display, Courier Prime, Anton, Press Start 2P: SIL OFL)
skills/     the explainer and development skills, critic-loop, publish, tailor, theme and the ten critics
template/   what npm run new copies
videos/     how-it-works (the example), how-we-built-it, why-shipshow (the pitch), invoice-leak (the decision demo, about examples/ledgerly), pacer-dev-journey (the Aperiam sample) never-about-the-code (an opinion piece for Lino's channel, in his cloned voice; renders only where local/voices/lino-long.wav exists, with Drama 3 set up) and eth-is-false (OpenAI's ETH preprint explained, for the same channel, read by an invented young British Drama 3 narrator, `local/voices/narrator-uk.wav` with its `.style`, on the chalk theme); qwen-phones-home (Cohere's Qwen 3.8 Beijing-upload claim investigated, the same narrator, on the signal theme); and kakeya-every-dimension (OpenAI's local smoothing preprint and the Kakeya conjecture explained, the same narrator, on the ripple theme); and binance-heist (the $6.3 billion Binance theft of 2026-10-29 explained, the same narrator, on the vault theme); and weight-space (MIT's GPT-6 Astra experiments reading, fixing and writing network weights, from the team's released logs, the same narrator, on the redline theme, the first video built under critic-novelty); and raise-the-bar (Qwen 4 Max, the Artificial Analysis index's version five and the distillation claim, the same narrator, on the stadium theme)
examples/   ledgerly, a fictional invoicing API with one authorization bug, a threat model and an access log
skills/critic-grounding/scripts/  excerpt.mjs and check-excerpt.mjs, the excerpt check (run through the skill)
skills/evidence-standard/scripts/  sandbox-run.sh, capture.mjs, verify-vendored.sh (run through the skill)
sample_application/  pacer-demo, a toy ad-spend pacer built by three agents in a day: the Aperiam sample (README, history/, agents/; ANSWER.md is a spoiler)
docs/        PRD.md and DESIGN.md (kept current); assets/ holds the README's images: make-assets.mjs draws the SVGs (fonts embedded); demo.gif and themes.jpg are frames of videos/invoice-leak
test/       sentence splitting, pronunciation swaps, cue and caption timing, skill links, usage counting, the excerpt checker, the sandbox runner, the docs rule
local/      gitignored, per person (tailor skill)
```


## Where things are: the full table (moved from AGENTS.md, 2026-11-17)

| Path | What |
|---|---|
| `.claude-plugin/`, `agents/` | The Claude Code plugin: `plugin.json`, `marketplace.json`, and the `critic` agent (Read, Grep, Glob, Bash and Skill; Write, Edit and NotebookEdit denied, `maxTurns` 40, Sonnet by default; Bash can still write, so it is told to use a temporary directory). Validate with `claude plugin validate .` (one expected warning: no `version`) |
| `docs/PRD.md`, `docs/DESIGN.md` | The requirements, and the design decisions and behaviour. Kept current (*Docs that stay current*) |
| `skills/` | Every skill. `npm install` links them into `.claude/skills/` for Claude Code; other agents read them here |
| `videos/<name>/` | One video: `script/`, `scenes.html`, `video.json`, `sources.md`, `critics.md`, `REVIEW.md` |
| `bin/` | The pipeline: `voice`, `build`, `render`, `make`, `review`, `new`, `doctor`, `critics`; `memes` (search the memegen catalog, with `meme.mjs` behind it and `build`); `portrait.mjs` (Commons photos, credit and licence gate, called by `build` and `review`); `shot.mjs` (screenshots of real pages, taken in headless Chrome, called by `build` and `review`); `footage.mjs` (local app recordings played once and held, called by `build` and listed by `review`); and `usage` (token and context tracking) |
| `kit/` | The page, base styles (including `ss-portrait`) and timeline every video shares; `kit/fonts/` holds the meme fonts (Titillium Web, Anton: SIL OFL, licences beside them) |
| `themes/` | Shared themes (`shipshow`, `paper`, `launch`, `buildday`, `lofi`, `signal`, `chalk`, `archive`, `ripple`, `vault`, `redline`, `stadium`); a client's goes in `local/themes/` |
| `template/` | What `npm run new` copies |
| `examples/` | Fictional code bases for example videos: `ledgerly`, the invoicing API behind `videos/invoice-leak` |
| `.claude/settings.json`, `.claude/hooks/` | The project's Claude Code hooks and read denials (tracked; `.claude/skills/` is the generated skill links and is not) |
| `local/` | Gitignored, per person: `preferences.md`, `critics.md`, `skills/`, and `videos/` about code that is not this repo's |
