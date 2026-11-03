# Pattern breaks: the research, our formula, and the moves

Gathered 2026-11-03, when the owner said the videos had become predictable. Three parts: what the research says about
attention and learning, the formula our own videos had fallen into, and a catalogue of moves mapped to the kit. Sources
marked *(lead)* were seen only in a search summary or a third party's write-up; check one before you quote it.

## What the research says

**Predictability loses attention.** Formal features such as cuts and edits draw an automatic orienting response, and a
cut unrelated to the content costs more mental capacity than a related one (Lang et al. 1993, *Communication Research*
20(1); Lang 2000, *Journal of Communication* 50(1), the limited-capacity model) *(lead)*. Curiosity is a felt gap between
what you know and what you want to know (Loewenstein 1994, *Psychological Bulletin* 116(1), 75-98) *(lead)*: an open
question pulls; a question answered in the same breath does not.

**A surprise helps memory only when it is about the thing.** Images seen at the moment of a positive surprise were
remembered better (Jang, Nassar, Dillon and Frank 2019, *Nature Human Behaviour* 3, 719-732,
https://pmc.ncbi.nlm.nih.gov/articles/PMC6625913/). A gambling task, not an explainer: it supports tying the surprise to
the content at the moment it lands, not entertainment in general.

**Decoration costs understanding.** Interesting but irrelevant material lowers recall and problem solving: the
seductive-details effect (Harp and Mayer 1998, *Journal of Educational Psychology* 90, 414-434) *(lead)*; a meta-analysis
found the harm larger when the detail sits near the core content, in the same format, or early (Sundararajan and Adesope
2020, *Educational Psychology Review* 32, 707-734, summarised at https://www.learningscientists.org/blog/2019/6/20-1).
Mayer's coherence principle (cut what is not about the point) is among his strongest (Mayer 2017, *Journal of Computer
Assisted Learning* 33(5), 403-423).

**Pace.** Hollywood's average shot fell from about 10 seconds in 1935 to under 4 after 2000 (Cutting et al. 2011,
*i-Perception* 2(6), https://pmc.ncbi.nlm.nih.gov/articles/PMC3485803/); the authors read it as filmmakers taking control
of attention, untested. No study gives an ideal rate for explainers. Shorter, warmer, drawn explanation held MOOC
viewers longer than slides (Guo, Kim and Rubin 2014, ACM Learning at Scale, summarised at
https://blogs.ubc.ca/videolearninghub/?p=569).

**Creators.** Fix the constant, rotate the variable: Kurzgesagt keeps its narrator and look and gives each video its own
score (https://kurzgesagt.org/youtube/). The leaked MrBeast production memo calls the first minute the most important and
plans a re-engagement around the six-minute mark (copy at
https://www.alexanderjarvis.com/memo-how-to-succeed-in-mrbeast-production/, authenticity unconfirmed). Editing write-ups
warn that zooms and whooshes on every beat tire viewers: scarcity is what keeps a device working
(https://air.io/en/youtube-hacks/advanced-retention-editing-cutting-patterns-that-keep-viewers-past-minute-8, asserted,
not measured).

**What we do not know.** Our videos have no retention curve yet. Once YouTube Studio shows where viewers leave, put the
breaks at the dips and keep the moves the spikes reward; measurement beats this page.

## Our formula, as measured (five channel videos, 2026-11-03)

Every one of binance-heist, kakeya-every-dimension, qwen-phones-home, eth-is-false and never-about-the-code:

- opens on a startling claim or question, then a roadmap ("three ways to explain it", "here are the rules");
- opens every act on a title card that fades in after a wordless lead of 1.5 to 2.6 s (2.3 in three of them);
- builds scenes from cards and chips arriving on their words, with pop, fade and up as about three quarters of 1,000+
  entrances;
- lands a meme after a setup line, about two to four a minute;
- has a late "what does it mean / should you believe it" act and closes by calling back to the opening;
- leans on the same sentence shapes: "Think of a ...", a rhetorical question answered at once ("So, case closed? Not
  quite."), a short dry fragment after a long sentence.

None of these is wrong on its own. Together, every time, they are a template a returning viewer can predict. The packet's
*Devices* section measures the visual half for any video; `critic-novelty` judges it.

## The moves

Each is worth one use where the content calls for it, not one per scene. The kit column says how to make it.

| Move | What it does | In the kit |
|---|---|---|
| Cold open from the middle | Starts on the most surprising moment, then rewinds to how it got there | Order the script; a `ss-frame` "earlier that day" card |
| Answer first | Gives the result up front; the mystery is how | Script order; the hook scene shows the end state |
| Re-hook | A new open question at a dip, around the third and sixth minute | A frame-layer question card on a scene boundary |
| Act with no card | An act begins mid-thought, on a picture or a sound, not a title | Leave the chapter card out; `leads` 0 |
| Punch-in | The view snaps toward the thing named, on its word | `data-punch="1.15"` on the cued element (1.1 to 1.25; higher crops), `data-punch-out` to release |
| Whip | A fast blurred pan into the next scene, for a jump in place or time | `data-transition="whip"` on the section, once a video; give the scene something on screen at its start |
| Music drop | The bed cuts to silence on a word, so the reveal lands in a hush | `data-drop="1.5"` on the cued element (0.3 to 6 s); pair with `pauses` for a full stop |
| Smash cut | From quiet to loud with no lead-in | `data-transition="none"`, a `slam` on the first cue, a sound in the gap |
| Burst then calm | A run of quick changes, then one long hold | Five short cues in one scene, then a scene with one picture |
| Format break | One act drawn in a completely different form: a game, a chat log, a terminal, a courtroom, a nature documentary | A mood with its own theme and `look`, its own pieces |
| Scale jump | Zoom from the detail to the whole (one wallet to the whole chain, one beam to all of space) | A cued SVG or picture with a `zoom` or `grow`, the camera punch |
| The metaphor happens | The analogy stops being words and acts on screen (the vault door actually swings) | A generated object, animated (`explainer-video`, *Scenes*) |
| Callback, changed | A picture or meme from early returns late, altered by what we now know | The same piece re-cued in a late scene, restyled |
| Broken three | Two examples set a pattern, the third breaks it | Script; three cards, the third a different piece |
| Fake ending | "And that's how it ended." It is not | A closing card and a hold, then a hard cut to the twist |
| Fourth wall | The narrator speaks to the viewer about the video itself, once | A line; a typed comment appearing on screen |
| Game | The viewer is asked to guess before the answer | A question card, a count-down, `pauses` before the reveal |
| Running gag | A small joke that returns and pays off at the end | Script; the same piece three times, the last one different |

**Not a gimmick when:** the move carries a piece of the argument (the match cut works because the object IS the point);
it could not be pasted into another video unchanged; it is rare enough to land; and the content pays it off (a fake-out
that leads nowhere costs trust).
