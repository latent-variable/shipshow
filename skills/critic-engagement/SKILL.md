---
name: critic-engagement
description: >
  Critic for whether an explainer video holds its intended viewer: a reason to keep
  watching from the first seconds, the viewer's own stakes made visible, and design
  choices that serve that persona rather than a generic audience. Load when the critic
  loop assigns you this critic.
---

# Critic: engagement

**Judges:** whether the persona in `video.json` `"audience"` would choose to keep watching,
and whether the video's design decisions are made for that person. Not whether they
understand it (`critic-clarity`) or whether a frame is well made (`critic-visuals`).

**Evidence:** `video.json` for the persona; the script in `review/packet.md` for what they
hear; the frames for what they see. Picture that one person, with their job and their
reason for pressing play, and watch it as them.

## Criteria

- **blocking:** nothing in the first ten seconds tells this viewer why it is worth their
  time: no problem they have, no change that affects them, no payoff promised.
- **major:** the video talks about the tool or the project instead of what the viewer gets
  or must do. For a release video: features listed without what each changes for them.
- **major:** a stretch of over 15 seconds where nothing new happens for this viewer: a list
  read out, a point repeated, a screen they have already understood.
- **major:** a design choice that fights the persona: code too small for a developer to
  read, jargon a newcomer will not have, a tone that talks down to an expert.
- **major:** no concrete example where one would land: an abstract claim the viewer has to
  take on trust while a real snippet, command or before and after would show it.
- **major:** a stretch of over eight seconds where nothing on screen moves or changes while
  the voice goes on (the cue table shows the gaps).
- **major:** every scene enters and moves the same way, so the video feels stamped from a
  template rather than made for its subject.
- **major:** in a video longer than about three minutes, its acts (the setup, the history, the turn, the consequences) all
  look and sound alike: one colour, one background and one music bed from start to end; or an act's look or music fights
  what it says (bouncy music under a security failure). Each act gets its own feel through
  `video.json` `moods` (DESIGN D61; the packet's *Moods* table), and a change of mood lands where the act turns. The owner, 2026-10-27, on a ten-minute
  explainer: every section felt the same.
- **major:** an act opens on a signpost ("so how does it work?", "quick refresher on X") instead of a hook: a question, a
  turn, a picture that gives a reason to keep watching. Same review.
- **major:** a concept is shown only where it works. When the viewer needs to know what failure looks like (no answer, a
  conflict, a crash) and why it matters to someone, the video shows it; growth or scale the video leans on is drawn as a
  chart, not only said. Same review, on 3-SAT and exponential growth.
- **major:** for a video meant to be fun (every essay is: it is watched by choice), a stretch of about thirty seconds with no joke, picture gag or turn.
- **minor:** motion that competes with the words: an effect on something the voice is not
  talking about, or so much movement the viewer cannot read.
- **minor:** an opening or ending that is generic (a title card, "thanks for watching")
  where the viewer's own outcome could have been.

Say who you watched as, in one line, before the findings.

**Done:** when you have watched the whole video once as that persona and said where you
would have stopped watching, if anywhere, and why.
