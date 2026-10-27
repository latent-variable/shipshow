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

## Round 4 (the cap): 0 blocking, 13 major; accuracy, clarity and consistency pass

| Critic | Model | Verdict | Blocking / major / minor |
|---|---|---|---|
| accuracy | Sonnet | pass | 0 / 0 / 5 |
| clarity | Opus | pass | 0 / 0 / 7 |
| pacing | Sonnet | fail | 0 / 5 / 4 |
| sync | Sonnet | fail | 0 / 2 / 3 |
| visuals | Opus | fail | 0 / 2 / 6 |
| consistency | Sonnet | pass | 0 / 0 / 5 |
| engagement | Opus | fail | 0 / 4 / 5 |

Fixed after the cap, then checked by two fresh verifiers (Opus on scenes 01, 02, 04, 07, 08, 09 and 11; Sonnet on 07 to 09
after the first found a blocking chart collision and three majors that the fixes themselves had caused):
- **Sync and engagement.** The Dafoe meme lands after the doubling line is read, so the note and its METR source are seen; the
  1958 card builds on "sixty", "half", "instructions", "compiler"; 07 opens on "machine time ⇄ programmer time" and the bug card
  lands on "his Fortran"; the chart's first dot lands on "longest"; the code line types at the scene's start.
- **Engagement.** Shut Up and Take My Money (2011) replaced by Nanami vibing (Jujutsu Kaisen); five of seven memes are now 2022 or
  newer clips. The money meme's fade and the 1958 card no longer cover each other.
- **Visuals.** The chart's box holds its axis labels (they had collided with the doubling note); role tags at 26 px.
- **Clarity.** "The doubt starts with Grace Hopper" (it was "It starts", heard as Plain English); 07 says what was traded; the
  1950s card says "something like it", as the narration does; the 56% meme restates the narration.
- **Pacing.** The Backus and DHH cards cut to what can be read in their time; scene gaps after 04 and 05 under 2 s.
- **Loudness.** The render came out at -19 LUFS; ShipShow now masters it to -14 (#71, D52).

Accepted or declined at the cap, with the reason:
- **Speaking rate (pacing, major).** 01, 02, 03, 11 and 12 run 18 to 34% over ShipShow's 210 syllables a minute. Declined: speed
  is 1.0, the slowest OmniVoice runs at; every sentence gap is at least 0.45 s; Lino's own call for his published videos is that
  1.0 drags and 1.1 to 1.25 is what viewers expect (DAIS product-videos, 2026-10-15). His ear decides; a slower pass is one
  `gap` change away.
- **Portrait credits at about 19 px (visuals, major).** Accepted: each sits on a solid strip and is crisp at 1080p; at 28 px a
  credit would cover the face on a 200 to 300 px photo. Every credit (author, licence, link) goes in the YouTube description too.
- **Reading time of the assembly listing and the chart (pacing, major).** Accepted: the listing is four lines and "and 7 more",
  the point is its length, not its lines; the chart's 2574 s "needs" is the packet counting the chart's text as code.
- **Minor findings** across critics (date formats, ladder annotations, the 0.2 s "Wait." take, the end-credit line's reading
  time, METR's "human expert" being partly estimated, Post's letter being satire, "In January" inferred for Antirez) are accepted
  as they stand; the last three are recorded in `sources.md`.

The floor holds: accuracy passed with no blocking or major finding.

# Third cut (2026-10-27)

Lino listened to the second cut. The voice sounded hollow, "like I'm talking through a paper towel roll": the reference had been
denoised (#67). Fixed in #73: the clip goes to the model as recorded, and the clean-start check reads silence against the take's
own hiss. On the script: "too focused on quoting people"; he would never tell someone to read the code as the answer, his method is
to define the failure modes, test them, make them pass and prove the tests catch failures; "more punchy, more aggressive, more like
a Fireship video ... funny is better than anything else". `critics.md` carries that as the first two lines of the bar.

Rewritten in that style (759 words, 12 scenes, speed 1.15): people get a fun one-line intro (Hopper's team's moth, Dijkstra calling go
to harmful, Karpathy coining vibe coding, DHH racing at Le Mans), quotes cut to a few short ones, scene 11 is his verification method,
the close is "just agree, then show them the test". A fresh Opus critic read the script cold first ("not yet, but close": 09 a stack
of quotes, 07 a lecture, a defensive close); its lines went in, except two that overreached the sources.

## Cut 3, round 1: 0 blocking, 17 major; accuracy, pacing, sync and consistency pass

| Critic | Model | Verdict | Blocking / major / minor |
|---|---|---|---|
| accuracy | Sonnet | pass | 0 / 2 / 6 |
| clarity | Opus | fail | 0 / 2 / 9 |
| pacing | Sonnet | pass | 0 / 4 / 6 |
| sync | Sonnet | pass | 0 / 1 / 5 |
| visuals | Opus | fail | 0 / 2 / 5 |
| consistency | Sonnet | pass | 0 / 0 / 5 |
| engagement | Opus | fail | 0 / 6 / 9 |

What changed: the close says what it was always about ("what it does, and whether you can prove it"); METR introduced as "an AI
research lab" and its measure split in two; the Unix growth is the rewrite's; the 1957 story is "IBM's own case study, so, grain
of salt", and the 1958 statistic left the narration; "on average" spoken for the 56%. The hook is a mock pull-request comment with
its upvotes counting; Hopper and Backus take the frame one after the other, with the 1947 logbook photo (public domain, NSWC
Dahlgren) on "moth"; the chart draws as the years are said; the skeptics arrive together; the payoff is a test run going red, green,
then red on the planted bug ("reading isn't proof"); the blurry IShowSpeed clip replaced by Pedro Pascal. Memes that land at a scene's
end get a beat after it; the Suspicious Guy meme moved to "strategy." so the caught bug is seen.

## Cut 3, round 2: 2 blocking, 12 major; accuracy, pacing, sync and consistency pass

| Critic | Model | Verdict | Blocking / major / minor |
|---|---|---|---|
| accuracy | Sonnet | pass | 0 / 0 / 3 |
| clarity | Opus | fail | 0 / 1 / 10 |
| pacing | Sonnet | pass | 0 / 6 / 6 |
| sync | Sonnet | pass | 0 / 2 / 6 |
| visuals | Opus | fail | 2 / 2 / 6 |
| consistency | Sonnet | pass | 0 / 0 / 4 |
| engagement | Opus | fail | 0 / 1 / 9 |

What changed: the hook's comment card no longer clips its reaction row (blocking, and engagement's one major); the moth photo
steps aside before Hopper's quote (blocking); every card arrives with its person; the terminal note fits; the chart shows the 5 to
61 h band (the "error bars you could park a truck in"); scene 11 says the method's limit, "that list is the real work, because tests
only catch what's on it" (clarity's major); a fresh take of the bread line. Every run heard back at 97% or more, none flagged.
Accepted with reasons: speaking rate over ShipShow's default (the owner asked for Fireship pace); the assembly listing's reading time
(four lines and "and 7 more"); the scratch 0.42 s early (the build forbids it on the word); one accuracy minor is wrong (S7 does
compare Mel's code with the optimizing assembler's: "Mel's always ran faster").

Verification (a fresh Opus critic, after round 2): six of seven fixes held; the seventh broke the order of scene 11 (the new limit
sentence says "tests" and "catch" first, so the planted-bug line arrived 15 s early: blocking). Fixed with `tests#2` and `catch#2`:
the terminal now shows fail at 256.9 s, pass at 260.5 s, caught at 269.0 s. Its major, an empty scene 09 opening, is answered by
"the skeptics folded." stamping on "folded"; the moth photo stays up 1.9 s. Accepted at that point: scene 09's first 3 s carry only
its header and the caption; Dijkstra's card shows "1975" for a few seconds before his quote.
