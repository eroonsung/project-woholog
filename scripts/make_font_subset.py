"""
Pretendard 가변 글꼴(fonts_src/PretendardVariable.woff2, 2MB)에서 쓰는 글자만 담은 두 파일을 만든다 (D-112).
  app/fonts/PretendardCore.woff2   코드·문구·DB 시드에 실제로 쓰인 글자 + 영문·숫자·기호. 모든 화면이 이 파일만으로 그려진다(preload).
  app/fonts/PretendardExtra.woff2  나머지 한글 KS X 1001 2,350자 등. 위 파일에 없는 글자가 나올 때만 내려받는다(preload 안 함).
굵기는 400~900만 남긴다. 실행: python3 -I scripts/make_font_subset.py   (pip install fonttools brotli 필요, 프로젝트 의존성 아님)
글자가 늘어나는 문구·DB 값을 넣은 뒤에는 다시 실행한다. 끝에 "글꼴에 없는 글자"가 나오면 알려 준다.
"""
import io, os
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SRC = 'fonts_src/PretendardVariable.woff2'
OUT = 'app/fonts'
ROOTS = ['content', 'app', 'components', 'lib', 'supabase/seed', 'tests/fixtures/db_rows_v1.json']

used = set()
for r in ROOTS:
    paths = [r] if os.path.isfile(r) else [
        os.path.join(d, f) for d, _, fs in os.walk(r) for f in fs
        if f.endswith(('.ts', '.tsx', '.json', '.sql', '.css')) and 'fonts' not in d
    ]
    for p in paths:
        used |= set(open(p, encoding='utf-8', errors='ignore').read())
used = {ord(c) for c in used if ord(c) >= 0x20}

ks = set()  # KS X 1001 한글 2,350자
for hi in range(0xB0, 0xC9):
    for lo in range(0xA1, 0xFF):
        try: ks.add(ord(bytes([hi, lo]).decode('euc-kr')))
        except UnicodeDecodeError: pass

basic = set(range(0x20, 0x7F)) | set(range(0xA0, 0x100)) | set(range(0x2000, 0x2070)) | set(range(0x3000, 0x3040))
more = (set(range(0x2190, 0x2200)) | set(range(0x2460, 0x2500)) | set(range(0x25A0, 0x2600)) | set(range(0x2700, 0x27C0))
        | set(range(0x3131, 0x318F)) | set(range(0xFF00, 0xFFF0)))
core = used | basic
extra = (ks | more) - core

def build(unicodes, path):
    f = TTFont(SRC, lazy=False)
    f = instancer.instantiateVariableFont(f, {'wght': (400, 900)})
    b = io.BytesIO(); f.flavor = None; f.save(b); b.seek(0); f = TTFont(b, lazy=False)
    opt = subset.Options()
    opt.flavor = 'woff2'; opt.hinting = False; opt.notdef_outline = True; opt.name_IDs = [1, 2, 3, 4, 6]
    opt.layout_features = ['kern', 'liga', 'calt', 'ccmp', 'locl', 'mark', 'mkmk', 'tnum', 'pnum']
    s = subset.Subsetter(opt); s.populate(unicodes=sorted(unicodes)); s.subset(f)
    f.flavor = 'woff2'; f.save(path)
    return set(TTFont(path).getBestCmap())

c1 = build(core, f'{OUT}/PretendardCore.woff2')
c2 = build(extra, f'{OUT}/PretendardExtra.woff2')
for name in ('PretendardCore', 'PretendardExtra'):
    print(name, os.path.getsize(f'{OUT}/{name}.woff2') // 1024, 'KB')
print('쓰인 글자', len(used), '개 중 Core에 없는 글자:', ''.join(chr(c) for c in sorted(used - c1))[:80] or '없음')
print('Core·Extra 어디에도 없는 글자(원본 글꼴에 없음):', ''.join(chr(c) for c in sorted(used - c1 - c2))[:80] or '없음')
