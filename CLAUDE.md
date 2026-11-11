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
- Next.js(App Router) + TypeScript(strict) + Tailwind CSS
- Supabase(Postgres, RLS), `@supabase/supabase-js`
- Vercel 배포, Vercel Web Analytics(쿠키 없음)
- Vitest(엔진·변환·유틸), Playwright(핵심 흐름)
- 폰트 Pretendard(자체 호스팅), 아이콘 lucide-react
- **새 라이브러리는 이유를 말하고 허락받는다.** 상태 관리 라이브러리, UI 키트, ORM은 쓰지 않는다.

## 4. 절대 규칙
1. **계산은 `lib/engine`에서만.** 화면에서 점수·%·✓△✗·후보 나라를 계산하지 않는다.
2. **사실 값은 DB에서만.** 나라 규칙, 금액, 나이, 시급, 날짜를 코드에 쓰지 않는다. 테스트 데이터만 `tests/fixtures`에 둔다.
3. **가중치·기준값은 `scoring_config`에서 읽는다.** 기본값이 꼭 필요하면 `lib/engine/defaults.ts` 한 곳에만 둔다.
4. **문구는 `content/copy_ko.json`(영어 화면은 `copy_en.json`)의 키로만.** 컴포넌트에 문장을 쓰지 않는다. 문구가 없으면 키를 추가하고 알려 준다.
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

## 5. 폴더 구조
```
CLAUDE.md  SPEC.md  DECISIONS.md   (기준 문서 3개만 대문자, 나머지 규칙은 아래)
app/
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
  not-found.tsx, error.tsx
  api/result/route.ts  api/subscribe/route.ts  api/report/route.ts  api/vote/route.ts
components/
  ui/  layout/  quiz/  result/  countries/  checklist/  soon/  shared/
lib/
  engine/   types.ts score.ts marks.ts adapter.ts reasons.ts whatIf.ts candidates.ts defaults.ts index.ts
  data/     supabase.ts queries.ts (화면에서 직접 쿼리 금지)
  storage.ts   브라우저 저장소 (SPEC.md 0.2의 키만)
  checklist.ts 항목 + 출국일 → 단계·날짜, 링크 상태 줄이기·풀기
  copy.ts  format.ts  analytics.ts  rateLimit.ts
content/
  copy_ko.json  copy_en.json  features_ko.json  partners.json  nav_ko.json  landing_countries.json
supabase/
  migrations/  001_schema_v2_1.sql  002_feature_votes.sql  (003_rate_limit.sql은 4단계에서)
  seed/seed_v1_1.sql  seed/seed_checklist_v1.sql
tests/
  engine.test.ts  adapter.test.ts  checklist.test.ts  storage.test.ts
  fixtures/personas_expected.json  countries_v1.ts  personas.ts
  e2e/flow.spec.ts
docs/
  engine/fit_engine_v1.py
  db/db_test_v2.sql
  design/design_guide_v1.md  design/screens/ (예비용 PNG, Figma 프레임 이름 그대로)
  content/copy_ko.md  content/checklist_v1.md (체크리스트 내용 검토본)
  legal/privacy.md
  product/scope_ia.md  product/prd.md
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
| need (만 원) | 잔고 증명(없으면 0) + 비자 비용 + `flight_estimates` → 오늘 환율로 원화 → 만 원 반올림 |
| 두 번 가능 | `max_participations` ≥ 2 |

- `active`가 아닌 프로그램은 후보에서 빼고 "곧 열려요"로만 보여 준다.
- 환율이 없는 통화는 계산을 멈추지 말고 그 나라 돈 항목을 "확인 중"으로 두고 로그를 남긴다.
- 출처 이름, 확인일, 오래된 값 여부도 adapter가 같이 넘긴다.

## 7. Git
- 커밋 메시지: `[단계번호] 한 줄 요약` (예: `[2] 질문 화면 Q1~Q6`).
- 단계 하나가 끝나면 커밋하고 멈춘다. `main`에 바로 올리지 않고 단계별 브랜치(`step-2-quiz`)를 쓴다.

## 8. 완료 보고 형식
각 단계 끝에 아래를 보여 준다.
1. 한 일 (파일 목록)
2. 완료 기준 체크리스트 (✓ / ✗)
3. `SPEC.md` 17장 상태 확인표에서 이 단계 화면의 확인 결과
4. 새로 정한 것 → `DECISIONS.md`에 추가한 항목 번호
5. 남은 문제·물어볼 것

## 9. 작업 순서와 완료 기준
| 단계 | 할 일 | 읽을 spec | 완료 기준 |
|---|---|---|---|
| 0 준비 | Next.js, Tailwind 토큰, Pretendard, lucide, Vitest, 폴더, `.env.example`, `lib/storage.ts` | 0장 | `npm run build` 성공, `/dev/tokens`(배포 제외)에서 색·버튼·칩 확인 |
| 1 엔진 옮기기 | `fit_engine_v1.py` → `lib/engine` (후보 나라 계산 포함) | 3.2 마지막 줄 | `engine.test.ts`: 6명 × 모든 나라의 %, ✓△✗, 뱃지, 순서가 100% 같음 |
| 2 질문 화면 | 12개 질문, 진행 막대, 주소 `?q=`, 이전·처음부터, 건너뛰기, 나이 안내, 저장 | 3장 | Figma 프레임(S01~S06)과 차이 목록 0개, 키보드만으로 끝까지, 17장 테스트 줄 통과 |
| 3 Supabase | 마이그레이션·시드를 지금 프로젝트 하나(서울 리전)에 바로 적용(로컬 Docker 안 씀. 오픈 후 개발용 프로젝트를 따로 만든다, D-066), `queries.ts`, `adapter.ts` | 0.3 | `adapter.test.ts` 통과, `db_test_v2.sql` 통과, 익명 키로 쓰기·관리 표 읽기 막힘 |
| 4 엔진 연결 | 답변 → `api/result` → 저장 → `/r/[id]`, 요청 제한(마이그레이션 `003_rate_limit.sql`: Supabase 표 + 함수, IP 해시만 저장·24시간 뒤 삭제, D-065) | 3.3, 0.8 | Yvonne 예시 답 결과가 기대값과 같음, 새 창에서도 같은 결과, 실패 후 다시 시도 |
| 5 결과 화면 | 카드 5가지 경우, 조건 줄, 이렇게 바꾸면, 현실 미리보기, TOP 3, 갈 수 없는 나라 | 4장 | 17장 결과 줄 통과, 문구가 모두 copy 파일에서 옴 |
| 6 비교 | 비교 화면, 비교에 담기 | 6장 | 17장 비교 줄 통과 |
| 7 비교표·상세 | 정렬·필터·주소, 상세 섹션·목차·여행경보 배너 | 7·8·9장 | 17장 비교표·나라 상세 줄 통과, 상세 숫자가 DB와 같음 |
| 8 체크리스트 | 시작·목록·저장·링크·필수 앱·추천 준비물 | 10장 | 17장 체크리스트 줄 통과, `checklist.test.ts`(날짜 계산·링크 줄이기) 통과. `needs_review` 항목은 화면에 "확인 필요" 표시 |
| 9 신청·제보·처리방침·To Korea | 모달, `api/subscribe`, `api/report`, `/privacy`, `/to-korea` | 11·12·13·16장 | 17장 이메일·제보 줄 통과, To Korea 신청은 section = to_korea |
| 10 준비 중·가이드·공유 | `/soon`, 원해요, `/guides`, OG·스토리 이미지, 공유 버튼 | 5·14·15장 | 15개 slug 열림, 원해요 숫자가 `feature_vote_counts()`와 같음, 카톡·인스타 미리보기에서 이미지 안 잘림 |
| 11 마무리 | 헤더·메뉴·푸터 연결, 404·오류 화면, Playwright, Lighthouse, 메타 태그, 이벤트 | 1장, 0.4, 0.7 | Lighthouse 모바일 성능·접근성 90 이상, 운영 주소에서 첫 화면 → 테스트 → 결과 → 상세 → 체크리스트 끊김 없음 |

오픈 후(지금 하지 않음): 환율 자동 갱신, 출처 변경 감지, 확인일 알림, 1년 지난 결과 삭제, 알림 발송 후 구독자 삭제.

## 10. 막힐 때
- 엔진 동작이 이상해 보여도 Python 원본과 같으면 고치지 않고 보고만 한다.
- 데이터가 비어 있으면 "확인 중"으로 보여 준다.
- 같은 오류로 두 번 실패하면 세 번째 시도 전에 원인과 선택지를 보고한다.
