# Review: qwen-phones-home

Plan: `thorough` (importance high: a public channel video about a security claim against a named company). Critics: accuracy,
clarity, pacing, sync, visuals, consistency, engagement, and grounding (02b shows Cohere's commands; 07c shows session log lines).
Sonnet for every round; Opus for the last round's clarity, visuals and engagement. At most three rounds, until no blocking or
objective major finding is left. The estimate before round 1: about 527k tokens a round, at most 1.7M.

## Round 1: 1 blocking, 32 major; seven of eight critics fail (consistency passes)

| Critic | Model | Verdict | Blocking / major / minor |
|---|---|---|---|
| accuracy | Sonnet | fail | 0 / 5 / 6 |
| clarity | Sonnet | fail | 0 / 7 / 3 |
| pacing | Sonnet | fail | 0 / 6 / 2 |
| sync | Sonnet | fail | 0 / 3 / 2 |
| visuals | Sonnet | fail | 1 / 4 / 2 |
| consistency | Sonnet | pass | 0 / 0 / 5 |
| engagement | Sonnet | fail | 0 / 3 / 2 |
| grounding | Sonnet | fail | 0 / 4 / 5 |

**Fixed:**
- **Accuracy and grounding.** The Redditor's line is voiced in his own words, not a paraphrase passed off as a quote; "smaller
  sibling" is gone ("another Qwen 3.8 model"); "one particular address, remembered" became "all but one of them the very same
  address" (369 of 370, counted from the study's data) and "that looks less like a guess, and more like a memory", tagged inferred;
  the kitchen line is hedged and limited to Qwen; "wonders why it visited Alibaba's server" now has Vals AI's sentence in
  `sources.md`; the Hugging Face quote is "the person who opened the thread"; Dabalam's quote is the sentence without a typo, on
  Reddit; gpt-oss is quoted as the abstract says; "Alibaba Cloud's addresses" matches the `*.aliyuncs.com` block; "in the same
  turn" is sourced. Aidan Gomez's quote is cut (known only through VentureBeat, which refuses scripted fetches); Cohere's own
  sentence ("Any guardrail that reads chain-of-thought would wave that through") carries the point. Vals AI's "could be logging"
  now comes with its next sentence ("what is sent is simply hallucinated strings"). The 24/24 result says "on a community build".
  The closing log is now four lines copied from `captures/session-requests.txt`, itself copied verbatim from the session transcript.
- **The Hacker News screenshot is on screen** for its sentence: the timeline arrives on "September".
- **Clarity.** 03 now says the sightings went to a different address, in Singapore, not the Beijing bucket; Routify gets a
  clause at first mention; the URL teardown is three parts; the glitch and the upload each get their own rate with a subject; 04
  says why `-o` forces a URL; the watch list is glossed; 04c gives denominators and sets DeepSeek apart; the verdict answers "did
  it phone home?" first and says the fossil is a best fit from outside; 06 says what the fossil does not explain (the Beijing
  upload) and that who runs the routify server is not public. The root escalation and the cheque are cut.
- **Pacing.** Two long scenes split (04a-cloud-keys, 06b-the-framing); the cheque, the root aside and half the URL teardown cut;
  the 02b code is up longer relative to its scene; in-act pauses under 2 s; leads 2.3 s.
- **Sync.** Cards on "Microsoft", "Vals", "Six", "Beijing", "never" and "machine"; the six-model roster arrives as it is named.
- **Visuals.** The fossil verdict is one word ("fits"), with its reason on a chip below; type is larger throughout (chips 44 px,
  source lines 30 px in a brighter grey, chart labels 40 px and bars 56 px); the stage sits in the window above the captions; the
  token label sits above its bar; the Vals AI and Hugging Face captures are narrower so their text is larger.
- **Engagement.** Five more memes (Ancient Aliens, They're the Same Picture, Left Exit 12, Kermit, and Roll Safe, which moves),
  a joke on the narrator itself in 04b, rows that light up as each model is named, and stamps kept for three moments.
- **Consistency.** "The cloud key address" throughout; "bucket" only for Beijing; "training setup", not "sandbox", for the lab;
  verdict colours red (ruled out) and green (fits), blue only for sources.

**Declined, with reasons:**
- Pacing's overall syllable rate: the narrator reads briskly at speed 1.0; the owner picked this voice by ear for eth-is-false
  and accepted its pace there. Words were cut where the critic named them.
- Engagement's "about one meme a minute": seven memes in about fourteen minutes. This video makes claims about named companies,
  and more jokes at their expense would cost fairness, which this video's bar ranks first.
- Grounding's sha256 sidecars for the captures: `captures/README.md` names the page and date; the critic diffed each capture
  against the live post and found them genuine.

## Round 2: 3 blocking, 22 major; seven critics rerun (all fail)

| Critic | Model | Verdict | Blocking / major / minor |
|---|---|---|---|
| accuracy | Sonnet | fail | 1 / 3 / 4 |
| clarity | Sonnet | fail | 0 / 1 / 4 |
| pacing | Sonnet | fail | 0 / 7 / 1 |
| sync | Sonnet | fail | 0 / 3 / 6 |
| visuals | Sonnet | fail | 2 / 3 / 2 |
| engagement | Sonnet | fail | 0 / 1 / 2 |
| grounding | Sonnet | fail | 0 / 1 / 1 |

**Fixed:**
- **Accuracy (blocking).** Round 1's fix said curl's `-o` is followed by a web address. It is not: `-o` takes a file name. The line
  is gone; 04-the-numbers now says Cohere's own reading (saving a download is what the task was about) and calls back to the task.
  "Alibaba's own plumbing" is now "a name Alibaba uses for its own plumbing": the shared name is the only link, and who runs the
  bucket is not public. The setup verdict says what it explains (why every model writes a URL, not which one); "three Qwen 3.8
  models" and "the two Qwen 3.7 models they checked"; "credited local users"; sources for Alibaba selling AI and for the Crow and
  plugin hosts.
- **Grounding and visuals (blocking).** The closing log is re-captured whole (50 entries, searches included) and three short lines
  of it wrap inside the frame, labelled for what the count counts; the narration says "to research this video". The 02b command
  block drops its three `echo "---"` lines as marked gaps, at 29 px in a narrower column with the chips inside the frame. The stage
  no longer double-counts the caption band, so scenes centre in their window instead of spilling to the top.
- **Clarity.** The verdict says the Beijing upload is still open; 04bb names the control as the test of suspect three; "the model
  writes out its thinking".
- **Pacing.** Three more scenes split on their turns (04-the-numbers, 04bb-the-ask, 06a-who-runs-it); in-act pauses under 2 s;
  "Huawei and robot dogs", the ID numbers and a Nemotron clause cut; the late 05b chip moves earlier.
- **Sync.** A chip on "Claude"; the Qwen rows light on "Qwen", each row's light clearing as the next is named, and the 370 bar grows
  as it is said; 06b shows the post's policy headings under the policy line; the fossil's three reasons arrive one at a time; the
  pigeon leaves on "further"; the cloud key label arrives on "server"; Roll Safe closes 07b instead of covering its first item.
- **Engagement.** New cues in each still stretch (the 4% row, "pushed back", "graded", "American models have fossils too",
  "Nobody").
- **Visuals.** The Hacker News capture is narrower so its text is larger; the Left Exit and Panik memes are larger and the chart
  behind a meme no longer shows through.

**Declined, with reasons:**
- Pacing's syllable rate (raised again with a new reason): words were cut where named; the rest is the narrator's natural pace,
  which the owner chose by ear.
- Engagement's repeated self-aware beat: kept at four, one per act it serves; the Kermit line is about the narrator's own maker,
  which the fairness bar wants said.
- Engagement's "no meme in 04c": the packet lists two there (They're the Same Picture, Left Exit 12); a misreading.

## Round 3 (the cap): 1 blocking, 18 major; seven critics, Opus for clarity, visuals and engagement (sync passes)

| Critic | Model | Verdict | Blocking / major / minor |
|---|---|---|---|
| accuracy | Sonnet | fail | 0 / 2 / 3 |
| clarity | Opus | fail | 0 / 1 / 3 |
| pacing | Sonnet | fail | 0 / 5 / 2 |
| sync | Sonnet | pass | 0 / 0 / 5 |
| visuals | Opus | fail | 1 / 3 / 4 |
| engagement | Opus | fail | 0 / 3 / 2 |
| grounding | Sonnet | fail | 0 / 2 / 2 |

**Fixed:**
- **Clarity and accuracy.** The two cut points are named: Cohere's table steps through the command early, the released script and
  the six-model control stop right where the address goes ("Stop it right before the address, and the address is the only thing
  left to write"; Qwen's 23 to 36% "came at Cohere's earlier steps, not here"); 04b says "up to one exact point"; the charts carry
  their cut. The meme no longer says "curl -o". The Vals AI quote is Qwen3.8-Max's (its example is headed so on the page). "Which a
  real signature wouldn't" and "it looks like a form", tagged inferred; the access key is glossed; Cohere's two caveats are named;
  05b gives Vals AI's guess as a guess, first; the time and IP are sourced.
- **Grounding.** The research log is re-captured as one entry per tool call (39, the loops included) and the label counts tool
  calls; the gpt-oss card quotes the abstract word for word; the token bar ends where the prefix ends; every meme is credited in
  `sources.md` and the description.
- **Visuals (blocking).** The bar percentages are dark on wide fills and sit outside narrow ones; code boxes have padding and
  28 px source labels; meme scrims are opaque; the two 880 px memes are back to 820; the fossil chip and its separators arrive with
  their reasons; the last arrow arrives with "get graded".
- **Engagement.** Daily Struggle on LocalLLaMA's own "normal, or sketchy?", Confused Gandalf on Qwen wondering about its own URLs
  (jokes about the model, not a company); chips for each still stretch; the verdict act has its own daylight-blue look; part one
  opens on the stakes.
- **Pacing.** The pizza paragraph directed unhurried; pauses after 02b, 04-the-numbers and 05b so their text is read inside the
  scene; in-act pauses trimmed; `hold` 8 s so the closing log and "Not trust. Logs." are read before the end.
- **Sync.** The 92% and 98% bars grow on "ninety", the watch-list bars on "quarter"; "only half" on "catch"; the read card on
  "training".

**Open at the cap, accepted:**
- Pacing's syllable rate (raised a third time): words were cut in every round; the rest is the narrator's natural pace, which the
  owner picked by ear for eth-is-false. His listen decides.
- Pacing's split of 07-verdict at "But here's the catch": the turn has its own picture (the Panik meme) and the fossil sentence now
  fills in reason by reason, so nothing sits still past about 8 s.
- 02b's reading queue: the commands are the receipt and the chips their plain words; the scene now ends on a 1.2 s pause.
- Hear-back lists "QEN" in 02b and 05b and 94 to 97% on number-heavy runs: Whisper spelling "Qwen" and writing numbers as digits;
  Parakeet's second listen flags nothing. Listen to 02b and 04c before publishing.

**After the cap:** a scoped accuracy and grounding check ran on the thirteen scenes changed after round 3 (below).

| Check | Model | Verdict | Blocking / major / minor |
|---|---|---|---|
| accuracy + grounding, scoped to the changed scenes | Sonnet | fail, then fixed | 1 / 0 / 2 |

**Fixed:** the 03b URL card showed four repeats of the looping signature chunk where the posted URL has three (a slip typing it
out); it now matches the post character for character, in `sources.md` too. One log entry, a Bash call that only wrote script
files, is dropped: the capture is 39 tool calls, every one a search, fetch, browser visit, curl or gh call.
**Accepted:** the sha256 sidecars (as before).

## Revision 1: the owner's notes after watching (2026-10-29)

- **"addre... ss" at 6:43, "key... s" at 6:49.** The breath between two sentences in a take went in at the dip where the last
  word's "s" began, so the silence split the word. The rule in `bin/lib.mjs` (`breathe`, DESIGN D51) now cuts only inside 30 ms or
  more of real silence, searched past the word's end far enough to clear a trailing sibilant. The narration was re-laid from the
  cached takes, nothing re-voiced: 41 inserted gaps, none with hiss or speech on both sides (before: the two he heard).
- **Memes "just as transition points", with no time to digest them.** Each of the nine now lands on the sentence that sets it up
  and holds 5 to 12 s (Gandalf went from 2 s to about 10, Roll Safe from 3 to 6), with longer pauses where one closes a scene.
- **Gandalf's text over his face.** One line, "I have no memory of this proxy", in the top box; his face is clear.
- **"One Redditor" with no name.** The quote cards carry the usernames (u/PerfectOlive1324, u/BigWheelsStephen, u/mj1003,
  u/the__storm, u/Dabalam) and the Hugging Face capture names hakanavgin; the narration is unchanged.
- **Also found.** The round-3 pauses were set after that round's voice step and missed the first final render; this re-lay has them.
- The meme timing, face and credit notes are now written into `explain-concept`, `critic-engagement`, `critic-visuals` and
  `explainer-video`, so the critics hold the next video to them.
