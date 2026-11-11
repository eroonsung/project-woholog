"""
docs/content/guides_draft_v1.md(원본) → supabase/seed/seed_guides_v1.sql (D-128). 실행: python3 -I scripts/build_guides_seed.py
글마다 위쪽 정보 블록(slug · title_ko · program_id · status)과 "### 본문"만 시드에 넣는다. 정보 블록의 "참고" 줄은 메모라서 넣지 않는다.
program_id: "없음"이면 null, "캐나다 (origin='KR' and destination='CA' …)"처럼 destination 코드가 있으면 programs에서 찾는 식으로 넣는다.
본문은 $guide$ … $guide$ 로 감싸서 작은따옴표·줄바꿈을 그대로 둔다. 같은 slug는 다시 실행하면 갱신된다(on conflict (slug) do update).
"""
import re

SRC = 'docs/content/guides_draft_v1.md'
OUT = 'supabase/seed/seed_guides_v1.sql'
REVIEWED_AT = '2026-11-11'  # 글 내용을 마지막으로 확인한 날. 글을 고치면 이 날짜도 바꾼다.

text = open(SRC, encoding='utf-8').read()
parts = re.split(r'^## 글 \d+\s*$', text, flags=re.M)[1:]
rows = []
for part in parts:
    info, _, body = part.partition('### 본문')
    body = body.split('\n---\n')[0].strip('\n').strip()
    field = lambda name: re.search(rf'^- {name}:\s*(.+)$', info, flags=re.M).group(1).strip()
    slug = field('slug').strip('`')
    title = field('title_ko')
    status = field('status')
    pid = field('program_id')
    dest = re.search(r"destination='([A-Z]{2})'", pid)
    program = (f"(select id from programs where origin = 'KR' and destination = '{dest.group(1)}' and kind = 'working_holiday')" if dest else 'null')
    assert re.fullmatch(r'[a-z0-9-]+', slug), slug
    assert status in ('published', 'draft', 'archived'), status
    assert '$guide$' not in body and "'" not in title
    rows.append(f"  ('{slug}', {program}, '{title}',\n$guide${body}$guide$,\n   '{status}', '{REVIEWED_AT}')")

sql = f"""-- 가이드 글 (docs/content/guides_draft_v1.md → scripts/build_guides_seed.py로 만든 파일, 직접 고치지 않는다) (D-128)
-- 여러 번 실행해도 같다(같은 slug는 갱신). 본문의 {{fact_key}}는 program_id 나라의 현재 값으로 화면에서 채워진다.
begin;
insert into guides (slug, program_id, title_ko, body_ko, status, reviewed_at) values
{(','+chr(10)).join(rows)}
on conflict (slug) do update set
  program_id = excluded.program_id, title_ko = excluded.title_ko, body_ko = excluded.body_ko,
  status = excluded.status, reviewed_at = excluded.reviewed_at, needs_review = false;
commit;
"""
open(OUT, 'w', encoding='utf-8').write(sql)
print(OUT, len(rows), '글')
