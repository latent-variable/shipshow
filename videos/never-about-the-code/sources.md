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
| S18 | The compiler example: `int y(int m, int x, int b) { return m * x + b; }` compiled by Apple clang 21.0.0 (clang-2100.1.1.101) on this Mac, `clang -O0 -S -arch arm64` and `-O2`, directives stripped; both builds checked to return 13 for (2, 5, 3) | run 2026-10-26 |

## Claims

| Scene | Claim | Source |
|---|---|---|
| 01 | People say "you don't understand the code" about building with coding agents | The criticism the video answers; S16 and S17 are its 2026 forms |
| 01 | "In the 1950s, programmers heard something a lot like it about compilers" | **opinion**, the video's framing; what they actually said is in 04 (S1, S2, S3): a machine could not write efficient programs, computers could only do arithmetic |
| 02 | A processor runs simple steps (load, multiply, add, store) and a compiler writes them from a readable line | S18: the -O0 listing is loads (`ldr`), stores (`str`), `mul` and `add` |
| 02 | `m * x + b` becomes eleven instructions; optimised, two | S18: 11 lines at -O0 (four shown, "and 7 more"); `madd w0, w1, w0, w2` and `ret` at -O2 |
| 02 | "When did you last read them? Nobody tells you that you don't understand your code." | **opinion**, a question to the viewer |
| 03 | The ladder: machine code, assembly, Fortran, C, Python; each rung means writing less and trusting the layer below more; every rung met the same doubt | **opinion**, the video's framing; 04 to 06 give the sourced doubts. The screen says "the same doubt" with no quotation marks |
| 04 | In 1952 Hopper had a running compiler; "nobody would touch it"; "They told me computers could only do arithmetic" | S3: "In 1952 she had an operational compiler... 'I had a running compiler and nobody would touch it. They told me computers could only do arithmetic.'" Reported speech in the newsletter, credited as such on screen |
| 04 | Around 1954 Backus started Fortran at IBM | S1 (the 1954 preliminary report; the team formed in 1954) |
| 04 | Programmers saw themselves as "a priesthood"; a machine writing an efficient program was "a foolish and arrogant dream" | S2, section 4 "The Priesthood": "members of a priesthood guarding skills and mysteries far too complex for ordinary mortals"; "it was obviously a foolish and arrogant dream to imagine that any mechanical process could possibly perform the mysterious feats of invention required to write an efficient program." The card quotes "a foolish and arrogant dream" alone; "a priesthood" is said, not shown |
| 05 | In 1975 Dijkstra wrote that COBOL cripples the mind | S5: "The use of COBOL cripples the mind; its teaching should, therefore, be regarded as a criminal offence." |
| 05 | In 1983 a satirical letter in Datamation, a computer magazine, said real programmers use Fortran, quiche eaters use Pascal | S6: "Real Programmers use Fortran. Quiche Eaters use Pascal." (the page's own capitals, checked 2026-10-27) |
| 05 | "A generation later, it's what real programmers use" | 1957 (S1) to 1983 (S6): 26 years |
| 06 | The Story of Mel, 1983: Mel wrote raw machine code and refused an optimizing assembler; his code ran faster | S7: "Real Programmers wrote in machine code. Not FORTRAN. Not RATFOR. Not, even, assembly language."; "'You never know where it's going to put things', he explained"; "Mel's always ran faster" (against the optimizing assembler's output). A legend, called one |
| 06 | When Unix moved from assembly to C in 1973 it got about a third bigger; Ritchie and Thompson called that quite acceptable | S9: "during the summer of 1973, it was rewritten in C. The size of the new system is about one third greater than the old... we considered this increase in size quite acceptable." |
| 06 | "The skeptics were right about the cost, and they lost anyway." | **opinion**, the summary of 06 and 07 |
| 07 | "Trading machine time for programmer time was worth it" | **opinion**, the summary of 06 and 07 (the costs in 06, the time saved in 07) |
| 07 | In a 1957 case a programmer took a one-day course, wrote the job in four hours; by hand he estimated three days; he fixed the bug in his Fortran with no memory dumps | S4: "attended a one-day course on FORTRAN... He then programmed the job in 4 hours, using 47 FORTRAN statements... He studied the output (no tracing or memory dumps were used) and was able to localize his error in a FORTRAN statement he had written... He estimated that it might have taken 3 days to code this job by hand" |
| 07 | By fall 1958, at about sixty sites running IBM's 704, more than half the machine instructions came from the compiler | S1, quoting Backus's November 1958 report: "more than half the machine instructions for these machines are being produced by FORTRAN" (about 60 installations, 66 IBM 704s) |
| 08 | METR gives AI agents real tasks, times how long each takes a human expert, and finds the longest an AI finishes half the time (the 50% time horizon) | S10 |
| 08 | Early 2025, about an hour | S10: Claude 3.7 Sonnet (released February 2025), 60 minutes under TH1.1 |
| 08 | The chart: Claude 3.7 Sonnet 60 min, Claude Opus 4 101 min (1.7 h), GPT-5 214 min (3.6 h), Claude Opus 4.5 320 min (5.3 h), at release day on a linear time axis and a log hours axis | S10 (TH1.1 column), S19 |
| 08 | In early 2026, roughly twelve hours, with wide error bars (on screen: public frontier, Feb–Mar 2026, range 5 to 61 h, highly uncertain, the test near its limit) | S11, Table 1: public frontier 50% time horizon "~12h [5h-61h]", Feb–Mar 2026, published May 2026; S11 says the suite "can't reliably measure time horizons above 16 hours" and calls the estimates highly uncertain. Plotted at mid-February 2026 |
| 08 | Doubling about every three months since 2024 | S10: "doubling time since 2024... falls to 89 days under TH1.1". Said as "has been doubling", a fitted trend |
| 09 | In October 2025 Karpathy said you couldn't hand agents real work yet, because they just don't work | S12: on why you would not have agents do an intern's or employee's job today: "The reason you don't do it today is because they just don't work." |
| 09 | By December he had flipped, from 80% manual coding to 80% agent coding | S13: "I rapidly went from about 80% manual+autocomplete coding and 20% agents in November to 80% agent coding and 20% edits+touchups in December". The card says "manual + autocomplete" |
| 09 | DHH, who created Ruby on Rails, said a year before he didn't like the AI on offer; Opus 4.5 was the dividing line; he hasn't written any of the code shipped in Quattro by hand | S14: "A year ago, I did not like the mode of AI we were offered."; "Opus 4.5, to me, was the dividing line"; "I have not written any of the code that's shipped in Quattro by hand." (he says he reviewed its shape and the critical lines) |
| 10 | Antirez, who created Redis, [in January: inferred from the page's "288 days ago" on 2026-10-26] thought we had more time before programming changed completely; for most projects writing the code yourself no longer makes sense unless for fun | S15: "thought that we had more time before programming would be completely reshaped... I no longer believe this is the case."; "for most projects, writing the code yourself is no longer sensible, if not to have fun." The card quotes it exactly |
| 11 | The usual objection: a compiler gives the same output every time and an agent doesn't | **opinion**, stated as the common objection, not as Goldberg's view (S16 notes compilers are not perfectly deterministic either) |
| 11 | Goldberg argues an agent is more like a co-worker than a compiler (credited with that point only; he calls the determinism objection a poor one) | S16: "The compiler is stateless (each invocation is fully independent) and the agent is stateful."; "It is like a co-worker, or an employee." |
| 11 | In Veracode's 2026 security tests, code straight from the models, with no security guidance, passed only 56% of the time (on screen: on average). The average spans the models Veracode has tested across its snapshots, not only the 2026 leaderboard | S17: "the average security pass rate sits at 56 percent"; models "fail nearly 44 percent of the time when given no security-specific guidance". Raw models, not agents with tooling; said and shown as such |
| 11 | Run the agent twice, get two different programs, and the same tests still have to pass | **opinion**, the answer to the objection |
| 12 | Understand the behaviour: what it must never do; a test for it that fails until it is right and fails again if broken; a test only checks what you thought to ask, so drop down and read the code when surprised | **opinion**, the thesis, with an illustrative test (not a real project's) |
| 12 | Karpathy: "Don't tell it what to do, give it success criteria and watch it go." | S13, verbatim |
| 13 | "Do you understand what it does? And how do you know?" | **opinion**, the closing question |

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
