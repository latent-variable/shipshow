"""A second listen: a different model hears the finished narration, scene by scene, and compares it with the script.

  .venv-listen/bin/python bin/listen.py videos/<name>      writes assets/listen.json and prints what to listen to

Hear-back (bin/hearback.py) checks each take as it is made, with faster-whisper. That caught dropped words, but it
let "two to the n" through on every line of eth-is-false, said "two to the E N" (2026-10-27): it compared the take
with the respelling the voice was told ("en"), and Whisper smooths a lot from context. So after the takes are laid
on one track, NVIDIA's Parakeet (parakeet-tdt-0.6b-v3, run on MLX by parakeet-mlx) hears each scene of
assets/narration.wav (in windows cut at its pauses, windows(): heard whole, a short sentence after a pause is skipped), and each is compared with the script as WRITTEN:
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
WINDOW = 12.0   # seconds: a scene is heard in windows of whole sentences no longer than this (a sentence longer than it stands alone)
LEAD, TAIL = 0.2, 0.3   # seconds of the neighbouring silence a window takes before its first word and after its last, never into the next sentence
PAUSE = 0.5   # seconds of silence between two sentences at which a new window starts
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


def windows(sentences, limit=WINDOW, lead=LEAD, tail=TAIL, pause=PAUSE):
    """Cut a scene's sentences, as timing.json lays them, into the clips Parakeet hears: [(start, end, [indexes])].

    Heard in one clip, a short sentence that follows a pause of a second or so is skipped by the model: "Six soldiers shoot
    back." (1.2 s, mid-scene) and "Thanks for watching." (the last line) in doom-weights, "The small circle shrinks as the
    ripples get finer." in kakeya-every-dimension, all in the track and all heard word for word when the clip began at the
    sentence (issue #129, 2026-11-09, D107). A shorter clip alone did not cure it (the last seven seconds of doom-weights'
    close still lost "Thanks for watching."): the pause before the sentence is what it skips over. So a new window starts
    wherever the silence between two sentences is `pause` seconds or more, or the window would pass `limit` seconds, and
    most sentences are heard alone. A window is cut where the timing says there is silence, so no word is split, and a clip
    never reaches into the sentence beside it: the lead and tail are held to half the gap on that side."""
    out, cur = [], []
    for i, s in enumerate(sentences):
        end = s["start"] + s["duration"]
        gap = s["start"] - (sentences[i - 1]["start"] + sentences[i - 1]["duration"]) if i else 0
        if cur and (end - sentences[cur[0]]["start"] > limit or gap >= pause):
            out.append(cur)
            cur = []
        cur.append(i)
    if cur:
        out.append(cur)
    clips = []
    for idx in out:
        first, last = sentences[idx[0]], sentences[idx[-1]]
        before = first["start"] - (sentences[idx[0] - 1]["start"] + sentences[idx[0] - 1]["duration"]) if idx[0] else float("inf")
        after = sentences[idx[-1] + 1]["start"] - (last["start"] + last["duration"]) if idx[-1] + 1 < len(sentences) else float("inf")
        clips.append((max(0.0, first["start"] - min(lead, max(before, 0) / 2)),
                      last["start"] + last["duration"] + min(tail, max(after, 0) / 2), idx))
    return clips


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
            heard = []
            for n, (start, end, _) in enumerate(windows(s["sentences"])):
                clip = Path(tmp) / f"{s['id']}-{n}.wav"
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{start:.3f}", "-to", f"{end:.3f}",
                                "-i", str(narration), "-ac", "1", "-ar", "16000", str(clip)], check=True)
                heard.append(model.transcribe(str(clip)).text.strip())
            heard = " ".join(h for h in heard if h)
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
