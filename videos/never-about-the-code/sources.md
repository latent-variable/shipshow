# Sources: never-about-the-code

An opinion video, narrated by Lino Valdovinos in his own cloned voice, for his YouTube channel. The thesis is his: "you don't
understand the code", said of AI coding agents, is the suspicion every earlier layer of abstraction met, from the compiler on;
those skeptics were right about the cost and lost anyway; what you need to understand is the behaviour and how you know it.
Rewritten on 2026-10-26 after Lino rejected the first cut (2025 numbers, too little history, plain look). Every fact below was
read at its source on 2026-10-26; research notes with the exact passages are in the session scratchpad. Lines marked
**opinion** are the narrator's argument, said in his voice as his view.

## Primary sources

| Id | Source | Read |
|---|---|---|
| S1 | John Backus, "The History of FORTRAN I, II, and III", HOPL 1978. softwarepreservation.org/projects/FORTRAN/paper/p25-backus.pdf | PDF text |
| S2 | John Backus, "Programming in America in the 1950s: Some Personal Impressions", 1976 talk, in Metropolis, Howlett, Rota (eds.), *A History of Computing in the Twentieth Century*, Academic Press, 1980. softwarepreservation.org/projects/FORTRAN/paper/Backus-ProgrammingInAmerica-1976.pdf | PDF text |
| S3 | Philip Schieber, "The Wit and Wisdom of Grace Hopper", OCLC Newsletter No. 167, Mar/Apr 1987. cs.yale.edu/homes/tap/Files/hopper-wit.html | page |
| S4 | J. W. Backus et al., "The FORTRAN Automatic Coding System", Western Joint Computer Conference, 1957. bitsavers.org/pdf/ibm/704/FORTRAN_paper_1957.pdf | OCR of the scan |
| S5 | Edsger W. Dijkstra, EWD 498, "How do we tell truths that might hurt?", 1975-06-18. cs.virginia.edu/~evans/cs655/readings/ewd498.html | page |
| S6 | Ed Post, "Real Programmers Don't Use Pascal", letter to Datamation, vol. 29 no. 7, July 1983. pbm.com/~lindahl/real.programmers.html | page |
| S7 | Ed Nather, "The Story of Mel", Usenet, 1983-05-21. catb.org/jargon/html/story-of-mel.html | page |
| S9 | D. M. Ritchie, K. Thompson, "The UNIX Time-Sharing System", CACM 17(7), 1974. dsf.berkeley.edu/cs262/unix.pdf (web.archive.org copy) | PDF text |
| S10 | METR, "Time Horizon 1.1", 2026-01-29. metr.org/blog/2026-1-29-time-horizon-1-1/ | page |
| S11 | METR, "Frontier Risk Report", 2026-05-19. metr.org/blog/2026-05-19-frontier-risk-report/ | page (first 100,000 characters) |
| S12 | Andrej Karpathy on Dwarkesh Patel's podcast, 2025-10-17. dwarkesh.com/p/andrej-karpathy | transcript |
| S13 | Andrej Karpathy on X, 2026-01-26. x.com/karpathy/status/2015883857489522876 | text through the fxtwitter API |
| S14 | DHH on the Lex Fridman Podcast #501. lexfridman.com/dhh-2-transcript/ | transcript |
| S15 | antirez (Salvatore Sanfilippo), "Don't fall into the anti-AI hype", antirez.com/news/158, January 2026 (the page dates it 288 days before 2026-10-26) | page |
| S16 | Yoav Goldberg, "Coding agents are not compilers from English to Programs", 2026-05-08. gist.github.com/yoavg/b2454c4dda223de94ef2818f0fdb2d24 | page |
| S17 | Veracode, "2026 GenAI Code Security Report" announcement, 2026-07-28. veracode.com/news/llms-are-getting-smarter-but-not-safer-veracode-2026-genai-code-security-report-finds-ai-generated-code-security-has-stalled-at-56%25-pass-rate/ | page |
| S19 | Release dates for the chart's x axis: Anthropic, "Claude 3.7 Sonnet" (anthropic.com/news/claude-3-7-sonnet, 2025-02-24); "Introducing Claude 4" (anthropic.com/news/claude-4, 2025-05-22); OpenAI, "Introducing GPT-5" (openai.com/index/introducing-gpt-5, 2025-08-07); Anthropic, "Introducing Claude Opus 4.5" (anthropic.com/news/claude-opus-4-5, 2025-11-24) | vendor announcements |
| S20 | Smithsonian National Museum of American History, "Log Book With Computer Bug", si.edu/object/log-book-computer-bug:nmah_334663: in 1947 engineers on the Harvard Mark II, which Hopper worked on, taped a moth into the logbook, "First actual case of bug being found" | search summary of the object record (the page refused a direct fetch) |
| S21 | Edsger W. Dijkstra, "Go To Statement Considered Harmful", letter, Communications of the ACM, March 1968 (title by editor Niklaus Wirth); en.wikipedia.org/wiki/Considered_harmful | page |
| S22 | Andrej Karpathy on X, 2025-02-02, coining "vibe coding". x.com/karpathy/status/1886192184808149383 | text through the fxtwitter API (first cut) |
| S23 | David Heinemeier Hansson, en.wikipedia.org/wiki/David_Heinemeier_Hansson: 24 Hours of Le Mans entries 2012 to 2026, GTE Am class win 2014 | page |
| S24 | Ghostty, `CONTRIBUTING.md` on main. github.com/ghostty-org/ghostty/blob/main/CONTRIBUTING.md: "**The most important rule: you must understand your code.** If you can't explain what your changes do and how they interact with the greater system without the aid of AI tools, do not contribute to this project." | page, captured 2026-10-27 |
| S25 | OCaml pull request #14369, "DWARF support for macOS and Linux", +13,323 lines, opened 2025-11-19, closed unmerged 2025-11-20 by maintainer gasche. Comment github.com/ocaml/ocaml/pull/14369#issuecomment-3556593972 (gasche, 2025-11-20) lists several criticisms, copyright first; among them "This humongous amount of code is hard to review, and very lightly tested." and "The fact that you were able to generate large amount of code that passes test is interesting, but that's only 20% of the work, the other 80% are to get the feature discussed, reviewed and integrated" | `gh api` and the page, captured 2026-10-27 |
| S26 | Andrej Karpathy on X, 2023-01-24: "The hottest new programming language is English". x.com/karpathy/status/1617979122625712128 | fxtwitter API and the X embed, captured 2026-10-27 |
| S27 | METR, "Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity", 2025-07-10. metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/: "when developers use AI tools, they take 19% longer than without—AI makes them slower." | page, captured 2026-10-27 |
| S28 | METR, "We are Changing our Developer Productivity Experiment Design", 2026-02-24. metr.org/blog/2026-02-24-uplift-update/: "we have observed a significant increase in developers choosing not to participate in the study because they do not wish to work without AI"; the new data is "an unreliable signal" | page, captured 2026-10-27 |
| S29 | ShipShow pull request #77, the last of its three automated review rounds. github.com/latent-variable/shipshow/pull/77#pullrequestreview-5662968608: "Review ledger — 2 findings · 0 open · 1 resolved · 1 declined · No blockers", "No open findings. Nothing holds the gate." | page, captured 2026-10-27 |
| S30 | Wikipedia, "COBOL": "COBOL's design was started in 1959 by CODASYL and was partly based on the programming language FLOW-MATIC, designed by Grace Hopper." | API extract, 2026-10-27 |
| S31 | (kept for the record; the line it supported was reworded in round 3) Wikipedia, "Edsger W. Dijkstra": "He received the 1972 ACM Turing Award for fundamental contributions to developing structured programming languages." | API extract, 2026-10-27 |
| S32 | ShipShow's merged pull requests: `gh pr list --state merged` on latent-variable/shipshow, 65 on 2026-10-27, counted again before the seventh cut's render (#85, this one, not counted) | run 2026-10-27 |
| S33 | OpenAI, "Introducing ChatGPT", 2022-11-30. openai.com/index/chatgpt (the page refused a direct fetch; the date agrees across en.wikipedia.org/wiki/ChatGPT and press coverage) | search, 2026-10-27 |
| S34 | GitHub, "GitHub Copilot is generally available to all developers", 2022-06-21. github.blog/2022-06-21-github-copilot-is-generally-available-to-all-developers/: "When you type code or comments, GitHub Copilot suggests the next line of code." | page, captured 2026-10-27 |
| S18 | The compiler example: `int y(int m, int x, int b) { return m * x + b; }` compiled by Apple clang 21.0.0 (clang-2100.1.1.101) on this Mac, `clang -O0 -S -arch arm64` and `-O2`, directives stripped; both builds checked to return 13 for (2, 5, 3) | run 2026-10-26 |

## Claims (sixth cut, 2026-10-27: receipts on screen, the owner's own process, no "doubters")

| Scene | Claim | Source |
|---|---|---|
| 01 | "You don't understand the code" is the charge against AI pull requests now; Ghostty, the terminal app, made it a rule: you must understand your code | S24 (screenshot, the words marked); "the charge against AI pull requests now" is **opinion**, framing |
| 01 | Programmers pushed back on compilers too, in the 1950s (on screen: "pushback, about compilers") | **opinion**, framing: the pushback itself is sourced in 04 to 05b (S3, S2, S5). No source has a 1950s programmer say "you don't understand your code", and the video does not claim one |
| 01 | "Real programmers wrote machine code by hand, one number at a time" (meme: "Real programmers, 1950s" / "machine code, one number at a time") | machine code is numbers (the ladder's first rung, 03); hand coding before Fortran, S1 and S4 ("3 days to code this job by hand"); "real programmers" is a joke borrowed from S6 (1983), which 06 calls back, **framing** |
| 02 | A processor runs tiny steps; one line becomes eleven instructions, two optimized (the card shows the first four of the eleven, then "and 7 more"); nobody reads them, and nobody today says you don't understand your code because of it; you know what it does, the part that mattered | S18; the rest is **opinion** |
| 03 | The ladder (machine code, assembly, Fortran 1957, C, Python, plain English); each layer means writing less and trusting more; each was roasted by the layer below; the roasting has already started | **opinion**, framing; Fortran's year S1 |
| 03 | Rewind to January 2023: ChatGPT is two months old (launched 2022-11-30) | S33; the post is dated 2023-01-24 (S26) |
| 03 | Most of us used AI as fancy autocomplete | S34 (what the leading coding tool said it did: "suggests the next line of code", and also whole methods and tests, still as suggestions while you type); "most of us" and "fancy autocomplete" are the narrator's account, in his words (the owner, 2026-10-27), **opinion** |
| 03 | Karpathy posted "the hottest new programming language is English"; way ahead of his time; in 2026 English is the new layer | S26 (screenshot); "ahead of his time" and "the new layer" are **opinion**, supported by scene 10 (S13: 80% agent coding by December 2025) |
| 04 | "It goes in four stages, almost every time" | **opinion**, the video's frame for the evidence in 04 to 06 |
| 04 | Stage one: Hopper had a working compiler in 1952 and nobody would touch it, because computers only do arithmetic | S3 |
| 05 | Stage two: John Backus, who built Fortran, said many programmers saw themselves as a priesthood; to them a machine writing their programs was a foolish and arrogant dream | S2, section 4 ("so many programmers of the freewheeling 1950s began to regard themselves as members of a priesthood"); S1, S4 |
| 05b | Stage three: by 1975 Dijkstra, the "goto considered harmful" guy (S21: his 1968 letter, titled by the editor), called Fortran an infantile disorder, and said COBOL cripples the mind | S5 (two screenshots of the page: "FORTRAN --"the infantile disorder"--" and "The use of COBOL cripples the mind") |
| 05b | "Its sibling COBOL, on the same layer?" COBOL is Fortran's sibling on the same layer: the high-level languages of the late 1950s | S30 (COBOL designed from 1959), S1 (Fortran, 1957); "sibling" is framing |
| 06 | Stage four: by 1983 the joke was that real programmers use Fortran; "Fortran? The infantile disorder?" calls back to S5 | S6 (satire); S5 |
| 07 | Back then a great hand coder could beat the machine: Mel's hand-tuned code ran faster than the optimizing assembler | S7 ("Mel's always ran faster"; an optimizing assembler is a program that writes machine code, the video's "the machine") |
| 07 | Today almost nobody can beat a compiler by hand; the few who can spent decades getting there; machine time is cheap, you are not | **opinion**, the owner's view; the card names Mel as the hand coder of S7 |
| 08 | IBM's own 1957 case study: one guy took a one-day Fortran course, then wrote a job in four hours that he figured would take three days by hand; when it broke he fixed it in Fortran; today that is just called programming, in 1957 it was a bet | S4 ("attended a one-day course on FORTRAN and spent some more time referring to the manual. He then programmed the job in 4 hours"; "might have taken 3 days to code this job by hand"; one case history "seldom gives a good measure", which the meme's "One Fortran user" keeps); the last two are **opinion**: Fortran was new and doubted in 1957 (S1, S2) |
| 09 | METR is the lab whose 2025 study found AI made experienced developers slower | S27 (screenshot, "AI makes them slower" marked) |
| 09 | Then they tried to run it again, and so many developers wouldn't work without AI that METR called its own new numbers unreliable | S28 (screenshot, "do not wish to work without AI" marked): the new experiment started in August 2025 and was reported in February 2026; "a significant increase in developers choosing not to participate"; "the data from our new experiment gives us an unreliable signal ... The primary reason is" that selection. METR names lower pay and time measurements as further reasons its data is unreliable |
| 09 | "This layer is moving fast" (on screen: "this layer is moving fast") | **opinion**, carried by the doubling below; the video does not compare it with earlier layers |
| 09 | METR measures the longest task an agent can finish half the time, in human expert hours; early 2025 about an hour; early 2026 about twelve hours, wide error bars; doubling about every three months | S10, S11, S19: doubling 88.6 days since 2024 (TH1.1), 105 days (FRR); Claude 3.7 Sonnet 59 min, Claude Opus 4 101 min, GPT-5 214 min, Claude Opus 4.5 320 min (TH1.1) |
| 10 | "You don't understand the code" is stage three; the work moved on to stage four | **opinion** |
| 10 | By the end of 2025, Karpathy, who coined the term vibe coding, had agents writing eighty percent of his code | S22 (coined it, February 2025); S13 (screenshot: "80% agent coding and 20% edits+touchups in December", posted 2026-01-26) |
| 10 | DHH, who made Rails, hasn't hand written any of the code he shipped in Quattro | S14; S23 |
| 10 | antirez, who made Redis, says hand coding is mostly for fun now (the card quotes him whole: "for most projects, ...") | S15 ("for most projects, writing the code yourself is no longer sensible, if not to have fun"); the bread line is a joke |
| 10 | "Same here. I'm not going to out-code the AI. My job is using it to build things that scale." | **opinion**, the owner, in his words (2026-10-27) |
| 11 | Agents are not deterministic: run one twice, get two programs | **opinion**, the usual objection |
| 11 | In Veracode's 2026 report, raw model code passed security checks only 56% of the time, on average, with no security guidance | S17 (the average across four testing snapshots and more than 100 models) |
| 11 | So you don't trust the output, you verify it | **opinion** |
| 11b | When a maintainer closed OCaml's 13,000-line AI pull request, he wrote, among other things: hard to review, and very lightly tested; code that passes tests is only 20% of the work, the other 80% is getting it discussed, reviewed and integrated | S25 (two screenshots, the words marked). Spoken as "among other things": his comment lists copyright and design first |
| 12, 12b | How the owner ships with agents ("how I actually do that eighty percent", a callback to 11b): he says what the feature has to do; the agent builds and tests it; another model reviews the pull request round after round until nothing serious is left; standing tests and checks that know the project catch what should never happen; he runs the feature himself; most of the work is reviewing, testing and verifying; he has gotten a lot of code merged this way (on screen: "ShipShow alone: 58 merged pull requests", S32) | **opinion**, the owner's own process in his words (2026-10-27). The review screenshot is S29; the checks card names ShipShow's own (`npm test`, the security gate, CI: `AGENTS.md`) |
| 12 | A bug from ShipShow, the tool that voiced this video: switch off one check, and some cloned voices stopped working; the model reviewing the pull request caught it before it merged | S29 (the ledger: "`--no-hearback` blocks clones without a transcript ... ✅ resolved"); ShipShow PR #77 added the Drama engine that voices this video |
| 12 | The reviewing model "never gets bored, and it never approves anything just to get to lunch" (card: "0 approvals just to get to lunch") | **opinion**, a joke about review fatigue; it claims nothing about any person. "Lunch" calls back 08's meme |
| 04, 09, 11, 12 | The act cards: "FILE 1952–1983 · The Skeptics · four stages, every time"; "meanwhile · 2026"; "the fair point · Objection"; "the other eighty percent · How I Ship" | 1952 is Hopper's compiler (S3), 1983 the Datamation letter (S6); the rest is **framing** |
| 13, 13b | Just agree, and show them how you verified it; nobody read the machine code either (the struck line is the first three instructions of S18); it was never about the code, it was about what it does and whether you can prove it | **opinion**; S18 |

## Portraits

From Wikimedia Commons through the build's licence gate (public domain, CC0, CC BY, CC BY-SA only). The credits go in the
video's description (`review/credits.txt`), not on the photos (ShipShow D57).

| Scene | Person | Commons file | Licence, author |
|---|---|---|---|
| 04 | Grace Hopper | File:Commodore Grace M. Hopper, USN (covered) head and shoulders crop.jpg | public domain, James S. Davis (US Navy) |
| 04 | John Backus | File:John Backus 2.jpg | CC BY-SA 4.0, PIerre.Lescanne |
| 05 | Edsger Dijkstra | File:Edsger Wybe Dijkstra.jpg | CC BY-SA 3.0, Hamilton Richards |
| 10 | David Heinemeier Hansson | File:David Heinemeier Hansson Driver of Abu Dhabi Proton Racing's Porsche 911 RSR (27225732035) (cropped).jpg | CC BY 2.0, David Merrett |
| 10 | Salvatore Sanfilippo (antirez) | File:Salvatore Sanfilippo.png | CC BY 3.0, dotconferences |

## Screenshots

Real pages, captured at build in headless Chrome (ShipShow D56) and never committed; shown as commentary, each in the
description's credits.

| Scene | Page | Words marked |
|---|---|---|
| 01 | S24, Ghostty `CONTRIBUTING.md` | "you must understand your code" |
| 03 | S26, Karpathy on X, 2023 (captured through platform.twitter.com/embed) | "is English" |
| 05b | S5, EWD 498 (two captures) | "the infantile disorder"; "The use of COBOL cripples the mind" |
| 09 | S27, S28, METR | "AI makes them slower"; "do not wish to work without AI" |
| 10 | S13, Karpathy on X, 2026 | "80% agent coding" |
| 11b | S25, OCaml #14369 (two captures of one comment) | "hard to review, and very lightly tested"; the 20% and 80% sentence |
| 12 | S29, ShipShow #77 (the ledger) | "blocks clones without a transcript" |

## Memes

Third-party pictures and clips, fetched at build and never committed; the video relies on fair use and commentary norms,
which is the publisher's call. Animated clips come from Imgflip's GIF templates (clean MP4, no caption) and the memegen
catalog's animated templates. The text on each restates a line the narration says; none carries a claim of its own.

| Scene | Meme | Source | Text | Restates |
|---|---|---|---|---|
| 01 | Typing kitty (clip) | i.imgflip.com/4bd1a0.mp4 (Imgflip GIF templates) | "Real programmers, 1950s" / "machine code, one number at a time" | "Real programmers wrote machine code by hand, one number at a time" |
| 02 | Jack Black opens the book, A Minecraft Movie (2025) (clip) | i.imgflip.com/aq7zsi.mp4 (Imgflip GIF templates) | "Me, once a year" / "opening the assembly" | "So, have you ever read them?" |
| 03 | Pedro Pascal crying (clip) | i.imgflip.com/5pzpm5.mp4 (Imgflip GIF templates) | "Every new layer" / "reading the comments" | "every one of them got roasted" |
| 05 | Odysseus tied to the mast, The Odyssey (2026 trailer) (clip, bottom 7% cropped) | i.imgflip.com/axqk4y.mp4 (Imgflip GIF templates) | "The priesthood" / "hearing about automatic coding" | the priesthood (S2) |
| 06 | "No no no wait wait wait" (clip) | i.imgflip.com/6inpzl.mp4 (Imgflip GIF templates) | "1975: Fortran, an infantile disorder" / "1983: real programmers use Fortran" | "Wait. Fortran? The infantile disorder?" (S5, S6) |
| 08 | Nanami vibing, Jujutsu Kaisen (clip) | i.imgflip.com/873a5j.mp4 (Imgflip GIF templates) | "One Fortran user, 1957" / "home before lunch" | the one case of S4 (a job of an estimated three days, written in four hours) |
| 09 | Willem Dafoe looking up (clip, top 29% cropped) | i.imgflip.com/62yufy.mp4; knowyourmeme.com/memes/willem-dafoe-looking-up | "Me looking at" / "METR's error bars" | "error bars you could park a truck in" |
| 11 | IShowSpeed hands over face (clip, top 22% and bottom 12% cropped) | i.imgflip.com/atgx12.mp4 (Imgflip GIF templates) | "Raw model code" / "Fort Knox it is not" | "not exactly Fort Knox" |

## Left out, and why

- Joel Spolsky on Java schools and pointers (2005): his point was about weeding out students, not understanding; cut after round 1.
- Backus's six months that became two years: a schedule slip, not a cost of the layer; cut after round 1.

- METR's July 2025 slowdown study as evidence about AI's effect today: its own February 2026 update calls the new data an
  unreliable signal. The video shows the 2025 study only as the setup for that update (S27, S28). Veracode's 2025 report:
  superseded by the 2026 edition.
- Company shares of AI-written code (Anthropic "90%-plus", Google 75%, OpenAI 20% to 80%): seen only secondhand.
- Ryan Dahl's "the era of humans writing code is over": the post itself could not be opened; reported wording varies.
- SWE-bench scores: no primary numbers found, and the benchmark is widely called saturated.
- The von Neumann "clerical work" story: a student's recollection decades later, no primary source.
- "Even the doubters switched" (cuts 3 to 5), with Karpathy's October 2025 podcast remark as the doubt: cut on the owner's
  word (2026-10-27). Karpathy was early and eager (S26, S22); the remark was about where agents stood that month, not a stance.
- "The haters had receipts" (Mel, the Unix rewrite as a cost): cut on the owner's word. Mel stays as what a hand coder could do
  then; the video's point is that today almost nobody beats a compiler by hand.
- A mock pull request comment ("senior-reviewer commented on PR #4021", cut 5): replaced by real pages (S24, S25).
- Simon Willison's "95% of the code I produce, I didn't type": he was never a skeptic, so it does not fit "the people who
  doubted it are switching".
- Anthropic's 2026 skills study (17% lower quiz score learning a new library with AI): about learning, not shipping; cut
  for length.
