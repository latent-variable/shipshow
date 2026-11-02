# Sources: binance-heist

An explainer for Lino's YouTube channel, narrated by the invented `narrator-uk` voice (no real person cloned): how about
$6.3 billion was taken from Binance on 2026-10-29, how about half of it was frozen and why the rest could not be, who did it,
whether AI was involved, and what Binance is doing about it. Every fact below was read at its source between 2026-11-01 and
2026-11-02, four days after the theft, while the story was still moving: Binance's own post-mortem had not been published.
Lines marked **opinion** are the channel's view, said by the narrator as "my read". Lines marked **ours** are arithmetic on a
source's published numbers, with the working. Lines marked **inferred** are a reading the sources allow but do not state; the
video says so aloud where it uses one.

## Primary sources

| Id | Source | Read |
|---|---|---|
| BA | Binance, "Security Incident Update", support announcement, published 2026-10-30 02:23, updated 11:36, binance.com/en/support/announcement/detail/c5a8729a97ac486d963784d96c5642d7: "Binance's initial investigation suggests that the security incident may involve a compromised DevOps engineer's laptop, which allowed an attacker to gain access to a service container and submit unauthorized withdrawal transactions." "We have found no evidence of any wallet private key leak." About $6.3B estimated, roughly $3B frozen on-chain, "User funds are safe", losses covered from SAFU and company funds, withdrawals suspended, the affected address authorization revoked, a technical post-mortem to follow | page via fetch, 2026-11-02 |
| BU | Binance recovery update titles on the same support site: #3 (2026-10-31) "90% of Stolen Assets Replenished; Proof of Reserves Snapshot Provided"; #4 (2026-11-01) "Withdrawals Resume in Phases" | titles only |
| TRM | TRM Labs (TRM Team), "North Korea steals USD 6.36 billion from Binance in the largest hack in history", dated 2026-10-29, `datePublished` 2026-10-30 02:10 UTC, trmlabs.com/resources/blog/north-korea-steals-usd-6-36-billion-from-binance-in-the-largest-hack-in-history | page via fetch, 2026-11-02 |
| CH | Chainalysis Team, "Binance exploit: latest findings and response", 2026-10-30, chainalysis.com/blog/binance-exploit-latest-findings-and-response/ | page via fetch, 2026-11-02 |
| CD | CoinDesk, "Binance loses over $6 billion in the largest crypto hack to date", 2026-10-29 17:12 EDT, updated 2026-10-30 | page via fetch |
| CN1 | CNBC, "Binance hack: Investigators in a 'cat and mouse game' to recover $6.3 billion in stolen funds", 2026-10-30 | page via fetch |
| CN2 | CNBC, "Billions in crypto frozen in Binance hack: here's what happens next", 2026-10-29, updated 2026-10-30 | page via fetch |
| CN3 | CNBC, Binance outflows after withdrawals resumed, 2026-11-01, updated 2026-11-02 00:09 EST, cnbc.com/2026/11/02/binance-outflow-hack-bitcoin.html | page via fetch |
| CN4 | CNBC, crypto prices after the hack, 2026-10-30, cnbc.com/2026/10/30/bitcoin-ether-price-binance-security-scare-rattles-crypto-markets.html | agent's fetch, quoted |
| CN5 | CNBC, Binance asset coverage and withdrawals, 2026-10-31, cnbc.com/2026/10/31/binance-hack-asset-coverage-withdrawals.html | agent's fetch, quoted |
| DE | Decrypt, "Binance sets aside $6.34B to cover hack losses, CEO says your assets are safe", 2026-10-30, decrypt.co/382237 | page via fetch |
| CT | Cointelegraph Magazine, Christina Comben, "Binance hackers raced to move billions before it could be frozen", 2026-10-30 | page via fetch |
| CBS | CBS News (AP), "Binance hack: North Korea", updated 2026-10-31 19:20 EDT, cbsnews.com/news/binance-hack-north-korea/ | page via fetch |
| NBC | NBC News, "FBI says North Korea was behind the $6.3 billion Binance crypto hack", 2026-10-31 18:51 EDT | agent's fetch, quoted |
| IJ | Insurance Journal (Bloomberg: Micah Barkley, Emma Haidar, Ryan Weeks), 2026-11-01, insurancejournal.com/news/international/2026/11/01/891003.htm | page via fetch |
| TNW | The Next Web, Ana Maria Constantin, "North Korean hackers used AI in crypto heists record $6bn Binance theft", 2026-11-02 11:11 UTC, thenextweb.com/news/north-korean-hackers-ai-crypto-heists-binance (reporting Bloomberg) | page via fetch |
| GM | Google Cloud / Mandiant, "UNC1069 targets cryptocurrency with AI-enabled social engineering", 2026-02-09, cloud.google.com/blog/topics/threat-intelligence/unc1069-targets-cryptocurrency-ai-social-engineering | page via fetch |
| AN | Anthropic, "Detecting and countering misuse of AI: August 2025", 2025-08-27, anthropic.com/news/detecting-countering-misuse-aug-2025 | page via fetch |
| REG | The Register, "North Korea stole $2B in crypto in 2025", 2025-12-18 (Chainalysis figures) | page via fetch |
| TB | The Block, "Trump looking into Binance hack; calls grow for crypto rules", 2026-10-30, theblock.co/news/regulation/2026-10-30-trump-looking-into-binance-hack-calls-grow-for-crypto-rules-432236 | agent's fetch, quoted |
| IC3 | FBI IC3 PSA I-022625-PSA, 2025-02-26, ic3.gov/PSA/2025/PSA250226: TraderTraitor named for the Bybit theft | listed in search, cited by CBS and TRM |

## Terms (one name each, in narration, captions and on screen)

| Term | Means | Not |
|---|---|---|
| Binance | the world's largest crypto exchange (CD, CBS) | |
| the exchange | Binance | |
| hot wallet | a wallet kept online so withdrawals go out at once; the till | not "the vault" |
| cold storage | wallets kept offline, where most customer assets sit (DE) | |
| signature | the mark a private key puts on an instruction; the blockchain moves money for any instruction with a valid one | |
| private key | the secret that makes a wallet's signatures | |
| the signing system | Binance's machines that hold the hot wallets' keys and sign withdrawals. Our phrase; Binance says "service container" and its review covers "key management and signing" (DE) | not a claim about what Binance's containers are |
| the note, the delegation | an EIP-7702 authorization: a signed note that hands a wallet's behaviour to a program (TRM) | |
| the sweeper | the attacker's program the note pointed to, "a sweeper contract that accepts instructions only from the operator" (TRM) | |
| the count | the wallet's running transaction count, a nonce (TRM) | "nonce" appears in small type only |
| stablecoin | a token meant to be worth one dollar, issued by a company: Tether's USDT, Circle's USDC | |
| frozen | stopped from moving by the token's issuer; not returned (CN2) | not "recovered" |
| TraderTraitor | the North Korean hacking unit TRM, Chainalysis and the FBI name | the press's "Lazarus" is said once, as ZachXBT's word |
| TRM Labs, Chainalysis | blockchain-tracing firms | |

## Claims

### 01 The hook

| Claim | Source |
|---|---|
| On Thursday 2026-10-29, starting at 20:05 UTC, about $6.36 billion moved out of Binance wallets on ten blockchains, most of it in about 20 minutes | TRM: "an attacker moved approximately USD 6.36 billion out of Binance wallets on ten blockchains", "most of it in about 20 minutes starting at 20:05 UTC" |
| Binance estimates about $6.3 billion | BA, CD |
| The largest crypto theft on record | CD headline; CH: "the largest theft in crypto history"; TRM title |
| About four times the previous record, Bybit's $1.5B in February 2025, which the FBI blamed on the same group | TRM: "roughly four times the Bybit hack"; "The FBI named the same group as responsible for the USD 1.5 billion Bybit hack in February 2025" |
| Binance is the world's biggest crypto exchange | CD, CBS |
| Within about an hour, the first freezes; about $3B frozen by Binance's count | TRM: Tether froze at 21:01 UTC; BA: "roughly $3B frozen" |
| The ten chains: Ethereum, Bitcoin, Tron, the XRP Ledger, Solana, Arbitrum, Avalanche, Optimism, Base and Polygon | TRM |

### 01b The case board (the questions; answered in 07d)

The five questions are the owner's own (his request, 2026-11-02): how did they get in, how did it move so fast, how was half frozen, did they use AI, who pays.

### 02 The till, not the vault

| Claim | Source |
|---|---|
| Most customer assets sit in cold wallets, and move to a hot wallet when someone withdraws | DE: "Most user assets are reportedly held in cold wallets and moved to a hot wallet only when a user withdraws" |
| The hack hit Binance's hot wallets | TRM ("Binance hot wallets"), CH ("funds began leaving Binance hot wallets"), DE (Teng: the hack hit Binance's own hot wallet) |
| Teng: "We never use any customer funds, so they are not impacted." | DE |
| Binance held $171 billion in total assets on 2026-10-28, by its proof of reserves | CN3 |
| $6.3B is about 3.7% of $171B | **ours**: 6.3 / 171 = 0.0368 |

### 02b Who can move money

| Claim | Source |
|---|---|
| A wallet is controlled by its private key, which makes signatures; the network moves funds for a validly signed instruction | general mechanism; CH ("valid signed authorizations"), TRM ("ordinary signed transactions") |
| Binance: "We have found no evidence of any wallet private key leak." | BA |
| The Ethereum notes were "each signed by the hot wallet"; the other nine chains used ordinary signed transfers, "which points to a compromise of Binance's hot wallet signing infrastructure" | TRM (the last phrase is TRM's reading) |
| Both can hold if the attacker never took a key but got inside the system that uses one and had it sign | **inferred**; it fits BA's "submit unauthorized withdrawal transactions" from a service container and DE's review of "key management and signing". Said aloud as a possibility Binance has not confirmed |

### 03 The way in

| Claim | Source |
|---|---|
| Binance's initial investigation: may involve a compromised DevOps engineer's laptop, which allowed an attacker to reach a service container and submit unauthorized withdrawal transactions | BA (shown) |
| A DevOps engineer keeps the company's servers and software running; a container is a sealed box of software doing one job | general definitions |
| A later update: "the attacker did not simply use one engineer's permissions, and this was not a single 'one-click' action"; other points of breach found, not named | BleepingComputer 2026-10-30 quoting Binance; DE: Teng said it "was not carried out by one person" and more points of breach were found |
| How the laptop was compromised has not been disclosed | BA, DE, TRM (none says) |
| A common tactic: approaching exchange engineers through fake job interviews and persuading them to "install malicious code" | TNW, quoting Federico Charosky of Quorum Cyber to Bloomberg; said as the playbook, not as what happened here |
| Teng said the attacker used a "self-destruct mechanism" that destroyed tooling and traces | DE |

### 03b The rehearsal

| Claim | Source |
|---|---|
| From the morning of 2026-10-28, the attacker's operator wallet received three small withdrawals from Tornado Cash | TRM |
| Tornado Cash is a mixer: a service that pools coins so it is hard to tell whose came out | general; CH calls the operational wallet "funded through Tornado Cash" |
| Early on 2026-10-29 it tested the code on two wallets, later rehearsed the final version on a third and routed the test funds back to itself; about four hours later the same code was installed on a Binance hot wallet | TRM |
| "The signatures were produced in advance as a batch." | TRM |
| Preparations began at least 36 hours earlier | CN1 |

### 03c Fifty notes

| Claim | Source |
|---|---|
| EIP-7702 "allows an ordinary wallet to hand control of its behavior to a smart contract by signing an authorization"; it came with Ethereum's Pectra upgrade in May 2025 | TRM |
| Each note "pointed it to a sweeper contract that accepts instructions only from the operator" | TRM |
| A note is only good for one value of the wallet's running transaction count (nonce); the hot wallet kept processing withdrawals, so the count kept moving | TRM |
| "By preparing signatures for 50 consecutive counts, the attacker guaranteed that one would still be valid when the transaction executed." | TRM (shown) |
| At 20:20 UTC the operator submitted a single transaction containing 50 authorizations | TRM |
| "That single transaction moved 167,464 ETH and 63 tokens, including 1.615 billion USDT" | TRM |
| Teng: "That delegation did not pass through our normal approval controls." | DE |
| The deli-ticket comparison | **ours**, an analogy for the nonce |

### 03d The drain

| Claim | Source |
|---|---|
| 20:05 to 20:09 UTC: five Binance wallets sent 233.46 million XRP to one attacker address | TRM |
| 20:20 UTC: a Binance Bitcoin hot wallet sent 18,270 BTC | TRM |
| Within two minutes, a Tron hot wallet sent 612.7 million USDT and 46.4 million TRX | TRM |
| More sweeps at 20:41, 20:59, 21:04, 21:44, 22:39 and 23:56 UTC; a second wave around 23:05 on Avalanche and Polygon | TRM |

### 04 The freeze

| Claim | Source |
|---|---|
| Tether (USDT) and Circle (USDC) "can freeze, burn and reissue" because the issuer controls the token contract; "Stablecoins are the most recoverable asset class in crypto because the issuer controls the token contract" (Ari Redbord, TRM) | CN2 |
| Bitcoin and ether "have no issuer that can directly freeze the assets" | CN2 |
| Tether froze 971.1 million USDT in the main receiving wallet at 21:01 UTC, 37 minutes after the main sweep | TRM |
| Circle froze 823 million USDC at 21:04 UTC, working with law enforcement | TRM |
| Ripple froze the stolen RLUSD wallet at 22:01 UTC with 40.5 million left; World Liberty Financial froze 27.8 million USD1 at 22:10; the Arbitrum Security Council forced 8,426 ETH and 74.6 million ARB out of the attacker's wallet | TRM |
| About $2.7 billion frozen as of 00:30 UTC | TRM |
| Later: Tether over $1.57 billion (Paolo Ardoino); Circle more than $1.1 billion (a Circle spokesperson, 2026-11-01) | CD (Ardoino); CN3 (Circle) |
| Binance: about $3 billion frozen | BA, CN2 |

### 04b The race

| Claim | Source |
|---|---|
| Chainalysis: "Over nearly 20 minutes it swapped $325 million in stablecoins into $285 million in ETH", "to stay ahead of freezes" | CH |
| The attackers sold USDT to market makers and borrowed ether against the stablecoin; ether is harder to freeze, so the lender is left holding the stolen stablecoin | CN1 (TRM's account) |
| Between 20:58 and 21:01 UTC an attacker-linked wallet deposited $60 million in USDT into Aave and borrowed $44.6 million in WETH | CT (LlamaRisk) |
| Aave is a lending app that runs on Ethereum: deposit something, borrow against it | general |
| Marc Zeller (Aave Chan Initiative): "USDT is real money backed by dollars, and the position is criminal but overcollateralized in the eyes of the protocol." | CT |
| Joe Hancock (Mishcon de Reya): "The attackers knew that route would be closed to them and so got out ahead of that." | CN1 |

### 04c The split

| Claim | Source |
|---|---|
| The attacker still controls more than 420,000 ETH and 18,270 BTC, "about USD 2.4 billion in assets beyond any issuer's reach" | TRM |
| Frozen: about $2.7B (TRM, 00:30 UTC) to about $3B (Binance) | TRM, BA |
| The frozen half is mostly stablecoins; the half that got away is mostly bitcoin and ether, which no company can freeze | TRM (both figures and what each is made of); CN2 |
| The two figures do not add to $6.36B because they were taken at different times and prices | **inferred**; the sources' totals vary ($6.3B BA, $6.36B TRM, $6.4B CH) and none reconciles them. On screen as "about" |
| "A freeze stops the money from moving, and recovery follows through legal process." (Redbord) | CN2 |
| "A technical freeze may happen quickly, while returning funds can take months or years." (Eric Jardine, Chainalysis) | CN2 |
| Frozen tokens can be burned and reissued, held by a government entity and returned to Binance | CN1 |

### 05 The getaway

| Claim | Source |
|---|---|
| "Thousands of transactions in a short period suggest that the attackers are using automation to obscure the trail of funds" | CH |
| Many addresses "receive exactly 1 TRX, then receive additional funds, then forward funds to other addresses"; "This repeated sequence suggests a programmatic process" | CH |
| "we are observing laundering patterns we have not seen before" | CH |
| No mixers seen in the laundering so far; large sums moved to Tron addresses | CN1 (Jonathan Levin, Chainalysis CEO) |
| The goal is to turn it into ordinary money: "Ultimately, they're trying to off-ramp it to fiat." (Redbord) | CN1 |
| Chinese money-laundering organisations buy stolen crypto over the counter for a large fee and return value to the hackers | CN1 (Levin, Redbord) |
| "As you get further and further away, the amount of seizure opportunities go down." (Levin) | CN1 |
| The FBI says the hackers are converting the stolen funds into ether and preparing "further laundering stages" | CBS |

### 05b Who

| Claim | Source |
|---|---|
| TRM: "TRM attributes this attack to TraderTraitor, North Korea's premier hacking unit", "with high confidence" | TRM |
| Chainalysis saw Binance funds "commingling with funds stolen in last month's Bitget exploit", attributed to North Korean actors | CH |
| On Saturday 2026-10-31 the FBI said TraderTraitor was responsible | CBS, NBC, IJ |
| ZachXBT named the Lazarus Group as the "likely attacker" | CD |
| North Korea uses crypto theft for "badly needed foreign currency" and to fund its nuclear program | CBS (AP, experts) |
| North Korea stole just over $2 billion in 2025, and an estimated $6.75 billion since researchers began tracking | REG (Chainalysis, 2025-12-18) |
| This one theft (about $6.36B) is close to that whole tracked total | **ours**: 6.36 against 6.75, a figure from before this hack |

### 06 Did they use AI?

| Claim | Source |
|---|---|
| TNW's headline: "North Korean hackers used AI in crypto heists record $6bn Binance theft" | TNW (shown) |
| TNW's own text: "The use of AI has not been confirmed, and Bloomberg presents it as the experts' assessment rather than an established fact." | TNW (shown) |
| Experts told Bloomberg the hackers may use AI to research targets, find weaknesses and deceive employees into granting access | TNW |
| TRM's and Chainalysis' write-ups never mention AI in the attack; "automation" and "programmatic" there describe scripts, and neither calls it AI | TRM, CH (read in full; research notes 2026-11-02) |
| The speed came from preparation: signatures made in advance as a batch, a rehearsal, pre-funded wallets | TRM, CN1 |
| Nobody with evidence has said AI was used in this hack, or that it was not | absent: TRM, CH, BA, DE, CN1-3, TNW; said as "nobody has said" |

### 06b Where AI does show up

| Claim | Source |
|---|---|
| Anthropic, August 2025: North Korean operatives used Claude to "create elaborate false identities with convincing professional backgrounds", "complete technical and coding assessments during the application process" and "deliver actual technical work once hired" | AN |
| Mandiant, February 2026: UNC1069, a group "suspected with high confidence to have a North Korea nexus", uses tools like Gemini "to develop tooling, conduct operational research, and assist during the reconnaissance stages"; a victim was shown a video of a crypto CEO "that appeared to be a deepfake", and Mandiant "was unable to recover forensic evidence to independently verify the use of AI models in this specific instance" | GM |
| GM does not name TraderTraitor or Binance; UNC1069 is not shown to be this attacker | GM |
| Would AI have made it worse: the drain was already about 20 minutes and the first freeze came 37 minutes after the main sweep, so the part AI could scale is the way in (more convincing fake recruiters, more engineers approached at once), the part a person is fooled in | **opinion**, built on TRM's timings and AN, GM, TNW; said as "my read" |
| The narrator is an AI too (Claude) | the channel's practice (videos/qwen-phones-home); said once, as a joke, never as an introduction |

### 07 Who pays

| Claim | Source |
|---|---|
| "Binance will absorb the financial impact of these stolen funds, not our users." | CN5 |
| Co-CEO Yi He: Binance would cover "all hacking losses" | CD |
| Binance set aside more than $6.34 billion of company funds | DE |
| SAFU, Binance's Secure Asset Fund for Users, set up in 2018, is generally kept at about $1 billion | IJ, CD ("roughly $1 billion in bitcoin") |
| Yi He: "We are allocating 50% of the funds from Binance's SAFU fund address to cover this loss, while keeping the remaining half in the fund." | her X post 2116599626300350586, via the research agent's search snippet; **not shown**, said as "half of its emergency fund" only if the capture confirms it (see Shown assets) |
| 90% replenished by 2026-10-31, about 95% by 2026-11-01, bought with Binance's money, not recovered from the attacker: "This does not mean 90% of funds were recovered from the attacker." | BU, CN3, CN5 |
| Yi He: "We should have invested more in security earlier, and set stricter standards." (translated from Mandarin, video on X, 2026-10-30) | IJ |
| Yi He said this year's revenue would fully cover the loss | IJ |

### 07b Reopening

| Claim | Source |
|---|---|
| Withdrawals restarted in phases at 06:00 UTC on Sunday 2026-11-01; all 15 initial networks by 12:36 UTC | CN3 |
| 06:00 to 15:30 UTC: $4.65 billion withdrawn, $1.01 billion deposited, $3.64 billion net out, 2.1% of $171 billion | CN3 (Binance's figures) |
| CZ: "98% choose to stay!" | CN3 |
| Friday 2026-10-30: bitcoin fell 4.1% to $77,445.96, ether 4.4%, BNB 6% | CN4 |
| CFTC Chair Michael Selig: "The real issue here is that these are unregulated offshore exchanges." | TB |

### 07c What we still don't know

| Claim | Source |
|---|---|
| How the laptop was compromised; what the other points of breach were; how a signing system signed notes without a key leaving it | absent from BA, DE, TRM, CH |
| Binance's detailed technical post-mortem is still to come | BA |
| Whether the frozen money comes back, and when | CN2 (Jardine: "months or years") |
| Where the roughly $2.4 billion beyond reach ends up | TRM, CN1 |

### 07d Close

Answers to the case board, each from the lines above.

## Shown assets

| Asset | Where it came from |
|---|---|
| Binance announcement capture | ss-shot of BA, words marked: "compromised DevOps engineer's laptop" |
| TRM capture | ss-shot of TRM, words marked: "preparing signatures for 50 consecutive counts" |
| Chainalysis capture | ss-shot of CH, words marked: "laundering patterns we have not seen before" |
| TNW capture | ss-shot of TNW: headline, and "The use of AI has not been confirmed" |
| Timeline, chain list and amounts | drawn from TRM's figures, as tabled above |
| The split bar | TRM's $2.7B frozen and $2.4B beyond reach; Binance's $3B in small type |
| Generated pictures | listed with prompt, model and seed in `generated.md`; illustrations, never evidence |

## Voice and music

- Narrator: `narrator-uk`, an invented Drama 3 voice (`local/voices/VOICES.md`), speed 1.0.
- Music: one bed per act, machine-generated with ACE-Step 1.5 on this Mac (`local/music/binance/`, never committed), checked
  for singing with Whisper before use.
- Memes: memegen templates, credited in `video.json` `youtube.credits` and listed in the packet.

## Left out, and why

- **The Bitquery "just under four hours" duration** (Euronews): TRM's own table shows sweeps to 23:56 UTC, so the video says
  "most of it in about 20 minutes" and that the rest trickled out over the next four hours, both from TRM.
- **Elliptic's $2.84B frozen and $3.33B unfreezable**: a third pair of figures at a third time; two pairs are enough to say "about".
- **Chainalysis' $5.9B** (CoinDesk's attribution) against its own post's $6.4B: unreconciled; the video uses TRM's $6.36B and Binance's $6.3B.
- **THORChain's pause delaying laundering**: search-summary level only.
- **Yi He's claim that Ripple helped stop about $200M**: TRM confirms only 40.5M RLUSD.
- **The "self-destruct mechanism" in detail**: Teng's phrase is reported (DE), never described.
- **Polymarket's same-day $3M breach**: unrelated.
- **Trump's and Senator Lummis' comments**: one regulator's line (Selig) shows the political reaction; more would be a politics segment.
- **Anthropic's smart-contract exploitation research (2025-12)**: a different kind of attack (bugs in contract code); this theft was a signing compromise.
- **What users should do** (Forbes, 2026-11-02): the article could not be read (403), so nothing from it is said.
- **"Trading accounts of investors"** (the owner heard it, attributed to PBS/NPR): no source fetched says any user account was accessed; BA and DE say customer funds were not touched. Not said.
