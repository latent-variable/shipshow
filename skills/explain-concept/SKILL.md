---
name: explain-concept
description: >
  Turn evidenced facts into a plan a viewer can follow: who the video is for and what they
  must be able to do afterwards, the one idea per scene, the order a newcomer needs, the
  analogy or example for each, what to cut, and the picture that shows each idea best.
  Load after the facts exist (`sources.md`) and before the script and scenes, for a feature,
  decision, release or essay video.
---

# Explain a concept

> **Needs a clone of the ShipShow repo**, set up with `npm install` (this skill uses `bin/`, `npm run` and
> `AGENTS.md`). Outside one, say so and stop; the plugin alone ships the understanding skills
> (`code-context`, `change-context`, `evidence-standard`).

The step between "we know the facts" and "we write the script". `code-context` says what is
true; this decides what a particular person needs of it, and in what shape. A video that
states every true thing teaches nothing. A `plan.md` in the video's folder is an optional aid; the
bars below are judged on the video itself (`critic-clarity`, `critic-engagement`). The headings and
the plan template are suggestions, not a required method.

## 1. The viewer and the outcome

The video names its viewer and what they can do after, and `video.json` `"audience"` says
the first. Two sentences you can write before anything else:

- **Who watches**: their role, what they already know, what they will not know.
- **What they can do afterwards** that they could not before: make a call, review a change,
  use the feature, change the code. If you cannot name it, the video has no point yet.

`critic-clarity` and `critic-engagement` judge against exactly these. A plan that serves
"everyone" serves nobody.

## 2. What goes in, what stays out

From `sources.md`, keep only what the outcome needs. Order the rest by what the viewer must
know first, not by how the code is laid out or how the work happened. Each cut claim goes in
`sources.md` under "left out and why" (marked as not claims), so a critic can tell an
omission from an oversight.

- One idea per scene. A scene that needs "and also" is two.
- **The first scene poses the question the viewer has, and the last scene answers it in a sentence**: the
  question in the title or the brief. A video that is true on every line and never answers it has failed. A
  claim of cause ("because", "the cause is") is `[ran]` where removing the cause changes the result, or it is
  `[inferred]` and the open question is said: a hidden false premise ("the tests passed, so each change is
  right") is a premise to test, not to repeat.
- The first scene says what the video is about and why the viewer cares. A decision video
  states the call in a sentence they could answer.
- **A worked example with concrete values comes before any general statement**, including in
  scene 1 when the framing is wrong.
- **If the code contradicts the framing** (the brief asks how a post is delivered; nothing
  delivers it), the correction is for a viewer who holds that framing; a viewer who never assumed it
  gets the real mechanism with a stake line first. Where it applies, scene 1 corrects it as a
  concrete example ("Ben posts; nothing is sent to Ana"), and the title uses the real mechanism.
  Say "the word is not in the code" when that is what the search found, not "there is no such thing":
  the concept may exist under another name (the home page is functionally the timeline). Before any
  scene says "nothing else happens", list the write path's listeners, events, signals and hooks (a post
  that is also indexed for search is still a post that is not sent to a follower), and cite each as
  `absent:`, `present:` or `present, conditional on <config>` in `sources.md`. The person is told in the plan's first line
  and in the hand-back.
- The last scene says what to do next, and makes the outcome reachable: for a feature or change
  video it names the entry points the viewer would open (a feature has a write path and a read path),
  with their literals on screen, and the video shows at least one real excerpt, the part the
  narration explained. A spoken alias (`glossary`) always has its literal on screen.
- **The scene that carries the central mechanism shows the real lines doing the work**, each cued as
  it is named, and says in a clause what each construct the viewer would need to change the code does
  (what `isouter` or `group_by` is for). A script that is true but could be written without reading the
  code teaches nothing. Say how the viewer can check the claim themselves (the test that exercises it is
  the runnable example); that may sit in the last scene.
- **State a cost or a limit** of the design, or that none was found (`sources.md` says so).
- Keep something changing on screen while the voice goes on: split a scene or add a thing worth naming
  rather than a filler cue. The packet's *Stillness* table shows each scene's longest still stretch;
  `critic-pacing` holds the limit.
- A newcomer's order often runs: the problem, the idea, one worked example, how it goes
  wrong or what it costs, then what to do.
- **Grab them in the first fifteen to thirty seconds with the problem itself** (the owner, 2026-10-30, after watching
  kakeya-every-dimension's first cut, with Veritasium, Vsauce and 3Blue1Brown as the bar). A question that sounds ridiculous
  works: put it on screen, then say why it is not, in one breath. Then walk the viewer through it by hand, the obvious try, a
  worse one, a cleverer one, so they are thinking along before the first new idea arrives. A credit, a disclosure or a date is
  not a hook.
- **Write for the smart kid with high-school math, or someone from another field.** Every term is explained the first time it
  is said, in everyday words, before it is used: a set, a dimension, a power, a logarithm, an imaginary number. People who know
  the field follow anyway; the rest are lost from the first word they never got (the same note: "four minutes in ... we start
  throwing terms that we didn't really [explain]"). Think through each kind of viewer, and let their perspective choose the
  example.
- **No leaps: every step is shown happening** (the owner, 2026-10-31, on kakeya-every-dimension's fifth cut: "you basically
  lost me when a Kakeya set had area of zero ... how did we go from almost no area to ... absolutely zero area? ... some
  leaps"). When the voice goes from one claim to a stronger one in a sentence (almost none, then exactly zero), the step between
  gets its own beat: what changes, shown moving. A process the voice describes (cut and slide, again and again) is animated
  round by round with its numbers; a test the viewer is asked to imagine (paint it with a thinner brush) is performed on screen,
  with what it measures counting as it goes. The numbers on screen come from the drawing or the source, never invented to fit.
- **A longer video is acts, and each act has its own feel.** Past about three minutes, group the scenes into acts (the
  setup, the history, the turn, the consequences) and give each a mood (`video.json` `moods`: its colours, background and
  music). Open each act on a hook, a question or a turn, never a signpost like "so how does it work". Show what failure
  looks like and why it matters to someone, not only the case that works. `critic-engagement` judges these (the owner,
  2026-10-27).
- **Compare like for like, on one picture that comes back.** When two things are compared (checking an answer against
  finding one), give both in the same unit, with numbers ("about n steps" against "two to the n tries"), on one chart, and
  bring that chart back when the result lands, so the new thing is placed in a picture the viewer already holds (the owner,
  2026-10-28: "it might just go over their head if we're not intentional about comparing apples to apples").
- **Every mechanism gets numbers and an animation of why.** Not "split into groups and multiply": sixty switches, about a
  billion billion settings; three groups of twenty, a million each; three million steps. A claim about growth is drawn as the
  growth, a translation as the thing being translated (a Sudoku's 729 switches). The owner: "you have the ability to create
  animations that help convey exactly why".
- **Explain the hard step on the example already on screen, in plain words.** The dial in eth-is-false was "too complicated to
  follow" twice while it spoke of rules as algebra and notes as weighted sums; the sixth cut keeps the sixty switches in groups of
  twenty, says a note is how many of a group's twenty switches are on, so only twenty one values, and shows the multiplication as
  a tally of three settings. The source's terms go in small type on screen, for the viewer who wants them.
- **Memes and GIFs by default, wherever one helps a viewer hold the point** (the owner, 2026-10-27: "by default we should be
  including GIFs and memes ... making light of it usually helps convey information"; of eth-is-false's three, "the meme to
  information ratio is very low"). Plan about one a minute in a video watched by choice, spread across every act (the first and
  last minutes too), at least one of them moving (`data-clip`), each tied to what the voice is saying at that moment, never
  decoration. A meme that replaces a stamp or a chip saying the same thing is better than both. A meme is the most compressed way to say one
  idea, not decoration (the owner, 2026-10-28): a recap meme (a galaxy brain of the steps) is held and walked through panel by
  panel, each with what it changed. And vary them: `npm run memes` and the packet's *Memes* table say which videos already use a
  template or a clip; a template another of the person's videos used is a finding (`critic-engagement`). It lands on the start of
  the sentence that sets it up, not on a scene's last word as a transition, and stays up about five seconds or more so the viewer can
  take it in (`pauses` when it closes a scene); its text sits clear of the face or expression the joke turns on, short enough to
  keep to its box (the owner on qwen-phones-home, 2026-10-29: Gandalf's "I have no memory" line covered his face, and memes shown
  "just as transition points" left no time to digest them). Lay it on an opaque scrim over its scene. A decision video someone is waiting on mid-work is the exception: one at
  most, if it lands.

## 3. Idea to picture

For each scene, name its idea in one sentence and choose what the viewer sees. Pick the
picture by what the idea *is*, not by what is easy to draw:

| The idea is | Show |
|---|---|
| A sequence or pipeline | Steps appearing in order, on the words that name them |
| A choice between options | Options side by side, each with its gain and its cost |
| A change | Before and after, the same thing in the same place |
| A structure or boundary | A few labelled boxes and the arrows that matter, no more |
| Behaviour of code or an API | The real input and the real output, from a captured run |
| A number or comparison | The number large, one comparison, nothing else on screen |
| Something abstract | One concrete example before the general statement |
| A place, an object or a situation no diagram shows | A generated image, our own labels on top, when it proves the point (`explainer-video`, *Scenes*) |
| A physical thing the viewer is asked to picture and watch move (a needle, a table, a brush) | That thing, generated once and animated, never a bar standing in for it (`explainer-video`, *Scenes*) |

Real code, commands and output beat a paraphrase of them, but only the lines being named:
narrow shown code to them, as whole contiguous lines with a `…` line for each gap and the file and line
numbers on screen, and cue each as it is spoken, so the voice points at the screen. Anything shown must
be in `sources.md`, copied from the pin it names, never retyped (`explainer-video`, step 1; the critic
checks it with a script).

**What the kit renders natively:** entrances on a cue (`up`, `fade`, `pop`, `left`, `right`, `grow`, `zoom`,
`blur`, `type`, `draw`, `count`, `highlight`, `stagger`, `pulse`, `scramble`, `glitch`, `slam`; `AGENTS.md`). An exit, a swap and a connector
between two boxes need a custom `<script>` in `scenes.html`; choose a picture the kit can make or plan the script.

## 4. Fit it to the format

The numbers (reading speed, scene length, text size, caption area) live in the critics that
judge them: `critic-pacing`, `critic-visuals`. Plan to them; do not copy them here. A quick
decision video is one to two minutes and three to five scenes; a feature or release video
runs as long as its idea needs.

## The plan

```
Viewer: <who, what they know>
Outcome: <what they can do afterwards>
Scenes:
  01-<name>  idea: <one sentence>   show: <picture>   evidence: <sources.md line>
  02-...
Left out: <claim> because <reason>
```

Then `narration-writing` for the script and `explainer-video` for the build. When the plan
changes the audience, tell the person before spending a render.
