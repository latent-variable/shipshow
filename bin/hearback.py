"""Hear a voiced take back, so a dropped or mangled word is caught without a person listening.

  .venv/bin/python bin/hearback.py spec.json      score the takes in spec.json, write `<take>.check`
  .venv/bin/python bin/hearback.py clip.wav       print what Whisper hears in one clip

spec.json, written by bin/voice.mjs:
  {"min": 0.9, "items": [{"text": "what the engine was told to say", "wav": "...", "key": "..."}]}

This is a VERIFICATION, never timing: ShipShow still places a sentence by where its take was put
(bin/voice.mjs), and a word inside it by its share of the letters. faster-whisper small.en listens to
a take, and the transcript is compared with the text by letters, spaces and punctuation gone
("FindBusiness" is two words to Whisper) and numbers spelled out ("29.3" is "twenty nine point three"
in a script). The score is the share of the letters that match, 0 to 1. Ported from DAIS
product-videos (studio/narrate.py), where it keeps the best of three takes and flags a scene under
90% to listen to.

Optional: it needs `npm run setup:hearback` (faster-whisper, requirements-hearback.txt; about 480 MB
for the model on the first run). Without it nothing here runs and nothing is required. The `.check`
file beside a take holds the take's key, so a take voiced again is never judged by an old hearing.
"""
import difflib
import json
import re
import subprocess
import sys
from pathlib import Path

MIN = 0.96   # a take hearing back under this much of its text is flagged to listen to (see below)
MODEL_REPO, MODEL_REVISION = "Systran/faster-whisper-small.en", "d1d751a5f8271d482d14ca55d9e2deeebbae577f"

ONES = ("zero one two three four five six seven eight nine ten eleven twelve thirteen "
        "fourteen fifteen sixteen seventeen eighteen nineteen").split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()
ORDINAL = {"one": "first", "two": "second", "three": "third", "five": "fifth",
           "eight": "eighth", "nine": "ninth", "twelve": "twelfth"}


def without_marks(text):
    """The words of a line, without OmniVoice's [laughter], [sigh] or [B EY1 S] marks: sounds or
    spellings rather than words anyone hears said."""
    return " ".join(re.sub(r"\[[^\]]*\]", " ", text).split())


def int_words(n):
    if n < 20:
        return ONES[n]
    if n < 100:
        return TENS[n // 10] + (" " + ONES[n % 10] if n % 10 else "")
    if n < 1000:
        return ONES[n // 100] + " hundred" + (" " + int_words(n % 100) if n % 100 else "")
    if n < 1_000_000:
        return int_words(n // 1000) + " thousand" + (" " + int_words(n % 1000) if n % 1000 else "")
    return " ".join(ONES[int(d)] for d in str(n))


def ordinal(words):
    head, _, last = words.rpartition(" ")
    last = ORDINAL.get(last) or (last[:-1] + "ieth" if last.endswith("y") else last + "th")
    return (head + " " if head else "") + last


def _pair(m):
    whole, sep, frac = m.group(1), m.group(2), m.group(3)
    if sep == ":":  # a clock time: 4:57, 5:05
        mins = int(frac)
        return int_words(int(whole)) + " " + ("o'clock" if mins == 0 else ("oh " if mins < 10 else "") + int_words(mins))
    lead = "" if int(whole) == 0 else int_words(int(whole)) + " "
    return lead + "point " + " ".join(ONES[int(d)] for d in frac)


def spoken_numbers(text):
    """Numbers as a narrator says them, so a take heard back as "29.3" compares with a script that says
    "twenty nine point three". Close is enough: this ranks takes, and a time or year read the other
    way only costs a few letters."""
    text = re.sub(r"(?<=\d),(?=\d{3}\b)", "", text)                  # 2,916
    text = re.sub(r"(\d+)\s*([.:])\s*(\d+)", _pair, text)           # 29.3, Whisper's "29 .3", 4:57
    text = re.sub(r"(\d+)(?:st|nd|rd|th)\b", lambda m: ordinal(int_words(int(m.group(1)))), text)
    return re.sub(r"\d+", lambda m: int_words(int(m.group())), text)


def agreement(text, heard):
    """How closely what a take says matches the text, 0 to 1, by letters with spaces and punctuation
    gone: Whisper writes "FindBusiness" as "Find Business" and "Next.js" as "next JS", which a
    word-by-word match counts as misses."""
    norm = lambda t: re.sub(r"[^a-z0-9]", "", spoken_numbers(t).lower())
    return difflib.SequenceMatcher(None, norm(without_marks(text)), norm(heard), autojunk=False).ratio()


def available():
    try:
        import faster_whisper  # noqa: F401
        return True
    except ImportError:
        return False


_model = None


def whisper():
    global _model
    if _model is None:
        from faster_whisper import WhisperModel
        from huggingface_hub import snapshot_download
        # small.en: base.en misheard words the take had right, failing good takes (DAIS, 2026-10).
        _model = WhisperModel(snapshot_download(MODEL_REPO, revision=MODEL_REVISION), device="cpu", compute_type="int8")
    return _model


def samples_of(wav):
    """16 kHz mono float samples of a file (faster-whisper's own decoder breaks on some PyAV versions)."""
    import numpy as np
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", str(wav), "-ar", "16000", "-ac", "1", "-f", "f32le", "pipe:1"],
                       capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.float32)


def samples_from(audio, sr):
    """16 kHz mono float samples of a float array at `sr`, without writing a file."""
    import numpy as np
    r = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(sr), "-ac", "1", "-i", "pipe:0",
                        "-ar", "16000", "-f", "f32le", "pipe:1"],
                       input=np.asarray(audio, dtype=np.float32).tobytes(), capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.float32)


def hear(samples):
    """What Whisper hears in 16 kHz samples."""
    return " ".join(seg.text.strip() for seg in whisper().transcribe(samples, language="en")[0]).strip()


def score(text, samples):
    """(0..1, what was heard) for a take's samples against its text."""
    heard = hear(samples)
    return agreement(text, heard), heard


def write_check(wav, key, text, got, heard, faults=()):
    """The `.check` file beside a take: what it was judged by, so bin/voice.mjs and the review packet
    can say which sentences to listen to. `score` is None when nothing could hear it back."""
    Path(wav).with_suffix(".check").write_text(json.dumps({
        "key": key, "text": text, "score": None if got is None else round(got, 3), "heard": heard,
        "faults": list(faults)}) + "\n")


def check(items):
    """Score each {"text", "wav", "key"} whose `.check` is not current. Returns [(wav, score)] of those scored."""
    done = []
    for item in items:
        mark = Path(item["wav"]).with_suffix(".check")
        have = json.loads(mark.read_text()) if mark.exists() else {}
        if have.get("key") == item["key"] and have.get("score") is not None:
            continue
        got, heard = score(item["text"], samples_of(item["wav"]))
        write_check(item["wav"], item["key"], item["text"], got, heard,
                    have.get("faults", []) if have.get("key") == item["key"] else [])
        done.append((item["wav"], got))
        print(f"heard {Path(item['wav']).stem}: {got:.0%}", flush=True)
    return done


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    if sys.argv[1].endswith(".json"):
        check(json.loads(Path(sys.argv[1]).read_text())["items"])
    else:
        print(hear(samples_of(sys.argv[1])))
