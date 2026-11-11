# data_review_v1.md: 오픈 전 검증이 필요한 데이터 (2026-11-11)

운영 DB는 **읽기만** 해서 만든 목록이다(쓰기·삭제 없음). 확인이 끝난 항목은 이 파일에서 지우거나 `[x]`로 바꾸고, DB·시드·`launch_checklist.md`를 같이 고친다. 숫자는 2026-11-11 21시(KST) 기준.

## 1. 비행 정보 ⚠ 16곳 (`flight_needs_check = true`)

기준: 인천 출발, 대표 도시. 직항이면 직항 시간, 없으면 경유 포함 최소 시간(대략). 확인 출처는 **인천국제공항 운항 스케줄(airport.kr 항공편 정보)** 과 **항공사 노선 안내(대한항공·아시아나·해당국 항공사)**, 경유 시간은 항공권 검색 결과(최소 총 소요)로 본다. 확인하면 시드 `supabase/seed/seed_flight_v1.sql`·`docs/content/flight_v1.md`를 같이 고치고 `flight_needs_check`를 false로.

| 나라 | 기준 도시 | 지금 값 | 메모(화면에 보임) | 지금 출처 | 확인할 것 |
|---|---|---|---|---|---|
| 안도라 (AD) | 바르셀로나 | 직항 없음 · 17시간 | 공항이 없어요. 바르셀로나까지 비행기 후 버스로 약 3시간 | 없음 | 공항 없음. 바르셀로나 직항 여부·시간, 버스 이동 시간 |
| 아르헨티나 (AR) | 부에노스아이레스 | 직항 없음 · 28시간 | 미국·중동·유럽에서 갈아타요 | 없음 | 직항 없음이 맞는지, 최소 경유 시간 |
| 벨기에 (BE) | 브뤼셀 | 직항 없음 · 16시간 | 파리·프랑크푸르트 등에서 갈아타요 | 없음 | 직항 없음이 맞는지(브뤼셀 노선 재개 여부), 최소 경유 시간 |
| 브라질 (BR) | 상파울루 | 직항 없음 · 25시간 | 미국·중동·유럽에서 갈아타요 | 없음 | 직항 없음이 맞는지, 최소 경유 시간 |
| 칠레 (CL) | 산티아고 | 직항 없음 · 27시간 | 미국 등에서 갈아타요 | 없음 | 직항 없음이 맞는지, 최소 경유 시간 |
| 덴마크 (DK) | 코펜하겐 | 직항 있음 · 13시간 | SAS 직항 | kmoney101 (유럽 직항 정리 2025) | SAS 인천 직항 운항 중인지·시간 |
| 핀란드 (FI) | 헬싱키 | 직항 있음 · 13시간 | - | kmoney101 (유럽 직항 정리 2025) | 핀에어 인천 직항 운항 중인지·시간 |
| 헝가리 (HU) | 부다페스트 | 직항 있음 · 12시간 | - | kmoney101 (유럽 직항 정리 2025) | 부다페스트 직항(계절 운항 여부)·시간 |
| 아일랜드 (IE) | 더블린 | 직항 없음 · 16시간 | 런던·파리 등에서 갈아타요 | 없음 | 직항 없음이 맞는지, 최소 경유 시간 |
| 이스라엘 (IL) | 텔아비브 | 직항 없음 · 15시간 | 엘알 직항이 2027년 3월 시작 예정이에요 | 헤럴드K | 직항 없음이 맞는지, 엘알 2027년 3월 직항 시작 확인 |
| 룩셈부르크 (LU) | 룩셈부르크 | 직항 없음 · 16시간 30분 | 프랑크푸르트·파리 등에서 갈아타요 | 없음 | 직항 없음이 맞는지, 최소 경유 시간 |
| 라트비아 (LV) | 리가 | 직항 없음 · 15시간 | 헬싱키·바르샤바 등에서 갈아타요 | 없음 | 직항 없음이 맞는지, 최소 경유 시간 |
| 네덜란드 (NL) | 암스테르담 | 직항 있음 · 14시간 | - | 없음 | KLM·대한항공 직항 운항·시간(출처가 아직 없음) |
| 폴란드 (PL) | 바르샤바 | 직항 있음 · 12시간 | LOT 폴란드항공 직항 | kmoney101 (유럽 직항 정리 2025) | LOT 직항 운항 중인지·시간 |
| 포르투갈 (PT) | 리스본 | 직항 없음 · 17시간 | 계절 직항(전세기)이 열릴 때도 있어요 | 카드고릴라 | 직항 없음이 맞는지(계절 전세기), 최소 경유 시간 |
| 스웨덴 (SE) | 스톡홀름 | 직항 없음 · 15시간 | 헬싱키·코펜하겐 등에서 갈아타요 | 없음 | 직항 없음이 맞는지, 최소 경유 시간 |

- 출처가 "없음"인 나라가 대부분이다. 확인하면서 출처 주소를 `sources`에 넣고 `flight_source_id`를 채운다.

## 2. 필수 앱 링크 56개 ("⚠ 직접 확인 필요" 표시)

한 번씩 요청해서(`curl`, 정직한 클라이언트 이름, 요청 사이 간격 두기, 봇 차단 우회는 하지 않음) 확인했다. 결과: **정상(200, 같은 사이트) 11개 · 자동 확인 불가 45개**.

**200이 아닌 것의 대부분은 `403`(봇 차단)이라서 "죽은 링크"인지 알 수 없다.** 응답을 받은 것 중 다른 사이트로 이동(도메인이 바뀜)한 것은 없었다(같은 주소 끝에 `/`만 붙는 경우만). 봇 차단된 주소는 이동 여부도 확인하지 못했다. **브라우저로 직접 열어서 확인해야 하는 목록:**

| 나라 | 앱 | 주소 | 응답 | 메모 |
|---|---|---|---|---|
| 호주 (AU) | SEEK | https://www.seek.com.au | 403 | 봇 차단 |
| 호주 (AU) | Gumtree | https://www.gumtree.com.au | 403 | 봇 차단 |
| 호주 (AU) | Flatmates | https://flatmates.com.au | 429 | 요청 제한(잠시 뒤 다시) |
| 뉴질랜드 (NZ) | SEEK NZ | https://www.seek.co.nz | 403 | 봇 차단 |
| 뉴질랜드 (NZ) | Backpacker Board | https://www.backpackerboard.co.nz | 403 | 봇 차단 |
| 일본 (JP) | Mobile Suica | https://www.jreast.co.jp/mobilesuica/ | 403 | 봇 차단 |
| 일본 (JP) | タウンワーク | https://townwork.net | 503 | 서버 오류 응답(점검·봇 차단 가능) |
| 캐나다 (CA) | Indeed Canada | https://ca.indeed.com | 403 | 봇 차단 |
| 영국 (GB) | Indeed UK | https://uk.indeed.com | 403 | 봇 차단 |
| 아일랜드 (IE) | TFI Live | https://www.transportforireland.ie | 403 | 봇 차단 |
| 아일랜드 (IE) | Leap Top-Up | https://about.leapcard.ie | 403 | 봇 차단 |
| 아일랜드 (IE) | Indeed Ireland | https://ie.indeed.com | 403 | 봇 차단 |
| 아일랜드 (IE) | Revolut | https://www.revolut.com | 403 | 봇 차단 |
| 독일 (DE) | ImmoScout24 | https://www.immobilienscout24.de | 401 | 인증 요구(봇 차단 가능) |
| 독일 (DE) | Indeed Deutschland | https://de.indeed.com | 403 | 봇 차단 |
| 프랑스 (FR) | SNCF Connect | https://www.sncf-connect.com | 403 | 봇 차단 |
| 프랑스 (FR) | Bonjour RATP | https://www.ratp.fr | 403 | 봇 차단 |
| 프랑스 (FR) | Leboncoin | https://www.leboncoin.fr | 403 | 봇 차단 |
| 프랑스 (FR) | Indeed France | https://fr.indeed.com | 403 | 봇 차단 |
| 프랑스 (FR) | Doctolib | https://www.doctolib.fr | 403 | 봇 차단 |
| 프랑스 (FR) | ameli | https://www.ameli.fr | 403 | 봇 차단 |
| 이탈리아 (IT) | Idealista Italia | https://www.idealista.it | 403 | 봇 차단 |
| 이탈리아 (IT) | Indeed Italia | https://it.indeed.com | 403 | 봇 차단 |
| 스페인 (ES) | Idealista | https://www.idealista.com | 403 | 봇 차단 |
| 스페인 (ES) | InfoJobs | https://www.infojobs.net | 405 | HEAD/GET 거부(봇 차단 가능) |
| 포르투갈 (PT) | Idealista Portugal | https://www.idealista.pt | 403 | 봇 차단 |
| 포르투갈 (PT) | OLX Portugal | https://www.olx.pt | 403 | 봇 차단 |
| 네덜란드 (NL) | Indeed Nederland | https://nl.indeed.com | 403 | 봇 차단 |
| 벨기에 (BE) | SNCB | https://www.belgiantrain.be | 403 | 봇 차단 |
| 벨기에 (BE) | Indeed Belgique | https://be.indeed.com | 403 | 봇 차단 |
| 덴마크 (DK) | BoligPortal | https://www.boligportal.dk | 403 | 봇 차단 |
| 체코 (CZ) | Jobs.cz | https://www.jobs.cz | 403 | 봇 차단 |
| 헝가리 (HU) | BKK Futár | https://bkk.hu | 403 | 봇 차단 |
| 헝가리 (HU) | ingatlan.com | https://ingatlan.com | 403 | 봇 차단 |
| 헝가리 (HU) | Profession.hu | https://www.profession.hu | 000 | 연결 실패(20초 안에 응답 없음, 두 번 시도) → **죽었거나 주소가 바뀌었을 가능성이 가장 큼** |
| 폴란드 (PL) | OLX Polska | https://www.olx.pl | 403 | 봇 차단 |
| 폴란드 (PL) | Pracuj.pl | https://www.pracuj.pl | 403 | 봇 차단 |
| 라트비아 (LV) | Mobilly | https://www.mobilly.lv | 403 | 봇 차단 |
| 대만 (TW) | 104人力銀行 | https://www.104.com.tw | 403 | 봇 차단 |
| 홍콩 (HK) | Jobsdb Hong Kong | https://hk.jobsdb.com | 403 | 봇 차단 |
| 이스라엘 (IL) | Yad2 | https://www.yad2.co.il | 403 | 봇 차단 |
| 이스라엘 (IL) | Home Front Command | https://www.oref.org.il | 403 | 봇 차단 |
| 브라질 (BR) | 99 | https://99app.com | 429 | 요청 제한(잠시 뒤 다시) |
| 브라질 (BR) | Catho | https://www.catho.com.br | 403 | 봇 차단 |
| 핀란드 (FI) | HSL | https://www.hsl.fi | 403 | 봇 차단 |

정상으로 확인된 11개(참고): Kijiji(캐나다), Daft.ie(아일랜드), Net-Empregos(포르투갈), MB WAY(포르투갈), PKP Intercity(폴란드), Otodom(폴란드), Mercado Pago(아르헨티나), Mercado Libre(아르헨티나), Portal Inmobiliario(칠레), Mercado Libre Chile(칠레), Mercado Livre(브라질).

죽은 링크를 찾으면 주소를 고치거나 `url`을 비운다(시드 `seed_country_apps_v1.sql`·`docs/content/country_apps_v1.md`와 DB를 같이).

## 3. 잔고 증명 금액이 비어 있는 나라

`program_facts`에 `proof_amount`(숫자)가 없고 메모(`proof_note`)만 있거나 아무것도 없는 나라. 이 나라들은 "필요한 돈"에서 잔고 증명이 빠진 값이 되어 점수에서 돈 조건이 **확인 중**으로 빠진다(CLAUDE.md 6장). 숫자를 찾으면 `proof_amount`(+통화)를 넣는다.

| 나라 | 지금 있는 메모 | 우선순위(Q-6) | 확인할 출처 |
|---|---|---|---|
| 아일랜드 (IE) | 금액 명시 없음 | 1순위 | 아일랜드 이민청(ISD) 워킹홀리데이 안내, 주한 아일랜드 대사관 |
| 스페인 (ES) | 금액 명시 없음 (소득·잔고·3개월 거래내역) | 1순위 | 주한 스페인 대사관 비자 안내(기준 금액이 있는지) |
| 포르투갈 (PT) | 금액 명시 없음 | 1순위 | 주한 포르투갈 대사관·AIMA 비자 안내 |
| 폴란드 (PL) | 월 PLN 701 + 귀국 항공권 PLN 2,500 | 2순위 | 주한 폴란드 대사관 워킹홀리데이 안내(메모를 총액으로 환산할지 결정 필요) |
| 오스트리아 (AT) | 금액 명시 없음 (자금 출처 증명) | 2순위 | 주한 오스트리아 대사관 워킹홀리데이 안내 |
| 이스라엘 (IL) | 금액 명시 없음 | 2순위 | 주한 이스라엘 대사관·이스라엘 인구이민청 안내 |
| 핀란드 (FI) | (값 없음, 협정 미발효라 계산에서 빠짐) | 해당 없음 | 발효되면 주한 핀란드 대사관 안내 |

- 네덜란드(NL)는 `proof_amount = 0`(필요 없음으로 확인됨, 왕복 항공권 또는 그 금액)이라 비어 있는 것이 아니다.

## 4. 환율 (`exchange_rates`)

19개 통화 모두 **`source = 'assumed'`(가정값), 기준일 2026-11-09**. 화면에는 "환율 2026년 11월 9일 기준. 원화 금액은 대략이에요."로 보인다. 오픈 전에 실제 값으로 바꾸고(Q-3) 기준일·출처를 갱신한다. 특히 **ARS 1.0원, CLP 1.5원**은 자리 채우기 값처럼 보여서 먼저 확인한다.

| 통화 | 1단위 = 원 | 기준일 | 출처 |
|---|---|---|---|
| ARS | 1 | 2026-11-09 | assumed |
| AUD | 900 | 2026-11-09 | assumed |
| BRL | 260 | 2026-11-09 | assumed |
| CAD | 1000 | 2026-11-09 | assumed |
| CLP | 1.5 | 2026-11-09 | assumed |
| CZK | 60 | 2026-11-09 | assumed |
| DKK | 200 | 2026-11-09 | assumed |
| EUR | 1500 | 2026-11-09 | assumed |
| GBP | 1850 | 2026-11-09 | assumed |
| HKD | 180 | 2026-11-09 | assumed |
| HUF | 3.9 | 2026-11-09 | assumed |
| ILS | 380 | 2026-11-09 | assumed |
| JPY | 9.3 | 2026-11-09 | assumed |
| KRW | 1 | 2026-11-09 | assumed |
| NZD | 820 | 2026-11-09 | assumed |
| PLN | 350 | 2026-11-09 | assumed |
| SEK | 135 | 2026-11-09 | assumed |
| TWD | 43 | 2026-11-09 | assumed |
| USD | 1400 | 2026-11-09 | assumed |

## 5. 운영 DB의 테스트 데이터 (지울 대상, 개수만 — 지우지 않음)

| 표 | 지금 행 수 | `test_data.md`에 기록된 id | 기록에 없는 행 |
|---|---|---|---|
| `quiz_results` | 12 | 9 | **3** (2026-11-11 18:59, 19:53, 19:55 KST에 생성: `5af305ba…`, `4e3d3420…`, `4cea69df…`) |
| `launch_subscribers` | 3 | 2 (id 7·9) | **1** (id 10, 19:03 KST, 테스트 이메일 패턴(`woholog-test+…@example.com`)이 **아님** → 실제 신청자일 수 있어 함부로 지우면 안 됨) |
| `user_reports` | 1 | 1 (id 3) | 0 |
| `feature_votes` | 1 | 1 (id 1) | 0 |

- 기록에 없는 `quiz_results` 3건은 누가 만든 테스트인지 확인한 뒤 `test_data.md`에 적어야 삭제 목록에 들어간다(내가 한 자동 확인은 모두 가짜 응답으로 해서 만들지 않았다).
- `launch_subscribers` id 10은 이메일을 이 문서에 쓰지 않았다. 본인이 넣은 테스트면 `test_data.md`에 적고, 아니면 실제 신청자이므로 오픈 전 삭제 목록에서 빼고 보관한다.
