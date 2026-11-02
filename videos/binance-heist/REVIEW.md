# Review: binance-heist

Plan (`npm run critics`): thorough, from `"importance": "high"` (public, Lino's channel, a theft four days old with named companies,
a named state and named people). Seven critics, Sonnet, at most three rounds, until no blocking or objective major finding is left;
Opus only in a final round for a taste critic still failing. Every critic is a fresh agent that never saw the build.

Spend said before round 1: about 800k critic tokens a round for a 13-minute video, up to about 2M in all.

## Round 1 (2026-11-02, first cut, 790 s)

Every critic failed, which is the first cut's usual result. 47 findings: 1 blocking, 21 major, 25 minor.

| Critic | Verdict | Findings | Tokens |
|---|---|---|---|
| critic-accuracy | fail | 1 blocking, 5 major, 5 minor | 125k |
| critic-clarity | fail | 5 major, 3 minor | 87k |
| critic-pacing | fail | 4 major, 3 minor | 91k |
| critic-sync | fail | 3 major, 4 minor | 151k |
| critic-visuals | fail | 4 major, 3 minor | 142k |
| critic-consistency | fail | 1 major, 2 minor | 105k |
| critic-engagement | fail | 4 major, 4 minor | 131k |

**Fixed**

- accuracy-1 (blocking): the hook said about half was frozen "within the hour". Only the first freezes came that fast (Tether at
  21:01, Circle at 21:04 UTC); about half took hours ($2.7B by 00:30 UTC). Now "within the hour ... the first of it froze. Within hours,
  about half", and the card says the same.
- accuracy-2, -3, -4: the laptop keeps Binance's "may" everywhere ("if Binance's early read is right", "may have started", "Binance's
  early read"); the close calls the signing reading "the likeliest reading", with "not yet confirmed" on screen; the speed-needs-no-AI
  line is "my read", and sources.md tags it opinion.
- accuracy-5: The Next Web's headline is read verbatim. accuracy-6: Mandiant's group is "a group it suspects is North Korean", the CEO a
  "crypto boss", and "Mandiant couldn't verify the AI part" is said and shown. accuracy-7, -8, -11: sources.md now carries Chainalysis'
  own attribution and doubling-back line, Teng's post (the capture shown) and BleepingComputer; "usually keeps", "the two firms that traced
  the money", "a technical post mortem". accuracy-9: "as one lawyer put it" and "no issuer to freeze it". accuracy-10: the split scene says
  aloud that the counts were taken at different moments and do not add up.
- clarity-1: 03c says the note was signed by Binance's own hot wallet ("that's the stamp") and that exactly one note matched the count.
  clarity-2: the Aave move is told as pawning a watch about to be reported stolen, and "overcollateralized" is glossed on screen.
  clarity-3: as accuracy-10. clarity-4: a blockchain is defined in 02b, ether as "the coin of the Ethereum network", and stablecoins as
  "the digital dollars from the start". clarity-5: the regulator line is cut, the Tron pattern shortened, and how a freeze works is said
  ("the company controls the token's code") and how frozen coins come back ("burn the frozen coins and issue fresh ones, through courts
  and law enforcement"). clarity-6: "a small program", not "code". clarity-7: the close adds that the thieves swapped what they could
  before the switch. clarity-8: the stamp sentence is split.
- pacing-1: capture bars show a short source label, not the URL. pacing-2: the densest sentences are trimmed (one number per beat in 03c
  and 04b, the regulator line gone); the voice's own pace stays (speed 1.0). pacing-3: 06b's Anthropic card reveals its three claims on
  their words. pacing-4: beats after "ten blockchains at once", after "then ninety five" and after "Not recovered from the thieves".
  pacing-6: a real tool bug, fixed in `bin/review.mjs` (DESIGN D94): a cued `<img>` was read as if all later text were its own.
- sync-1, -2, -4: memes moved onto the line that sets them up ("Maybe both are true", "Flip a switch", "wallets"), so the number
  being spoken stays on screen. sync-3: "burn, reissue, return" is now said. sync-5: the Bitcoin row lands on "bitcoin". sync-6: the
  clamp photo lands on "clamp". sync-7: the Bitget pill is gone.
- visuals-1: source, caption and label lines raised to 32 to 34 px in a brighter grey. visuals-2: the freeze total is headline size.
  visuals-4: the captures are narrower (bigger text), light pages get a white backing, and The Next Web's paragraph is whole.
  visuals-5: the Selig card is gone with its line.
- consistency-1: act one is "The till", not "The vault" (the vault is what was not hit). consistency-2: stablecoins are tied to
  "digital dollars" once and called stablecoins after. consistency-3: money leaving is red in 07b too.
- engagement-1, -2: two memes added where the last act had none (shut up and take my money on "Not recovered from the thieves",
  afraid to ask on the missing post-mortem), nine in all, about one every 90 seconds, and the stake ("if you keep coins on an exchange") is in
  the questions. engagement-3: memes land on their setup or are held five seconds with a longer pause. engagement-4: as pacing-3.
  engagement-6: "I'm rooting for a no" states the narrator's bias as the joke. engagement-8: the close points at the post-mortem and the
  hold is 5 s.

**Declined or accepted**

- visuals-2 (top-heavy hook), visuals-3 (half-empty frames), visuals-6, -7: the frames measured were mid-build, where elements not
  yet cued hold their space. Each stage is centred in the scene window and is balanced once its pieces arrive; reserving space is
  what keeps a layout from jumping, which visuals-6 asks for. Accepted as minor.
- engagement-7 (acts too alike): subjective, one pass. Each act has its own sky, accent, card colour and music bed; a ledger or paper
  treatment for the bill act would be a second theme inside the video. Declined.
- pacing-5, -7 (stretches near the stillness line, within-act silences): within the limits; the owner asked for breathing room.
  Accepted.
