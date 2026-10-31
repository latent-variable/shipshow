# Sources: Kakeya, in every dimension

A YouTube explainer for Lino's channel: what the Kakeya needle problem and the Kakeya conjecture are, what Sogge's local
smoothing conjecture says and why it implies Kakeya, what OpenAI's preprint "Local smoothing for the Euclidean wave equation"
claims and the core idea of how, what it changes and does not, and how far to trust it today (2026-10-30). The second paper from
the OpenAI post that videos/eth-is-false explained.

## Sources of record

| Key | Source | Read |
|---|---|---|
| P | OpenAI, "Local smoothing for the Euclidean wave equation", preprint dated 25 October 2026, 59 pages. github.com/openai/math, `preprints/Local-smoothing-for-the-Euclidean-wave-equation-October-25-2026/paper.pdf` at commit `4eaee87548250b2682affda7d05d947c05554bae` (blob `0472605895a485dd0441ada1257485d325f16f55`; the file's only commit is `42907c9e99`, 2026-10-26) | PDF text, pages 1 to 7, 10 to 11, 14 to 18, 21 to 22, 26 to 31, 54 to 59 |
| B | OpenAI, "Working with academic communities to build scientific understanding", 2026-10-26. openai.com/index/building-scientific-understanding-with-academic-communities/ | page text, read in Chrome on 2026-10-30 (the site refuses scripted fetches) |
| R | github.com/openai/math at the same commit: `README.md` (blob `cc5b0a03`), `history.md` (blob `ce3d4ca0`), `CONTENTS.md` entries 074 and 079, `lean/docs/079.md` | files |
| L | github.com/openai/math `lean/ComparatorChallenges/LocalSmoothing.lean` (143 lines, blob `9e712197a604ecb440b9dade7469ef44ba5f716a`) and `LocalSmoothing.json` (blob `88c1e1c3`) at the same commit | files |
| T | Terence Tao, "Rotating needles in space: the road to the Kakeya conjecture, and why it matters", arXiv:2608.22209v1, submitted 2026-08-23, 16 pages | PDF text |
| Q1 | Joseph Howlett, "'Once in a Century' Proof Settles Math's Kakeya Conjecture", Quanta Magazine, 2025-03-14 | page text |
| Q2 | Jordana Cepelewicz, "A Tower of Conjectures That Rests Upon a Needle", Quanta Magazine, 2023-09-12 | page text |
| W | Wikipedia, "Kakeya set", retrieved 2026-10-30 | page text |
| AJ | John Power, "AI makes discoveries in mathematics, computer science, physics, OpenAI says", Al Jazeera, 2026-10-27. aljazeera.com/economy/2026/10/27/ai-makes-discoveries-in-mathematics-computer-science-physics-openai-says | page text |
| S | A search for independent responses on 2026-10-30 (a research agent, then checked): openai/math has GitHub issues turned off; no blog post, Quanta or Nature/Science piece, or named mathematician reporting a check, an error or a confirmation of this paper was found. The only on-record reaction found is AJ's | search |

## Terms

| Say | Means | Not |
|---|---|---|
| the needle | a unit line segment (P: "unit line segment"; T: "needle") | |
| turn it all the way around | rotate it continuously by a full turn (T Problem 1.1; T footnote 1: a U-turn is half a rotation, "the two questions are very similar") | |
| Kakeya set; "a needle pointing in every direction" | a set containing a unit segment in every direction (T; P Corollary 9.1; L `IsKakeyaSet`); T: "a Besicovitch set or a Kakeya set" | "Besicovitch set" is not said |
| full size | Hausdorff dimension n, the conjecture's sense; in 03 shown first by the thickening test (Minkowski dimension), with the stricter Hausdorff sense named on screen | |
| a focus; pile up | a wave concentrating, a large L^p norm (P section 1: "a much larger L^p norm at the instant when its rays come to a focus"); "pile up" is our everyday word for concentration and for constructive interference (T section 2) | |
| local smoothing | Sogge's conjecture, P Theorem 1.1 | |
| local smoothing (also "Sogge's guess") | P Theorem 1.1, built on Theorem 1.2; the narration calls proving it "the whole game" and never calls it "the wave estimate" (one name, round 1) | "the wave estimate" |
| a Kakeya set | as above; never "the needle set" (round 1) | "needle set" |
| level | a level of the tower (Q2's hierarchy) | "block" |
| a beam; a tube | a wave from a narrow cap of directions, "roughly constant modulus on a tube" (P 9.2); the tube is the thickened needle | "wave packet" is on screen only |
| the tower | the chain local smoothing, Bochner–Riesz, restriction, Kakeya (Q2) | |
| the filter (for direction) | the imaginary translation along a light ray that weights each mode by a Gaussian in direction (P 1.4, 2.1) | |
| the flow | the positive semidefinite tensor with divergence-free columns (P Lemma 2.1, 1.4); "never created or destroyed" is zero divergence | |
| two extra time directions | the auxiliary time coordinates τ ∈ R² (P 1.4) | |
| the bowl; the auxiliary equation | the solution u of the quaternionic determinant equation det H_fib(λ|Φ|² + u) = λμ with u = 0 on the boundary (P 1.4, (4.8)); B: "a novel auxiliary partial differential equation" | "Monge–Ampère" on screen only |
| the energy | F, built from ∫(−u)μ plus a correction, comparable to it (P 1.4, Lemma 4.3) | |
| the critical power | p_c = 2n/(n − 1) (P Theorem 1.2, 1.4) | |

## Claims, scene by scene

| Scene | Claim | Source |
|---|---|---|
| 01 | In 1917 a Japanese mathematician (Sōichi Kakeya) asked how little room you need to turn a needle around | T section 1: "first posed by Soichi Kakeya [11] in 1917"; Q1: "In 1917, Sōichi Kakeya posed the problem" |
| 01 | On October 26 OpenAI posted a paper that, if it holds, settles the Kakeya conjecture in every dimension, and on the way a famous conjecture about waves | B (dated 2026-10-26): "Our models produced a proof of the local smoothing conjecture in every dimension and therefore also resolve the Kakeya conjecture"; P abstract. "If it holds" is ours: S |
| 01 | "The big question that puzzle grew into": the Kakeya conjecture | **opinion**, framing; T section 1 traces the needle problem to Conjecture 1.1 |
| 01 | No human authors; an unnamed internal OpenAI model wrote it | P title page names only "OpenAI"; R README: "produced by an unnamed internal OpenAI model" |
| 01 | OpenAI says a proof checker verified it the day after the model finished | B: "We obtained our AI output on October 18th, 2026, which was formalized in Lean the following day". Said as OpenAI's claim |
| 01 | As far as I can find, nobody independent has signed off yet | S |
| 01 | The other big paper from the same post is the Exponential Time Hypothesis one, which the channel explained | B section headings; videos/eth-is-false |
| 01 | "I keep getting handed OpenAI's homework ... basically in their book club" | **opinion**, a joke; the ETH video is the earlier one |
| 02 | Spinning the needle around its middle sweeps a disk of about 0.79 square units for a unit needle (on screen π/4 ≈ 0.785) | T section 1: "a disk of radius 1/2, which has area π/4 ≈ 0.785" |
| 02 | A three-point turn, like a U-turn in a narrow street, inside a deltoid takes half the area (π/8 ≈ 0.393) | T section 1: "A 'three-point U-turn' can replace this disk by a smaller shape, known as a deltoid, which has area π/8 ≈ 0.393"; T: "perform a U-turn in a narrow street"; W caption: a unit needle "can perform a complete rotation within it" |
| 02 | For a while people believed that was the best | T section 1: "For a while, it was believed that this was the most efficient solution" |
| 02b | Besicovitch showed there is no smallest; any area above zero will do (on screen 1928) | T section 1: "in 1928, Abram Besicovitch [1] made the unexpected discovery that one can in fact rotate such a needle using arbitrarily small area"; W: "in 1928 ... no lower bound > 0". Q1 says "two years later" than 1917, which W dates as his 1920 measure-zero sets; the screen says 1928 for the turning result, after T and W |
| 02b | The trick: a tree of thin overlapping spikes (a Besicovitch–Perron tree) and a needle that shuffles between them | T section 1 and Figure 2: "make a needle perform a continuous U turn using four such trees, together with some very small additional strips ... to move from one branch of the tree to the next" |
| 02b | Exactly zero is the one thing you can't do | T footnote 2: "as small as one pleases, as long as it is non-zero" |
| 02b | For turning, zero is the one thing you can't do; forget the turning, lay one copy of the needle in every direction, and the area can be exactly zero; any set with a needle in every direction is a Kakeya set | T section 1: "one can even find Besicovitch sets of area zero"; W: Besicovitch, 1920, sets of measure zero |
| 02b | The drawn tree is a picture of the idea, not Besicovitch's construction to scale | **ours**, illustration, labelled on screen |
| 03 | The thickening test: watch how fast the area shrinks as the thickness does; a thickened line's area shrinks in step with the thickness (one dimension); a filled square's does not (two); an in-between rate is an in-between dimension | **ours**, the standard Minkowski-dimension picture; T section 1 uses the δ-neighbourhood the same way. On screen: "the official test (Hausdorff dimension) is stricter; the paper proves that one" (P Corollary 9.1, section 9.3: Minkowski first, then Hausdorff) |
| 03 | A Kakeya set, its needles a googol times thinner: a plain line would cover a googolth of a unit (ours: a unit segment thickened to 10^-100 has area about 10^-100); the Kakeya set still covers about a hundredth | T section 1: "a needle of thickness δ = 10^-100 would still need a region of area about 1/100" (Córdoba 1977, Keich 1999; "about 1/log(1/δ)") |
| 03 | It shrinks so slowly that, by this test, it's two dimensional (on screen: "so slow: full size, dimension 2"); the conjecture says a Kakeya set is full size in every dimension | T: "only at the very slow logarithmic rate of about 1/log(1/δ)"; P 9.3 after (9.6): the logarithmic rate "already gives full lower and upper Minkowski dimension"; W: Kakeya conjecture, dimension n; L line 130 states it |
| 03b | Known in the plane since 1971 | W: true for n = 2 (Davies), reference Davies 1971; P section 9: "Davies proved full Hausdorff dimension in the plane [21]" |
| 03b | In three dimensions the needles become tubes; Tao pictures a telescope that must point at every star using as little space as possible | T section 1 and Figure 3: "a space telescope that is intended to look at every star in the sky, but ... needs to be confined to as small a volume of space as possible" |
| 03b | Hong Wang and Joshua Zahl proved three dimensions in 2025 | P reference [77]: Wang and Zahl, arXiv:2502.17655, 2025; P section 9: "Wang and Zahl proved it in three dimensions"; T abstract |
| 03b | Quanta quoted Nets Katz: "a once-in-a-century kind of result" | Q1 |
| 03b | Four dimensions and up: open | Q1: "The four-dimensional Kakeya conjecture remains open" (March 2025) |
| 03b | In September an earlier OpenAI paper claimed four dimensions | R CONTENTS.md 074: "Every four-dimensional Kakeya set has full Hausdorff dimension", preprint dated September 24, 2026; P reference [62] |
| 03b | This paper claims all of them at once, through waves | P abstract; P Corollary 9.1 follows from local smoothing (Theorem 1.2) |
| 04 | Ripples moving inward meet and pile up into a spike for an instant, then pass through; a wave coming to a focus | P section 1: "A wave arriving from a thin spherical shell may have a much larger L^p norm at the instant when its rays come to a focus"; P Proposition 8.1 (the radial focusing example). The pond is **ours**, an illustration |
| 04a | In 1991 Christopher Sogge asked how many derivatives are needed when averaged over time; a focus can't last; averaged over time the wave is tamer than its worst instant by a definite amount, which he guessed | P section 1: "Sogge asked how many derivatives of the initial data are needed to control the norm averaged over a time interval [72]"; [72] Sogge, Inventiones 104, 1991; B: "the most extreme focusing must be short-lived. The amount of focusing at a typical random time is always much smaller than what can happen at the worst-case time"; T 2000 survey phrase is not used |
| 04a | The amount, on screen: one instant needs (n−1)(½ − 1/p) derivatives; averaged over 1 ≤ T ≤ 2, (n−1)/2 − n/p, up to any ε > 0 (for p ≥ 2n/(n−1)): a saving of almost 1/p | P section 1 after Theorem 1.1: "At a fixed nonzero time the sharp Sobolev order is (n − 1)(1/2 − 1/p) ... for p ≥ p_c = 2n/(n − 1), averaging in time gains every amount less than 1/p"; Theorem 1.1, s₊(p) = max{0, (n−1)/2 − n/p} |
| 04 | To measure a spike, raise the wave to a power p before adding it up; the higher the power, the more a tall narrow spike counts | **ours**, a plain account of the L^p norm the paper measures in (P Theorem 1.1, ‖·‖_Lp); P 1.4 "the resulting exponent is 2n/(n − 1)" |
| 04a | Sogge guessed exactly how much tamer, as a formula in p and the dimension, up to an arbitrarily small loss | P Theorem 1.1: s₊(p) + ε for every ε > 0, s₊(p) = max{0, (n−1)/2 − n/p} |
| 04a | Counted in how smooth the starting wave has to be; the guess allows one bit of slack, a loss that may grow as the wave gets finer but slower than any power; smoothing because it is counted in smoothness, local because it is averaged over a short stretch of time (on screen: "smoothness needed", "slack: a loss slower than any power") | P section 1: "how many derivatives of the initial data are needed to control the norm averaged over a time interval" (I = [1, 2]); Theorem 1.1 holds with s₊(p) + ε for every ε > 0, a factor that grows like N^ε at frequency N; P 1.3: the log growth is what "the arbitrarily small Sobolev loss in Theorem 1.1 allows". The reading of the name is ours |
| 04a | Mathematicians count it in smoothness, so the guess is called the local smoothing conjecture | P section 1: "how many derivatives of the initial data are needed" (Sobolev order, smoothness); T section 2: "smoothed out by averaging in time" |
| 04a | One power, set by the dimension, is the critical case the whole problem turns on (on screen: "one critical power, set by the dimension") | P section 1: p_c = 2n/(n − 1); P 1.3: "The proof is built around a single estimate at p = p_c"; above p_c the gain is almost 1/p, below it any small regularity suffices |
| 04a | Four in two dimensions, three in three (on screen "4 in two dimensions, 3 in three") | **ours**, arithmetic: p_c = 2n/(n − 1) is 4 at n = 2 and 3 at n = 3 (P Theorem 1.2; P 1.2 names p = 4 "the critical exponent" in the plane and "the Euclidean exponent is 3" in R³) |
| 04a | "A wave, it turns out, can't hold a pose" | **opinion**, a joke on B's "the most extreme focusing must be short-lived" |
| 04a | Averaging smooths the wave, locally in time: hence "local smoothing" | **ours**, an explanation of the name; T section 2: "the extent to which solutions to the wave equation can be smoothed out by averaging in time" |
| 04b | Local smoothing sits at the top of a tower: Bochner–Riesz under it, then Stein's restriction conjecture, then Kakeya; each implies the one below | Q2: "at the very top sits the local smoothing conjecture"; "The restriction conjecture, in turn, is implied by the so-called Bochner-Riesz conjecture"; restriction: "If it is true, so is the Kakeya conjecture"; "each statement in the hierarchy implies the one below it" |
| 04b | Bochner–Riesz is about rebuilding a signal by adding up its frequencies; restriction is about waves whose frequencies sit on a sphere | T section 2: Bochner–Riesz "describes the extent to which the failure of the disk multiplier ... can be repaired by smoothing out the multiplier near the boundary"; restriction "describes when the Fourier transform ... can be restricted to a curved surface such as a sphere"; P 1.1 "summability of Fourier integrals"; L `sphericalExtension`. Our plain wording |
| 04b | Quanta called it "a tower of conjectures that rests upon a needle" | Q2, title |
| 04b | Each level, give or take some edge cases, implies the one below; prove the top level, and the levels under it come with it, down to the needle; the needle problem was a wave problem all along | Q2 (the chain); "give or take some edge cases": P proves restriction only in the interior of its range (Corollary 9.3), so the chain is not exact at the edges; P derives Bochner–Riesz (section 10), restriction (9.1) and Kakeya (9.3) from its local smoothing estimate. The last line is **opinion**, a joke |
| 05 | A wave whose directions are squeezed into a narrow cone travels as a beam, strong in a long thin tube; that tube is a thickened needle | P 9.2: "A cap of radius δ produces a wave of roughly constant modulus on a tube of length δ^-2 and radius δ^-1"; Q2: "Each of those pieces mathematically resembles a needle in a Kakeya set" |
| 05 | Where tubes overlap their strengths add, so a crammed bundle is a huge pile-up that stays; if tubes in every direction could be crammed together, the beams would pile up and stay piled up, which local smoothing rules out (via the extension estimate it gives, P Lemma 9.2); the proof puts random signs on the beams so on average they add instead of cancelling | P 9.2: "puts independent signs on disjoint caps. The expected squared modulus of the sum is then the sum of the squared moduli"; Lemma 9.4 (overlap bound from the extension estimate, which comes from the wave estimate, Lemma 9.2); T section 2 (Fefferman's wave packets compressed "reminiscent of a Kakeya set ... create a large amplitude") |
| 05 | A small Kakeya set would be one whose thickened needles cram into almost no area; so tubes can't be crammed together by much, and a Kakeya set has to be full size | P Corollary 9.1 and its proof in 9.3: (9.6) |F_δ| ≳ L(1/δ)^(−2(n−1)), a logarithmic lower bound ("by much": some compression is possible, T section 1) |
| 05b | So the whole game is proving local smoothing | P: sections 9 to 12 derive the rest from Theorem 1.1 and 1.2 |
| 05b | The usual approach chops a wave into thinner beams by direction and glues them back | P 1.2: "Wolff decomposed a neighborhood of the cone into thin angular sectors and controlled their sum by induction on scales"; T section 2: wave packet decompositions and induction on scales |
| 05b | Wolff, 2000, in the plane, for large enough powers (on screen p > 74) | P 1.2: "This gave every gain below 1/p for p > 74 in the plane [80]"; [80] GAFA 10(5), 2000 |
| 05b | In 2019 Guth, Wang and Zhang finished the plane | P 1.2: "In the plane, Guth, Wang and Zhang reached the critical exponent p = 4"; T section 2: "the local smoothing conjecture was resolved in two dimensions by Guth, Wang, and Zhang"; arXiv 1909.10693 (September 2019), Annals 2020 (P [35]) |
| 05b | In three dimensions and up the gluing got partway, and stuck | P 1.2: at n = p = 3 "every gain below 2/9 ... compared with the conjectured 1/3"; full gain for p ≥ 10/3 in R³, "whereas the Euclidean exponent is 3" |
| 05b | "Three decades of brilliant people, and the hardest part was the glue" | **opinion**, a joke; Sogge 1991 to 2026 is three decades and a half; P 1.2: "A persistent difficulty is to put waves moving in different directions back together" |
| 05b | The paper names the hard part: "putting waves moving in different directions back together" | P 1.2: "A persistent difficulty is to put waves moving in different directions back together" (shown on screen, page 3) |
| 05b | Its answer is to barely take them apart | P 1.4: the construction works on "a finite sum of plane waves ... whose directions lie in one small cap" and ends by "summing a fixed number of caps" |
| 06 | Shift time and position by imaginary amounts, along a light ray: each wave's wiggle turns into a fade that depends on its direction; waves heading that way pass untouched, others dimmed on a bell curve; a filter for direction, not a knife | P 1.4: "An imaginary translation along a light ray filters the sum by direction. Translation by −iℓ(1, ω) ... multiplies a mode of frequency ξ by exp[−ℓ|ξ| |ω − ξ/|ξ||²/2]" (factor 1 when ξ/|ξ| = ω) |
| 06 | Mathematicians have shifted waves into imaginary time before; what's new is what the paper builds on it ("imaginary time" is our gloss of the paper's "imaginary spacetime direction") | P 1.4, Related constructions: "Analytic continuation in an imaginary spacetime direction has also been used to study waves [42]"; Kaiser's construction [41]; "Here the continued wave gives a positive symmetric tensor" |
| 06 | It adds the waves before measuring, keeping their interference, which makes a focus | P 1.4: "We need to take a square after summing these waves: summing the squares would discard the interference that produces a focus" |
| 06 | Two extra time directions, which the proof uses later as a plane to cross | P 1.4: "the construction has two auxiliary time coordinates τ ∈ R²"; section 6 compares circles |τ| = const in that plane |
| 06 | "Ordinary time, apparently, wasn't enough" | **opinion**, a joke |
| 06b | OpenAI's post singles out a new auxiliary equation | B: "The new proof is based on a novel auxiliary partial differential equation"; R history.md: "The proof uses an auxiliary partial differential equation" |
| 06b | At every moment it solves for a bowl whose bend is set, point by point, by how much wave is there; where the wave piles up the bowl dips deep; depth times wave, added up, is an energy | P 1.4: "det H_fib(λ|Φ|² + u) = λµ, u|∂ = 0"; "density µ ≥ m on a small ball forces the depth of u at its center to be at least a constant times the squared radius times m^(1/(n−1))"; "The integral ∫(−u)µ detects ..."; (4.8): u ≤ 0. "Bend" stands for the determinant of the Hessian of the bowl laid on a fixed background (λ|Φ|² + u), our plain word; "at every moment" is each fixed (T, τ), on its spatial fiber |
| 06b | The depth itself grows with how dense the pile-up is, so depth times wave counts a dense pile-up extra; worked out, that is exactly the critical power 2n/(n − 1) | P 1.4: "The integral ∫(−u)µ detects the power m^(n/(n−1)). Since ∫µ recovers a square of the wave, the resulting exponent is 2n/(n − 1)"; P section 3: "This is where the denominator in p_c = 2n/(n − 1) enters" |
| 06b | n is the dimension; four in two dimensions, three in three; the number the conjecture turns on | P Theorem 1.1 (n spatial dimensions); arithmetic as in 04a |
| 06b | The energy is one number that tracks how piled up the wave is | P 1.4: "The first and last inequalities compare the energy with the wave"; (5.1), (5.2) |
| 06b | The bowl is built from quaternions, numbers with three imaginary units | P 1.4: "H_fib is an n-by-n quaternionic Hermitian Hessian"; 2.3: "The quaternions H have units i, j, k satisfying i² = j² = k² = −1" |
| 06b | "I read that sentence more than once" | **opinion**, a joke |
| 06c | In time and the two extra time directions the energy is nearly balanced: at any point at least the average around it, up to a tiny error | P (5.3): "∆_z F(T, τ) ≤ V(s)F(T, τ), V(s) = Cs^-2 e^(−cs/h)"; P 1.4: "At that fixed radius the mean inequality carries it to initial time"; Lemma 6.1 (circular means of a supersolution). "Nearly balanced" is our plain word for a supersolution with a tiny potential |
| 06c | So a big energy later forces a big energy earlier | P 1.4: the chain ∫‖U(T)f‖ᵖ dT ≲ a⁻² ∫H(T, 2a) dT ≲ [log(2/h)]² a⁻² H(0, 4a) ≲ [log(2/h)]² ‖f‖ᵖ |
| 06c | Trace the energy from the focus back to the start, when the wave began; a big pile-up at the focus forces a big energy at the start (on screen: "focus ≤ C · [log(2/h)]² · start", h the wavelength) | P 1.4: the wave is observed at 1 ≤ T ≤ 2 and the data enter at T = 0; Lemma 6.1 (6.2) |
| 06c | Anything that is at least the average of its surroundings behaves like a random walker's odds, so the paper compares the energy with a walker; the small circle shrinks as the wave gets finer; the chance of reaching the far circle before coming back is about one over the logarithm of how many times bigger the far one is (the ratio of radii); that is what the proof pays, out and back | P section 6: comparison with "the probabilities that planar Brownian motion leaves an annulus through one circle or the other" (a function at least its circular mean is compared with these, Lemma 6.1); the small circle is |τ| = 2a with a = Kh and h = 1/N, so it shrinks as the frequency grows; Figure 2: "factor at s = 2b: log 2 / log(1/b)" |
| 06c | The paper compares the energy with a random walker's odds between a small circle and a far one; starting near the small one, the chance of reaching the far one first is about one over the logarithm of how far apart they are; out and back, paid twice | P section 6 and Figure 2: comparison functions are "the probabilities that planar Brownian motion leaves an annulus through one circle or the other"; Figure 2 caption: "factor at s = 2b: log 2 / log(1/b)"; "Each passage costs one logarithm"; first an outward comparison, then an inward one |
| 06c | Picture two circles in the plane of the extra times and a random walker; the chance it reaches one circle before the other changes like the logarithm of distance; the proof crosses out and back (on screen: arrows out to "the far circle" and back to "where the wave is measured"), each crossing costing one logarithm; the pile-up later is at most the start times a logarithm squared | P section 6: "The radial harmonic functions used for comparison are the probabilities that planar Brownian motion leaves an annulus through one circle or the other"; "Each passage costs one logarithm"; P 1.4: "A radial harmonic function in the plane is affine in the logarithm of its radius. Each passage thus loses an inverse logarithm"; the bound above |
| 06d | A logarithm is smaller than any small loss the conjecture allows, so it fits (on screen: a log curve under a small power, "the small loss allowed"): Sogge's guess in every dimension, and with it Bochner–Riesz, most of restriction, and Kakeya | P 1.3: "It quantifies the growth with frequency that the arbitrarily small Sobolev loss in Theorem 1.1 allows"; Theorem 1.1 for every ε > 0; P after Theorem 1.2: the optimal log power "lies between 1/pc and 2/pc" (so log squared is not claimed optimal); "most of restriction": the interior (Corollary 9.3); abstract |
| 06d | The chart's shared axis is "how fine the wave is" (frequency) | P 1.3: growth "with frequency" |
| 06d | The three-step summary | **ours**, a summary of P 1.4 |
| 07 | Not your phone; pure math; nothing gets faster tomorrow | **opinion**; B calls it "the result in mathematics", in harmonic analysis |
| 07 | The whole tower is now claimed by one paper, top level to needle, in every dimension, except a thin edge of the restriction level, which stays open (on screen, in the tower's order: local smoothing, Bochner–Riesz, restriction in the interior, restriction's edge still open, Kakeya maximal and dimension) | P abstract: Bochner–Riesz conjecture; "Fourier restriction estimates for the sphere ... throughout the interior of the conjectured range"; Kakeya and Nikodym maximal conjectures; R CONTENTS 079. "Its very edge" is the boundary of the range (P Corollary 9.3: two strict inequalities, "the interior of the conjectured range"). B says "Stein's restriction conjecture in all dimensions"; the video follows P |
| 07 | Kakeya matters beyond needles; Tao explains why: cramming tubes together is central to problems about how much waves can pile up when you add them, which run through the math of signals (harmonic analysis), the equations of physics (PDE) and the primes (number theory) | T section 2: "central to many problems in harmonic analysis, partial differential equations, and number theory, which all have the general flavor of trying to control the amount of 'constructive interference' that can be present in some superposition of oscillating waves" |
| 07 | Kakeya is a necessary first step on one road toward a cousin of the Riemann hypothesis (on screen: the Lindelöf hypothesis, implied by the Riemann hypothesis) | T section 2: "the resolution of the Kakeya conjecture would be a necessary first step towards a resolution of the Lindelöf hypothesis by this approach"; "the infamous Riemann hypothesis has long been known to imply the Lindelöf hypothesis". The video does not say this paper advances Lindelöf |
| 07 | The method may matter more than the results | **opinion**, said as mine |
| 07b | OpenAI says the proof was checked in Lean | B; R README (Lean formalizations, Comparator) |
| 07b | The Kakeya statement: for every n ≥ 2, any set with a unit segment in every direction has Hausdorff dimension n, the official name for full size (excerpt on screen) | L lines 65 to 66 (`IsKakeyaSet`) and 129 to 130 (`theorem kakeya`); L line 128's docstring says "no measurability is assumed" |
| 07b | A checker proves the theorem as stated, so the definitions must match; people have to check that | **ours**, how a Lean challenge works: L states the theorems with `sorry` and `.json` names the solution module and the permitted axioms (`propext`, `Quot.sound`, `Classical.choice`); the press made the same caveat (CryptoBriefing, StartupHub, 2026-10-26/27, not cited on screen) |
| 07b | I didn't run the check | true of this video's research |
| 07b | This month OpenAI withdrew three of its other math papers after a sign error | R history.md, October 7, 2026: "a sign error invalidates a stabilization-trace cancellation argument ... we have withdrawn the following three manuscripts" (algebraic geometry, not this paper) |
| 07b | OpenAI's post says it released the AI's output and left mathematicians to organize their own checking | B: "For the math result, release the AI output, leaving researchers free to organize their own efforts"; "we reached out to an expert ... Following their recommendation, we decided to release the AI output publicly". The expert is not named (B; S) |
| 07b | Alex Iosevich, who studied under Sogge, told Al Jazeera OpenAI appears to have "cracked" it, and that he feels "a twinge of sadness" | AJ: Iosevich, University of Rochester, "The conjecture was formulated by my PhD adviser, Chris Sogge"; OpenAI "appeared to have 'cracked'" it; "I feel a twinge of sadness as a result" (shown on screen as a capture of AJ) |
| 07c | What I'm watching | **opinion** |
| 07c | In 1917 Kakeya asked how little room a needle needs; Besicovitch said almost none (turning), and a set of needles can even take none (zero area); if this holds, that set takes none of the room and somehow all of the size (on screen: "turning: almost none", "area: zero", "size: full") | T section 1; **opinion**, a closing line (zero area, full dimension) |

## On screen

| Scene | Asset | Source |
|---|---|---|
| 01 | The paper's title and date, "OpenAI", the post's three results | P title page; B section headings |
| 02, 02b | The disk, the deltoid and the needle turning; a drawn spiky tree | drawn by us from T's descriptions (disk π/4, deltoid π/8, Figure 2); illustrations, not to scale |
| 03 | The thickening chart: area against thickness for a line, a square and a Kakeya set | **ours**, curves drawn as w, 1 and 1/log(1/w) (T's Córdoba–Keich rate, "about"), labelled "illustration" |
| 04 | Rings converging and the focus spike over time | **ours**, an animation of P Proposition 8.1's focusing wave, labelled "illustration" |
| 04 | The derivative counts | P section 1, as in the claims |
| 05 | Beams in tubes, a crammed bundle, random signs | **ours**, illustration of P 9.2 |
| 05b | The quote card "A persistent difficulty is to put waves moving in different directions back together", "the paper, page 3" | P page 3 |
| 06, 06b, 06c, 06d | The light-ray filter as a bell curve over directions; the bowl over a pile-up; the plane with two circles and a log curve; the formulas det H(λ|Φ|² + u) = λμ, p_c = 2n/(n−1), ∆F ≤ V F, and the chain with [log(2/h)]² | P 1.4, (4.8), (5.3), section 6, as in the claims; the pictures are ours |
| 07b | Lean excerpt, `lean/ComparatorChallenges/LocalSmoothing.lean` lines 65 to 66 and 129 to 130, one gap (lines 67 to 128: line 67 blank, `end Implications` at 68, the `Stein` namespace and its square-function definition at 70 to 79, `open OAI.Analysis.Fourier.LocalSmoothing.Comparator.Implications` at 81, which is what lets line 130 say `IsKakeyaSet`, and the theorems `euclidean_local_smoothing`, `bochner_riesz`, `spherical_restriction` and `kakeya_maximal` at 83 to 126, then the docstring at 128). The excerpt stops at `:= by`; line 131 is `sorry`, because the challenge file states the theorem and the proof is in the solution module | L at the pin, copied from the file; checked with check-excerpt.mjs (ok) |
| 03b | Quanta capture with "once-in-a-century kind of result" marked | Q1, captured at build time (`ss-shot`, headless Chrome), 2026-10-31 UTC per the packet's Screenshots table |
| 07b | Al Jazeera capture with "cracked" marked; the "twinge of sadness" quote is a card citing the same page | AJ, captured at build time (`ss-shot`), 2026-10-31 UTC per the packet |

### People

| Scene | Who | Picture |
|---|---|---|
| 02 | Sōichi Kakeya | Commons `File:Sōichi Kakeya, circa 1937.jpg`, public domain (unknown photographer) |
| 02b | Abram Besicovitch | a name card: no free photo on Commons (S) |
| 03b | Hong Wang | Commons `File:Hong Wang, 2025 (cropped).jpg`, CC BY 4.0, IHES |
| 03b | Joshua Zahl | a name card: no free photo on Commons (S) |
| 04 | Christopher Sogge | a name card: no free photo on Commons (S) |
| 04b | Elias Stein | Commons `File:Elias Stein.jpeg`, CC BY-SA 2.0 de, Renate Schmid |
| 05b | Thomas Wolff | Commons `File:Thomas Wolff 1992 (re-scanned, as-is).jpg`, CC BY-SA 4.0, George Bergman |
| 05b | Larry Guth | a name card (the Commons crop also shows two other people) |
| 05b | Ruixiang Zhang | Commons `File:Ruixiang Zhang Oberwolfach 2017.jpg`, CC BY-SA 2.0 de, Petra Lein |
| 07 | Terence Tao | Commons `File:Terence Tao.jpg`, CC BY-SA 2.0 de, Gert-Martin Greuel |

The build checks each licence (`bin/portrait.mjs`); `npm run review` lists the authors and licences under *Portraits*, and
`review/credits.txt` carries them to the description.

### Memes

| Scene | Template | Source |
|---|---|---|
| 02b | One Does Not Simply (memegen `mordor`): "one does not simply" / "turn a needle in zero area" | knowyourmeme, via memegen (MIT); third-party picture, fetched at build, never committed |
| 03 | Vince McMahon Reaction (memegen `vince`): a line, a googol times thinner: a googolth / a Kakeya set, just as thin / still a hundredth | as above |
| 04b | Scooby Doo Reveal (memegen `reveal`): "the needle problem" / "let's see who you really are" / (unmasked) / "a wave problem" | as above |
| 05 | Epic Handshake (memegen `handshake`): "waves can't stay piled up" / "tubes can't be crammed" / "the same fact" | as above |
| 06b | Hide the Pain Harold (memegen `harold`): "the bowl is built from quaternions" / "in a paper about ripples" | as above |
| 06d | Phoebe Teaching Joey (memegen `ptj`): the three moves, each said and repeated, then "now all together" / "simple, right?" | as above |
| 07b | Khaby Lame Shrug (memegen `khaby-lame`): "how to check an AI's proof" / "organize your own" | as above |

## Voice and music

- **Voice:** the invented `narrator-uk` voice (`local/voices/narrator-uk.wav`, never committed), made with Fish Audio Drama 3
  (`mlx-community/fish-audio-drama-3-4bit`) from a description and a seed, no real person cloned (how it was invented:
  `videos/eth-is-false/sources.md`, *Voice*). Drama 3's output is used under the Fish Audio Community License. The narration says
  it is an AI (01-hook).
- **Music:** seven act beds, one per mood in `video.json` `"moods"`, generated locally with ACE-Step 1.5 through
  `~/.agents/bin/localaudio` (instrumental; prompts and seeds in `local/music/kakeya/gen.log`, never committed); each was heard
  back with Whisper and none had words in it.
- **Look:** the `ripple` theme, new with this video (`themes/ripple/theme.css`).
- **Built with:** ShipShow (this repo) and HyperFrames.

## Left out, and why

- The Yang–Mills and QCD result in the same post: the physicists' group is holding the materials back (B), so there is nothing to
  read yet; ETH was the other video.
- Nikodym sets, Stein's square function by name in the narration (on screen in 07), the paraboloid, Schrödinger local smoothing,
  and the curve families of 9.4: true, but one tower is enough for this audience.
- The Kakeya maximal conjecture as distinct from the dimension conjecture: on screen in 07 only; the narration uses the dimension form.
- The log power for Kakeya ([log(2/δ)]^(4/p_c), P Corollary 9.1) and the sharp-log discussion (Appendix B): too fine for the ear.
- Who OpenAI's unnamed expert is: not public (B; S).
- Gowers' post on X: found only as a search snippet, not opened (S).
- The finite-field Kakeya proof (Dvir, 2008) and randomness extractors: a different problem, and its application was not read in a source.
- How much compute it took: R gives an average across the whole collection, not this result.
