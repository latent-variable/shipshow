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

## Claims (third cut, 2026-10-27: Fireship-style rewrite after Lino's notes on the second)

| Scene | Claim | Source |
|---|---|---|
| 01 | "You don't understand the code" is the top comment on every AI pull request in 2026 | **opinion**, hyperbole as a joke |
| 01 | Programmers said basically the same thing about compilers in the 1950s, while writing machine code by hand | **opinion** framing; what they said is in 04 (S1, S2, S3) |
| 02 | A processor runs tiny steps (load, multiply, add, store); `m * x + b` is eleven instructions, two optimized | S18 |
| 02 | Nobody has read them, nobody says you don't understand your code because of it | **opinion**, a joke |
| 03 | The ladder; each layer means writing less and trusting more, and each was roasted by the layer below; the comments on plain English are the roast | **opinion**, the video's framing; 04 to 06 give the sourced complaints |
| 04 | Hopper: Navy officer, compiler pioneer; her team once logged a real moth as a bug (on screen: the logbook photo, 9 September 1947) | S20; S3. Engineers on the Mark II, the machine she worked on, taped it in; the Smithsonian does not say she found it, and the video does not either. The photo is File:First Computer Bug, 1945.jpg (public domain, courtesy of the Naval Surface Warfare Center, Dahlgren), whose description dates it 9 September 1947 and says the operators affixed the moth. S3 has Hopper telling the story with a different machine and year; the video follows the Smithsonian and the photo |
| 04 | In 1952 she had a working compiler and nobody would touch it; they told her computers could only do arithmetic | S3, reported speech |
| 04 | Backus built Fortran; programmers saw themselves as "a priesthood"; a machine writing efficient code was "a foolish and arrogant dream" | S1, S2 (section 4); the card quotes the two phrases |
| 05 | Dijkstra, famous for calling go to harmful, wrote in 1975 that COBOL cripples the mind | S21 (his 1968 letter, its title the editor's); S5 |
| 05 | 1983: a letter in Datamation, real programmers use Fortran, quiche eaters use Pascal | S6 ("Real Programmers use Fortran. Quiche Eaters use Pascal.") |
| 05 | "Yesterday's foolish dream, today's flex": 26 years from Fortran (1957) to the letter (1983) | **opinion**, a joke; S1, S6 for the years |
| 06 | Mel, the hero of a 1983 hacker legend, refused an optimizing assembler; his hand-tuned code ran faster | S7 |
| 06 | When Unix was rewritten in C it came out about a third bigger; "quite acceptable" | S9 (the rewrite also added multiprogramming and shared reentrant code, so the growth is the rewrite's, not C's alone; the narration says the rewrite) |
| 07 | IBM's own 1957 case study ("grain of salt"): one programmer, a one-day Fortran course, a job in four hours he figured would take three days by hand; he fixed the bug in Fortran | S4 ("no tracing or memory dumps were used"; the four hours include time in the manual; the authors warn one case history "seldom gives a good measure", which the video says as grain of salt) |
| 07 | "He understood what his program did, not what the machine did" | **opinion**, the reading of S4 |
| 08 | METR times real tasks against human experts and finds the longest an agent finishes half the time; early 2025 about an hour; early 2026 roughly twelve hours, wide error bars; doubling about every three months | S10, S11, S19 (as in the second cut; the chart is unchanged). Human times for most long tasks are METR's estimates |
| 09 | "It's late 2026, and the argument is basically over" | **opinion**, the thesis |
| 09 | Karpathy coined vibe coding; in October 2025 he said agents just don't work; two months later agents wrote 80% of his code | S22; S12; S13 ("80% agent coding ... in December") |
| 09 | DHH, the Rails guy, races at Le Mans; says Opus 4.5 was the dividing line | S23; S14 |
| 09 | Antirez, who made Redis, says writing code by hand now mostly makes sense for fun | S15 ("for most projects, writing the code yourself is no longer sensible, if not to have fun"); the bread line is a joke |
| 10 | Compilers are deterministic, agents are not: run one twice, get two programs | **opinion**, the usual objection (S16 calls it a poor one; the video only states it) |
| 10 | In Veracode's 2026 report, with no security guidance, model code passed only 56% of the time, on average | S17 (an average across the models Veracode has tested) |
| 10, 11 | Don't trust the output, trust the tests; the verification method (done and never, tests that fail first, the agent makes them pass, break the code on purpose to prove the tests catch it) | **opinion**, Lino's own method |
| 12 | Nobody read the machine code either; it was never about the code, it was always about what it does and whether you can prove it | **opinion**, the close |
| 11 | The `npm test` lines on screen | an illustration, labelled as one; not a real run |

## Portraits

From Wikimedia Commons through the build's licence gate (public domain, CC0, CC BY, CC BY-SA only); each credit is drawn on
the photo and listed in the review packet.

| Scene | Person | Commons file | Licence, author |
|---|---|---|---|
| 04 | Grace Hopper | File:Commodore Grace M. Hopper, USN (covered) head and shoulders crop.jpg | public domain, James S. Davis (US Navy) |
| 04 | John Backus | File:John Backus 2.jpg | CC BY-SA 4.0, PIerre.Lescanne |
| 05 | Edsger Dijkstra | File:Edsger Wybe Dijkstra.jpg | CC BY-SA 3.0, Hamilton Richards |
| 06 | Dennis Ritchie | File:Dennis Ritchie 2011.jpg | CC BY 2.0, Denise Panyik-Dale |
| 06 | Ken Thompson | File:Ken Thompson, 2019.jpg | CC BY-SA 4.0, A.C.Diller |
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
