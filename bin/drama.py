"""Voice a script's lines with Fish Audio Drama 3 on Apple's MLX (mlx-audio), in one process.

  .venv-drama/bin/python bin/drama.py jobs.json

jobs.json, written by bin/voice.mjs:
  {"speed": 1.15, "voice": {"name": "caro_davy"} | {"name": "lino", "wav": "...", "text": "..."},
   "model": {"repo": "...", "revision": "..."} | {"path": "<a folder holding the model>"},
   "cache": "<dir>", "hearback": true, "min": 0.97,
   "jobs": [{"text": "<the line with its [directions]>", "plain": "<the line without them>", "wav": "...",
             "key": "...", "seed": 1, "parts": [[{"w": "...", "say": "..."}]]}]}

Drama 3 is the directed engine (DESIGN D55): a script line carries stage directions in brackets where they land,
"[deadpan] Like animals." or "It's fine. [laughs]", and the model performs them. Every take is one line of the script
(bin/lib.mjs lineRuns), so a line keeps one delivery. A voice is a recording, as for OmniVoice: a clip in
local/voices/ (3 to 30 s, with the words spoken in it beside it as <name>.txt) or a built-in one. The clip goes to the
model exactly as recorded, never denoised (D53).

The model loads once (about 22 GB, peaking near 35 GB), so this refuses to start when less than NEED_GB looks free;
SHIPSHOW_DRAMA_FORCE=1 starts anyway. Each take is checked before it is kept:
  - a take that comes out silent, whose last TAIL_DROP seconds are silence, or that stalls for GAP_DROP seconds inside
    (words dropped, every time measured), is made again with the next seed;
  - its edges are trimmed to the voice, read against the take's own background (a clone copies its clip's hiss);
  - it is time-stretched to `speed` (ffmpeg atempo, pitch kept): Drama 3 has no speed control and reads slower than
    ShipShow's base pace;
  - it is set to one speech level (bin/voicecheck.py level);
  - it is heard back with word times (bin/hearback.py, which ignores the [directions]) and the best of HEAR_TRIES is
    kept; bin/wordtime.py puts each sentence and written word on what was heard, in the `.check` file as `timing`.
A take is never rejected for being loud: a direction can ask for that.
"""
import json
import os
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

import hearback
import voicecheck
import wordtime

SPEC = json.loads((Path(__file__).parent / "omnivoice-voices.json").read_text())
NEED_GB = 40          # measured peak 35 GB (localvoice, 2026-10-15), plus headroom
REF_MAX = 30.0        # Drama 3 takes a 3 to 30 s reference
TRIES = 3             # silent or word-dropping takes: made again with the next seed
TAIL_DROP = 3.0       # seconds of silence at a take's end: words were dropped
GAP_DROP = 2.0        # seconds of silence inside a take: the model stalled, and the words after it are usually gone
# Takes compared with the text, when faster-whisper is installed. Drama 3 drops words often enough that this is the check
# that makes it usable (measured 2026-10-27 on the owner's clone, one line three seeds each: a short last sentence was
# dropped on 1 of 3 seeds with no direction at all, a direction in the middle of a line dropped the rest of it on 5 of 6,
# and [pause], [long pause] and [slowly] stalled into seconds of silence on every seed). A take is cheap (about real time).
HEAR_TRIES = 5
EDGES = (0.06, 0.12)  # seconds of quiet kept before and after the voice


def available_gb():
    """Free, inactive and speculative memory: what a new load can take without paging. None when unknown."""
    try:
        out = subprocess.run(["vm_stat"], capture_output=True, text=True, timeout=5).stdout.splitlines()
        page = int(out[0].split("page size of")[1].split()[0])
    except (OSError, subprocess.SubprocessError, IndexError, ValueError):
        return None
    pages = sum(int(v.strip().rstrip(".")) for k, _, v in (l.partition(":") for l in out[1:])
                if k.strip() in ("Pages free", "Pages inactive", "Pages speculative"))
    return pages * page / 1e9


def reference(voice):
    """(path of the reference clip, its transcript or None) for a voice."""
    if voice.get("wav"):
        clip, text = Path(voice["wav"]), voice.get("text")
    else:
        from huggingface_hub import hf_hub_download
        entry = SPEC["builtIn"][voice["name"]]
        entry = entry if isinstance(entry, dict) else {"file": entry}
        clip = Path(hf_hub_download(SPEC["voicesRepo"], entry["file"], revision=SPEC["voicesRevision"]))
        text = entry.get("text")
    seconds = sf.info(str(clip)).duration
    if seconds > REF_MAX:
        raise SystemExit(f"{clip} is {seconds:.1f} s: Drama 3 takes a 3 to 30 s reference. Cut it at a pause, "
                         f"and its .txt to the words left.")
    return clip, text


def model_path(model):
    if model.get("path"):
        if not (Path(model["path"]) / "config.json").exists():
            raise SystemExit(f"no Drama 3 model in {model['path']} (SHIPSHOW_DRAMA_MODEL or local/config.json dramaModel)")
        return model["path"]
    from huggingface_hub import snapshot_download
    return snapshot_download(model["repo"], revision=model["revision"])


def levels(audio, sr):
    win = int(sr * 0.01)
    frames = audio[: len(audio) // win * win].reshape(-1, win)
    return 20 * np.log10(np.sqrt((frames ** 2).mean(axis=1)) + 1e-9), win


def voiced(audio, sr):
    """(first, last) 10 ms window louder than the take's own background, or None for a silent take."""
    lv, _ = levels(audio, sr)
    quiet = voicecheck.quiet_level(list(lv))
    loud = np.nonzero(lv > max(quiet, voicecheck.SILENT))[0]
    return (int(loud[0]), int(loud[-1])) if len(loud) else None


def longest_gap(audio, sr, span):
    """The longest run of silence between the voice's first and last sound, in seconds."""
    lv, _ = levels(audio, sr)
    quiet = max(voicecheck.quiet_level(list(lv)), voicecheck.SILENT)
    longest = run = 0
    for v in lv[span[0]:span[1] + 1]:
        run = run + 1 if v <= quiet else 0
        longest = max(longest, run)
    return longest * 0.01


def trim(audio, sr, span):
    win = int(sr * 0.01)
    start = max(0, span[0] * win - int(EDGES[0] * sr))
    end = min(len(audio), (span[1] + 1) * win + int(EDGES[1] * sr))
    return audio[start:end]


def stretch(audio, sr, speed):
    """The take played at `speed`, its pitch kept (ffmpeg atempo)."""
    if abs(speed - 1.0) < 1e-6:
        return audio
    r = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(sr), "-ac", "1", "-i", "pipe:0",
                        "-af", f"atempo={speed}", "-f", "f32le", "pipe:1"], input=audio.tobytes(), capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.float32)


def one_take(model, job, round_, ref):
    """(audio at the model's pace with its edges trimmed, sample rate): the line voiced until it is not silent and does
    not end in a long silence, up to TRIES seeds."""
    import mlx.core as mx
    for attempt in range(TRIES):
        mx.random.seed(job["seed"] + (round_ * TRIES + attempt) * 7919)
        out = list(model.generate(text=job["text"], **ref))
        sr = out[0].sample_rate
        audio = np.concatenate([np.asarray(r.audio, dtype=np.float32).reshape(-1) for r in out])
        span = voiced(audio, sr)
        if span is None:
            print("take came out silent; voicing it again", file=sys.stderr, flush=True)
            continue
        tail = (len(audio) - (span[1] + 1) * int(sr * 0.01)) / sr
        if tail > TAIL_DROP:
            print(f"take ended in {tail:.1f} s of silence (words dropped); voicing it again", file=sys.stderr, flush=True)
            continue
        gap = longest_gap(audio, sr, span)
        if gap > GAP_DROP:
            print(f"take stalled for {gap:.1f} s mid-line; voicing it again", file=sys.stderr, flush=True)
            continue
        return trim(audio, sr, span), sr
    raise SystemExit(f"Drama 3 gave silence or dropped words {TRIES} times for: {job['text']}")


def main(spec_path):
    from mlx_audio.tts.utils import load_model

    spec = json.loads(Path(spec_path).read_text())
    free = available_gb()
    if free is not None and free < NEED_GB and os.environ.get("SHIPSHOW_DRAMA_FORCE") != "1":
        raise SystemExit(f"only {free:.0f} GB of memory looks free and Drama 3 peaks near 35 GB: close something "
                         f"(mlx-stop unloads mlx-serve), or set SHIPSHOW_DRAMA_FORCE=1")
    hear_on = spec.get("hearback", True) and hearback.available()
    floor = spec.get("min", hearback.MIN)
    clip, ref_text = reference(spec["voice"])
    if not ref_text and hear_on:
        ref_text = hearback.hear(hearback.samples_of(clip))
        print(f"reference heard as: {ref_text}", flush=True)
    if not ref_text:
        raise SystemExit(f"Drama 3 needs the words spoken in {clip}: write them in a .txt beside it, or npm run setup:drama "
                         f"so they are heard back")
    model = load_model(model_path(spec["model"]))
    ref = {"ref_audio": str(clip), "ref_text": ref_text}
    for i, job in enumerate(spec["jobs"], 1):
        best = None
        run = bool(job.get("parts"))
        for round_ in range(HEAR_TRIES if hear_on else 1):
            audio, sr = one_take(model, job, round_, ref)
            final = voicecheck.level(stretch(audio, sr, spec["speed"]), sr)
            words, got, heard = [], None, ""
            if hear_on:
                heard, words = hearback.hear_words(hearback.samples_from(final, sr))
                got = hearback.agreement(job["plain"], heard)
            rank = (got is None or got >= floor, got or 0.0)
            if best is None or rank > best[0]:
                best = (rank, final, sr, got, heard, words)
            if got is None or got >= floor:
                break
        _, final, sr, got, heard, words = best
        sf.write(job["wav"], final, sr, subtype="PCM_16")
        timing = wordtime.align(job["parts"], words, len(final) / sr) if run and hear_on else None
        hearback.write_check(job["wav"], job.get("key", ""), job["plain"], got, heard, [], timing)
        if job.get("keyFile"):
            Path(job["keyFile"]).write_text(job["key"])   # kept: a run stopped after this keeps this take
        print(f"voiced {i}/{len(spec['jobs'])}" + (f" ({got:.0%} heard back)" if got is not None else "")
              + (f", {timing['matched']}/{timing['words']} words timed from what was heard" if timing else ""), flush=True)


if __name__ == "__main__":
    main(sys.argv[1])
