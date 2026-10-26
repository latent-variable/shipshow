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
| 01 | People say "you don't understand the code" about AI-written code | The criticism the video answers; S9 is its measured form (a quiz on code just used) |
| 01 | The three speech bubbles ("Did you even read this?", "Did an AI write this?", "Does anyone understand it?") and their places | Illustrative, not quotes from anyone: the shapes the criticism takes |
| 01 | "I think it's the same suspicion that met the first compilers, more than seventy years ago"; the "since 1952" stamp | **opinion**: the narrator equates today's criticism with the 1950s distrust of machine-written programs (S1, S2, S3: doubt that a machine could write programs, or efficient ones). 2026 minus 1952 is 74 |
| 01 | "And it asks the wrong question" | **opinion**, answered in scenes 09 to 11 |
| 02 | In 1952 Grace Hopper had a program that wrote programs, which she called a compiler | S3: "In 1952 she had an operational compiler." Her A-0 is described elsewhere as closer to a link-loader, so the script says "she called it a compiler" |
| 02 | "I had a running compiler and nobody would touch it. They told me computers could only do arithmetic." | S3, her words as reported in 1987; "her words, as reported in 1987" on screen |
| 02 | Two years later, Backus started on FORTRAN at IBM | S1: the project and its 1954 preliminary report |
| 02 | Programmers didn't believe a machine could write programs as efficient as theirs; on screen, "our claims that we would produce efficient object programs were disbelieved." | S1: "Experience with slow 'automatic programming' systems ... had convinced programmers that efficient programming was something that could not be automated" and the quote on screen, verbatim |
| 02 | Backus later called them a priesthood, "guarding skills and mysteries far too complex for ordinary mortals" | S2, section 4. The narration shortens it; the screen quotes it exactly |
| 02 | "Don't trust code you didn't write by hand. Sound familiar?" | **opinion**, the narrator's summary of S1 to S3, said as his bridge to today |
| 03 | FORTRAN shipped in 1957 and spread fast | S1 (released April 1957); "spread fast" is the adoption figures below |
| 03 | By April 1958, a survey of twenty-six IBM 704 sites found over half used it for more than half their problems | S1, citing a November 1958 report: "a survey in April [1958] of twenty-six 704 installations indicates that over half of them use FORTRAN [I] for more than half of their problems." |
| 03 | By that fall, across about sixty installations, more than half the machine instructions came from the compiler | S1: "By the fall of 1958 there were some 60 installations with about 66 704s, and '... more than half the machine instructions for these machines are being produced by FORTRAN.'" |
| 03 | When did you last read your compiler's machine code; "I've never heard anyone say you don't understand your program because of it" | **opinion**, a question and a first-person report. No measurement of who reads compiler output exists (searched; none found) |
| 04 | In 1985 Peter Naur wrote that programming is building a theory of how a program handles things in the world, and that the theory matters more than the program text | S4, paraphrased (no quotation marks on screen): "what has to be built by the programmer is a theory of how certain affairs of the world will be handled by, or supported by, a computer program" and the theory "has primacy over such other products as program texts". Paraphrased because the text was read from OCR |
| 04 | "Wait. It was never about the code? Always has been." | **opinion**, the narrator's reading of S4, delivered as a meme; scene 05 gives Naur's own warning straight after |
| 05 | Naur warned that a program nobody holds the theory of is dead, even while it runs; so somebody still has to hold the theory | S4, paraphrased ("in our words" on screen): "The death of a program happens when the programmer team possessing its theory is dissolved. A dead program may continue to be used for execution in a computer and to produce useful results." The second sentence is the narrator's conclusion |
| 06 | Martin Fowler points out a compiler is deterministic: compile the same FORTRAN a hundred times and get the same bugs | S5: "When I wrote a Fortran function, I could compile it a hundred times, and the result still manifested the exact same bugs. Large Language Models introduce a non-deterministic abstraction" |
| 06 | Ask an agent twice and you can get two different programs | inferred from S5 ("I can't just store my prompts in git and know that I'll get the same behavior each time") |
| 06 | In 1978 Dijkstra warned plain English makes it easy to say things whose nonsense isn't obvious | S6: "the 'naturalness' with which we use our native tongues boils down to the ease with which we can use them for making statements the nonsense of which is not obvious." |
| 06 | So you can check a compiler once; an agent, you check every time | inferred from S5: a deterministic translation verified once stays verified; a non-deterministic one does not |
| 07 | The studies back up the worry | the three below |
| 07 | In Veracode's test of eighty coding tasks, 45% of the AI-written code had a security flaw | S7: "Across 80 coding tasks spanning four programming languages and four critical vulnerability types, only 55% of AI-generated code was secure". A vendor's test: said on screen |
| 07 | In METR's 2025 study, experienced developers using AI took 19% longer and believed they had been 20% faster | S8: "when developers use AI tools, they take 19% longer than without" and "even after experiencing the slowdown, they still believed AI had sped them up by 20%." 16 experienced open-source developers: on screen |
| 07 | METR now says that result is out of date, so treat it as a warning | S8's banner: "These results are out of date." "Treat it as a warning" is the narrator's advice |
| 07 | In a study by Anthropic, engineers who learned a new library with AI scored 17% lower on a quiz about it | S9: "participants in the AI group scored 17% lower than those who coded by hand"; 52 mostly junior engineers: on screen |
| 08 | Those measure a security hole, slower work, and lower scores on what they had just used | the narrator's summary of S7, S8 (19% longer on their tasks), S9 (a quiz on concepts used minutes before) |
| 08 | "I'd argue reading every line once doesn't fix any of that"; checking what the code does every time it changes does; so does asking why | **opinion**, in the first person. Supporting the last part: S9 found participants who asked follow-up questions and sought explanations kept more |
| 08 | Karpathy coined vibe coding; his line was "forget that the code even exists" | S10: "There's a new kind of coding I call 'vibe coding', where you fully give in to the vibes, embrace exponentials, and forget that the code even exists." |
| 08 | A year later, his favorite name for the job is agentic engineering: you orchestrate the agents and act as oversight | S11 (2026-02-04): "personally my current favorite 'agentic engineering'" and "you are not writing the code directly 99% of the time, you are orchestrating agents who do and acting as oversight." |
| 09 | Understanding, as Naur's theory in three questions: what it does for the user, what it must never do, how you know | **opinion**, the narrator's thesis, framed on S4 |
| 09 | "A test that fails if one customer can see another's invoice" | Illustrative example of a behaviour test (the kind `videos/invoice-leak` is about) |
| 09 | That isn't free, and it won't catch everything | **opinion**, the stated limit of the thesis |
| 10 | When the behaviour surprises you, you go down a level and read the code there | **opinion** |
| 10 | Joel Spolsky's law of leaky abstractions: all non-trivial abstractions leak | S12: "All non-trivial abstractions, to some degree, are leaky." |
| 10 | The way programmers once read the assembly | S1: the compiler's output "would startle the programmers who studied it" |
| 11 | Ask a better question: do you understand what it does, and how do you know; that was the job when the compiler arrived, and it still is | **opinion**. The "1952" and "today" stamps match the hook's date (S3) |
| 11 | Made with ShipShow, github.com/latent-variable/shipshow | this repo (`LICENSE`, MIT); this folder was built and rendered by `bin/` |
| all | The voice is Lino's own, cloned from his recording by OmniVoice | `local/voices/lino.wav` (his clip, cut from his Yap recording; never committed); `"engine": "omnivoice"` in `video.json` |
| all | Music bed | ACE-Step 1.5 (MIT), made for this video on this Mac; `local/music/`, never committed |

## Memes

Templates come from the memegen catalog (github.com/jacebrowning/memegen, MIT); the pictures are third-party images, fetched at
build and never committed. The text on each restates a line the narration says; none carries a claim of its own.

| Scene | Template | Text | Restates |
|---|---|---|---|
| 02 | `pigeon`, Is This a Pigeon? | "1950s programmers" / "a compiler" / "Is this arithmetic?" | "They told her computers could only do arithmetic" (S3) |
| 03 | `drake`, Drake Hotline Bling | "Read every machine instruction" / "Check the program does its job" | the question about reading compiler output |
| 04 | `astronaut`, Always Has Been | "Wait, it was never about the code?" / "Always has been" | the narration's own lines |
| 06 | `gru`, Gru's Plan | "Describe it in English" / "Agent builds it" / "Check it once" / "Check it once?" | "you can check a compiler once; an agent, you check every time" |
| 07 | `fine`, This is Fine | "19% longer" / "I feel 20% faster" | METR's finding (S8) |
| 10 | `exit`, Left Exit 12 Off Ramp | "Read all the code" / "Test it, read where it leaks" / "Me" | "you read the code where it leaks" |

## Left out, and why

- The von Neumann "clerical work" line: a paraphrase recalled decades later by a student; no primary source.
- "Programmers stopped reading compiler output": no measurement exists, so the video asks a question instead of claiming it.
- METR's 2026 follow-up (developers now likely faster, but the data is "an unreliable signal"): the video says the 2025 result
  is out of date, which is what METR says; the follow-up's numbers are too uncertain to state.
- GitClear's code-churn figures: vendor, correlational; the three studies above make the point.
- Simon Willison's "I won't commit any code to my repository if I couldn't explain exactly what it does": a stricter bar than
  the thesis; left out for length. Naur's "dead program", the strongest counter, is in scene 05.
