"""
docs/legal/privacy.md(원본) → content/privacy_ko.json · content/privacy_en.json (화면용 구조). 실행: python3 -I scripts/build_privacy_content.py
처리방침 문장은 원본 md를 고치고 이 스크립트를 다시 돌린다(화면 문구를 코드에 쓰지 않는다, CLAUDE.md 규칙 4).
원본의 대괄호 [ ] 칸은 화면에서 "[공개 전 채움]"처럼 눈에 띄게 보인다.
"""
import json, re

SRC = 'docs/legal/privacy.md'
md = open(SRC, encoding='utf-8').read()


def section(start):
    i = md.index(start)
    j = md.find('\n## ', i + 5)
    return md[i:(len(md) if j < 0 else j)]


def parse(block):
    lines = block.split('\n')[1:]
    out, i = [], 0
    while i < len(lines):
        ln = lines[i].rstrip()
        if not ln.strip() or ln.strip() == '---':
            i += 1
        elif ln.startswith('### '):
            out.append({'t': 'h', 'text': ln[4:].strip()}); i += 1
        elif ln.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].startswith('|'):
                rows.append([c.strip() for c in lines[i].strip().strip('|').split('|')]); i += 1
            out.append({'t': 'table', 'head': rows[0], 'rows': rows[2:]})
        elif ln.startswith('- '):
            items = []
            while i < len(lines) and lines[i].startswith('- '):
                items.append(lines[i][2:].strip()); i += 1
            out.append({'t': 'ul', 'items': items})
        else:
            para = [ln.strip()]; i += 1
            while i < len(lines) and lines[i].strip() and not lines[i].startswith(('|', '- ', '### ', '---')):
                para.append(lines[i].strip()); i += 1
            out.append({'t': 'p', 'text': ' '.join(para)})
    return out


def build(start, path):
    blocks = parse(section(start))
    first = blocks.pop(0)
    m = re.match(r'\*\*(.+?)\*\*\s*(.*)', first['text'])
    doc = {'_source': f'{SRC} (scripts/build_privacy_content.py로 만든 파일, 직접 고치지 않는다)', 'title': m.group(1), 'meta': m.group(2), 'blocks': blocks}
    json.dump(doc, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    open(path, 'a', encoding='utf-8').write('\n')
    print(path, len(blocks), '블록, 대괄호 칸', len(re.findall(r'\[[^\]]*\]', json.dumps(doc, ensure_ascii=False))))


build('## 2. 개인정보 처리방침 (한국어)', 'content/privacy_ko.json')
build('## 3. Privacy Policy (English, short version)', 'content/privacy_en.json')
