"""Hear a voiced take back, so a dropped or mangled word is caught without a person listening.

  .venv/bin/python bin/hearback.py spec.json      score the takes in spec.json, write `<take>.check`
  .venv/bin/python bin/hearback.py clip.wav       print what Whisper hears in one clip

spec.json, written by bin/voice.mjs:
  {"min": 0.9, "items": [{"text": "what the engine was told to say", "wav": "...", "key": "..."}]}

This is verification first: faster-whisper small.en listens to a take, and the transcript is compared
with the text by letters, spaces and punctuation gone
("FindBusiness" is two words to Whisper) and numbers spelled out ("29.3" is "twenty nine point three"
in a script). The score is the share of the letters that match, 0 to 1. Ported from DAIS
product-videos (studio/narrate.py), where it keeps the best of three takes and flags a scene under
90% to listen to.

It is also timing, for a take that is a run of sentences (DESIGN D47): `hear_words` returns the words
with their times, from the same transcription that scores the take, and bin/wordtime.py lays the
script's sentences and words over them. Whisper times only runs; a take of one sentence is still placed
by where bin/voice.mjs put it, and a word in it by its share of the letters.

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

MIN = 0.97   # a take hearing back under this much of its text is flagged to listen to (see below)
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


def year_words(n):
    """A year as a narrator reads it: 1952 is "nineteen fifty two", 1905 "nineteen oh five", 1900 "nineteen hundred"."""
    hi, lo = divmod(n, 100)
    if lo == 0:
        return int_words(hi) + " hundred"
    return int_words(hi) + " " + ("oh " + ONES[lo] if lo < 10 else int_words(lo))


# The ways a number is read aloud, each tried and the closest kept: as a quantity, as a year ("nineteen fifty two"), or digit
# by digit ("A B C one two three", which Whisper writes "ABC-123"). Measured on qwen-phones-home, 2026-10-29: the digit-by-digit
# line kept failing at 96.5%, and its retakes were pointless.
READINGS = (False, True, "digits")


def spoken_numbers(text, years=False):
    """Numbers as a narrator says them, so a take heard as "29.3" compares with a script that says
    "twenty nine point three". Close is enough: this ranks takes, and a time read the other way only costs
    a few letters. A four digit number is a quantity by default ("one thousand nine hundred fifty two");
    with `years` one from 1100 to 1999 or 2010 to 2099 is read as a year, which is how a script that
    says "nineteen fifty two" is spelled out; with `years="digits"` every whole number is read a digit at a time.
    agreement() tries each (READINGS). "a hundred" is "one hundred" and the "and" in "a hundred and seventy one" is dropped,
    so a script that says it that way matches Whisper's "171" (qwen-phones-home's 04c, retaken four times at 96%, 2026-10-29)."""
    text = re.sub(r"(?<=\d),(?=\d{3}\b)", "", text)                  # 2,916
    text = re.sub(r"(?<=\d)\s*%", " percent", text)                  # 40%: Whisper writes the sign, the script says the word
    text = re.sub(r"(\d+)\s*([.:])\s*(\d+)", _pair, text)           # 29.3, Whisper's "29 .3", 4:57
    text = re.sub(r"(\d+)(?:st|nd|rd|th)\b", lambda m: ordinal(int_words(int(m.group(1)))), text)
    if years == "digits":
        text = re.sub(r"\d+", lambda m: " " + " ".join(ONES[int(d)] for d in m.group()) + " ", text)
    elif years:
        text = re.sub(r"(?<!\d)(?:1[1-9]\d\d|20[1-9]\d)(?!\d)", lambda m: year_words(int(m.group())), text)
    text = re.sub(r"\d+", lambda m: int_words(int(m.group())), text)
    text = re.sub(r"\ba (hundred|thousand|million)\b", r"one \1", text, flags=re.I)
    return re.sub(r"\b(hundred|thousand|million) and\b", r"\1", text, flags=re.I)


def agreement(text, heard):
    """How closely what a take says matches the text, 0 to 1, by letters with spaces and punctuation
    gone: Whisper writes "FindBusiness" as "Find Business" and "Next.js" as "next JS", which a
    word-by-word match counts as misses."""
    best = 0.0
    for years in READINGS:      # "1952" is "one thousand nine hundred fifty two" or "nineteen fifty two"
        norm = lambda t: re.sub(r"[^a-z0-9]", "", spoken_numbers(t, years).lower())
        best = max(best, difflib.SequenceMatcher(None, norm(without_marks(text)), norm(heard), autojunk=False).ratio())
    return best


def joined_letters(words):
    """Runs of single letters as one word, so "ETH", "E T H" and Whisper's or Parakeet's "E.T.H." all read "eth": the script
    writes an initialism one way and each listener another (eth-is-false's "ETH." was reported unheard, 2026-10-27)."""
    out, run = [], ""
    for w in words + [""]:
        if len(w) == 1 and w.isalpha():
            run += w
            continue
        if run:
            out.append(run)
            run = ""
        if w:
            out.append(w)
    return out


def vanished(text, heard):
    """The sentences of `text` that are missing from `heard` altogether, each of whose words is short in what was heard.
    The letter score cannot see these: "No." gone from a 25-word line still scored 98.8% (never-about-the-code, the
    "No. ... Also no." take, 2026-10-27), and a short punchline is the sentence Drama 3 drops most."""
    import collections
    words = lambda t, years: joined_letters([w.replace("'", "") for w in re.findall(r"[a-z0-9']+", spoken_numbers(without_marks(t), years).lower())])
    found = None
    for years in READINGS:
        short = collections.Counter(words(text, years)) - collections.Counter(words(heard, years))
        gone = []
        for sentence in re.split(r"(?<=[.!?])\s+", text.strip()):
            ws = words(sentence, years)
            if ws and all(short[w] > 0 for w in ws):
                gone.append(sentence)
                for w in ws:
                    short[w] -= 1
        found = gone if found is None or len(gone) < len(found) else found   # the reading of the numbers that misses least
    return found


ADDED_RUN = 5   # words in a row a take says that its line does not: the only two takes past 4 of 88 on disk repeated earlier lines (D83)


def added(text, heard, run=ADDED_RUN):
    """What a take says that its line does not, as runs of `run` words or more: Drama 3 hearing the takes before a line can
    say part of them again ("On October twenty sixth, the AI company Cohere published this" opened another scene's line,
    qwen-phones-home, 2026-10-29). Numbers are read both ways, as in vanished(), and the reading that adds least wins."""
    best = None
    words = lambda t, years: joined_letters([w.replace("'", "") for w in re.findall(r"[a-z0-9']+", spoken_numbers(without_marks(t), years).lower())])
    for years in READINGS:
        a, b = words(text, years), words(heard, years)
        out = [" ".join(b[j1:j2]) for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes()
               if op in ("insert", "replace") and (j2 - j1) - (i2 - i1) >= run]
        best = out if best is None or len(out) < len(best) else best
    return best


LETTER_WORDS = {"A", "I"}   # a capital A or I alone is usually a word, not a letter being spelled


def letter_groups(text):
    """Runs of capital letters in a line, as Whisper writes letters it hears spelled out: "EN", "E.N.", "E-N" or
    "E N" are each "EN". A word of several capitals is one group, and single capitals side by side, with no
    punctuation between them, join into one ("A" and "I" alone only join a neighbour that is a letter too)."""
    groups, run = [], ""
    for tok in re.findall(r"\S+", text):
        core = re.sub(r"^[^A-Za-z0-9]+|[^A-Za-z0-9.'-]+$", "", tok)
        letters_only = re.sub(r"[.'-]", "", core)
        broken = bool(re.search(r"[,;:!?]$", tok)) or (tok.endswith(".") and not re.fullmatch(r"([A-Z]\.)+", tok))
        if re.fullmatch(r"[A-Z]", letters_only) and (letters_only not in LETTER_WORDS or run):
            run += letters_only
        elif re.fullmatch(r"[A-Z]{2,}", letters_only):
            if len(run) >= 2:
                groups.append(run)
            run = letters_only
            groups.append(run)
            run = ""
            continue
        else:
            if len(run) >= 2:
                groups.append(run)
            run = ""
            continue
        if broken:
            if len(run) >= 2:
                groups.append(run)
            run = ""
    if len(run) >= 2:
        groups.append(run)
    return groups


def spelled_out(written, said, heard):
    """The letters a take spelled out that the script never asks for: each group of capitals Whisper wrote
    (letter_groups) that is not an acronym of the written line or of what the voice was told to say. Drama 3 read
    the respelling "en" (for the variable n) as the letters E, N on nearly every line of eth-is-false, and Whisper
    wrote "two to the EN"; the letter score passed it, because "EN" and "en" are the same letters (2026-10-27).
    `heard` is Whisper's text, case kept. Returns the groups, in order, once each."""
    allowed = set()
    for line in (without_marks(written), without_marks(said)):
        for g in letter_groups(line):
            allowed.add(g)
        for tok in re.findall(r"[A-Za-z][A-Za-z0-9'-]*", line):   # OpenAI is "OPENAI" and "AI"
            caps = re.findall(r"[A-Z]{2,}", tok)
            allowed.update(caps)
            if len(re.findall(r"[A-Z]", tok)) >= 2:
                allowed.add(re.sub(r"[^A-Za-z]", "", tok).upper())
    # Whisper writes some names in capitals: "QUEN" for the narrator's "Kwen", which the script writes "Qwen" (qwen-phones-home,
    # 2026-10-29: two lines retaken five times each for it). A single capital word of four letters or more that is nearly, but
    # not exactly, a name of the line (a capitalised word of the script) is that name misheard. A word spelled out letter by
    # letter comes back as itself ("NODE" for "node") and still counts, as does a short respelling ("EN" for "en").
    names = {w.lower() for line in (written, said) for w in re.findall(r"\b[A-Z][A-Za-z]{2,}", without_marks(line))}
    whole = {t for t in re.findall(r"[A-Za-z]+", heard) if re.fullmatch(r"[A-Z]{4,}", t)}
    def a_word(g):
        return g in whole and g.lower() not in names and any(difflib.SequenceMatcher(None, g.lower(), w).ratio() >= 0.75 for w in names)
    found = []
    for g in letter_groups(heard):
        if g not in allowed and g not in found and not a_word(g):
            found.append(g)
    return found


# A take that drags inside a sentence: Drama 3 once read "Like animals." with 3 s between the two words, and every other
# check passed it, since hiss filled the gap and no stall was long enough (never-about-the-code, 2026-10-27). Across 1,204
# word pairs in that video and eth-is-false, the longest gap between two words of one sentence was 1.9 s (a year said
# out loud). A pause between sentences is a beat and is never judged. bin/lib.mjs `drawled` is the same rule.
MAX_WORD_GAP = 2.5


def drawled(sentences):
    """The longest gap between two words of one sentence, as "<gap> s between "<a>" and "<b>"", when it is over
    MAX_WORD_GAP; else None. `sentences` is wordtime.align's: [{"words": [{"w", "at"}]}]."""
    worst = None
    for s in sentences or []:
        words = s.get("words") or []
        for a, b in zip(words, words[1:]):
            gap = b["at"] - a["at"]
            if gap > MAX_WORD_GAP and (worst is None or gap > worst[0]):
                worst = (gap, a["w"], b["w"])
    return None if worst is None else f'{worst[0]:.1f} s between "{worst[1]}" and "{worst[2]}"'


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


def hear_words(samples):
    """(what Whisper hears, [{"w", "start", "end"}] each word with its time) in 16 kHz samples."""
    segments = list(whisper().transcribe(samples, language="en", word_timestamps=True)[0])
    words = [{"w": w.word.strip(), "start": float(w.start), "end": float(w.end)} for seg in segments for w in (seg.words or []) if w.word.strip()]
    return " ".join(seg.text.strip() for seg in segments).strip(), words


def score(text, samples):
    """(0..1, what was heard) for a take's samples against its text."""
    heard = hear(samples)
    return agreement(text, heard), heard


def write_check(wav, key, text, got, heard, faults=(), timing=None):
    """The `.check` file beside a take: what it was judged by, so bin/voice.mjs and the review packet
    can say which sentences to listen to. `score` is None when nothing could hear it back. `timing`, for a
    run of sentences, is bin/wordtime.py's {"sentences", "matched", "words"}."""
    check = {"key": key, "text": text, "score": None if got is None else round(got, 3), "heard": heard, "faults": list(faults), "spelledChecked": True}
    if timing is not None:
        check["timing"] = timing
    Path(wav).with_suffix(".check").write_text(json.dumps(check) + "\n")


def check(items):
    """Score each {"text", "wav", "key"} whose `.check` is not current. Returns [(wav, score)] of those scored."""
    done = []
    for item in items:
        mark = Path(item["wav"]).with_suffix(".check")
        have = json.loads(mark.read_text()) if mark.exists() else {}
        if have.get("key") == item["key"] and have.get("score") is not None:
            if not have.get("spelledChecked"):   # heard before spelled_out existed: read what was heard again, no new hearing
                have["faults"] = [f for f in have.get("faults", []) if not f.startswith("spelled out")] + \
                    [f'spelled out: heard the letters "{g}"' for g in spelled_out(item.get("written", item["text"]), item["text"], have.get("heard", ""))]
                have["spelledChecked"] = True
                mark.write_text(json.dumps(have) + "\n")
            continue
        got, heard = score(item["text"], samples_of(item["wav"]))
        faults = [f for f in (have.get("faults", []) if have.get("key") == item["key"] else []) if not f.startswith("spelled out")]
        faults += [f'spelled out: heard the letters "{g}"' for g in spelled_out(item.get("written", item["text"]), item["text"], heard)]
        write_check(item["wav"], item["key"], item["text"], got, heard, faults)
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
