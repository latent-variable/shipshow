# Review: eth-is-false

Plan: `thorough` (importance high: public, in Lino's voice, on a result experts are still checking). Critics: accuracy, clarity,
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
