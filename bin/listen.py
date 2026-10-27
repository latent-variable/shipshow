"""A second listen: a different model hears the finished narration, scene by scene, and compares it with the script.

  .venv-listen/bin/python bin/listen.py videos/<name>      writes assets/listen.json and prints what to listen to

Hear-back (bin/hearback.py) checks each take as it is made, with faster-whisper. That caught dropped words, but it
let "two to the n" through on every line of eth-is-false, said "two to the E N" (2026-10-27): it compared the take
with the respelling the voice was told ("en"), and Whisper smooths a lot from context. So after the takes are laid
on one track, NVIDIA's Parakeet (parakeet-tdt-0.6b-v3, run on MLX by parakeet-mlx) hears each scene of
assets/narration.wav, and each is compared with the script as WRITTEN:
  - its letter score against the written words (hearback.agreement), flagged under MIN;
  - whole sentences it did not hear (hearback.vanished);
  - letters spelled out that the script never spells (hearback.spelled_out).
Parakeet is a different family of model from Whisper (a transducer, not an encoder-decoder with a language model
behind it), so it fails differently: on the published cut of eth-is-false it heard "E N" where Whisper wrote "EN",
and "Ed TEH" for an ETH that sounded wrong.

It never stops a build and never re-voices anything: it is the last thing to read before rendering, listed by
bin/voice.mjs and in the review packet. Optional, Apple Silicon only: npm run setup:listen makes .venv-listen
(requirements-listen.txt; the model is about 2.5 GB on first use, in ~/.cache/huggingface).
"""
import hashlib
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import hearback  # noqa: E402

MODEL_REPO, MODEL_REVISION = "mlx-community/parakeet-tdt-0.6b-v3", "ed2b7e8c15f9aaa0b5772e2efb986255eaef7e15"
MIN = 0.9   # a scene heard under this share of its letters is flagged; lower than hear-back's, as Parakeet writes numbers and names its own way


def written(scene_dir, scene_id):
    """The scene's script as written: directions gone, one line."""
    text = (scene_dir / f"{scene_id}.txt").read_text()
    return " ".join(re.sub(r"\[[^\]]*\]", " ", text).split())


def said(text, say):
    """What the voice was told for `text`, through video.json "say" (the same whole-word swap bin/lib.mjs makes)."""
    for k, v in say.items():
        text = re.sub(rf"(?<!\w){re.escape(k)}(?!\w)", lambda _: v, text)
    return text


def main(folder):
    from huggingface_hub import snapshot_download
    from parakeet_mlx import from_pretrained

    folder = Path(folder)
    timing = json.loads((folder / "timing.json").read_text())
    cfg = json.loads((folder / "video.json").read_text())
    narration = folder / "assets" / "narration.wav"
    model = from_pretrained(snapshot_download(MODEL_REPO, revision=MODEL_REVISION))
    scenes = []
    with tempfile.TemporaryDirectory() as tmp:
        for s in timing["scenes"]:
            if not s["sentences"]:
                continue
            start = s["sentences"][0]["start"]
            end = s["sentences"][-1]["start"] + s["sentences"][-1]["duration"] + 0.3
            clip = Path(tmp) / f"{s['id']}.wav"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{max(0.0, start - 0.2):.3f}", "-to", f"{end:.3f}",
                            "-i", str(narration), "-ac", "1", "-ar", "16000", str(clip)], check=True)
            heard = model.transcribe(str(clip)).text.strip()
            text = written(folder / "script", s["id"])
            row = {"scene": s["id"], "score": round(hearback.agreement(text, heard), 3), "heard": heard,
                   "missing": hearback.vanished(text, heard),
                   "spelled": hearback.spelled_out(text, said(text, cfg.get("say", {})), heard)}
            row["flag"] = row["score"] < MIN or bool(row["missing"]) or bool(row["spelled"])
            scenes.append(row)
    # the track it heard, so the review packet can tell a listen to an older narration from a current one
    digest = hashlib.sha256(narration.read_bytes()).hexdigest()[:16]
    out = {"model": f"{MODEL_REPO}@{MODEL_REVISION[:8]}", "narration": digest, "min": MIN, "scenes": scenes}
    (folder / "assets" / "listen.json").write_text(json.dumps(out, indent=1) + "\n")
    flagged = [r for r in scenes if r["flag"]]
    print(f"second listen (Parakeet): {len(scenes)} scenes, {len(flagged)} to listen to")
    for r in flagged:
        why = [f"{round(r['score'] * 100)}% heard"] + [f'not heard: "{m}"' for m in r["missing"]] + [f'spelled out "{g}"' for g in r["spelled"]]
        print(f"  LISTEN {r['scene']}: {'; '.join(why)}. Heard: \"{r['heard']}\"")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
