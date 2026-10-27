# Review: never-about-the-code (second cut)

The first cut (six rounds, all critics passing; git history of this file) was rejected by Lino on 2026-10-26: choppy audio with
short words that sounded "really close to my mic", wording and pacing he called atrocious, 2025 statistics, too little of what
people actually complained about, no faces, a plain look, a jazz piano bed instead of lo-fi, and dated memes. This cut is a
rewrite: new script and research, the voice pipeline fixed (runs of sentences, no squashing, the clone's hiss cleaned: #67), Commons
portraits (#65), animated memes (#66), the lofi theme (#69) and a lo-fi music bed.

Plan: `thorough` (importance high). Critics: accuracy, clarity, pacing, sync, visuals, consistency, engagement; Sonnet, Opus for the
last round's clarity, visuals and engagement; at most 4 rounds; until no blocking or objective major finding is left. Every critic is
a fresh agent that never saw the build. Before round 1, a fresh Opus critic read the script alone ("not yet": announcer lines, a
three-times tagline, a dense complaints scene, an unanswered objection); its fixes went in first.

## Round 1: 0 blocking, 39 major; six critics (visuals waited for the theme)

| Critic | Verdict | Blocking / major / minor |
|---|---|---|
| accuracy | fail | 0 / 8 / 6 |
| clarity | fail | 0 / 5 / 5 |
| pacing | fail | 0 / 15 / 4 |
| sync | fail | 0 / 6 / 5 |
| consistency | fail | 0 / 2 / 6 |
| engagement | fail | 0 / 3 / 4 |

What changed:
- **Pace.** Seven scenes ran 300 to 348 syllables a minute against a 252 target, with near-zero gaps inside runs. Speed 1.2 to
  1.05, the script cut from 796 to 741 words, the dense scenes trimmed, pauses after the scenes that end on a meme.
- **Accuracy.** The hook's compiler claim is now "something a lot like it" (opinion); the ladder's paraphrase lost its quotation
  marks; Spolsky cut (his point was about weeding out students); Backus's two fragments quoted separately; the twelve hours dated
  early 2026 with its 5 to 61 h range; the doubling credited to Time Horizon 1.1 and said as "has been doubling"; Veracode's 56%
  scoped to model code with no security guidance; the determinism objection framed as the common objection, not Goldberg's.
- **Clarity and engagement.** The Hopper aside that made "he'd flipped" read as Hopper is gone; Karpathy's "just don't work" carries
  its context; Antirez's "more time" says before what; the Backus schedule joke cut (a slip, not a cost); Mel moved into the cost
  scene; the objection answered on screen (two programs, the same tests pass); the payoff is a worked test (a customer never sees
  another customer's invoice) that fails, passes, and fails again.
- **Sync.** Every scene opens on a +0.1 s anchor; the memes that covered the optimized result, the cost stamps and the 1958 card
  moved or step aside after 3.8 s; chart dots arrive as they are named; sound offsets over 0.3 s removed.
- **Consistency.** Every dated quote is a card with the portrait inside; red is the complaint again (the cost stamps are ink, "lost
  anyway" red); one caption form per person.
- **Voice.** Two runs re-taken for shouts; 23 runs heard back, 22 at 97% or more, the other at 97% with digits written as numbers.

## Round 2: 0 blocking, 27 major; all seven critics, on the lofi theme

| Critic | Verdict | Blocking / major / minor |
|---|---|---|
| accuracy | fail | 0 / 1 / 5 |
| clarity | fail | 0 / 3 / 4 |
| pacing | fail | 0 / 9 / 5 |
| sync | fail | 0 / 6 / 6 |
| visuals | fail | 0 / 4 / 4 |
| consistency | fail | 0 / 1 / 5 |
| engagement | fail | 0 / 3 / 4 |

What changed:
- **Rhythm.** Speed 1.05 to 1.0. Pacing found sentences inside runs 0 to 0.25 s apart next to 3 s pauses between scenes: ShipShow
  now puts a breath of at least the video's gap between sentences of a run at a quiet point (#70, D51); scene pauses capped at 1 s.
  All sentence gaps now 0.34 s or more. Three runs re-taken (two clipped starts, one shout): 24 runs, no faults.
- **Accuracy.** The ~12 h point is labelled as METR's: public frontier, Feb–Mar 2026, range 5 to 61 h, highly uncertain, the test
  near its limit, and said "with wide error bars"; Ed Post's capitals match his page; the 1958 share is "at about sixty sites";
  Veracode's 56% is an average over models.
- **Clarity.** DHH's card says what changed (his words on Quattro); Antirez has his own scene; the objection names the security
  tests and answers with "treat it like a co-worker's work"; the payoff names its limit (a test only checks what you thought to ask).
- **Sync and engagement.** The C rung lands on "C"; the Dafoe and This Is Fine memes step aside after 3.6 s; the 12-behavior
  question lands on "never"; the close opens on the heckle; the chart shows what task length means while METR is explained; the
  one-job scene opens on the programmer's one day of training; Roll Safe (2017) cut.
- **Visuals and consistency.** Chart labels moved off the line and haloed; source lines, axes and the credit line at 28 px or more;
  portrait credits larger and Ritchie and Thompson bigger; every quote card carries its source; the Unix card says rewritten 1973,
  paper 1974; portraits take the theme's print frame (#69).

## Round 3: 1 blocking, 21 major; all seven critics (clarity and engagement pass)

| Critic | Verdict | Blocking / major / minor |
|---|---|---|
| accuracy | fail | 0 / 1 / 4 |
| clarity | pass | 0 / 0 / 6 |
| pacing | fail | 0 / 12 / 4 |
| sync | fail | 0 / 1 / 4 |
| visuals | fail | 1 / 3 / 4 |
| consistency | fail | 0 / 1 / 5 |
| engagement | pass | 0 / 3 / 5 |

What changed:
- **Visuals (blocking).** The chart's caveat ran off the right edge: the labels now sit left of the point; the Opus 4 and GPT-5
  labels are gone (their dots stay). Portrait credits sit on a solid strip; source lines, tags and steps at 30 px or more.
- **Accuracy.** Goldberg is credited only with the co-worker point ("argues"), not with the determinism objection he calls poor;
  Karpathy "flipped by December", as his post says.
- **Memes.** Engagement found four of the memes old. Three replaced with 2025 and 2026 formats from Imgflip's clean clips: Jack
  Black opening the book (A Minecraft Movie) for reading the assembly, Odysseus tied to the mast (The Odyssey) for the priesthood
  hearing about automatic programming, IShowSpeed's hands over his face for the 56%. The objection's answer cards are never covered.
- **Sync and engagement.** The Karpathy quote lands on "they"; the Backus card and Goldberg's credit land on their names; the
  objection gains beats (the "no security guidance" highlight, "treat it like a co-worker's work: check the behavior").
- **Pacing.** The gap between sentences is 0.45 s, and every sentence inside a run gets it (11 breaths); scene pauses cut to 0.6 s at
  most. **Declined:** the remaining speaking-rate findings (01, 02, 03, 12 at +23 to +34% over ShipShow's 210 syllables a minute).
  The voice is at speed 1.0, the slowest OmniVoice is run at, and cutting words does not change a rate; Lino's own call for his
  published videos is that 1.0 already drags and 1.1 to 1.25 is what viewers expect (DAIS product-videos, 2026-10-15).
- **Consistency.** Antirez's concession is green like the other converts'; his name capitalised as narrated.
