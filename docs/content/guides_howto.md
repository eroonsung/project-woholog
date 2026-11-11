# guides_howto.md: 가이드 글 넣는 방법

가이드 글은 `guides` 표에 **시드 SQL**로 넣는다(Supabase 대시보드에서 직접 넣어도 같은 칸을 채우면 된다). 화면은 `status = 'published'`인 글만 보여 준다(`/guides`, `/guides/[slug]`). 운영 DB에 쓰는 일이라 적용 전에 Claude에게 시드 파일을 보여 주고 **허락**(CLAUDE.md 규칙 17)을 받는다.

## 1. 칸
| 칸 | 필수 | 설명 |
|---|---|---|
| `slug` | ✓ | 주소가 된다(`/guides/jp-quarterly`). 영문 소문자·숫자·`-`만, 겹치면 안 됨. 한번 정하면 바꾸지 않는다. |
| `title_ko` | ✓ | 제목. |
| `body_ko` | ✓ | 본문(아래 2번 형식). |
| `status` | ✓ | `draft`(초안, 화면에 안 나옴) / `published`(발행) / `archived`(내림). 기본값은 `draft`다. |
| `country` | | 나라 코드(`JP`, `CA`…). 글 위쪽에 나라 이름이 나온다. |
| `program_id` | | **`{fact_key}` 값을 가져올 나라 프로그램.** 글에 `{fact_key}`를 쓰면 꼭 채운다(아래 3번). |
| `reviewed_at` | | 마지막으로 내용을 확인한 날(`2026-12-20`). "확인일 …"로 보인다. |
| `needs_review` | | 기본값 false. 글에 쓴 사실 값이 바뀌면 **자동으로 true**가 되고, 화면 맨 위에 "일부 정보가 바뀌어 다시 확인하는 중이에요"가 붙는다. 다시 확인한 뒤 false로 돌리고 `reviewed_at`을 고친다. |
| `title_en`·`body_en` | | 영어판. 지금 화면은 쓰지 않는다(비워 둔다). |

`id`·`updated_at`은 자동이다. **목록은 `updated_at`이 최신인 순**이라 글을 고치면 맨 위로 올라간다.

## 2. 본문 형식
마크다운 중 아래만 읽는다. 그 밖의 것(HTML, 이미지, 표)은 글자 그대로 보인다.
- `## 제목`, `### 소제목`
- 문단(빈 줄로 구분), 목록(`- 항목`)
- `**굵게**`, `[글자](https://주소)` — 링크는 `https://`(또는 `http://`)만 되고 새 탭으로 열린다.

## 3. `{fact_key}`: DB 값을 글에 끼워 넣기
본문에 `{visa_fee}`처럼 쓰면 화면이 **그 글의 `program_id` 나라의 현재 값**으로 바꿔 보여 준다. 값이 바뀌어도 글을 고치지 않아도 된다.
- 값이 없거나 `program_id`가 비어 있으면 **"확인 중"**으로 나온다(지어내지 않음).
- 표(`fact_keys`)에 없는 키를 쓰면 **저장할 때 오류**가 난다(오타 방지 트리거).
- 값 모양: 돈 `{proof_amount}` → "CAD 2,500 (약 250만 원)", 개월 `{study_max_months}` → "3개월", 예/아니요 `{no_fulltime}` → "예", 글 `{apply_method}` → 글 그대로.

쓸 수 있는 키(`fact_keys`): `apply_method`(신청 방법) · `employer_limit_months`(한 고용주 근무 한도) · `extension`(연장·전환) · `extension_by_regional_work`(지정 지역 근무로 연장) · `health_surcharge`(보건부담금) · `insurance_required`(보험 조건) · `job_hard_note`(구직 어려움 안내) · `job_language_required`(일자리 필수 언어) · `medical_check`(신체검사) · `no_fulltime`(정규직·상근 불가) · `prohibited_work`(금지 업종) · `proof_amount`(재정 증명 금액) · `proof_amount_with_ticket`(항공권 증빙 시 재정 증명 금액) · `proof_note`(재정 증명 설명) · `special_note`(특이사항) · `study_max_months`(어학 허용 기간) · `study_note`(어학 규칙 설명) · `visa_fee`(비자 비용) · `work_limit_months`(총 취업 가능 기간) · `work_note`(일 규칙 설명).
나라마다 값이 없는 키가 있다(예: 아직 숫자가 없는 잔고 증명). 나라 상세에서 "확인 중"인 값은 글에서도 "확인 중"이다.

## 4. 시드 파일 예시 (`supabase/seed/seed_guides_v1.sql`)
`program_id`는 나라 코드로 찾는다. `on conflict (slug) do update`라서 같은 파일을 고쳐서 다시 실행하면 글이 갱신된다.
```sql
begin;
insert into guides (slug, country, program_id, title_ko, body_ko, status, reviewed_at) values
  ('jp-money-start', 'JP',
   (select id from programs where origin = 'KR' and destination = 'JP' and kind = 'working_holiday'),
   '일본 워홀, 첫 달 돈은 얼마나 필요할까',
   E'## 먼저 확인할 것\n\n잔고 증명은 **{proof_amount}** 이고 비자 비용은 {visa_fee}예요.\n\n- 어학원은 {study_max_months}까지 다닐 수 있어요.\n- 자세한 값은 [나라 상세](https://project-woholog.vercel.app/countries/JP)에서 봐요.',
   'published', '2026-12-20')
on conflict (slug) do update set
  country = excluded.country, program_id = excluded.program_id, title_ko = excluded.title_ko,
  body_ko = excluded.body_ko, status = excluded.status, reviewed_at = excluded.reviewed_at, needs_review = false;
commit;
```
- 본문 문자열은 `E'…'`로 쓰고 줄바꿈은 `\n`. 글 안에 작은따옴표(`'`)를 쓰면 `''`로 겹쳐 쓴다.
- 링크는 운영 주소 그대로 적는다(도메인이 정해지면 한 번에 바꾼다).

## 5. 올리는 순서
1. 시드 파일을 만들어 Claude에게 준다(형식·`{fact_key}`·링크를 확인해 준다).
2. **초안은 화면에서 볼 수 없다**(공개 정책이 발행된 글만 열어서). 그래서 `published`로 올린 뒤 `/guides/슬러그`에서 확인하고, 고칠 곳은 같은 파일을 고쳐 다시 적용한다.
3. 가이드 화면은 1시간마다 새로 만든다. 바로 보려면 배포를 한 번 한다.
4. 올린 글의 `slug`와 올린 날짜를 `docs/ops/launch_checklist.md`에 적고, 아직 올리지 않은 "곧 올라올 글" 제목(`content/copy_ko.json`의 `guides.planned`)은 지운다.
5. 글 첫 문단이 목록의 한 줄 요약(앞 90자)이 된다. `{fact_key}`는 요약에서 빠진다.

## 6. 글을 쓸 때 지킬 것
- 숫자·규칙은 직접 쓰지 말고 `{fact_key}`로 쓴다(값이 바뀌면 글이 틀린 채로 남기 때문). DB에 없는 값은 쓰지 않고 "확인 중"으로 둔다.
- 출처가 필요한 주장은 공식 링크를 붙인다.
- "예정"은 쓰지 않는다(준비 중 기능 규칙). 목표라고 쓴다.
