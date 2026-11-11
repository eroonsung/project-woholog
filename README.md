# 워홀로그 (woholog)

워킹홀리데이를 고민하는 한국 청년이 "마음에 둔 나라가 나한테 맞는지" 확인하는 웹 서비스입니다. 질문 12개(약 2분)에 답하면 나라별 적합도(%)와 ✓△✗ 이유를 보여 주고, 나란히 비교·나라 상세·D-day 체크리스트로 이어집니다. 오픈 예정일은 2026-12-31입니다.

운영 주소: https://project-woholog.vercel.app (오픈 전에는 검색에 나오지 않습니다)

## 기준 문서 (먼저 읽기)
| 문서 | 무엇의 기준인가 |
|---|---|
| [CLAUDE.md](CLAUDE.md) | 작업 방식, 절대 규칙, 폴더 구조, 작업 순서 |
| [SPEC.md](SPEC.md) | 화면 동작(상태·이동·저장·오류·경계값) |
| [DECISIONS.md](DECISIONS.md) | 범위와 결정의 이유, 열린 질문 |

그 밖에 `docs/`(엔진 원본, DB 테스트, 디자인 가이드·와이어프레임 PNG, 문구, 법적 문서, 운영 기록·오픈 전 체크리스트)와 `content/`(화면 문구·메뉴 데이터)가 있습니다.

## 개발 시작
Node 26(`.nvmrc`)이 필요합니다.

```bash
npm install
cp .env.example .env.local   # 값은 직접 채웁니다(Supabase URL·키). 키는 커밋하지 않습니다
npm run dev                  # http://localhost:3000  (질문 화면: /test, 디자인 토큰: /dev/tokens)
```

| 명령 | 하는 일 |
|---|---|
| `npm test` | 단위 테스트(엔진·adapter·질문 로직·API) |
| `npm run typecheck` / `npm run lint` | 타입 검사 / 린트 |
| `npm run build` | 운영 빌드 |
| `npm run precheck` | **push 전 확인**: build·tsc·eslint·vitest, `.env*`·키 패턴 검사 |
| `npm run db:snapshot` | 운영 DB 읽기값을 테스트 고정 데이터로 저장 |
| `npm run db:test` | DB 테스트(`docs/db/db_test_v2_live.sql`)를 운영 DB에서 롤백 실행(허락 후) |

`main`에 push하면 Vercel이 운영에 배포합니다. push 전에 `npm run precheck`가 통과해야 합니다(CLAUDE.md 7장).
