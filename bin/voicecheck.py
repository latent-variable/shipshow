"""Is a voiced take clean enough to keep, and making the kept ones even.

  python3 bin/voicecheck.py level jobs.json       set Kokoro takes to one speech level, in place
  python3 bin/voicecheck.py report videos/<name>  every take's level, opening and loudest moment

Ported from DAIS product-videos (studio/voicecheck.py), where the owner heard these in published
videos before anything measured them. Two faults come from OmniVoice's sampling:

  a SHOUT   a take whose loudest moment is far over the narrator's own level (8.9 dB, where a calm
            read of the same line stays under 7).
  a BURST   every piece the model makes opens with 20 to 30 ms of noise. Followed by silence it is a
            click before the first word; run straight into the voice it clips the first syllable.

What this does about each:
  clean(take)   bin/omnivoice.py, on every take: cuts the opening burst at the silence after it and
                fades the ends. A take whose voice runs straight out of the burst is made again with
                another seed, and only after several tries trimmed and reported.
  shout(take)   the same: a shout is made again.
  level(take)   every kept take's median speech is moved toward TARGET_DB by one gain, which is held
                back when it would put the take's loudest sample over PEAK_DB: a take that cannot reach
                the target stays a little quieter, and nothing is ever clipped. For Kokoro this is the
                only step, and it runs on takes already voiced, in place and without voicing them
                again: a Kokoro take's cache key is unchanged (the `.lvl` stamp beside it records
                that it was levelled, by this VERSION).

A shout is a 400 ms stretch louder than the take's own median by more than SHOUT_DB, so a quiet or
loud take is judged by itself.
"""
import hashlib
import json
import sys
from pathlib import Path

import numpy as np

VERSION = 3            # in an OmniVoice take's key and a Kokoro take's .lvl stamp: change a rule below, bump it
SPEECH_FLOOR = -40.0   # dBFS: a window louder than this is speech, not room
SILENT = -45.0         # dBFS: a 10 ms window quieter than this is silence
QUIET_OVER_FLOOR = 6.0 # dB: in a take with a hiss, a window this close to its background is silence too
VOICE_MARGIN = 8.0     # dB: but silence always stays this far under the take's median 10 ms window
SHOUT_DB = 8.0         # a 400 ms stretch this far over the take's own median is a shout
TARGET_DB = -23.0      # the median speech a kept take is moved toward, in dBFS (50 ms windows)
PEAK_DB = -3.0         # the loudest sample a kept take may reach after levelling
PEAK_MAX = 10 ** (PEAK_DB / 20)
FADE_IN, FADE_OUT = 0.008, 0.03
BURST = 0.06           # the decoder's opening burst is over by then: the silence must begin by it
GAP = 0.04             # the silence that has to follow the burst for the voice to start clean


def windows(a, sr, size, hop=None):
    """(start seconds, dBFS RMS) of each window."""
    w, h = int(sr * size), int(sr * (hop or size))
    out = []
    for i in range(0, max(1, len(a) - w + 1), h):
        seg = a[i:i + w]
        out.append((i / sr, 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9) if len(seg) else -180.0))
    return out


def speech_level(a, sr):
    """Median dBFS of the 50 ms windows that are speech."""
    lv = [d for _, d in windows(a, sr, 0.05) if d > SPEECH_FLOOR]
    return float(np.median(lv)) if lv else SPEECH_FLOOR


def quiet_level(levels):
    """What counts as silence in one take, dBFS: SILENT, or a little over the take's own background when that is louder. A
    clone copies the room of its clip, hiss included (the owner's sits near -39 dBFS), and a take of it never drops under
    SILENT, so every take read as starting at once and lost 30 ms of its first syllable to trim() (D53)."""
    if not len(levels):
        return SILENT
    floor, middle = float(np.percentile(levels, 10)), float(np.median(levels))
    # never within VOICE_MARGIN of the take's middle: a take that is all voice has its voice as its "background"
    return max(SILENT, min(floor + QUIET_OVER_FLOOR, middle - VOICE_MARGIN))


def clean(a, sr):
    """(the take with the decoder's opening burst cut and its ends faded, whether the voice starts
    clean). Usually silence follows the burst and then the voice: the burst is cut at that silence.
    When the voice runs straight out of the burst there is nothing to cut at, its first syllable
    sounds clipped, and the take is not clean."""
    a = np.asarray(a, dtype=np.float32).copy()
    lv = [d for _, d in windows(a, sr, 0.01)]
    quiet = quiet_level(lv)
    need, cut_at = int(GAP / 0.01), None
    for i in range(int(BURST / 0.01) + 1):           # a silence starting within the burst's length
        if len(lv) >= i + need and all(d < quiet for d in lv[i:i + need]):
            j = i
            while j < len(lv) and lv[j] < quiet:
                j += 1
            cut_at = max(0, j - 2) * 0.01      # keep 20 ms of the quiet before the voice
            break
    if cut_at is not None:
        a = a[int(sr * cut_at):]
    n_in, n_out = min(len(a), int(sr * FADE_IN)), min(len(a), int(sr * FADE_OUT))
    if n_in:
        a[:n_in] *= np.linspace(0, 1, n_in, dtype=np.float32)
    if n_out:
        a[-n_out:] *= np.linspace(1, 0, n_out, dtype=np.float32)
    return a, cut_at is not None


def trim(a, sr):
    """The last resort for a take whose voice runs out of the burst: the burst's length cut and faded
    in. The first syllable may still sound short; the voice step reports it to listen to."""
    a = np.asarray(a, dtype=np.float32)[int(sr * 0.03):].copy()
    n = min(len(a), int(sr * 0.015))
    if n:
        a[:n] *= np.linspace(0, 1, n, dtype=np.float32)
    return a


def shout(a, sr):
    """A description of the loudest 400 ms when it is a shout, else None."""
    w = windows(a, sr, 0.4, 0.1)
    speech = [d for _, d in w if d > SPEECH_FLOOR]
    if not speech:
        return None
    at, loudest = max(w, key=lambda x: x[1])
    over = loudest - float(np.median(speech))
    return f"a shout at {at:.1f}s, {over:.1f} dB over its own speech" if over > SHOUT_DB else None


def level(a, sr):
    """The take times one gain: the one that puts its median speech at TARGET_DB, or less when that
    would put its loudest sample over PEAK_MAX. Nothing is clipped or squashed, so the shape of every
    vowel is the model's. (Before VERSION 2 a tanh knee above 0.4 flattened the peaks of short takes:
    11 to 17% of the samples of "Sound familiar?" and "It's a fair worry.", audible as a close mic.)"""
    a = np.asarray(a, dtype=np.float32)
    peak = float(np.max(np.abs(a))) if len(a) else 0.0
    gain = 10 ** ((TARGET_DB - speech_level(a, sr)) / 20)
    if peak > 0:
        gain = min(gain, PEAK_MAX / peak)
    return a * np.float32(gain)


def stamp(key):
    """What a `.lvl` file holds for a take made from `key`: the rules' version and the take's identity,
    so a take voiced again under the same name is not mistaken for the one that was levelled."""
    return f"v{VERSION}:{hashlib.sha256(str(key).encode()).hexdigest()[:12]}"


def level_takes(items):
    """Level each {"wav", "key"} whose `.lvl` stamp is not current, in place. Returns how many."""
    import soundfile as sf
    done = 0
    for item in items:
        wav = Path(item["wav"])
        mark = wav.with_suffix(".lvl")
        if mark.exists() and mark.read_text() == stamp(item["key"]):
            continue
        a, sr = sf.read(wav, dtype="float32")
        if a.ndim > 1:
            a = a.mean(axis=1)
        sf.write(wav, level(a, sr), sr, subtype="PCM_16")
        mark.write_text(stamp(item["key"]))
        done += 1
    return done


def report(video):
    """[(take name, speech dBFS, peak dBFS, opening dBFS, shout or None)] for every take of a video."""
    import soundfile as sf
    rows = []
    for wav in sorted(Path(video, "assets", "voice").glob("*.wav")):
        a, sr = sf.read(wav, dtype="float32")
        head = windows(a[: int(sr * 0.01)], sr, 0.01)[0][1]
        rows.append((wav.stem, speech_level(a, sr), 20 * np.log10(float(np.max(np.abs(a))) + 1e-9), head, shout(a, sr)))
    return rows


if __name__ == "__main__":
    if len(sys.argv) == 3 and sys.argv[1] == "level":
        print(f"levelled {level_takes(json.loads(Path(sys.argv[2]).read_text())['items'])} take(s)")
    elif len(sys.argv) == 3 and sys.argv[1] == "report":
        for name, sp, pk, head, loud in report(sys.argv[2]):
            print(f"{name:18} speech {sp:6.1f}  peak {pk:6.1f}  opens {head:6.1f} dBFS  {loud or 'no shout'}")
    else:
        sys.exit(__doc__)
