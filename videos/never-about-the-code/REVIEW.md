# Review: never-about-the-code

Plan: `thorough` (importance high: Lino's YouTube channel, in his voice). Critics: accuracy, clarity, pacing, sync, visuals,
consistency, engagement; Sonnet, Opus for the last round's clarity, visuals and engagement; at most 4 rounds; until no blocking or
objective major finding is left. Every critic is a fresh agent that never saw the build.

## Round 1: 52 findings (1 blocking, 29 major, 22 minor); all seven critics

| Critic | Verdict | Blocking / major / minor |
|---|---|---|
| accuracy | fail | 0 / 4 / 3 |
| clarity | fail | 0 / 6 / 2 |
| pacing | fail | 0 / 6 / 1 |
| sync | fail | 0 / 1 / 8 |
| visuals | fail | 1 / 4 / 3 |
| consistency | fail | 0 / 2 / 3 |
| engagement | fail | 0 / 6 / 2 |

Sound effects were not in this build (the pipeline PR was still open); round 2 judges them.

**Fixed.** The script was rewritten into eleven scenes. The hook states the position as the narrator's view (clarity-1,
accuracy-2); scene 02 says the bridge to today aloud and gains a meme (clarity-2, engagement-1); "those machines" in 1958 is now
"about sixty installations" with its population on screen (accuracy-1); "settled it" became "spread fast" (accuracy-6); Naur's own
warning, a program nobody holds the theory of is dead, has its own scene (accuracy-3, clarity-3); determinism is explained as
"check a compiler once, an agent every time" (clarity-4); scene 07 opens on what the studies show and says what to do with the
out-of-date one (clarity-5); opinion lines are in the first person (accuracy-4); the recap matches the studies (accuracy-5); the
Karpathy line is split and says "favorite name" (clarity-8, accuracy-7); the limit of the thesis is said (clarity-6); "agent" is
used throughout, FORTRAN is one spelling, the close's stamp matches the hook (consistency-1 to -3). The ending is the question, and
the ShipShow credit is a silent end card held four seconds (engagement-6, pacing-5). Every scene is a centred column at larger
sizes, every source line 28 px or more, the overlap removed, meme backdrops solid and the content behind them faded (visuals-1 to
-8). Each meme gets time to read: a new `pauses` setting adds a beat after its scene (pacing-1 to -4, -6; engagement-4, -8). Two
memes were added (engagement-3); cues land on their own words (sync-1 to -9).

**Declined.** engagement-5 asked for more varied entrances; the layouts now vary by scene and the entrances follow what each thing
is. Round 2 judges whether that is enough.

## Round 2: 33 findings (0 blocking, 15 major, 18 minor); all seven critics

| Critic | Verdict | Blocking / major / minor |
|---|---|---|
| accuracy | fail | 0 / 1 / 3 |
| clarity | fail | 0 / 5 / 3 |
| pacing | fail | 0 / 4 / 0 |
| sync | fail | 0 / 3 / 2 |
| visuals | fail | 0 / 1 / 3 |
| consistency | pass | 0 / 0 / 4 |
| engagement | fail | 0 / 2 / 4 |

**Fixed.** The three questions are said and labelled as the narrator's, after Naur (accuracy-1); Hopper "had what she called a
compiler", the meme's doubters are unnamed, Spolsky keeps "to some degree", the assembly line says what S1 supports, and the close
is in the first person (accuracy-2 to -4). "Theory" is glossed in plain words where it is introduced (clarity-1); scene 09 says how
someone holds the theory of code they did not type (clarity-2); the Karpathy aside is one sentence with a Pooh meme on the naming
(clarity-3, engagement-1, -3); the cost and the limit are named (clarity-4); "check" became "test the output", with why once is
enough for a compiler (clarity-5); METR's caveat says which way it cuts (clarity-6); scene 10 names the abstraction and the leak
(clarity-7); FORTRAN is introduced as a compiler (clarity-8). Pauses were cut to 0.8 to 1.3 s and the end card held seven seconds
(pacing-1 to -4). The boom lands with "been" and the sting with "today" (sync-1, -2); a headline opens scene 06 (sync-3); the
astronaut's first line arrives on its own words (sync-4). Rows of cards appear together and fill in, so no frame builds from the
left (visuals-1, -2); scene 09 shows an example failing test and scene 10 an example surprise (engagement-2); the hook promises the
better question (engagement-6). Blue is kept for sources only; the closing stamps match the hook's; source labels sit above every
quote; the compiler's output has one name in the meme (consistency-1 to -4). Found while fixing: the meme fitter split
"ENGINEERING" across two lines, because `overflow-wrap: break-word` let a long word "fit"; the kit now keeps words whole.

**Accepted.** sync-5 (some meme panels land together on one cue): the panels set up a line the narration has just said.
