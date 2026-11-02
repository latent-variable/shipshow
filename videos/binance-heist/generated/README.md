# Generated pictures

Illustrations, never evidence: each shows a thing the narration asks the viewer to picture, and carries no words (every
label is drawn by the scene). Made on the GPU box with `gpubox run moss-t2i` (MOSS-Image SFT, Apache-2.0), seed 4242,
30 steps, CFG 5. The images land in `assets/gen/<name>-image.png` (never committed); the prompts are the `.txt` files here.

| Name | Size | Where | What it stands for |
|---|---|---|---|
| vault | 1456 x 1456 | 02-the-till | cold storage, the vault |
| till | 1456 x 1456 | 02-the-till | a hot wallet, the till |
| laptop | 1792 x 1024 | 03-the-way-in | the compromised engineer's laptop (no real laptop is pictured) |
| deli | 1456 x 1456 | 03c-fifty-notes | the take-a-number ticket, the analogy for the wallet's count |
| clamp | 1792 x 1024 | 01-hook | a wheel clamp, the analogy for a freeze |

Remake one: `~/.agents/bin/gpubox run moss-t2i -p prompt=@<name>.txt -p width=<w> -p height=<h> -p seed=4242 --name <name> --out ../assets/gen`
