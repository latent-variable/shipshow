# Review: raise-the-bar

Plan: `thorough` (importance high: a public channel video about named companies and a disputed accusation). Eight critics,
Sonnet, at most three rounds, until no blocking or objective major is open; Opus for the last round's taste critics. Every
critic ran on Claude (general-purpose agents, fresh, never a fork): the Codex pool was at 88% of its week. Estimate before
round 1: about 842k tokens for the round, 2.9M at most.

## Round 1 (2026-11-16, 9 min 3 s cut, Sonnet)

| Critic | Verdict | Findings | Tokens |
|---|---|---|---|
| accuracy | fail | 4 major, 6 minor | 115k |
| clarity | fail | 5 major, 2 minor | 100k |
| pacing | fail | 6 major, 2 minor | 101k |
| sync | fail | 3 major, 3 minor | 173k |
| visuals | fail | 3 major, 3 minor | 138k |
| consistency | fail | 3 major, 4 minor | 167k |
| engagement | fail | 3 major, 2 minor | 109k |
| novelty | fail | 3 major, 3 minor | 115k |

No blocking finding. Fixed:

- accuracy-1, 2: "best yet" and "hardest, longest, unseen" are gone. Qwen 4 Max is "a clear step up from Qwen 3.8 Max", and the
  gap is "widest on the hardest tests in version five", named on screen (HLE-Diamond, Terminal-Bench-Science), as AA5 says.
- accuracy-3: Lambert's "insanely expensive" re-read in context (grading RL rollouts through a frontier API) and narrated as
  that: "Grading all that with a rival's paid model". The RL-stage line is Brand's, said as "on his podcast, the case goes".
- accuracy-4, clarity-3: "did it when the test changed" and "the day the test changed" are gone. The narration says AA puts the
  three on v4.3 and the twelve on version five, and the line "the jump lines up with the new index" is tagged inferred.
- accuracy-10: Anthropic's September report read on Anthropic's own page (151 million, May to July, Qwen 3.5 to 3.7). That read
  changed the timing argument (clarity-2): the campaign ended in July, so Qwen 3.8 Max (September) and Qwen 4 Max (November)
  both came after it, and Qwen 4 Max is nine points up on the same index. The v4.3 three-point gap was measured in September and
  October, after the campaigns.
- accuracy-5 to 9: months for v4.2 and v4.3 are September in the changelog (sources.md now says so); "overnight" became "on its
  new scale" and the unchanged models are tagged inferred; "threw out questions" became "harder cuts of its tests";
  "none of the reports I read"; "independent" dropped.
- clarity-1, 4, consistency-2: "open models, the kind anyone can download" is said at first use; 01b names Kimi K3.1 Pro as the
  twelve; the gap is labelled "best open model vs leader" on screen; the close says "the sixteen points you saw".
- clarity-5: 03b now opens on "every extra step is another chance to slip", tying the toy to longer tasks.
- clarity-6, 7: Qwen 3.8 Max named in 05d; 04b says what each scoreboard weighs, on its own cards, and splits the Opus line.
- consistency-1, 6: "the index" for the whole, "tests" for its parts; "scoreboard", "leaderboard" and "ruler" are aliases in Terms.
- consistency-3: the allegation in 05e carries the grey "allegation" tag, not the gold tick.
- consistency-4, 5, 7: one numeral colour for every list; "Qwen 3.8 Max" spelled one way; percent signs on every Vals figure;
  no minus sign on 16; "Apr 30, 2026".
- pacing-2, engagement-3: 02's test names are one small source line, one April quote, and the version timeline has its own phase.
- pacing-3: each top board shows three rows and "three more, all American".
- pacing-4: the credits get a longer pause (3.0 s); the verdict's last point is cued on "evidence" with a 1 s hold.
- pacing-5, 6: beats (blank lines) after "Less than one.", the scores, "Sixteen points behind." and before "Both."
- sync-1: 03c has a header on screen from its first second; the first test card lands on "widest".
- sync-2: the stonks meme lands on the end of the cost sentence, after the dollar figures are read.
- sync-3: the ding is 0.75 s after "Less", on "one".
- sync-4: the Vals scores pop at their value instead of counting up.
- sync-5: the survival curves are drawn on their words (the paths are now static, so the draw entrance measures them).
- sync-6: the verdict's subtitle arrives on "nine"; its unspoken "the day the test changed" line is gone.
- visuals-1: the knocked bar tips and fades above the captions.
- visuals-2: Vals' four domains are four cards across the width.
- visuals-3: the Qwen bars span the width with the score inside each bar.
- visuals-4: display numerals get top padding; the overlap check now reports nothing.
- engagement-1: a meme in act two (Two Guys on a Bus, on VentureBeat's line), so five in all, three of them early or mid.
- engagement-2: 02b opens on "panic?" on its first word; 05b highlights "used to train Qwen 3.5 to 3.7" and "Alibaba among them".
- engagement-5: 05c opens "I'm on that scoreboard, by the way", with a "conflict of interest" stamp on the board.
- novelty-2: fewer dry fragments ("Nobody got dumber", "Same two models." and three "So," openers gone).
- novelty-3: act five opens on silence with no card.
- novelty-5: the close brings the opening scoreboard back and pins the three questions to it.

Accepted:

- pacing-1, 7: the syllable rate is narrator-uk at speed 1.0, the owner's chosen pace for the channel (local/preferences.md),
  accepted on binance-heist and weight-space for the same reason. A trial at speed 0.92 lowered the rate but the target with it,
  so it was reverted. The 4 to 5 s suspense pauses (the scratch, the quiz) are deliberate.
- novelty-1: 03a to 03c keep their shape; the music now drops out under "nearly eight times apart", and 03b's curves draw on
  their words. A lane race was considered and left out: one sampled run would misstate a probability.
- novelty-4, engagement-4, visuals-5, visuals-6: minor, recorded.

## Round 2 (2026-11-16, 9 min 27 s cut, Sonnet)

| Critic | Verdict | Findings | Tokens |
|---|---|---|---|
| accuracy | pass | 3 minor | 107k |
| clarity | pass | 1 major (subjective), 3 minor | 82k |
| consistency | pass | 7 minor | 171k |
| pacing | fail | 2 major, 4 minor | 121k |
| sync | fail | 2 major, 2 minor | 173k |
| visuals | fail | 1 major, 4 minor | 161k |
| engagement | fail | 1 major, 1 major (subjective), 2 minor | 84k |
| novelty | fail | 1 major, 2 major (subjective), 2 minor | 90k |

Fixed:

- accuracy-r2-1 to 3: the description says 3 on the old version and 12 on version 5, not "on one day"; v4.3 is dated
  September; every meme template is credited in the description and sources.md.
- clarity-r2-1: 05d says "No source I found says when Qwen was cut off" before the timing argument, with a card saying so.
- clarity-r2-4: "produces two thirds more output per task".
- pacing-r2-1: the two top boards land on different words ("agree", "American") and the Opus line is its own beat.
- pacing-r2-2: the test-name list is gone from 02; the timeline's dots arrive across "keeps changing", "Counting" and "versions".
- pacing-r2-3, 5: the hook's pause is 3.5 s; a beat before "Claude Opus 5.5 scores fifty nine"; 05d's question is a statement.
- pacing-r2-6: a podcast chip lands mid-sentence in 05e; `hold` is 5 s.
- sync-r2-1: 01b's definition card lands on "open"; sync-r2-2: the stonks meme leaves 2.2 s after it lands, and the v4.3 card
  arrives on "gap" with its 3 on "three"; sync-r2-3: Opus 5.5's 70.1% is on the Vals board; sync-r2-4: the dots are staggered.
- visuals-r2-1: the September box sits between the dots and the month labels, its label below both; visuals-r2-5: meme
  source lines brighter.
- engagement-r2-1, 2: a sixth meme (Philosoraptor, "if two jumpers clear every bar you set / how would you ever know who's
  better?") in act three.
- novelty-r2-1: the rhetorical questions in 03b, 05d and 06 are statements; 06 opens on "Both." The premise question (01b) and
  the game (04) stay.
- novelty-r2-2: the disclosure moved before the accusations (its own scene, 05a), flat, with a "disclosure" stamp, and no longer
  worded like binance-heist's.
- consistency-r2-1 to 6: "a difference you can't miss" for Qwen against Sol; "the twelve point gap"; one name for the index on
  screen; "accusations" throughout, "Chinese labs" on the FBI card; one wording of the question ("Did Chinese models fall
  behind, or did the ruler move?"); "rulebook" and "accusations" in Terms; the inferred chip is dashed and tagged "inference".

Two builder catches before round 3: the new meme's cue "They" matched "they're" a sentence early, and the 3's cue "three"
matched "forty three", which blanked the Qwen bars; both now use `#2`.

Accepted: novelty-r2-3 (03a to 03c keep their card cadence; the music drop and the curves are its breaks, as in round 1),
engagement-r2-3 (the Peter Parker's Glasses repeat is from a local video), visuals-r2-2 (5 to 7 px of the display font's ink
past its box, no visible clipping), visuals-r2-3, 4, pacing-r2-4, consistency-r2-7, novelty-r2-4, 5 (minor).

## Round 3, the cap (2026-11-16, 9 min 33 s cut; Sonnet for accuracy, pacing, sync; Opus for visuals, engagement, novelty)

| Critic | Verdict | Findings | Tokens |
|---|---|---|---|
| accuracy | pass | 2 major (subjective), 4 minor | 123k |
| sync | pass | 2 minor | 150k |
| pacing | fail | 1 major, 5 minor | 123k |
| visuals | fail | 1 blocking, 3 major, 2 minor | 189k |
| engagement | fail | 4 major, 2 major (subjective), 2 minor | 190k |
| novelty | fail | 1 major, 2 major (subjective), 1 minor | 151k |

The cap was reached, so no fourth round ran. Every finding the builder could settle by a measurement was fixed in one pass,
and the packet's own numbers checked it (no overlaps; every reading flag within 0.3 s of its scene end):

- visuals-r3-1 (blocking): the X post capture's bottom cut into the post's attached card. It is now captured with images hidden
  and 10 px of padding; the frame ends below "to illustrate this failure." Re-checked at full size.
- visuals-r3-2 to 5: the end title is 92 px in two lines with a 1560 px limit; full-screen panels now run under the captions;
  the ruled-out quiz answers sit at 70% instead of 35%; the disclosure stamp moved down.
- accuracy-r3-1: "At launch, ... was twelve points behind" (on today's board, with Fable 5.2 at 65, it is 19; sources.md says
  so). accuracy-r3-2: the ceiling effect as the cause of 3 to 12 is tagged inferred in sources.md. accuracy-r3-3, 4: "Every
  measured number", "the main accuser". accuracy-r3-5, 6: nine evaluations sourced; Anthropic's September report in the
  description's sources.
- pacing-r3-1: the two top boards are cut to the leader, "top six: all American" and Qwen; 04b ends on a 3.2 s act-change pause.
  pacing-r3-3: 02 holds its new meme 3.4 s.
- sync-r3-1: the verdict's first card lands on "clear".
- engagement-r3-1: the stonks meme holds 4.6 s; 05d is two scenes now (05d-test, 05d2-gap) with a 3.2 s pause between.
- engagement-r3-2, novelty-r3-3: the Philosoraptor meme is gone; it asked its question after the bar had answered it.
- engagement-r3-3: a meme on "four of them started in September" (I Feel Like I'm Taking Crazy Pills), so six in all.
- engagement-r3-4: the v4.3 card's line highlights on "campaigns".
- engagement-r3-5: act five opens on the X post again, "The post blamed one thing: being cut off from copying."
- engagement-r3-6: "Shut Up and Take My Money" read the wrong way round; it is now "the bill is too damn high".
- engagement-r3-8: the end card keeps the three questions.
- novelty-r3-1: three of the "not X, Y" lines are plain now (02b, 04b, 06); 03b's and 05d's stay.
- novelty-r3-2: the fake credits and record scratch were weight-space's; the hook now ends "Case closed." and the scoreboard
  rewinds through its own versions (v5.0.1, v5.0, v4.3, its scores blanked because v4.3's are not in the sources) to Oct 27,
  and 01b opens "Now check the date." New to the channel, and it is the video's idea: the ruler moved.

Accepted at the cap: engagement-r3-3's bar of about nine memes (six, each on its own beat); engagement-r3-7 (the verdict list is
text); novelty-r3-4 (the close's numbered lists); pacing's narrator rate (as before) and its minor pause notes; visuals-r3-6.

## Verification after the cap (2026-11-16, Sonnet, changed scenes only)

The floor critic and the critic with the blocking finding re-ran on what round 3's fixes changed.

| Critic | Verdict | Findings | Tokens |
|---|---|---|---|
| accuracy | pass | 1 major, 2 minor | 101k |
| visuals | pass | 3 minor | 163k |

- accuracy-verify-1: the Vals leader's 71.3% is now in sources.md's VI row (Claude Fable 5.2, 71.31%, read on vals.ai).
- accuracy-verify-2: "Every measured number has its source, on screen or in the description", in 05a and the description.
- accuracy-verify-3: the hook paraphrases the post as "Qwen has been cut off from copying American models".
- visuals-verify-1: the meme panels' bottom seam closed. The blocking capture finding is confirmed closed in all four frames.
- visuals-verify-2, 3: minor, recorded.

Voice: two takes heard back at 94 and 95%, where Whisper writes "Qwen" as "Quinn" (the `say` entry is "Kwen", as on
qwen-phones-home); Parakeet's second listen flagged nothing. Nobody has heard the takes: listen to 04b and 05d.

Spend: about 3.0M critic tokens across 22 critic runs (round 1, 1.02M; round 2, 0.99M; round 3, 0.93M; verification, 0.26M),
against the plan's 2.9M ceiling for three full rounds. The verification ran past the cap on purpose: accuracy is the floor.

## The upload folder (2026-11-16, Sonnet, one round)

A fresh critic judged `youtube/to-upload/raise-the-bar/` and failed it on the thumbnail: the subject and scores sat in an
11 px chip at 320 by 180, the picture read as a calm stock photo, the scores had no index named, and "They raised the bar"
stated an inferred cause as fact. Now it reads "Qwen 4 Max / 16 behind? / or did the bar move" over the old and new bars, with
the index named. The title leads with Qwen 4 Max and "the Benchmark"; the description's second paragraph gives the answer
instead of a list; the AP source has its link; sources.md no longer lists an AA5 capture the video never made.

## The music (2026-11-16, Lino, after watching)

Lino found the hook's bed (sports-broadcast brass and drums) too busy to sit under an explanation. He also heard every bed
jump up whenever the narrator paused: each bed was ducked to a third under speech, so it rose by about 10 dB in every gap.
Three changes. The scoreboard act now uses `intro-calm.wav`, which is warm pads and a low pulse with no drums or brass (ACE-Step seed 42,
Whisper heard no words). Every bed is levelled before use: `level/` copies, run through a slow normaliser and loudnorm to
-14 LUFS with LRA 3 (the command is in `local/music/bar/make.sh`). Every act also plays at one volume (0.06) with `duck: 1`, so
there is no ducking. Measured on the new `assets/music.wav`, the act medians sit between -40 and -45 dB, and over 3 s windows a
bed holds within about 2 dB. The two `data-drop`s remain. Voice, script and pictures are unchanged, so no critic round was run.
Only the bed changed, and that is a call Lino makes by ear.

## The answer, rewritten (2026-11-16, Lino, after watching)

Lino: the old close, "Both.", said Chinese models fell behind, when they were never level. They started behind and have
trailed by months, and the old index made them look like they were catching up. He also asked that the video talk to the
viewer the title draws, people already in AI, and not define distillation from the ground up.

The close is now three scenes. 06-verdict says the ruler moved and that, on one ruler, there is no sign of a fall: the best
American and best Chinese model out at each moment were 23, 13 and 19 points apart (early September, October 23, now).
06a-months gives Epoch AI's lag in months and the ruler's 3 to 12. 06a2-holds collects what still stands. The "Why Not Both?"
meme is gone. Distillation, open models, RL and the index lost their ground-up definitions (01b, 02, 05, 05e), and
`explain-concept` and `critic-clarity` now take the viewer the title draws (DESIGN D110).

### Round (changed scenes only; Sonnet: accuracy, clarity, visuals with sync; about 0.32M tokens)

- **accuracy, FAIL, fixed.** The first draft said "nobody fell behind" from two Alibaba pairs, against a model released a day
  later in September and against the leader in November, which was not like for like. The draft also left out that Kimi K3.1
  Pro, the best Chinese model, went from 12 behind at launch to 19 now. The comparison is now best against best at each moment
  (23, 13, 19), and the claim is "no sign of a fall" with "the gap swings with whoever released last". "All along" became
  "since 2023", "four and a half in September" became "four point four, at its release" with the report dated, "didn't jump"
  became "that jump came with the ruler" (inferred, as in 05d2), and "rescored" is said aloud.
- **clarity, pass with majors, fixed.** Three gaps (12, 16, 22) and two leaders in a minute: the close now has one set of
  three gaps on one board, and 06a2 says "the sixteen points to Opus 5.5 from the opening". The step from one model to
  "nobody" is gone with the new comparison. Epoch's months are now explained in a clause: "how many months back the American
  frontier was as good". 02 now ends on "So the ruler itself keeps moving." 06a2 is shorter.
  Declined: "the post" has no referent (minor). The post is on screen, captured, on the word "post". Declined: why a rival's
  model would grade RL (minor). This audience knows what a per-call API costs.
- **visuals, pass, fixed.** 06a2's list sat in the top of the frame, so it is now larger and centred. The stamp brushed the
  source line, and the layout is new. 05-copying's cards had too little time, so it gets a 1.2 s pause. The tweet's marker now
  sweeps in on "distillation". Declined: chip 2 in 06b is late (minor). It is already cued on "second", and the lag is Whisper's
  word time.
- **accuracy re-check, FAIL, fixed.** "Best Chinese model" in September is only the best that today's index scores, since Kimi
  K3 (July) has no v5.0.1 score. The line now says "the top-scoring American and Chinese models it has". "Rescored the older
  models" became "many older models". "Widest on two of version five's tests" was AA5's finding for Kimi, not for Qwen's
  sixteen, and is now "Chinese models trail most on two of version five's tests". "No sign of a fall" became "I see no sign of
  a fall", said as a reading. Epoch's average is dated: "from 2023 to the start of this year".
