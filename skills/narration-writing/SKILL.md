---
name: narration-writing
description: >
  Write a script meant to be heard: short spoken sentences, one idea per scene, numbers and
  names as they are said, pronunciation fixes for the Kokoro voice, and nothing a listener
  would have to see to follow. Load when writing or revising `script/*.txt`, or when a
  critic finds pacing, clarity or pronunciation problems in narration.
---

# Narration writing

> **Needs a clone of the ShipShow repo**, set up with `npm install` (this skill uses `bin/`, `npm run` and
> `AGENTS.md`). Outside one, say so and stop; the plugin alone ships the understanding skills
> (`code-context`, `change-context`, `evidence-standard`).

The script is read aloud once, at a fixed pace, with no rewind. A sentence that reads well
can be hard to hear. Write for the ear, then check it against the clock.

## The bar

- **One idea per scene**, in short sentences. The sentence is also the unit of timing: each
  one is voiced on its own, so a long sentence puts its cues at an estimate.
- **Write for the person's speed.** `video.json`, `local/config.json` or `--speed` sets it (1.25 by
  default, a multiplier on a base of about 160 words a minute), and `critic-pacing` judges each scene
  against about 210 syllables a minute times the speed. At 1.25 a 30 second scene holds about 90 words once the pauses between sentences and scenes are counted. The packet's rate is
  speech-only and the speed is not yours to change, so a scene that is off target is fixed with fewer or
  plainer words: digits, identifiers and long clauses read slowly; short plain sentences read at the target.
  Do not pad to slow a scene or cram to speed one up. Brisk is for a decision video someone is waiting on mid-work.
  **A video made to explain (an essay, a feature, a release) breathes**: it is read at the voice's own pace (1.0 unless
  its `video.json` says otherwise), each act opens on a wordless title card while its music and look arrive alone
  (`leads`, about 2.5 s), a blank line between thoughts is a beat, and a punchline or a turn gets a pause after it
  (`pauses`). The owner on eth-is-false's second cut, 2026-10-27: "we're moving so fast through the content that it's hard
  to follow ... we're not a speed run, we want to do the content justice." Word count follows: cut a fact before you
  cut a pause.
- **Structure is felt, never announced.** Background, setup, the problem, what it proves, why it matters: each is its own
  act, opened by its card and separated by silence, a new look and the picture. The narration never says "here's the
  setup" or "now, why does this matter" (the same note: highlight each section "through pauses and through content,
  without being explicit about it").
- **Length is set by words.** A scene `critic-pacing` calls too long holds two ideas: cut words
  or split it.
- **What is said matches what is shown**, when it is shown. Name a thing as it appears, and
  put its `data-cue` on that word. If the sentence has the word twice, say `word#2` or split
  the sentence.
- **Say what the viewer needs, not what the code says.** Do not read symbols, paths, flags or long
  identifiers aloud; say what they mean and show the literal on screen. Whatever you say that differs from a code
  name is an alias, recorded in the glossary with its literal on screen at the same cue ("the budget check"
  for `withinBudget`; where the viewer must find it, tie the two in one sentence; "the models file" is
  ambiguous when two folders each have a `routes.py`: say which). When two names sound alike (`follower_id`, `followed_id`) or one
  name covers two things, write the alias **in the script itself**, so voice, captions and cue timing
  agree, and show the literal on screen at the same cue. Captions are built from the script, so a
  caption shows the alias and the screen shows the literal: that is expected, and the critics are
  told it is not a mismatch.
- **`say` is for pronunciation only.** `video.json` `"say"` swaps a word wherever a non-word
  character borders it, so `{"models.py": "the models file"}` also turns `app/models.py` into
  `app/the models file`. It changes the voiced text but not the caption, and the cue arithmetic and
  the packet's word count use the written text. Use it for one-meaning words, never for a name that
  appears inside a path or that begins a longer phrase in the same script (`index` also rewrites
  `the index route` and `index.html`).
- **Cue early in the sentence, not on its last word**: an element cued on the word that ends a scene has
  about a second left on screen, which the packet flags as short.
- **A cue is placed on a word.** `data-cue` matches the start of a spoken word across the whole
  scene, not one sentence, so `follow` also matches `follower` and `followed`. Use `word#n` or a
  distinctive word; the build warns when a bare word occurs twice in its scene. Cue a literal on a
  word its alias contains ("posts" for `following_posts`), never on the identifier itself: it
  matches no spoken word and the build stops.
- **One name per thing, throughout** (`glossary`). Do not vary words for style.

## Who is talking, and how it is funny

**A narrator that is an AI says so, and is funny from there.** When a synthetic voice explains someone else's work (an
explainer, not an essay in a person's own voice), the narrator is the AI that made the video: it says what it is, once
("I'm an AI too. Claude, made by Anthropic"), never in the hook: the first thirty seconds belong to the problem, and the title
already says who explains it (the owner, kakeya-every-dimension, 2026-10-30: "we don't need to make it the punchline of every
intro"). Say it where it adds something, beside the question of whom to trust. Its humor comes from that vantage when it is natural: an AI explaining
another AI's work, the competition, the humans watching ("trust the checkers, not the AIs. Either of us"). Never an empty
voice that only wants to please (the owner, eth-is-false, 2026-10-28: "be self-aware ... own it").

**Funny, never cringe.** The joke is in the idea, said plainly. The owner's list of what reads as cringe, 2026-10-28, and why:
- slang worn like a costume: "cracking SAT", "a heist in three moves", "the getaway" ("like when the teacher tries to say some
  Gen Z lingo");
- labels that tell the viewer how to feel: "a very rude title";
- a metaphor used before it is set up: "card on card" before saying ETH is the bottom card of a house of cards. Say the
  analogy plainly first, then use it;
- "somebody" for a known actor: name them ("OpenAI pulled that bottom card") and the date;
- a stake nobody watching has: "does your SAT solver get faster?" Ask what the viewer feels (is encryption broken?), even
  if the answer is no, and answer it straight.

## For the ear

- Short sentences, subject first, none that needs a second hearing. A sentence that holds a
  "which", an "and then" and a parenthesis is two or three.
- Put the point first; qualifications after.
- Numbers as they are said: "version two point four", "about two hundred milliseconds",
  "three of the five". Round to what a listener can hold; the exact figure goes on screen.
- Avoid homophones and look-alikes that can mislead by ear, and long strings of nouns. Avoid
  abbreviations with a full stop ("e.g.", "i.e.", "a.k.a."): a sentence ends at a full stop and a
  space, so they split the sentence. A closing quote after a full stop blocks the split (one long take
  with estimated cues), and an ellipsis splits mid-thought.
- A pause is a comma or a sentence end. `lead`, `gap` and `tail` in `video.json` set the
  silences; do not pad text to make them.
- Do not announce structure ("in this section we will see"). Open on the point, and say why it
  matters to the viewer.

## Direction (the Drama 3 engine)

With `"engine": "drama"` the voice is directed: a stage direction in brackets at the start of a line,
`[deadpan] Like animals.`, is performed, and nothing else ever shows or says it (captions, cues, the
other engines and the packet's word counts all read the line without it; DESIGN D55). It is how a joke, an
aside or a turn of tone is heard as one instead of read flat. Write the script for the ear first, then direct it:

- **Write a direction as an actor's note**: the feeling, what is under it, and who is listening, in one breath:
  `[calm, explaining to a curious friend, unhurried]`, `[thoughtful, slowing down]`, `[measured, letting each number land]`
  (Fish Audio's guidance, 2026-10-27; a bare one-word label reads flatter). Its tone carries through the whole paragraph.
- **Direct the tone, never the timing.** A direction says how the line feels: `[dry]`, `[deadpan]`,
  `[sarcastic]`, `[amused]`, `[mock-dramatic]`, `[teasing]`, `[smug]`, `[sincere]`, `[serious]`,
  `[energetic]`, `[storyteller, with a smirk]`, `[playing devil's advocate]`. Plain words; a joke's note is longer (below).
  `[pause]`, `[long pause]` and `[slowly]` stalled the voice into seconds of silence and lost the rest of the line on
  every seed measured; `[shouting]` and a `[laughs]` did on one seed in two. Fish's own guide lists `slow`, `fast`,
  `whisper` and `emphasis` as paired tags that must be closed, which may be why a bare `[slowly]` failed; untested here,
  so leave pace to the direction's words ("unhurried", "letting it land") until it is measured. A pause is a line break, a sentence
  end, a blank line (a beat, `video.json` `beat`) or `video.json` `gap` and `pauses`.
- **In someone's own voice, write it the way they talk to camera.** Speak to the viewer, as a YouTuber does: "If you've
  been shipping code with AI, somebody has probably told you that already", never a written framing like "That's the charge
  against AI pull requests now" (the owner: "I would never say that"). Their dictation is the register to match; a line that
  reads well but that they would not say out loud is a finding (2026-10-27).
- **A punchline lands on one hearing.** Plain beats clever: "Artisanal. Small batch." replaced "Like animals." and the owner
  took the original back ("I don't even know what the hell that means"). A joke the listener has to decode is not one.
- **Describe the owner's own work at its full size**: ShipShow is "my toolkit of skills and plugins that lets AI build this
  whole video, end to end", not "the tool that voiced this video" (the owner: "that's underselling what it's actually doing").
- **A cloned voice says it is one.** When someone's clone narrates, the video owns it in the open, and a light touch works:
  "My cloned voice says thanks" (the owner liked that "we're not hiding it", 2026-10-27).
- **Introduce a person by what the viewer already knows them for**: "Dijkstra, as in Dijkstra's algorithm", not a deep cut
  like "the goto considered harmful guy" (the owner, 2026-10-27).
- **A joke is one line: setup, turn and punchline in one take.** A line hears the take before it (D83), but its direction
  is its own, so a punchline on a line of its own is performed as a new thought and lands like a separate one (the owner on
  "Like animals." and "No. ... Also no.", 2026-10-27). Keep them together and let one direction describe the arc:
  `[teasing, then deadpan] So, have you ever read them? No. And does anyone today say ...? Also no.`,
  `[conceding, then sly, landing a deadpan punchline] Fair enough. Except ... by hand. Like animals.`
- **A joke's direction says what the joke is**: who is joking, at whose expense, and the feeling under it, so the model
  plays the intent rather than a mood: `[telling a joke at my own expense: an AI grudgingly tipping its hat to a rival,
  mock-annoyed that another AI got there first]`. Tags alone (`[dry]`, `[then dry]`) left eth-is-false's self-aware jokes flat
  (the owner, 2026-10-28: "it didn't really land because of delivery"); the intent note widened the read's pitch range from 92 to
  108 Hz on the same line (D73). Describe the intent, never the line's words: a note that restated its line made the take repeat
  a sentence and drop the punchline on every try. Listen to each joke; hear-back catches a dropped line, not a flat one.
- **One direction per line, at its start.** A direction in the middle of a line lost the words after it on 5 of 6
  seeds, so the turn goes inside the opening direction ("then ...", "landing a ..."), never in brackets mid-line.
  Start a new line where the subject changes, not where the tone does.
- **Every line gets one**, even a plain one (`[matter-of-fact]`, `[clear, explaining]`), so the read changes where
  you meant it to and nowhere else. The setup is plain or warm, the turn is dry, the payoff deadpan or smug; sincerity
  is saved for the point the video exists to make.
- **Names as they are spelled.** Drama 3 knows most names; a `say` respelling with a hyphen is read as two words
  ("Dike-stra" came out "Di... kistra", D55). Respell only a name it gets wrong, as one word ("Dykstra"), and voice it to check.
- **Never respell a letter.** A variable is written as itself, "two to the n", and Drama 3 says the letter. The respelling
  `"n": "en"` was read as the letters E, N on nearly every line of eth-is-false, and the owner heard it (2026-10-27, D60);
  hear-back now retakes a take that spells out letters the script never spells.
- **A paragraph is one take.** Drama 3 splits a long take itself, about 50 words a chunk, and each chunk hears the one
  before (mlx-audio's `fish_drama3`), so a paragraph keeps one delivery; takes a line apart each started cold and sounded
  uneven (the owner: "too much inconsistency", eth-is-false, 2026-10-27). Each line now hears the take before it too (D83),
  which steadies the voice between paragraphs, but a direction still belongs to its own line. Write a scene as a few paragraphs, each one
  thought under one direction, up to 160 words (`DRAMA_LINE_MAX`), with a blank line (a beat) between them. Splitting at
  every sentence, or at every turn of tone, breaks the prosody.

Measured 2026-10-27 on a clone of the owner, one line three seeds each (D55): `[excited]` widened the pitch range
from about 2 semitones to 3.5 and quickened the read, `[deadpan]` narrowed it to about 1.5, `[whispers]` dropped
the level about 6 dB on one seed. Drama 3 drops a short last sentence now and then even with no direction, so every
take is heard back and retaken up to five times (`bin/drama.py`); one still under 97% is kept and listed, often for Whisper's spelling of a name, so listen to the ones the voice step lists.

## A narrator

Never clone, or make variants of, a real person's voice without their consent, a public presenter's included (asked for and
declined, 2026-10-27). Invent one instead: Drama 3 with no reference clip and a bracketed description,
`[bright, articulate young British tech YouTuber, curious and calm, crisp enunciation]`, several seeds read one paragraph
each, one numbered file for the person to pick from, and the picked take's unstretched clip kept as
`local/voices/<name>.wav` with its words in `<name>.txt`, **and the description it was made from in `<name>.style`**. Every
take then clones that one clip, so the voice stays the same across the video, and the voice step folds the style into every
direction (`[<style>, measured, letting it land]`): a clone copies the timbre but not the style, and without it the owner's
pick read flat and dark, "nothing like" the audition (eth-is-false, 2026-10-27; with it, the pitch swing went from 89 to
100 Hz and he chose it in a side-by-side). Audition a clone the way the video will use it before committing to it. Record who each voice is, and where it may be used, in `local/voices/VOICES.md`.

## Pronunciation

Kokoro mispronounces names and acronyms. Put the spoken form in `video.json` `"say"` and
keep the written form in captions:

```
"say": { "HyperFrames": "Hyper Frames", "MP4": "M P 4", "npm": "N P M" }
```

Agents cannot hear the voice. Hear-back (faster-whisper on each take) and the second listen (Parakeet on the
finished track, `npm run setup:listen`) catch a dropped sentence and letters spelled out that should not be, but
not a word said wrongly that a model mends from context. Give every acronym, product name and odd identifier a
spoken form up front, and read the LISTEN lines the voice step prints; when a person reports a word said wrongly,
fix it in `"say"`, and a respelling that makes it worse (as "en" for n did) comes out again.
