# Geometry for kakeya-every-dimension 02 to 03a (cut 7): the triangle turn, the dial, the near and far detour, the dabs.
# python3 art/fundamentals.py prints the JSON the scenes use and a check of every number the narration says.
import json, math

def lerp(a, b, t): return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
def seg(p, q): return [round(p[0], 2), round(p[1], 2), round(q[0], 2), round(q[1], 2)]
def ang(v): return math.atan2(v[1], v[0])
def unit(v): L = math.hypot(*v); return (v[0] / L, v[1] / L)
def at(p, a, r): return (p[0] + r * math.cos(a), p[1] + r * math.sin(a))

# The triangle: equilateral, one needle tall (Pál 1920, area 1/sqrt 3). 150 px is one unit, as on the other tables.
U = 150.0
A, B, C = (0.0, -100.0), (-86.6025, 50.0), (86.6025, 50.0)
def pivot(V, a0, a1, n=30): return [seg(V, at(V, a0 + (a1 - a0) * j / n, U)) for j in range(n + 1)]
def slide(P0, P1, d, n=14): return [seg(lerp(P0, P1, j / n), at(lerp(P0, P1, j / n), d, U)) for j in range(n + 1)]
def short(a0, a1): return a0 + ((a1 - a0 + math.pi) % (2 * math.pi) - math.pi)
tri = []
aAB, aAC = ang((B[0] - A[0], B[1] - A[1])), ang((C[0] - A[0], C[1] - A[1]))
tri += pivot(A, aAB, short(aAB, aAC))                                       # pivot on A, from edge AB to edge AC
uAC = unit((C[0] - A[0], C[1] - A[1])); sAC = math.hypot(C[0] - A[0], C[1] - A[1])
tri += slide(A, (A[0] + uAC[0] * (sAC - U), A[1] + uAC[1] * (sAC - U)), aAC)  # slide along AC until its far end is at C
aCA, aCB = ang((A[0] - C[0], A[1] - C[1])), ang((B[0] - C[0], B[1] - C[1]))
tri += pivot(C, aCA, short(aCA, aCB))                                       # pivot on C
uCB = unit((B[0] - C[0], B[1] - C[1]))
tri += slide(C, (C[0] + uCB[0] * (sAC - U), C[1] + uCB[1] * (sAC - U)), aCB)
aBC, aBA = ang((C[0] - B[0], C[1] - B[1])), ang((A[0] - B[0], A[1] - B[1]))
tri += pivot(B, aBC, short(aBC, aBA))                                       # pivot on B: half a turn in all

# The dial: for each angle 0..180 (every 2 degrees), a whole needle at that angle inside the same triangle, from the corner
# whose 60-degree opening holds it (the angle is measured anticlockwise from the right, screen y down).
def inside_needle(deg):
    for V, P, Q in ((A, B, C), (B, C, A), (C, A, B)):
        a0, a1 = ang((P[0] - V[0], P[1] - V[1])), ang((Q[0] - V[0], Q[1] - V[1]))
        for d in (-math.radians(deg), -math.radians(deg) + math.pi):
            lo, hi = sorted((a0, short(a0, a1)))
            dd = lo + ((d - lo) % (2 * math.pi))
            if dd <= hi + 1e-9: return seg(V, at(V, dd, U))
    raise ValueError(deg)
dial = [inside_needle(k * 2) for k in range(91)]

# Near and far: the needle (110 px a unit) on line 1 reaches line 2, 0.2 units over, by sliding out X along its own line,
# tilting by atan(0.2 / X) (a wedge), sliding back along the tilted line, and tilting back (a second wedge).
NU, GAP = 110.0, 22.0
def detour(X):
    a = math.atan(GAP / X); fr = []
    fr += [seg((X * j / 20, 0), (X * j / 20 + NU, 0)) for j in range(21)]                    # out along its own line
    P = (X, 0.0)
    fr += [seg(P, at(P, -a * j / 10, NU)) for j in range(11)]                                  # tilt about its left end
    Q = (0.0, GAP); d = unit((Q[0] - P[0], Q[1] - P[1]))                                       # the tilted line runs to Q on line 2
    L = math.hypot(Q[0] - P[0], Q[1] - P[1])
    for j in range(31):                                                                        # slide along it until its right end is at Q
        t = (L + NU) * j / 30; tip = (P[0] + d[0] * (t - NU), P[1] + d[1] * (t - NU))
        fr.append(seg(tip, (tip[0] + d[0] * NU, tip[1] + d[1] * NU)))
    a2 = ang(d)
    fr += [seg(Q, at(Q, short(a2, math.pi) * j / 10 + a2 * (1 - j / 10), NU)) for j in range(11)]  # tilt back about Q
    fr += [seg((-NU + NU * j / 12, GAP), (NU * j / 12, GAP)) for j in range(13)]               # slide back in
    w1 = [P, at(P, 0, NU), at(P, -a, NU)]; w2 = [Q, at(Q, a2, NU), at(Q, math.pi, NU)]
    return {"frames": fr, "wedges": [[[round(x, 2) for x in p] for p in w] for w in (w1, w2)], "deg": math.degrees(a), "area": a}

near, far = detour(NU * 1), detour(NU * 10)

# Dabs: a line, a filled square, the Sierpinski triangle (three half-size copies of itself).
def sier(x, y, s, depth):
    if depth == 0: return [(x, y, s)]
    h = s / 2
    return sier(x, y, h, depth - 1) + sier(x + h, y, h, depth - 1) + sier(x + h / 2, y - h * math.sqrt(3) / 2, h, depth - 1)
def tri_pts(x, y, s): return [(x, y), (x + s, y), (x + s / 2, y - s * math.sqrt(3) / 2)]
S0 = 380.0
sier_fill = [[[round(c, 1) for c in p] for p in tri_pts(*t)] for t in sier(0, 0, S0, 5)]
sier_dabs = {k: [[round(x + s / 2, 1), round(y - s * math.sqrt(3) / 6, 1), round(s, 1)] for x, y, s in sier(0, 0, S0, k)] for k in (2, 3)}

out = {"tri": tri, "dial": dial, "near": near, "far": far, "sierFill": sier_fill, "sierDabs": sier_dabs}
if __name__ == "__main__":
    import sys
    if sys.argv[1:] == ["check"]:
        print("triangle: height 1, area", round(1 / math.sqrt(3), 3), "frames", len(tri), "end", tri[-1])
        print("deltoid", round(math.pi / 8, 3), "disk", round(math.pi / 4, 3))
        for n, d in (("near", near), ("far", far)):
            print(n, "tilt %.2f deg" % d["deg"], "two wedges", round(d["area"], 4), "unit^2 (each a/2)")
        print("ratio", round(near["area"] / far["area"], 2))
        print("halvings to a googol", round(100 / math.log10(2), 1), "; 3/4 after 332:", "10^%.2f" % (332 * math.log10(0.75)))
        print("sierpinski dimension", round(math.log(3) / math.log(2), 3), "; dabs at depth 2, 3:", len(sier_dabs[2]), len(sier_dabs[3]))
    else:
        json.dump(out, sys.stdout)
