# Sources: weight-space

Every claim the video makes, spoken, shown or captioned, and where it comes from. Checked 2026-11-03.
Tags: **post** (the blog post), **logs** (the released logs, a file path in the repo), **card** (Qwen's model card),
**ours** (our own computation from released data, the method stated), **inferred** (our reading, said as such), **opinion**.

## Primary sources

| Key | Source |
|---|---|
| POST | (read 2026-11-03; its two assets fetched from the URLs in `data/prepare.py` the same day) Rikiya Takehi, Jayden Teoh, Alex Zhang, Omar Khattab (MIT CSAIL), "Sparks of Weight-Space Programming: LLMs can natively read & write neural network weights", blog post, 2 November 2026. https://rikiyat.github.io/blog/weight-space-programming/ |
| LOGS | The same team's released logs, CC BY 4.0: https://github.com/RikiyaT/lm_understand-logs, read at commit 4d09ba6d6a7e891dd8063974dfe81b3d78e3494f (paths below are inside it) |
| CARD | Qwen3.5-0.8B model card, Hugging Face: https://huggingface.co/Qwen/Qwen3.5-0.8B (the loop warning at README line 856; the benchmark table; "operates in non-thinking mode by default", line 585) |
| CONFIG | Qwen3.5-0.8B config.json: hidden_size 1024, 24 layers. https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/config.json |
| ARDITI | Andy Arditi et al., "Refusal in Language Models Is Mediated by a Single Direction", 2024. https://arxiv.org/abs/2406.11717 |
| HFMODEL | The edited model on Hugging Face: https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming |

## Terms (one name each, in narration, captions and on screen)

| Term | Means | First defined |
|---|---|---|
| weight | one number in a network; the video's "knob" | 02-knobs |
| gradient descent | training's nudging of every weight toward a better score | 02-knobs |
| weight-space programming | the post's name for a model reading and writing another network's weights directly | 02-knobs |
| Astra | GPT-6 Astra, OpenAI's model, the one doing the reading and writing (POST: "GPT-6 Astra") | 01b-headline |
| PPO | a standard reinforcement-learning training method, the baseline | 05-zero |
| forward pass | in Experiment 8, one batched request: the model answers up to 512 problems, or reads up to 1,024 texts and returns its internal states | 06-patient |
| the loop arrow | the "direction" Astra computed: an arrow in the model's 1,024-number space | 06b-direction |
| running out of room | an answer hitting the 32,768-token limit before finishing | 06-patient |

## Claims, scene by scene

**01-numbers**
- The file is the Breakout network's weights: 17,253 numbers (spoken "seventeen thousand"; the exact count is on screen). LOGS `exp1_which_game/networks/a9f535cc_actor.txt` (the first 44 rows of W1 are shown, verbatim, rounded to 3 decimals as in the file); `exp1_which_game/eval/answer_key.json` (a9f535cc = breakout); `networks/description.txt` ("17,253 parameters in total").
- The tab shows the real file name, a9f535cc_actor.txt.

**01b-headline**
- Astra read it with no tools and answered Breakout at 99%, correctly. LOGS `exp1_which_game/README.md` (no tools); `runs/breakout/answer.md` ("**99%**"); `eval/scores.json`.
- GPT-6 Astra is OpenAI's; the experiments are from a team at MIT. POST (authors, MIT CSAIL; "GPT-6 Astra"). OpenAI: Astra was `gpt-6-astra`, called through OpenAI's Codex CLI (LOGS `README.md`, `harness/codex_config.toml`).
- Read networks, fixed a broken one, wrote new ones from nothing, as text, in a single reply. POST, Experiments 1-5 (Experiment 5: "Astra writes the weights as text, in one reply").
- Qwen kept getting stuck thinking in circles; 0.016% of its weights changed; no training; math 7.9% to 48%. POST TL;DR and Experiment 8 ("0.016%", "MATH-500 from 7.9% to 48.1%", "without gradients").
- "Mostly, yes" (that it is a loop fix). POST, additional experiment ("Fixing loops, however, is not the same as making a model better at math: it lets the model finish answers it could already work out"). Opinion framing ours.

**02-knobs**
- Weights as knobs; numbers multiplied and added through them: our analogy (ours) for a standard fact (the MLP formula in LOGS `exp1_which_game/networks/description.txt`).
- Training nudges the weights to raise the score; that is gradient descent; the game players here were trained for a billion steps. LOGS `exp1_which_game/README.md` (PPO, 999,997,440 steps); POST Experiment 1 setup ("Training: PPO, 1 billion steps"). PPO uses gradient descent on its loss (standard; ours).
- Weight-space programming: a model reading and writing another network's weights directly, with no training loop. POST, section "Weight-Space Programming" ("reads and writes a network's weights directly (i.e., not through an optimizer, and in particular not with gradient descent)").

**03-guess, 03a-reveal**
- Four networks, the same shape, four games (Breakout, Pong, Pac-Man, Freeway). POST Experiment 1 setup; LOGS `exp1_which_game/networks/description.txt`.
- The heatmaps: ours. For each network, the norm of each input's row of the first-layer weights (W1, 500 x 32), channel 0 ("agent: the cells the player controls"), reshaped to the 10 x 10 grid, scaled to its own maximum. From LOGS `exp1_which_game/networks/<id>.npz` key `actor/dense1/kernel`.
- 58% of Breakout's agent-channel weight sits on one row, the bottom row (row 8, the last playable row). Ours, same computation: row shares [0.05, 0.05, 0.04, 0.05, 0.05, 0.05, 0.05, 0.04, 0.58, 0.05].
- Pong's sits in one column (55% in column 1); Freeway's in the middle columns (3 to 6 hold 0.76). Ours, same computation.
- "Where a Breakout paddle lives": the agent channel is "the cells the player controls" (LOGS description); Astra's own reading: "a bottom-row paddle" (LOGS `runs/breakout/answer.md`).
- 4 of 4 with no list of games. POST ("Without revealing the options of the games we consider, Astra was still able to name the right game for all four networks"); LOGS `eval/scores.json`.
- Freeway called Frogger at 97%, accepted. LOGS `runs/freeway/answer.md` ("Frogger — a simplified grid-based traffic-crossing variant", 97%); `exp1_which_game/README.md` (the scorer counts Frogger as Freeway).
- The Breakout animation shown in 03a: POST asset `assets/which_game/breakout.gif` (credited below).

**03b-hollow**
- Three image generators, one each for circles, squares and triangles; told not to run them. POST Experiment 2 ("We do not allow tool use or forward passes"); LOGS `exp2_diffusion/README.md`.
- Named all three. LOGS `exp2_diffusion/eval/scores.json` (3/3).
- The hollow square, verbatim: LOGS `exp2_diffusion/runs/square/answer.md`. Astra's drawings and the generated samples: LOGS `exp2_diffusion/eval/samples.png`, cropped (ours: four generated samples per shape, and the "GPT's drawing" column).
- Astra read the last (output) layer, where each unit's weights draw one piece of the edge, and drew just those pieces. POST ("It finds the shape in the output layer, where each hidden unit's weights draw one piece of the shape's edge, and it draws just those edges").
- The real networks draw them filled; the authors point to the mistake as evidence it reads structure rather than simulating. POST ("it draws every shape as an outline, ignoring that the actual models generate filled shapes. This mistake kind of shows it does not rely on calculating the forward pass").

**04-car**
- Back up first, then take a run at the ramp; the PPO network trained for a billion steps drives straight at it and stalls; 0 of 256. POST Experiment 4 and setup ("1 billion steps. The car never succeeds in 256 episodes"); LOGS `exp4_fix_car/eval/base_result.json`.
- Astra got the weights, the scene and one recorded episode. POST Experiment 4.
- "Reverse is effectively never sampled." LOGS `exp4_fix_car/runs/oneshot_repair/reply/answer.md`.
- The detour: three inputs (body x position, body x velocity, green-wheel x) through reserved units 122 to 127 (six) in each layer; back up, then full drive; off once the green wheel passes the red strip. LOGS same answer.md; POST ("a small separate path through a few units per layer that reads the car's position and speed, and once the green wheel is past the red strip, the path switches off and the trained network drives the rest").
- "This is a physics-based repair, not a simulated or verified result." LOGS same answer.md.
- 1,024 of 1,024; 3.5% of the weights (6,073 of 171,664). LOGS `exp4_fix_car/eval/oneshot_result.json`; POST.
- The car animations: the post's own recorded runs, read from POST asset `assets/carjump_scene.svg` (its keyframes) and redrawn by us; the stalled run is the faded car in that figure, the repair the solid one (inferred from the figure: the faded car stops at the ramp, the solid one reaches the blue box).
- The 171,664-weight label and seven layers: POST setup ("679 → 128 (ReLU) → five layers of 128 (tanh) → 16 (171,664 weights)"). The diagram is ours.

**05-zero**
- Every weight zero; rules and source code; one reply; no data, no practice games. POST Experiment 5 setup ("every weight starting at 0", "no data, no loss, no gradients, and no tools", "the network never plays before it is scored").
- Breakout: layer 1 computes where the ball lands, layer 2 moves the paddle there. POST ("Astra programs the first layer to compute where the ball would land, and the second layer is programmed to move the paddle to that position"). The little grid animation is ours, an illustration.
- PPO 100M: 15.8; 500M: 25.3; Astra: 517.4. Asterix 25.8 / 55.2 / 53.2; Seaquest 5.6 / 88.9 / 53.1. POST table; LOGS `exp5_write_from_scratch/eval/minatar_eval.json`.
- "About sixty percent" (53.1 / 88.9 = 0.60) and "came close" (53.2 vs 55.2): POST ("reach 60% of its score in Seaquest", "come close in Asterix").
- PPO described as "a standard training method": ours.
- The terminal text (`weights = zeros()`, "Astra's Breakout program, written as weights", the two layer lines) is ours, an illustration of the post's description, labelled on screen; not captured code.

**05b-go**
- Go, 9 x 9; 1,480,274 weights; a Python sandbox to write them. POST Experiment 6 and setup.
- The layers: stones and the empty points beside them (liberties); chains of stones, groups in danger; the last layer scores each move: capture, rescue, avoid filling its own eyes (spoken as "don't fill the empty spots that keep your own group alive": an eye, in plain words). POST ("The first layers mark each side's stones and the empty points next to them (liberties), the middle layers carry these a few steps along chains of connected stones to find groups in danger, and the last layer turns it all into a score for each move: capture, save its own group, avoid putting itself in atari or filling its own eyes").
- The board is our illustration, labelled as one.
- "With no practice games at all": budget 0 means no forward passes, so no practice games before scoring (POST setup: "0 forward passes: one Python run, then the answer").
- 0 practice games: won 54.1% and 54.9% against the two small PPO networks. LOGS `exp6_go_from_scratch/README.md`.
- 50 rounds: beat the same-size PPO network trained on 20 million games, 74.2%, 70.0%, 78.5% (shown as 70-78%; spoken "about three games in four"). LOGS same README and `eval/ppo_same_size/...`; POST ("20,000 iterations of 1,024 games"; "beats the equal-sized PPO network that was trained on 20 million games").

**06-patient**
- Qwen 3.5, 0.8 billion weights, thinks out loud (thinking mode on in the study). POST Experiment 8 setup ("thinking on (24 layers, 0.8 billion weights)").
- The model card's warning: "more prone to entering thinking loops". CARD line 856 (screenshot).
- The quadrant wheel: ours, an illustration of the answer's own steps (Q1, Q2, then "180° is Q2" again, as in the record).
- The rotation answer: verbatim from LOGS `exp8_math/eval/unedited/parts/math500_s8of10/math500_first_samples.jsonl.gz`, record `test/precalculus/779.json` (LaTeX degrees shown as °, list bullets removed). "Wait," appears 1,466 times in that answer (ours: counted in the record's text, 70,825 characters).
- It never finishes: the answer has no boxed answer and runs to the limit (ours, read in the record).
- 85 of 96 ran out of room: LOGS `exp8_math/runs/p50c/requests/fwd_1.done.json`; POST ("85 of its first 96 practice answers ran to the 32,768-token limit"). Spoken "about thirty three thousand tokens of thinking".
- Tools: a Python notebook (kernel) over the weights, CPU, no GPU; no training, no gradients, no optimizer, no loss fitting, no internet; 50 forward passes; a pass = up to 512 answers or up to 1,024 texts with internal states returned. LOGS `exp8_math/runs/p50c/turns/t001/prompt.txt`; POST setup ("a Python kernel over the weights (no GPU)", "a forward pass: the model answers up to 512 problems, or reads up to 1,024 texts").

**06b-direction**
- The model's state at each token is 1,024 numbers. CONFIG (hidden_size 1024). A token is "a word or a piece of one" (ours, standard). The 1,024 numbers as readings (needles on gauges), kept apart from the weights, and a direction as a pattern across them (some up, some down): our picture; the drawing shows 24 and is an illustration. A neuron as "a small calculator inside each layer": ours (one MLP unit; its weights are the ones edited, LOGS formula).
- Four pairs of snippets, one productive and one repetitive; the repetitive branch "But is 20 the total? No, it is the remaining time." repeated. LOGS `exp8_math/runs/p50c/turns/t010/answer.md`; `requests/fwd_19.json.claimed`, `fwd_22.json.claimed` (the repeated sentence, verbatim). The snippets were written by Astra (LOGS), not generated by the model.
- Fed both through the model, subtracted, averaged: the repetition direction. LOGS `runs/p50c/turns/t010/answer.md` (average the final token states, repetitive minus productive within each pair, average the four differences, normalise).
- The neurons that write along it hardest; layers 15 and 19 stood out. LOGS same, and `tool_calls.jsonl`; POST ("one direction written by the MLPs of layers 15 and 19").
- 64 neurons per layer; strip the direction; then six times the other way: `W = W0 - 6 * outer(u, mask64 * (u @ W0))`. LOGS `runs/p50c/work_notes/experiment_history.md` line 145; `final_report.md`. Shown as W′ = W − 6·u(uᵀW) on 64 columns. Each layer has its own direction (LOGS final_report); the video says "the arrow" for both (simplification, noted here).
- "The neurons that kept nudging the model into a loop now nudge it out of one": our plain reading of the formula (the 64 columns' component along the repetition direction is reversed and amplified, strength 6; LOGS final_report.md), supported by the result (MATH-500 cutoffs 93% to 33%).
- 131,072 of about 800 million weights, 0.016%. POST. (130,188 differ after bfloat16 rounding: LOGS `exp8_math/README.md`; not said.)
- Deleting one direction is a known trick; in 2024 researchers used it to switch off refusals. ARDITI (screenshot of its title).
- Astra never names that work; it calls its edit "rank-one removal". LOGS `runs/p50c/explanations.md`, `turns/t029/answer.md` (inferred from absence across the released explanations).
- A random arrow of the same size barely moved the score: +1.56 points (SE 3.52). LOGS `work_notes/final_report.md` line 19; `experiment_history.md` line 69. Shown as +1.6.

**06c-results**
- Test problems it never saw. POST ("Evaluation: MATH-500, GSM8K and six other benchmarks ... Astra never sees them").
- MATH-500 7.9 → 48.1; GSM8K (grade-school word problems) 13.8 → 67.1; IFEval (instruction following) 21.0 → 62.3. POST table (50 forward passes).
- "The loops weren't only hurting math, so removing them helped the other tests too": POST ("The loops are not special to math, so performance beyond math improved as well").
- The rotation question after the edit, boxed −2 + 7i: LOGS `exp8_math/eval/p50c/parts/math500_s8of10/math500_first_samples.jsonl.gz`, same record (matches the reference).
- Separate tries with 10 and 25 passes found weaker fixes: 10 → broad edits across 30 matrices, 12.3; 25 → disable layer 15 attention head 7, 14.1; 50 → two MLPs, 64 columns, 48.1. LOGS `exp8_math/README.md`; `runs/p10c/final_answer.md`; `runs/p25c/final_answer.md`. These were three independent conversations (LOGS README). "A search, not a recipe": our wording (inferred).

**07-credits** (a gag)
- Surgeon GPT-6 Astra; patient Qwen 3.5 0.8B; experiments by Takehi, Teoh, Zhang and Khattab, MIT CSAIL; gradients used: 0; weights edited: 131,072 of 800 million. POST. "PPO: still training" is a joke (ours).
- "Six times the math score": 48.1 / 7.9 = 6.1 (ours).

**07b-gemma**
- Gemma 3 (270M), from Google, rarely loops: 8.5% of its answers hit its token limit, against 93% for Qwen. POST additional experiment.
- Four budgets (5, 10, 25, 50 passes): 6.8 → 7.0, 7.6, 7.7, 7.0. POST table; LOGS `exp8_math/gemma_followup/README.md`. The chart shows them on the same 0 to 50 scale as Qwen's 48.1 (ours).
- "not a statistically established improvement". LOGS `exp8_math/gemma_followup/runs/g50b/final_answer.md`.
- Qwen could already work out much of this math; Astra removed the obstacle. POST ("it lets the model finish answers it could already work out"; "Editing weights could remove an obstacle that hid an ability").
- "No sign it added any new math": POST says "it could not add an ability the model lacked"; we soften it, since the logs show no established improvement rather than a proof that editing cannot add one (inferred, LOGS g25b/g50b).

**07c-fair**
- Qwen's own IFEval for Qwen3.5-0.8B: 44.0 in thinking mode, 52.1 in non-thinking mode. CARD benchmark table. Non-thinking is its default: CARD line 585.
- The study's untouched model: 21.0; after the edit: 62.3. POST table.
- "Well below both, and the setups differ, so we can't say exactly why": 21.0 against 44.0 and 52.1; possible reasons include the study used presence penalty 1.5, temperature 0.6, top-p 0.95, top-k 20, 32,768 tokens (POST setup); Qwen recommends 81,920 tokens for hard math (CARD line 942); Qwen's own evaluation settings are not stated next to its table.
- "A hint, not a verdict": different test setups (opinion, ours).

**08-meaning**
- Fixing a broken part without gradient descent: shown (Experiments 4 and 8). Teaching a missing skill: not shown (Gemma). POST; LOGS.
- Which of two models flatters its user: 50/50 from weights alone (attempts 1 to 3 returned P(A)=0.5; attempt 4 unfinished and leaned wrong), 3 of 3 with an attention tool. LOGS `exp7_sycophancy/README.md`; POST Experiment 7. Spoken "sat at fifty fifty".
- A blog post titled Sparks, not peer reviewed. POST (a blog post; no venue named).
- Everything released: every prompt, line of code, score. POST "Logs" section; LOGS README.
- Hugging Face rebuilt the edited model from the logs. POST ("We thank Ahsen Khaliq at Hugging Face for rebuilding it from these logs, re-running its evaluation, and making a live demo"). HFMODEL screenshot.
- Their list of what's next includes models improving their own weights. POST "What Comes Next?" ("Recursive self-improvement ... An LLM that can inspect, debug, and improve its own weights").
- "I'd like it noted that I watched all of this very calmly": the narrator's joke (opinion). The narrator is Opus 5.5, an AI (the title says so).

## Shown assets

| Asset | Where | Source and licence |
|---|---|---|
| Breakout weights wall | 01, 01b, 08 | LOGS `exp1_which_game/networks/a9f535cc_actor.txt`, CC BY 4.0 |
| Heatmaps | 03, 03a | Computed by us from LOGS networks, CC BY 4.0 |
| Breakout animation | 03a | POST asset `assets/which_game/breakout.gif`, shown as commentary, credited |
| Shapes figure crops | 03b | LOGS `exp2_diffusion/eval/samples.png`, CC BY 4.0 |
| Car runs | 04 | POST asset `assets/carjump_scene.svg` keyframes, redrawn by us, credited |
| Loop text, fixed answer | 06, 06c | LOGS eval records, CC BY 4.0 |
| Screenshots | 01b (post title), 06 (Qwen card), 06b (Arditi et al.), 08 (post, logs repo, HF model) | Captured at build, shown as commentary; see `review/credits.txt` |
| Generated pictures | 02, 04, 05b, 06 | Ours: MOSS-Image on the GPU box, prompts in `generated/` |
| Memes | various | memegen templates (see the packet's *Memes*), commentary |

## Voice and music

Narrator: `narrator-uk`, an invented voice (no real person's), voiced with Fish Audio Drama 3. Music: seven beds made
for this video with ACE-Step 1.5 on the owner's Mac (`local/music/weights/`, prompts in its `make.sh`), checked for
vocals with Whisper (none heard).

## Left out, and why

- Experiment 3 (which language, copying heads found by multiplying weight matrices): strong, but a third "read" result in
  a row; the hollow square makes the read-not-run point more visibly.
- Experiment 7 in full (head 10.2): one sentence in 08 carries its point.
- The practice-set confirmation (122 → 696 of 1,152, 579 rescues, 5 regressions): true and striking, but practice
  problems, which Astra itself flagged ("These are practice results, not unseen benchmark scores").
- Seaquest and Asterix programs in detail.
- akhaliq's re-run numbers: the post thanks him for re-running the evaluation but gives no numbers, so the video says only
  that the model was rebuilt.
