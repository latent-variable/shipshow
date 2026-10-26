"""Voice sentences with OmniVoice on Apple's MLX (mlx-audio), in one process, no app.

  .venv/bin/python bin/omnivoice.py jobs.json

jobs.json, written by bin/voice.mjs:
  {"speed": 1.25, "voice": {"name": "caro_davy"} | {"name": "lino", "wav": "...", "text": "..."},
   "cache": "<dir for the trimmed reference>", "hearback": true, "min": 0.9,
   "jobs": [{"text": "...", "wav": "...", "seed": 1, "key": "..."}]}

OmniVoice clones every voice from a short recording, so a voice here is a recording: a clone is
a clip in local/voices/, a built-in one a clip from kyutai/tts-voices (bin/omnivoice-voices.json).
OmniVoice wants a 3 to 10 s reference: silence at the clip's edges is trimmed first, then a clip
still too long is cut at its last pause before 10 s. Each take is one sentence, so nothing is
chunked.

Speed is applied after generation, never by squeezing it. OmniVoice fills the duration it is
given, and a window cut to 1.3x its natural length dropped or garbled words in 7 of 24 sentences
(measured 2026-10-17 with Whisper); generating at the natural length and then time-stretching
the take (ffmpeg atempo, pitch kept) dropped none. The padding's silence at a take's edges is
trimmed. A take that comes out silent, which a short line can, is voiced again with another seed.

The models sample, so every take is checked before it is kept (bin/voicecheck.py, ported from DAIS
product-videos, where the owner heard these in published videos): the burst of noise OmniVoice opens
every take with is cut at the silence after it, a take whose voice runs straight out of the burst or
that shouts is voiced again with another seed, and the kept take is set to one speech level. When
faster-whisper is installed (bin/hearback.py, `npm run setup:hearback`) the take is also heard back
and compared with its text; the best of three is kept, and a take still under the threshold is
reported in its `.check` file. Without it the first two still run. A voice with no transcript is
given one by hearing its reference back (the model clones better with the words spoken in it).
"""
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

import hearback
import voicecheck

SPEC = json.loads((Path(__file__).parent / "omnivoice-voices.json").read_text())
# 16 steps is twice as fast and dropped and repeated words on a long line (measured in a
# bake-off against Pocket and Qwen3-TTS); 32 does not.
STEPS = 32
SR = 24000
REF_SECONDS = 10.0
SILENT_DB = -45.0   # a take whose loudest moment is below this is silence, not speech
EDGES = (0.06, 0.12)   # seconds of quiet kept before and after the words
TRIES = 3         # silent takes: voiced again with another seed
# A take that opens on the burst or shouts: another seed, up to this many. Some voices start speaking at
# the first sample on every seed (a clone cut from a clip with no lead-in did: 1 clean take in 24), so
# more tries cost time and change nothing; such a take is trimmed and reported to listen to.
CLEAN_TRIES = 3
HEAR_TRIES = 3    # takes compared with the text, when faster-whisper is installed


def probe_seconds(clip):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(clip)],
                         check=True, capture_output=True, text=True).stdout
    return float(out)


def silences(clip):
    """[(start, end)] of each pause in a clip."""
    probe = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(clip), "-af", "silencedetect=noise=-35dB:d=0.2",
                            "-f", "null", "-"], capture_output=True, text=True).stderr
    starts = [float(t) for t in re.findall(r"silence_start: ([0-9.]+)", probe)]
    ends = [float(t) for t in re.findall(r"silence_end: ([0-9.]+)", probe)]
    merged = []
    for s, e in zip(starts, ends + [probe_seconds(clip)] * (len(starts) - len(ends))):
        if merged and s - merged[-1][1] < 0.05:   # a click between two silences is still silence
            merged[-1] = (merged[-1][0], e)
        else:
            merged.append((s, e))
    return merged


def reference(voice, cache):
    """(path of the reference clip, its transcript or None) for a voice."""
    if voice.get("wav"):
        clip, text = Path(voice["wav"]), voice.get("text")
    else:
        from huggingface_hub import hf_hub_download
        entry = SPEC["builtIn"][voice["name"]]
        entry = entry if isinstance(entry, dict) else {"file": entry}
        clip = Path(hf_hub_download(SPEC["voicesRepo"], entry["file"], revision=SPEC["voicesRevision"]))
        text = entry.get("text")
    seconds = probe_seconds(clip)
    if seconds <= REF_SECONDS:
        return clip, text
    # Trim silence at the edges first: it holds no words, so a transcript stays true.
    pauses = silences(clip)
    start = next((e for s, e in pauses if s <= 0.05), 0.0)
    end = next((s for s, e in reversed(pauses) if e >= seconds - 0.05), seconds)
    start, end = max(0.0, start - 0.15), min(seconds, end + 0.15)
    if end - start > REF_SECONDS:
        if text:
            raise SystemExit(f"{clip} has {end - start:.1f} s of speech and a transcript beside it, which cannot be cut "
                             f"to fit: OmniVoice wants a 3 to 10 s reference. Trim the clip and its .txt, or delete the .txt.")
        inner = [s for s, e in pauses if start + 3.0 <= s <= start + REF_SECONDS]
        end = max(inner, default=start + REF_SECONDS) + 0.15
        if not inner:
            print(f"warning: {clip} has no pause to cut at before 10 s, so its reference ends mid-word", file=sys.stderr)
    Path(cache).mkdir(parents=True, exist_ok=True)
    out = Path(cache) / f"{voice['name']}-reference.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(clip), "-ss", f"{start:.2f}", "-to", f"{end:.2f}",
                    "-ar", str(SR), "-ac", "1", str(out)], check=True)
    return out, text


def seconds_for(estimator, text):
    """How long a sentence should run: mlx-audio's own sizing of it (a fixed sentence's pace,
    padded 15%), exactly what it does unasked. Never shorter: see the docstring above."""
    frames = max(10, int(estimator.estimate_duration(text, "Nice to meet you.", 25) * 1.15))
    return frames * 960 / SR


def trim(audio):
    """The take without the silence the 15% padding leaves at its edges: it played as dead air
    between sentences, 13.8 s of a 67 s video (measured 2026-10-17). The pauses voice.mjs puts
    between sentences are the designed ones."""
    win = int(SR * 0.01)
    frames = audio[: len(audio) // win * win].reshape(-1, win)
    rms = 20 * np.log10(np.sqrt((frames ** 2).mean(axis=1)) + 1e-9)
    loud = np.nonzero(rms > SILENT_DB)[0]
    if not len(loud):
        return audio
    start = max(0, loud[0] * win - int(EDGES[0] * SR))
    end = min(len(audio), (loud[-1] + 1) * win + int(EDGES[1] * SR))
    return audio[start:end]


def stretch(audio, speed):
    """The take played at `speed`, its pitch kept (ffmpeg atempo)."""
    if abs(speed - 1.0) < 1e-6:
        return audio
    r = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "pipe:0",
                        "-af", f"atempo={speed}", "-f", "f32le", "pipe:1"], input=audio.tobytes(), capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.float32)


def transcript(model, tokens, clip, name, cache):
    """The words spoken in a voice's reference, heard from the reference as the model sees it: decoded
    from its tokens, not the original file, or words the model never got leak into the take (DAIS).
    Cached beside the reference, keyed by the clip's bytes."""
    import hashlib
    import mlx.core as mx
    key = hashlib.sha256(Path(clip).read_bytes()).hexdigest()[:16]
    saved = Path(cache) / f"{name}-transcript.json"
    if saved.exists() and json.loads(saved.read_text()).get("key") == key:
        return json.loads(saved.read_text())["text"]
    text = hearback.hear(hearback.samples_from(np.array(model.audio_tokenizer.decode(tokens).astype(mx.float32)).reshape(-1), SR))
    saved.write_text(json.dumps({"key": key, "text": text}, indent=1) + "\n")
    return text


def one_take(model, tokens, ref_text, estimator, job, round_):
    """(audio, faults): the sentence voiced until it starts clean and does not shout, up to CLEAN_TRIES
    seeds. `audio` is the clean take, at the model's natural length, unstretched. What is still wrong
    after that is returned as words."""
    import mlx.core as mx
    audio, faults = None, []
    for k in range(CLEAN_TRIES):
        faults = []
        for attempt in range(TRIES):
            mx.random.seed(job["seed"] + (round_ * CLEAN_TRIES * TRIES + k * TRIES + attempt) * 7919)
            out = list(model.generate(text=job["text"], language="english", ref_tokens=tokens, ref_text=ref_text,
                                      num_steps=STEPS, duration_s=seconds_for(estimator, job["text"])))
            raw = np.concatenate([np.array(r.audio, dtype=np.float32) for r in out])
            peak = 20 * np.log10(max(float(np.abs(raw).max()), 1e-9))
            if peak > SILENT_DB:
                break
            print(f"take came out silent ({peak:.0f} dB); voicing it again", file=sys.stderr, flush=True)
        else:
            raise SystemExit(f"OmniVoice gave silence {TRIES} times for: {job['text']}")
        audio, ok = voicecheck.clean(raw, SR)
        loud = voicecheck.shout(audio, SR)
        if ok and not loud:
            return audio, []
        faults = ([] if ok else ["starts at once, with no lead-in after the model's opening burst, so its first syllable may sound clipped"]) + ([loud] if loud else [])
    if faults and faults[0].startswith("starts at once"):
        audio = voicecheck.trim(audio, SR)
    return audio, faults


def finish(audio, speed):
    """The kept take as played: silence at its edges trimmed, stretched to speed, one speech level."""
    return voicecheck.level(stretch(trim(audio), speed), SR)


def main(spec_path):
    import mlx.core as mx
    from huggingface_hub import snapshot_download
    from mlx_audio.tts.models.omnivoice.duration import RuleDurationEstimator
    from mlx_audio.tts.models.omnivoice.utils import create_voice_clone_prompt
    from mlx_audio.tts.utils import load_model

    spec = json.loads(Path(spec_path).read_text())
    hear_on = spec.get("hearback", True) and hearback.available()
    floor = spec.get("min", hearback.MIN)
    clip, ref_text = reference(spec["voice"], spec["cache"])
    model = load_model(snapshot_download(SPEC["model"], revision=SPEC["revision"]))
    tokens = create_voice_clone_prompt(str(clip), tokenizer=model.audio_tokenizer, max_duration_s=REF_SECONDS)
    mx.eval(tokens)
    if not ref_text and hear_on:
        Path(spec["cache"]).mkdir(parents=True, exist_ok=True)
        ref_text = transcript(model, tokens, clip, spec["voice"]["name"], spec["cache"])
        print(f"reference heard as: {ref_text}", flush=True)
    estimator = RuleDurationEstimator()
    for i, job in enumerate(spec["jobs"], 1):
        best = None
        for round_ in range(HEAR_TRIES if hear_on else 1):
            audio, faults = one_take(model, tokens, ref_text, estimator, job, round_)
            final = finish(audio, spec["speed"])
            got, heard = hearback.score(job["text"], hearback.samples_from(final, SR)) if hear_on else (None, "")
            rank = (not faults, got is None or got >= floor, got or 0.0)
            if best is None or rank > best[0]:
                best = (rank, final, faults, got, heard)
            if got is None or got >= floor:
                break    # a fault one_take could not clear is not cleared by another hearing
        _, final, faults, got, heard = best
        sf.write(job["wav"], final, SR, subtype="PCM_16")
        hearback.write_check(job["wav"], job.get("key", ""), job["text"], got, heard, faults)
        print(f"voiced {i}/{len(spec['jobs'])}" + (f" ({got:.0%} heard back)" if got is not None else ""), flush=True)


if __name__ == "__main__":
    main(sys.argv[1])
