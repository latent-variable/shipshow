# Set up: first-run downloads

## Moved from AGENTS.md (2026-11-17)

The full original text, unedited. The rule for each item is kept in one sentence in `AGENTS.md`; these details bind as the rule's own text.

The first `doctor` downloads Kokoro into `~/.cache/hyperframes/tts` (about 340 MB). The first
render downloads a headless Chrome if HyperFrames finds none (about 190 MB). The first OmniVoice
take downloads its model (about 1.5 GB, `~/.cache/huggingface`); `npm run doctor -- --omnivoice`
checks it and voices one word; `-- --hearback` checks the hear-back and hears one word.

