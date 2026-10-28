---
name: publish
description: >
  Put a finished video on YouTube: the title, the thumbnail, the description with chapters, sources and credits, Studio's
  answers, and the upload folder `npm run package` writes; then, once it is up, the folder moved to uploaded and the link
  recorded. Load when a video's critics have passed and its owner wants it published, or to fix a published video's title,
  thumbnail or description.
---

# Publish

A video is not finished when it renders. It is finished when a stranger scrolling YouTube can see what it is, click it,
and find where every fact came from. The owner uploads; you hand over a folder he can paste from without thinking.

## What goes in `video.json` `"youtube"`

| Field | The bar |
|---|---|
| `title` | Says the topic the viewer searches for (AI coding, not just "compilers") and why it is worth a click, under 100 characters. It complements the thumbnail and never repeats it |
| `alternatives` | One or two other titles considered. Every one must be true: a false alternative gets picked later |
| `description` | Paragraphs in the author's own voice, as they talk to camera (`narration-writing`): what the video argues, what it covers, and the tool it was made with. No announcing ("In this video we will"), no cadence line to close on |
| `chapters` | `{"<scene>": "title"}` at each act's first scene. YouTube shows chapters only from 0:00, three or more, each ten seconds or longer; `npm run package` refuses anything else |
| `sources` | The primary sources a viewer would want, each with its author and link, from `sources.md`. Every fact the title or thumbnail implies is among them |
| `credits` | The voice (a clone is named as one), the music and what made it, each meme by name; the photos and captured pages come from `review/credits.txt` on their own |
| `tags`, `studio` | Tags for the topic; Studio's answers (audience, paid promotion, category, language, altered or synthetic content) |

**Altered or synthetic content is the owner's call.** The question is whether a viewer could be misled. Lino's own cloned
voice saying his own words, with the video saying so out loud, he marks *No* (2026-10-27: "it's not used in a way that's
deceiving; we're being intentional about it"). A clone of anyone else, or a voice that hides it is a clone, is *Yes*.
Write your recommendation in `studio` and let the owner decide.

## The thumbnail: `thumbnail.html`

A 1280 by 720 page beside the video, in the video's own look (its theme's fonts and colours, read from `themes/`), rendered
by `npm run package`.

- **One face or picture, and three to five big words.** It is judged at 320 by 180, the size most viewers see: anything
  smaller than about 60 px at full size does not exist.
- **It complements the title.** The title says the topic; the thumbnail says the hook. never-about-the-code's: Grace
  Hopper's photo, "Compilers got roasted too", "Now it's AI's turn".
- **Nothing on it misdates a photo or puts words in a real person's mouth.** A quote beside a face reads as that person's;
  a year under a photo reads as the photo's date. Name the person, and leave the dates to the video. (Both happened on the
  first draft of never-about-the-code's; a fresh critic caught them.)
- A real person's photo is a portrait the video already used, so its licence passed the build's gate and its credit is in
  the description.

## Make the folder, then judge it

```
npm run review -- videos/<name>        # writes review/credits.txt
npm run package -- videos/<name> --to "$HOME/Movies/Explainers/shipshow/youtube/to-upload/<name>"
```

`npm run package` (DESIGN D67) copies the render, sets the thumbnail and writes `<name>-youtube.txt`: title, alternatives,
the description with chapters, sources and credits, tags, and Studio's answers. It stops on what YouTube refuses or ignores,
and on a render older than the timing. Then **a fresh critic judges the folder** (`critic-loop`'s rule, applied to the
package): truth first (the title, thumbnail and description claim nothing the video and `sources.md` do not), then whether a
developer would click it at 320 by 180, then the author's voice, then the YouTube mechanics. Fix and repackage; one round
is usually enough.

## Once it is up

The owner uploads. Then move the folder from `to-upload/` to `uploaded/<YYYY-MM-DD> <name>/` (move, never delete), put the
link in `video.json` `"youtube"` `"url"`, and record it in the video's `REVIEW.md`. A change made in Studio afterwards (a new
title, a new thumbnail) is made in `video.json` and `thumbnail.html` in the same change, so the repo matches what is public.
