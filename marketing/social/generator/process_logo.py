from PIL import Image, ImageDraw
import os

SRC = "/root/.claude/uploads/777cfe16-d706-5d46-8ee4-3aa299281a7e/a3170761-IMG_1905.png"
OUT = "/tmp/claude-0/-home-user-proyecto-digital-2/777cfe16-d706-5d46-8ee4-3aa299281a7e/scratchpad/attesta-social/assets"
os.makedirs(OUT, exist_ok=True)

def hexrgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

im = Image.open(SRC).convert("RGBA")
w, h = im.size
px = im.load()

# 1) Flood-fill background white -> transparent from the four corners,
#    preserving interior white linework.
def is_whiteish(p, thr=235):
    return p[0] >= thr and p[1] >= thr and p[2] >= thr

mask = Image.new("L", (w, h), 0)  # 255 = background to clear
mpx = mask.load()
from collections import deque
dq = deque()
seeds = [(0,0),(w-1,0),(0,h-1),(w-1,h-1)]
for s in seeds:
    if is_whiteish(px[s]) and mpx[s] == 0:
        dq.append(s); mpx[s] = 255
while dq:
    x, y = dq.popleft()
    for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
        nx, ny = x+dx, y+dy
        if 0 <= nx < w and 0 <= ny < h and mpx[nx,ny] == 0 and is_whiteish(px[nx,ny]):
            mpx[nx,ny] = 255; dq.append((nx,ny))

# classify pixels
JADE = hexrgb("#0b6b4e")
JADE_LIGHT = hexrgb("#7fd8b4")
PAPER = hexrgb("#faf8f2")
DARK_PAPER = hexrgb("#0e1512")
BRONZE = hexrgb("#b0824a")

def build(green_col, inner_col):
    out = Image.new("RGBA", (w, h), (0,0,0,0))
    opx = out.load()
    for y in range(h):
        for x in range(w):
            if mpx[x,y] == 255:
                continue  # transparent background
            p = px[x,y]
            if is_whiteish(p, 210):
                opx[x,y] = (inner_col[0], inner_col[1], inner_col[2], 255)
            else:
                # green area -> target green (preserve some shading via luminance)
                opx[x,y] = (green_col[0], green_col[1], green_col[2], 255)
    return out

def autocrop(img, pad_ratio=0.04):
    bbox = img.getbbox()
    if not bbox: return img
    l,t,r,b = bbox
    pad = int(max(r-l, b-t) * pad_ratio)
    l=max(0,l-pad); t=max(0,t-pad); r=min(img.width,r+pad); b=min(img.height,b+pad)
    return img.crop((l,t,r,b))

# Primary: jade seal, interior melts to ivory (for marfil backgrounds)
light_bg = autocrop(build(JADE, PAPER))
light_bg.save(os.path.join(OUT, "seal-on-ivory.png"))

# Jade seal, interior white (versatile, for any light/photo bg)
white_inner = autocrop(build(JADE, (255,255,255)))
white_inner.save(os.path.join(OUT, "seal-jade-white.png"))

# Dark backgrounds: light jade fill, interior melts to dark paper
dark_bg = autocrop(build(JADE_LIGHT, DARK_PAPER))
dark_bg.save(os.path.join(OUT, "seal-on-dark.png"))

# Bronze monochrome seal, interior ivory (accent use)
bronze_v = autocrop(build(BRONZE, PAPER))
bronze_v.save(os.path.join(OUT, "seal-bronze.png"))

for f in ["seal-on-ivory.png","seal-jade-white.png","seal-on-dark.png","seal-bronze.png"]:
    p = os.path.join(OUT, f)
    print(f, Image.open(p).size)
