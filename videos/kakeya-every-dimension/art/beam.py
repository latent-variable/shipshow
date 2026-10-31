# The 05 beams: the laser photo's beam (art/laser.txt) cut into a strip, its dark background made transparent.
import numpy as np
from PIL import Image
L = Image.open("assets/art/kk-laser-image.png").convert("RGB"); W, H = L.size
arr = np.asarray(L.crop((80, 430, W, 560)).resize((1600, 130))).astype(float)
alpha = np.clip((arr.max(axis=2, keepdims=True) - 18) / 120, 0, 1) * 255
Image.fromarray(np.concatenate([arr, alpha], axis=2).astype("uint8")).save("assets/art/beam.png")
