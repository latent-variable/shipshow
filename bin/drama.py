"""Voice a script's lines with Fish Audio Drama 3 on Apple's MLX (mlx-audio), in one process.

  .venv-drama/bin/python bin/drama.py jobs.json

jobs.json, written by bin/voice.mjs:
  {"speed": 1.15, "voice": {"name": "caro_davy"} | {"name": "lino", "wav": "...", "text": "..."},
   "model": {"repo": "...", "revision": "..."} | {"path": "<a folder holding the model>"},
   "cache": "<dir>", "hearback": true, "min": 0.97,
   "jobs": [{"text": "<the line with its [directions]>", "plain": "<the line without them>", "written": "<as the script writes it>", "wav": "...",
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
    kept: one missing a whole sentence, or spelling out letters the script never spells (hearback.spelled_out: the
    respelling "en" read as "E N"), or that drawls (over 2.5 s between two words of one sentence,
    hearback.drawled), is made again; bin/wordtime.py puts each sentence and written word on what was heard, in the `.check` file as `timing`.
  A take still under `min` after HEAR_TRIES is kept, never refused: its score is in the `.check` file, and the voice step
  and the review packet list it to listen to, as for OmniVoice (D44). Whisper misspelling a name is the usual cause (both
  such takes of never-about-the-code's 52 were "Karpathy" and "56%" with every word said), so refusing would block on
  false alarms.
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
# Silence inside a take is read against the voice too: anything GAP_BELOW_VOICE dB under the take's loud level (its 90th
# percentile) counts. A take that is mostly the clone's hiss has its "quiet" level pinned at SILENT while the hiss sits near
# -40 dBFS, so a 3 s stall of hiss read as voice (never-about-the-code, "Both true. So ... you don't trust the output",
# 2026-10-27). Over the video's 62 takes, 18 dB caught that stall alone: the next longest gap was 1.5 s.
GAP_BELOW_VOICE = 18.0
# A take's edges are found the same way, 15 dB under the voice and held for EDGE_RUN windows (50 ms), then walked back (and
# forward) up to EDGE_BACK windows while the level stays within 6 dB of that line, so a soft first syllable is kept (D53). The
# clone's hiss swings from -33 to -37 dBFS, inside 18 dB of a voice near -17: a take opened on 2 s of it and kept it all (the
# DHH line, 2026-10-27). Checked against Whisper's first word on all 62 takes: the start found is never 0.15 s late.
EDGE_BELOW_VOICE, EDGE_RUN, EDGE_BACK = 15.0, 5, 25
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


def silence_level(lv, below=GAP_BELOW_VOICE):
    """What counts as silence in a take, dBFS: under its own background (voicecheck.quiet_level), under SILENT, or
    GAP_BELOW_VOICE dB under its voice (the 90th percentile), whichever is loudest. The last is what tells the clone's hiss
    from speech when the hiss sits over SILENT."""
    quiet = max(voicecheck.quiet_level(list(lv)), voicecheck.SILENT)
    return max(quiet, float(np.percentile(lv, 90)) - below) if len(lv) else quiet


def voiced(audio, sr):
    """(first, last) 10 ms window louder than silence_level, or None for a silent take. Edges are trimmed to these, so a
    take that opens on 2 s of hiss is not kept with the hiss (never-about-the-code, the DHH line, 2026-10-27)."""
    lv, _ = levels(audio, sr)
    q = silence_level(lv, EDGE_BELOW_VOICE)
    loud = lv > q
    held = np.convolve(loud.astype(int), np.ones(EDGE_RUN, dtype=int), "valid") == EDGE_RUN   # held[i]: i..i+RUN-1 all loud
    starts = np.nonzero(held)[0]
    if not len(starts):
        return None
    first, last = int(starts[0]), int(starts[-1]) + EDGE_RUN - 1
    for _ in range(EDGE_BACK):
        if first > 0 and lv[first - 1] > q - 6: first -= 1
        if last < len(lv) - 1 and lv[last + 1] > q - 6: last += 1
    return first, last


def longest_gap(audio, sr, span):
    """The longest run of silence between the voice's first and last sound, in seconds: quieter than the take's own
    background, or GAP_BELOW_VOICE dB under its voice, whichever is louder."""
    lv, _ = levels(audio, sr)
    inner = lv[span[0]:span[1] + 1]
    quiet = silence_level(lv)
    longest = run = 0
    for v in inner:
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
    """(audio at the model's pace with its edges trimmed, sample rate, fault or None): the line voiced until it is not
    silent, does not stall and does not end in a long silence, up to TRIES seeds. When every seed stalls or trails off, the
    take with the shortest silence comes back with its fault, to be ranked against the other rounds and listed, rather than
    stopping the whole video (a directed punchline paused 2.2 to 2.7 s on three seeds running, 2026-10-27). Only a line that
    is silent on every seed stops it."""
    import mlx.core as mx
    worst_kept = None
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
        gap = longest_gap(audio, sr, span)
        fault = (f"ended in {tail:.1f} s of silence" if tail > TAIL_DROP else
                 f"stalled for {gap:.1f} s mid-line" if gap > GAP_DROP else None)
        if fault is None:
            return trim(audio, sr, span), sr, None
        print(f"take {fault}; voicing it again", file=sys.stderr, flush=True)
        if worst_kept is None or max(tail, gap) < worst_kept[0]:
            worst_kept = (max(tail, gap), trim(audio, sr, span), sr, fault)
    if worst_kept is None:
        raise SystemExit(f"Drama 3 gave silence {TRIES} times for: {job['text']}")
    return worst_kept[1], worst_kept[2], worst_kept[3]


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
    # The reference's words are needed whether or not takes are heard back (--no-hearback turns off checking takes,
    # not transcribing the clip), so Whisper hears them whenever it is installed.
    if not ref_text and hearback.available():
        ref_text = hearback.hear(hearback.samples_of(clip))
        print(f"reference heard as: {ref_text}", flush=True)
    if not ref_text:
        raise SystemExit(f"Drama 3 needs the words spoken in {clip}: write them in a .txt beside it "
                         f"(faster-whisper, which would hear them, is not installed: npm run setup:drama)")
    model = load_model(model_path(spec["model"]))
    ref = {"ref_audio": str(clip), "ref_text": ref_text}
    for i, job in enumerate(spec["jobs"], 1):
        best = None
        run = bool(job.get("parts"))
        for round_ in range(HEAR_TRIES if hear_on else 1):
            audio, sr, fault = one_take(model, job, round_, ref)
            final = voicecheck.level(stretch(audio, sr, spec["speed"]), sr)
            words, got, heard, gone, spelled = [], None, "", [], []
            if hear_on:
                heard, words = hearback.hear_words(hearback.samples_from(final, sr))
                got = hearback.agreement(job["plain"], heard)
                gone = hearback.vanished(job["plain"], heard)   # a dropped punchline barely moves the letter score
                spelled = hearback.spelled_out(job.get("written", job["plain"]), job["plain"], heard)   # "n" said "E N"
            slow = hearback.drawled(wordtime.align(job["parts"], words, len(final) / sr)["sentences"]) if run and words else None
            if slow and fault is None:
                fault = f"drawled: {slow}"   # a sentence dragged apart, which no silence check sees through hiss
            ok = (got is None or got >= floor) and not gone and not spelled and fault is None
            rank = (ok, -len(gone), -len(spelled), fault is None, got or 0.0)
            if best is None or rank > best[0]:
                best = (rank, final, sr, got, heard, words, gone, spelled, fault)
            if ok:
                break
        _, final, sr, got, heard, words, gone, spelled, fault = best
        sf.write(job["wav"], final, sr, subtype="PCM_16")
        timing = wordtime.align(job["parts"], words, len(final) / sr) if run and hear_on else None
        hearback.write_check(job["wav"], job.get("key", ""), job["plain"], got, heard, [f'not heard: "{s}"' for s in gone] + [f'spelled out: heard the letters "{g}"' for g in spelled] + ([fault] if fault else []), timing)
        if job.get("keyFile"):
            Path(job["keyFile"]).write_text(job["key"])   # kept: a run stopped after this keeps this take
        print(f"voiced {i}/{len(spec['jobs'])}" + (f" ({got:.0%} heard back)" if got is not None else "")
              + (f", {timing['matched']}/{timing['words']} words timed from what was heard" if timing else ""), flush=True)


if __name__ == "__main__":
    main(sys.argv[1])
