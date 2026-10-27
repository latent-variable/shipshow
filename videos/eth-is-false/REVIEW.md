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
