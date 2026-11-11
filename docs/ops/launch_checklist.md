# 오픈 전 체크리스트 (2026-12-31 오픈)

끝낸 항목은 `[x]`로 바꾼다. 운영 DB를 바꾸는 작업은 CLAUDE.md 규칙 17대로 허락받고 실행한다.

## 데이터 정리
- [ ] **오픈 전 테스트 결과 일괄 삭제(허락 받고 실행)** — `docs/ops/test_data.md`에 적어 둔 id만 지운다. 지운 뒤 `quiz_results`에 남은 행이 0인지 확인
- [ ] `launch_subscribers`·`user_reports`·`feature_votes`에 테스트 데이터가 있으면 같이 정리
- [ ] 체크리스트·서류의 `needs_review = true` 항목 확인 후 false로 (D-036, `docs/content/checklist_v1.md` 4장). **번역·아포스티유 필요 여부도 같이 확인**(서류 35개가 모두 `translation_required`·`apostille_required` = false, D-119)
- [ ] 빈 값 채우기 (DECISIONS.md Q-6): 잔고 증명 금액 — 1순위 아일랜드·스페인·포르투갈, 2순위 폴란드·오스트리아·이스라엘
- [x] **필수 앱 v1 적용됨**(`country_apps` 171행, 29개국, 2026-11-11, D-120). **오픈 전 링크 재확인** — 아래 항목과 같이 본다
- [ ] **오픈 전 확인 불가 링크 56개를 브라우저로 직접 확인**(목록은 `docs/content/country_apps_v1.md`에 "⚠ 직접 확인 필요"로 표시). 죽었으면 주소를 고치거나 `url`을 비운다(시드와 DB 같이)
- [ ] **추천 준비물 제휴 링크**(`content/partners.json`이 비어 있음): 링크를 넣을 때 "광고" 표시·수수료 안내가 나오는지 확인
- [ ] 시드의 "재확인"·"공식 재확인 필요" 메모가 붙은 값을 원문으로 확인
- [ ] 환율(`exchange_rates.source = 'assumed'` 가정값)을 실제 값으로 (Q-3)

## 배포·설정
- [ ] Vercel Production에 `NEXT_PUBLIC_SITE_LIVE=true`로 바꾸고 **다시 배포** (D-092). 그 뒤 `/robots.txt`가 `Allow`인지, 메타에서 noindex가 빠졌는지 확인 (`/r/[id]`는 계속 noindex)
- [ ] 도메인 연결, Deployment Protection 설정 확인
- [ ] Supabase 무료 플랜 일시정지(일주일 무사용) 여부 확인. 필요하면 Pro 검토
- [ ] 제휴 링크를 붙이는 시점에 Vercel Pro 전환 검토 (D-030)
- [ ] `/dev/tokens`가 운영에서 404인지 확인

## 문서·법적
- [ ] `docs/legal/privacy.md`의 `[ ]` 빈칸 채우기(운영자, 연락처, 접속 기록 보관일 등), 시행일 확정. **`/privacy`와 `/privacy?lang=en` 화면에서 "[공개 전 채움…]" 강조 표시가 하나도 안 남았는지 확인**한 뒤 `python3 -I scripts/build_privacy_content.py`로 `content/privacy_*.json`을 다시 만들고, 위쪽 "공개 전 채움" 안내 문장(`privacy.draft`·`pp.draft`)을 뺀다(D-122)
- [ ] 이메일 신청 문구 최종 확인: 모달 "보기"(`consent.*`)와 처리방침의 수집 동의문이 같은 문구인지, 영어 동의문(`tk.consent.*`)이 영어 처리방침과 맞는지
- [ ] 알림 메일 발송 서비스 결정 (Q-2)
- [ ] 면책 문구, 출처·확인일 표시 확인
- [ ] **오픈 전 전체 문구 검토** — `docs/content/copy_ko.md`에서 출처가 "제안"인 문구 전부(승인한 것 포함)를 한꺼번에 다시 읽고, 확정되면 "제안" 표시를 뺀다 (D-115). 영어 화면(`copy_en.json`)도 같이

## 점검 (11단계)
- [ ] Lighthouse 모바일 성능·접근성 90 이상
- [ ] 운영 주소에서 첫 화면 → 테스트 → 결과 → 상세 → 체크리스트 끊김 없음
- [ ] 카톡·인스타 미리보기에서 공유 이미지가 잘리지 않음

## 오픈 후 검토
- [ ] 나라 상세 "한 줄 소개" — MVP에서 제외(D-117). 넣으려면 `countries`에 소개 필드를 정해야 한다
