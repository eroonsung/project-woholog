"""
공유 이미지(OG 1200×630, 스토리 1080×1920)용 Pretendard 정적 글꼴 (D-125). satori(next/og)는 woff2·가변 글꼴을 못 읽어서
fonts_src/PretendardVariable.woff2에서 굵기 500·800만 뽑아 TTF로 만든다. 글자는 화면 글꼴 Core와 같은 목록(app/fonts/PretendardCore.chars.txt)만 담는다.
실행: python3 -I scripts/make_share_fonts.py   (pip install fonttools brotli 필요, 프로젝트 의존성 아님)
글자 목록이 바뀌면(scripts/make_font_subset.py를 다시 돌린 뒤) 이것도 다시 돌린다.
"""
import io, os
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SRC = 'fonts_src/PretendardVariable.woff2'
OUT = 'app/fonts/share'
chars = ''
for line in open('app/fonts/PretendardCore.chars.txt', encoding='utf-8'):
    if line.startswith('core: '):
        chars = line[len('core: '):].rstrip('\n')
unicodes = sorted({ord(c) for c in chars})
os.makedirs(OUT, exist_ok=True)
for weight in (500, 800):
    f = TTFont(SRC, lazy=False)
    f = instancer.instantiateVariableFont(f, {'wght': weight})
    b = io.BytesIO(); f.flavor = None; f.save(b); b.seek(0); f = TTFont(b, lazy=False)
    opt = subset.Options(); opt.flavor = None; opt.hinting = False; opt.notdef_outline = True; opt.name_IDs = [1, 2, 3, 4, 6]
    opt.layout_features = ['kern', 'ccmp', 'locl']
    s = subset.Subsetter(opt); s.populate(unicodes=unicodes); s.subset(f)
    path = f'{OUT}/PretendardShare-{weight}.ttf'
    f.save(path)
    print(path, os.path.getsize(path) // 1024, 'KB')
