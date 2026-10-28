---
name: critic-visuals
description: >
  Critic for an explainer video's imagery: legibility, contrast, layout, overlap, empty or
  crowded frames, visual hierarchy, and whether every frame looks finished. Load when the
  critic loop assigns you this critic.
---

# Critic: visuals

**Judges:** each frame as a picture. Not its timing (`critic-sync`) or whether it matches the
rest of the video (`critic-consistency`).

**Evidence:** every still in `review/frames/` (start from `contact-sheet*.jpg`, then open the
full frames). They are 1920 by 1080; judge them as a viewer on a laptop would see them.

## Criteria

- **blocking:** text cut off, overlapping other text or running out of its box; a caption
  covering content; anything unreadable. Read the packet's *Overlaps* first: each row is measured, so it is blocking unless
  the scene means it, and a still can miss one that lasts a second. The captions sit in the bottom 176 px of the 1080 px frame
  (`kit/base.css`, `.caps`: 56 px up, 120 px tall); a scene's own window (`.inner`) is above them.
- **blocking:** text that fails contrast against what is behind it (WCAG AA: 4.5 to 1, or
  3 to 1 for text 24 px bold or larger).
- **major:** meme text (`.ss-meme`, white with a black outline) that cannot be read at a glance: under about 28 px on the full frame, wrapped
  into a tangle, running outside its picture, or lost against the picture behind it. The text is drawn per box by `kit/kit.js`, so a
  line cut off by its box is a defect to report, not the template's design. A meme the scene needs but whose text is blank is blocking.
- **major:** text smaller than about 28 px, which video compression blurs.
- **major:** a frame where the eye does not know where to look first, or where the thing
  being explained is not the most prominent thing.
- **major:** half the frame empty while the rest is crowded, or a frame that looks
  unfinished (placeholder, stray element, misaligned edge).
- **minor:** alignment, spacing and balance that is off but does not hurt reading.

Name the frame file for every finding.

**Done:** when every frame has been looked at once.
