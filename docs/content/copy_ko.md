# 워홀로그 화면 문구 v1 (2026-11-10)

개발할 때 이 파일을 `content/copy_ko.json`으로 옮기고, 화면에서는 키로만 불러온다. 문구를 바꿀 때는 이 파일과 JSON을 같이 고친다.

## 문구 규칙
- **해요체.** 짧게, 한 문장에 한 가지만.
- **숫자는 계산 결과를 그대로 넣는다.** 문구 안에 숫자를 직접 쓰지 않는다. `{need}` 같은 자리표시자를 쓴다.
- **✗라도 비난하지 않는다.** "안 돼요"보다 "어려워요"를 쓰고, 가능하면 해결책을 한 줄 붙인다.
- **돈은 만 원 단위로 반올림**해서 "약 320만 원"처럼 쓴다. 외화는 "1,226엔", "18.15 캐나다달러"처럼 쓴다. 기호($, €)는 혼동되니 쓰지 않는다.
- 나라 이름은 DB의 `name_ko`를 쓴다. 조사 처리(은/는, 이/가)는 `josa()` 함수로 한다.

자리표시자: `{country}` 나라 이름, `{pct}` 적합도, `{ok}` ✓ 개수, `{total}` 조건 개수, `{budget}` 준비한 돈(만 원), `{need}` 필요한 돈(만 원), `{gap}` 부족한 돈(만 원), `{language}` 현지어, `{job}` 대표 일자리, `{months}` 개월 수, `{plan}` 사용자 계획 개월, `{date}` 날짜, `{top}` 1위 나라, `{diff}` 차이(%p)

---

## 1. 첫 화면
| 키 | 문구 |
|---|---|
| landing.badge | 2분 · 질문 12개 |
| landing.title | 마음에 둔 워홀 나라, 나한테 맞을까? |
| landing.sub | 돈·언어·일·나이로 29개 나라의 적합도를 %로 알려줘요. 이유까지요. |
| landing.cta | 내 나라 확인하기 |
| landing.noLogin | 로그인 없이 바로 시작해요 |
| landing.feature1 | 29개 나라 공식 정보 |
| landing.feature2 | 출처와 확인일 표시 |
| landing.feature3 | 마음에 둔 나라 vs 1위 비교 |

## 2. 질문
| 키 | 제목 | 도움말 |
|---|---|---|
| q1 | 마음에 둔 나라가 있어요? | 최대 3개까지 골라요. 없으면 건너뛰어도 돼요. |
| q2 | 만 나이가 몇 살이에요? | 신청하는 날 기준 만 나이예요. 나라마다 지원 가능한 나이가 달라요. |
| q3 | 누구랑 떠나요? | 함께 가면 둘 다 갈 수 있는 나라로 계산해요. |
| q3.companionAge | 같이 가는 사람의 만 나이 | |
| q3.companionVisited | 같이 가는 사람이 워홀로 다녀온 나라 | |
| q4 | 워홀로 다녀온 나라가 있어요? | 대부분 나라는 한 번만 갈 수 있어요. 캐나다·일본은 두 번까지. |
| q5 | 언제 떠나고 싶어요? | 지금은 접수 일정 안내에만 써요. |
| q6 | 출발 전에 준비할 수 있는 돈은요? | 항공권, 비자 비용, 처음 한두 달 생활비를 모두 합친 금액이에요. |
| q7 | 영어로 어디까지 할 수 있어요? | 시험 점수 말고, 실제로 할 수 있는 일로 골라요. |
| q8 | 영어 말고 알바 면접을 볼 수 있는 언어가 있어요? | 남은 나라에서 쓰는 언어만 보여 줘요. |
| q9 | 현지에서 어떤 일을 하고 싶어요? | 여러 개 골라도 돼요. |
| q10 | 현지에서 생활비를 벌어야 해요? | |
| q11 | 어학원은 얼마나 다닐 생각이에요? | |
| q12 | 가장 중요한 걸 골라요 | 최대 3개, 순서는 상관없어요. |
| q12.heartLabel | 마음에 둔 나라가 끌리는 이유 | 점수에는 안 들어가요. |
| q12.full | 3개를 다 골랐어요. 바꾸려면 하나를 빼요. | |

보기
- q3: 혼자 (나에게 맞는 나라만 계산해요) / 친구·연인과 함께 (둘 다 갈 수 있는 나라로 계산해요)
- q5: 3개월 안에 / 6개월 안에 / 1년 안에 / 아직 몰라요
- q6: 슬라이더 100만~2,000만+ (50만 단위), 안내 "나라마다 비자에 필요한 잔고 증명 금액이 달라요. 결과에서 나라별로 알려 줄게요."
- q7: 거의 못 해요 (인사, 숫자 정도) / 주문·길 묻기 정도 (카페에서 주문하고 길을 물어볼 수 있어요) / 알바 면접을 볼 수 있어요 (자기소개하고 간단한 질문에 답할 수 있어요) / 회의·이메일로 일할 수 있어요 (업무 대화와 이메일을 영어로 해요)
- q9: 카페·식당 / 판매·마트 / 호텔·관광 / 농장·공장 / 사무직 / 돌봄 / 아직 몰라요
- q10: 꼭 벌어야 해요 (생활비 대부분) / 일부만 벌면 돼요 (용돈 정도) / 안 벌어도 돼요 (모아 둔 돈으로 지내요)
- q11: 안 다닐래요 / 3개월쯤 / 6개월쯤 / 6개월 넘게
- q12: 돈 모으기 / 일자리 구하기 쉬운 곳 / 영어 실력 / 커리어 / 2년 이상 머물기 / 유럽 여행 / 생활비 적게 / 확실하게 뽑히기 / 한국인 적은 곳 / 한국인 많은 곳 / 한국과 가까운 곳 / (마음 이유) 문화가 좋아서 · 그 나라 언어를 배우고 싶어서 · 아는 사람이 있어서 / 잘 모르겠어요
- 공통 버튼: 다음 / 이전 / 처음부터 / 건너뛰기 / 없어요 / 결과 보기

## 3. 나이 초과·계산 중
| 키 | 문구 |
|---|---|
| stop.title | 워홀은 만 35세까지만 갈 수 있어요 |
| stop.body | 아쉽지만 모든 협정국의 나이 제한이 만 35세 이하예요. 대신 어학연수·해외취업 정보가 열리면 알려 드릴게요. |
| stop.cta | 오픈 알림 받기 |
| stop.retry | 나이 다시 입력하기 |
| loading.title | 29개 나라와 비교하는 중이에요 |
| loading.steps | 나이 조건 확인 중… / 필요한 돈 계산 중… / 일 규칙 확인 중… |

## 4. 결과 머리말
| 키 | 언제 | 문구 |
|---|---|---|
| result.score | 항상 | 조건 {total}개 중 {ok}개 ✓ |
| result.heart.top | 마음에 둔 나라가 1위 | {country}, 잘 맞아요. 마음 가는 대로 가도 좋아요. |
| result.heart.close | 1위와 10%p 미만 차이 | {country}도 충분히 잘 맞아요. 1위 {top}와 {diff}%p 차이예요. |
| result.heart.far | 1위와 10%p 이상 차이 | {country}에 가려면 이것부터 해결해요. |
| result.heart.blocked | 나이·다녀온 나라 때문에 불가 | {country}는 지금 조건으로는 갈 수 없어요. ({reason}) |
| result.heartReason | 마음 이유를 골랐을 때 | 마음 이유: {reasons} |
| result.noHeart.title | 마음에 둔 나라가 없을 때 | 나에게 가장 잘 맞는 나라 |
| result.top3 | | 나에게 더 잘 맞는 나라 TOP 3 |
| result.blocked | | 지금은 갈 수 없는 나라 {n}곳 |
| result.blocked.age | | 나이 조건(만 {age}세까지) |
| result.blocked.visited | | 이미 다녀온 나라(한 번만 가능) |
| result.blocked.companion | | 같이 가는 사람의 나이 조건 |
| result.allLow | 1위도 60% 미만 | 지금 조건으로는 딱 맞는 나라가 없어요. 아래처럼 바꾸면 달라져요. |
| result.whatIf.title | | 이렇게 바꾸면 |
| result.whatIf.row | | {change}면 → {country} {from}% → {to}% |

이렇게 바꾸면 `{change}` 예시: 일본어로 알바 면접을 볼 수 있게 되면 / 영어로 알바 면접을 볼 수 있게 되면 / {gap}만 원을 더 모으면 / 생활비를 일부만 벌어도 되면

## 5. 조건별 이유 문장 (✓ / △ / ✗)
엔진이 돌려준 `item`과 `mark`, 그리고 `reasonCode`로 고른다. 한 칸에 문장 1개만.

**돈**
- ✓ 준비한 {budget}만 원이면 필요한 돈 약 {need}만 원을 넘어요.
- △ 필요한 돈 약 {need}만 원보다 {gap}만 원 부족해요. 출발 전까지 조금만 더 모으면 돼요.
- ✗ 필요한 돈 약 {need}만 원보다 {gap}만 원 부족해요.
- 상세(펼침): 잔고 증명 {proof} + 비자 비용 {fee} + 항공권 약 {flight}

**언어**
- ✓ (영어권) 영어로 알바 면접을 볼 수 있으면 충분해요.
- ✓ (현지어) {language}로 면접을 볼 수 있어 유리해요.
- △ (영어권, 영어 약함) 영어가 약해도 갈 수 있지만, 처음엔 고를 수 있는 일이 적어요.
- △ (비영어권, 영어 업무 가능) 영어로 일할 곳도 있지만 {language}를 쓰는 일자리가 훨씬 많아요.
- △ (홍콩) 홍콩은 영어로 일할 곳이 일부만 있어요.
- ✗ {language}를 못 하면 일자리 구하기가 어려워요.
- ✗ (현지어 필수 안내가 있음) 인포센터가 {language}가 필요하다고 안내해요.

**일**
- ✓ {job}처럼 하고 싶은 일을 찾을 수 있어요.
- △ (정규직 불가 + 사무직 희망) 정규직으로 일할 수 없어 사무직은 구하기 어려워요.
- △ (한 고용주 기간 제한) 한 고용주와 {months}개월까지만 일할 수 있어요.
- △ (구직 어려움 안내) {job_hard_note}
- △ (언어 △) 언어 때문에 고를 수 있는 일이 줄어요.
- △ (언어 ✗ + 한국인 많음) 한인 업소에서 일을 구할 수는 있지만 선택지가 좁아요.
- ✗ 지금 언어로는 일하며 지내기 어려워요.
- 일 ✗ + 꼭 벌어야 함 (점수 최대 59%): 뱃지 "일하며 지내기 어려움", 설명 "생활비를 벌어야 한다면 이 나라는 점수를 59%까지만 줘요."

**어학원**
- ✓ 어학원을 {months}개월까지 다닐 수 있어요.
- ✓ (99) 기간 제한 없이 다닐 수 있어요.
- ✗ 어학원은 {months}개월까지만 다닐 수 있어요. 계획({plan}개월)보다 짧아요.
- ✗ (0) 워홀 비자로는 어학원을 다닐 수 없어요.

**중요한 것 (12번 칩)**
| 칩 | ✓ | △ | ✗ |
|---|---|---|---|
| 돈 모으기 | 최저 시급이 높고 일하는 데 제한이 적어요. | 시급이 중간이거나 일하는 데 제한이 있어요. | 시급이 낮아 돈을 모으기 어려워요. |
| 일자리 구하기 쉬운 곳 | 언어·근무 제한·경쟁 모두 걸림돌이 없어요. | 걸림돌이 하나 있어요: {obstacle} | 걸림돌이 여러 개예요: {obstacles} |
| 영어 실력 | 영어를 쓰는 나라예요. | 영어를 일부 쓰는 곳이에요. | 영어를 쓰지 않는 나라예요. |
| 커리어 | 언어가 되고 정규직 제한이 없어 경력을 쌓기 좋아요. | 정규직으로는 일할 수 없어요. | 언어가 안 되면 경력을 쌓기 어려워요. |
| 2년 이상 머물기 | 최대 {long}개월까지 머물 수 있어요. | 조건을 채우면 조금 더 머물 수 있어요. | 1년만 머물 수 있어요. |
| (호주, 농장 안 고름) | | 2년을 머물려면 지정 지역 농장 등에서 88일 일해야 해요. | |
| 유럽 여행 | 유럽 안에 있어 주변 나라 여행이 쉬워요. | | 유럽 밖에 있어요. |
| 생활비 적게 | 물가가 한국보다 낮아요. | 물가가 한국과 비슷해요. | 물가가 한국보다 높아요. |
| 확실하게 뽑히기 | 인원 제한이 없어요. | 선착순이라 접수 날 빨리 신청해야 해요. | 추첨이라 운이 필요해요. |
| 한국인 적은 곳 | 한국인이 적어요. | 한국인이 적당히 있어요. | 한국인이 많아요. |
| 한국인 많은 곳 | 한국인이 많아 도움받기 쉬워요. | 한국인이 적당히 있어요. | 한국인이 적어요. |
| 한국과 가까운 곳 | 한국과 가까워요. | | 비행기로 오래 가야 해요. |

`{obstacle}` 표현: 현지어가 필요해요 / 정규직이 안 돼요 / 한 고용주와 일할 수 있는 기간이 짧아요 / 구직 경쟁이 치열해요

## 6. 확인 중·출처·뱃지
| 키 | 문구 |
|---|---|
| status.checking | 확인 중 |
| status.checking.tip | 공식 자료에서 이 규칙을 아직 확인하지 못했어요. 점수에는 넣지 않았어요. |
| status.stale | 확인 필요 |
| status.stale.tip | 마지막 확인이 {days}일 전이에요. 신청 전 꼭 다시 확인해요. |
| badge.lottery | 추첨 |
| badge.safety | 안전 주의 |
| badge.safety.tip | 외교부 여행경보가 있어요. 출발 전 해외안전여행 사이트에서 최신 단계를 확인해요. |
| badge.twice | 두 번까지 |
| source.line | 정보 확인일: {date} · 출처: {publisher} |
| source.more | 출처 모두 보기 |
| source.report | 정보가 틀렸나요? 제보하기 |
| fx.line | 환율 {date} 기준. 원화 금액은 대략이에요. |

## 7. 현실 미리보기·비교
| 키 | 문구 |
|---|---|
| preview.title | 현실 미리보기 |
| preview.money | 필요한 돈 약 {need}만 원 |
| preview.job | 대표 일자리 {job} / 시급 약 {wage} |
| preview.rent | 월세 {rent} |
| preview.next | 다음 접수 {window} |
| preview.next.unknown | 다음 접수 일정은 아직 안 나왔어요 |
| preview.next.anytime | 연중 언제든 신청할 수 있어요 |
| compare.cta | 1위 나라와 나란히 비교 |
| compare.title | 나란히 비교 |
| compare.add | + 나라 추가 |
| compare.rows | 적합도 / 돈 / 언어 / 일 / 어학원 / 체류 기간 / 선발 방식 / 최저 시급 / 월세 / 한국인 수 / 다음 접수 |
| compare.summary | {a}는 {strengthA}에서 앞서고, {b}는 {strengthB}에서 앞서요. |

## 8. 공유
| 키 | 문구 |
|---|---|
| share.cta | 결과 링크 공유하기 |
| share.copied | 링크를 복사했어요 |
| share.ogTitle | 나는 {country} {pct}%! 내 워홀 나라 적합도 |
| share.ogDesc | 질문 12개로 29개 나라 적합도를 확인해 보세요. |
| share.old | 이 결과는 {date} 정보로 계산했어요. 지금 정보로 다시 계산해 볼까요? |

## 9. Coming soon·이메일 신청
| 키 | 문구 |
|---|---|
| soon.badge | Coming soon |
| soon.title | 커뮤니티가 곧 열려요 |
| soon.body | 워홀 준비하는 사람들끼리 묻고 답하는 공간을 만들고 있어요. 열리면 메일로 한 번 알려 드릴게요. |
| soon.email | 이메일 |
| soon.consent | [필수] 오픈 알림을 위한 개인정보 수집·이용에 동의해요 |
| soon.consent.detail | 수집 항목: 이메일 / 목적: 커뮤니티 오픈 알림 1회 발송 / 보관: 알림 발송 후 30일 이내 파기 / 동의하지 않아도 서비스 이용에는 제한이 없어요. 만 14세 미만은 신청할 수 없어요. |
| soon.submit | 알림 받기 |
| soon.done.title | 신청 완료! |
| soon.done.body | 커뮤니티가 열리면 입력한 메일로 알려 드릴게요. 그 전에는 메일을 보내지 않아요. |
| soon.err.format | 이메일 형식을 확인해 주세요. |
| soon.err.dup | 이미 신청한 이메일이에요. 열리면 알려 드릴게요. |
| soon.err.consent | 동의해야 알림을 보낼 수 있어요. |
| soon.err.server | 잠시 문제가 생겼어요. 조금 뒤에 다시 시도해 주세요. |

## 10. 면책·푸터·오류
| 키 | 문구 |
|---|---|
| disclaimer.short | 참고용 정보예요. 최종 확인은 각 나라 대사관에서 해주세요. |
| disclaimer.result | 참고용이에요. 비자 조건은 예고 없이 바뀔 수 있으니 신청 전 대사관과 워킹홀리데이 인포센터에서 꼭 확인해요. 이 결과는 비자 승인을 보장하지 않아요. |
| disclaimer.money | 필요한 돈은 잔고 증명 + 비자 비용 + 항공권 추정치예요. 실제 생활비는 도시와 생활 방식에 따라 크게 달라요. |
| footer.privacy | 개인정보 처리방침 |
| footer.report | 정보 제보하기 |
| footer.copyright | © 2026 워홀로그 |
| error.404 | 페이지를 찾을 수 없어요. |
| error.result404 | 결과를 찾을 수 없어요. 링크를 다시 확인하거나 테스트를 새로 해 보세요. |
| error.generic | 잠시 문제가 생겼어요. 새로고침해 주세요. |
| report.title | 정보 제보하기 |
| report.body | 틀린 정보나 바뀐 규칙을 알려 주세요. 확인 후 고칠게요. |
| report.done | 제보 고마워요! 확인해서 반영할게요. |

## 11. 메뉴·푸터
| 키 | 문구 |
|---|---|
| nav.test | 나라 추천 |
| nav.countries | 29개국 비교 |
| nav.checklist | 체크리스트 |
| nav.community | 커뮤니티 |
| nav.soon | Soon |
| nav.login | 로그인 |
| nav.signup | 시작하기 |
| nav.from | From Korea |
| nav.to | To Korea |
| nav.mobile.test.sub | 질문 12개로 적합도 확인 |
| nav.mobile.countries.sub | 조건을 한눈에 |
| nav.mobile.checklist.sub | 출국일까지 할 일 |
| soon.community.title | 커뮤니티가 곧 열려요 |
| soon.login.title | 로그인은 커뮤니티와 함께 열려요 |
| soon.login.body | 지금은 로그인 없이 모든 기능을 쓸 수 있어요. 열리면 메일로 한 번 알려 드릴게요. |

## 12. 29개국 비교표
| 키 | 문구 |
|---|---|
| countries.title | 29개국 한눈에 비교 |
| countries.sub | 정보 확인일 {date} · 출처 워킹홀리데이 인포센터 외 |
| countries.filter.region | 지역 |
| countries.filter.english | 영어권만 |
| countries.filter.age | 내 나이 {age}세 |
| countries.sort | 정렬 |
| countries.sort.need | 필요한 돈 적은 순 |
| countries.sort.age | 나이 제한 넉넉한 순 |
| countries.sort.name | 이름 순 |
| countries.cols | 나라 / 나이 / 체류 / 선발 / 인원 / 필요한 돈 / 최저 시급 / 어학원 / 일 제한 |
| countries.selected | {n}개 선택됨 · 나란히 비교 |
| countries.compare | 비교하기 |
| countries.viewTable | 표로 보기 |
| countries.viewCards | 카드로 보기 |
| countries.empty | 조건에 맞는 나라가 없어요. 필터를 줄여 보세요. |
| countries.soon | 곧 열려요 (협정 발효 전) |

## 13. 나라 상세
| 키 | 문구 |
|---|---|
| detail.title | {country} 워킹홀리데이 |
| detail.fit.title | 내 적합도 확인하기 |
| detail.fit.body | 질문 12개로 {country}가 나에게 맞는지 알려줘요 |
| detail.fit.cta | {country} 적합도 확인 |
| detail.toc | 한눈에 / 필요한 돈 / 일·어학 / 신청 방법 / 생활 정보 / 출처 |
| detail.money.proof | 잔고 증명 |
| detail.money.fee | 비자 비용 |
| detail.money.flight | 항공권(추정) |
| detail.work.study | 어학원 최대 {months}개월 |
| detail.work.study.none | 어학원 기간 제한 없음 |
| detail.work.prohibited | 금지 업종: {text} |
| detail.work.employer | 한 고용주와 최대 {months}개월 |
| detail.work.noFulltime | 정규직·상근으로는 일할 수 없어요 |
| detail.stay | {months}개월 체류 |
| detail.stay.twice | 두 번까지 참가 가능 |
| detail.window.next | 다음 접수 {window} |
| detail.addCompare | 비교에 담기 |
| detail.checklist | 체크리스트 만들기 |
| detail.safety.banner | 외교부 여행경보가 있어요: {text}. 출발 전 해외안전여행 사이트에서 최신 단계를 확인하세요. |

## 14. 체크리스트
| 키 | 문구 |
|---|---|
| checklist.setup.title | 출국일까지 할 일, 순서대로 알려 줄게요 |
| checklist.setup.sub | 로그인 없이 이 브라우저에 저장돼요. |
| checklist.setup.country | 어느 나라로 가요? |
| checklist.setup.date | 출국 예정일 |
| checklist.setup.unknown | 아직 몰라요 |
| checklist.setup.tip | 출국일을 넣으면 'D-90 비자 신청'처럼 날짜별로 정리돼요. |
| checklist.setup.cta | 체크리스트 만들기 |
| checklist.summary | {country} · 출국 D-{days} |
| checklist.summary.noDate | {country} · 출국일 미정 |
| checklist.progress | {total}개 중 {done}개 완료 |
| checklist.changeDate | 출국일 바꾸기 |
| checklist.changeCountry | 나라 바꾸기 |
| checklist.phase | 결정 / 신청 / 출국 준비 / 출국 / 도착 후 |
| checklist.late | 늦었어요 |
| checklist.tag.doc | 서류 |
| checklist.tag.valid | 발급 후 {days}일 유효 |
| checklist.tag.translate | 번역 필요 |
| checklist.tag.apostille | 아포스티유 필요 |
| checklist.phaseDone | {phase} 단계 완료! |
| checklist.allDone | 출국 준비 끝! 좋은 여행 되세요. |
| checklist.link | 다른 기기에서 열기 (링크 복사) |
| checklist.link.done | 링크를 복사했어요. 다른 기기에서 열면 체크 상태가 그대로 보여요. |
| checklist.storageNote | 체크 상태는 이 브라우저에만 저장돼요. 브라우저 데이터를 지우면 사라져요. |
| checklist.storageOff | 이 브라우저에서는 저장이 꺼져 있어요. 체크는 이 화면을 닫으면 사라져요. |
| result.startChecklist | 이 나라로 준비 시작 |
| result.detailLink | {country} 상세 정보 보기 → |

## 15. To Korea 대기자 (English)
| key | text |
|---|---|
| tk.badge | Working Holiday in Korea |
| tk.title | Coming to Korea on a working holiday? |
| tk.sub | We're building a step-by-step guide for your first 30 days: visa, alien registration, phone, bank and jobs. |
| tk.sticker | Coming 2027 |
| tk.card1 | H-1 visa in plain English |
| tk.card2 | First 30 days checklist |
| tk.card3 | Find jobs and housing |
| tk.email | Email |
| tk.consent | I agree to woholog collecting my email to send one launch notice. See privacy policy. |
| tk.cta | Join the waitlist |
| tk.note | One email when we launch. No spam. |
| tk.done | You're on the list! |
| tk.err.format | Please check your email address. |
| tk.err.dup | You're already on the list. |

## 16. 단계 메뉴
| 키 | 문구 |
|---|---|
| nav.stage.choose | 나라 고르기 |
| nav.stage.prepare | 준비하기 |
| nav.stage.local | 현지 생활 |
| nav.stage.return | 귀국 |
| nav.guides | 가이드 |
| nav.apps | 나라별 필수 앱 |
| nav.apps.sub | 가서 깔 앱 |
| nav.soonAll | 곧 나올 기능 {n}개 모두 보기 → |
| footer.soon | 곧 나올 기능 |

## 17. 준비 중 기능
| 키 | 문구 |
|---|---|
| soon.hub.badge | 로드맵 |
| soon.hub.title | 워홀 전 과정을 함께할 기능을 만들고 있어요 |
| soon.hub.sub | 원하는 기능에 '원해요'를 눌러 주세요. 많이 받은 기능부터 만들어요. |
| soon.hub.sticker | {n}개 준비 중 |
| soon.tab.all | 전체 |
| soon.status | 준비 중 · {when} 목표 |
| soon.target | {when} 목표 |
| soon.want | 원해요 |
| soon.wantCount | {n}명이 기다려요 |
| soon.wanted | 원해요를 눌렀어요. 고마워요! |
| soon.can | 이런 걸 할 수 있어요 |
| soon.now | 지금 쓸 수 있는 것 |
| soon.notify.title | 이 기능이 열리면 알려 드릴까요? |
| soon.hub.notify.title | 열리면 알려 드릴까요? |
| soon.preview | 미리보기 |
| soon.others | 다른 준비 중 기능 |
| soon.note | 일정은 목표예요. 상황에 따라 바뀔 수 있어요. |

기능별 이름·설명·예정·대신 쓸 것은 `content/features_ko.json` (기준: `docs/product/scope_ia.md` 3번 표).

## 18. 가이드
| 키 | 문구 |
|---|---|
| guides.title | 가이드 |
| guides.sub | 워홀 준비에 꼭 필요한 정보를 정리해요. |
| guides.filter | 전체 / 나라 고르기 / 신청 / 출국 준비 / 현지 생활 |
| guides.meta | 확인일 {date} · {min}분 |
| guides.empty.title | 첫 글을 준비하고 있어요 |
| guides.empty.planned | 곧 올라올 글 |
| guides.notify | 새 글이 올라오면 알림 |
| guides.planned | 35세에도 갈 수 있는 워홀 나라 / 캐나다 IEC 2027 준비법 / 일본 워홀 분기 접수 완벽 정리 / 워홀 첫 달 필요한 돈 계산법 |

## 19. 필수 앱·추천 준비물
| 키 | 문구 |
|---|---|
| apps.title | {country} 가면 깔아야 할 앱 |
| apps.cats | 교통 / 일자리 / 집 / 은행·송금 / 중고거래 / 정부·세금 / 메신저 |
| apps.empty | 이 나라 앱 목록을 정리하고 있어요 |
| partners.title | 추천 준비물 |
| partners.badge | 광고 |
| partners.cats | eSIM / 여행자 보험 / 해외 송금 / 항공권 |
| partners.empty | 추천 상품을 고르는 중이에요 |
| partners.disclosure | 이 링크로 구매하면 워홀로그가 수수료를 받을 수 있어요. 가격은 같아요. |

## 20. 공유 이미지
| 키 | 문구 |
|---|---|
| shareImg.sticker | 내 워홀 나라 |
| shareImg.headline | 나는 {country}랑 {pct}% 맞아! |
| shareImg.cta | woholog.com에서 나도 해 보기 |
| share.sheet.copy | 링크 복사 |
| share.sheet.image | 이미지로 저장 (인스타 스토리) |
| share.sheet.kakao | 카카오톡 |
