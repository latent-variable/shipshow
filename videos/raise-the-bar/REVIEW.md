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
