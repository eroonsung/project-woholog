# CLAUDE.md: 워홀로그 (woholog)

이 저장소에서 일하는 AI 코딩 도우미가 **매번 먼저 읽는 규칙**이다. 짧게 유지한다. 자세한 동작은 `SPEC.md`, 결정의 이유는 `DECISIONS.md`에 있다.

## 0. 작업 시작 전에 꼭 할 것
1. 이 파일을 읽는다.
2. 이번 작업 단계(9장)와 관련된 `SPEC.md` 장을 읽는다.
3. 관련된 `DECISIONS.md` 항목을 확인한다.
4. 문서에 없는 결정이 필요하면 **추측하지 말고 멈춰서 묻는다.** 답을 받으면 `DECISIONS.md`에 새 항목을 추가하고, 동작 규칙이면 `SPEC.md`도 고친다.

### 문서 역할과 정답 우선순위
| 문서 | 무엇의 정답인가 |
|---|---|
| `CLAUDE.md` | 작업 방식, 절대 규칙, 폴더, 작업 순서 |
| `DECISIONS.md` | 범위와 이유 (무엇을 하고 안 하는지, 왜) |
| `SPEC.md` | 화면 동작 (상태, 이동, 저장, 오류, 경계값) |
| `content/copy_ko.json` | 화면 문구 |
| Figma 와이어프레임 (아래 "와이어프레임 보는 법") | 배치와 생김새 |
| `docs/engine/fit_engine_v1.py` | 계산 결과 |

문서끼리 다르면 고치기 전에 어느 쪽이 맞는지 묻는다.

### 와이어프레임 보는 법
- 기준: Figma 파일 [Woholog-Wireframe](https://www.figma.com/design/hcE2mDdgJdsBqM2GPydP0L/Woholog-Wireframe). 페이지 `Mobile`·`Web`, 프레임 이름 = 화면 ID (`S07_result_m`, `S07_result_w`).
- Figma MCP(`figma` 서버)로 읽는다. 화면 작업을 시작할 때 그 화면의 모바일·웹 프레임을 **한 번씩만** 읽고(`get_design_context` 또는 `get_screenshot`), 같은 작업 안에서 반복해서 부르지 않는다. 사용 횟수 제한이 있다.
- Figma 코드(React·Tailwind 출력)는 **참고용**이다. 그대로 붙이지 말고 우리 컴포넌트·디자인 토큰·문구 키로 다시 만든다.
- Figma 글꼴은 Noto Sans KR이지만 코드는 Pretendard다(DECISIONS D-032). 와이어의 hex·px 값이 토큰과 다르면 토큰을 쓴다.
- MCP가 연결 안 되거나 횟수 제한에 걸리면 `docs/design/screens/`의 PNG(같은 이름)를 본다. PNG도 없으면 멈추고 프레임 링크나 캡처를 달라고 한다.

## 1. 무엇을 만드나
- 워킹홀리데이를 고민하는 한국 청년이 "마음에 둔 나라가 나한테 맞는지" 확인하는 웹 서비스.
- 핵심 흐름: 첫 화면 → 질문 12개(약 2분) → 결과(적합도 % + ✓△✗ 이유) → 나란히 비교 → 나라 상세 → D-day 체크리스트.
- 오픈 **2026-12-31**, 로그인 없음. 운영자 1명, 주 10~15시간. **유지보수가 쉬운 코드가 최우선**이다.

## 2. MVP 범위
**만든다**: 헤더·메가 메뉴·모바일 메뉴 / 첫 화면 / 질문 12개 / 적합도 계산 / 결과·공유 링크·공유 이미지 / 나란히 비교 / 29개국 비교표 / 나라 상세 / D-day 체크리스트(브라우저 저장) / To Korea 대기자(영어 1장) / Coming soon 모달·오픈 알림 이메일 / 정보 제보 / 처리방침(한·영) / 필수 앱·추천 준비물 칸 / 가이드 목록·글 / 준비 중 기능 모음·상세 + 원해요 / 이벤트 측정.

**만들지 않는다** (요청이 와도 먼저 확인): 로그인·회원가입, 커뮤니티·댓글·DM, 관리자 화면(Supabase 대시보드로 대신), 결제·광고 코드, To Korea 가이드·체크리스트, 체크리스트 서버 저장, 준비 중 기능의 실제 기능, 전체 다국어 번역.

자세한 목록과 이유: `docs/product/scope_ia.md`, `DECISIONS.md` D-001~D-005.

## 3. 기술 스택
- Next.js(App Router) + TypeScript(strict) + Tailwind CSS (환경변수는 `.env.example`: Supabase 3개 + `NEXT_PUBLIC_SITE_LIVE`)
- Supabase(Postgres, RLS), `@supabase/supabase-js`
- Vercel 배포, Vercel Web Analytics(쿠키 없음)
- Vitest(엔진·변환·유틸), Playwright(핵심 흐름)
- 폰트 Pretendard(자체 호스팅, 서브셋 Core·Extra, D-112), 아이콘 lucide-react
- **새 라이브러리는 이유를 말하고 허락받는다.** 상태 관리 라이브러리, UI 키트, ORM은 쓰지 않는다.

## 4. 절대 규칙
1. **계산은 `lib/engine`에서만.** 화면에서 점수·%·✓△✗·후보 나라를 계산하지 않는다.
2. **사실 값은 DB에서만.** 나라 규칙, 금액, 나이, 시급, 날짜를 코드에 쓰지 않는다. 테스트 데이터만 `tests/fixtures`에 둔다.
3. **가중치·기준값은 `scoring_config`에서 읽는다.** 기본값이 꼭 필요하면 `lib/engine/defaults.ts` 한 곳에만 둔다.
4. **문구는 `content/copy_ko.json`(영어 화면은 `copy_en.json`)의 키로만.** 컴포넌트에 문장을 쓰지 않는다. 문구가 없으면 키를 추가하고 알려 준다. **예외: 처리방침 같은 긴 문서는 `content/privacy_ko.json`·`privacy_en.json`(원본 `docs/legal/privacy.md` 하나, 고칠 때는 `scripts/build_privacy_content.py`로 다시 변환, D-123).**
5. **색·간격·글자 크기는 디자인 토큰만.** 임의의 hex 값이나 `mt-[13px]` 같은 값을 쓰지 않는다.
6. **엔진을 고치면 회귀 테스트(가상 사용자 6명)를 반드시 돌린다.** 기대값이 달라지면 나라별 변화표를 먼저 보여 주고 허락받는다.
7. **DB 구조는 `supabase/migrations`의 새 파일로만 바꾼다.** 기존 파일을 고치지 않는다. RLS를 끄거나 정책을 넓히지 않는다.
8. **비밀키는 `.env.local`에만.** `SUPABASE_SERVICE_ROLE_KEY`는 서버 코드에서만 쓰고 `NEXT_PUBLIC_`을 붙이지 않는다. 커밋 전에 비밀키가 없는지 확인한다.
   - **`.env*` 파일 내용은 절대 출력하지 않는다.** `cat`, `Read`, `sed`, `echo` 모두 안 된다. 확인이 필요하면 변수 이름 목록만 본다(예: `grep -o '^[A-Z_]*=' .env.local`).
   - `.gitignore`는 0단계 첫 작업으로 만든다(`.env*` 제외, `.env.example`만 허용).
   - 환경변수 이름은 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` 셋이다.
9. **개인정보는 이메일만.** 동의 체크박스는 처음에 비어 있고, 동의 시각과 `consent_version`을 같이 저장한다. 처리방침과 실제 동작이 같아야 한다. 이벤트에 답변 값을 넣지 않는다.
10. **브라우저 저장소는 `SPEC.md` 0.2의 키만 쓰고, 읽기·쓰기는 모두 try/catch.** 저장소가 막혀도 화면이 깨지면 안 된다.
11. **값이 없으면 "확인 중".** 값을 지어내지 않는다.
12. **한 번에 작업 하나.** 9장의 한 단계만 하고, 완료 기준을 확인한 뒤 멈춘다.
13. 접근성: 모든 버튼·칩은 키보드로 고를 수 있고, 터치 영역은 44px 이상, ✓△✗는 색만이 아니라 모양·글자로도 구분한다.
14. 파일 하나는 300줄을 넘기지 않는다.
15. **제휴 링크에는 "광고" 표시와 수수료 안내 문구를 반드시 붙인다.** 링크가 없으면 준비 중 카드만 보여 준다.
16. **준비 중 기능은 템플릿 1개 + `features_ko.json`으로만.** "예정"은 항상 "목표"로 쓴다.
17. **작업을 지우거나 되돌리는 명령은 실행 전에 이유와 영향을 말하고 허락을 받는다.** `git checkout -- .`, `git reset --hard`, `git clean -f`, `git push --force`, 브랜치 강제 삭제(`git branch -D`, 원격 삭제 포함)가 해당한다. **운영 DB에 쓰는 명령**(`db push`, 쓰기가 들어간 `db query` 등)도 같다. 사용자가 그 작업을 이미 직접 요청한 경우에는 무엇을 적용하는지 먼저 말한 뒤 실행한다.
    - **`main`에 push하기 전에는 반드시 멈추고 사용자 허락을 받는다**(`main` push = 운영 배포, D-101). 허락은 사용자가 "push해"라고 답했을 때만 유효하다. 다른 대답이나 무응답이면 push하지 않는다. 커밋은 로컬 저장이라 자유롭게 한다. 자세한 절차는 7장.
    - **자동 테스트·확인 스크립트는 운영 DB에 쓰지 않는다**(D-106). 저장이 필요한 확인은 가짜 응답(요청 가로채기·mock)으로 한다. 이 프로젝트에는 로컬 DB가 없고(D-066) 로컬 서버도 운영 DB에 연결되므로, "로컬 서버로 확인"하다가 저장이 일어나도 운영 쓰기다. 운영 저장 확인이 꼭 필요하면 먼저 허락받고, 만든 테스트 결과는 `docs/ops/test_data.md`에 기록한다.
    - **프로세스는 내가 띄운 것만, 포트나 PID를 정확히 지정해서 종료한다**(D-108). `pkill -f`처럼 이름 조건으로 넓게 죽이는 명령은 쓰지 않는다(예: `lsof -ti tcp:3121 | xargs kill`). **Yvonne의 개발 서버(포트 3000)는 건드리지 않는다.** 내 확인용 서버는 3000이 아닌 다른 포트(3120·3121)에서 띄운다. 계기: `pkill -f "next dev"`가 Yvonne의 개발 서버까지 종료했다.

## 5. 폴더 구조
```
CLAUDE.md  SPEC.md  DECISIONS.md  README.md  proxy.ts(소문자 나라 코드 → 대문자 주소)  (기준 문서 3개와 README만 대문자, 나머지 규칙은 아래)
app/
  fonts/  PretendardCore.woff2  PretendardExtra.woff2  PretendardCore.chars.txt  share/PretendardShare-500·800.ttf(공유 이미지용)  (원본 2MB는 fonts_src/)
  page.tsx                    첫 화면
  test/page.tsx               질문 12개 (?q=1..12, ?pre=JP)
  r/[id]/page.tsx             결과
  r/[id]/compare/page.tsx     결과에서 비교 (?c=JP,CA)
  r/[id]/opengraph-image.tsx  OG 이미지
  r/[id]/story/route.ts       스토리 이미지 PNG
  compare/page.tsx            테스트 없이 비교
  countries/page.tsx          29개국 비교표
  countries/[code]/page.tsx   나라 상세
  checklist/page.tsx          체크리스트 (?c=JP&d=2027-03-01&s=…)
  to-korea/page.tsx           To Korea 대기자 (영어)
  guides/page.tsx, guides/[slug]/page.tsx
  soon/page.tsx, soon/[slug]/page.tsx
  privacy/page.tsx            (?lang=en)
  not-found.tsx, error.tsx, robots.ts(오픈 전 전체 Disallow, D-092)
  report/page.tsx             정보 제보 임시 화면(9단계에 모달로 교체)
  dev/result/page.tsx         결과 카드 경우 확인용(개발 서버만, 운영 404)
  dev/compare/page.tsx        비교에 담기 버튼·막대 확인용(개발 서버만, 운영 404)
  api/result/route.ts  api/subscribe/route.ts  api/report/route.ts  api/vote/route.ts
components/
  ui/  layout/  home/  compare/  countries/  quiz/  result/  countries/  checklist/  soon/  shared/
lib/
  engine/   types.ts score.ts marks.ts adapter.ts reasons.ts whatIf.ts candidates.ts defaults.ts index.ts
  data/     supabase.ts(읽기, 익명 키) admin.ts·mutations.ts(쓰기, 서비스 키, 서버 전용) queries.ts (화면에서 직접 쿼리 금지)
  result/   types.ts compute.ts card.ts example.ts preview.ts previewText.ts text.ts   저장하는 결과(스냅샷)·서버 계산·맨 위 카드 고르기·현실 미리보기·문구 풀기
  compare/  parse.ts build.ts fit.ts store.ts   비교 주소 읽기·표 값·내 결과 줄·비교에 담기 저장(6단계)
  countries/  list.ts detail.ts   29개국 비교표 정렬·필터·주소, 나라 상세 값(7단계)
  josa.ts      조사 고르기(은/는·이/가…), 문구에서는 {이름:이/가}
  server/   ip.ts limits.ts       IP 해시·요청 제한 기준(SPEC 0.8)
  features.ts  준비 중 기능 15개(features_ko.json)·단계·다른 기능 3개   votes.ts  원해요(woholog.votes.v1)·보내기·되돌리기
  guides.ts    가이드 마크다운·{fact_key} 채우기   share/  data.ts image.tsx colors.ts  공유 이미지 값·그리기(OG·스토리, D-125)
  site.ts      오픈 여부(NEXT_PUBLIC_SITE_LIVE)
  storage.ts   브라우저 저장소 (SPEC.md 0.2의 키만)
  quiz/     types.ts config.ts steps.ts state.ts submit.ts validate.ts   질문 순서·이동·저장 (화면 없이 테스트)
  checklist.ts 항목 + 출국일 → 단계·날짜, 링크 상태 줄이기·풀기(순수 계산)  checklistStore.ts 체크리스트 저장(woholog.checklist.v1)
  copy.ts(t · tEn)  format.ts  age.ts(생년월일 → 만 나이)  analytics.ts  rateLimit.ts  subscribe.ts(이메일 신청 검사)  report.ts(제보 검사)
content/
  copy_ko.json  copy_en.json  features_ko.json  partners.json  nav_ko.json  landing_countries.json  landing_example.json
  privacy_ko.json  privacy_en.json  (처리방침 문서, docs/legal/privacy.md → scripts/build_privacy_content.py, D-122)
supabase/
  migrations/  001_schema_v2_1.sql  002_feature_votes.sql  003_extension_fact_key.sql  004_proof_amount_with_ticket.sql  005_rate_limit_security.sql
  seed/seed_v1_1.sql  seed/seed_checklist_v1.sql  seed/seed_engine_v1.sql  seed/seed_proof_ticket_v1.sql  seed/seed_nl_proof_v1.sql
scripts/
  precheck.sh  push 전 확인(build·tsc·eslint·vitest, .env*, 키 패턴) — npm run precheck
  make_share_fonts.py  공유 이미지용 정적 글꼴(app/fonts/share/*.ttf) 만들기(D-125)
  build_privacy_content.py  privacy.md → content/privacy_*.json (D-122)
  make_font_subset.py  Pretendard 서브셋(Core·Extra) 만들기, 글자가 늘면 다시 실행(D-112)
  check_font_chars.mjs  Core에 없는 글자 경고(precheck가 호출, D-113)
tests/
  engine.test.ts  adapter.test.ts  checklist.test.tsx  storage.test.ts
  fixtures/personas_expected.json  countries_v1.ts  personas.ts  db_rows_v1.json(DB 스냅샷)
  e2e/flow.spec.ts
docs/
  engine/fit_engine_v1.py
  db/db_test_v2.sql  db/db_test_v2_live.sql (Supabase에서 실행하는 버전)
  design/design_guide_v1.md  design/screens/ (예비용 PNG, Figma 프레임 이름 그대로)
  content/copy_ko.md  content/checklist_v1.md (체크리스트 내용 검토본)
  legal/privacy.md
  product/scope_ia.md  product/prd.md
  ops/test_data.md  ops/launch_checklist.md (운영 테스트 데이터 기록·오픈 전 체크리스트)
```

### 파일 이름 규칙
| 종류 | 규칙 | 예 |
|---|---|---|
| 루트 기준 문서 | 대문자 | `CLAUDE.md`, `SPEC.md`, `DECISIONS.md` |
| 폴더 안내 | 대문자 | `README.md` |
| 그 밖의 문서·데이터·SQL (`docs/`, `content/`, `supabase/`, `tests/fixtures/`) | 소문자 + 밑줄(`_`), 언어·버전은 끝에 `_ko`, `_v1` | `scope_ia.md`, `checklist_v1.md`, `copy_ko.json`, `seed_checklist_v1.sql` |
| 코드 | Next.js·TypeScript 관례 | `page.tsx`, `opengraph-image.tsx`, `rateLimit.ts`, `engine.test.ts` |

새 파일을 만들 때 이 표를 따른다. 마이그레이션은 `003_짧은_설명.sql`처럼 번호를 붙인다.

## 6. DB → 엔진 입력 변환 (`lib/engine/adapter.ts`)
이 규칙으로 28개 나라를 변환한 결과가 Python 엔진의 나라 표와 **완전히 같아야 한다**(`adapter.test.ts`). 기준값은 `scoring_config.tiers`에서 읽는다.

**협정국은 29곳이지만 엔진·`adapter.test.ts`가 다루는 것은 `active` 프로그램 28개다.** 핀란드는 협정이 아직 발효되지 않아 계산에서 빼고, 화면에는 "곧 열려요" 표시만 한다(D-063).

| 엔진 값 | DB에서 만드는 법 |
|---|---|
| age | `programs.age_max` |
| eng | `countries.english` (Y / H / N) |
| langs | `countries.languages`(일자리 언어)에서 영어 제외 |
| local_req | `program_facts`에 `job_language_required`가 있으면 1 |
| no_fulltime | `no_fulltime` 값이 1이면 1 |
| emp | `employer_limit_months` ≤ 3이면 1 (6개월 제한은 화면 표시만) |
| hard | `job_hard_note`가 있으면 1 |
| wage | 최저시급을 원화로 바꿔 15,000원 이상 상, 9,500원 이상 중, 그 아래 하. 시급이 없으면 월급 ÷ 173.8. 법정 최저임금 행이 없으면 없음. 도시별 값만 있으면 가장 높은 도시 값 |
| price | `price_level_kr100` 100 미만 낮음, 135 미만 중간, 그 이상 높음, 없으면 null |
| kor | `korean_population` 30,000 이상 많음, 5,000 이상 중간, 그 아래 적음, 없으면 null |
| study | `study_max_months`, 없으면 null(확인 중, 계산 제외) |
| long2 | `long_stay_months` ≥ 24 또는 `stay_months` ≥ 24 또는 `max_participations` ≥ 2 → Y, `long_stay_months` > `stay_months` → P, 나머지 N |
| europe / near | `countries.in_europe` / `near_korea` |
| select | `programs.selection` (unlimited / first_come / lottery) |
| farmForExtension | `program_facts`의 `extension_by_regional_work` 값이 1이면 true (지정 지역 근무로 체류 연장 가능. 지금은 호주만. 3단계에서 `fact_keys`·시드에 추가) |
| need (만 원) | 잔고 증명 + 비자 비용 + 보건부담금(있는 나라만) + `flight_estimates`(왕복 항공권 기준, D-094) → 오늘 환율로 원화 → 만 원 반올림. 잔고 증명은 `proof_amount_with_ticket`(항공권을 낼 때 감액된 금액)이 있으면 그 값, 없으면 `proof_amount`. **둘 다 숫자가 없으면 0이 아니라 null(확인 중)**이고, 0은 `proof_amount`가 0으로 입력된(필요 없음으로 확인된) 나라만. null이면 돈 조건을 점수에서 뺀다 |
| 두 번 가능 | `max_participations` ≥ 2 |

- `active`가 아닌 프로그램은 후보에서 빼고 "곧 열려요"로만 보여 준다.
- 환율이 없는 통화는 계산을 멈추지 말고 그 나라 돈 항목을 "확인 중"으로 두고 로그를 남긴다.
- 출처 이름, 확인일, 오래된 값 여부도 adapter가 같이 넘긴다.

## 7. Git
- 커밋 메시지: `[단계번호] 한 줄 요약` (예: `[4] 결과 저장 API`).
- **4단계부터는 `main`에서 바로 작업하고 커밋한다.** 단계별 브랜치와 PR은 쓰지 않는다(3단계 `step-3-supabase`가 마지막). 커밋은 로컬 저장이라 자유롭게 한다.
- **`main` push = Vercel 운영 배포라서, push 전에 반드시 멈추고 아래를 보여 준 뒤 사용자 허락을 받는다**(D-101).
  - a) 이번에 push할 커밋 목록: `git log origin/main..HEAD --oneline`
  - b) 바뀐 파일 목록: `git diff --stat origin/main..HEAD`
  - c) `npm run precheck` 결과(build·tsc·eslint·vitest, `.env*` 없음, 키 패턴 0건)
  - d) 운영 DB에 적용할 마이그레이션·시드가 있으면 그 목록
  - e) **추천 push 문구**: 이번 배포를 한 줄로 요약한 `[단계번호] …` 형식 제안(D-104). 사용자가 다른 문구를 정하면 아직 push하지 않은 커밋 메시지에 반영한다.
  - 사용자가 **"push해"**라고 답했을 때만 push한다. 다른 대답이나 대답이 없으면 push하지 않는다.
- **push 전 확인 — 하나라도 실패하면 허락을 구하지 않고 먼저 고친다(통과해야 허락을 요청할 수 있다).**
  1. `npm run build`, `tsc`(`npm run typecheck`), `eslint`(`npm run lint`), `vitest`(`npm test`) 통과
  2. 스테이징에 `.env*` 파일이 없다(`.env.example`만 허용)
  3. 바뀐 내용에 키 패턴이 0건: `sb_secret_`·`sb_publishable_` 뒤에 긴 값, `eyJ`로 시작하는 긴 문자열, 코드의 `service_role` (문서에서 패턴 이름만 적은 줄은 제외)
  - 위 3가지는 `npm run precheck`(`scripts/precheck.sh`)가 한 번에 확인한다. 통과해야 push 허락을 요청할 수 있다.
- **실험성 큰 변경**(큰 구조·디자인 변경, 되돌리기 어려운 마이그레이션 등)만 브랜치로 하고, Vercel 미리보기 주소로 확인한 뒤 병합한다(merge commit).
- **Vercel Production Branch = `main`**(`vercel.json`으로 `framework: nextjs` 고정). 배포 상태는 `gh api repos/{owner}/{repo}/commits/{sha}/status`의 `Vercel` 항목과 `npx vercel ls`로 확인한다(D-093). 운영 주소: https://project-woholog.vercel.app
- 단계가 끝나면 커밋하고 8장 형식으로 보고한 뒤 멈춘다. push는 위 허락 절차를 거친다.
- 되돌리기 어려운 git 명령과 운영 DB 쓰기는 4장 규칙 17을 따른다.

## 8. 완료 보고 형식
각 단계 끝에 아래를 보여 준다. (Vercel·운영과 관련된 확인이 필요한 단계는 맨 위에 체크리스트를 먼저 둔다.)
1. 한 일 (파일 목록)
2. 완료 기준 체크리스트 (✓ / ✗)
3. `SPEC.md` 17장 상태 확인표에서 이 단계 화면의 확인 결과
4. 새로 정한 것 → `DECISIONS.md`에 추가한 항목 번호
5. push 결과 — **"push 대기(허락 필요)"와 "push 완료"를 구분해서 쓴다.**
   - push 대기: 커밋 목록, 바뀐 파일 목록, `npm run precheck` 결과, 운영 DB에 적용할 마이그레이션·시드(없으면 "없음")를 보여 주고 허락을 요청한다.
   - push 완료: 커밋 해시, 운영 배포 결과(Vercel 상태, 운영 주소 확인)
6. 남은 문제·물어볼 것

## 9. 작업 순서와 완료 기준
| 단계 | 할 일 | 읽을 spec | 완료 기준 |
|---|---|---|---|
| 0 준비 | Next.js, Tailwind 토큰, Pretendard, lucide, Vitest, 폴더, `.env.example`, `lib/storage.ts` | 0장 | `npm run build` 성공, `/dev/tokens`(배포 제외)에서 색·버튼·칩 확인 |
| 1 엔진 옮기기 | `fit_engine_v1.py` → `lib/engine` (후보 나라 계산 포함) | 3.2 마지막 줄 | `engine.test.ts`: 6명 × 모든 나라의 %, ✓△✗, 뱃지, 순서가 100% 같음 |
| 2 질문 화면 | 12개 질문, 진행 막대, 주소 `?q=`, 이전·처음부터, 건너뛰기, 나이 안내, 저장 | 3장 | Figma 프레임(S01~S06)과 차이 목록 0개, 키보드만으로 끝까지, 17장 테스트 줄 통과 |
| 3 Supabase | 마이그레이션·시드를 지금 프로젝트 하나(서울 리전)에 바로 적용(로컬 Docker 안 씀. 오픈 후 개발용 프로젝트를 따로 만든다, D-066), `queries.ts`, `adapter.ts` | 0.3 | `adapter.test.ts` 통과, `db_test_v2.sql` 통과, 익명 키로 쓰기·관리 표 읽기 막힘 |
| 4 엔진 연결 | 답변 → `api/result` → 저장 → `/r/[id]`, 요청 제한(마이그레이션 `005_rate_limit_security.sql`: Supabase 표 + 함수, IP 해시만 저장·24시간 뒤 삭제, D-065) | 3.3, 0.8 | Yvonne 예시 답 결과가 기대값과 같음, 새 창에서도 같은 결과, 실패 후 다시 시도 |
| 4.5 공통 레이아웃 | 헤더·메가 메뉴(웹)·모바일 전체 화면 메뉴·푸터를 `app/layout.tsx`에 연결. 아직 없는 페이지는 공통 "준비 중이에요" 임시 화면으로 연결(그 단계에서 진짜 화면으로 교체). 로그인·시작하기·커뮤니티는 `/soon/community`로 연결만(Coming soon 모달은 9단계) | 1장, 0.5, D-004 | SPEC 1장 규칙(메가 메뉴 키보드·Esc, 모바일 메뉴 스크롤 잠금, 현재 페이지 굵게), 375px 가로 스크롤 없음, 키보드만으로 모든 메뉴 이동, `/test`·`/r/[id]`에도 헤더·푸터 |
| 5 결과 화면 | 카드 5가지 경우, 조건 줄, 이렇게 바꾸면, 현실 미리보기, TOP 3, 갈 수 없는 나라 | 4장 | 17장 결과 줄 통과, 문구가 모두 copy 파일에서 옴 |
| 5.5 홈 화면 | 첫 화면 `/`(S00): 히어로·"예시" 카드·특별한 이유·나라 둘러보기·이어서 하기 링크. 결과 카드 부품을 재사용 | 2장 | Figma 프레임(S00_landing)과 차이 목록, 이어서 하기(Q7부터) 링크, 예시 카드 "예시" 표시 |
| 5.1 Q12 현지 언어 칩 | "현지 언어 배우기" 칩 추가(엔진 Python → TS → candidates → 질문 → 결과 조건 줄), 마음 이유에서 "언어 배우기" 제거 | 3장, 4장 | 회귀 6명 결과 불변, 새 사용자 G가 Python과 TS에서 일치, 나라별 표시표 승인(D-110) |
| 5.2 글꼴 용량 | Pretendard 2MB 가변 글꼴 → 서브셋·분할, preload·swap | 0장 | Lighthouse 모바일 성능 90 이상(목표), 글자 □ 없음 |
| 6 비교 | 비교 화면, 비교에 담기 | 6장 | 17장 비교 줄 통과 |
| 7 비교표·상세 | 정렬·필터·주소, 상세 섹션·목차·여행경보 배너 | 7·8·9장 | 17장 비교표·나라 상세 줄 통과, 상세 숫자가 DB와 같음 |
| 8 체크리스트 | 시작·목록·저장·링크·필수 앱·추천 준비물 | 10장 | 17장 체크리스트 줄 통과, `checklist.test.ts`(날짜 계산·링크 줄이기) 통과. `needs_review` 항목은 화면에 "확인 필요" 표시 |
| 8.5 실제 기기 점검 | 실제 휴대폰·카카오톡·인스타 앱 안 브라우저 점검, 지인 테스트(Yvonne가 진행). **11단계 전까지, 9·10단계와 병행**. 나온 문제는 고친 뒤 11단계로 | 0.1, 0.4 | 점검 목록(`docs/ops/device_check.md`)의 문제가 모두 고쳐지거나 "오픈 후"로 미룸 결정됨 |
| 9 신청·제보·처리방침·To Korea | 모달, `api/subscribe`, `api/report`, `/privacy`, `/to-korea` | 11·12·13·16장 | 17장 이메일·제보 줄 통과, To Korea 신청은 section = to_korea |
| 10 준비 중·가이드·공유 | `/soon`, 원해요, `/guides`, OG·스토리 이미지, 공유 버튼 | 5·14·15장 | 15개 slug 열림, 원해요 숫자가 `feature_vote_counts()`와 같음, 카톡·인스타 미리보기에서 이미지 안 잘림 |
| 11 마무리 | 404·오류 화면(0.4), Playwright, Lighthouse, 메타 태그, 이벤트, 임시 "준비 중이에요" 화면이 남아 있지 않은지 확인 | 0.4, 0.7 | Lighthouse 모바일 성능·접근성 90 이상, 운영 주소에서 첫 화면 → 테스트 → 결과 → 상세 → 체크리스트 끊김 없음 |

**작업 순서(D-103)**: 0 → 1 → 2 → 3 → 4 → **4.5 → 5 → 5.5 → 5.1 → 5.2** → 6 → 7 → 8 → 9 → 10 → 11. **8.5(실제 기기 점검)는 11단계 전까지 9·10단계와 병행**한다(D-121). 모든 화면이 헤더·푸터 안에 들어가므로 틀(4.5)을 먼저 만들고, 홈(5.5)은 결과 카드 부품을 재사용하려고 결과(5) 다음에 한다.

오픈 후(지금 하지 않음): 환율 자동 갱신, 출처 변경 감지, 확인일 알림, 1년 지난 결과 삭제, 알림 발송 후 구독자 삭제.

## 10. 막힐 때
- 엔진 동작이 이상해 보여도 Python 원본과 같으면 고치지 않고 보고만 한다.
- 데이터가 비어 있으면 "확인 중"으로 보여 준다.
- 같은 오류로 두 번 실패하면 세 번째 시도 전에 원인과 선택지를 보고한다.
