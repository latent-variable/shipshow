# Sources: eth-is-false

An explainer for Lino's YouTube channel, narrated by Lino Valdovinos in his own cloned voice: what the Exponential Time
Hypothesis (ETH) is, how it relates to P versus NP, what OpenAI's preprint "The Exponential Time Hypothesis is False" claims,
the core idea of its algorithm, what it does and does not mean, and how far to trust it on 2026-10-27, the day after release.
Every fact below was read at its source on 2026-10-27. Lines marked **opinion** are the narrator's view, said in his voice.
Lines marked **ours** are arithmetic done for this video on a source's numbers, shown with the working.

## Primary sources

| Id | Source | Read |
|---|---|---|
| P | OpenAI, "The Exponential Time Hypothesis is False", preprint dated 17 October 2026, revised 25 October 2026, 67 pages. github.com/openai/math, `preprints/The-Exponential-Time-Hypothesis-is-False-October-25-2026/paper.pdf` at commit `7ef5c0cc5ca4b0e072b7a050fca09ab24bc6fa3a` (blob `0503566e95bc587a4076573a45132d97531b8ba6`) | PDF, pages 1 to 21, 51 to 54, 64 to 67 |
| B | OpenAI, "Working with academic communities to build scientific understanding", 2026-10-26. openai.com/index/building-scientific-understanding-with-academic-communities/ | page text, read in a browser (the site refuses scripted fetches) |
| R | github.com/openai/math `README.md` and `history.md` at the same commit | files |
| L | github.com/openai/math `lean/ComparatorChallenges/SubexponentialSAT.lean` (220 lines) and `lean/ComparatorChallenges/SubexponentialSAT.json` at the same commit; `lean/formalization.yaml` lists it with declaration `OAI.Algorithms.SubexponentialSAT.SqrtLogSpace.exact_count_and_sat`; 3,984 files under `lean/` have `SubexponentialSAT` in their path | files |
| G | William Gasarch, "Guest Column: The Third P=?NP Poll", SIGACT News Complexity Theory Column 100, 2019. cs.umd.edu/users/gasarch/papers/poll3.pdf, section 2.1 | PDF text |
| C1 | Commons, File:2012-06-15 Stephen A. Cook.jpg, orcmid, CC BY 2.0 | file page |
| C2 | Commons, File:Russell Impagliazzo at the DIMACS Workshop on Cryptography.jpg, BöhmMartin, CC BY-SA 4.0 (2016) | file page |
| C3 | Commons, File:Ryan Williams at Dagstuhl 10441.jpg, Thore Husfeldt (uploader; the description credits Alexander S. Kulikov as photographer), CC BY-SA 3.0 (2010) | file page |

No free photo of Ramamohan Paturi was found on Commons (searched "Ramamohan Paturi", 2026-10-27); he is shown by name.

## Terms (one name each, used the same in narration, captions and on screen)

| Term | Means | Not |
|---|---|---|
| switch | a Boolean variable | "variable" is used once on screen beside it |
| rule | a clause: names up to k switches, at least one must be set its way | |
| 3-SAT | rules of three switches; "SAT" for any rule size | |
| ETH | the Exponential Time Hypothesis | spoken "E T H" |
| the Strong ETH | SETH | never "Seth" aloud |
| setting | one full on/off assignment of the switches | never a value of the dial |
| the dial, T | the paper's interpolation parameter T | |
| point | a value of the dial (T = 1, 2, 3 …); "easy point", "chosen points" | never "setting" |
| shared summaries; spoken alias "note" | the paper's "shared linear summaries" / measurements; on screen "shared summaries: a short note on each group" | |
| the floor | ETH's claim that the base c in c^n stays above one; the hook's "a floor under how fast some problems could ever get" | no "speed limit" |
| c | the base of an exponential, c^n, in every scene | never b |
| the problem | the whole list of rules (a formula, in the papers); "the original problem" at T = 0 | not "formula" for the whole list |
| piece of algebra | one rule written as 1 when happy, 0 when not (the paper's clause polynomial) | "polynomial" is kept for the dial's curve, "a polynomial in T" |
| papers | the hundreds of works that assumed ETH | not "results" |

## Claims

| Scene | Claim | Source |
|---|---|---|
| 01 | OpenAI posted the paper on October 26 | B (dated 2026-10-26); R `history.md` "October 26, 2026 ... *The Exponential Time Hypothesis is False*" |
| 01 | "a very rude title" | **opinion**, a joke |
| 01 | "No human authors" | P title page names only "OpenAI"; R README: "produced by an unnamed internal OpenAI model" (a quip on that; R does not say whether people prompted or selected) |
| 01 | "Does that mean P equals NP? Does your SAT solver get faster? Stick around. The answers are weirder than the headline." | **opinion**, the video's two questions, answered in 12 and 13 |
| 01 | ETH was a floor under how fast some problems could get; hundreds of papers stood on it; if this holds, the floor is gone | **opinion**, framing; "hundreds of papers": B; the floor is ETH's c^n lower bound (05b, 06) |
| 01 | No human authors; an AI model wrote it (on screen: "an unreleased AI model") | P title page (author "OpenAI"); R README: "manuscripts ... produced by an unnamed internal OpenAI model"; "The vast majority of results were obtained with the same procedure using an unreleased internal OpenAI model". Our wording "an unreleased AI model" follows the README |
| 01 | OpenAI says a proof checker has already verified it | B: "our system has recently proved that the ETH is false, a result that was subsequently verified in Lean"; formalized October 17. Said as OpenAI's claim |
| 01 | The group set up to check it is led by two of the three who proposed the hypothesis (screen: "to be checked by a group led by two of its proposers") | B: group led by Impagliazzo, Paturi and Williams; "Impagliazzo and Paturi, along with Francis Zane, are the original proposers"; "This work will be verified and shepherded by a group" |
| 01 | "this is huge" | **opinion** |
| 02 | Switches and rules; each rule names three switches, at least one set its way; find a setting that satisfies every rule: 3-SAT | P section 1, (1.1): a k-CNF is an AND of clauses, each an OR of k literals; 3-SAT is k = 3. The switch-and-rule picture is ours |
| 02 | Checking is easy; finding one seems hard (nobody knows a fast way, 04); with n switches there are 2^n settings | P (2.2) sums over x ∈ {0,1}^n; evaluating a clause on a setting is direct |
| 02 | On screen: "in the papers: variables", "clauses · each needs at least one" | P section 1 and 2.1: Boolean variables, clauses; a clause is an OR of literals |
| 03 | 2^10 = 1,024; 2^50 ≈ 1.13 × 10^15 (a quadrillion); 2^300 has 91 digits | **ours**: 300 × log10 2 = 90.3, so 91 digits |
| 03 | "No computer is getting through that list" | **opinion**, a figure of speech |
| 04 | P: solvable in polynomial time; NP: an answer can be checked in polynomial time | standard definitions; P section 1 calls k-SAT "the canonical NP-complete problem" |
| 04 | In 1971 Stephen Cook showed SAT is NP-complete, the hardest of that whole bunch | P [Coo71]: S. Cook, "The Complexity of Theorem-Proving Procedures", STOC 1971; P section 1 |
| 04 | In a 2019 poll of researchers, 88% said P is not NP; nobody has proved it either way | G, section 2.1 table: 2019, P≠NP 109 (88%), P=NP 15 (12%). "Researchers": G polled theorists and others. Open: B calls P vs NP open by implication; the paper does not claim it |
| 05 | P ≠ NP says only that SAT has no polynomial-time algorithm | definition |
| 05 | Between polynomial and exponential is a middle ground; 2^√n is slower than any polynomial and faster than any exponential c^n with c > 1, even 1.001^n | standard asymptotics (√n = o(n)); ETH allows 1.307^n, it rules out only the subexponential middle |
| 05b | Impagliazzo, Paturi and Zane made the bet, in 2001; it says 3-SAT needs 2^(Ω(n)) time, some number bigger than one raised to the n | P section 1.1.1: "The Exponential Time Hypothesis (ETH) asserted that 3-SAT requires 2^Ω(n) deterministic time in the worst case" [IP01]: R. Impagliazzo, R. Paturi, "On the Complexity of k-SAT", JCSS 62(2), 2001; P abstract. B names Zane as a third proposer (with [IPZ01]); the screen names both 2001 papers ([IP01]; [IPZ01] Impagliazzo, Paturi, Zane, "Which Problems Have Strongly Exponential Complexity?", JCSS 63(4), 2001). No free photo of Zane or Paturi was found on Commons |
| 06 | Twenty five years: 2001 to 2026 | **ours** |
| 06 | Schöning 1999: about 1.33^n (exactly (4/3)^n) for 3-SAT, randomized; all three record bars are randomized algorithms and say so on screen (ETH is stated for deterministic time; the paper gives Liu's deterministic 1.32793^n [Liu18], not charted) | P section 1.1.1: "(n+m)^O(1)(4/3)^n time for 3-SAT" [Sch99], FOCS 1999 |
| 06 | Then 1.308^n | P: "for 3-SAT this gave a randomized O(1.308^n) bound [Her14]" (Hertli, SICOMP 2014, FOCS 2011) |
| 06 | This year, a preprint: 1.307^n | P: "a preprint by Jiang and Cai gives a randomized O*(1.307031578^n) bound [JC26]" (arXiv 2607.10697, 2026) |
| 06 | ETH says there is a floor: some base above one no algorithm beats | P section 1.1.1, restated: 2^Ω(n) means time at least c^n for some fixed c > 1 |
| 07 | ETH has been used in hundreds of papers to derive conditional hardness, across graph theory, computational biology, databases, computational geometry | B: "used in hundreds of papers to derive conditional computational hardness results across a wide variety of fields including graph theory, computational biology, databases, computational geometry, and more" |
| 07 | The Strong ETH: as rules get longer, you basically can't beat trying everything | P section 1.1.1: SETH "made the sharper prediction that k-SAT requires 2^(n(1−o_k(1))) time as k grows" [IP01, IPZ01]; on screen "longer rules: almost no escape from trying everything" |
| 07 | On-screen paper slips ("… cannot be solved faster, unless ETH is false" and two more) | illustrative, labelled "typical phrasing, not quotes" on screen |
| 07 | Take edit distance; the Strong ETH was the best-known reason to say edit distance cannot be computed in strongly subquadratic time (unless the Strong ETH is false) | P section 1.1.1 (SETH); section 1.1.3: SETH "used to rule out polynomial-factor speedups over quadratic running times for edit distance [BI18]"; [BI18] Backurs, Indyk, "Edit Distance Cannot Be Computed in Strongly Subquadratic Time (unless SETH is false)", SICOMP 2018, conference version STOC 2015 (P references). "The textbook dynamic programming problem" is our description of edit distance |
| 07, 15 | "For a quarter century, unless ETH is false is where most arguments stopped" | **opinion**, framing (a conditional result's usual last word, not a claim that experts stopped asking) |
| 08 | A deterministic algorithm, polynomial space, for SAT with any fixed rule size (k-CNF, k ≥ 2), exactly counting satisfying assignments in (n+m)^O(1) 2^O(n log log n / √log n); 2^O(n/√log n) when m ≤ Dn | P abstract and Theorem 1.1. Spoken "about two to the n over the square root of log n"; the screen shows Theorem 1.1's bound |
| 08 | Any base above one, c^n, is 2 to some constant times n (c^n = 2^(n log2 c)); this exponent grows slower than any constant times n, so eventually it gets under every one; whatever base above one ETH demands, it eventually gets under it; ETH is refuted, if the proof holds (said "if it's right") | P abstract: "Our algorithm refutes the Exponential Time Hypothesis"; 2^o(n) by definition |
| 08 | It counts exactly; counting (#SAT) is #P-complete, harder than deciding | P section 1.1.2: "#SAT and #3-SAT are #P-complete" [Val79]; "Testing #F > 0 also decides satisfiability" |
| 08b | If it holds, it refutes ETH, the Strong ETH and a few relatives (on screen: Gap-ETH, NSETH, #ETH) | P section 1.1.1: "Theorem 1.1 refutes ETH, SETH, Gap-ETH, and NSETH" and the randomized versions; 1.1.2: refutes #ETH |
| 09 | Each rule becomes a little piece of algebra (the paper's clause polynomial Φe) that is 1 when satisfied and 0 otherwise; the count is the sum over all settings of their product; still 2^n terms | P section 2.2, Φe and (2.2): "evaluating its 2^n summands would be exhaustive search" |
| 09 | If the switches split into groups with no rule crossing, count each group and multiply: at most r · 2^(2n/r) work | P section 2.2: "#F = ∏ N_g"; "examines a total of at most Σ 2^|S_g| ≤ r 2^(2n/r) local assignments"; "a hypothetical, very restrictive assumption" |
| 10 | A dial T that slides from the problem you want (T = 0) to problems you can count (T = 1..Q); at T = 0 the replacements restore the original | P section 2.3: "We introduce a parameter T. At T = 0, the replacements must restore the original clause inputs"; H(0) = #F (2.4) |
| 10 | At other points each rule's inputs are rewritten to depend only on its own group plus a few shared linear summaries; fixing them separates the groups | P section 2.3 to 2.4: "At selected nonzero points T = 1, ..., Q, they should let us separate the groups by fixing shared linear summaries"; Definition 2.1 condition 4; "Once ŷ is fixed, ... depends only on the variables in its assigned group" |
| 10 | The notes are short, so there are few enough to try them all | P section 2.4: at most (2D+1)^(2τn) measurement tuples, which with (2.10) is 2^(O(n/r)), subexponential (section 2.6) |
| 10 | It works at every chosen point except zero | **ours**, restating 2.3 to 2.5: the design is required at t ∈ [Q] = {1, ..., Q}; H(0) is recovered, never computed directly |
| 11 | H(T) is a polynomial in T whose degree the construction controls (deg H ≤ 3nR); at each point T = 1..Q compute the value and a stack of derivatives (Taylor coefficients); these determine H; read off H(0) = #F | P (2.4), section 2.5: "Since deg H ≤ 3nR, the Q values H(t) alone may not determine H. We instead compute several Taylor coefficients at each point"; q = ⌊3nR/Q⌋ coefficients; "These data determine H uniquely" |
| 11 | The total, as the dial turns, is a smooth curve, a polynomial in T; two points fix a line; the curve has far more bends than there are points (degree up to 3nR against Q points), so at each easy point compute the slope, the slope of the slope, and so on | standard; P (2.4), section 2.5 (Taylor coefficients are the derivatives, scaled; "the Q values H(t) alone may not determine H") |
| 11b | Three knobs (slopes at each point, notes to try, group size: the paper's Taylor data, measurements, one group); smaller groups and more points each help but make the notes bigger and slower to try; balanced, the exponent is around n / √log n | P (2.10), (2.11), section 2.6: D = r^(2Q) grows with both the number of groups r and of points Q, and the measurement cost is (2D+1)^(2τn); the Taylor cost falls as Q grows; one group costs 2^(2n/r) | P (2.11), "the three costs multiply"; (2.12): n^O(1) 2^O(n (log log n)^2 / √log n) for the bounded case; Theorem 1.1's sharper bound. "Around" covers the log log factors |
| 12 | √(log n) for a million, natural log: ln(10^6) = 13.8, √13.8 = 3.7; a log log factor (ln 13.8 = 2.6 in Theorem 1.1's bound; squared in the Lean bound) and the hidden constants eat into even that, so no net speedup figure is given | **ours**; P uses natural log ("log denotes the natural logarithm", section 1) |
| 12 | The big O hides constants | P Theorem 1.1, O_k(·) |
| 12 | Plug in the example numbers the paper itself walks through, and its conditions only start to hold once the number of switches has about three billion digits; "That's not a typo" (screen: "≈ 3.3 billion digits in the number of switches before its conditions hold", "with the paper's worked example numbers (eq. 2.19), our arithmetic: n > 2 to the 10.9 billion"; 3.28 billion, shown rounded). The full proof's own cutoff (Proposition 6.4, Lemma 4.8) is smaller or not computed, and the video does not state one. In the paper's worked parameter choice (2.19), the construction needs r ≥ 2, R ≥ 32 and 6R ≤ Q, which first all hold at λ = ⌈log2 n⌉ ≈ 1.09 × 10^10, so n ≈ 2^(1.09 × 10^10), a number of about 3.28 billion digits; smaller inputs are handled by exhaustive search | **ours**, from P (2.19) and Step 5 ("For sufficiently large n, we have r ≥ 2, R ≥ 32, and 6R ≤ Q") and section 2.6 after (2.12): "The finitely many smaller inputs are handled by exhaustive search." Working: r = ⌊√λ/ν²⌋, Q = ⌊λ/(128ν)⌋, R = 4⌈√λ⌉, ν = ⌈log2 λ⌉; a scan finds 6R ≤ Q first at λ ≈ 1.0910 × 10^10 (log2 λ ≈ 33.34), where 12D² ≤ n and 2Qr² ≤ n also hold; digits = λ · log10 2 ≈ 3.28 × 10^9. This is the overview's worked choice; the full proof's constants (section 4, Lemma 4.8) were not computed |
| 12 | If it holds, a galactic algorithm: possible in principle, not practical | **opinion**, the common term for such algorithms |
| 12 | OpenAI: practical speedups need much more research | B: "Finding such algorithms, and turning theoretical advances into practical improvements, will require significant further research" |
| 13 | It does not show P = NP: its guarantee (an upper bound) is still bigger than any polynomial, so it gives no polynomial algorithm | P Theorem 1.1 gives only the upper bound; the paper makes no P = NP claim |
| 13 | Cracking SAT cracks all of NP by translating other problems into SAT; the translation can make them much bigger, and the paper says a speedup this small doesn't automatically survive that | P section 1, after Corollary 1.2: "runtime bounds of the form 2^o(n) do not transfer under general polynomial-time reductions (2^(n^o(1)) would be needed for this), so our result does not imply that general NP problems admit subexponential time algorithms" |
| 13 | ETH implies P ≠ NP, so it was the bigger bet; it was widely believed | standard (an algorithm polynomial in n is 2^o(n)); B: "The ETH has been widely believed to be true" |
| 13 | "Most people believed it. If this proof holds, it just fell" | B "widely believed"; hedged because the preprint is unrefereed |
| 13b | Those hundreds of papers lost one of their reasons; some are still backed by weaker assumptions that may hold; diff tools are no faster | P section 1.1.3: "Our refutation of ETH and SETH removes one basis for the hardness claims above. Some of the same lower bounds follow from weaker hypotheses that may still hold" (it names LCS and regular-expression matching under the Orthogonal Vectors Conjecture); the diff line is **opinion**, from section 1.1.3 and B on practical improvements |
| 13b | Williams [Wil13]: if ETH is false then E^NP does not have linear-size circuits (said "circuits of linear size", no year; card "SICOMP 2013"); the paper's faster algorithm, plugged in, gives Corollary C.1, said "if it holds"; on screen "linear size (gates growing in step with the input)"; so the algorithm yields E^NP ⊄ SIZE(O(n)) | P Appendix C.1, Corollary C.1: "Williams proved that if ETH is false, then E^NP does not have linear-size circuits [Wil13, Theorem 6.1]"; [Wil13] conference version STOC 2010 |
| 13 | "So a faster algorithm also proves something is hard" | **opinion**, restating C.1 ("deriving circuit lower bounds from faster satisfiability algorithms") |
| 14 | OpenAI says it formalized the proof in Lean; a computer checks every step | B: formalized in Lean October 17; R README: Lean formalizations and Comparator checking. Lean checks each inference against its kernel; the Comparator config permits only the axioms propext, Quot.sound and Classical.choice (L, `.json`) |
| 14 | The statement it has to match: for each rule size (k is fixed before the machine), one machine counts the satisfying settings exactly; it beats c^n for every c > 1 (subexponential; a bit weaker than the paper's best), in only polynomial memory; still enough to sink ETH | L lines 191 to 217: one fixed `PrimitiveMachine`; for every n and every CNF of width k, the count tape holds `SAT.count F`; `time ≤ runtimeBound C A d (formulaBitLength F) n`, where `runtimeScale n = n (log log (n+16))² / √log (n+16)` (lines 132 to 134), the weaker exponent ρ(n) of P Theorem 1.1's remark (section 6.4), not Theorem 1.1's n log log n / √log n; visited tape at every prefix ≤ S (bits + 1)^e. The challenge file states the theorem with `sorry`; the proof is in `OAI.Algorithms.SubexponentialSAT.Main` (`.json` `solution_module`). We did not run the check |
| 14 | OpenAI withdrew three of its other AI math papers on October 7 after a sign error was found | R `history.md`, October 7, 2026: "a sign error invalidates a stabilization-trace cancellation argument ... we have withdrawn the following three manuscripts" (algebraic geometry papers, not this one) |
| 14 | "So far, that's OpenAI's word. The people lined up to check it haven't reported yet." | B (2026-10-26): the group "will verify and shepherd", future tense; nothing from them is in the sources on 2026-10-27 |
| 14 | A strong signal; not peer review yet | **opinion**; B: the group "will verify and shepherd"; the preprint is unrefereed |
| 14b | A group to check it is lined up: Impagliazzo and Paturi, who proposed ETH, and Ryan Williams, who knocked down a close relative of the Strong ETH in 2016 (screen: MA-SETH); they "get to proofread its obituary" (**opinion**, a joke; B: the group "will verify and shepherd") | B; P section 1.1.1: "In 2016, Ryan Williams refuted the Merlin–Arthur version of SETH (MA-SETH)" [Wil16] |
| 15 | "Until then, keep your SAT solver, and be suspicious of anyone who says P equals NP" | **opinion**, from 12 and 13 |
| 15 | What to watch: the working group's conclusion; a one-page explanation; which lower bounds survive on weaker assumptions | **opinion**; P section 1.1.3: "Some of the same lower bounds follow from weaker hypotheses that may still hold", e.g. the Orthogonal Vectors Conjecture |

## Shown assets

| Scene | Asset | Source |
|---|---|---|
| 08 | Theorem 1.1's bound, typeset | P page 2, Theorem 1.1 |
| 06 | The record chart: 2^n, (4/3)^n (shown 1.333), 1.308^n, 1.307^n | P section 1.1.1; each bar's length is c − 1 on a linear axis from 1 to 2 (1, 0.333, 0.308, 0.307) |
| 14 | Lean excerpt, `lean/ComparatorChallenges/SubexponentialSAT.lean` at `7ef5c0c`, lines 199, 203 to 204, 210 to 211 and 216 to 217, shifted left 6 spaces as a whole, with `…` for each gap: lines 200 to 202 (the trace from the encoded input), 205 to 209 (the answer tape, the final state, the count's encoding and length), 212 to 215 (every prefix of the run, the start of the space bound) are omitted; lines 191 to 198 (the docstring, the theorem's name, the machine, tapes and constants) come before it, and the name is in the heading | L, copied, never retyped |
| 04, 05, 14 | Portraits: Cook (C1), Impagliazzo (C2), Williams (C3) | Commons, credits drawn on each photo |
| 11b | Galaxy Brain meme (memegen `gb`, knowyourmeme.com/memes/galaxy-brain) | third-party template, fetched at build, never committed |
| 07 | This Is Fine meme (memegen `fine`, gunshowcomic.com/648, K.C. Green): "hundreds of papers, one hypothesis / this is fine" | third-party template, fetched at build, never committed |
| 12 | Drakeposting meme (memegen `drake`, knowyourmeme.com/memes/drakeposting) | third-party template, fetched at build, never committed |

## Left out, and why

- The Kakeya and quantum chromodynamics results in the same OpenAI post: a different field; one video, one result.
- Gap-ETH, NSETH and #ETH by name: the screen lists them in 08; the narration says "a family of cousins".
- The sparsification and variable-copying reduction from k-SAT to bounded-occurrence 3-SAT (P 2.8) and the parity tests (2.9): the video
  explains the counting core; the reduction is real but a second idea.
- The approximation result for Max-k-SAT (Corollary 1.2) and preimage counting (C.2): true but niche for this audience.
- How much compute it took: R gives an average of three hours of ChatGPT Pro thinking per result across the collection, not for this result.
- Cryptography: the paper says nothing about it beyond Goldreich's candidate local one-way functions (Appendix C.2), which would need a scene of its own.
