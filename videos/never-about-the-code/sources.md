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
| S18 | The compiler example: `int y(int m, int x, int b) { return m * x + b; }` compiled by Apple clang 21.0.0 (clang-2100.1.1.101) on this Mac, `clang -O0 -S -arch arm64` and `-O2`, directives stripped; both builds checked to return 13 for (2, 5, 3) | run 2026-10-26 |

## Claims (fourth cut, 2026-10-27: message first, evidence on screen, one thought per take)

| Scene | Claim | Source |
|---|---|---|
| 01 | "You don't understand the code" is the top comment on every AI pull request in 2026; programmers said basically the same about compilers in the 1950s | **opinion**, hyperbole and framing; the 1950s doubts are sourced in 04 and 05 |
| 02 | A processor runs tiny steps; one line becomes eleven instructions, two optimized; nobody reads them | S18; the last is **opinion**, a joke |
| 03 | The ladder; each layer means writing less and trusting more; each was roasted by the layer below | **opinion**, framing |
| 04 | "It always goes in four stages": impossible, beneath you, rots your brain, becomes the bar | **opinion**, the video's frame for the evidence in 04 to 06 |
| 04 | Stage one: Hopper had a working compiler in 1952 and nobody would touch it, because computers only do arithmetic; her team logged a real moth as a bug (logbook photo, 9 September 1947) | S3; S20 and the Commons photo (public domain, NSWC Dahlgren). S3 has Hopper telling the moth story with another machine and year; the video follows the Smithsonian and the photo |
| 05 | Stage two: programmers saw themselves as a priesthood and called automatic coding a foolish and arrogant dream | S2, section 4 (the card quotes "a priesthood" and "a foolish and arrogant dream") |
| 05 | Stage three: by 1975 Dijkstra wrote that COBOL cripples the mind and that teaching it should be a criminal offence | S5, quoted whole on the card |
| 06 | Stage four: by 1983 the joke was that real programmers use Fortran | S6 ("Real Programmers use Fortran. Quiche Eaters use Pascal."), satire |
| 06 | "Yesterday's insult, today's flex" | **opinion**, a joke |
| 07 | The haters had receipts: hand-tuned code ran faster (Mel); Unix came out a third bigger after its rewrite in C | S7 ("Mel's always ran faster", against the optimizing assembler the company sold; Mel was a hand-coder, so "haters" is the video's framing); S9 (the rewrite also added features; the narration says the rewrite) |
| 07 | Right about the cost, lost anyway; machine time is cheap, you are not | **opinion** |
| 08 | IBM's own 1957 case study ("IBM grading its own homework"): one guy learned Fortran in a day, finished a job in four hours he figured would take three days, fixed the bug in Fortran | S4 (the authors' own case history, which they say seldom gives a good measure; four hours include time in the manual) |
| 08 | He understood what his program did, not what the machine did | **opinion**, the reading of S4 |
| 09 | METR, an AI research lab, measures the longest task an agent can finish half the time, in human expert hours; early 2025 about an hour; early 2026 about twelve, wide error bars; doubling about every three months | S10, S11, S19 (human times for most long tasks are METR's estimates; the trend depends on the suite) |
| 10 | Even the doubters switched: Karpathy, from "agents just don't work" (Oct 2025) to agents writing 80% of his code (Dec 2025), in two months; the card's "not intern-level yet" paraphrases his point in S12 that agents cannot yet do an intern's job | S12, S13 |
| 10 | The Rails guy (DHH, races at Le Mans) hasn't hand written any of the code he shipped in Quattro | S14 ("I have not written any of the code that's shipped in Quattro by hand"; he says he reviewed its shape and critical lines); S23 |
| 10 | The Redis guy (Antirez) says hand coding is mostly for fun now | S15 ("for most projects, writing the code yourself is no longer sensible, if not to have fun"); the bread line is a joke |
| 11 | Agents are not deterministic: run one twice, get two programs | **opinion**, the usual objection |
| 11 | In Veracode's 2026 tests raw model code passed security checks only 56% of the time, on average, with no security guidance | S17 ("evaluated ... under standardized conditions with no security-specific prompting"; "they fail nearly 44 percent of the time when given no security-specific guidance") |
| 11, 12, 13 | Trust the tests, not the output; the method (write down what must never happen, tests that fail first, the agent makes them pass, break the code on purpose); "the list is the real work, tests only catch what's on it"; it was always about what it does and whether you can prove it | **opinion**, Lino's own method |
| 12 | The `npm test` lines on screen | an illustration, labelled as one |

## Portraits

From Wikimedia Commons through the build's licence gate (public domain, CC0, CC BY, CC BY-SA only); each credit is drawn on
the photo and listed in the review packet.

| Scene | Person | Commons file | Licence, author |
|---|---|---|---|
| 04 | Grace Hopper | File:Commodore Grace M. Hopper, USN (covered) head and shoulders crop.jpg | public domain, James S. Davis (US Navy) |
| 04 | John Backus | File:John Backus 2.jpg | CC BY-SA 4.0, PIerre.Lescanne |
| 05 | Edsger Dijkstra | File:Edsger Wybe Dijkstra.jpg | CC BY-SA 3.0, Hamilton Richards |
| 09 | Andrej Karpathy | File:Andrej Karpathy, OpenAI.png | CC BY 3.0, Gladwin Analytics |
| 09 | David Heinemeier Hansson | File:David Heinemeier Hansson Driver of Abu Dhabi Proton Racing's Porsche 911 RSR (27225732035) (cropped).jpg | CC BY 2.0, David Merrett |
| 10 | Salvatore Sanfilippo (antirez) | File:Salvatore Sanfilippo.png | CC BY 3.0, dotconferences |

## Memes

Third-party pictures and clips, fetched at build and never committed; the video relies on fair use and commentary norms,
which is the publisher's call. Animated clips come from Imgflip's GIF templates (clean MP4, no caption) and the memegen
catalog's animated templates. The text on each restates a line the narration says; none carries a claim of its own.

| Scene | Meme | Source | Text | Restates |
|---|---|---|---|---|
| 02 | Jack Black opens the book, A Minecraft Movie (2025) (clip) | i.imgflip.com/aq7zsi.mp4 (Imgflip GIF templates) | "Me, once a year" / "opening the assembly" | "When did you last read them?" |
| 04 | Odysseus tied to the mast, The Odyssey (2026 trailer) (clip, bottom 7% cropped) | i.imgflip.com/axqk4y.mp4 (Imgflip GIF templates) | "The priesthood" / "hearing about automatic programming" | the priesthood's view of automatic programming (S1, S2) |
| 05 | "No no no wait wait wait" (clip) | i.imgflip.com/6inpzl.mp4 (Imgflip GIF templates) | "1957: Fortran? No way" / "1983: real programmers use Fortran" | "Wait. Fortran?"; 1957 stands for the skepticism of S1 and S2 |
| 07 | Nanami vibing, Jujutsu Kaisen (clip) | i.imgflip.com/873a5j.mp4 (Imgflip GIF templates) | "Fortran users in 1957" / "done in 4 hours, not 3 days" | the 1957 case (S4) |
| 08 | Willem Dafoe looking up (clip, top 29% cropped) | i.imgflip.com/62yufy.mp4; knowyourmeme.com/memes/willem-dafoe-looking-up | "Me looking at" / "the time horizon chart" | the chart |
| 11 | IShowSpeed hands over face (clip, top 22% and bottom 12% cropped) | i.imgflip.com/atgx12.mp4 (Imgflip GIF templates) | "Model code" / "passing 56% of security tests" | the 56% (S17) |

## Left out, and why

- Joel Spolsky on Java schools and pointers (2005): his point was about weeding out students, not understanding; cut after round 1.
- Backus's six months that became two years: a schedule slip, not a cost of the layer; cut after round 1.

- METR's July 2025 slowdown study and Veracode's 2025 report: superseded. METR's own 2026 update says the 2025 result is out
  of date and its new data an unreliable signal because developers refused to work without AI; Veracode's 2026 edition is
  used instead.
- Company shares of AI-written code (Anthropic "90%-plus", Google 75%, OpenAI 20% to 80%): seen only secondhand.
- Ryan Dahl's "the era of humans writing code is over": the post itself could not be opened; reported wording varies.
- SWE-bench scores: no primary numbers found, and the benchmark is widely called saturated.
- The von Neumann "clerical work" story: a student's recollection decades later, no primary source.
- Simon Willison's "95% of the code I produce, I didn't type": he was never a skeptic, so it does not fit "the people who
  doubted it are switching".
- Anthropic's 2026 skills study (17% lower quiz score learning a new library with AI): about learning, not shipping; cut
  for length.
