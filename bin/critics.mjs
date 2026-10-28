// Print a video's critic plan: which critics run, on which model, for how many rounds, until
// what severity, and roughly what it costs. The critic loop (skills/critic-loop) follows it.
//   node bin/critics.mjs <folder> [--preset quick|standard|thorough] [--rounds 2] [--until major]
//                        [--model sonnet] [--final opus|none] [--frames cues|scenes]
//                        [--rerun failed|touched|all] [--critics a,b,c] [--json]
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { config, reviewPlan, videoDir } from "./lib.mjs";

const dir = videoDir(process.argv[2]);
const cfg = config(dir);
if (/^who watches/i.test(cfg.audience || "")) console.error(`warning: ${dir}/video.json still has the template's placeholder audience; critic-clarity and critic-engagement judge against it, so write the real one`);
const timing = join(dir, "timing.json");
const seconds = existsSync(timing) ? JSON.parse(readFileSync(timing, "utf8")).total || 70 : 70;
const plan = reviewPlan(cfg, process.argv, seconds);
if (process.argv.includes("--json")) {
  console.log(JSON.stringify(plan, null, 2));
  process.exit(0);
}
const e = plan.estimate;
const why = plan.importance ? `importance ${plan.importance}${plan.importanceReason ? `: ${plan.importanceReason}` : ""}` : "importance not set: the builder judges it (skills/critic-loop)";
console.log(`Critic plan for ${plan.video} (${plan.kind} video, preset ${plan.preset} from ${plan.presetFrom}${plan.overrides.length ? `, changed: ${plan.overrides.join(", ")}` : ""})
  ${why}

  critics   ${plan.critics.join(", ")}${plan.floorAdded.length ? `  (${plan.floorAdded.join(", ")} added: the floor always runs)` : ""}
  model     ${plan.model}${plan.final ? `; ${plan.final} for the last round's ${plan.taste.join(", ")}` : ""}
  rounds    at most ${plan.rounds}
  until     ${plan.until === "blocking" ? "no blocking finding is left" : plan.until === "major" ? "no blocking or objective major finding is left" : "no finding at all is left"}
  rerun     ${plan.rerun === "failed" ? "only critics that failed" : plan.rerun === "touched" ? "critics that failed, and those whose ground a fix touched" : "every critic"}
  frames    ${plan.frames === "cues" ? "a still after every cue and at every scene end" : "a still at every scene end only"}

  about ${e.firstRound} min and ${e.firstRoundTokens}k tokens for the first round, at most ${e.worst} min and ${e.worstTokens}k in all
  (critics only, for ${Math.round(seconds)} s of video${existsSync(timing) ? "" : ", a guess until it is voiced"}; rough: measured 2026-10-17 and 10-27;
  "at most" re-runs every critic every round, and rerun ${plan.rerun} runs fewer; the builder's fixes come on top)
  Say this spend before round 1. Past it, stop and ask the person.

Whatever the caps, an open blocking ${plan.floor.join(" or ")} finding is never shipped: it goes to a person.`);
