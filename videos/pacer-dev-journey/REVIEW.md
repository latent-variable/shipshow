# Review record: Tokyo spent 181%: a developer's afternoon with the pacer

Plan: `standard` (from `importance: normal`: an internal demo for the Aperiam pitch), eight critics, at most two rounds, Sonnet.
Every judge was Sonnet, the builder's own model family, so they share its blind spots. The cap was reached after round 2.
The raw returns are in `review/round-1/` and `review/round-2/` (not committed); the counts and costs are in
`results/critic-rounds.json`.

## Round 1: 36 findings (1 blocking, 13 major, 22 minor)

| Critic | Verdict | Blocking / major / minor |
|---|---|---|
| accuracy | fail | 0 / 1 / 4 |
| clarity | fail | 0 / 5 / 3 |
| consistency | fail | 0 / 1 / 3 |
| grounding | fail | 0 / 1 / 4 |
| pacing | pass | 0 / 0 / 1 |
| sync | fail | 0 / 2 / 2 |
| visuals | fail | 1 / 3 / 2 |
| engagement | pass | 0 / 0 / 3 |

**Fixed.** Visuals: the ledger scene's cards overlapped the code (blocking), loose result stack, text under 28 px, a top-heavy fix scene.
Accuracy: "a whole batch" became "until the next save"; the 150% now says batching is off; the reviewer's authorship and the
passing contract test got sources and a capture; a cause is tagged `[inferred]`. Consistency: "the dollar campaign" became "the US
campaign"; the buffer is named in the ledger scene; "USD cents" everywhere. Clarity: each agent's change is said and shown, the euro
case is explained, the 181% is tied to the two causes, the flush and buffer names are taught, the fix is called a proposal tried in
a scratch copy, the reviewer is introduced, a long sentence is split. Sync: the opening claim and the `$100` have something on screen,
the `$150` and the "no test" note cue on their words. Grounding: the passing run is captured (`review/tests-after.txt`), the
experiment helper is kept (`results/experiments/alone.mjs`), the full throughput quote is shown.

**Declined, with reason.** engagement-2 (every scene has the same layout): subjective and a design choice, the video is legible and
varied by content. pacing-1 (the closing scene is 14.8% over the target): under the 15% limit, and the closing lines were shortened.
clarity-7 (no reason to "start with the units"): the line now says only "Start with the units"; no sourced reason exists, so none was invented.

## Round 2: 19 findings (1 blocking, 2 major, 16 minor); critics re-run: the six that failed plus pacing

| Critic | Verdict | Blocking / major / minor |
|---|---|---|
| accuracy | fail | 0 / 1 / 3 |
| clarity | pass | 0 / 0 / 3 |
| consistency | pass | 0 / 0 / 1 |
| grounding | pass | 0 / 0 / 2 |
| pacing | pass | 0 / 0 / 0 |
| sync | fail | 0 / 1 / 4 |
| visuals | fail | 1 / 0 / 3 |

The three failures: the new orange line overlapped a row (blocking; added by a round 1 fix), the close said "each note was true for
its own task", which the video's own scenes contradict (major; present in round 1 and not caught then), and `$100` was spoken with
nothing on screen (major; also present in round 1).

**Fixed after the cap (not re-judged by fresh critics).** visuals-1: the rows were tightened and the line moved (frame 10 looked at by
the builder); accuracy-1: the close now says "Each agent tested its own task, and it passed", and `sources.md` C14 says the notes
were not all true; accuracy-2, -3, -4: "ran pacing against real batching", no "finance asks", the pill "all say: no problem";
sync-1 (a "meant to spend $100 each" chip), sync-2 (`$150` on "fifty"), sync-3 (the 93% pops), sync-4 (the note cues on "None");
clarity-2 and -3 (the ledger's `spent`; `9,200 EUR = $100`); grounding-1 (the exact edit behind `tests-after.txt` is in C13);
visuals-4 (the three 100% rows appear together).

**Left open or declined.** sync-5: captions split a number ("one hundred" / "eighty-one percent") because the caption chunker
(`bin/build.mjs`) breaks by length; that is a pipeline rule, not this video's. clarity-1: why 175% becomes 181% with the shared batch
is not in the sources beyond "shared"; the scene says it and does not explain it. visuals-2 and -3 (frames crowd the top or fill to
the caption zone) and consistency-1 and grounding-2 (label wording): subjective or optional.

## Round 3: past the cap, to judge the round-2 fixes (2026-10-26); critics: accuracy, sync, visuals (fresh Sonnet agents)

The round-2 fixes had only been checked by the builder, so the three critics that failed round 2 judged the final render again,
after the branch was brought up to date with main (no change to the video).

| Critic | Verdict | Blocking / major / minor |
|---|---|---|
| accuracy | pass | 0 / 0 / 1 |
| sync | pass | 0 / 0 / 3 |
| visuals | fail | 0 / 3 / 3 |

The round-2 blocking overlap is gone: no critic found it. Accuracy and sync now pass.

**Fixed.** accuracy-1: `sources.md` C10 credited `test/report.test.mjs` to the throughput agent; the currency agent wrote it. The
narration was already true; only the source line changed, so nothing was re-rendered.

**Accepted at the cap, with reason.** This is an internal demo (`importance: normal`, a two-round plan), already one round past its
cap. visuals-1 (the code excerpt's source label is about 20 px, under the 28 px floor): the label comes from `kit/base.css`, so it is
the same in every video that shows code and belongs in a kit change, not this video. visuals-2, -3 and -6 (top-heavy or one-sided
layouts in 01, 04 to 07) and visuals-4 and -5 (tight gaps near the caption and the callout): layout taste on legible frames. sync-1 to
-3 (a still stretch of 8.7 s in 06, an unlabelled USD row in 05, the yen row landing after its sentence): minor, the narration carries
each.

## State

The floor held: no blocking `critic-accuracy` or `critic-grounding` finding was open at the end of any round. Round 3 had fresh
critics judge the round-2 fixes: no blocking finding remains. What follows is the round-2 note, kept for the record: the round-2 fixes were checked only with the
packet (no cue late or short, longest still stretch under 6 s). If this video goes beyond the demo, the open visuals majors are the next work.
