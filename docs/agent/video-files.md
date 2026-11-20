# A video's files: the full reference

## Moved from AGENTS.md (2026-11-17)

The full original text, unedited. The rule for each item is kept in one sentence in `AGENTS.md`; these details bind as the rule's own text.

| File | What it is |
|---|---|
| `script/01-intro.txt`, `02-...` | One file per scene, read aloud in file-name order. A sentence ends at `.`, `!` or `?` and a space. With OmniVoice runs, write one thought per line: each line is one take, so sentences meant to land together are voiced together (`lineRuns`, D54; a line over 70 words is split). A blank line between two lines is a beat: `video.json` `beat` seconds (0.6) more than the gap, so a punchline lands before the next point (`beatsAfter`, D64) |
| `scenes.html` | One `<section data-scene="01-intro">` per script file, a `<style>` for the look, optionally a `<script>` |
| `video.json` | `title`, `builtBy` (the model that built it, as the builder knows itself: "Opus 5.5"; a title tag names it, D95), `kind` (`decision`, `feature`, `release`, `essay`: an idea argued in the author's own voice, to share), `importance` and `importance_reason` (set by the builder), `sfx` (sound effects: `false`, a kit name, or `{kit, under, tonic}`), `shows_code` (puts `critic-grounding` on the floor; read from `scenes.html` when absent: a `<pre>`, `<code>` or `.ss-code` sets it, and `false` cannot lower it), `voice`, `speed`, `theme`, `flair`, `moods` (named looks, ambient and music selected by `data-mood`), `review`, `say`, `audience`; optional `lead`, `gap`, `tail` (seconds of pause), `pauses` (`{"<scene>": seconds}`: a beat after one scene, so a meme or a stamp at its end can be read), `leads` (`{"<scene>": seconds}`: a beat before one scene's first word, so a new act's look and music arrive first), `beat` (seconds a blank line in a script adds, 0.6), `hold` (still seconds after the last word; the last scene never fades), `youtube` (what `npm run package` publishes: `title`, `alternatives`, `description` paragraphs, `chapters` by scene, `sources`, `credits`, `tags`, `studio`), `seed`, `loudness` (LUFS the render is mastered to; -14 by default, `false` for none) |
| `sources.md` | Every claim the video makes, with its source |
| `critics.md` | This video's own bar, applied by every critic |
| `brief.md` | A decision video's handoff from the agent that asked for it |
| `REVIEW.md` | The critic rounds |
| `thumbnail.html` | The YouTube thumbnail, a 1280 by 720 page (`npm run package` renders it) |

**Cues.** An element with `data-cue` arrives when the voice reaches that word:
`data-cue="Kokoro"` (the first word starting "Kokoro" in that scene; a prefix, so `one` also lands on "Once" and counts in `#n`), `data-cue="model#2"`
(the second), `data-cue="+0.3"` (0.3 s into the scene). The build stops on a word the scene
never says, and warns when a bare word occurs more than once. `data-anim` picks the entrance
(the theme's `--entrance` when absent): `up`, `fade`, `pop`, `left`, `right`, `grow`, `zoom`,
`blur`, and `type` (letter by letter), `draw` (an SVG's strokes draw themselves), `count` (the
number in the text counts up), `highlight` (a marker sweeps under text already shown),
`stagger` (children in turn), `pulse` (pops, then beats), `scramble` (decodes from glyphs),
`glitch` (arrives split into colour channels, jitters, settles), `slam` (lands big and hard). A `<script>` in `scenes.html` runs after the shared
timeline and may add GSAP tweens to `tl`; each cued element's time is its `data-at`.

**Voice.** Three engines, set by `engine` in `video.json` or `local/config.json` (`--engine` on `make` or
`voice` tries one). **`kokoro`** is the default and runs anywhere: `af_heart`; `npx hyperframes tts --list`
shows the rest; non-English voices need `espeak-ng` system-wide. **`omnivoice`** is higher quality and
clones voices, on Apple Silicon only (MLX; `npm run setup:omnivoice`, then `"engine": "omnivoice"`). Its
`voice` is a recording: a **built-in** one (`caro_davy`, the default, `bill_boerst`, `peter_yearsley`,
`stuart_bell`, `marius`, `javert`: CC0 clips from kyutai/tts-voices, `bin/omnivoice-voices.json`; and `eve`,
VCTK speaker p361, CC BY 4.0, which a public video credits: "Voice: VCTK corpus, CC BY 4.0") or a
**clone**, a 3 to 10 second clip at `local/voices/<name>.wav` with, optionally, the words spoken in it at
`<name>.txt` beside it (a clip that ends mid-word, or has no transcript, clones worse: Eve's silent takes, 2026-10-17;
with hear-back installed a clone or built-in voice with no `.txt` is given one by hearing its reference back, so
write the `.txt` only to correct it). `say` maps a written word to what the engine is told to say
(`"HyperFrames": "Hyper Frames"`); captions keep the written form. **`drama`** (Fish Audio Drama 3, DESIGN D55) is the
directed one, on Apple Silicon only: `npm run setup:drama` makes `.venv-drama` (it needs an mlx-audio newer than
OmniVoice's pin), and the model (`mlx-community/fish-audio-drama-3-4bit`, pinned in `bin/lib.mjs` `DRAMA`, about 20 GB)
downloads on first use unless `SHIPSHOW_DRAMA_MODEL` or `local/config.json` `"dramaModel"` names a folder holding it. A
stage direction in brackets at the start of a script line, `[deadpan] Like animals.`, is performed; captions, cues and
the other engines never see it (`directedSentences` in `bin/lib.mjs`). How to direct, and what breaks it: `narration-writing`,
*Direction*. Write a name as it is spelled: a `say` respelling with a hyphen is read as two words ("Dike-stra" came out
"Di... kistra"), so respell only a name it gets wrong, as one word ("Dykstra"; D55). Voices are the same recordings as OmniVoice's, but a clone may be 3 to 30 seconds. Each line is one take,
made by `bin/drama.py` in one process: retaken when it is silent, stalls for 2 s (silence read against its own hiss and 18 dB under its voice), ends in 3 s of silence, is heard back missing a whole sentence (a dropped punchline) or drawls (over 2.5 s between two words of one sentence, D65), time-stretched
to `speed` (0.8 to 1.5; it has no speed control and reads slower than the base pace), levelled, heard back with word
times, and the best of five kept. Each line hears the video's first take and the take kept for the line before it (D83), so the
voice carries on instead of resetting at every line; a line voiced again alone hears its neighbours' kept takes, and the lines
after it keep theirs. A take that says part of what it heard again (five or more words its line lacks, `hearback.added`) is retaken
hearing nothing. Its licence is the Fish Audio Community License: free for research and non-commercial
use and for commercial use under $500K a year in revenue, never as a hosted service, and never a voice cloned without
consent.

**Checks on every take** (ported from DAIS product-videos, where the owner heard these faults in published
videos; `bin/voicecheck.py`, `bin/hearback.py`, `bin/hearback.mjs`). *Levelling*, both engines: a take's median
speech is moved toward -23 dBFS by one gain, held back when it would put the loudest sample over -3 dBFS, so no
take is clipped or squashed and one with a big peak stays a little quieter (a tanh knee above 0.4 did this before
and was audible as a close mic on short takes, 2026-10-26). Kokoro's are levelled in place after voicing and their
cache key is unchanged (a `.lvl` stamp beside the take records it; a take stamped by older rules is voiced again). *OmniVoice only*: the opening burst of noise is cut at the
silence after it, a take that starts with no lead-in or shouts (a 400 ms stretch over 8 dB above its own median)
is voiced again with another seed, up to three times, then kept and reported. *Hear-back*, optional
(`npm run setup:hearback`; `--no-hearback` turns it off): faster-whisper small.en transcribes each take and
`bin/hearback.py` scores it against the text the engine was told to say, by letters with spaces, punctuation and
marks gone and numbers spelled out (a percent sign as the word; each number read as a quantity, a year, or digit by digit, the closest kept, and "a hundred and seventy one" the same as "171"). It also looks for letters spelled out that the script never spells (`spelled_out`:
Whisper writes letters it hears spelled as capitals, "two to the EN"), against the script as written and as told; Drama 3
retakes such a take, and one kept with it is listed (D60). *Second listen*, optional (`npm run setup:listen`, Apple Silicon;
`--no-listen` skips it): after the track is laid, `bin/listen.py` has NVIDIA's Parakeet hear each scene of
`assets/narration.wav` and compares it with the script as WRITTEN (letter score under 90%, a sentence not heard, letters
spelled out), writes `assets/listen.json`, prints LISTEN lines, and the packet shows it under *Second listen* (stale once the
narration changes). It flags and never re-voices. OmniVoice keeps the best of three; under 0.97 is flagged. Each take's
`assets/voice/<scene>-<n>.check` holds the result, `timing.json` `voiceCheck` collects it, and `npm run review`
prints it in the packet's *Voice checks*. Without faster-whisper everything else still runs and the packet says
nobody heard the takes.

**Runs of sentences** (D47). With OmniVoice and hear-back installed, a scene is voiced in runs of whole sentences
up to 45 words (a longer sentence stands alone), one take per run, `assets/voice/<scene>-r<n>.wav`, because a take
per sentence restarts the prosody each time and sounded choppy (the owner, 2026-10-26). Each run is retried up to
five times for a clean start, kept as the best of three by hear-back score, and cached by its own text, so editing
a sentence re-voices its run. Where Whisper heard two sentences of a run closer than the video's `gap`, a breath of silence goes at the midpoint of the first stretch of real silence that reaches past Whisper's end of sentence and is followed by voice. The stretch must be at least 30 ms long, with every 10 ms window under -50 dBFS (`BREATH_RUN`, `BREATH_QUIET_DB`), and 30 ms of voice over -35 dBFS must follow within 150 ms (`BREATH_VOICE_DB`, `BREATH_ONSET`). The search runs from 80 ms before that end to 300 ms past the next sentence's start (`BREATH_BEFORE`, `BREATH_AFTER`); a boundary with no such stretch is left as it is (`breathe` in `bin/lib.mjs`, D51), so a run keeps its prosody without running sentences together. The same Whisper pass that scores the take gives word times (`word_timestamps`);
`bin/wordtime.py` lays the script's sentences and written words on them (through `say`, with a word Whisper missed
placed between its neighbours), and they go in `timing.json` as each sentence's `words: [{"w", "at"}]`. `build`
uses them for cues and captions when present, and the letter share otherwise. Kokoro, and OmniVoice without
hear-back (or with `--no-hearback`), keep one take per sentence and the letter share, and nothing requires faster-whisper.

**Look.** A theme is `themes/<name>/theme.css` (or `local/themes/<name>/`, which wins): a
`:root` of tokens for colour, type, spacing, shape, captions and motion; `themes/shipshow`
lists them all. Fonts and images sit beside it and are copied to `assets/theme/`, relative
`url()`s rewritten (`bin/lib.mjs`, `themeCss`). Most specific wins: `--theme`, then
`video.json`, then `local/config.json`, then `shipshow`. `kit/base.css` draws the canvas,
captions and the `ss-` pieces from the tokens; a scene's own styles should use the tokens
too, or a theme cannot restyle it. Tokens a theme may add, each unset (so other themes are unchanged) unless it opts in:
`--sky` (the canvas's background, e.g. a gradient; `--bg` when unset), `--cap-border`, `--cap-shadow` and `--cap-wait` (karaoke's waiting words, 0.38), `--code-shadow`,
`--meme-border`, `--meme-shadow` and `--photo-filter` (a CSS filter on meme pictures, to make pictures from anywhere look
like one set), and `--frame`, `--frame-width`, `--portrait-frame-width`, `--portrait-radius`, `--portrait-shadow` and `--photo-filter` for framed photos (portraits and memes read them, falling back to the card border, shadow and no filter). `lofi` sets
them all: a late-night study room (dusk sky, a city skyline, lamp amber, Fraunces, Nunito and IBM Plex Mono).

**Moods.** `video.json` `"moods": {"history": {"theme": "paper", "look": {"--accent": "#b3261e"}, "ambient": "stars glow", "music": {"file": "history.wav", "volume": 0.22, "duck": 0.35}}}` names a section's feel. A
`<section data-scene="02-history" data-mood="history">` selects it and following sections keep it until another names a mood;
an unknown name stops the build with its scene. Before the first, the video's own theme, flair and music apply. Each mood starts
from the base tokens, takes its optional theme's tokens, then its `look`. Mood theme files live under `assets/theme/<name>/`.
Skies and explicit ambient layers crossfade over 1.2 seconds centred on the boundary; colours and plain numbers tween on the
shared timeline, while fonts, caption tokens and other values switch at the midpoint. No `ambient` keeps the base ambient.
Music accepts a file string or the usual object and loops if short. Where a mood changes the music, it hands off (D71): the old bed fades
from the act's last word, held at its ducked level so it never swells back up, and is gone 0.5 s after the boundary; the new one
starts from its own opening at the boundary and swells in over 2 s under the act's card. Absent or missing music keeps the previous bed's playhead. No moods keeps the single-bed path. The build warns when a mood starts less than 1.2 seconds before its scene's first word
(`MOOD_BEAT`): give the change a beat with `leads`.

**Frame.** Top-level `.ss-frame` blocks outside the sections in `scenes.html` are lifted, in source order, into one full-canvas `#frame` layer. It sits over the scenes and under both `#overlay` and captions, inherits the mood's tokens, and stays present from zero to the end without scene transitions or camera pushes. Uncued elements show from the first frame. An arrival uses a scene-qualified cue, such as `data-cue="02-start:Paste"`, `data-cue="02-start:word#2"` or `data-cue="02-start:+0.3"`, resolved exactly like that scene's own cues with the usual `data-anim`. Unqualified cues and unknown scene ids stop the build naming the element. Optional `data-leave="02-start:+3"` starts a 0.4-second fade at that time. The overlap check includes frame text against scene text (DESIGN D78).

**Motion.** Theme tokens `--transition` (`none`, `fade`, `rise`, `slide`, `zoom`, `wipe`,
`flash`, `whip`: a fast blurred pan, once a video), `--camera` (`none`, `push`: a slow push-in per scene), `--ambient` (`none`, `glow`,
`grid`, `dots`, `stars`, `horizon` (a lit planet rim low in the frame), `blobs` (soft pools of light that drift and breathe;
`--blob-1..3`, `--blob-strength`), `dust` (motes rising in lamplight; `--dust-color`), `skyline` (a night city along the bottom,
two rows drifting apart, a few windows going on and off; `--skyline-far`, `--skyline-near`, `--window-color`), and three that
lie over the pictures but under the captions, in `#overlay`: `grain` (`--grain-strength`, `--grain-fps`, `--grain-blend`),
`scanlines` (`--scanline-strength`, `--scanline-gap`) and `vignette` (`--vignette-strength`, `--vignette-color`); or several:
`stars glow`), `--ambient-strength`, `--progress` (`on`, `off`; off in every shared theme, D99) and `--entrance`. `video.json`
`"flair"` overrides them for one video; a section's `data-transition` or `data-camera` for
one scene. A cued element's `data-punch="1.15"` snaps the scene's view toward it on its word (1 to 2; 1.1 to 1.25 keeps the
neighbours in frame), holding to the scene's next punch or `data-punch-out` seconds; `data-drop="1.5"` cuts the music bed to
silence on its cue for that many seconds (0.3 to 6), back over half a second (D96). Rare moves land: `explain-concept`, *Break the formula*. Ambient motion is seeded from the video's name (`"seed"` to change it), so a
render is repeatable and each video moves its own way. Motion that sways, wraps or jumps is a pure function of the time,
driven through GSAP modifiers on one linear tween (`kit/kit.js`, `driveBy`), so a worker that seeks anywhere draws that
time's frame; a test runs the kit in a sandbox and checks it (DESIGN D50).

**Review.** How much critic review a video gets is a plan with dials (`critics`, `rounds`,
`until`, `model`, `final`, `frames`, `rerun`) and presets (`quick`, `standard`, `thorough`),
resolved by `reviewPlan` in `bin/lib.mjs`. The builder picks the preset by setting
`video.json` `"importance"` (`low`, `normal`, `high` for `quick`, `standard`, `thorough`) with
an `"importance_reason"`. Most specific wins: flags, then `video.json` `"review"` (an
explicit preset there beats importance), then importance, then `local/config.json`
`"review"`, then the kind's default (`quick` for a decision video, else `standard`). `skills/critic-loop` has what each dial trades and the floor no dial lowers.
The estimate's constants are measurements from 2026-10-17 and 2026-10-27, and its tokens grow with the video's length; replace them when you measure. The builder says the spend before round 1 and stops past it (`critic-loop`, *Spend is part of the plan*).

**Memes.** A well-chosen meme lands a beat. `<figure class="ss-meme" data-meme="astronaut" data-cue="never" data-anim="pop">`
with a `<span>` per line, filled into the template's text boxes in order (an empty span leaves a box blank,
fewer spans leave later boxes out, more than the template has stops the build); a span takes its own
`data-cue` and `data-anim`, so each line arrives on its word. `npm run memes -- <words>` finds the id
and shows how many lines it has. The catalog is memegen's (github.com/jacebrowning/memegen, MIT): the build
fetches a template's `config.yml` and clean `default.<ext>` once into `~/.cache/shipshow/memes/<id>/`
(`SHIPSHOW_MEMES_CACHE`), copies the picture to the video's `assets/memes/` and positions each span by the
box's fractions and angle (`bin/meme.mjs`); `kit/kit.js` fits each line to its box at render time, before the
first frame, in white with a black outline (black text gets a white one), upper case (`--meme-case`). Never
memegen's rendered images: they carry a watermark and bake the text in. `SHIPSHOW_MEMEGEN_API` (the catalog)
and `SHIPSHOW_MEMEGEN_FILES` (the repo's `templates/` folder, a URL or a clone) point at a mirror or a
self-hosted memegen. An unknown id, an unreachable source with nothing cached, or too many spans stops the build
naming the scene. Default size is `--meme-height` (760 px; set it in the theme, on the figure, or give the figure its own
width and height), centred in the scene window, rounded and framed by the theme. The template pictures are
third-party: fetched, never committed (`assets/` is ignored), and a published video relies on fair use and
commentary norms, which is the publisher's call (DESIGN D42). The review packet lists each meme's template and
`source`; credit both in `sources.md`.
**Moving memes** (DESIGN D49). `data-meme="rollsafe"` plays a template whose clean `default.gif` is animated (17 of them; the
cache now tries gif first), and `<figure class="ss-meme" data-clip="https://i.imgflip.com/62yufy.mp4" data-crop="top 98px"
data-name="Willem Dafoe looking up" data-credit="<page to credit>" data-cue="agents" data-anim="pop"><span class="top">..</span>
<span class="bottom">..</span></figure>` plays any GIF, MP4 or WebM: a URL (fetched once into `<cache>/clips/`) or a file in the
video's folder. Imgflip serves each GIF template as a clean `https://i.imgflip.com/<id>.mp4`. `data-crop` takes sides with `%` or
`px` (`top 14%`, `top 40px bottom 5%`); measure a frame for the band to cut, because a guess leaves white under the text. Text is optional: `top`
and `bottom` spans (or first and second), drawn like a still's. `ffmpeg` writes `assets/memes/clips/<key>.mp4` (30 fps H.264, a keyframe
a second, looped to cover the figure's cue to its scene's end) and the figure holds a `<video>` that starts at its cue; a scene that
holds one keeps its times in `data-scene-start` and `data-scene-duration`, because HyperFrames refuses a video inside a timed
element. A bad crop, a clip that is not a GIF, MP4 or WebM, or one with nothing cached and no network stops the build naming the scene. The
packet lists each animated meme with its source URL; credit it in `sources.md` (third-party, as above). An animated template's box with memegen `start` and `stop` times shows only in that part of every loop, counted from the figure's cue (`crowd`'s two lines take turns in one corner; D81).

**Footage** (DESIGN D77). The video's own app recording uses `<figure class="ss-footage" data-footage="footage/03-try.mp4" data-cue="paste" data-anim="fade"></figure>`: a local MP4, WebM or GIF relative to the video's folder, or an absolute path; URLs are refused. It plays once at 1x from its cue (the scene's start without one), from the file's start or `data-from="<seconds>"`. A short recording holds its last frame to the scene's end, never loops. `bin/footage.mjs` shares the clip encoder and seekable video markup with moving memes, writing `assets/footage/<key>.mp4`; it adds no text bands or meme attributes, and asks for no third-party credit. The packet's *Footage* section lists the scene, file, length, offset, scene-relative start and final-frame hold duration. A framed window uses `--footage-width` (1344px by default), the file's aspect ratio, `--footage-radius`, `--footage-border` (the card border when unset) and `--footage-shadow`. Like the other figures it is centred in the scene window; inside a layout set `position: relative; inset: auto; margin: 0`.

**Portraits.** To show who is being talked about: `<figure class="ss-portrait" data-commons="File:Edsger Wybe Dijkstra.jpg" data-cue="Dijkstra" data-anim="pop"><figcaption>Edsger Dijkstra<small>1930-2002 · structured programming</small></figcaption></figure>`
(the name is the Commons file page's title; the figcaption is yours and optional). The build (`bin/portrait.mjs`) asks the Commons API
for the file's thumbnail (900 px wide), author and licence once, keeps both in `~/.cache/shipshow/commons/` (`SHIPSHOW_COMMONS_CACHE`;
`SHIPSHOW_COMMONS_API` moves the endpoint, or is a folder of replies, which is how the tests run), copies the picture to the video's
`assets/portraits/`, and writes a credit line (`Photo: James S. Davis · public domain`, `Photo: Hamilton Richards · CC BY-SA 3.0`) into the figure, hidden by default.
**The licence gate** accepts public domain, CC0, CC BY and CC BY-SA of any version; anything else (non-free, fair use, NC, ND, GFDL, a licence
Commons does not state), and a CC file with no author, stops the build naming the scene and the file. The gate runs on every build, cached or not.
`review` lists each portrait's file page, author, licence and licence link under *Portraits*: copy them into `sources.md`. The
credit is not drawn on the photo (`--portrait-credit: block` draws it); it goes in the video's description, which `review` writes
under *Credits* and in `review/credits.txt` with the screenshots' pages (D57). Size: `--portrait-height`
(640 px; theme or figure style). `ss-portrait-gray` and `ss-portrait-duo` (the theme's accent) treat an old or mismatched photo. A figure is
centred in the scene window; to place two side by side, wrap them in a flex row and give each `position: relative; inset: auto; margin: 0`.
A portrait is a person's photo: the pictures are third-party, fetched, never committed, and Commons' metadata is only as good as its uploader
(some Karpathy and Sanfilippo files are YouTube stills): read the file page before publishing.

**Screenshots** (DESIGN D56). To show a quote, a rule or a comment where it was said: `<figure class="ss-shot" data-shot="https://github.com/ocaml/ocaml/pull/14369#issuecomment-3556593972"
data-find="hard to review, and very lightly tested" data-mark-cue="lightly" data-cue="OCaml's" data-anim="up"></figure>`. The build
(`bin/shot.mjs`) opens the page in HyperFrames' headless Chrome (`SHIPSHOW_CHROME` overrides), dark mode unless `data-scheme="light"`,
`data-width` CSS px wide (1100 by default: narrower makes the text bigger on screen), captures `data-select`'s element or else the
block holding `data-find`'s words (`data-pad` px around it, default 20), and marks those words, one box per line; `data-mark-cue`
sweeps the marker in on its own word. `data-select` may name several elements (`"#review h3, #review table"`: one capture around
them all, and the words are looked for inside the nearest element holding them; hidden elements are skipped). `data-lines="1"` keeps only
the lines holding the words and one more above and below, cut on line boundaries: for a long paragraph whose one sentence is the point.
`data-hide` hides selectors first (a cookie banner). An X post: `data-shot="https://platform.twitter.com/embed/Tweet.html?id=<id>&amp;theme=dark"
data-select="article" data-width="620" data-pad="0" data-source="x.com/<user>/status/<id>"` (no sign-in; `data-source` is what the
bar shows and the credits cite). Captures are cached in `~/.cache/shipshow/shots/` (`SHIPSHOW_SHOTS_CACHE`; trash a folder to take it
again). A page that will not load, or words or an element not on it, stops the build naming the scene. Size: `--shot-width` (1500 px)
and `--shot-max-height` (860 px); inside a layout, give the figure `position: relative; inset: auto; margin: 0`. `review` lists each
with its capture date. The pages are third-party: captured, never committed, shown as commentary.

**Music.** `video.json` `"music": {"file", "volume", "duck"}` puts a bed under the narration:
the build decodes it with ffmpeg, loops it to length, lowers it while the voice speaks (from the
sentence timings, with short ramps), fades it in and out, and writes `assets/music.wav`
(`bin/lib.mjs`, `musicBed`). A missing file warns and builds without music, since music is
often local (`local/music/`): a generated track's licence is its maker's, so it is never
committed. Check a generated track for vocals before using it under narration (Whisper hearing
words is the sign); MiniMax Music 3 sang on its first take for why-shipshow despite
`--instrumental`.

**Sound effects.** A sound marks a thing moving, landing or arriving; it is felt, never heard over the
words. Place one on a cued element, `<div data-cue="Kokoro" data-sfx="whoosh">` (`data-sfx-offset="0.2"` seconds
later or earlier, `data-sfx-gain="-3"` dB, `data-sfx-step="2"` scale steps for a pitched sound), or from
`scenes.html`'s `<script>`: `sfx("thump", cueAt("#id") + 0.3, {gain: -3})`, with `cueAt("#id")` an element's
`data-at` and `sceneStart("scene")` / `sceneEnd("scene")` a scene's edges. The build reads those calls from the
script's TEXT (not run), so the time is a number or those helpers plus or minus one; a call in a loop is an error.
`bin/sfx.mjs` mixes `assets/sfx.wav` (the music bed's pattern; track 32) and writes `assets/sfx.json`, which
`review` lists as *Sound effects*. It **refuses** a run of one sound (3 within 1.25 s of each other: Lino,
2026-10-24) and any sound audible from 0.05 s before to 0.45 s after a sentence's first word (a glitch in the
voice: Lino, 2026-10-26); the message says how far to move it. Level is measured: each sound's loudest 400 ms
(EBU R128 momentary) lands `under` dB (default 14) below the voice's integrated loudness, plus the kit's gain.
Pitched sounds play the bed's key, measured from the music (or `sfx.tonic`, else the kit's, else C). Sounds are
synthesized by `bin/sounds.mjs` (ours, no licence; `node bin/sounds.mjs preview kit/sfx.json out.wav` plays the
kit). The default kit `kit/sfx.json`: `swish`, `whoosh`, `thump`, `up`, `sting`, and for a punchline `boom`,
`scratch`, `sad_trombone`, `ding`; each says what it is. A theme's `sfx.json`, a kit in `local/sfx/<name>.json`
(`"sfx": {"kit": "<name>"}`), or a `{"file": "x.wav"}` sound (found beside the kit, in `local/sfx/`, the theme or
the video) adds to or replaces it by name. `"sfx": false` in `video.json` or `local/config.json` turns sound off.
Leave a pause after `boom` (about 1 s) and `sad_trombone` (about 2.5 s): `gap` in `video.json`.

**Speed.** A multiplier on ShipShow's base pace (Kokoro at 0.85, OmniVoice at its own 1.0: both about 160 words
a minute), not either engine's own: 1.25 by default. OmniVoice takes 1.0 to 1.3, the range it was tested at. The packet
measures pace in syllables a minute (base about 210, `BASE_SPM`), since words a minute runs high on short words.
Pauses shrink with it. The most specific wins: `--speed` on
`make` or `voice`, then `video.json`, then the person's `local/config.json`, then 1.25, or 1.0 for an essay
(`bin/lib.mjs`, `config`, `ESSAY_SPEED`). A take is re-voiced when its speed changes.

