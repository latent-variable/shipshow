# Sources: raise-the-bar

An explainer for Lino's YouTube channel, narrated by the invented `narrator-uk` voice (no real person cloned). The question:
Alibaba released Qwen 4 Max on 2026-11-16, it scores well behind the top American models on the Artificial Analysis
Intelligence Index, and a widely shared post said the reason is that Chinese labs are being cut off from distilling American
models. Is that what the evidence shows, and why did a gap that looked like three points become twelve? Every fact below was
read at its source on 2026-11-16. Lines marked **ours** are arithmetic done for this video on a source's numbers, with the
working. Lines marked **illustration** are toy examples said and shown as such, never data.

## Primary sources

| Id | Source | Read |
|---|---|---|
| AAQ | Artificial Analysis, model page "Qwen4 Max", artificialanalysis.ai/models/qwen4-max: "Artificial Analysis Intelligence Index v5.0.1", score 43, "Proprietary model", $1.50 / $4.50 per 1M input / output tokens, $3.27 per Intelligence Index task, 127M output tokens on the Index, release date November 16, 2026 (FAQ) | page via fetch |
| AAQ38 | Artificial Analysis, "Qwen3.8 Max (0902)", artificialanalysis.ai/models/qwen3-8-max: "scores 34 on the Artificial Analysis Intelligence Index", v5.0.1, released September 2, 2026, $2.00 / $6.00 per 1M tokens, "$10.02 per task", "This model is deprecated" | page via fetch |
| AAL | Artificial Analysis leaderboard, artificialanalysis.ai/leaderboards/models (current index, v5.0.1 per AAQ): Claude Fable 5.2 Max 65 ($26.54/task), Gemini 4 Carbon High 60, Claude Opus 5.5 Max 59 ($10.04), GPT-6 Astra Max 57, GPT-6.1 Sol Max 55 ($1.27), Claude Sonnet 5.5 Max 55, Kimi K3.1 Pro 46 ($3.68), Qwen4 Max 43 ($3.27), DeepSeek V4.1 Flash 1017 Max 33, GLM-5.3 Max 32, MiniMax-M3.1-Flash 29 | page via fetch |
| AA5 | Artificial Analysis, "Artificial Analysis Intelligence Index v5", October 27, 2026, artificialanalysis.ai/articles/artificial-analysis-intelligence-index-v5 | page via fetch |
| AAM | Artificial Analysis, methodology, artificialanalysis.ai/methodology/intelligence-benchmarking, *Version History* (v4.0 to v5.0.1, with months) | page via fetch, both halves |
| AAA | Artificial Analysis, "Recent open weights model launches", April 30, 2026, artificialanalysis.ai/articles/recent-open-weights-model-launches | page via fetch |
| VB | VentureBeat, "Artificial Analysis overhauls its AI Intelligence Index, replacing popular benchmarks...", January 6, 2026 | page via fetch |
| VI | Vals AI, Vals Index, vals.ai/benchmarks/vals_index, updated 11/15/2026: top 15 with scores (Claude Fable 5.2 71.31%, the leader; Claude Sonnet 5.5 70.85%; Gemini 4 Carbon 70.45%; Claude Opus 5.5 70.14%; Gemini 4 Argon 69.39%; Gemini 4 Hydrogen 68.49%; ... GPT-6.1 Sol 63.94%; Qwen 4 Max 63.20%); "agentic model performance across finance, coding, legal, and tax tasks, weighted by each sector's share of U.S. GDP" | page via fetch |
| VQ | Vals AI, model page, vals.ai/models/alibaba_qwen4-max: Qwen 4 Max 63.20%, #11 of 38, released Nov 15, 2026 | page via fetch |
| K1 | X, Chubby (@kimmonismus), 2026-11-11 10:18 UTC, x.com/kimmonismus/status/2120461099745096146: rumours that Qwen 4 is "disappointing" and that preventing distillation of Anthropic's model is braking it | api.fxtwitter.com JSON |
| K2 | X, Chubby (@kimmonismus), 2026-11-16 11:42 UTC, x.com/kimmonismus/status/2122294330778132787: "Qwen 4 is not a good release. Although it appears on paper to be on par with Opus 5.5 in key benchmarks, the AA Index paints a completely different picture. The fact that Qwen is being cut off from distillation seems to illustrate this failure." 1,072 likes | api.fxtwitter.com JSON |
| QX | X, Qwen (@Alibaba_Qwen), 2026-11-16 02:01 UTC, x.com/Alibaba_Qwen/status/2122148127520289151: Qwen4-Max announced; "average cost per task drops over 60% in our internal evaluation"; open weights promised for smaller Qwen4 models | api.fxtwitter.com JSON |
| AN1 | Anthropic, "Detecting and preventing distillation attacks", Feb 23, 2026, anthropic.com/news/detecting-and-preventing-distillation-attacks | page via fetch |
| AN2 | Anthropic, "Detecting and countering misuse of AI: September 2026", anthropic.com/threat-intelligence-report-september-2026: "Operators affiliated with Alibaba ran the largest distillation attack we have ever measured"; "over 151 million exchanges observed", May to July 2026; peak nearly 3 million a day; more than 3,500 fraudulent accounts at peak; targeted Opus 4.6 and 4.7 chain-of-thought; the transcripts used to distill Claude's capabilities into Qwen 3.5, 3.6 and 3.7; seven China-based labs (Alibaba, Moonshot, DeepSeek, Zhipu, Xiaomi, SenseTime, MiniMax); disruptions between December 2025 and August 2026. Also reported by The Hacker News | Anthropic's page via fetch, the illicit distillation section (third part of the page) |
| AP | Associated Press, "China hits back at US claims of malicious AI distillation...", September 9, 2026 (clickondetroit.com mirror): the FBI, NSA and CISA joint advisory of September 8; Commerce Ministry: claims "groundless", distillation "is a common practice" | page via fetch |
| TC | TechCrunch, Tim Fernholz, "Experts say exploiting Anthropic's Fable isn't how Kimi K3 got so good", July 23, 2026 | page via fetch |
| IC | Interconnects, Nathan Lambert and Florian Brand, "Open models recap: more on Kimi K3...", July 22, 2026, interconnects.ai/p/open-models-recap-more-on-kimi-k3. In context: Lambert, "The problem is that big RL runs are millions and millions of rollouts. ... So to do this on an API like Fable or GPT 5.6 would be insanely expensive", where "this" is using a frontier model's API to grade or supervise the rollouts; Brand, "the strong capabilities come during the RL stage which is where the money is spent" | page via fetch, re-read 2026-11-16 for the context |
| LF | Lawfare, Lisa Klaassen, "The AI Model Distillation Paradox", October 8, 2026: "U.S. frontier labs engage in distillation too—every day." | page via fetch |

## Terms (one name each, in narration, captions and on screen)

| Term | Means | Not |
|---|---|---|
| the index | the Artificial Analysis Intelligence Index; first said in full | not "the benchmark" |
| Artificial Analysis | the independent company that runs the index | |
| version five | v5.0, released 2026-10-27; v5.0.1 (2026-11) is the regrade every current score is on; on screen "v5.0.1" where a current score is shown | |
| Vals | the Vals Index, by Vals AI, the second scoreboard | |
| the gap | the distance in index points from the best open model (a Chinese lab's) to the leader, as AA5 measures it; on screen "best open model vs leader" | Qwen's distance to Sol or Opus is "behind" or "trails", or "the sixteen points" |
| scoreboard, leaderboard, ruler, rulebook | spoken aliases ("the Rulebook" is act two's title for the index's version history): "scoreboard" for any ranking (the index, Vals, the high-jump board), "leaderboard" for the generic one in a headline, "the ruler" for the index as a measuring tool | |
| open model | a model whose weights anyone can download ("the kind anyone can download"); AA counts Kimi K3.1 Pro, weights not yet released, among them, and says so on screen | |
| accusations | the noun for Anthropic's and the US agencies' claims of distillation; "allegation" is only the on-screen tag; "the post's claim" is the X post's | not "charges" |
| distillation, copying | training a model on another model's answers (AN1); "copying" is the plain word for doing it to a rival | |
| Chinese labs, Chinese models | labs based in China: Alibaba (Qwen), Moonshot (Kimi), DeepSeek, Z.ai (GLM), MiniMax | |
| American labs | Anthropic, OpenAI, Google | |
| task, step | a task in the index is one problem a model must finish; a step is one action inside it | |

## Claims

### 01-hook, 01b-scratch: the verdict that went round, and the date that breaks it

| Claim | Source |
|---|---|
| Alibaba released Qwen 4 Max on November 16 2026 | AAQ (FAQ); QX (announcement 02:01 UTC). Vals lists Nov 15 (VQ), a time zone or listing difference |
| Qwen 4 Max: 43 on the index | AAQ, AAL |
| Claude Opus 5.5: 59 | AAL |
| Sixteen points behind | **ours**: 59 − 43 = 16 |
| Within hours a post said the reason: Qwen is being cut off from distillation | K2, 11:42 UTC, about nine and a half hours after QX (02:01 UTC). Quoted verbatim on screen as a capture |
| The same account had called it disappointing on rumours, before release, and blamed preventing distillation | K1 |
| The best open model was 3 points behind the leader under the version before (v4.3); when version five launched, Kimi K3.1 Pro was 12 behind (said "at launch": on today's board, with Claude Fable 5.2 at 65, it is 19, **ours** 65 − 46, AAL) | AA5: "The best, Kimi K3.1 Pro (weights not yet released), scores 46, 12 points behind the leader, compared with a 3-point gap in v4.3." |
| Version five was released October 27 | AA5 |
| The top open-weight models are from Chinese labs | AAA: "The top 10 open weights models on the Intelligence Index are all from China-based AI labs" (April 30); AA5's leaders are Kimi K3.1 Pro (Moonshot), DeepSeek V4.1 Flash and GLM-5.3 (Z.ai), all China-based |
| In April Artificial Analysis wrote the best open models were within 3 to 6 points | AAA: "within 3-6 points of the leading proprietary models" |
| What changed between 3 and 12 was the test | AA5 states both gaps as v4.3 vs v5 for the version change; the narration says the test changed, not that the models were re-run on the same day (AA5 does not say) |

### 02-the-index: what the scoreboard is, and nine versions in a year

| Claim | Source |
|---|---|
| Version five has nine evaluations ("nine tests, weighted" on screen) | AA5 and AAM (the v5 weights list nine) |
| The index runs models through a bundle of tests and combines them into one number ("independent" is not said: no source read for it) | AA5, AAM (weights per evaluation) |
| Nine versions in 2026: v4.0 (January 2026 to June 2026), v4.1 (June to August), v4.1.1 (August to September), v4.2 (September 2026), v4.3 (September 2026), v4.3.1 (September 2026), v4.3.2 (September 2026 to October 2026), v5.0 (October to November), v5.0.1 (November to current), each month as the changelog gives it | AAM, Version History. **ours**: counted; "four of them started in September" counts 4.2, 4.3, 4.3.1 and 4.3.2, whose span begins in September |
| Some are small fixes (graders, ratings) | AAM: 4.1.1 grader model, 4.3.1 judge panels, 4.3.2 Elo anchoring, 5.0.1 CritPt regrade |
| January: top models scored 73 on the old version and 50 or below on version four | VB: "top models now score 50 or below on the new v4.0 scale, compared to 73 on the previous version" |
| The models had not changed between the two scores **[inferred]**: the same releases scored on two scales; VB reports the scale change, not a re-release. The old tests could no longer tell the best models apart; becoming obsolete almost as fast as models improve | VB: "the leading models have become so capable that traditional tests can no longer meaningfully differentiate between them"; "the tests used to rank them are becoming obsolete almost as quickly as the models improve" (VentureBeat's words, credited to VentureBeat) |

### 03-high-jump, 03b-long-tasks, 03c-where: a higher bar

| Claim | Source |
|---|---|
| The high jump with two jumpers tied at a low bar | **illustration** (no data; drawn as a picture) |
| That version five's harder, longer, private tests are why the 3 became 12 (a ceiling effect) | **[inferred]** from AA5's removed saturated questions, 60% private sets and the gap being widest on its two hardest tests; AA5 does not name a cause |
| Version five used harder cuts of its tests, with mastered questions taken out | AA5: AA-Omniscience v1.1, "saturated and public set questions removed"; CritPt v2 scored on "a private 40-question hard subset"; HLE replaced by HLE-Diamond, "a refined 1,000-question version". Said as "harder cuts of its tests", not as every test |
| 60 percent of the index is now private tests or held-out answers | AA5: "60% of the Index is now based on evaluations with private test sets or held-out answers." |
| Private so nobody can train on the answers | AA5 on FrontierCode 2.0: "the tasks stay private to avoid contamination" |
| Tasks got longer: the median model's output per task rose by two thirds, 35 thousand tokens to 59 thousand | AA5: "with the median rising by two thirds, from 35k to 59k" |
| New tests: real science work in a terminal (Terminal-Bench-Science), a private coding test (FrontierCode 2.0) | AA5, AAM |
| 100-step task: 99 percent per step finishes about a third (0.99^100 = 0.366); 97 percent finishes about one in twenty (0.97^100 = 0.048); nearly eight times (7.7) | **illustration** and **ours**: arithmetic, labelled on screen "toy arithmetic, not a measurement". Assumes every step must succeed and steps are independent |
| The gap is widest on HLE-Diamond and Terminal-Bench-Science, where Kimi K3.1 Pro scores 37% and 34%, against 68% for Claude Opus 5.5 and 63% for GPT-6 Astra | AA5: "The gap is widest on HLE-Diamond and Terminal-Bench-Science, where Kimi K3.1 Pro scores 37% and 34%, compared with 68% for Claude Opus 5.5 (max) and 63% for GPT-6 Astra (max)." Said as "in the thirties" and "in the sixties"; on screen the four figures exactly as AA5 gives them, without assigning the 68 and 63 to one test each (AA5 does not) |
| HLE-Diamond is a refined 1,000-question version of Humanity's Last Exam | AA5 |

### 04-game, 04b-reveal: a second scoreboard

| Claim | Source |
|---|---|
| On the index Qwen 4 Max trails GPT-6.1 Sol by 12 points | **ours**: 55 − 43 = 12 (AAL) |
| Vals AI's index is built from finance, coding, legal and tax work, weighted by each sector's share of US GDP ("weighs professional work by its share of the economy") | VI |
| Version five leans on harder, longer, private tests | AA5 (03a's three changes) |
| On Vals: Qwen 4 Max 63.20%, GPT-6.1 Sol 63.94%; less than one point | VI, VQ; **ours**: 0.74 |
| Opus 5.5 leads Qwen by 16 on the index and by about 7 on Vals (Opus 5.5 70.1% shown on the Vals board) | **ours**: 59 − 43 = 16 (AAL); 70.14 − 63.20 = 6.94 (VI) |
| The top six on both are American | AAL: Fable 5.2, Gemini 4 Carbon, Opus 5.5, GPT-6 Astra, GPT-6.1 Sol, Sonnet 5.5 (Anthropic, Google, OpenAI). VI: Fable 5.2, Sonnet 5.5, Gemini 4 Carbon, Opus 5.5, Gemini 4 Argon, Gemini 4 Hydrogen (Anthropic, Google) |
| The two scores are on different scales (index points, percent) | AAL, VI. The video compares each gap only within its own scoreboard, never a point on one with a point on the other, beyond saying one gap is large and one small |

### 05-copying, 05a-who, 05b-charges, 05d-test, 05e-unknown: distillation

| Claim | Source |
|---|---|
| Distillation: training a less capable model on the outputs of a stronger one | AN1: "training a less capable model on the outputs of a stronger one" |
| Labs do it to their own models all the time; it is legitimate | AN1: "Distillation is a widely used and legitimate training method."; LF: "U.S. frontier labs engage in distillation too—every day." |
| Doing it to a rival through fake accounts breaks the rules | AN1 (fraudulent accounts, terms of service; "deliberate capability extraction rather than legitimate use", quoted in TC) |
| February: three Chinese labs, over 16 million exchanges with Claude, about 24,000 fake accounts | AN1: "These labs generated over 16 million exchanges with Claude through approximately 24,000 fraudulent accounts"; DeepSeek, Moonshot, MiniMax |
| September: an Alibaba-linked campaign, more than 151 million exchanges, May to July | AN2 |
| September 8: the FBI, NSA and CISA accused Chinese developers including DeepSeek, Alibaba, Moonshot and Z.ai of extracting capabilities from American models | AP |
| China's Commerce Ministry called the claims groundless, and said distillation is a common practice, the US included | AP: "groundless"; distillation "is a common practice" used by many AI companies worldwide, including in the U.S. |
| The narrator is Claude Opus 5.5, fifty nine on the scoreboard, made by Anthropic, which makes the accusations (said before the accusations, as a disclosure) | AAL (Opus 5.5 at 59); AN1, AN2 (Anthropic's reports); the builder is Opus 5.5 (`video.json` `builtBy`) |
| Qwen 3.8 Max came out in September (Sep 2) and Qwen 4 Max in November (Nov 16), both after the campaign's May to July window | AAQ38, AAQ, AN2 |
| Same version of the index: Qwen 3.8 Max 34, Qwen 4 Max 43, nine points better; "a clear step up from Qwen 3.8 Max" (not "best yet": older versions' scores are not comparable) | AAQ38, AAQ (both v5.0.1); **ours**: 43 − 34 = 9 |
| Cost per index task: $10.02 then $3.27, about a third | AAQ38, AAQ; **ours**: 3.27 / 10.02 = 0.33 |
| Alibaba's own claim: cost per task down over 60% | QX ("in our internal evaluation") |
| Anthropic's report says the Alibaba-linked campaign ran until July, and that its transcripts were used to train Qwen 3.5 to 3.7 | AN2 |
| On v4.3, released in September (AAM; its patch v4.3.2 ran into October), after the May to July campaigns, the best open model was 3 points behind. Said and shown as "September" | AA5, AAM, AN2 |
| No source read dates when Qwen was cut off from distillation | **absence**: AN1, AN2, AP, TC, IC, LF and K1, K2 give no date for a cut-off; K2 says only "is being cut off" |
| Artificial Analysis puts the 3 on v4.3 and the 12 on version five; "the jump lines up with the new index, not with a cut-off" is **[inferred]**: AA5 does not say the same models were re-scored, and no cut-off date later than July is in any source read | AA5, AN2 |
| Nathan Lambert argues distillation is becoming less and less impactful; RL runs are millions of rollouts; grading them through a frontier model's API "would be insanely expensive". "On his podcast" covers Brand's line that the strong capabilities come in the RL stage | IC: "distillation has becoming less and less impactful over time"; "big RL runs are millions and millions of rollouts"; "to do this on an API like Fable or GPT 5.6 would be insanely expensive". TC repeats the first: "I've been of the opinion that distillation is becoming less and less impactful over time" |
| Reinforcement learning: training where a model practises tasks and is scored on them | IC (RL stage, rollouts) |
| The accusations say copying happened; "none of the reports I read" puts a number on how much it helped | **absence**: AN1 and AN2 count exchanges and accounts; AP and TC report allegations ("It's not clear what those watermarks consist of", TC); none of AN1, AN2, AP, TC, IC, LF gives a share of capability. Said as "none of them", meaning these reports |

### 06-verdict, 06b-three-questions: the answer

Collects 01 to 05; nothing new. "A third of the cost per task" is AAQ38 and AAQ (0.33). "The sixteen points you saw" is Qwen 4 Max against Opus 5.5 (AAL). "Widest on the hardest tests in version five" is AA5's two tests, named on screen. The closing board repeats AAL and VI (Opus 5.5 70.14% on Vals).

## Shown assets

| Asset | Where from |
|---|---|
| K2 post (05 and 01): captured with `ss-shot` from `platform.twitter.com/embed/Tweet.html?id=2122294330778132787` | K2 |
| AA5's sentence "compared with a 3-point gap in v4.3": quoted in a source line on screen in 01b, not captured | AA5 |
| The rewind in 01: the board's version label ticks v5.0.1, v5.0, v4.3 and its scores go blank, because v4.3's scores for these models are not in the sources; it stops on Oct 27 (AA5) |
| Scoreboard bars (01, 04, 06): drawn from the numbers above, in `scenes.html` `<script>` as `AA` and `VALS` arrays | AAL, VI |
| Version timeline (02): drawn from AAM | AAM |
| Stadium and high-jump bar pictures (03): generated, see `images.md` | illustration, generated |
| Memes: I Feel Like I'm Taking Crazy Pills (02), Two Guys on a Bus (02b), Peter Parker's Glasses (04b), Stonks (05d), The Rent Is Too Damn High (05e), Why Not Both? (06, animated) | memegen templates (github.com/jacebrowning/memegen); sources printed by `npm run memes` |

## Left out, and why (not claims)

- **Alibaba's own benchmark table** (ProgramBench, Terminal-Bench 4.0 and others against Opus 5.5): seen only on secondary sites; Alibaba's post could not be read. Left out.
- **Speed.** The prompt said Chinese models got faster. AA lists no output speed for Qwen 4 Max (AAQ: time per task N/A); Vals lists a latency of 64 min 39 s (VQ). No speed claim is made.
- **Tokens.** Qwen 4 Max used 127M output tokens on the index against a median of 78.6M (research note, AAQ). Interesting, not needed for the question.
- **Kimi K3 within 3 points in July, and its cyber gap** (ExploitBench 32.2% vs 76.2%, The Decoder's distillation reading of it): a second strand of the distillation argument; the video stays on Qwen and the index.
- **The prompt's "about 10 points behind Opus 5.5"**: the index says 16 (AAL). The video uses 16.
- **The Ramon Astudillo comment** that Terminal-Bench-Science "is probably why the Chinese models tanked": one opinion, untested; AA5's own per-test numbers say the same more strongly.
- **Older Qwen scores on older versions** (Qwen 3.8 Max "56" in headlines): different version, not comparable (AA5, AAM). Only the v5.0.1 pair is used.
- **Export controls and chips** as a cause: sources read give no measurement tying them to the gap; out of scope.
