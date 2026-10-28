---
name: critic-pacing
description: >
  Critic for an explainer video's pace: speaking rate, pauses, scene length, how long the
  screen goes without change, and whether on-screen text stays up long enough to read.
  Load when the critic loop assigns you this critic.
---

# Critic: pacing

**Judges:** time. Whether the viewer can keep up and is never left waiting. Not what is
said (`critic-clarity`) or whether a cue matches its word (`critic-sync`).

**Evidence:** `review/packet.md` measures most of this: the video's speed and the target it
sets, words a minute per scene, every pause, every cue's time and how long its text stays up
against its reading time (code is counted in identifier tokens, at a slower reading speed than
prose), the *Stillness* table, the *Sound effects* table (each sound's time, level against the voice and audible span), the longest stretch of each scene in which nothing new appears.

The person chose the speed (`video.json`, their `local/config.json`, or `--speed`), so judge
against the target it sets: about 210 syllables a minute times the speed (the packet states
it). Judge by syllables, not words: words a minute runs high on short words, so a punchy line
looks fast by words and is not by ear. A faster video is what they asked for, not a defect.

## Criteria

- **major:** a scene more than 15% off the target: dense sentences rushing it, or slack
  dragging it. The fix is fewer or plainer words, not a different speed: the speed is the
  person's choice.
- **minor:** a speed outside 0.8 to 1.6, said once, so the person knows it is unusual.
- **major:** on-screen text marked "short" in the cue table: it leaves before a viewer could
  read it while listening.
- **major:** text marked "late": reading in order, with text that lands together or soon after queued, the
  viewer cannot finish it before its scene ends. (A highlight or a line cued inside a block already shown adds
  no reading, so it is never late.)
- **major:** a pause over 2 seconds anywhere but the very end or an act change, or a screen with no change
  (no cue, no new scene) for over 12 seconds while the voice goes on. An act change (a new mood) may hold up to about
  5 seconds of voice-free time while its music and a title card carry it; one with nothing new to see or hear is a
  pause like any other.
- **major, for an essay:** it rushes. The ear gets no room after a punchline before the next point starts (under about
  0.8 s), or an act changes with its new look and music given no time alone (the build warns under 1.2 s). An essay
  that sounds like speed reading has failed, however accurate (the owner, 2026-10-27).
- **major:** a scene over 40 seconds. It almost always holds two ideas.
- **minor:** sentence gaps that feel rushed (under 0.25 s) or a scene change with no breath
  (under 0.8 s between scenes).
- **major:** sound effects crowding the voice: more than about 4 a minute, or sounds that cluster so the ear is pulled off the words (the build already refuses a run of one sound and a sound over a sentence's first word, so judge the rest in the *Sound effects* table). A sound whose level is within about 10 dB of the voice is heard rather than felt.
- **minor:** a long comedic sound (boom, sad trombone) with less pause after it than it needs to ring out, or a pause held for one that is not there.
- **minor:** total length out of proportion to what the video teaches.

**Done:** when every row of the packet's tables has been read against these numbers.
