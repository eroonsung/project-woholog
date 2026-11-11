# country_apps_v1.md: 나라별 필수 앱 v1 (2026-11-11)

DB에는 `supabase/seed/seed_country_apps_v1.sql`로 넣는다. 둘을 같이 고친다.

- 협정국 29곳 전체, 나라마다 교통·일자리·집 위주로 2~7개 + 모든 나라에 외교부 **해외안전여행** 앱.
- 일반 공개 정보로 정리한 초안이다. 앱 이름이 바뀌거나 서비스가 끝났을 수 있어서, **적용 전에 모든 링크 응답을 확인**하고 오픈 전에 한 번 더 본다.
- 안도라는 정보가 적어 통신사·메신저만 넣었다. 핀란드는 협정 발효 전이지만 미리 넣었다.
- 전체 171행. **운영 DB 적용됨**(2026-11-11, 171행·29개국).
- **링크 확인(적용 전, curl GET·리다이렉트 따라가기·10초)**: 고유 url 136개 중 80개 정상, 죽은 링크 0개, 56개는 봇 차단·접속 막힘 응답이라 확인 불가. 확인 불가 링크에는 `⚠ 직접 확인 필요`를 붙였다. 오픈 전에 브라우저로 직접 열어 보고, 죽었으면 주소를 고치거나 `url`을 비운다(시드와 DB를 같이).
- 이탈리아 IO는 `io.italia.it`이 `ioapp.it`으로 이동해서 새 주소로 바꿨다. 룩셈부르크 jobs.lu(영어판으로 이동)·덴마크 Rejseplanen(`rejseplan.dk`로 이동)은 정상 이동이라 그대로 뒀다.

## 호주 (AU)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| Opal Travel | 교통 | 시드니 교통카드 잔액·경로 (다른 도시는 도시별 앱) | https://transportnsw.info |
| SEEK | 일자리 | 호주에서 가장 큰 구인 사이트 | https://www.seek.com.au ⚠ 직접 확인 필요 |
| Gumtree | 집 | 셰어하우스·중고·단기 일자리 | https://www.gumtree.com.au ⚠ 직접 확인 필요 |
| Flatmates | 집 | 셰어하우스 방 구하기 | https://flatmates.com.au ⚠ 직접 확인 필요 |
| myGov | 생활 | 세금번호(TFN)·세금 환급·정부 서비스 | https://my.gov.au |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 뉴질랜드 (NZ)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| Trade Me | 집 | 집·중고·구인을 한곳에서 | https://www.trademe.co.nz |
| SEEK NZ | 일자리 | 뉴질랜드 구인 사이트 | https://www.seek.co.nz ⚠ 직접 확인 필요 |
| Backpacker Board | 일자리 | 워홀러용 농장·단기 일자리와 숙소 | https://www.backpackerboard.co.nz ⚠ 직접 확인 필요 |
| AT Mobile | 교통 | 오클랜드 버스·기차 경로와 교통카드 | https://at.govt.nz |
| myIR | 생활 | 세금번호(IRD)·세금 신고 | https://www.ird.govt.nz |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 일본 (JP)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| LINE | 생활 | 현지 연락은 대부분 LINE으로 해요 | https://line.me |
| Yahoo!乗換案内 | 교통 | 전철 환승·시간표 검색 | https://transit.yahoo.co.jp |
| Mobile Suica | 교통 | 휴대폰 교통카드(아이폰은 지갑 앱) | https://www.jreast.co.jp/mobilesuica/ ⚠ 직접 확인 필요 |
| タウンワーク | 일자리 | 아르바이트 구인 | https://townwork.net ⚠ 직접 확인 필요 |
| SUUMO | 집 | 방 구하기 | https://suumo.jp |
| PayPay | 은행·송금 | 가장 널리 쓰이는 간편결제 | https://paypay.ne.jp |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 캐나다 (CA)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| Transit | 교통 | 도시 대중교통 실시간 경로 | https://transitapp.com |
| Indeed Canada | 일자리 | 캐나다 구인 검색 | https://ca.indeed.com ⚠ 직접 확인 필요 |
| Kijiji | 집 | 방·중고·구인 게시판 | https://www.kijiji.ca ⚠ 직접 확인 필요 |
| PRESTO | 교통 | 토론토 지역 교통카드 (밴쿠버는 Compass) | https://www.prestocard.ca |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 영국 (GB)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| Citymapper | 교통 | 런던 등 대도시 대중교통 경로 | https://citymapper.com |
| Trainline | 교통 | 기차표 예매 | https://www.thetrainline.com |
| Indeed UK | 일자리 | 영국 구인 검색 | https://uk.indeed.com ⚠ 직접 확인 필요 |
| SpareRoom | 집 | 셰어 방 구하기 | https://www.spareroom.co.uk |
| Monzo | 은행·송금 | 앱으로 여는 은행 계좌 | https://monzo.com |
| NHS App | 생활 | 동네 병원(GP) 예약·처방 | https://www.nhs.uk/nhs-app/ |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 아일랜드 (IE)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| TFI Live | 교통 | 버스·기차 실시간 경로 | https://www.transportforireland.ie ⚠ 직접 확인 필요 |
| Leap Top-Up | 교통 | 교통카드 충전 | https://about.leapcard.ie ⚠ 직접 확인 필요 |
| Daft.ie | 집 | 방·집 구하기 | https://www.daft.ie ⚠ 직접 확인 필요 |
| Indeed Ireland | 일자리 | 아일랜드 구인 검색 | https://ie.indeed.com ⚠ 직접 확인 필요 |
| Revolut | 은행·송금 | 앱으로 여는 계좌, 아일랜드에서 많이 써요 | https://www.revolut.com ⚠ 직접 확인 필요 |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 독일 (DE)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| DB Navigator | 교통 | 기차표 예매·도이칠란트티켓 | https://www.bahn.de |
| WG-Gesucht | 집 | 셰어하우스(WG) 방 구하기 | https://www.wg-gesucht.de |
| ImmoScout24 | 집 | 집 구하기 | https://www.immobilienscout24.de ⚠ 직접 확인 필요 |
| Indeed Deutschland | 일자리 | 독일 구인 검색 | https://de.indeed.com ⚠ 직접 확인 필요 |
| N26 | 은행·송금 | 앱으로 여는 은행 계좌 | https://n26.com |
| NINA | 안전 | 독일 정부 재난·경보 알림 | https://www.bbk.bund.de |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 프랑스 (FR)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| SNCF Connect | 교통 | 기차표 예매 | https://www.sncf-connect.com ⚠ 직접 확인 필요 |
| Bonjour RATP | 교통 | 파리 지하철·버스 경로 | https://www.ratp.fr ⚠ 직접 확인 필요 |
| Leboncoin | 집 | 방·중고·구인 게시판 | https://www.leboncoin.fr ⚠ 직접 확인 필요 |
| Indeed France | 일자리 | 프랑스 구인 검색 | https://fr.indeed.com ⚠ 직접 확인 필요 |
| Doctolib | 생활 | 병원 예약 | https://www.doctolib.fr ⚠ 직접 확인 필요 |
| ameli | 생활 | 건강보험 가입·환급 | https://www.ameli.fr ⚠ 직접 확인 필요 |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 이탈리아 (IT)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| Trenitalia | 교통 | 기차표 예매 | https://www.trenitalia.com |
| Idealista Italia | 집 | 방·집 구하기 | https://www.idealista.it ⚠ 직접 확인 필요 |
| Subito | 집 | 중고·방·구인 게시판 | https://www.subito.it |
| Indeed Italia | 일자리 | 이탈리아 구인 검색 | https://it.indeed.com ⚠ 직접 확인 필요 |
| IO | 생활 | 이탈리아 정부 서비스 앱 | https://ioapp.it |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 스페인 (ES)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| Renfe | 교통 | 기차표 예매 | https://www.renfe.com |
| Idealista | 집 | 방·집 구하기 | https://www.idealista.com ⚠ 직접 확인 필요 |
| Wallapop | 생활 | 중고 거래 | https://es.wallapop.com |
| InfoJobs | 일자리 | 스페인에서 가장 큰 구인 사이트 | https://www.infojobs.net ⚠ 직접 확인 필요 |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 포르투갈 (PT)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| CP | 교통 | 기차표 예매 | https://www.cp.pt |
| Idealista Portugal | 집 | 방·집 구하기 | https://www.idealista.pt ⚠ 직접 확인 필요 |
| OLX Portugal | 생활 | 중고·방·구인 게시판 | https://www.olx.pt ⚠ 직접 확인 필요 |
| Net-Empregos | 일자리 | 포르투갈 구인 사이트 | https://www.net-empregos.com ⚠ 직접 확인 필요 |
| MB WAY | 은행·송금 | 송금·결제 | https://www.mbway.pt ⚠ 직접 확인 필요 |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 네덜란드 (NL)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| NS | 교통 | 기차표·시간표 | https://www.ns.nl |
| 9292 | 교통 | 버스·트램·기차 경로 | https://9292.nl |
| Kamernet | 집 | 방 구하기 | https://kamernet.nl |
| Funda | 집 | 집 구하기 | https://www.funda.nl |
| Indeed Nederland | 일자리 | 네덜란드 구인 검색 | https://nl.indeed.com ⚠ 직접 확인 필요 |
| Tikkie | 은행·송금 | 친구끼리 송금·더치페이 | https://www.tikkie.me |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 벨기에 (BE)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| SNCB | 교통 | 기차표 예매 | https://www.belgiantrain.be ⚠ 직접 확인 필요 |
| Immoweb | 집 | 방·집 구하기 | https://www.immoweb.be |
| 2ememain | 생활 | 중고 거래 | https://www.2ememain.be |
| Indeed Belgique | 일자리 | 벨기에 구인 검색 | https://be.indeed.com ⚠ 직접 확인 필요 |
| itsme | 생활 | 은행·정부 서비스 본인 확인 | https://www.itsme-id.com |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 룩셈부르크 (LU)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| mobiliteit.lu | 교통 | 대중교통 경로 (룩셈부르크 대중교통은 무료) | https://www.mobiliteit.lu |
| athome.lu | 집 | 방·집 구하기 | https://www.athome.lu |
| jobs.lu | 일자리 | 룩셈부르크 구인 사이트 | https://www.jobs.lu |
| MyGuichet | 생활 | 정부 서비스 | https://guichet.public.lu |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 오스트리아 (AT)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| ÖBB | 교통 | 기차표 예매 | https://www.oebb.at |
| WienMobil | 교통 | 빈 대중교통 경로·표 | https://www.wienerlinien.at |
| willhaben | 집 | 방·중고·구인 게시판 | https://www.willhaben.at |
| karriere.at | 일자리 | 오스트리아 구인 사이트 | https://www.karriere.at |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 덴마크 (DK)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| Rejseplanen | 교통 | 대중교통 경로 | https://www.rejseplanen.dk |
| BoligPortal | 집 | 방·집 구하기 | https://www.boligportal.dk ⚠ 직접 확인 필요 |
| Jobindex | 일자리 | 덴마크 구인 사이트 | https://www.jobindex.dk |
| MobilePay | 은행·송금 | 송금·결제 | https://mobilepay.dk |
| MitID | 생활 | 은행·정부 서비스 본인 확인 | https://www.mitid.dk |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 스웨덴 (SE)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| SL | 교통 | 스톡홀름 대중교통 | https://sl.se |
| SJ | 교통 | 기차표 예매 | https://www.sj.se |
| Blocket | 집 | 중고·방 게시판 | https://www.blocket.se |
| Arbetsförmedlingen | 일자리 | 스웨덴 공공 구인 사이트 | https://arbetsformedlingen.se |
| Swish | 은행·송금 | 송금·결제 | https://www.swish.nu |
| BankID | 생활 | 은행·정부 서비스 본인 확인 | https://www.bankid.com |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 체코 (CZ)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| IDOS | 교통 | 기차·버스 시간표 | https://idos.cz |
| PID Lítačka | 교통 | 프라하 대중교통 표 | https://pid.cz |
| Sreality | 집 | 방·집 구하기 | https://www.sreality.cz |
| Jobs.cz | 일자리 | 체코 구인 사이트 | https://www.jobs.cz ⚠ 직접 확인 필요 |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 헝가리 (HU)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| BKK Futár | 교통 | 부다페스트 대중교통 실시간 정보 | https://bkk.hu ⚠ 직접 확인 필요 |
| MÁV | 교통 | 기차표 예매 | https://www.mavcsoport.hu |
| ingatlan.com | 집 | 방·집 구하기 | https://ingatlan.com ⚠ 직접 확인 필요 |
| Profession.hu | 일자리 | 헝가리 구인 사이트 | https://www.profession.hu ⚠ 직접 확인 필요 |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 폴란드 (PL)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| Jakdojade | 교통 | 도시 대중교통 경로·표 | https://jakdojade.pl |
| PKP Intercity | 교통 | 기차표 예매 | https://www.intercity.pl ⚠ 직접 확인 필요 |
| Otodom | 집 | 방·집 구하기 | https://www.otodom.pl ⚠ 직접 확인 필요 |
| OLX Polska | 생활 | 중고·방·구인 게시판 | https://www.olx.pl ⚠ 직접 확인 필요 |
| Pracuj.pl | 일자리 | 폴란드 구인 사이트 | https://www.pracuj.pl ⚠ 직접 확인 필요 |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 라트비아 (LV)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| Mobilly | 교통 | 교통 요금·주차 결제 | https://www.mobilly.lv ⚠ 직접 확인 필요 |
| ss.com | 집 | 방·중고·구인 게시판 | https://www.ss.com |
| CV.lv | 일자리 | 라트비아 구인 사이트 | https://www.cv.lv |
| Bolt | 교통 | 택시 호출 | https://bolt.eu |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 대만 (TW)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| LINE | 생활 | 현지 연락은 대부분 LINE으로 해요 | https://line.me |
| 悠遊卡 EasyCard | 교통 | 교통카드 (편의점 결제도 돼요) | https://www.easycard.com.tw |
| 台灣高鐵 T Express | 교통 | 고속철도 예매 | https://www.thsrc.com.tw |
| 591租屋網 | 집 | 방 구하기 | https://www.591.com.tw |
| 104人力銀行 | 일자리 | 대만 구인 사이트 | https://www.104.com.tw ⚠ 직접 확인 필요 |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 홍콩 (HK)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| Octopus | 교통 | 교통카드·결제 | https://www.octopus.com.hk |
| MTR Mobile | 교통 | 지하철 경로·시간 | https://www.mtr.com.hk |
| 28Hse | 집 | 방·집 구하기 | https://www.28hse.com |
| Jobsdb Hong Kong | 일자리 | 홍콩 구인 사이트 | https://hk.jobsdb.com ⚠ 직접 확인 필요 |
| WhatsApp | 생활 | 현지 연락은 대부분 WhatsApp으로 해요 | https://www.whatsapp.com |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 이스라엘 (IL)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| Moovit | 교통 | 버스·기차 경로 | https://moovitapp.com |
| Rav-Kav Online | 교통 | 교통카드 충전 | https://ravkavonline.co.il |
| Yad2 | 집 | 방·중고·구인 게시판 | https://www.yad2.co.il ⚠ 직접 확인 필요 |
| Home Front Command | 안전 | 이스라엘 민방위 경보 앱. 꼭 설치하세요 | https://www.oref.org.il ⚠ 직접 확인 필요 |
| WhatsApp | 생활 | 현지 연락은 대부분 WhatsApp으로 해요 | https://www.whatsapp.com |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 아르헨티나 (AR)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| Cómo llego | 교통 | 부에노스아이레스 대중교통 경로 | https://www.buenosaires.gob.ar |
| Mercado Pago | 은행·송금 | 송금·결제 | https://www.mercadopago.com.ar ⚠ 직접 확인 필요 |
| Mercado Libre | 생활 | 중고·쇼핑 | https://www.mercadolibre.com.ar ⚠ 직접 확인 필요 |
| Bumeran | 일자리 | 아르헨티나 구인 사이트 | https://www.bumeran.com.ar |
| WhatsApp | 생활 | 현지 연락은 대부분 WhatsApp으로 해요 | https://www.whatsapp.com |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 칠레 (CL)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| Red Movilidad | 교통 | 산티아고 버스·지하철 | https://www.red.cl |
| Portal Inmobiliario | 집 | 방·집 구하기 | https://www.portalinmobiliario.com ⚠ 직접 확인 필요 |
| Laborum | 일자리 | 칠레 구인 사이트 | https://www.laborum.cl |
| Mercado Libre Chile | 생활 | 중고·쇼핑 | https://www.mercadolibre.cl ⚠ 직접 확인 필요 |
| WhatsApp | 생활 | 현지 연락은 대부분 WhatsApp으로 해요 | https://www.whatsapp.com |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 브라질 (BR)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| Moovit | 교통 | 버스·지하철 경로 | https://moovitapp.com |
| 99 | 교통 | 택시 호출 | https://99app.com ⚠ 직접 확인 필요 |
| QuintoAndar | 집 | 방·집 구하기 | https://www.quintoandar.com.br |
| Catho | 일자리 | 브라질 구인 사이트 | https://www.catho.com.br ⚠ 직접 확인 필요 |
| Mercado Livre | 생활 | 중고·쇼핑 | https://www.mercadolivre.com.br ⚠ 직접 확인 필요 |
| WhatsApp | 생활 | 현지 연락은 대부분 WhatsApp으로 해요 | https://www.whatsapp.com |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 안도라 (AD)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| Andorra Telecom | 통신 | 안도라 통신사 (유심·요금제) | https://www.andorratelecom.ad |
| WhatsApp | 생활 | 현지 연락은 대부분 WhatsApp으로 해요 | https://www.whatsapp.com |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |

## 핀란드 (FI)
| 앱 | 분류 | 설명 | 링크 |
|---|---|---|---|
| HSL | 교통 | 헬싱키 대중교통 표·경로 | https://www.hsl.fi ⚠ 직접 확인 필요 |
| VR | 교통 | 기차표 예매 | https://www.vr.fi |
| Oikotie | 집 | 방·집 구하기 | https://asunnot.oikotie.fi |
| Tori.fi | 생활 | 중고 거래 | https://www.tori.fi |
| MobilePay | 은행·송금 | 송금·결제 | https://mobilepay.fi |
| 해외안전여행 | 안전 | 외교부 앱. 여행경보·대사관 연락처·영사콜센터를 한곳에서 봐요 | https://www.0404.go.kr |
