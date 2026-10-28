# Review: eth-is-false

Plan: `thorough` (importance high: public, on Lino's channel, on a result experts are still checking). Critics: accuracy, clarity,
pacing, sync, visuals, consistency, engagement, and grounding (scene 14 shows a Lean excerpt); Sonnet, Opus for the last round's
clarity, visuals and engagement; at most 4 rounds; until no blocking or objective major finding is left. Every critic is a fresh
agent that never saw the build.

## Round 0: the script alone, before any voice

Two fresh critics read the script and sources before GPU time was spent on it.

| Critic | Model | Verdict | Blocking / major / minor |
|---|---|---|---|
| accuracy | Opus | fail | 1 / 7 / 3 |
| clarity + engagement | Sonnet | fail | 0 / 8 / 6 |

What changed:
- **The core mechanism was wrong (blocking).** The draft said the trick is to take a few values and fit a curve. The paper says the
  Q values alone may not determine H; it computes Taylor coefficients (values and derivatives) at each point (section 2.5). Scene 11
  now says so, and the derivatives are one of the three costs.
- **ETH's middle ground.** "Between polynomial and two to the n" made 1.307^n look ruled out; the middle is now "between polynomial and
  exponential", with 1.001^n named as exponential.
- **Overclaims.** "The floor is gone" and "it just fell" carry "if it holds"; "doesn't carry over to every NP problem" became "doesn't
  automatically speed up"; Lean is said to check a bound a bit weaker than Theorem 1.1; the dial's rewrite holds only at chosen points;
  the hook says "two of the three" proposers (Zane is the third); perfect matchings cut (2^o(v+e) is not subexponential in v on dense graphs).
- **For the ear.** "Two to the n over the square root of log n" was ambiguous; it is now "still two to the something, but the something
  isn't n anymore". The dial got a plain picture (a note on each group); P versus NP got a refresher with a joke; SAT and 3-SAT are told apart.

## Round 1: 2 blocking, 34 major; all eight critics (grounding passes)

| Critic | Verdict | Blocking / major / minor |
|---|---|---|
| accuracy | fail | 0 / 5 / 6 |
| clarity | fail | 0 / 6 / 3 |
| pacing | fail | 0 / 8 / 3 |
| sync | fail | 0 / 4 / 5 |
| visuals | fail | 2 / 7 / 3 |
| consistency | fail | 0 / 3 / 7 |
| engagement | fail | 0 / 7 / 2 |
| grounding | pass | 0 / 0 / 1 |

What changed (script revised and re-voiced; scenes rebuilt):
- **Scenes over 40 s split**, each where its thought turns: 05 into the middle ground and 05b ETH; 08 into the claim and 08b counting;
  11 into reading off zero and 11b the three costs; 13 into what it means and 13b the papers and the twist; 14 into what Lean checks and
  14b who is checking. New files take a `b` so unchanged scenes keep their takes.
- **Accuracy.** The hook's chip says "being checked by two of its three proposers"; the edit distance card matches the voice (not
  false, one reason fewer); Williams' result is "circuits of linear size"; the three billion digits are "run the numbers", with "our
  arithmetic" on screen; "almost everyone believed it" is now "most people"; Schöning's bar reads 1.333 (4/3); the paper slips say
  "typical phrasing, not quotes"; the cousins are struck "if it holds"; "where most arguments stopped" replaces "ended the argument".
- **Clarity and engagement.** The Strong ETH is defined in one line; "variables" and "clauses" are named on screen; scene 08 keeps three
  ideas; the dial says why it helps (few enough notes to try them all, every group counted alone); scene 11 says why derivatives (values
  alone aren't enough) and shows slopes on the curve; the galaxy-brain meme lands on a new "Simple, right?" with a 2.5 s beat after it;
  the close tells the viewer what to do (keep your SAT solver, doubt anyone selling P = NP); "your diff tool didn't get faster" has its own beat.
- **Consistency.** "Setting" is a switch assignment only; dial values are "points"; the base is c everywhere; "floor" replaces the hook's
  speed limit; "bigger bet" so "Strong" names only the Strong ETH; one meaning per colour (pink ETH, red refuted, green standing, yellow caution).
- **Visuals and sync.** Scenes centred in the window above the captions and scaled up; supporting text at 28 px or more; the FALSE stamp
  sits beside the title; the "no floor" stamp left the chart; Paturi's card fits his name; crossing rules run behind the group boxes; the
  dial is larger; memes at 860 px; the Lean excerpt shows four statement lines at 28 px with each part highlighted as it is named
  (count, time, memory; grounding's minor: the memory clause, lines 216 to 217, is now shown); cues moved onto the words that name them.

## Round 2: 0 blocking, 17 major; all eight critics (clarity, sync and grounding pass)

| Critic | Verdict | Blocking / major / minor |
|---|---|---|
| accuracy | fail | 0 / 1 / 6 |
| clarity | pass | 0 / 2 / 6 |
| pacing | fail | 0 / 5 / 4 |
| sync | pass | 0 / 0 / 6 |
| visuals | fail | 0 / 2 / 5 |
| consistency | fail | 0 / 2 / 5 |
| engagement | fail | 0 / 5 / 2 |
| grounding | pass | 0 / 0 / 2 |

Between rounds the branch was rebased onto main (#78: screenshots, the signal theme, Drama 3's hiss fixes). Drama's take rules moved
from 1 to 3, so every line was voiced again under the new stall check; main's credit rule (D57) moves photo credits off the photos
and into the video's description, which settles visuals' credit finding. The chalk theme's decision is now D59.

What changed:
- **Accuracy.** "Not false" is gone: those papers "lost one of their reasons", some "still backed by weaker assumptions that may hold"
  (the paper says no more). The checkers are a group "set up to check it" (OpenAI's words are future tense); Williams' result carries no
  year (the cited theorem is in the 2013 journal version); the record bars say "randomized"; scene 14 says "OpenAI says it formalized" and
  "the statement that proof has to match"; scene 12 says "the overview example", "for anything smaller", "if it holds"; "seems hard",
  "several small brute forces", "chosen points".
- **Clarity and engagement.** The dial "slides from the problem you want to problems you can count"; the notes are short, so few; the
  curve "has far more bends than we have points", so slopes make up the difference; the three costs are three knobs, "turn one knob, and
  another one bites"; 08 opens with "It gives an algorithm"; 14b says "a close relative of the Strong ETH".
- **Pacing.** The 6.4 s silence in 02 was a Drama stall (the re-voice under the new rules retakes it); the pause after the meme is 1.3 s;
  01, 10 and 12 lose words.
- **Consistency.** The multiplier in 08's chart is "constant × n" (c stays the base); one rule is "a little piece of algebra", the whole
  list is "the problem", and "polynomial" is kept for the dial's curve; Terms updated.
- **Visuals and sync.** 07's stamp moved off the caption into the Strong ETH column; memes at 780 px; source lines at 30 px; name cards
  padded; Cook's caption breaks before "NP-complete"; the Lean scene sits lower; cues on "hard", "even", "never", "weaker".

## Round 3: 0 blocking, 23 major; seven critics (grounding's round 2 pass stands: the excerpt did not change). Opus for clarity, visuals and engagement

| Critic | Model | Verdict | Blocking / major / minor |
|---|---|---|---|
| accuracy | Sonnet | fail | 0 / 1 / 3 |
| clarity | Opus | fail | 0 / 3 / 6 |
| pacing | Sonnet | fail | 0 / 7 / 3 |
| sync | Sonnet | fail | 0 / 1 / 6 |
| visuals | Opus | fail | 0 / 6 / 7 |
| consistency | Sonnet | pass | 0 / 0 / 5 |
| engagement | Opus | fail | 0 / 4 / 4 |

What changed:
- **Accuracy.** The three billion digits are now "plug in the overview's own parameter choice, and the construction only works once the
  number of switches has about three billion digits" (the full proof's cutoff is smaller or not computed, so the fallback line is gone,
  replaced by "That's not a typo"); "if it holds" on the hardness twist; "2026 preprint" on the Jiang and Cai bar.
- **Clarity.** The bridge from ETH to the new bound is said: any base above one, c to the n, is two to some constant times n, and this
  exponent grows slower than any constant times n. The chart's curve was drawn rising then falling (it said the exponent shrinks as n
  grows); it now rises and bends under the line, with the crossing marked. Reductions are said in scene 04's terms (cracking SAT cracks NP
  by translating into SAT; the translation makes problems bigger). The three knobs line up with the trade. Scene 14's long sentence is three.
  The paper's names are on screen ("clause polynomial", "Taylor coefficients").
- **Engagement.** A This Is Fine meme lands "hundreds of papers, one hypothesis" in 07; the hook asks the viewer's two questions (P = NP? a
  faster SAT solver?) and the video answers them in 12 and 13; the stakes line in 04 lands on its own word; three stamps became chips.
- **Pacing and sync.** The 2.35 s silence in 13b went with the retaken line; 11b's knob chips arrive one by one, with arrows on "fewer",
  "Smaller" and "bigger"; 12 opens on "before you rewrite your SAT solver…" with the root on "slowly"; 13b's card lands on "circuits" and the
  stamp mid-line; the close's quote lands on "unless"; 08's tail gets 0.5 s for its stamp; 11b's pause is 0.9 s.
- **Visuals.** The floor band in 06 stays faint (`fill` with alpha, so the fade does not make it opaque); the dial's numbers sit off the rim;
  08's labels arrive with their marks; the exponent of 2 is written out at full size; the Lean file label is 28 px; 14b aligns on the photo
  tops; the close's heading sits over its list; 02's chips sit on their own centred row; the hook's crack no longer crosses the label.

## Round 4 (the cap): 1 blocking, 13 major; seven critics. Opus for clarity, visuals and engagement

| Critic | Model | Verdict | Blocking / major / minor |
|---|---|---|---|
| accuracy | Sonnet | fail | 0 / 2 / 5 |
| clarity | Opus | fail | 0 / 1 / 6 |
| pacing | Sonnet | fail | 0 / 5 / 2 |
| sync | Sonnet | pass | 0 / 0 / 6 |
| visuals | Opus | fail | 1 / 1 / 6 |
| consistency | Sonnet | pass | 0 / 0 / 2 |
| engagement | Opus | fail | 0 / 3 / 2 |

Fixed after the cap:
- **Accuracy (the floor, re-checked past the cap below).** "It's slower than any polynomial" described the paper's upper bound as the
  algorithm's speed; now "its guarantee is still bigger than any polynomial, so it gives no polynomial algorithm". "Divides the exponent by
  3.7" ignored Theorem 1.1's log log factor; now "it's only about three point seven, and a log log factor and the hidden constants eat into
  even that". Minors: "the best-known reason" for edit distance; "≈ 3.3 billion" on the counter; "its conditions only start to hold";
  "for each rule size, one machine counts the satisfying settings exactly ... only polynomial memory".
- **Visuals (blocking).** The Jiang and Cai label ran off the chart and lost "2026": "preprint" moved to the name, the label is "2026 ·
  randomized". The Lean file label rendered at 17 px because the kit's rule outranked the scene's: the scene's selector now matches the
  kit's, at 28 px. Also: the ticks sit inside their rule cards, the edit-distance table is a 4 × 4 grid, the scene under the meme dims to 6%.
- **Clarity.** Scene 14 now names the remaining doubt before its verdict: "So far, that's OpenAI's word. The people lined up to check it
  haven't reported yet."
- **Engagement.** The groups light up on "alone" and the dial swings back to zero on "The catch?"; scene 13's card arrives in three pieces on
  their words and P ≠ NP on "polynomial"; the dashed c-to-the-n line lands on "base".

**Accepted at the cap, with reasons:**
- Pace: 09, 12 and 14b run 15 to 20% over the 252 syllables-a-minute target. The owner asked for Fireship pace on his last channel video
  and accepted 19 to 23% there; every take is heard back; no scene is over 40 s and no still over 9.5 s. His listen decides it.
- The 2.16 s beat after "Simple, right?" holds the galaxy-brain meme (four lines) and its ding; shorter, the meme is not readable.
- The 08b citation line lands within 1 s of the scene end; the voice says the same ("if it holds").
- The hook names two of the three group leads (Williams is named in 14b); "most researchers" for a poll of 124 (the source is on screen).
- Engagement's minors: three small knobs instead of a picture of knobs in 11b, and dry asides rather than a third meme in 09 to 11.
- Visuals' minors: 11b's chips sit high until the formula arrives; 12's columns shift when the second arrives; 09's long arc sits close to
  the count line.

## Past the cap: the floor re-checked (accuracy, Opus): pass, 0 blocking, 0 major, 8 minor

Taken: "ETH says there's a line nobody will ever cross" (it never said nobody gets near one); "where most arguments stopped" in the close;
the heading "does this give P = NP?" (a bare "P = NP? NO" read as settling P versus NP); "→ ≈ 2^(n/√log n)" beside the exact theorem; the
schematic curve now climbs nearly linearly and crosses under the line (it had flattened like a log); "or find a gap"; the cards' affiliations
and the 2001 journal dates recorded in sources.md. Every take of the changed lines heard back; the only flags are Whisper's spelling of names
and "stopped" heard as "stop".

**For the owner's listen:** each direction (the deadpans in 01, 03, 09, 12 and 14b; "That's not a typo"), the name "Impagliazzo"
(respelled "Impalyatso" for Drama 3), the 2.16 s beat after "Simple, right?", and the pace of 09, 12 and 14b.

# The second cut (2026-10-27)

The owner watched half of the first cut and asked for more: a mood per act, act openers that hook, 3-SAT's "no answer" shown and why
it matters, a growth chart, more fun, and the letter n never spelled "E N". Then he moved the video off his cloned voice: he is not the
one explaining the paper, so an invented Drama 3 narrator (picked by him from twelve auditions) reads it. Plan as before: `thorough`,
at most 4 rounds; grounding's round 2 pass stands while the Lean excerpt is unchanged.

## Round 5: 1 blocking, 18 major; seven critics, Sonnet

| Critic | Verdict | Blocking | Major | Minor |
|---|---|---|---|---|
| accuracy | pass | 0 | 0 | 3 |
| clarity | fail | 0 | 3 | 4 |
| pacing | fail | 0 | 4 | 2 |
| sync | fail | 0 | 3 | 2 |
| visuals | fail | 1 | 4 | 2 |
| consistency | fail | 0 | 1 | 2 |
| engagement | fail | 0 | 2 | 2 |

**Fixed:**
- **Visuals (blocking).** Scene 08's theorem chart showed through the house of cards: the chart's phase now waits for its own cue.
- **Pace.** The new narrator ran 20 to 40% over the target at speed 1.2, the speed of the audition the owner picked: now 1.1, and lines
  that restated the one before are cut ("No progress yet", "Stick around", "polynomial memory", the 11b knob list). Pauses after 07 and
  11b are under 2 s.
- **Clarity.** The step from "a smaller exponent" to "ETH is false" is said plainly and drawn: "ETH says the exponent can never drop below
  some fixed fraction of n. This one ends up below every fraction you pick." A note is "a few weighted sums" of a group's switches. 11b
  is two pulls, both making the notes bigger. "Easy points" in both 10 and 11.
- **Engagement.** 04 opens on a million dollar puzzle and closes on "the million dollars is still sitting there" (Clay, source M);
  06 shows what twenty five years of records shaved (−0.026); the NP card lands on its definition and the n-squared line on its words.
- **Sync and consistency.** "Move 1" lands on "Move one" (it landed on "moves" 15 s early); the growth chart pins 30 and 40 on their
  words; the 12 card on "million"; the relatives one at a time; the catch card on "The catch?".
- **Visuals.** The growth chart's labels sit left of every curve, at chart sizes of 28 px and up; the title's FALSE stamp is larger and
  red; scene 14 shows the three pulled papers struck through and ends on two stamps, "strong signal" and "not peer reviewed yet".
- **Accuracy.** "In a preprint this year" for 1.307; "in the worked example the paper itself walks through"; DNF as Fedora's package
  manager is now sourced (D).
- **Pipeline.** Both listeners flagged "ETH." as unheard because they wrote it "E.T.H.": the missing-sentence check now joins spelled
  letters (DESIGN D60).

## Round 6: 1 blocking, 10 major; seven critics, Sonnet (accuracy and consistency pass)

| Critic | Verdict | Blocking | Major | Minor |
|---|---|---|---|---|
| accuracy | pass | 0 | 0 | 3 |
| clarity | fail | 0 | 2 | 2 |
| pacing | fail | 0 | 6 | 3 |
| sync | fail | 0 | 1 | 1 |
| visuals | fail | 1 | 0 | 3 |
| consistency | pass | 0 | 0 | 3 |
| engagement | fail | 0 | 1 | 2 |

**Fixed:**
- **Visuals (blocking).** The $1,000,000 stamp landed on the 88% poll: the scene now dims under it. The prize also opens 04, on "a
  million dollar puzzle" (sync: seven seconds had nothing on screen).
- **Clarity.** Both bridges are said aloud: "A base above one is just two to some fraction of n" before the floor in 08; "Move two makes
  them split anyway", and "switches are only on or off, so a note has few possible values" in 10. "First, the setup" before the algebra;
  "the count" traces the curve in 11.
- **Engagement.** "The plan has one flaw" (with a scratch) after the catch in 10, "clean getaway" on the exact count in 11; 07 opens on
  "Hundreds of papers built on that bet".
- **Pacing.** Less to read: the sum's footnote, the 12 card's footnote, the 13b card, one line for the pulled papers, and the Lean excerpt
  dims once its two lines are read. Pauses after 07 (0.5) and 11b (0.6) keep every gap under 2 s.
- **Accuracy and consistency.** "In a pair of 2001 papers"; "over three billion digits"; DNF5 and libsolv sourced; the checkers are "the
  checking team" everywhere (a "group" is a block of switches); "ETH's floor, as an exponent".

**Declined, with reasons:**
- Pacing's overall syllable rate (not raised this round, recorded here): the narrator reads briskly at any setting; slowed from the
  audition's 1.2 to 1.1, the packet's target falls with it. The owner picked this voice by ear; his listen decides.
- Pacing's "read by" chains (14, 12, 09) assume every card is read in order after the last; the packet also counts SVG geometry as text
  (P5-5, P6-9). The cards were shortened; the chains themselves are a measurement limit.
- Sync's late ding after the galaxy-brain meme: it lands on "right?", the punchline, on purpose.

## Round 7: 0 blocking, 7 major; seven critics, Opus for clarity, visuals and engagement (accuracy, pacing and consistency pass)

| Critic | Model | Verdict | Blocking | Major | Minor |
|---|---|---|---|---|---|
| accuracy | Sonnet | pass | 0 | 0 | 3 |
| clarity | Opus | fail | 0 | 1 | 4 |
| pacing | Sonnet | pass | 0 | 0 | 4 |
| sync | Sonnet | fail | 0 | 2 | 1 |
| visuals | Opus | fail | 0 | 1 | 4 |
| consistency | Sonnet | pass | 0 | 0 | 1 |
| engagement | Opus | fail | 0 | 2 | 2 |

**Fixed:**
- **Clarity.** The swap from a base to an exponent is grounded in the record the viewer just saw: "Even the record, one point three oh
  seven to the n, is two to about point three nine times n" (1.307ⁿ = 2^(0.39 n) on screen). The reason is said: n over root log n is a
  fraction that keeps shrinking, "about a quarter" at a million switches (the same 3.7 as scene 12), and the chart draws a second, smaller
  floor that the curve also crosses. Also: the setup's payoff named in 11 ("Because every rule is now algebra"), each 11b knob shown with
  what it costs, "Here it is in thirty seconds", and "small circuits, ones that grow only in step with their input".
- **Sync.** "Try every note" lands on "try" (it landed on the first "few"); the product lands on "Multiply" and the sum on "Add".
- **Visuals.** The flaw stamp sits under the dial, inside the scene window (it was clipped at its bottom edge); the 02b crosses let their
  settings show through; struck names keep their crossbars; clause cards on one line.
- **Engagement.** "27 years · −0.026" is slammed with a thump in 06, "load-bearing" stamps the base of the tower in 07, 02 opens on "Try
  this puzzle" with the switches on screen, 09 opens on the paradox, and P ≠ NP pulses on "untouched".
- **Accuracy and consistency.** "Most famous" and "thirty seconds" tagged as opinion; "the team checking it" in 15.

**Accepted:** the recap meme's 2.3 s (all four steps were on screen earlier; it is a stinger); the late curve in 03 (the pins arrive on
their words); top-heavy frames in 14b and 15 until their stamps land.

## Round 8 (the cap): the floor re-checked on the changed lines only; the builder's look

The owner asked for restraint: the first cut had four full rounds, and a revision should not get a fresh thorough plan. So the last
round ran one critic: accuracy (Sonnet) on the lines changed since round 7, not the whole video (pass; one minor taken: the
"load-bearing" stamp is on the house-of-cards opinion row). The builder looked at every changed frame and fixed what it found: 08's
schematic curve, reshaped in round 7, bent back down as if the exponent shrank; it now rises and flattens, crossing both floors. The
1.307 note, the "load-bearing" stamp and the flaw stamp were moved clear of other text.

**Spend on the second cut:** 22 critic agents, about 2.8M tokens (rounds 5 to 7 at about 0.8M, 0.9M and 1.1M; round 8 at 70k). A
revision this size should cost one round on the changed scenes; the critic-loop change that makes that the rule is its own PR.

**Open at the cap, accepted:** the narrator's overall rate (his pick by ear); the recap meme's 2.3 s; the 03 curve drawing before
"Forty"; top-heavy frames in 14b and 15 until their stamps land; Parakeet writing "E.T. H." in 14b (the voice says the letters, as
written).

**For the owner's listen:** the new narrator at speed 1.1, the names (Impagliazzo, Paturi), the 2.0 s beat after "Simple, right?", and
whether the gags in 04, 06, 07, 10 and 11 land.

# The third cut (2026-10-27)

The owner on the second cut: too inconsistent, and "moving so fast through the content that it's hard to follow". A new
narrator he picked (`narrator-uk`, invented, young British, `local/voices/VOICES.md`) at speed 1.0, one reference clip for
every take; the script regrouped into paragraphs, each one take (`DRAMA_LINE_MAX`, DESIGN D66), so the delivery carries
through; seven acts, each opened by a wordless title card during a 2.6 s lead while its look and music arrive; a beat between
thoughts. 62 takes, speech levels within 0.6 dB (standard deviation) of each other; 12.8 minutes.

## Round 9: one light round, as a revision gets (critic-loop, *Spend is part of the plan*)

Planned and said before it ran: three Sonnet critics, about 300k tokens. Measured: about 235k.

| Critic | Scope | Verdict | Major | Minor |
|---|---|---|---|---|
| accuracy | the changed lines only | pass | 0 | 0 |
| clarity | the whole video | fail | 3 | 3 |
| pacing | the whole video, the new "breathe" bar | fail | 1 | 3 |

**Fixed (no second round: nothing blocking):** the step from the record to "ETH is false" is said with one plain word, a
"slice" of n, and "about a quarter of n"; the circuit twist says what a small circuit is and why it matters; what Lean checks is
said in short sentences without the letter c; "quadratic" glossed.

**Accepted:** eight scenes run 42 to 51 s now that they breathe (pacing's major). Each turns its picture in phases and none sits
still past 9.7 s; `critic-pacing` now judges a long scene by its ideas, not the clock alone. The two act changes at 5.4 and 5.6 s
of voice-free time (a card carries them); the recap meme's 3.4 s; "SAT solver" asked in the hook before SAT is defined (a tease
paid off in 13b); Whisper hearing "floor" as "flaw" in the British accent (Parakeet heard "floor").

**After round 9, at the owner's word:** "the meme to information ratio is very low". Eight more, for eleven across 12.8
minutes, four of them moving: typing kitty (02), Panik Kalm Panik (03, replacing a stamp and two chips), Stonks (06,
replacing the "27 years" stamp), no no no wait (08b), IShowSpeed (12), Is This a Pigeon? (13), Hide the Pain Harold (14b,
replacing the obituary stamp) and Nanami (15). Each lies on a scrim over its scene; every frame looked at. No critic re-run:
the memes add no claim (their facts are the video's own, sourced) and the rule for them is now `explain-concept`'s.

# The fourth cut (2026-10-27): the narrator he picked, with its style

The third cut's narrator was the clip he named, but cloned and read with the script's own directions it came out flat and dark:
he said it sounded "nothing like" the audition. A side-by-side of options 5 and 6, each with and without the voice's description
in every direction, had him choose option 6 with it. `narrator-uk` is now that clip, its description in `narrator-uk.style`, told
in every direction (DESIGN D68). Measured against the side-by-side he chose: median pitch 137 to 142 Hz against 146, swing 80 to
99 Hz against 100, similar brightness; speech levels within 0.55 dB (sd) across 62 takes; every take heard back over 97%; Parakeet
heard "The catch?" as "Bakch?" (Whisper heard it right). 14.2 minutes: the voice takes its time.

No critic round: no word changed since round 9, and the voice is checked by both listeners and the measurements above.

# The fifth cut (2026-10-28)

The owner watched the fourth cut through and sent one long set of notes (`critics.md`, *The owner's notes on the fourth cut*):
cringe lines, an under-sold hook, a muddled exponent comparison, no like-for-like picture of checking against solving,
splitting and "translating into SAT" asserted rather than shown, memes as afterthoughts and reused, a circus-like bed. The
script was rewritten around them; a self-aware narrator (an AI explaining another AI's proof); two schematic charts, one of
them (digits of the step count) carried from P versus NP into the middle ground; a slice chart where every exponential is flat
and the new bound falls under each; sixty switches split into three groups of twenty; a Sudoku as SAT; the galaxy brain held as
a narrated recap; fourteen memes, none another video uses, five of them moving; a calmer puzzle bed (ACE-Step, seed 11, heard
for vocals by Parakeet: none). 17.4 minutes.

## Round 10: one round, three critics on Sonnet (about 300k tokens)

| Critic | Verdict | Major | Minor |
|---|---|---|---|
| accuracy | fail | 2 | 3 |
| clarity | fail | 3 | 3 |
| engagement | fail | 3 | 2 |

**Fixed:** encryption is said within its sources ("nothing here is practical yet, so nothing about encryption changes
today"), and the slice chart carries no crossing numbers ("the shape only: the real crossings come astronomically later";
"starts out above the record" cut); the withdrawn manuscripts are "math papers"; "working through the paper's own example
numbers". The digits chart says each digit is ten times the work and stays up through P and NP; the dial shows a rule reading
one small number in place of another group's switches; why counts multiply, and why slopes stand in for points, said plainly.
The hook keeps its three questions open; the narrator speaks for itself in the middle (a competitor's aside, the Sudoku line,
"not on your laptop. Or on mine."); Fry replaces Sweet Brown; the Xbox caption states the consequence; the still stretches in
03 and 13 now move. No second round: nothing blocking, and the owner asked for restraint (critic-loop, *Spend*).

**Accepted:** "roughly two to the n over the square root of log n" for Theorem 1.1's bound (12 names the log log factor); the
nails meme's three lines.

## Round 11: the sixth cut, one round, two critics on Sonnet (about 160k tokens)

The owner's notes on the fifth cut (`critics.md`) set the scope: the dial and the rules, music handoffs, Zane's card, three
overlaps, flat jokes. The overlaps are now measured (`npm run overlaps`, D72): the fifth cut had 8 places, the sixth has none.

| Critic | Verdict | Major | Minor |
|---|---|---|---|
| accuracy (09 to 11b, 05b) | pass | 0 | 2 |
| clarity (09 to 11b) | fail | 4 | 3 |

**Fixed:** the dial now says why the easy points are easy (the paper builds the rewrite so a note is all a rule needs there,
and at zero it needs the real switches), that a note is guessed ("say group two has seven on"), each group counted alone, and
every combination of guesses added up; the curve is "the number of settings that work", smooth because the rewritten rules are
still little formulas with the dial inside them, worked out at one, two, three and wanted at zero; slopes are what an easy point
gives besides its height; idea one says the counts multiply but the steps add ("a million steps per group: three million in
all"); the dial's screen text says "like" and "say", as the narration does; the clause on why the curve is smooth is marked
inferred in `sources.md`.

**Declined:** "n" before "n switches" (defined in 03); the recap's "the curve that bends under every straight line" (it names
the chart from 05 and 08, which the owner asked to see return); "in the paper: Taylor coefficients" in small type (the source's
term, kept for the viewer who wants it, `explain-concept`); "two to the n over the square root of log n" said aloud (accepted
in round 10; the screen shows the exponent). No second round: nothing blocking, a revision gets one (critic-loop, *Spend*).

## Publish: packaged 2026-10-28

The owner on the sixth cut: "good enough to post ... everything landed really well". `npm run package` wrote
`~/Movies/Explainers/shipshow/youtube/to-upload/eth-is-false/`. One Sonnet critic judged the package (publish skill). It passed with
one major, fixed: the title stated the paper's claim as the channel's; it now attributes it ("OpenAI Says ... (Opus 5.5 Explains)").
Minor findings fixed:
- the thumbnail curve, drawn turning down and then flat, now keeps rising under the floor;
- the tag "AI explains AI" repeated the title, so it now reads "No human authors";
- three sources were added: OpenAI's history, Jiang and Cai, and DNF;
- "as of" now gives the date the sources were read.

Declined: shortening the chapter list. The upload is the owner's; the link goes in `video.json` `youtube.url` once it is up.

**Published 2026-10-28:** https://youtu.be/QBb53_LLMsU (uploaded by the owner; the folder moved to
`youtube/uploaded/2026-10-28 eth-is-false/`).
