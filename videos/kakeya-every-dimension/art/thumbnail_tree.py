# The thumbnail's tree (assets/thumbnail/tree.png, gitignored): the video's own Besicovitch-Perron tree, the frame at 5:15 of the
# render (02b, the paint-filled round), cut out of its wooden box so it sits on the thumbnail's table. Wood is dark; the needles
# are bright and the paint strokes saturated gold, so brightness and saturation make the cut.
#   ffmpeg -ss 315 -i "$SHIPSHOW_OUT/kakeya-every-dimension.mp4" -frames:v 1 /tmp/f315.png
#   python3 art/thumbnail_tree.py /tmp/f315.png assets/thumbnail/tree.png
import os
import sys
import numpy as np
from PIL import Image

frame, out = sys.argv[1], sys.argv[2]
c = np.asarray(Image.open(frame).convert("RGB")).astype(float)[150:760, 210:790]
lum = 0.3 * c[..., 0] + 0.59 * c[..., 1] + 0.11 * c[..., 2]
sat = c.max(-1) - c.min(-1)
a = np.clip((lum - 62) / 50, 0, 1)
a = np.maximum(a, np.clip((c[..., 1] - 85) / 50, 0, 1) * (sat > 90))
os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
Image.fromarray(np.dstack([c, a * 255]).astype(np.uint8)).save(out)
