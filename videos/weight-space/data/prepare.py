"""Fetch and prepare the third-party assets this video shows, into assets/ (never committed).

From the MIT team's released logs (github.com/RikiyaT/lm_understand-logs, CC BY 4.0): the diffusion samples figure,
cropped into the generated squares and Astra's drawings. From the blog post itself
(rikiyat.github.io/blog/weight-space-programming): the Breakout animation and the car-on-ramp scene, shown as
commentary with credit. Run from anywhere: python3 videos/weight-space/data/prepare.py
"""
import os, subprocess, urllib.request
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent.parent
OUT = HERE / "assets" / "post"
OUT.mkdir(parents=True, exist_ok=True)
LOGS = "https://raw.githubusercontent.com/RikiyaT/lm_understand-logs/main/"
POST = "https://rikiyat.github.io/blog/weight-space-programming/assets/"

def fetch(url, dest):
    if not dest.exists():
        with urllib.request.urlopen(url) as r: dest.write_bytes(r.read())
    return dest

fetch(POST + "which_game/breakout.gif", OUT / "breakout.gif")
fetch(POST + "carjump_scene.svg", OUT / "carjump_scene.svg")
samples = Image.open(fetch(LOGS + "exp2_diffusion/eval/samples.png", OUT / "samples.png")).convert("RGB")
# Rows of the figure: circle, square, triangle. Columns: four of the generated samples, and Astra's drawing.
rows = [(78, 162), (178, 262), (278, 362)]
gen = [(860, 944), (961, 1045), (1062, 1146), (1162, 1246)]
for name, cols in [("generated", gen), ("drawn", [(1665, 1750)])]:
    tiles = [samples.crop((x0, y0, x1, y1)) for (y0, y1) in rows for (x0, x1) in cols]
    w, h = tiles[0].size
    sheet = Image.new("RGB", (w * len(cols), h * len(rows)), "white")
    for i, t in enumerate(tiles): sheet.paste(t.resize((w, h)), ((i % len(cols)) * w, (i // len(cols)) * h))
    sheet = sheet.resize((sheet.width * 4, sheet.height * 4), Image.NEAREST)
    sheet.save(OUT / f"shapes-{name}.png")
print("assets in", OUT)
