# The Besicovitch-Perron tree as in Tao's applet (teorth.github.io/tao-web/apps/kakeya.js, perronTree), for 02b and 03.
# Part 1 measures each round's area (python3 art/perron.py areas); part 2 writes the slide positions and the Pál-join path the scenes use.
import sys
if sys.argv[1:] == ['areas']:
    # Besicovitch-Perron tree as in Tao's applet (teorth.github.io/tao-web/apps/kakeya.js, perronTree): measured union areas.
    from PIL import Image, ImageDraw
    def tree(p):
        if p == 0: return [[(0.0,1.0),(0.0,0.0),(1.0,0.0)]], None
        N = 1 << p; alpha = (1/(2*p))**(1/(2*p-1)); xs=[]
        for i in range(N):
            xx=0; m=i; j2=N//2; aj=1
            for j in range(p):
                xx += (aj/j2)*((m+1)//2); aj*=alpha; j2//=2; m//=2
            xx *= (alpha-1); xx += 1-alpha**p; xs.append(xx)
        return [[(xs[i],1.0),(xs[i]+i/N,0.0),(xs[i]+(i+1)/N,0.0)] for i in range(N)], alpha
    def area(tris, W=6000):
        xs=[x for t in tris for x,_ in t]; x0,x1=min(xs),max(xs)
        sc=W/(x1-x0+1e-9); H=int(sc)+2
        im=Image.new("1",(W+2,H+2),0); d=ImageDraw.Draw(im)
        for t in tris: d.polygon([((x-x0)*sc,(1-y)*sc) for x,y in t],fill=1)
        return sum(im.getdata())/(sc*sc)
    out={}
    for p in range(0,7):
        t,a=tree(p); A=area(t)
        xs=[x for tr in t for x,_ in tr]
        out[p]={"alpha":a,"area":A,"share":A/0.5,"xmin":min(xs),"xmax":max(xs),"apex":[tr[0][0] for tr in t]}
        print(p, 1<<p, "alpha", a and round(a,3), "area", round(A,4), "share of triangle", f"{A/0.5:.0%}", "x range", round(min(xs),3), round(max(xs),3))
    raise SystemExit
# Data for kakeya-every-dimension 02b and 03: the Besicovitch-Perron tree of Tao's applet (perronTree), and a Pál join path.
import json, math
P=5; NS=1<<P
def xs(p):
    if p==0: return [0.0]
    N=1<<p; a=(1/(2*p))**(1/(2*p-1)); out=[]
    for i in range(N):
        xx=0; m=i; j2=N//2; aj=1
        for j in range(p):
            xx+=(aj/j2)*((m+1)//2); aj*=a; j2//=2; m//=2
        xx*=(a-1); xx+=1-a**p; out.append(xx)
    return out
# per round, per sliver (32 of them), the sideways shift in unit lengths
shifts=[[xs(p)[i>>(P-p)] for i in range(NS)] for p in range(P+1)]
# the turning demo on the 8-piece tree (p=3) with Pál joins
p=3; N=1<<p; X=xs(p); D=2.5
def unit(v): L=math.hypot(*v); return (v[0]/L,v[1]/L)
def dirTo(s): return unit((s,-1.0))          # from apex (x,1) toward base point (x+s,0), unit coords (y up)
keys=[]; strips=[]
def seg(T,v): return [round(T[0],4),round(T[1],4),round(T[0]+v[0],4),round(T[1]+v[1],4)]
def add(a,b,k=1): return (a[0]+k*b[0],a[1]+k*b[1])
def rot(v,ang): c,s=math.cos(ang),math.sin(ang); return (v[0]*c-v[1]*s, v[0]*s+v[1]*c)
def angle(v): return math.atan2(v[1],v[0])
phase=[]  # (kind, samples)
for k in range(N):
    A=(X[k],1.0)
    ph=[]
    for j in range(25):                        # pivot across piece k
        s=(k+(j/24))/N; ph.append(seg(A,dirTo(s)))
    phase.append(("pivot",ph))
    if k==N-1: break
    B=(X[k+1],1.0); u=dirTo((k+1)/N); ph=[]
    Q1=add(A,u,-D)                             # far up the needle's own line
    for j in range(13): T=add(A,u,-(D+1)*j/12); ph.append(seg(T,u))           # slide up until its lower end is at Q1
    w=unit((B[0]-Q1[0],B[1]-Q1[1]))
    a0,a1=angle(u),angle(w); da=(a1-a0+math.pi)%(2*math.pi)-math.pi
    for j in range(9): v=rot(u,da*j/8); ph.append(seg(add(Q1,v,-1),v))         # tilt about Q1 (a thin wedge)
    strips.append([[round(c,4) for c in Q1],[round(c,4) for c in add(Q1,u,-1)],[round(c,4) for c in add(Q1,w,-1)]])
    Dp=math.hypot(B[0]-Q1[0],B[1]-Q1[1])
    for j in range(13): T=add(add(Q1,w,-1),w,(Dp+1)*j/12); ph.append(seg(T,w))   # slide along the new line until its top is at B
    for j in range(9): v=rot(w,-da*j/8); ph.append(seg(B,v))                    # tilt back about B (another thin wedge)
    strips.append([[round(c,4) for c in B],[round(c,4) for c in add(B,w)],[round(c,4) for c in add(B,u)]])
    phase.append(("join",ph))
frames=[f for _,ph in phase for f in ph]
first_join_end=sum(len(ph) for _,ph in phase[:2])
areas=[100,75,52,42,35,31]
json.dump({"shifts":shifts,"tree3":X,"frames":frames,"firstJoinEnd":first_join_end,"strips":strips,"D":D,"areas":areas},open("/dev/stdout","w"))
wedge=[0.5*abs(math.atan2(*(lambda a,b:(a[0]*b[1]-a[1]*b[0], a[0]*b[0]+a[1]*b[1]))((s[1][0]-s[0][0],s[1][1]-s[0][1]),(s[2][0]-s[0][0],s[2][1]-s[0][1])))) for s in strips]
print("frames",len(frames),"first join ends at",first_join_end,"strip areas (unit^2)",[round(x,4) for x in wedge[:4]],"sum",round(sum(wedge),4))
print("y range of frames", min(min(f[1],f[3]) for f in frames), max(max(f[1],f[3]) for f in frames), "x range", min(min(f[0],f[2]) for f in frames), max(max(f[0],f[2]) for f in frames))
