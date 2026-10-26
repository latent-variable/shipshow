# Sources: never-about-the-code

An opinion video, narrated by Lino Valdovinos in his own cloned voice, for his YouTube channel. The thesis is his: the
understanding that matters in software is of its behaviour, and the "you don't understand the code" criticism of AI-assisted
engineering repeats the resistance compilers met. Every fact below was read at its source on 2026-10-26 (research notes:
quotes verbatim, URLs, and what could not be verified). Lines marked **opinion** are the narrator's argument, not facts, and
are said in his voice as his view.

## Primary sources

| Id | Source | Read |
|---|---|---|
| S1 | John Backus, "The History of FORTRAN I, II, and III", HOPL 1978. softwarepreservation.org/projects/FORTRAN/paper/p25-backus.pdf | PDF text |
| S2 | John Backus, "Programming in America in the 1950s: Some Personal Impressions", 1976 talk, in Metropolis, Howlett, Rota (eds.), *A History of Computing in the Twentieth Century*, Academic Press, 1980, pp. 125-135. softwarepreservation.org/projects/FORTRAN/paper/Backus-ProgrammingInAmerica-1976.pdf | PDF text |
| S3 | Philip Schieber, "The Wit and Wisdom of Grace Hopper", OCLC Newsletter No. 167, Mar/Apr 1987, reporting her talk at Ohio State, 1987-02-05. cs.yale.edu/homes/tap/Files/hopper-wit.html | page |
| S4 | Peter Naur, "Programming as Theory Building", 1985 (scanned reprint, pages.cs.wisc.edu/~remzi/Naur.pdf) | OCR of a scan; paraphrased, not quoted on screen |
| S5 | Martin Fowler, "LLMs bring new nature of abstraction", 2025. martinfowler.com/articles/2025-nature-abstraction.html | page |
| S6 | Edsger W. Dijkstra, EWD 667, "On the foolishness of 'natural language programming'", 1978. cs.utexas.edu/~EWD/transcriptions/EWD06xx/EWD667.html | page |
| S7 | Veracode, "2025 GenAI Code Security Report" blog, 2025-09-09. veracode.com/blog/ai-generated-code-security-risks/ | page |
| S8 | METR, Becker, Rush, Barnes, Rein, "Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity", 2025-07-10. metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/ | page, which now carries the banner "These results are out of date." |
| S9 | Anthropic, "How AI assistance impacts the formation of coding skills", 2026-01-29. anthropic.com/research/AI-assistance-coding-skills | page |
| S10 | Andrej Karpathy on X, 2025-02-02 (UTC). x.com/karpathy/status/1886192184808149383 | text through the fxtwitter API |
| S11 | Andrej Karpathy on X, 2026-02-04. x.com/karpathy/status/2019137879310836075 | text through the fxtwitter API |
| S12 | Joel Spolsky, "The Law of Leaky Abstractions", 2002-11-11. joelonsoftware.com/2002/11/11/the-law-of-leaky-abstractions/ | page |

## Claims

| Scene | Claim | Source |
|---|---|---|
| 01 | People say "you don't understand the code" about AI-written code | The common criticism the video answers; S9 is the measured form of it (a quiz on code just used) |
| 01 | The worry is more than seventy years old; the "since 1952" stamp | S3: Hopper's compiler, 1952, which "nobody would touch"; S1: the skepticism "as it existed in 1954". 2026 minus 1952 is 74 |
| 01 | The three speech bubbles ("Did you even read this?", "Did an AI write this?", "Does anyone understand this?") and their places (a pull request, the comments, standup) | Illustrative, not quotes from anyone: the shapes the criticism takes |
| 02 | In 1952 Grace Hopper had a program that wrote programs, which she called a compiler | S3: "In 1952 she had an operational compiler." Her A-0 is described elsewhere as closer to a link-loader, so the script says "she called it a compiler" |
| 02 | "I had a running compiler and nobody would touch it. They told me computers could only do arithmetic." | S3, her words as reported in 1987. Shown as reported speech with "1987" on screen |
| 02 | Two years later, Backus and his team at IBM started on FORTRAN | S1: the project and its 1954 preliminary report; the late-1954 sales talks |
| 02 | Programmers did not buy it; their claims of efficient programs were disbelieved | S1: "our listeners were mostly skeptical" and "our claims that we would produce efficient object programs were disbelieved." |
| 02 | Backus later called those programmers a priesthood, "guarding skills and mysteries far too complex for ordinary mortals" | S2, section 4, "The Priesthood": "many programmers of the freewheeling 1950s began to regard themselves as members of a priesthood guarding skills and mysteries far too complex for ordinary mortals." The narration shortens it to "guarding skills too complex for ordinary mortals"; the screen quotes it exactly |
| 03 | FORTRAN shipped in 1957 | S1 (released April 1957) |
| 03 | By 1958, a survey of twenty-six IBM 704 sites found over half used it for more than half their problems | S1, citing a November 1958 report: "a survey in April [1958] of twenty-six 704 installations indicates that over half of them use FORTRAN [I] for more than half of their problems." |
| 03 | More than half the machine instructions on those machines came from the compiler | S1, same report: "more than half the machine instructions for these machines are being produced by FORTRAN." |
| 03 | The results settled it | inferred from S1: Backus held that acceptance depended on efficient output ("acceptance of our system would be in serious danger" otherwise) and that output "would startle the programmers who studied it"; then the 1958 adoption figures |
| 03 | When did you last read your compiler's machine code; nobody says you don't understand your program because of it | **opinion**, a rhetorical question. No measurement of who reads compiler output exists (searched; none found), so the video claims none |
| 04 | In 1985 Peter Naur wrote that programming is building a theory of how a program handles things in the world, and that theory matters more than the program text | S4, paraphrased: "what has to be built by the programmer is a theory of how certain affairs of the world will be handled by, or supported by, a computer program" and the theory "has primacy over such other products as program texts". Paraphrased because the text was read from OCR |
| 04 | "Wait. It was never about the code?" "Always has been." | **opinion**, the narrator's reading of S4, delivered as a meme (template: memegen `astronaut`, "Always Has Been", knowyourmeme.com/memes/wait-its-all-ohio-always-has-been) |
| 05 | Martin Fowler points out a compiler is deterministic: compile the same Fortran a hundred times and get the same bugs | S5: "When I wrote a Fortran function, I could compile it a hundred times, and the result still manifested the exact same bugs. Large Language Models introduce a non-deterministic abstraction" |
| 05 | Ask a model twice and you can get two different programs | inferred from S5 ("I can't just store my prompts in git and know that I'll get the same behavior each time") |
| 05 | In 1978 Dijkstra warned plain English makes it easy to say things whose nonsense isn't obvious | S6: "the 'naturalness' with which we use our native tongues boils down to the ease with which we can use them for making statements the nonsense of which is not obvious." |
| 05 | So you can't trust an agent the way you trust a compiler, once and for good | **opinion**, from S5 and S6 |
| 06 | In Veracode's test of eighty coding tasks, 45% of the AI-written code had a security flaw | S7: "Across 80 coding tasks spanning four programming languages and four critical vulnerability types, only 55% of AI-generated code was secure"; 45% contained flaws. A vendor's test on curated tasks: the scope is said aloud and on screen |
| 06 | In METR's 2025 study, experienced developers using AI took 19% longer and believed they had been 20% faster | S8: "when developers use AI tools, they take 19% longer than without" and "even after experiencing the slowdown, they still believed AI had sped them up by 20%." 16 experienced open-source developers, early-2025 tools: on screen |
| 06 | METR now says that result is out of date | S8's banner: "These results are out of date." |
| 06 | In a study by Anthropic, engineers who learned a new library with AI scored 17% lower on a quiz about it | S9: "participants in the AI group scored 17% lower than those who coded by hand"; 52 mostly junior engineers learning the Trio library: on screen |
| 07 | Those measure a security hole, a slower week, and trouble explaining code you just used | the narrator's summary of S7, S8, S9 ("a slower week" stands for S8's 19% longer) |
| 07 | Reading every line once does not fix that; checking what the code does every time it changes does, and so does asking why when it surprises you | **opinion**. Supporting: S9 found that participants who asked follow-up questions and sought explanations kept more of what they learned |
| 07 | Karpathy coined vibe coding by saying "forget that the code even exists" | S10: "There's a new kind of coding I call 'vibe coding', where you fully give in to the vibes, embrace exponentials, and forget that the code even exists." |
| 07 | He now calls the job agentic engineering: you orchestrate the agents and act as oversight | S11: "you are not writing the code directly 99% of the time, you are orchestrating agents who do and acting as oversight." |
| 08 | What understanding means: what it does for the user, what it must never do, and how you know (a failing test, a measured number, a watched run) | **opinion**, the narrator's thesis |
| 08 | Joel Spolsky's law of leaky abstractions: all non-trivial abstractions leak | S12: "All non-trivial abstractions, to some degree, are leaky." |
| 08 | You read the code where it leaks, the way programmers once read the assembly | **opinion**; that programmers studied compiler output at first: S1 ("would startle the programmers who studied it") |
| 09 | Ask a better question: do you understand what it does, and how do you know | **opinion** |
| 09 | ShipShow is an open source tool Lino built to explain code changes in short narrated videos; this video was made with it | this repo: `LICENSE` (MIT), `AGENTS.md` *What this is*; this folder was built and rendered by `bin/` |
| all | The voice is Lino's own, cloned from his recording by OmniVoice | `local/voices/lino.wav` (his clip, cut from his Yap recording; never committed); `"engine": "omnivoice"` in `video.json` |

## Memes

Templates come from the memegen catalog (github.com/jacebrowning/memegen, MIT); the pictures are third-party images, fetched at
build and never committed. The text on each is the narrator's joke, not a claim beyond the row it illustrates.

| Scene | Template | Text | Illustrates |
|---|---|---|---|
| 02 | `woman-cat`, Woman Yelling at a Cat | "You can't trust code you didn't write by hand!" / "*compiles anyway*" | the 1950s resistance (S1, S2, S3) |
| 03 | `drake`, Drake Hotline Bling | "Read every machine instruction" / "Check the program does its job" | the 1958 adoption (S1) |
| 04 | `astronaut`, Always Has Been | "Wait, it was never about the code?" / "Always has been" | Naur (S4) |
| 05 | `gru`, Gru's Plan | "Describe the app in English" / "The agent builds it" / "Ship it without running it" / "Ship it without running it" | the opinion closing scene 05 |
| 08 | `exit`, Left Exit 12 Off Ramp | "Read all 40,000 lines" / "Test the behavior, read where it leaks" / "Me" | Spolsky (S12) and the thesis; "40,000" is illustrative |

## Left out, and why

- The von Neumann "clerical work" line: a paraphrase recalled decades later by a student; no primary source.
- "Programmers stopped reading compiler output": no measurement exists, so the video asks a question instead of claiming it.
- METR's 2026 follow-up (developers now likely faster, but the data is "an unreliable signal"): the video says the 2025 result
  is out of date, which is what METR says; the follow-up's numbers are too uncertain to state.
- GitClear's code-churn figures: vendor, correlational; the three studies above make the point.
- Simon Willison's "I won't commit any code to my repository if I couldn't explain exactly what it does": a stricter bar than
  the thesis; left out for length, not because it disagrees less. Naur's "dead program" (a program nobody holds the theory of is
  dead while it runs) is the strongest counter and is answered by scene 08's "how do you know".
