# 워홀로그 화면 문구 v1 (2026-11-10)

개발할 때 이 파일을 `content/copy_ko.json`으로 옮기고, 화면에서는 키로만 불러온다. 문구를 바꿀 때는 이 파일과 JSON을 같이 고친다.

## 문구 규칙
- **해요체.** 짧게, 한 문장에 한 가지만.
- **숫자는 계산 결과를 그대로 넣는다.** 문구 안에 숫자를 직접 쓰지 않는다. `{need}` 같은 자리표시자를 쓴다.
- **✗라도 비난하지 않는다.** "안 돼요"보다 "어려워요"를 쓰고, 가능하면 해결책을 한 줄 붙인다.
- **돈은 만 원 단위로 반올림**해서 "약 320만 원"처럼 쓴다. 외화는 "1,226엔", "18.15 캐나다달러"처럼 쓴다. 기호($, €)는 혼동되니 쓰지 않는다.
- 나라 이름은 DB의 `name_ko`를 쓴다. 조사 처리(은/는, 이/가)는 `josa()` 함수로 한다.

자리표시자: `{country}` 나라 이름, `{pct}` 적합도, `{ok}` ✓ 개수, `{total}` 조건 개수, `{budget}` 준비한 돈(만 원), `{need}` 필요한 돈(만 원), `{gap}` 부족한 돈(만 원), `{language}` 현지어, `{job}` 대표 일자리, `{months}` 개월 수, `{plan}` 사용자 계획 개월, `{date}` 날짜, `{top}` 1위 나라, `{diff}` 차이(%p), `{maxAge}` 지원 가능한 최대 만 나이(DB `programs.age_max` 최댓값, active만)

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
| landing.example | 예시 |
| landing.browse.title | 나라 둘러보기 |

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
- q6: 슬라이더 100만~2,000만 원 이상 (50만 단위, 기본 500만), 안내 "나라마다 비자에 필요한 잔고 증명 금액이 달라요. 결과에서 나라별로 알려 줄게요."
- q7: 거의 못 해요 (인사, 숫자 정도) / 주문·길 묻기 정도 (카페에서 주문하고 길을 물어볼 수 있어요) / 알바 면접을 볼 수 있어요 (자기소개하고 간단한 질문에 답할 수 있어요) / 회의·이메일로 일할 수 있어요 (업무 대화와 이메일을 영어로 해요)
- q9: 카페·식당 / 판매·마트 / 호텔·관광 / 농장·공장 / 사무직 / 돌봄 / 아직 몰라요
- q10: 꼭 벌어야 해요 (생활비 대부분) / 일부만 벌면 돼요 (용돈 정도) / 안 벌어도 돼요 (모아 둔 돈으로 지내요)
- q11: 안 다닐래요 / 3개월쯤 / 6개월쯤 / 6개월 넘게
- q12: 돈 모으기 / 일자리 구하기 쉬운 곳 / 영어 실력 / 커리어 / 2년 이상 머물기 / 유럽 여행 / 생활비 적게 / 확실하게 뽑히기 / 한국인 적은 곳 / 한국인 많은 곳 / 한국과 가까운 곳 / 현지 언어 배우기(제안, D-111) / (마음 이유) 문화가 좋아서 · 아는 사람이 있어서 / 잘 모르겠어요
- 공통 버튼: 다음 / 이전 / 처음부터 / 건너뛰기 / 없어요 / 결과 보기

## 3. 나이 초과·계산 중
| 키 | 문구 |
|---|---|
| stop.title | 워홀은 만 {maxAge}세까지만 갈 수 있어요 |
| stop.body | 아쉽지만 모든 협정국의 나이 제한이 만 {maxAge}세 이하예요. 대신 어학연수·해외취업 정보가 열리면 알려 드릴게요. |
| stop.cta | 오픈 알림 받기 |
| stop.retry | 나이 다시 입력하기 |
| loading.title | 29개 나라와 비교하는 중이에요 |
| loading.steps | 나이 조건 확인 중… / 필요한 돈 계산 중… / 일 규칙 확인 중… |

## 4. 결과 머리말
| 키 | 언제 | 문구 |
|---|---|---|
| result.score | 항상 | 조건 {total}개 중 {ok}개 ✓ |
| result.heart.top | 마음에 둔 나라가 1위 | {country}, 잘 맞아요. 마음 가는 대로 가도 좋아요. |
| result.heart.close | 1위와 10%p 미만 차이 | {country}도 충분히 잘 맞아요. 1위 {top:와/과} {diff}%p 차이예요. |
| result.heart.far | 1위와 10%p 이상 차이 | {country}에 가려면 이것부터 해결해요. |
| result.heart.blocked | 나이·다녀온 나라 때문에 불가 | {country:은/는} 지금 조건으로는 갈 수 없어요. ({reason}) |
| result.heartReason | 마음 이유를 골랐을 때 | 마음 이유: {reasons} |
| result.noHeart.title | 마음에 둔 나라가 없을 때 | 나에게 가장 잘 맞는 나라 |
| result.top3 | | 나에게 더 잘 맞는 나라 TOP 3 |
| result.blocked | | 지금은 갈 수 없는 나라 {n}곳 |
| result.blocked.age | | 나이 조건(만 {age}세까지) |
| result.blocked.visited | | 이미 다녀온 나라(한 번만 가능) |
| result.blocked.companion | | 같이 가는 사람의 나이 조건 |
| result.allLow | 1위도 60% 미만 | 지금 조건으로는 딱 맞는 나라가 없어요. 아래처럼 바꾸면 달라져요. |
| result.whatIf.title | | 이렇게 바꾸면 |
| result.whatIf.row | | {change} → {country} {from}% → {to}% |

이렇게 바꾸면 `{change}`(문장 끝이 이미 "면"이라 `result.whatIf.row`에서 "면"을 또 붙이지 않는다) 예시: 일본어로 알바 면접을 볼 수 있게 되면 / 영어로 알바 면접을 볼 수 있게 되면 / {gap}만 원을 더 모으면 / 생활비를 일부만 벌어도 되면

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
| 현지 언어 배우기(제안, D-111) | {country}에서는 일하면서 현지 언어를 매일 써요. | 영어와 현지 언어를 함께 써요. 지역에 따라 현지 언어를 배울 기회가 있어요. | 영어권이라 다른 언어를 배울 기회는 적어요. |
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

6단계 추가 문구 (출처: 제안 = 원본에 없어 임시로 쓴 문장, 승인 필요)
| 키 | 문구 | 출처 |
|---|---|---|
| compare.sub | 고른 나라의 핵심 조건을 한눈에 비교해요. | 제안(6단계) |
| compare.back.result | 결과로 돌아가기 | 제안(6단계) |
| compare.back.countries | 29개국 비교표로 | 제안(6단계) |
| compare.corner | 비교 항목 | 제안(6단계) |
| compare.best | 적합도 최고 | 제안(6단계) |
| compare.fit | 적합도 {pct}% | 제안(6단계) |
| compare.fit.none | 이 결과에 없는 나라예요 | 제안(6단계) |
| compare.fit.title | 내 답으로 본 조건 | 제안(6단계) |
| compare.facts.title | 나라 정보 | 제안(6단계) |
| compare.remove | {country} 빼기 | 제안(6단계) |
| compare.add.limit | (최대 3개) | 제안(6단계) |
| compare.add.max | 3개까지 비교할 수 있어요 | 제안(6단계) |
| compare.add.search | 나라 이름 검색 | 제안(6단계) |
| compare.add.empty | 찾는 나라가 없어요 | 제안(6단계) |
| compare.pick.title | 비교할 나라를 2개 이상 골라 주세요 | 제안(6단계) |
| compare.row.age | 나이 | 제안(6단계) |
| compare.row.stay | 기간·횟수 | 제안(6단계) |
| compare.row.selection | 선발 방식 | 제안(6단계) |
| compare.row.money | 필요한 돈 | 제안(6단계) |
| compare.row.wage | 최저 시급 | 제안(6단계) |
| compare.row.rent | 월세 | 제안(6단계) |
| compare.row.work | 일 제한 | 제안(6단계) |
| compare.row.study | 어학원 | 제안(6단계) |
| compare.row.next | 다음 접수 | 제안(6단계) |
| compare.row.korean | 한국인 | 제안(6단계) |
| compare.row.distance | 거리 | 제안(6단계) |
| compare.row.source | 출처 확인일 | 제안(6단계) |
| compare.age | 만 {min}~{max}세 | 제안(6단계) |
| compare.stay.long | 연장하면 최대 {long}개월 | 제안(6단계) |
| compare.sel.unlimited | 인원 제한 없음 | 제안(6단계) |
| compare.sel.first_come | 선착순 | 제안(6단계) |
| compare.sel.lottery | 추첨 | 제안(6단계) |
| compare.sel.quota | 연 {n}명 | 제안(6단계) |
| compare.wage.krw | 약 {krw}원 | 제안(6단계) |
| compare.wage.derived | 월급을 월 근무 시간으로 나눈 값이에요 | 제안(6단계) |
| compare.work.total | 총 {months}개월까지 일할 수 있어요 | 제안(6단계) |
| compare.work.none | 알려진 제한이 없어요 | 제안(6단계) |
| compare.study | 최대 {months}개월 | 제안(6단계) |
| compare.korean.high | 많아요 | 제안(6단계) |
| compare.korean.mid | 보통이에요 | 제안(6단계) |
| compare.korean.low | 적어요 | 제안(6단계) |
| compare.korean.n | 약 {n}명 | 제안(6단계) |
| compare.toggle.add | 비교에 담기 | SPEC 6장 |
| compare.toggle.remove | 비교에서 빼기 | SPEC 6장 |
| compare.full | 3개까지 담을 수 있어요 | SPEC 6장 |
| compare.bar | 비교하기 ({n}) | 제안(6단계) |
| compare.bar.hint | 담은 나라를 나란히 볼 수 있어요 | 제안(6단계) |

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
| detail.fit.body | 질문 12개로 {country:이/가} 나에게 맞는지 알려줘요 |
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

7단계 추가 문구 (출처: 제안 = 원본에 없어 임시로 쓴 문장, 승인 필요)
| 키 | 문구 | 출처 |
|---|---|---|
| countries.count | 총 {total}개국 중 {n}개국 | 제안(7단계) |
| countries.sort.selection | 선발 방식순 | 제안(7단계) |
| countries.filter.all | 전체 | 제안(7단계) |
| countries.filter.ageApply | 적용 | 제안(7단계) |
| countries.filter.ageLabel | 내 나이 | 제안(7단계) |
| countries.sort.money | 필요한 돈 적은 순 | 제안(7단계, 정렬 id = money) |
| countries.region.asia | 아시아 | 제안(7단계) |
| countries.region.oceania | 오세아니아 | 제안(7단계) |
| countries.region.europe | 유럽 | 제안(7단계) |
| countries.region.america | 아메리카 | 제안(7단계) |
| countries.region.middle_east | 중동 | 제안(7단계) |
| countries.reset | 필터 초기화 | 제안(7단계) |
| countries.col.country | 나라 | 제안(7단계) |
| countries.col.age | 나이 | 제안(7단계) |
| countries.col.stay | 체류 | 제안(7단계) |
| countries.col.selection | 선발 | 제안(7단계) |
| countries.col.money | 필요한 돈 | 제안(7단계) |
| countries.col.wage | 최저 시급 | 제안(7단계) |
| countries.col.study | 어학원 | 제안(7단계) |
| countries.col.work | 일 제한 | 제안(7단계) |
| detail.safety.bannerNoNote | 외교부 여행경보가 있어요. 출발 전 해외안전여행 사이트에서 최신 단계를 확인하세요. | 제안(7단계) |
| detail.comingSoon | 협정이 아직 발효되지 않았어요. 발효되면 값을 채울게요. | 제안(7단계) |
| detail.money.none | 없어요 | 제안(7단계) |
| detail.money.health | 보건부담금 | 제안(7단계) |
| detail.work.study.unknown | 어학원 기간은 확인 중이에요 | 제안(7단계) |
| detail.work.job | 대표 일자리: {job} | 제안(7단계) |
| detail.work.note | 참고: {text} | 제안(7단계) |
| detail.apply.apply_method | 신청 방법 | 제안(7단계) |
| detail.apply.extension | 체류 연장 | 제안(7단계) |
| detail.apply.insurance_required | 보험 | 제안(7단계) |
| detail.apply.medical_check | 건강검진 | 제안(7단계) |
| detail.apply.proof_note | 잔고 증명 | 제안(7단계) |
| detail.apply.special_note | 참고 | 제안(7단계) |
| detail.life.price | 물가 | 제안(7단계) |
| detail.life.price.n | 물가 지수 {n} (한국 = 100) | 제안(7단계) |
| detail.toc.title | 목차 | 제안(7단계) |
| detail.toc.summary | 한눈에 | 제안(7단계) |
| detail.toc.money | 필요한 돈 | 제안(7단계) |
| detail.toc.work | 일·어학 | 제안(7단계) |
| detail.toc.apply | 신청 방법 | 제안(7단계) |
| detail.toc.life | 생활 정보 | 제안(7단계) |
| detail.toc.apps | 필수 앱 | 제안(7단계) |
| detail.toc.partners | 추천 준비물 | 제안(7단계) |
| detail.toc.sources | 출처 | 제안(7단계) |
| detail.section.summary | 한눈에 보기 | 제안(7단계) |
| detail.section.money | 필요한 돈 | 제안(7단계) |
| detail.section.work | 일·어학 규정 | 제안(7단계) |
| detail.section.apply | 신청 방법 | 제안(7단계) |
| detail.section.life | 생활 정보 | 제안(7단계) |
| detail.section.sources | 출처 | 제안(7단계) |
| detail.back | 29개국 비교 | 제안(7단계) |
| detail.verified | 정보 확인일 {date} | 제안(7단계) |
| detail.sources.date | 확인일: {date} | 제안(7단계) |
| apps.cat.transport | 교통 | 제안(7단계) |
| apps.cat.bank | 은행·송금 | 제안(7단계) |
| apps.cat.telecom | 통신 | 제안(7단계) |
| apps.cat.job | 일자리 | 제안(7단계) |
| apps.cat.housing | 집 | 제안(7단계) |
| apps.cat.map | 지도 | 제안(7단계) |
| apps.cat.life | 생활 | 제안(7단계) |
| apps.cat.safety | 안전 | 제안(7단계) |

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
| partners.cat.esim | eSIM |
| partners.cat.insurance | 여행자 보험 |
| partners.cat.remittance | 해외 송금 |
| partners.cat.flight | 항공권 |
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

## 21. 질문 화면 (2단계에서 추가)

출처: 원본 = 이 문서 위쪽 보기 목록·SPEC 인용, Figma = 와이어프레임 글자(승인 필요), 제안 = 원본에 없어 임시로 쓴 문장(승인 필요)

| 키 | 문구 | 출처 |
|---|---|---|
| btn.next | 다음 | 원본 |
| btn.prev | 이전 | 원본 |
| btn.restart | 처음부터 | 원본 |
| btn.none | 없어요 | 원본 |
| btn.seeResult | 결과 보기 | 원본 |
| quiz.progress | Q{n} of {total} | SPEC 3.1 |
| quiz.restart.confirm | 지금까지 고른 답이 지워져요 | SPEC 3.1 |
| quiz.restart.yes | 처음부터 다시 하기 | 승인 |
| quiz.restart.no | 취소 | 승인 |
| q1.none | 아직 없어요 | SPEC 3.2 |
| quiz.search | 나라 이름 검색 | 승인 |
| quiz.selected | {n}개 선택됨 | 승인 |
| quiz.selectedMax | (최대 {max}개) | 승인 |
| quiz.selectedMulti | (여러 개 가능) | 승인 |
| quiz.clear | 전체 해제 | 승인 |
| quiz.maxCountries | {max}개까지 고를 수 있어요 | SPEC 3.2 |
| quiz.noResult | 검색 결과가 없어요 | 제안 |
| region.north_america | 북미 | 승인 |
| region.asia | 아시아 | 승인 |
| region.oceania | 오세아니아 | 승인 |
| region.europe | 유럽 | 승인 |
| q2.unit | 세 | 승인 |
| q2.dec | 나이 줄이기 | 승인 |
| q2.inc | 나이 늘리기 | 승인 |
| q2.tooYoung | 워킹홀리데이는 만 {minAge}세부터 갈 수 있어요. 만 나이를 다시 확인해 주세요. | 답변(D-084) |
| q3.opt.solo | 혼자 | 원본 |
| q3.opt.solo.sub | 나에게 맞는 나라만 계산해요 | 원본 |
| q3.opt.together | 친구·연인과 함께 | 원본 |
| q3.opt.together.sub | 둘 다 갈 수 있는 나라로 계산해요 | 원본 |
| q5.opt.m3 | 3개월 안에 | 원본 |
| q5.opt.m6 | 6개월 안에 | 원본 |
| q5.opt.y1 | 1년 안에 | 원본 |
| q5.opt.unknown | 아직 몰라요 | 원본 |
| q6.value | {budget}만 원 | 원본 |
| q6.valueMax | {budget}만 원 이상 | SPEC 3.2 |
| q6.hint | 나라마다 비자에 필요한 잔고 증명 금액이 달라요. 결과에서 나라별로 알려 줄게요. | 원본 |
| q6.slider | 준비한 돈 | 승인 |
| q7.opt.0 | 거의 못 해요 | 원본 |
| q7.opt.0.sub | 인사, 숫자 정도 | 원본 |
| q7.opt.1 | 주문·길 묻기 정도 | 원본 |
| q7.opt.1.sub | 카페에서 주문하고 길을 물어볼 수 있어요 | 원본 |
| q7.opt.2 | 알바 면접을 볼 수 있어요 | 원본 |
| q7.opt.2.sub | 자기소개하고 간단한 질문에 답할 수 있어요 | 원본 |
| q7.opt.3 | 회의·이메일로 일할 수 있어요 | 원본 |
| q7.opt.3.sub | 업무 대화와 이메일을 영어로 해요 | 원본 |
| q9.opt.cafe | 카페·식당 | 원본 |
| q9.opt.retail | 판매·마트 | 원본 |
| q9.opt.hotel | 호텔·관광 | 원본 |
| q9.opt.farm | 농장·공장 | 원본 |
| q9.opt.office | 사무직 | 원본 |
| q9.opt.care | 돌봄 | 원본 |
| q9.opt.unknown | 아직 몰라요 | 원본 |
| q10.opt.must | 꼭 벌어야 해요 | 원본 |
| q10.opt.must.sub | 생활비 대부분 | 원본 |
| q10.opt.partly | 일부만 벌면 돼요 | 원본 |
| q10.opt.partly.sub | 용돈 정도 | 원본 |
| q10.opt.none | 안 벌어도 돼요 | 원본 |
| q10.opt.none.sub | 모아 둔 돈으로 지내요 | 원본 |
| q11.opt.none | 안 다닐래요 | 원본 |
| q11.opt.m3 | 3개월쯤 | 원본 |
| q11.opt.m6 | 6개월쯤 | 원본 |
| q11.opt.over6 | 6개월 넘게 | 원본 |
| q12.opt.money | 돈 모으기 | 원본 |
| q12.opt.easy_job | 일자리 구하기 쉬운 곳 | 원본 |
| q12.opt.english | 영어 실력 | 원본 |
| q12.opt.career | 커리어 | 원본 |
| q12.opt.two_years | 2년 이상 머물기 | 원본 |
| q12.opt.europe | 유럽 여행 | 원본 |
| q12.opt.low_cost | 생활비 적게 | 원본 |
| q12.opt.sure_pick | 확실하게 뽑히기 | 원본 |
| q12.opt.few_koreans | 한국인 적은 곳 | 원본 |
| q12.opt.many_koreans | 한국인 많은 곳 | 원본 |
| q12.opt.near_korea | 한국과 가까운 곳 | 원본 |
| q12.opt.local_language | 현지 언어 배우기 | 제안(D-111) |
| q12.opt.unknown | 잘 모르겠어요 | 원본 |
| q12.heart.culture | 문화가 좋아서 | 원본 |
| q12.heart.learn_language | 그 나라 언어를 배우고 싶어서 | 원본(D-111: 선택지에서는 뺐고, 이전에 저장된 결과를 위해 키만 남김) |
| q12.heart.know_someone | 아는 사람이 있어서 | 원본 |
| loading.step1 | 나이 조건 확인 중… | 원본 |
| loading.step2 | 필요한 돈 계산 중… | 원본 |
| loading.step3 | 일 규칙 확인 중… | 원본 |
| quiz.error.retry | 다시 시도 | SPEC 3.3 |
| quiz.error.back | 질문으로 돌아가기 | SPEC 3.3 |
| quiz.stop.compare | 29개국 비교 보기 | SPEC 3.4 |
| region.other | 그 밖의 지역 | 답변(D-084) |
| quiz.available | 지금 갈 수 있는 나라 {n}곳 | 답변(D-084) |
| quiz.tag | Q{n} · {name} | 답변(D-084) |
| q1.tag | 마음에 둔 나라 | 답변(D-084) |
| q2.tag | 나이 | 답변(D-084) |
| q3.tag | 누구랑 | 답변(D-084) |
| q4.tag | 다녀온 나라 | 답변(D-084) |
| q5.tag | 출국 시기 | 답변(D-084) |
| q6.tag | 예산 | 답변(D-084) |
| q7.tag | 영어 | 답변(D-084) |
| q8.tag | 다른 언어 | 답변(D-084) |
| q9.tag | 하고 싶은 일 | 답변(D-084) |
| q10.tag | 생활비 | 답변(D-084) |
| q11.tag | 어학원 | 답변(D-084) |
| q12.tag | 중요한 것 | 답변(D-084) |
| quiz.multi | 여러 개 골라도 돼요 | 답변(D-084) |
| quiz.single | 하나만 골라요 | 답변(D-084) |
| quiz.note | 답변은 이름 없이 결과 계산에만 써요. | 답변(D-084) |
| quiz.error.rateLimited | 잠시 후 다시 시도해 주세요 | SPEC 0.8 |
| result.notFound | 결과가 없거나 1년이 지나 지워졌어요 | SPEC 4.1 |
| result.again | 다시 하기 | SPEC 4.6 |
| age.calc.toggle | 생년월일로 만 나이 자동 계산하기 | Figma |
| age.calc.title | 생년월일 입력 | Figma |
| age.calc.year | 년 | Figma |
| age.calc.month | 월 | Figma |
| age.calc.day | 일 | Figma |
| age.calc.hint | 생년월일을 입력하면 만 나이가 자동으로 반영돼요. | 제안(Figma 변형) |
| age.calc.result | 오늘 기준 만 {age}세예요. 위 나이에 반영했어요. | 제안 |
| age.calc.invalid | 없는 날짜예요. 다시 확인해 주세요. | 제안 |
| age.calc.future | 오늘 이후의 날짜는 입력할 수 없어요. | 제안 |
| age.calc.note | 입력한 생년월일은 저장하지 않아요. | 제안 |
| age.calc.applyDay | 신청하는 날 기준 만 나이라서, 신청일이 오늘과 다르면 나이가 달라질 수 있어요. | 승인(2026-11-11 요청) |
| brand.name | 워홀로그 | 원본(로고) |
| placeholder.title | 준비 중이에요 | 승인(2026-11-11) |
| placeholder.home | 처음으로 | 승인(2026-11-11) |
| a11y.skip | 본문으로 건너뛰기 | 승인(2026-11-11) |
| nav.main | 주 메뉴 | 승인(2026-11-11) |
| nav.open | 메뉴 열기 | 승인(2026-11-11) |
| nav.close | 메뉴 닫기 | 승인(2026-11-11) |
| nav.switch | 서비스 구역 전환 | 승인(2026-11-11) |
| nav.stageOf | {stage} 메뉴 | 승인(2026-11-11) |
| result.chip.heart | 마음에 둔 나라 | Figma |
| result.noHeart.headline | {country:이/가} 가장 잘 맞아요 | Figma(조사 처리) |
| result.otherHearts | 마음에 둔 다른 나라 | SPEC 4.2 |
| result.confirming | 확인 중: 잔고 증명 금액을 확인하고 있어요 | 승인(2026-11-11) |
| result.partialChecking | 일부 조건 확인 중 | 승인(2026-11-11) |
| result.next | 다음으로 잘 맞는 나라 | Figma |
| result.share | 공유 | Figma(자리만, 10단계) |
| result.compare.other | 다른 나라와 나란히 비교 | SPEC 4.5 |
| result.dataChanged | 저장한 뒤에 나라 정보가 바뀌었어요 | SPEC 4.1 |
| result.recalc | 지금 정보로 다시 계산 | SPEC 4.1 |
| result.recalcing | 다시 계산하는 중… | 승인(2026-11-11) |
| result.blocked.inactive | 모집 중단 | SPEC 4.5 |
| result.blocked.companionVisited | 같이 가는 사람이 이미 다녀온 나라(한 번만 가능) | 승인(2026-11-11) |
| badge.soon | 곧 열려요 | SPEC 4.5 |
| badge.hardToLive | 일하며 지내기 어려움 | 원본(5장) |
| badge.hardToLive.tip | 생활비를 벌어야 한다면 이 나라는 점수를 {cap}%까지만 줘요. | 원본(5장) |
| item.money | 돈 | 원본(5장) |
| item.language | 언어 | 원본(5장) |
| item.work | 일 | 원본(5장) |
| item.study | 어학원 | 원본(5장) |
| preview.label.money | 초기 예상 비용 | Figma |
| preview.label.job | 현지 일자리 및 시급 | Figma |
| preview.label.rent | 주거 비용 | Figma |
| preview.label.next | 비자 신청 일정 | Figma |
| money.krw | 약 {man}만 원 | SPEC 0.3 |
| money.foreign | {currency} {amount} ({krw}) | SPEC 0.3 |
| preview.part.proof | 잔고 증명 {value} | 원본(5장 상세) |
| preview.part.fee | 비자 비용 {value} | 원본(5장 상세) |
| preview.part.health | 보건부담금 {value} | 승인(2026-11-11) |
| preview.part.flight | 항공권 약 {value} | 원본(5장 상세) |
| preview.rent.week | 주당 {rent} | 승인(2026-11-11) |
| preview.next.always | 상시 | SPEC 4.4 |
| preview.next.firstCome | 선착순 (연 {n}명) | SPEC 4.4 |
| preview.next.firstComeNoQuota | 선착순 | 승인(2026-11-11) |
| preview.next.lottery | 추첨 (연 {n}명) | 승인(2026-11-11) |
| preview.next.lotteryNoQuota | 추첨 | 승인(2026-11-11) |
| preview.next.late | 원하는 시기보다 접수가 늦어요 | SPEC 4.4 |
| reason.obstacle.localLanguage | 현지어가 필요해요 | 원본(5장) |
| reason.obstacle.noFulltime | 정규직이 안 돼요 | 원본(5장) |
| reason.obstacle.employerLimit | 한 고용주와 일할 수 있는 기간이 짧아요 | 원본(5장) |
| reason.obstacle.hardCompetition | 구직 경쟁이 치열해요 | 원본(5장) |
| reason.money.ok | 준비한 {budget}만 원이면 필요한 돈 약 {need}만 원을 넘어요. | 원본(5장) |
| reason.money.partial | 필요한 돈 약 {need}만 원보다 {gap}만 원 부족해요. 출발 전까지 조금만 더 모으면 돼요. | 원본(5장) |
| reason.money.no | 필요한 돈 약 {need}만 원보다 {gap}만 원 부족해요. | 원본(5장) |
| reason.language.ok.english | 영어로 알바 면접을 볼 수 있으면 충분해요. | 원본(5장) |
| reason.language.ok.local | {language}로 면접을 볼 수 있어 유리해요. | 원본(5장) |
| reason.language.partial.englishWeak | 영어가 약해도 갈 수 있지만, 처음엔 고를 수 있는 일이 적어요. | 원본(5장) |
| reason.language.partial.englishWork | 영어로 일할 곳도 있지만 {language:을/를} 쓰는 일자리가 훨씬 많아요. | 원본(5장) |
| reason.language.partial.mixed | {country:은/는} 영어로 일할 곳이 일부만 있어요. | 원본(5장 "홍콩은…"을 {country}로 바꿈: 영어가 "일부"인 나라 전체에 쓰임, 승인 2026-11-11) |
| reason.language.no.localRequired | 인포센터가 {language:이/가} 필요하다고 안내해요. | 원본(5장) |
| reason.language.no.generic | {language:을/를} 못 하면 일자리 구하기가 어려워요. | 원본(5장) |
| reason.work.ok | {job}처럼 하고 싶은 일을 찾을 수 있어요. | 원본(5장) |
| reason.work.ok.noValue | 하고 싶은 일을 찾을 수 있어요. | 승인(2026-11-11) |
| reason.work.partial.noFulltime | 정규직으로 일할 수 없어 사무직은 구하기 어려워요. | 원본(5장) |
| reason.work.partial.employerLimit | 한 고용주와 {months}개월까지만 일할 수 있어요. | 원본(5장) |
| reason.work.partial.employerLimit.noValue | 한 고용주와 일할 수 있는 기간이 짧아요. | 원본(장애 요소 문구) |
| reason.work.partial.hardNote | {hardNote} | 원본(5장) |
| reason.work.partial.hardNote.noValue | 구직 경쟁이 치열해요. | 원본(장애 요소 문구) |
| reason.work.partial.language | 언어 때문에 고를 수 있는 일이 줄어요. | 원본(5장) |
| reason.work.partial.korean | 한인 업소에서 일을 구할 수는 있지만 선택지가 좁아요. | 원본(5장) |
| reason.work.no | 지금 언어로는 일하며 지내기 어려워요. | 원본(5장) |
| reason.study.ok | 어학원을 {months}개월까지 다닐 수 있어요. | 원본(5장) |
| reason.study.ok.unlimited | 기간 제한 없이 다닐 수 있어요. | 원본(5장) |
| reason.study.no | 어학원은 {months}개월까지만 다닐 수 있어요. 계획({plan}개월)보다 짧아요. | 원본(5장) |
| reason.study.no.none | 워홀 비자로는 어학원을 다닐 수 없어요. | 원본(5장) |
| reason.priority.money.ok | 최저 시급이 높고 일하는 데 제한이 적어요. | 원본(5장) |
| reason.priority.money.partial | 시급이 중간이거나 일하는 데 제한이 있어요. | 원본(5장) |
| reason.priority.money.no | 시급이 낮아 돈을 모으기 어려워요. | 원본(5장) |
| reason.priority.easy_job.ok | 언어·근무 제한·경쟁 모두 걸림돌이 없어요. | 원본(5장) |
| reason.priority.easy_job.partial | 걸림돌이 하나 있어요: {obstacle} | 원본(5장) |
| reason.priority.easy_job.no | 걸림돌이 여러 개예요: {obstacles} | 원본(5장) |
| reason.priority.english.ok | 영어를 쓰는 나라예요. | 원본(5장) |
| reason.priority.english.partial | 영어를 일부 쓰는 곳이에요. | 원본(5장) |
| reason.priority.english.no | 영어를 쓰지 않는 나라예요. | 원본(5장) |
| reason.priority.career.ok | 언어가 되고 정규직 제한이 없어 경력을 쌓기 좋아요. | 원본(5장) |
| reason.priority.career.partial | 정규직으로는 일할 수 없어요. | 원본(5장) |
| reason.priority.career.no | 언어가 안 되면 경력을 쌓기 어려워요. | 원본(5장) |
| reason.priority.two_years.ok | 최대 {long}개월까지 머물 수 있어요. | 원본(5장) |
| reason.priority.two_years.partial | 조건을 채우면 조금 더 머물 수 있어요. | 원본(5장) |
| reason.priority.two_years.no | 1년만 머물 수 있어요. | 원본(5장) |
| reason.priority.europe.ok | 유럽 안에 있어 주변 나라 여행이 쉬워요. | 원본(5장) |
| reason.priority.europe.no | 유럽 밖에 있어요. | 원본(5장) |
| reason.priority.low_cost.ok | 물가가 한국보다 낮아요. | 원본(5장) |
| reason.priority.low_cost.partial | 물가가 한국과 비슷해요. | 원본(5장) |
| reason.priority.low_cost.no | 물가가 한국보다 높아요. | 원본(5장) |
| reason.priority.sure_pick.ok | 인원 제한이 없어요. | 원본(5장) |
| reason.priority.sure_pick.partial | 선착순이라 접수 날 빨리 신청해야 해요. | 원본(5장) |
| reason.priority.sure_pick.no | 추첨이라 운이 필요해요. | 원본(5장) |
| reason.priority.few_koreans.ok | 한국인이 적어요. | 원본(5장) |
| reason.priority.few_koreans.partial | 한국인이 적당히 있어요. | 원본(5장) |
| reason.priority.few_koreans.no | 한국인이 많아요. | 원본(5장) |
| reason.priority.many_koreans.ok | 한국인이 많아 도움받기 쉬워요. | 원본(5장) |
| reason.priority.many_koreans.partial | 한국인이 적당히 있어요. | 원본(5장) |
| reason.priority.many_koreans.no | 한국인이 적어요. | 원본(5장) |
| reason.priority.local_language.ok | {country}에서는 일하면서 현지 언어를 매일 써요. | 제안(D-111) |
| reason.priority.local_language.partial | 영어와 현지 언어를 함께 써요. 지역에 따라 현지 언어를 배울 기회가 있어요. | 제안(D-111) |
| reason.priority.local_language.no | 영어권이라 다른 언어를 배울 기회는 적어요. | 제안(D-111) |
| reason.priority.near_korea.ok | 한국과 가까워요. | 원본(5장) |
| reason.priority.near_korea.no | 비행기로 오래 가야 해요. | 원본(5장) |
| reason.priority.two_years.partial.farm | 2년을 머물려면 지정 지역 농장 등에서 88일 일해야 해요. | 원본(5장) |
| result.whatIf.change.learn_local_language | {language}로 알바 면접을 볼 수 있게 되면 | 원본(4장 예시) |
| result.whatIf.change.english_interview | 영어로 알바 면접을 볼 수 있게 되면 | 원본(4장 예시) |
| result.whatIf.change.save_gap | {gap}만 원을 더 모으면 | 원본(4장 예시) |
| result.whatIf.change.earn_partly | 생활비를 일부만 벌어도 되면 | 원본(4장 예시) |
| mark.ok | 맞아요 | 승인(2026-11-11) |
| mark.partial | 조금 아쉬워요 | 승인(2026-11-11) |
| mark.no | 어려워요 | 승인(2026-11-11) |
| result.rank | {n}위 | Figma |
| money.man | {man}만 원 | SPEC 0.3 |
| result.shareSlot | 공유 기능은 곧 열려요 | 승인(2026-11-11) |
| landing.continue | 이어서 하기 (Q{n}부터) | SPEC 2장 |
| landing.compare | 29개국 비교표 보기 | Figma |
| landing.why.title | 워홀로그가 특별한 이유 | Figma |
| landing.example.note | 실제 계산 결과 예시예요 | 제안 |
