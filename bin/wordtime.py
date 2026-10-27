"""When each sentence and each written word of a voiced run is said, from the words Whisper heard.

  align(parts, heard, total) -> {"sentences": [{"start", "end", "words": [{"w", "at", "end"}]}],
                                 "matched": words heard, "words": words in all}
                                times in seconds from the start of the take

`parts` is the run's sentences as bin/lib.mjs `spokenWords` makes them: for each sentence a list of
{"w": the written word, "say": what the voice was told to say for it}. The two differ where `say`
maps a written word to spoken ones ("1952" is said "nineteen fifty two"), and a `say` key of several
words belongs to the first of them. `heard` is faster-whisper's word list for the take, [{"w", "start",
"end"}], from `word_timestamps=True` (bin/hearback.py, `hear_words`).

The script and the transcript are compared as letters, the way hear-back compares them (spaces,
punctuation and marks gone, numbers spelled out), because Whisper writes "FindBusiness" as two words and
"29.3" as a number. difflib matches the two letter strings; a written word is placed where its first
matched letter was heard, once at least half its letters matched. A word the voice dropped or Whisper
missed is placed between its matched neighbours, by its share of the letters. So a time is never worse
than "somewhere between the words either side", and when nothing matches the whole take is shared out by
letters, which is how a sentence was placed before Whisper timed anything (DESIGN D47).

Standard library only, so CI runs it without a venv. Ported in spirit from DAIS product-videos, which
times its cues from the same Whisper word timestamps.
"""
import difflib
import math
import re

import hearback

LETTER_SECONDS = 0.07   # a letter's worth of speech, for a word placed before the first or after the last match
TAIL = 0.1              # the quiet bin/omnivoice.py leaves after a take's last sound (EDGES), about, once stretched


def letters(text, years=False):
    """The letters of `text` as the voice says them: marks dropped, numbers spelled out, lowercased, only a-z0-9."""
    return re.sub(r"[^a-z0-9]", "", hearback.spoken_numbers(hearback.without_marks(text), years).lower())


def match(words, heard, years):
    """(script letters, [a, b) of each word in them, the time of each heard letter, script letter -> heard
    letter, how many letters matched) with numbers read as quantities or, with `years`, as years."""
    script, spans = "", []                  # the script's letters, and where each word's are
    for _, w in words:
        said = letters(w["say"], years)
        spans.append((len(script), len(script) + len(said)))
        script += said
    text, when = "", []                     # the transcript's letters, and the time of each: (seconds, seconds per letter, word end)
    for h in heard:
        hs = letters(h["w"], years)
        if not hs:
            continue
        per = max(h["end"] - h["start"], 0.0) / len(hs)
        text += hs
        when += [(h["start"] + i * per, per, h["end"]) for i in range(len(hs))]
    at, size = {}, 0
    for i, j, n in difflib.SequenceMatcher(None, script, text, autojunk=False).get_matching_blocks():
        for d in range(n):
            at[i + d] = j + d
        size += n
    return script, spans, when, at, size


def align(parts, heard, total):
    words = [(k, w) for k, part in enumerate(parts) for w in part]
    # "1952" in a transcript is "nineteen fifty two" to a script that says so, and a quantity to one that does not
    script, spans, when, at, _ = max((match(words, heard, years) for years in (False, True)), key=lambda m: m[4])
    n = len(words)
    start, end, matched = [None] * n, [None] * n, [False] * n
    for k, (a, b) in enumerate(spans):
        hit = [c for c in range(a, b) if c in at]
        if b > a and len(hit) >= math.ceil((b - a) / 2):
            first, last = hit[0], hit[-1]
            t, per, _ = when[at[first]]
            start[k] = max(0.0, t - (first - a) * per)      # letters of the word before the first match, at the heard pace
            end[k] = when[at[last]][2]
            matched[k] = True
    for k in range(1, n):                   # in order, whatever the letters did
        if matched[k] and matched[k - 1] and start[k] < start[k - 1]:
            start[k] = start[k - 1]
    for k in range(n):
        if matched[k] and end[k] < start[k]:
            end[k] = start[k]

    weight = [max(1, len(letters(w["w"]))) for _, w in words]
    k = 0
    while k < n:                            # a stretch of words nobody heard sits between its matched neighbours
        if matched[k]:
            k += 1
            continue
        j = k
        while j < n and not matched[j]:
            j += 1
        before = end[k - 1] if k else None
        after = start[j] if j < n else None
        size = sum(weight[k:j])
        if before is None and after is None:
            lo, hi = 0.0, total
        elif before is None:
            hi = after
            lo = max(0.0, hi - LETTER_SECONDS * size)
        elif after is None:
            lo = before
            hi = min(total, lo + LETTER_SECONDS * size)
        else:
            lo, hi = min(before, after), after
        hi = max(hi, lo)
        t = lo
        for m in range(k, j):
            start[m] = t
            t += (hi - lo) * weight[m] / size
            end[m] = t
        k = j

    if n:                                   # Whisper cuts the last word short at the end of a take; the take ends TAIL after it
        end[n - 1] = max(end[n - 1], total - TAIL)
    sentences, n = [], 0
    for part in parts:
        mine = [{"w": w["w"], "at": round(start[n + i], 3), "end": round(end[n + i], 3)} for i, w in enumerate(part)]
        n += len(part)
        sentences.append({"start": mine[0]["at"], "end": mine[-1]["end"], "words": mine} if mine else {"start": 0.0, "end": 0.0, "words": []})
    return {"sentences": sentences, "matched": sum(matched), "words": len(words)}

