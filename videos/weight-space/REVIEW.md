# Review: weight-space

Plan: thorough (importance high), nine critics including critic-novelty and critic-grounding (the page shows captured
evidence). **Models changed from the plan, on purpose:** the Claude pool was at 75% of its week (tight) when round 1
started, so every critic ran on Codex instead (gpt-6-luna; gpt-6.1-sol for a final taste round, in place of Opus), as the
delegation canon routes bulk work when a pool is tight. Spend said before round 1: about 1.1M tokens a round on the plan's
models; measured on Codex, round 1 took about 4% of its five-hour window and 1% of its week.

## Before round 1 (the builder's own look)

Built, then every contact sheet read. Fixed before any critic saw it: the theatre mood's `glow` ambient painted red and
teal blobs over half of every frame (now `vignette`); text too small across theatre, terminal and close scenes; collisions
(58% label, image captions, detour label, Gemma chart, the 0.016% speck); the closing line typed letter by letter with
gaps (a CSS rule caught the typed letters); the logs screenshot came out as a thin column (now its list). One split scene
had an extra closing tag that ended the page early (the kit threw before making a timeline): the build now names such a
scene (D97). Overlaps: from dozens to 0.

## Round 1 (2026-11-03, 788 s)

| Critic | Verdict | Findings |
|---|---|---|
| accuracy | fail | 1 blocking, 2 major |
| clarity | fail | 1 major |
| pacing | fail | 6 major |
| sync | fail | 2 major |
| visuals | fail | 1 blocking |
| consistency | fail | 1 major |
| engagement | fail | 2 major |
| novelty | **pass** | none |
| grounding | fail | 2 major |

Fixed:
- accuracy-blocking: "no test games" was wrong; now "no practice games" (budget 0 means no forward passes).
- accuracy: "the edges are what the weights spell out" now says what the post says: Astra read the last layer, where each
  unit's weights draw one piece of the edge. "At every word" is now "at every token, a word or a piece of one".
- clarity: "a space with 1,024 directions" had no everyday meaning; now the 1,024 numbers are knobs (the video's own
  picture from 02) and a direction is a pattern across them, some up, some down; the drawing turns the knobs.
- consistency: "a Go program" read as the Go language; now "a program for playing Go".
- engagement: 18 s on the looping answer with no change: a quadrant wheel now steps with the narration (Q1, Q2, and back
  to Q2 on the model's own "180° is Q2"), then spins as the count of "Wait" climbs. 13 s on the detour diagram: its
  inputs, its rule and its switch-off now arrive on their words.
- grounding: the tab showed a joke file name; it now shows the real one, a9f535cc_actor.txt.
- visuals-blocking: the arcade heading clipped at the top during the punch-in; punch lowered to 1.08 and the heading moved
  down.
- sync, 05-zero: the results table arrived 3 s before the scene ended; the scene now holds 3.2 s after its last word.
- sync, 06b: the "8,867 s to read" was the packet's bug, not the video's: it read a cued self-closing SVG `<line/>` as
  holding the rest of the page. Fixed in `bin/review.mjs` (D94 extended); that arrow is now a chip anyway.
- pacing, 01: the opening line packed "seventeen thousand, two hundred and fifty three" into 3 s; now "seventeen thousand
  numbers" (the exact count stays on screen).

Accepted:
- pacing, five scenes at 255 to 296 syllables a minute against ShipShow's 210: this is narrator-uk at speed 1.0, the
  owner's chosen pace for the channel (local/preferences.md), accepted on binance-heist for the same reason.

Declined:
- grounding, screenshots without raw captures or hashes: each screenshot is captured by the build from its live URL, and
  the build stops unless the marked words are on the page (D56); the packet lists page and capture date. Hashing captures
  would be a kit change, not this video's.

## Round 2 (2026-11-03, 797 s): the eight that failed

| Critic | Verdict | Findings |
|---|---|---|
| accuracy | fail | 1 major |
| clarity | fail | 1 major |
| pacing | fail | 10 major |
| sync | **pass** | none |
| visuals | fail | 1 blocking |
| consistency | **pass** | none |
| engagement | **pass** | none |
| grounding | fail | 2 major |

Fixed:
- accuracy: the "131,072" counter was caught mid-count reading 128,413; it now fades in whole.
- visuals-blocking: the punch-in on 48.1 pushed the results chart off the canvas; that punch is gone (the music drop stays).
- clarity: "push them six times the other way" left the edit abstract; a line now says what it does ("the neurons that kept
  nudging the model into a loop now nudge it out of one"), with a before and after on screen.
- grounding: the terminal text is now labelled an illustration on screen and in `sources.md`; the logs are pinned to
  their commit and the post to its read date.
- pacing, stillness: 03b's last explanation, 06b's first 14 s and 07b's 18 s each get a visual beat on their words (the
  last-layer chip, the knobs turning as one pattern, the Gemma and Qwen bars on "8.5" and "93", the same-job chip). 05b and
  06a hold 2.6 and 2.2 s after their last words so their last text can be read.

Accepted: pacing, the syllable rate of narrator-uk at speed 1.0, as in round 1.

## Round 3 (2026-11-03, 807 s): the plan's last round

The five that still failed; clarity and visuals on gpt-6.1-sol (in place of Opus), the rest on gpt-6-luna.

| Critic | Verdict | Findings |
|---|---|---|
| accuracy | fail | 2 major |
| clarity | fail | 3 major |
| pacing | fail | 4 major |
| visuals | fail | 3 blocking, 1 major |
| grounding | fail | 1 major |

Fixed:
- accuracy: "removing them helped everything" overclaimed; now "the loops weren't only hurting math, so removing them
  helped the other tests too". "Never fill your own eyes" overclaimed the source's "avoid"; now "don't fill the empty spots
  that keep your own group alive", which also answers clarity's point that "eyes" is Go jargon the viewer was never taught.
- clarity: 06b used knobs for both the weights (from 02) and the model's running state; the state is now "readings, like
  needles on gauges, moving with every word", labelled "not weights" on screen, and a neuron is "a small calculator inside
  each layer" whose weights are the ones changed. 07c no longer claims why the study's baseline was lower ("well below
  both, and the setups differ, so we can't say exactly why").
- visuals-blocking: the speck's punch-in cut the explanation off the left edge (punch removed, the speck zooms in place);
  the runaway Astra bar covered its own 517.4 (the value now sits on a solid backing above the bar); the logs screenshot was
  a thin column (now the README's heading). visuals-major: the layer numbers raised to 32 px.

Accepted:
- pacing, the syllable rate (as before). The zero-weights wall and the looping answer measured as text "needing" 93 s and
  102 s to read: both are texture, there to be seen as a wall and a loop, not read line by line.

Declined:
- grounding, screenshots without capture files or hashes (as before). Filed as a kit change: #154.

## Confirmation pass (2026-11-03, 820 s)

Past the cap, because the floor (accuracy) had open findings and two blocking visuals fixes needed checking.

| Critic | Verdict | Findings |
|---|---|---|
| accuracy | **pass** | none |
| visuals (gpt-6.1-sol) | fail | 2 blocking, 2 major, 1 minor |

Fixed, and checked by the builder in frames rendered at the flagged times (no further critic round): the looping snippet
cut through a line (it now fades out at the bottom); the amber narrator label failed contrast on white (the theme's
`--accent-3` is now #9b6800, 4.8:1); the 03b image captions were 18 px (now 26 px, moved clear of the rule chip); the
closing post excerpt was too small (captured narrower so its text renders about twice the size); the 07c stamp ran off the
right edge (moved in). Overlaps: 0.

## Status

- **Floor:** accuracy passes; no blocking accuracy or grounding finding is open (grounding's one open major is the declined
  screenshot-provenance point, a kit change, #154).
- **Passing:** novelty (round 1), sync, consistency, engagement (round 2), accuracy (confirmation).
- **Accepted at the cap:** pacing (the owner's narrator pace; texture measured as text). **Declined:** grounding's
  screenshot provenance (#154).
- **Spend:** all critic work on Codex, about 4% of its five-hour window a round; the Claude pool was not used by critics.
- **Not heard by a person yet:** the voice was checked by two listening passes (Whisper per take, Parakeet over the whole
  track, 0 to listen to), the music beds by Whisper for vocals. Nobody has listened to the mix.

## The package (2026-11-03)

One package critic (gpt-6.1-sol) on the title, thumbnail, description, chapters, sources, credits and Studio answers:
**pass**, one minor, fixed: the description said Gemma "doesn't loop"; it now says Gemma 3 "rarely loops" (8.5% of its
answers hit the token limit). The title carries the owner's tag, "(Explained by Opus 5.5)", checked by `npm run package`.

## The owner's watch (2026-11-03, after the first render)

Lino watched the first cut and noted, as he went: the cold-open guess had no options to pick from; the progress bar should
go (the player shows time); the Frogger seal stayed up about twice as long as it needed; the PPO-versus-Astra numbers did not
say what they measured or which way was better; "layer by layer" was said but never shown ("we should be animating and
showing what that looks like ... 3D"); the tools were plain boxes ("let's go crazy: logos, images, icons"); the celebration
GIF looped back to worried faces; the fake-ending fanfare was "really loud ... obnoxious" and the joke did not land (keep it,
make it land).

Changed, for every video (D99, and the rules in `explain-concept`, `critic-engagement` and `pattern-breaks.md`): memes play
once; meme time follows the meme; no progress bar; options for a guessing game; a comparison names its unit and which way is
better; tools drawn as objects; a thing built step by step shown being built, in 3D when it has depth; a fake ending lands by
visibly stopping, at the bed's level.

Changed in this video: A/B/C/D under "Which game?"; Breakout and Go networks as 3D stacks lit layer by layer as the voice names
each; the comparison as "Breakout · average points per game · higher is better" with the values beside their labels and a
spoken "points per game, so higher is better: about twenty times the best of them", then three per-game verdict cards; the
tools as Astra's real notebook cell, a CPU, a slashed training curve, coins that burst into answer sheets and an x-ray; Astra's
own code for the subtraction and its four strength hypotheses; the credits at the bed's level ending on THE END, frozen grey
and struck through as the scratch hits. The first worktree's voice takes and pictures went to the Trash with the merge, so
both were regenerated from the committed prompts.
