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

# Fourth cut (2026-10-27)

Lino on the third cut: sentences were "broken up in awkward places", so thoughts did not land together (ShipShow #75: a script line
is now one take); the blue-green gradient and city lights were "flexing", not serving the message (the skyline, light pools and
scanlines are off for this video: `flair.ambient` is dust, vignette and grain); memes need time to breathe and should carry the
message, not stitch scenes together; and the narration should say the message, with the quotes shown as evidence, never recited
("the narrative is the main method"). Rewritten around one story, the four stages every new layer goes through (impossible,
beneath you, rots your brain, becomes the bar), with the quotes on screen; each meme rides the middle of its line for 3 to 4 s. A
fresh Opus critic read the script cold first ("not yet": scene 10 still recited, claims split from their evidence by a breath,
memes on the last word); its structure and lines went in. 642 words, 13 scenes, 4:02; every take heard back clean.

## Round 1 (fresh agents: accuracy, pacing, sync, consistency on Sonnet; clarity, visuals, engagement on Opus)

| Critic | Verdict | What it found, and what changed |
|---|---|---|
| accuracy | pass (0 blocking, 2 major) | Karpathy's "just don't work" needed his context: the card now says "not intern-level yet" (S12). The moth photo's "her team" was not in the sources: the photo is gone. |
| visuals | fail (2 blocking, 6 major) | The moth photo covered the stage pills and Hopper's quote and no line was about it: removed. The method's steps 2 to 4 were unnumbered, dim side labels: the terminal rows are numbered 2, 3, 4 and the planted-bug row reads "caught ✓" in green. |
| engagement | fail (0 blocking, 4 major) | The four stages were never brought back to AI: scene 10 opens on "you don't understand the code is stage three; stage four is here", with the tracker's third pill renamed to the quote. Memes buried their payoffs: see pacing. |
| clarity | fail | Same as visuals on the method: numbered. |
| consistency | pass (0 blocking, 2 major) | Numbering: fixed as above. |
| sync | fix (0 blocking, 4 major) | m03 never faded and hid the Plain English rung; m08 hid "he understood what his program did"; m11 landed on the last word and covered the Veracode card. Every meme now fades 2.2 to 3.6 s after it lands, before the evidence it sat on is named; the Nanami meme rides "four", the Fort Knox one "exactly". |
| pacing | fail (0 blocking, 4 major) | M1 is the meme cover above. M2 to M4 (02, 07 and 04-05 dense): left to round 2 to judge after the meme fixes. |

Also fixed after looking at the frames: the stage tracker in 05 did not light stage three (two strips stacked out of line; now one strip whose pills change on "three,"), the scene-10 strip wrapped to two lines, scene 10 opened on an empty screen for eight seconds, and the skeptic cards sat empty until each person was named (each card now arrives with its person).

## Round 2 (all seven again: every one failed round 1 or had its ground touched)

| Critic | Verdict | What it found, and what changed |
|---|---|---|
| accuracy | pass (0 major, 2 minor) | "with no security guidance" and Mel against the optimizing assembler now quote their sources in `sources.md` (S17, S7). |
| consistency | pass (3 minor) | The scene-10 pill showed the quote twice: it reads "rots your brain" again and the big line carries the quote. Stale scene selectors left (no visible effect). |
| sync | pass (5 minor) | "trust the tests" now arrives on its own "trust"; the late-2025 METR points wait for "2026"; the by-hand bar lands on "days". The two thumps 0.5 to 0.65 s after their word are kept on purpose. |
| clarity | pass (6 minor) | Hopper's "computers only do arithmetic" is now said as what they said; METR's measure is split into how it times tasks and what it asks; scene 10 says the complaint is stage three and the work moved on to stage four; the planted-bug row is green and reads "planted bug: caught ✓"; the hook card reads "the same line, about compilers, 1950s". "Quattro" stays on the card and in the line (declined: his app's name, and the point lands without it). |
| engagement | fail (1 major, 4 minor) | The METR meme still covered "doubling every three months": it fades 2 s after it lands and 09 holds 1.2 s before the next scene. Empty openings in 03, 08 and 12 now have their first card on the first words. |
| pacing | fail (4 major) | 02 lost "Quick refresher." and 12 lost "Yes, on purpose."; 04 holds 0.5 s and 08 0.6 s after their last line so the quote and the payoff can be read; Ritchie and Thompson's photos are gone from 07 (named by nobody), which leaves its cards room. 11 and 12 stay above the target: the owner asked for a Fireship pace, and every take was heard back clean. |
| visuals | fail (1 blocking, 2 major, 6 minor) | The step labels ran out of the terminal: the rows are now a test name ("invoices stay private") and a right-aligned label inside the card. The METR annotation moved off the gridline; the close's lines fit. Credit bands on the photos are the kit's (accepted: legible at 1080p). |

Then a fresh verifier checked every round-2 blocking and major finding against the rebuilt frames: see Round 3.

## Round 3 (a fresh Sonnet verifier, every round-2 blocking and major finding against the rebuilt frames)

Verdict: 0 open blocking, 1 open major, 1 new. The terminal labels, the METR meme, the empty openings in 12 and 13 and the
engagement major are fixed. Open: in 02 the "No." gag had no beat ("have you ever read them?" and "No." in one take, 0.0 s apart):
the question is now its own line, so "No." comes after a 0.4 s pause. New: 09 showed bare axes for about 7 s while the voice defined
METR's measure: "human expert" now highlights on its word and "half the time: the agent finishes 1 task in 2" fills the chart until
the twelve-hour point arrives (it fades first, since the two would collide; checked in the frames).

**Accepted at the cap of this cut, with reasons:**
- Pace: 02, 07, 11 and 12 run about 290 to 310 syllables a minute against a 241 target. The owner asked for a Fireship pace, every
  take heard back clean, and the memes and key cards now each hold long enough to read. His listen decides it.
- The Nanami meme in 08 still covers the 4 h and 3 days bars for about 2 s; they then stay up for 8 s.
- Photo credit bands are the kit's size (about 20 px); legible at 1080p.
- "Quattro" is said without being explained; the card and the point carry it.
- The duplicated "so, can you?" (on screen and in the caption) is the last line, and kept on purpose.

**From the PR reviewer (#76):** "machine-written code, like Fortran" called Fortran itself machine code. Backus's words (S2, section 4)
are that a machine writing an efficient program was "a foolish and arrogant dream"; the line and the card now say that a machine writing
the program, the idea behind Fortran, was the dream, and `sources.md` quotes the passage. Scene 06's "Fortran? The foolish and arrogant
dream?" still pays it off.

# Fifth cut: Drama 3, directed (2026-10-27)

Lino, on hearing Drama 3 against OmniVoice: use it, and use what it is for, so that "where we're using humor, sarcasm, whatever, it
comes across ... in the direction", speed it up slightly, and make it "available for others going forward". ShipShow got a third
engine (DESIGN D55): every script line now opens with a stage direction (`[deadpan]`, `[sarcastic]`, `[mock-dramatic]`, `[smug]`),
lines split where the tone turns so each punchline stands alone ("Like animals.", "No.", "Also no.", "In two months."), no
timing directions (they stalled the voice in testing). The words are the fourth cut's, unchanged. Voice: `lino-long`, the first
15 s of the owner's Yap recording as recorded, with its transcript; speed 1.2 over the engine's slower natural read. 52 takes,
all heard back; two under 97%, both Whisper's spelling of "Karpathy" and "56%". 4:25.

The pictures did not change, so the critics whose ground the voice touched ran fresh: sync and pacing (Sonnet).

| Critic | Verdict | What it found, and what changed |
|---|---|---|
| sync | pass (3 minor) | The "caught" terminal row landed on the first "catch" of its sentence: now on "won't catch" (`catch#3`). The closing thump 0.5 s after its slam, and Karpathy's photo 0.15 s early from Whisper's "Carpathi", kept. |
| pacing | fail (4 major) | 07, 10, 02 and 12 run 19 to 23% over target: accepted, as on the fourth cut (the owner asked for this pace). The pause after 09 was 2.5 s of dead air, padding left from the OmniVoice cut: now 0.5 s. 06 runs slow (a 1.9 s gap between the double take and "Yesterday's insult, today's flex") and some cards are short to read: kept for the owner's listen, since the gap is inside the directed delivery and an agent cannot hear whether it lands. |

**For the owner's listen:** whether each direction lands (the double take in 06, the deadpan punchlines, the sarcasm in 05), and
the 1.9 s beat in 06.

# Sixth cut: receipts, his own process, a new look (2026-10-27)

Lino on the fifth cut: the delivery lands ("a lot of intonations ... and emphasis are actually landing really well"); the content
needs work. What he named, and what changed:

- **"Dijkstra" came out "Di... kistra".** The `say` respelling "Dike-stra" was read as two words. Voiced twice each in his clone and
  heard back: "Dykstra" came back as the name both times, so `say` now maps to that, and the other hyphenated respellings
  (Veracode, Quattro, Redis, antirez, Datamation) are gone: Drama reads them as written. ShipShow D55 and `narration-writing`.
- **Photo credits on screen.** Gone from the photos; ShipShow now writes them for the description (`review/credits.txt`, D57).
- **"Calling Andrej Karpathy a doubter feels wrong."** "Even the doubters switched" is cut. Karpathy appears as the man who wrote
  "the hottest new programming language is English" in 2023 (shown when the script says "plain English") and named vibe coding.
- **"I never write that down ... what I do have is automatic tests, verifiers and loops."** Scene 12 is his process in his words:
  he says what the feature must do, the agent builds and tests it, another model reviews the PR round after round, standing tests
  and checks know the project, he validates it himself; most of the work is reviewing, testing and verifying; "that's due
  diligence in 2026". The planted-bug and never-list method is gone, and `critics.md` no longer asks for it.
- **"Screenshots of 'you don't understand this code' in people's PRs."** ShipShow can now capture real pages (D56). No public PR
  comment says those words literally (a research agent searched GitHub and the web); the closest real ones are shown: Ghostty's
  contributing guide ("you must understand your code", in bold) and the OCaml maintainer closing a 13,000-line AI PR ("hard to
  review, and very lightly tested"; "only 20% of the work"). Every quote someone wrote is now the page it is on.
- **METR, "the same people behind that study".** Scene 9 now says METR is the lab whose 2025 study found AI made developers slower,
  and that its rerun lost developers who would not work without AI, before the time-horizon chart.
- **"COBOL cripples the mind, but then Fortran ..."** Dijkstra's line about Fortran itself ("the infantile disorder") leads, and
  COBOL is introduced as its sibling on the same layer.
- **"The receipts".** "The haters had receipts" is cut: back then a great hand coder could beat the machine; today almost nobody
  can, and the few who can spent decades getting there. His line goes in after the builders: "I'm not going to out-code the AI. My
  job is using it to build things that scale."
- **"The colours and the fonts, we can do much better."** A new theme, `signal` (D58): near-black, a highlighter yellow, Bricolage
  Grotesque and Inter, karaoke captions.

## Round 1 (fresh agents, Sonnet: all seven)

| Critic | Verdict | What it found, and what changed |
|---|---|---|
| accuracy | fail (3 major, 7 minor) | The hook said 1950s programmers "said basically the same thing" about compilers, which no source has: now "pushed back on compilers the same way". The METR rerun began in August 2025: "then they tried to run it again, and more and more developers wouldn't work without AI". IBM's programmer took a one-day course and also used the manual: "took a one-day Fortran course"; the meme says "One Fortran user". Also "many programmers" (Backus), "2026 report" (Veracode), "by the end of 2025" (Karpathy), antirez's "for most projects" on his card, the real first four instructions on the asm card, C's unsourced 1973 dropped, the memes table in `sources.md` matched to the screen. |
| visuals | fail (2 blocking, 5 major) | The chart's title was cut by the frame's top and its uncertainty notes overlapped: chart shorter, title smaller, notes spaced. The EWD 498 captures showed half lines: captured with no padding. The METR paragraphs were too small and too long: `data-lines` (new) keeps only the lines with the words. Small mono labels raised to 28 px; the hook title now starts centred and moves up; the stage cards and portraits are bigger; the IBM block shares one width. |
| clarity | revise (7 major) | Scene 2's "has anyone ever said..." read as contradicting the hook: now "does anyone today say", and a new line sets up the thesis early ("You know what it does. That's the part that always mattered."). "It always goes" is now "almost every time". DHH and antirez are named. The OCaml case now leads into scene 12 ("how I actually do that eighty percent"). A concrete catch is in scene 12 (below). "The roasting has already started"; the IBM sentence is split. |
| engagement | fail (3 major) | Scene 12 had no example: it now shows a real catch from the PR that built this video's voice ("turning off hear-back blocked any cloned voice without a transcript. Fixed before it merged"), marked in the review ledger. Scene 5 is split and Backus gets a one-line intro. The METR beats stay: the owner asked for them. |
| pacing | fail (7 major) | Scenes 5, 11, 12 and 13 are each split in two (05b, 11b, 12b, 13b), so no scene holds two ideas or runs past 40 s, and the thesis gets a scene and a pause of its own. "And nobody's waiting decades" is cut. The rate findings (02, 07, 10, 13 at 19 to 21% over target) are accepted, as on cuts 4 and 5: the owner asked for this pace. |
| sync | revise (4 major) | Backus is now named as his photo lands. The IBM meme arrives on "course." and leaves before "four hours". "Nobody read the machine code either" now shows the struck-out instructions. The two late thumps: the stamp moves to "nobody" and the title to "code.", so each lands with its sound. Also the compiler card on "deterministic.", the reviewing row on "Most", the next receipt on its sentence's first word, stage one lit on "one,". |
| consistency | pass (5 minor) | The stage tabs are pinned to one place; "Time horizon" named once on the chart; "fresh critics" dropped from the checks card; the hero line spelled one way. Stamp colours kept: red marks a turn, yellow the point. |

## Round 2 (fresh agents: accuracy, pacing, sync, consistency on Sonnet; clarity, visuals, engagement on Opus)

| Critic | Verdict | What it found, and what changed |
|---|---|---|
| accuracy | revise (1 major, 5 minor) | "Moving faster than any before it" compared layers no source measures: now "this layer is moving fast", tagged opinion and carried by the doubling. The card shows `return m * x + b;` (the line compiled) and "load · multiply · add"; "pushed back on compilers too"; "a maintainer closed ... he wrote, among other things"; the METR doubling figures written into `sources.md`. "Every one of them got roasted" kept as the narrator's opinion. |
| visuals | fail (1 blocking, 3 major, 8 minor) | Screenshot captions were dimmed by the vignette: now in full ink. Cards ran into the stage tabs: every staged scene now starts below them. Each stage now gets its name large on screen when it is said, and "four stages" shows all four. The PR receipt is now the ledger alone, full width, about 38 px type, when the story is told. Marks on light pages multiply under the ink (ShipShow records whether a page is light). The EWD captures have side padding and whole lines; arrow, scene 12 heading, IBM facts and the compiler/agent cards aligned. |
| clarity | revise (2 major, 4 minor) | The catch is said in the viewer's words ("switch off one check, and some cloned voices stopped working"). The METR slowdown is resolved aloud: "so many developers wouldn't work without AI that METR called its own new numbers unreliable." Dijkstra is introduced ("Turing Award winner"), Ghostty ("the terminal app"); "Back then" and the IBM opening reworded. |
| engagement | fail (4 major, 2 minor) | The payoff in scene 2 landed 17 s early on "knows": now on "You know what it does". "Both true" now slams across the objection cards. The PR receipt arrives with "On the tool that voiced this video". The last minute gets a meme ("Wait, it's all reviewing?" / "Always has been") and a real number under "a lot of code merged" (ShipShow alone: 58). |
| pacing | revise (2 major) | Scene 12's catch is now nine words shorter and the checks card arrives on "Fixed", 1.7 s earlier. 02, 11b, 12b and 13 run 15 to 21% over target: accepted, the owner's pace. The 1.9 s beat in 06 stays for his ear. |
| sync | revise (1 major, 4 minor) | The scene 2 payoff (as above); "not out-coding the AI" on "going"; the Dafoe meme on "bars"; the IBM meme moved to "Sound familiar?", after the bars. |
| consistency | pass (3 minor) | Kept: "machine code" in the close is the thesis line, loosely true; units and caption patterns noted. |

## Round 3 (fresh agents: accuracy, pacing, sync, consistency on Sonnet; clarity, visuals, engagement on Opus)

Five pass: accuracy (every quote and number re-checked at its source), clarity, sync, consistency and engagement ("I would
not have stopped"), with minor notes only.

| Critic | Verdict | What it found, and what changed |
|---|---|---|
| visuals | fail (2 blocking, 3 major) | The "both true" stamp covered part of the Veracode line: now the opening of the closing line ("both true. don't trust the output. verify it."). Marks on light pages still washed the words out: the grow animation makes the marks' container its own layer, so the blend now sits on the container (ShipShow kit). The IBM scene opens on a headline, the ladder's axis is up from the start, scene 12's heading is pinned instead of drifting, Karpathy's post sits lower, and scene 10's tabs show the whole row from the start. |
| pacing | revise (1 major) | 05b ran slow: the Dijkstra line is shorter and he is introduced as the "goto considered harmful" guy (engagement's suggestion; S21), COBOL's line too. The beat after "Sound familiar?" is now 1.4 s so its meme can be read. 12-verify's rate (19% over) accepted with 02, 11b, 12b and 13. |
| clarity, consistency | pass | ShipShow is now named aloud in scene 12, since the screen names it. |
| sync | pass | The Fort Knox meme leaves sooner; Backus's quote shows on "themselves", before its meme. |
| accuracy | pass | "Nobody read the machine code either" kept as the thesis line, an opinion whose scope the struck-out compiler output on screen shows. |

## Round 4, the plan's cap (fresh agents: accuracy, pacing, sync on Sonnet; visuals on Opus)

| Critic | Verdict | What it found, and what changed |
|---|---|---|
| accuracy | pass (1 minor) | "Switch off one check, and some cloned voices stopped working" kept: a fair plain reading of the ledger row. |
| visuals | revise (1 major, 7 minor) | Scene 10 opened on its tabs alone: the quote is now up from the start. Screenshot captions and bars are larger (kit); the thesis breaks after "what it does,"; "same here." is large. Kept: the IBM, ladder and scene 12 openings each hold a heading or the axis for 3 to 5 s, and a stray list bullet at the EWD captures' edge. |
| sync | revise (2 major, 4 minor) | **A 3 s stall of hiss inside "Both true. So ... you don't trust the output"**: Drama's retake check read the hiss as voice. Fixed in ShipShow (silence is now also 18 dB under the voice; D55, a test, `DRAMA_RULES` 2), so every take was voiced again under it. Also: Hopper's "nobody would touch it" lands on "nobody", the 20/80 mark on "only", the astronaut meme after "verifying", the Fort Knox meme up 1.9 s. Kept: the record scratch 0.4 s before its meme (the build forbids it over "Wait."), and the checks card on "Fixed" (round 2's pacing call). |
| pacing | fail (3 major) | The beat after "Sound familiar?" stacked to 2.7 s: now 0.9 s on top of the scene gap. **Accepted for the owner's ear**: 05b and 06 run 19 to 21% slow because of the directed delivery (the wry Dijkstra line, the double take with its 1.9 s beat); re-taking for speed would trade the delivery he praised for a number. The fast scenes (02, 07, 11b, 12, 12b, 13 at 15 to 21% over) are his pace. |

**Open at the cap, for the owner's listen:** the Dijkstra line and the double take in 06 (slow on purpose?), the 1.9 s beat
before "Yesterday's insult", and every line's delivery: all 62 takes are new since the stall fix.

## After the cap: the voice fixes, voiced again and verified

Both stall fixes (a stall of hiss inside a take, then a take that opened on 2 s of hiss: D55) changed `DRAMA_RULES`, so all 62
lines were voiced again twice. A fresh sync verifier passed the new timing; a fresh pacing verifier found the hiss lead-in, which
the second fix removed. The beat after "Sound familiar?" is now under 2 s. Rendered: `out/never-about-the-code.mp4`, 5:21,
mastered to -15.1 LUFS (held under -14 so no peak loses more than 3 dB). Credits for the description: `review/credits.txt`.

**For the owner's listen:** every take is new; "today's flex" heard back as "flicks" (Whisper or the voice?); the wry Dijkstra
line and the double take in 06; the 1.5 s beat before "Yesterday's insult".

## The owner's listen (2026-10-27): jokes are one take, and the IBM payoff

- **"Like animals." and "No. ... Also no." landed "like they were written separately."** Each was its own script line, so its own
  Drama take, voiced with no memory of the setup. Every setup and its punchline now share a line (twelve merges), with one
  direction for the arc ("[conceding, then sly, landing a deadpan punchline]", "[teasing, then deadpan]"). ShipShow's rule said
  the opposite and now says this (`narration-writing`, D55). The first merged take dropped "No." and still scored 98.8%, so
  hear-back now also finds a whole missing sentence and Drama retakes it; "each answered deadpan" paused 2.2 to 2.7 s before
  "No." on three seeds running, so a take that stalls on every seed is now kept with its fault instead of stopping the video.
- **The IBM payoff was obvious to a modern programmer** ("he understood his program, not the machine"). Now: "When it broke, he
  fixed it in Fortran. Today, that's just called programming. In 1957, it was a bet. Sound familiar?"

Voiced again under the new rules: every sentence heard, no faults. Rendered 5:26, -15.1 LUFS.

## Seventh cut (2026-10-27): an essay in sections, each with its own mood; Karpathy looked back on

**The owner's notes.** Each section needs "dedicated looks and feels" and "relevant music ... to help convey the specific
message", with fun as the priority; Karpathy's 2023 post should be framed as a look back: ChatGPT had just come out, most of us
used AI as autocomplete, and he was betting English would be the language; and this kind of video, an idea made to share in your
own voice, should be documented as its own kind.

**What changed.** `"kind": "essay"` (D62). Six moods (D61): the opening in `signal` over the lofi bed; the history (04 to 08) in
the new `archive` theme over 1950s big-band swing; now (09, 10) in `launch` with cyan over synthwave; the objection (11, 11b) in
alarm red over a suspense pulse; the workshop (12, 12b) in `buildday` over boom-bap; the close back in `signal` and the lofi.
Music: ACE-Step 1.5 (MIT), two seeds per section, each checked with Whisper (no singing) and for level. Scene 03 rewinds to
January 2023 (S33, S34) and ends on the opening's charge. Every line voiced again under DRAMA_RULES 5 (letters spelled out).

**Round 1** (fresh Sonnet critics, the full packet with its new *Moods* table):

| critic | verdict | what changed |
|---|---|---|
| accuracy | revise (1 major, 4 minor) | "suggest the next line of code" sat over a screenshot that goes on to whole methods: now "most of us use AI as fancy autocomplete", the owner's words, which the whole page supports. Minors are earlier cuts' wording, kept |
| clarity | revise (5 major, 3 minor) | The rewind's point was unsaid: the line now ends "the roasting has already started: you don't understand the code", tying 2023 to the charge. **Declined for the owner**: the four stages resting mostly on Fortran, "just agree" conceding the charge, and what "verify" proves are the argument he approved in cuts five and six |
| pacing | revise | The new beat after 03 made a 2.2 s silence: 0.9 s to 0.6 s. The fast scenes and dense cards are the earlier cuts', at the owner's speed 1.2 |
| sync | pass (7 minor) | The 2023 post now leaves on "Now it's 2026" |
| visuals | revise (4 major) | Archive grey ink darkened (`--muted` #54432d); the Copilot capture shows its whole paragraph, not a cut sentence; the thesis no longer strands "and" on its own line. Small labels elsewhere are earlier cuts', accepted then |
| consistency | pass (3 minor) | none needed |
| engagement | revise (3 major) | The OCaml receipt is up from the scene's start; the objection's red pushed harder; sounds 12 dB under the voice, not 14, so the jokes' stings are felt. Its best fit: the archive section and its swing |

**Round 2** (fresh critics; Opus for the last round's clarity, visuals and engagement):

| critic | verdict | what changed |
|---|---|---|
| accuracy | pass (3 minor) | "58 merged pull requests" had gone stale: counted again, 65 (S32). "That one line becomes eleven instructions" counts the whole function (kept, as in earlier cuts) |
| sync and pacing | pass, pass | The "way ahead of his time" stamp and its ding now arrive together on "time." (a sound on the sentence's first word reads as a glitch); the silence after 03 is 1.9 s |
| clarity | pass (3 minor) | The callback is now on screen too ("You don't understand the code." under the stamp, on a solid card); the ladder's side labels read "write less, trust more" at the top and "write it all" at the bottom, so no end reads as more trust for machine code |
| visuals | revise (1 major) | Solid panels stopped at the scene window and cut the workshop horizon with a hard line: a solid panel now fades out at its foot. Archive caption strip darker. The Copilot mark sliding across other words mid-sweep is the kit's, for every marked screenshot (noted, not fixed here) |
| engagement | revise (2 major) | About a minute with no gag (objection to workshop): a "+13,323 −0, lines to review" diff stat slams on "thirteen thousand" (S25), the review step shows its three rounds (S29), the rewind gets a VHS teal tint, and "Always has been" stays up 3.2 s. **For the owner:** opening the workshop on the bug story instead of "So here's how I actually do that eighty percent", and a dry line in his process, both change his own words about how he works |

**Round 3** (fresh Sonnet verifiers on the round-2 fixes):

| critic | verdict | what changed |
|---|---|---|
| visuals | revise (1 major) | The horizon was whole in 12 but still cut under the meme in 12b, and the rewind's tint stopped at the caption band: every panel (`.scrim`) and the VHS lines now fade out at their foot with a mask. Everything else from round 2 confirmed |
| engagement | revise (1 major) | The dry stretch is about 40 s now (258 to 309 s); what is left is the two script changes held for the owner. The diff stat is bigger, and "Fixed before it merged" gets a ding |

**Found by the builder after round 3: moods greyed the picture.** Comparing the seventh cut with the sixth, the opening's blacks
had lifted (mean luma 44 against 25) and the MP4 was 1.2 GB. A mood's overlay was a stacking context, so its grain blended with
nothing (D61, *Trap*). Fixed in `kit/base.css` with a test; luma back to 26. Every frame the critics judged in rounds 1 to 3 was a
little greyer than it renders now; nothing they found depended on it.

**At the cap, for the owner:** opening the workshop on the bug story, and a dry line in his process (engagement, rounds 2 and 3);
the four stages resting on the Fortran era, "just agree", and what "verify" proves (clarity, round 1, his argument); the scenes
that run fast at speed 1.2 (pacing, every cut).

**Round 4** (a fresh Sonnet verifier, the cap): blacks near-black again (pass), the diff stat legible (pass), but the hard line at
the caption band was still there. The render had used a stale page: the build had refused a new ding on "Fixed before it merged"
(a sentence's first word) and the command chain hid the failure. The ding is gone, the page rebuilt, the panels now fade at their
foot, and the ladder hides while the 2023 flashback is up so nothing shows through the fade. **After the cap** this was checked by
the builder's own frames (65.8, 74, 79.5, 136 and 311.5 s), not by a critic: the owner's eye is the last check.

## Eighth cut (2026-10-27): it breathes

The owner on the seventh cut: rewrite "Like animals."; Karpathy "coined the term", not "named" it; open the workshop on the bug
story with a dry line (both held from the seventh cut's engagement critic, now approved); and "we shouldn't be afraid to let
things breathe ... it feels like we're speed reading", with transitions that set the tone. So: speed 1.2 to 1.0 (the voice's own
pace; ShipShow now makes that an essay's default, D64), gap 0.35 to 0.55, tail 0.9 to 1.1, and a beat before each act (`leads`,
1.5 to 1.8 s) where the new look and music arrive alone under a title card in the act's style. Plan unchanged: `thorough`.

### Round 1 (fresh agents, Sonnet: all seven): 0 blocking, 17 major

| Critic | Verdict | Blocking / major / minor |
|---|---|---|
| accuracy | fail | 0 / 2 / 3 |
| clarity | fail | 0 / 3 / 5 |
| pacing | fail | 0 / 4 / 3 |
| sync | fail | 0 / 2 / 4 |
| consistency | fail | 0 / 1 / 5 |
| visuals | pass | 0 / 2 / 3 |
| engagement | fail | 0 / 4 / 2 |

What changed:
- **Still rushed between sentences.** Punchlines had 0.14 to 0.7 s before the next point ("Same here." 0.14 s) and the thesis was
  the fastest scene. Gap 0.55 to 0.75 (inside runs too, D51), the thesis voiced as three lines, pauses before an act change cut to
  0.3 s so the beat is the lead, not pause plus lead (engagement: "waiting more than anticipation").
- **Scenes over 40 s split at their idea boundary:** 03 at the rewind (03b-rewind, the ladder returns for "English"), 09 at the time
  horizon (09b-horizon), 12 at "That's the eighty percent" (12a-loop).
- **The hook.** "One number at a time" had no source (accuracy) and did not land (engagement). Now "They wrote machine code by hand,
  in octal. Artisanal. Small batch.", octal from Hopper's own words (S35), and the meme adds "no compiler added".
- **The bug story** said plainly (the check that listens back; a clone without a transcript refused to run), the marker on
  "transcript", stamps "cloned voice: refused" and "caught before merge".
- **Sync and look.** The archive card says "almost every time", as the voice does; the stage strip waits for Hopper; the close gets
  a kicker ("so, the answer"); the struck line is the arm64 machine words (d10043ff ...), not assembly; "pull request" on screen;
  step 5 is "I validate it myself"; the astronaut meme leaves before the PR count; card rules draw from their centre; the neon kicker
  is legible; gags on the METR rerun and the OCaml 80%.
- **Clarity, cheap ones taken:** "The roasting goes in four stages", "Take IBM's own case study from 1957", "model-written code
  passed", Karpathy's "most of his code" (so "eighty percent" means the OCaml one only).
- **Declined:** METR's three ideas (now two scenes), "Quattro" unexplained, and "a lot of code merged" without a number (the card
  gives it) are the owner's lines, kept in earlier cuts; the Backus and Dijkstra cards' reading time (the photo and the marked line
  carry them; the longer gaps add time); the lunch card's tilt (a joke beat).

### Round 2 (fresh agents, Sonnet: all seven): 0 blocking, 6 major; accuracy, consistency and visuals pass

| Critic | Verdict | Blocking / major / minor |
|---|---|---|
| accuracy | pass | 0 / 0 / 4 |
| clarity | fail | 0 / 1 / 4 |
| pacing | fail | 0 / 2 / 2 |
| sync | fail | 0 / 1 / 4 |
| consistency | pass | 0 / 0 / 5 |
| visuals | pass | 0 / 0 / 7 |
| engagement | fail | 0 / 2 / 3 |

What changed:
- **"That's the eighty percent"** pointed, by ear, at the bug story: now "Catching that is the other eighty percent" (clarity).
- **A 75 s stretch with no joke** (Fort Knox to lunch): the bug story ends dry, "My cloned voice says thanks", and the hook's
  punchline gets an "artisanal · small batch" stamp and a thump (engagement).
- **Breath.** "Same here." ran 0.14 s into the next line (no quiet point for a breath inside the take): it is its own line now.
  Scene breaks inside an act held 2.2 to 2.5 s of silence, longer than they need and stealing the act beats' contrast: those
  pauses trimmed to 0.1 to 0.6 s. The bug line and the lunch line lost a clause each (pacing).
- **Sync.** The full METR chart in one packet still was the still's capture, not the video: the render at 245.4 s and 249.0 s shows
  empty axes and then the "half the time" note, on their words. Closed. The round chips arrive on their words, the check on "left";
  the Dafoe meme leaves sooner so the error bars show; 03b's pause 0.3 to 0.6 s so the quote is read.
- **Minor, taken:** "the other 80%: review" in both places; "pull request #14369"; the archive kicker in ink; a larger caption under
  the PR #77 capture; air in the machine-word line; a swish on the close's kicker; the meme and round-chip rows in `sources.md`.
- **Declined:** 12a-loop and 13-close still read 270 to 280 syllables a minute while speaking. That is the voice's own delivery of
  the owner's method and close at speed 1.0; cutting more of his words, or slowing his clone below its pace, are his calls. 02 and
  05 (257, 259), the same. Karpathy's descriptor at 03b (the post shows his name and photo), "almost nobody can" (beat what is in
  the line before), three names in 10, the 04 card's three-line layout (each act's card is its own), step 5's large card (12b is its
  own scene), the close quote's size.

### Round 3 (fresh agents: accuracy, pacing, sync, consistency on Sonnet; clarity, visuals, engagement on Opus): 0 blocking, 7 major; accuracy, clarity, sync and consistency pass

| Critic | Verdict | Blocking / major / minor |
|---|---|---|
| accuracy | pass | 0 / 0 / 2 |
| clarity | pass | 0 / 0 / 5 |
| pacing | fail | 0 / 4 / 3 |
| sync | pass | 0 / 0 / 3 |
| consistency | pass | 0 / 0 / 3 |
| visuals | fail | 0 / 2 / 7 |
| engagement | fail | 0 / 2 / 2 |

What changed:
- **A beat between two lines** (ShipShow, D64): pacing asked for the second round running for room after particular punchlines,
  and nothing could put a pause between two lines of one scene (`gap` moves every sentence, `pauses` only a scene's end). A blank
  line in a script is now a beat (`video.json` `beat`, 0.6 s on top of the gap). Used before "You know what it does", "Same here",
  "Both true", "The model reviewing the pull request caught it", the line after the lunch joke, the astronaut meme's line, and
  between the three thesis lines.
- **The workshop thinner:** the bug line "With one check switched off, cloned voices without a transcript refused to run" (clarity);
  12a cut to "It builds it, and tests it" and "Then another model reviews the pull request, round after round"; pauses after 09 and
  12 so their last card is read.
- **Visuals:** the OCaml tag fits one line again ("a maintainer" dropped; the voice now says "a maintainer of the OCaml compiler",
  clarity); the "artisanal / small batch" stamp sits inside the frame, beside the meme; inactive stage labels in ink; "the other
  80%: review" large while it is said.
- **Engagement:** the meme no longer tells the punchline first ("octal, by hand"; the stamp lands on "batch", with its thump); the
  Fort Knox meme holds 3.4 s; the 56% card arrives on "passed" and counts up on "fifty"; the OCaml marker sweeps on "hard"; the 12
  card's kicker is "the method", so "the other eighty" is said and shown fewer times.
- **Smaller:** DHH's quote carries an ellipsis where Lex interjects (accuracy, S14 notes it); "You don't understand the code? That's
  stage three" (clarity: it was heard as "you don't understand that the code is stage three"); the round chips each on their word.
- **Declined:** 13-close as one line (setup and callback stay one take, the joke rule); 02's and 05's syllable rate (the voice's
  pace on the owner's lines; "who built Fortran" is what the next scenes lean on); "He's right" after OCaml (words the owner did not
  say); the archive screenshots' address bars and side bands, 02's and 08's empty right side while a card is still to come, and the
  chip padding (minor looks, no reading lost); Backus sepia against Dijkstra in colour (each photo as Commons has it).

### Round 4, the plan's cap (fresh agents: accuracy, pacing, sync on Sonnet; clarity, visuals, engagement on Opus; consistency passed round 3 and its ground moved only by a card's kicker): 0 blocking, 5 major; accuracy, clarity, sync and engagement pass

| Critic | Verdict | Blocking / major / minor |
|---|---|---|
| accuracy | pass | 0 / 0 / 3 |
| clarity | pass | 0 / 0 / 4 |
| pacing | fail | 0 / 4 / 3 |
| sync | pass | 0 / 0 / 4 |
| visuals | fail | 0 / 1 / 5 |
| engagement | pass | 0 / 0 / 3 |

### After the cap: fixes with no new voice, checked by the builder in the render

- **Visuals' major:** the Karpathy capture is smaller (560 px) and set lower, clear of the stage strip, with a one-line tag
  ("Karpathy, who coined vibe coding · Jan 2026") above the caption band.
- The act cards for the archive and now start with their beat (+0.0 to +0.35 s), so the sky's crossfade never shows bare grey.
- The hook's headline leaves under the meme; DHH's and antirez's quotes arrive on "hasn't" and "hand" (sync, visuals);
  "IBM grading its own homework" arrives on "grading" (engagement: it was read 4 s before it was said); "the cloned voice says
  thanks" is stamped on its line (engagement).
- Two more beats: after "Here's how I do it." and after "Same here." (pacing).
- `sources.md`: the octal meme's text, the astronaut meme as a joke on "most", the bug's engine and line.

### Left open at the cap, for the owner

- **Pacing, major, declined:** 12-verify, 12a-loop and 13-close read 260 to 280 syllables a minute while speaking, against a
  target of 210. The words are already cut once each round; what is left is how the clone reads these lines at its own pace (1.0).
  Slowing the clone below its pace, cutting more of the owner's method, or splitting the close's callback from its setup (the joke
  rule) are his calls. Everything before the workshop now measures 186 to 259.
- **Pacing, major, declined:** 10-skeptics runs 40.2 s, 0.2 s over the bar, with the three builders and "Same here"; a beat now
  separates the turn.
- **Pacing and visuals, minor, declined:** 02's and 05's rate; the roast card a little narrower than the ladder; the bullet marker
  and address bars on the archive captures; the grey edge of a light-to-dark sky crossfade, now carried by the cards (a darker
  crossfade path would be a kit change); the scratch 0.4 s before the "Wait" meme (the sound rule will not let it move later).
- **Clarity, minor, held for the owner (each would re-voice his line):** "stage four: it's the bar", "beat the optimizer" for "beat
  the machine", splitting the OCaml sentence, "don't take the output on trust".
- **Engagement, minor, declined:** the argument's turn arrives at 13.2 s, past this video's 10-second bar, because "Fair enough."
  now gets its breath; the charge itself is on screen from 0.1 s.

## Ninth cut (2026-10-27): his own register; METR out

The owner on the eighth cut: the pacing, transitions and scenes are smooth; what is left is register. "I would never say that's
the charge against AI pull requests now ... think about how YouTubers do dialogue", and "That's due diligence in 2026" should be
"this is what due diligence looks like in 2026 with agentic engineering". He also did not want METR in it (not for its numbers),
and is still lukewarm on the Fortran example. Changes: the intro talks to the viewer ("If you've been shipping code with AI,
somebody has probably told you that already. Ghostty, the terminal app, even made it a rule ..."); his due-diligence line;
"the stuff that should never happen" in 12a; METR cut entirely (the slowdown study, the time-horizon chart and its meme), so
"this layer is moving fast" now leads straight into Karpathy, DHH and antirez. ShipShow: `narration-writing` says to write an
essay in someone's own voice the way they talk to camera; his voice profile has the correction row.

### One round on what changed (the revision rule, D63): accuracy on Sonnet, engagement on Opus

| Critic | Verdict | Blocking / major / minor |
|---|---|---|
| accuracy | fail | 0 / 1 / 3 |
| engagement | fail | 0 / 1 / 3 |

- **Accuracy's major:** a `sources.md` bullet still described the METR study as shown. Rewritten as cut; S19 marked cut; the
  Ghostty descriptor sourced to its README ("Ghostty is a terminal emulator"); the `METR` respelling and the chart's CSS removed.
- **Engagement's major:** the due-diligence line dragged (a second's hesitation after "And", then about 100 words a minute) and
  read as a tagline. The owner's wording stays; "And" dropped and the line voiced again. Minors taken: "too, in the 1950s" (it said
  "back" twice), the compiler card on "compilers" and the "now" headline on "fast.", "already" dropped from 12a's last line, no
  pause after 09. Engagement passed the new intro ("it now hooks") and the "now" act without METR.

### The owner's listen of the ninth cut (2026-10-27): "Like animals." back; Dijkstra by his algorithm

- "We could have kept 'Like animals' ... Artisanal, small batch, I don't even know what the hell that means anymore." The hook
  ends "while writing machine code by hand. Like animals." again, in the new spoken intro, one take; the stamp is gone. The first
  take drawled (23.1 s for the line, 3.0 s between "Like" and "animals") and passed every check: ShipShow now catches that (D65),
  and the retake reads it in 10.3 s.
- "Calling Dijkstra the goto considered harmful guy ... everybody knows him for the Dijkstra algorithm." Now "Dijkstra, as in
  Dijkstra's algorithm" (S36), with the algorithm on his caption.
- ShipShow learned both: `narration-writing` (a punchline lands on one hearing; introduce a person by what the viewer knows them
  for) and `critic-engagement` (a punchline to decode, or a line the author would not say, is a major finding).
- No critic round: one restored line the earlier rounds reviewed, and one descriptor checked against its source.
- "We're underselling ShipShow ... it's the whole suite of skills, plugins that help the AI models build the entire video
  end-to-end." The bug story now opens "Here's a bug from ShipShow. That's my toolkit of skills and plugins that lets AI build
  this whole video, end to end." (heard back at 100%). `narration-writing`: describe the owner's own work at its full size.

## Packaged for YouTube (2026-10-27)

The owner: good enough to ship; he wants the upload folder the product videos get. `npm run package` (new, D67) wrote it to
`~/Movies/Explainers/shipshow/youtube/to-upload/never-about-the-code/`: the render, `thumbnail.html` set at 1280 by 720, and the
title, description with 11 chapters, sources, credits, tags and Studio's answers from `video.json` `"youtube"`.

One fresh critic (Opus) on the package: fix first, three blocking. The red quote beside Hopper's face read as said to her (no
source has it); "Hopper's compiler 1952" dated a 1980s photo (she is a Commodore in it); "the same way" overstated the sources.
Fixed: she is labelled by name only, the quote line became "Now it's AI's turn" (which also puts AI in the thumbnail), "pushed
back on compilers too". Major: the title repeated the thumbnail and never said AI, so it is "It Was Never About the Code: Why AI
Coding Gets Roasted"; a false alternative title struck. Minor, taken: the cadence line folded, Hopper's source credited to its
author, the vibe-coding post and the Copilot page added to the sources, every meme named, and photo credits now read "John Backus:
photo by ..." (ShipShow `creditLines` uses the caption's name, for every video).
