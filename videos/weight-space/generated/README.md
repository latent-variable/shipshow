# Generated pictures

Illustrations, never evidence: each shows a thing the narration asks the viewer to picture, and carries no words (every
label is drawn by the scene). Made on the GPU box with `gpubox run moss-t2i` (MOSS-Image), seed 4242, 1792 x 1024. The
images land in `assets/gen/ws-<name>-image.png` (never committed); the prompts are the `.txt` files here.

| Name | Where | What it stands for |
|---|---|---|
| knobs | 02-knobs | a network's weights, as a desk of knobs |
| car | 04-car | the little car and its ramp, opening the fix act |
| go | 05b-go | the Go act |
| theatre | 06-patient | Qwen as the patient on the table |

Remake one: `~/.agents/bin/gpubox run moss-t2i -p prompt=@<name>.txt -p width=1792 -p height=1024 -p seed=4242 --name ws-<name> --out ../assets/gen`

The third-party pictures (the post's Breakout animation and car scene, the logs' shapes figure) are fetched by
`data/prepare.py`.
