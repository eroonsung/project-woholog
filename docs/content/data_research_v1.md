# data_research_v1.md: 오픈 전 데이터 조사 결과 (2026-11-11)

`data_review_v1.md`의 1~4번 항목을 조사한 결과다. **결정이 필요한 곳은 "결정"으로 표시**했다. Yvonne가 결정을 확인한 뒤 Claude Code가 시드·마이그레이션·문서에 반영한다. 운영 DB 적용은 허락을 받고 한다.

## 1. 잔고 증명 6개국

| 나라 | 조사 결과 | 넣을 값(제안) | 비자 비용 | 출처 | 남는 점 |
|---|---|---|---|---|---|
| 아일랜드 (IE) | 잔고 1,500유로 이상(또는 그에 상당하는 원화). 영문 잔고증명서, 신청일 기준 1개월 안 발급. 왕복 항공권 예약 사본(심사 중 구매 금지) | `proof_amount = 1500`, `EUR` | 84,000원(우편환만) | [WHIC 아일랜드](https://whic.mofa.go.kr/whic/nation/info.jsp?boardNo=100014) | 페이지가 2024 모집 기준. 2027 모집 공고 나오면 재확인(`needs_check` 유지) |
| 스페인 (ES) | **공식 최소 금액 없음.** "체류 기간 생계 유지에 충분한 자금". 본인 계좌 잔고가 **400만 원 미만**이면 재정보증서(공증·아포스티유) 필요 | **결정 A**: `proof_amount = 4000000`, `KRW`, 메모 "공식 최소액은 없지만 400만 원 아래면 재정보증서가 필요해요" | 무료 | [WHIC 스페인](https://whic.mofa.go.kr/whic/nation/info.jsp?boardNo=10951), [대사관 재정보증서 매뉴얼(2024-04-05)](https://www.exteriores.gob.es/Embajadas/seul/ko/ServiciosConsulares/Documents/%ec%9b%8c%ed%82%b9%ed%99%80%eb%a6%ac%eb%8d%b0%ec%9d%b4%20%ec%9e%ac%ec%a0%95%eb%b3%b4%ec%a6%9d%ec%84%9c%20%ea%b4%80%eb%a0%a8%20%eb%a7%a4%eb%89%b4%ec%96%bc.pdf) | 대사관 신청 요건 PDF는 주소가 길어 자동으로 못 읽음. 브라우저로 한 번 확인 |
| 포르투갈 (PT) | **공식 금액 없음.** 포르투갈 당국이 워홀 금액을 정하지 않음(초기 체류비 충분히). 3개월 최저임금(2026년 월 920유로 × 3 = 2,760유로)을 권하는 곳은 제3자 사이트뿐 | **결정 B**: `proof_amount` 비워 둠 + 메모 "공식 금액이 없어요. 첫 몇 달 생활비를 넉넉히 준비하세요" (추천). 지어낸 값을 넣지 않음(CLAUDE.md 규칙 11) | 약 90유로(제3자 사이트 기준, 확인 필요) | [pvtistes.net 포르투갈(2026-05)](https://pvtistes.net/en/whv/portugal/) — 비공식 | 주한 포르투갈 대사관 안내 원문 못 찾음. WHIC에도 포르투갈 페이지가 없음 |
| 폴란드 (PL) | 생활비 **월 최소 701PLN**. 편도 항공권이면 귀국 항공권 비용 **2,500PLN** 추가. 한국 은행 잔고증명 불인정, 숙소 증명 필요 | **결정 C**: `proof_amount = 8412`, `PLN`(701 × 12개월), 메모 "편도 항공권이면 2,500PLN 더 필요해요" | 113,600원(대사관 현금만) | [WHIC 폴란드](https://whic.mofa.go.kr/whic/nation/info.jsp?boardNo=10952), [주한 폴란드 대사관](https://www.gov.pl/web/hanguk/working-holiday-visa) | WHIC 페이지가 2023년 환율을 써서 오래됨. 701PLN 기준이 바뀌었는지 대사관에 확인 |
| 오스트리아 (AT) | **공식 최소 금액 없음.** 실제로는 만 24세 미만 **월 약 570유로**, 만 24세 이상 **월 약 1,031유로**가 잔고에 있으면 문제없이 발급된다고 안내. 최근 3개월 은행 거래내역(인터넷 출력본 불가). 편도 항공권 가능 | **결정 D**: `proof_amount = 1031 × stay_months`, `EUR`(DB의 체류 개월로 계산), 메모 "공식 최소액은 없고, 만 24세 미만은 월 약 570유로 기준이에요" | 150유로(원화로 납부) | [WHIC 오스트리아](https://whic.mofa.go.kr/whic/nation/info.jsp?boardNo=100016) | 1,031유로는 예전 오스트리아 최저생계 기준과 같은 값. 2026년 기준은 월 1,308.39유로로 올라서([사회부](https://www.sozialministerium.gv.at/Themen/Soziales/Sozialversicherung/Pensionsversicherung/Ausgleichszulage-und-Pensionsbonus.html)) 대사관이 더 높게 볼 수 있음 → `needs_check` 유지 |
| 이스라엘 (IL) | 잔고 **미화 3,000달러 이상**(본인 명의 잔고증명서) + 왕복 항공권 | `proof_amount = 3000`, `USD` | 66,000원(페이지 안에 70,000원도 있어 확인 필요) | [WHIC 이스라엘](https://whic.mofa.go.kr/whic/nation/info.jsp?boardNo=100021) | 비자 비용 두 값 중 어느 쪽인지 대사관 확인 |

핀란드(FI)는 협정 미발효라 그대로 둔다. 네덜란드(NL)는 이미 0(필요 없음)으로 확인돼 있다.

## 2. 비행 정보 ⚠ 16곳

| 나라 | 기준 도시 | 바꿀 값 | 화면 메모 | 근거 | `flight_needs_check` |
|---|---|---|---|---|---|
| 네덜란드 (NL) | 암스테르담 | 직항 있음 · 약 14시간 | 대한항공·KLM 직항 | [directflightsfrom ICN–AMS](https://kr.directflightsfrom.com/icn-ams): 두 항공사 직항, 14시간 15분 | false |
| 헝가리 (HU) | 부다페스트 | 직항 있음 · 약 12시간 → **약 13시간** | 대한항공·아시아나 직항 | [XpatLoop 2026-04](https://xpatloop.com/channels/2026/04/new-direct-budapest-seoul-flights-launched-by-asiana-airlines.html): 아시아나 주 2회 추가로 매일 직항. 시간은 러시아 상공 우회 경로 기준 추정 | true(시간만) |
| 폴란드 (PL) | 바르샤바 | 직항 있음 · 약 12시간 → **약 13시간** | LOT 폴란드항공 직항 | [Trip.com LO096](https://kr.trip.com/flights/status-lo096/): 인천→바르샤바 약 12시간 50분. 노선 운항 중([AeroRoutes 2026년 5월 증편](https://www.aeroroutes.com/eng/251202-lomay26icn)) | false |
| 덴마크 (DK) | 코펜하겐 | 직항 있음 · 약 13시간 → **약 13시간 30분** | SAS 직항(주 3~6회) | [SAS 보도자료 2025-09-12](https://www.sasgroup.net/newsroom/press-releases/2025/sas-marks-first-day-of-direct-route-between-scandinavia-and-seoul/): 2025-09-12 취항, 인천→코펜하겐 약 13시간 20~40분. [AeroRoutes](https://www.aeroroutes.com/eng/251107-sk4q26ea): 2026년 11~12월 주 4~5회 | false |
| 핀란드 (FI) | 헬싱키 | 그대로(직항 있음 · 약 13시간) | 핀에어 직항 | 핀에어 겨울 시간표 공지에 서울 노선 언급이 없어 확인 못 함 | true |
| 포르투갈 (PT) | 리스본 | 직항 없음 · 약 17시간 (그대로) | 메모 변경: "여름에는 대한항공 직항(약 14시간 30분)이 다녀요" | [대한항공 리스본 2026](https://www.koreanair.com/contents/promotion/list/2026/lis2026?pageNum=1): KE921 주 3회(수·금·일), 6~8월 할인 대상 | false |
| 이스라엘 (IL) | 텔아비브 | 직항 없음 · 약 15시간 (그대로) | 메모 변경: "엘알 직항이 2027년 3월부터 주 3회 예정이에요" | [헤럴드K 2026-02-13](https://www.heraldk.com/article/2026021318494820839): 판매 5월, 운항 2027년 3월, 주 3회. 대한항공 텔아비브 노선은 운항 중단 | false (2027-03 재확인 메모) |
| 안도라 (AD) | 바르셀로나 | 직항 없음 · 약 17시간 (그대로) | 그대로 | 공항 없음. 인천–바르셀로나 직항(약 14시간) + 버스 약 3시간 | false |
| 아일랜드 (IE) | 더블린 | 그대로(직항 없음 · 약 16시간) | 그대로 | 인천–더블린 직항 노선 없음 | false |
| 벨기에 (BE) | 브뤼셀 | 그대로(직항 없음 · 약 16시간) | 그대로 | 인천–브뤼셀 직항 노선 없음 | false |
| 룩셈부르크 (LU) | 룩셈부르크 | 그대로(직항 없음 · 약 16시간 30분) | 그대로 | 직항 노선 없음 | false |
| 스웨덴 (SE) | 스톡홀름 | 그대로(직항 없음 · 약 15시간) | 메모 변경: "코펜하겐·헬싱키 등에서 갈아타요" | 직항 노선 없음. 코펜하겐 직항이 생겨 갈아타기 쉬움 | false |
| 라트비아 (LV) | 리가 | 그대로(직항 없음 · 약 15시간) | 그대로 | 직항 노선 없음 | false |
| 브라질 (BR) | 상파울루 | 그대로(직항 없음 · 약 25시간) | 그대로 | 한국–남미 직항 노선 없음 | false |
| 칠레 (CL) | 산티아고 | 그대로(직항 없음 · 약 27시간) | 그대로 | 직항 노선 없음 | false |
| 아르헨티나 (AR) | 부에노스아이레스 | 그대로(직항 없음 · 약 28시간) | 그대로 | 직항 노선 없음 | false |

- "직항 없음"은 인천 출발 정기 노선이 없다는 뜻으로 확인했다. 경유 최소 시간은 경로마다 달라서 **대략값**이고, 화면에 "약"을 붙이는 지금 방식으로 충분하다.
- 출처 주소는 `sources`에 넣고 `flight_source_id`를 채운다.

## 3. 환율 18개 통화

기준: [x-rates.com](https://www.x-rates.com/table/?from=KRW&amount=1), **2026-11-11 14:00 UTC**. USD는 다른 두 곳([poundsterlinglive](https://poundsterlinglive.com/data/currencies/usd-pairs/USDKRW-exchange-rate) 1,336.56원, themoneyconverter 약 1,336원)과 맞음.

| 통화 | 지금(가정값) | 새 값(1단위 = 원) | 차이 |
|---|---|---|---|
| ARS | 1 | 0.8621 | -14% |
| AUD | 900 | 915.66 | +2% |
| BRL | 260 | 240.25 | -8% |
| CAD | 1000 | 938.09 | -6% |
| CLP | 1.5 | 1.358 | -9% |
| CZK | 60 | 60.82 | +1% |
| DKK | 200 | 198.44 | -1% |
| EUR | 1500 | 1483.48 | -1% |
| GBP | 1850 | 1774.64 | -4% |
| HKD | 180 | 170.25 | -5% |
| HUF | 3.9 | 4.063 | +4% |
| ILS | 380 | 420.84 | +11% |
| JPY | 9.3 | 8.372 | -10% |
| NZD | 820 | 744.71 | -9% |
| PLN | 350 | 336.52 | -4% |
| SEK | 135 | 134.14 | -1% |
| TWD | 43 | 40.63 | -6% |
| USD | 1400 | 1335.78 | -5% |

- ARS 1.0원·CLP 1.5원은 자리 채우기 값이 아니라 실제와 비슷한 값이었다.
- `source`는 `x-rates.com`, 기준일 `2026-11-11`. 화면 문구의 날짜도 바뀐다.
- 오픈 직전(12월 말)에 한 번 더 갱신한다. 엔진 결과(% 순위)가 바뀔 수 있으니 반영 후 회귀 테스트를 돌린다.

## 4. 필수 앱 링크 45개

실제 브라우저(워홀로그 운영 페이지 안)에서 45개 주소에 요청을 보냈다.

- **32개: 응답 받음.** 서버가 살아 있다. curl의 403은 봇 차단이었다.
- **12개: 브라우저 보안 정책으로 응답 내용을 못 봄**(SEEK 호주·뉴질랜드, Revolut, RATP, ameli, Indeed Italia, Idealista Portugal, SNCB, BKK, Pracuj.pl, Jobsdb HK, HSL). 모두 각 나라의 대표 서비스라 죽은 링크일 가능성은 낮다.
- **1개: Profession.hu는 브라우저에서도 15초 안에 응답 없음.** 다만 2026년 헝가리 기사에서 계속 언급되고 사이트 글도 검색되어 운영 중이다. 해외 접속을 막거나 느린 것으로 보인다.

**제안: 링크는 지금 그대로 둔다.** 12개 + Profession.hu만 Yvonne가 휴대폰으로 한 번씩 열어 본다. 안 열리는 것만 `url`을 비운다.