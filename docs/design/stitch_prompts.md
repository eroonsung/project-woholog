# 워홀로그 Stitch 프롬프트 v1 (2026-11-10)

## 쓰는 법
1. Stitch에서 **Mobile**로 먼저 만들고, 마음에 들면 같은 화면을 **Web**으로 다시 만든다. 웹 프롬프트는 각 화면 아래 "Web" 한 줄을 모바일 프롬프트 끝에 붙이면 된다.
2. **모든 프롬프트 맨 앞에 [공통 스타일]을 붙여 넣는다.** Stitch는 화면마다 스타일을 잊는 경우가 많다.
3. 한 프롬프트 = 한 화면. 질문 12개는 입력 방식이 같은 것끼리 묶어 6장으로 만들고, 나머지는 Figma에서 문구만 바꿔 복제한다.
4. 결과가 마음에 안 들면 처음부터 다시 만들지 말고 "Change only X" 식으로 한 가지씩 고친다.
5. 다 만들면 Figma로 내보낸 뒤 색·글꼴을 디자인 가이드 변수로 교체한다(Stitch 색은 조금씩 틀어진다).

화면 목록 (모바일·웹 각 1장)
- S0 첫 화면
- S1 질문 공통 틀 + Q1 마음에 둔 나라
- S2 Q2 만 나이 + Q3 누구랑(펼침)
- S3 카드형 한 개 고르기(Q5·Q7·Q10·Q11 공통, Q7로 그림)
- S4 칩 여러 개 고르기(Q4·Q8·Q9·Q12 공통, Q12로 그림)
- S5 Q6 돈 슬라이더
- S6 나이 초과 안내 / 계산 중
- S7 결과
- S8 나란히 비교
- S9 Coming soon + 이메일 신청(모달·완료·오류)
- S10 개인정보 처리방침 페이지
- S11 헤더·모바일 메뉴
- S12 29개국 비교표
- S13 나라 상세
- S14 체크리스트 시작 (나라·출국일)
- S15 체크리스트 목록
- S16 To Korea 대기자 (영어)
- S17 정보 제보 모달
- S18 준비 중 기능 모음
- S19 준비 중 기능 상세 (템플릿)
- S20 가이드 목록 (빈 상태 포함)
- S21 결과 공유 이미지 (OG·인스타 스토리)
- S22 필수 앱·추천 준비물 칸

---

## [공통 스타일] (모든 프롬프트 맨 앞에 붙이기)

```
Design system for "워홀로그 (woholog)", a Korean web service that tells young Koreans how well a working-holiday country fits them. Tone: friendly, clear, trustworthy, a little playful. All UI text in Korean exactly as written in quotes.
Colors (exact hex, apply exactly as described):
- Page background pure white #FFFFFF. Header white with a 1px #E6E9EF bottom line.
- Hero: full-width SOLID light aqua #9FE6F3 block, square edges, no gradient. Hero headline navy #1D3366, hero body text #2E4470.
- Primary button (only ONE per screen): coral #FF7E5F fill, navy #1D3366 extra-bold text (never white text on coral), radius 14, soft coral glow shadow 0 6px 14px rgba(255,126,95,0.35).
- Secondary actions: navy #1D3366 filled pill with white text (e.g. header "시작하기"), or an underlined navy text link.
- Segmented toggle: track #F6F8FA, selected option = navy fill with white text, unselected = #5A6684 text.
- Small label badge on the aqua hero: white pill with dark aqua #0A7A8F bold text. Tags elsewhere: aqua-100 #D6F5FB pill with dark aqua #0A7A8F text.
- Lime #ABE54C ONLY for one round, slightly rotated sticker (lime fill, navy bold text) and small fun badges. Never for buttons or large areas.
- Cards floating on aqua: white, radius 22, shadow 0 12px 28px rgba(29,51,102,0.14). Cards on white sections: #F6F8FA fill, radius 18, no shadow.
- Selected chip/card state: aqua-100 #D6F5FB fill, 1.5px dark aqua #0A7A8F border, navy text, small check icon.
- Inputs: white, 1.5px #E6E9EF border, radius 14, placeholder #8A93A8; focus = dark aqua border + 3px #D6F5FB ring.
- Soft section/info background: aqua-50 #EAF9FC. Numbered step circles: aqua #9FE6F3 fill with navy number.
- Modal: dim overlay rgba(29,51,102,0.45), white sheet radius 24.
- Text: navy #1D3366 main, #5A6684 secondary, #8A93A8 hints. Lines #E6E9EF. Error #E5484D (form errors only).
Status marks used everywhere: ✓ = dark aqua #0A7A8F check in aqua-100 #D6F5FB circle; △ = coral-dark #B9432A triangle in coral-50 #FFE6DF circle; ✗ = #8A93A8 x in #F6F8FA circle. Never use red for ✗ (it is a fit signal, not an error).
Font: Pretendard. Headings extra bold (800), body 400-500, line height 1.6.
Radius: chips 8, buttons and inputs 14, cards 20, pills 999. Card shadow: 0 6px 18px rgba(29,51,102,0.10). 4px spacing grid.
Icons: Lucide line icons 2px. Country flags as small rounded flag icons, not emoji.
Mobile: 375 wide, 20px side padding, full-width 48px primary button fixed at the bottom. Web: 1440 wide, content max 1120 centered, 52px buttons, generous white space.
```

---

## S0 첫 화면 (랜딩)

```
[공통 스타일]
Screen: landing page.
Top header: logo "워홀로그" in navy extra bold left; center segmented toggle with two options "From Korea 🇰🇷→🌏" (selected) and "To Korea 🌏→🇰🇷"; then menu items in #5A6684 bold with small chevrons "나라 고르기 ▾", "준비하기 ▾", "현지 생활 ▾", "귀국 ▾", "커뮤니티" (with a tiny lime "Soon" badge), a thin vertical divider, navy text "로그인" and a navy filled pill button with white text "시작하기". (Mobile: logo + full-width toggle under it + hamburger icon instead of the menu links.)
Full-width solid aqua #9FE6F3 hero block (square edges): small white pill badge with dark aqua text "2분 · 질문 12개", a round lime sticker rotated 12° with navy text "29개국 무료 비교" near the top right of the headline, headline "마음에 둔 워홀 나라, 나한테 맞을까?", subtext "돈·언어·일·나이로 29개 나라의 적합도를 %로 알려줘요. 이유까지요.", primary coral button "내 나라 확인하기" with an underlined navy text link "29개국 비교표 보기" next to it, below them a small #2E4470 line "로그인 없이 바로 시작해요".
Below hero: a sample result card preview (slightly tilted, floating shadow): flag of Canada, "캐나다", big "93%", "조건 9개 중 8개 ✓", three rows "돈 ✓", "언어 ✓", "일 △".
Then on white background 3 small feature cards (#F6F8FA fill, radius 18, no shadow) in a row (stack on mobile): "29개 나라 공식 정보" (icon: shield-check), "출처와 확인일 표시" (icon: calendar-check), "마음에 둔 나라 vs 1위 비교" (icon: columns).
Footer: "개인정보 처리방침", "정보 제보하기", small text "참고용 정보예요. 최종 확인은 각 나라 대사관에서 해주세요."
```
Web: `Web layout: hero split in two columns, headline and button left, sample result card right. Feature cards in 3 columns.`

---

## S1 질문 공통 틀 + Q1 마음에 둔 나라

```
[공통 스타일]
Screen: question 1 of 12 of a quiz. This layout is the template for all questions.
Top bar: back arrow left, center text "1 / 12", right text button "처음부터". Under it a thin progress bar (aqua fill on light gray, 1/12 filled).
Question title (H1): "마음에 둔 나라가 있어요?"
Helper text: "최대 3개까지 골라요. 없으면 건너뛰어도 돼요."
Search input with search icon, placeholder "나라 이름 검색".
Country chips grouped by region with small gray region labels: "아시아" (일본, 대만, 홍콩), "오세아니아" (호주, 뉴질랜드), "북미" (캐나다), "유럽" (영국, 아일랜드, 프랑스, 독일, 스페인, 이탈리아, 네덜란드, 벨기에, 룩셈부르크, 오스트리아, 덴마크, 스웨덴, 포르투갈, 체코, 헝가리, 폴란드, 라트비아, 안도라), "남미" (아르헨티나, 칠레, 브라질), "중동" (이스라엘). Each chip: small flag + name. Selected chips (show 캐나다 and 일본 selected): aqua-100 #D6F5FB fill, 1.5px dark aqua border, check icon. Unselected chips: white with 1.5px #E6E9EF border. Israel chip has a tiny coral-50 tag with coral-dark text "안전 주의".
Counter text "2개 선택됨".
Bottom: secondary text button "아직 없어요" and coral primary button "다음".
```
Web: `Web layout: centered question column max 720px, country chips wrap in rows, bottom buttons inline at the end of the column instead of fixed.`

---

## S2 Q2 만 나이 + Q3 누구랑 (2장)

```
[공통 스타일]
Use the same quiz template as question 1 (top bar, "2 / 12", progress bar).
Question: "만 나이가 몇 살이에요?"
Helper: "신청하는 날 기준 만 나이예요. 나라마다 지원 가능한 나이가 달라요."
A large centered number stepper: minus button, big number "27" with suffix "세", plus button. Below it a small link "만 나이 계산하기" that opens a birth date input.
Bottom coral button "다음".
```

```
[공통 스타일]
Same quiz template, "3 / 12".
Question: "누구랑 떠나요?"
Two large option cards side by side (stacked on mobile), each with icon, title and one-line description: "혼자" (icon: user) "나에게 맞는 나라만 계산해요", "친구·연인과 함께" (icon: users) "둘 다 갈 수 있는 나라로 계산해요". Show "친구·연인과 함께" selected (1.5px dark aqua border, aqua-100 #D6F5FB fill, check badge).
Because it is selected, an expanded panel slides open below on aqua-50 background: field "같이 가는 사람의 만 나이" with number input "29 세", and "같이 가는 사람이 워홀로 다녀온 나라" with country chips and "없어요" chip selected.
Bottom coral button "다음".
```

---

## S3 카드형 한 개 고르기 (Q7로 그림, Q5·Q10·Q11은 문구만 교체)

```
[공통 스타일]
Same quiz template, "7 / 12".
Question: "영어로 어디까지 할 수 있어요?"
Helper: "시험 점수 말고, 실제로 할 수 있는 일로 골라요."
Four full-width selectable cards in a vertical list, each with a short bold title and a gray example line:
1 "거의 못 해요" — "인사, 숫자 정도"
2 "주문·길 묻기 정도" — "카페에서 주문하고 길을 물어볼 수 있어요"
3 "알바 면접을 볼 수 있어요" — "자기소개하고 간단한 질문에 답할 수 있어요" (selected state)
4 "회의·이메일로 일할 수 있어요" — "업무 대화와 이메일을 영어로 해요"
Single choice: selecting a card auto-advances after 0.3s, so no bottom button; only a small "이전" text button.
```
문구 교체용
- Q5 "언제 떠나고 싶어요?" / 보기: 3개월 안에 · 6개월 안에 · 1년 안에 · 아직 몰라요 / 도움말 "지금은 접수 일정 안내에만 써요."
- Q10 "현지에서 생활비를 벌어야 해요?" / 꼭 벌어야 해요(생활비 대부분) · 일부만 벌면 돼요(용돈 정도) · 안 벌어도 돼요(모아 둔 돈으로 지내요)
- Q11 "어학원은 얼마나 다닐 생각이에요?" / 안 다닐래요 · 3개월쯤 · 6개월쯤 · 6개월 넘게

---

## S4 칩 여러 개 고르기 (Q12로 그림, Q4·Q8·Q9는 문구만 교체)

```
[공통 스타일]
Same quiz template, "12 / 12", progress bar full.
Question: "가장 중요한 걸 골라요"
Helper: "최대 3개, 순서는 상관없어요."
Large pill chips with leading icons, wrapping in rows: "돈 모으기" (piggy-bank), "일자리 구하기 쉬운 곳" (briefcase), "영어 실력" (languages), "커리어" (trending-up), "2년 이상 머물기" (calendar-range), "유럽 여행" (train), "생활비 적게" (wallet), "확실하게 뽑히기" (ticket-check), "한국인 적은 곳" (user-minus), "한국인 많은 곳" (users), "한국과 가까운 곳" (plane).
Show 3 selected: "돈 모으기", "일자리 구하기 쉬운 곳", "2년 이상 머물기" (aqua-100 #D6F5FB fill, 1.5px dark aqua border, check). Other chips look slightly disabled with helper "3개를 다 골랐어요. 바꾸려면 하나를 빼요."
A separate small section below with label "마음에 둔 나라가 끌리는 이유 (점수에는 안 들어가요)": chips "문화가 좋아서", "그 나라 언어를 배우고 싶어서", "아는 사람이 있어서".
Text button "잘 모르겠어요".
Bottom coral button "결과 보기".
```
문구 교체용
- Q4 "워홀로 다녀온 나라가 있어요?" / 도움말 "대부분 나라는 한 번만 갈 수 있어요. 캐나다·일본은 두 번까지." / 나라 칩 + "없어요"
- Q8 "영어 말고 알바 면접을 볼 수 있는 언어가 있어요?" / 일본어 · 중국어 · 광둥어 · 프랑스어 · 독일어 · 스페인어 · 이탈리아어 · 포르투갈어 · 네덜란드어 · 기타 / "없어요" (남은 나라 언어만 보여 줌)
- Q9 "현지에서 어떤 일을 하고 싶어요?" / 여러 개 / 카페·식당 · 판매·마트 · 호텔·관광 · 농장·공장 · 사무직 · 돌봄 · 아직 몰라요

---

## S5 Q6 돈 슬라이더

```
[공통 스타일]
Same quiz template, "6 / 12".
Question: "출발 전에 준비할 수 있는 돈은요?"
Helper: "항공권, 비자 비용, 처음 한두 달 생활비를 모두 합친 금액이에요."
Big amount display centered: "500만 원" in navy extra bold.
A wide slider with aqua track and a large navy thumb, range labels "100만" left and "2,000만+" right, tick marks every 500만.
Under the slider an info box on aqua-50 with info icon: "나라마다 비자에 필요한 잔고 증명 금액이 달라요. 결과에서 나라별로 알려 줄게요."
Bottom coral button "다음".
```

---

## S6 나이 초과 안내 / 계산 중 (2장)

```
[공통 스타일]
Screen: friendly stop screen when the user is 36 or older.
Illustration placeholder: simple line drawing of a passport and a calendar.
Title: "워홀은 만 35세까지만 갈 수 있어요"
Body: "아쉽지만 모든 협정국의 나이 제한이 만 35세 이하예요. 대신 어학연수·해외취업 정보가 열리면 알려 드릴게요."
Coral button "오픈 알림 받기", text button "나이 다시 입력하기".
```

```
[공통 스타일]
Screen: short loading screen after the last question.
Center: animated progress ring in aqua, text "29개 나라와 비교하는 중이에요", small rotating line below: "나이 조건 확인 중…", "필요한 돈 계산 중…", "일 규칙 확인 중…". Light aqua background top half.
```

---

## S7 결과 (가장 중요)

```
[공통 스타일]
Screen: quiz result, long scrolling page.
Top bar: "← 다시 하기" left, share icon button right.
Section 1, heart-country card (large card, floating shadow): small label "마음에 둔 나라", flag + "일본", big score "56%" with a small text "조건 9개 중 4개 ✓". A navy headline: "일본에 가려면 이것부터 해결해요". A lime sticker badge "마음 이유: 문화가 좋아서".
Inside the card a checklist of condition rows. Each row: mark circle (✓/△/✗), bold label, one-line reason in gray:
✓ "돈" — "준비한 500만 원이면 필요한 돈 약 320만 원을 넘어요."
✗ "언어" — "일본어로 면접을 볼 수 없으면 일자리 구하기가 어려워요."
✗ "일" — "지금 언어로는 일하며 지내기 어려워요."
✓ "어학원" — "어학원을 3개월까지 다닐 수 있어요." with a small gray tag "확인 중"
✓ "한국과 가까운 곳" — "비행기로 2시간 거리예요."
△ "생활비 적게" — "물가는 한국과 비슷해요."
Below the rows a highlighted box on aqua-50 #EAF9FC with a dark aqua sparkles icon: title "이렇게 바꾸면", text "일본어로 알바 면접을 볼 수 있게 되면 → 일본 56% → 94%".
Section 2, "현실 미리보기" mini table with 4 rows and icons: "필요한 돈 약 320만 원 (잔고 증명 280만 원 + 항공권)", "대표 일자리 음식점·호텔 / 시급 약 1,226엔(도쿄)", "월세 원룸 약 7.8만 엔(도쿄)", "다음 접수 2027년 1월 (분기마다)".
Button row: outlined navy button "1위 나라와 나란히 비교".
Section 3, "나에게 더 잘 맞는 나라 TOP 3": three compact horizontal cards with flag, name, score and 3 mini marks: "캐나다 93% · 추첨" (coral-50 #FFE6DF pill with coral-dark #B9432A text "추첨"), "영국 80%", "아일랜드 74% · 추첨". Each card has a one-line reason e.g. "영어 면접 가능 + 2년 체류".
Section 4, collapsed accordion "지금은 갈 수 없는 나라 5곳" with reasons like "나이 조건(만 30세까지)".
Section 5, data note in small gray: calendar icon "정보 확인일: 2026-11-10 · 출처: 워킹홀리데이 인포센터 외", link "정보가 틀렸나요? 제보하기", disclaimer "참고용이에요. 비자 조건은 바뀔 수 있으니 신청 전 대사관에서 꼭 확인해요."
Under the heart-country card add a navy text link "일본 상세 정보 보기 →". Sticky bottom bar on mobile: coral button "이 나라로 준비 시작" (goes to checklist) and an icon button with share icon labeled "공유" (opens a bottom sheet with "링크 복사", "이미지로 저장 (인스타 스토리)", "카카오톡").
```
Web: `Web layout: two columns. Left (wider): heart-country card and 현실 미리보기. Right: sticky panel with TOP 3 cards, compare button and share button. Data note full width at the bottom.`

결과 화면 변형 (같은 프롬프트에 붙여 한 장씩 더)
- 1위인 경우: `Change only the heart-country card: score "93%", "조건 9개 중 8개 ✓", headline "캐나다, 잘 맞아요. 마음 가는 대로 가도 좋아요.", remove the "이렇게 바꾸면" box.`
- 마음에 둔 나라 없음: `Remove the heart-country card. Start with a large "나에게 가장 잘 맞는 나라" card for 캐나다 93% with the same condition rows.`

---

## S8 나란히 비교

```
[공통 스타일]
Screen: side-by-side comparison of two countries.
Top bar: back arrow, title "나란히 비교".
Sticky header row with two columns: left "일본 56%" with label "마음에 둔 나라", right "캐나다 93%" with lime label "1위". A small "+ 나라 추가" button (max 3).
Comparison table, each row = label on top (small gray) and two cells side by side, mark circles where relevant, the better cell has a subtle aqua-50 background:
"돈" ✓ 약 320만 원 | ✓ 약 436만 원
"언어" ✗ 일본어 필요 | ✓ 영어 면접 가능
"일" ✗ 어려움 | ✓ 카페·식당·마트
"어학원" ✓ 3개월 (확인 중) | ✓ 6개월
"체류 기간" 1년 (2번까지) | 2년
"선발 방식" 선착순 (분기별) | 추첨
"최저 시급" 1,226엔 (도쿄) | 18.15 캐나다달러 (연방)
"월세" 원룸 약 7.8만 엔 | 방 1개 400~1,500 캐나다달러
"한국인 수" 많음 | 많음
"다음 접수" 2027년 1월 | 2027년 상반기 예정
Bottom: summary sentence on aqua-50 "캐나다는 언어·일에서 앞서고, 일본은 가깝고 두 번 갈 수 있어요." and coral button "결과 링크 공유하기".
```
Web: `Web layout: classic table with a fixed first column for labels and three country columns (third column empty with "+ 나라 추가"). Max width 1120.`

---

## S9 Coming soon + 이메일 신청 (3장)

```
[공통 스타일]
Screen: modal over a dimmed landing page (mobile: bottom sheet with drag handle).
Lime badge "Coming soon". Title "커뮤니티가 곧 열려요". Body "워홀 준비하는 사람들끼리 묻고 답하는 공간을 만들고 있어요. 열리면 메일로 한 번 알려 드릴게요."
Email input with label "이메일", placeholder "you@example.com".
Required consent checkbox row: "[필수] 오픈 알림을 위한 개인정보 수집·이용에 동의해요" with a text link "보기" that expands a small gray box: "수집 항목: 이메일 / 목적: 커뮤니티 오픈 알림 1회 발송 / 보관: 알림 발송 후 30일 이내 파기 / 동의하지 않아도 서비스 이용에는 제한이 없어요."
Coral button "알림 받기" (disabled style until checkbox is checked). Close X at top right.
```

```
[공통 스타일]
Same modal, success state: big aqua check circle, title "신청 완료!", body "커뮤니티가 열리면 입력한 메일로 알려 드릴게요. 그 전에는 메일을 보내지 않아요.", navy outlined button "닫기".
```

```
[공통 스타일]
Same modal, error states shown together for design reference: email input with red border #E5484D and message "이메일 형식을 확인해 주세요."; and a second variant with an info message in dark aqua "이미 신청한 이메일이에요. 열리면 알려 드릴게요."
```

---

## S10 개인정보 처리방침

```
[공통 스타일]
Screen: simple legal text page, readable.
Header same as landing. Page title "개인정보 처리방침", gray "시행일 2026년 12월 31일 · 버전 1.0", language toggle "한국어 | English".
Left (web) or top (mobile) table of contents with 9 anchor links: "1. 수집하는 항목과 목적", "2. 보관 기간과 파기", "3. 처리 위탁과 국외 이전", "4. 제3자 제공", "5. 자동으로 수집되는 정보", "6. 이용자의 권리", "7. 안전 조치", "8. 개인정보 보호책임자", "9. 변경 안내".
Body: H2 headings, short paragraphs and one simple table with columns "항목 | 목적 | 보관 기간". Max text width 720. Lots of white space.
```

---

## S11 헤더·메가 메뉴·모바일 메뉴

```
[공통 스타일]
Screen: navigation reference sheet (one frame showing web header with an open mega menu, and the mobile menu).
Web header (white, 1px #E6E9EF bottom line, height 68): logo "워홀로그" with small gray "woholog"; segmented toggle "From Korea" (selected, navy fill white text) / "To Korea"; menu items with chevrons "나라 고르기", "준비하기" (open state: navy text, dark aqua 2px underline), "현지 생활", "귀국", then "커뮤니티" with tiny lime "Soon" badge; divider; "로그인" text and navy pill "시작하기".
Open mega menu under "준비하기": white panel, radius 20, card shadow, full content width, 4 columns, one column per stage with a small gray stage label and a step number circle in aqua:
"① 나라 고르기": "나라 추천 테스트" (compass) "질문 12개로 적합도 확인", "29개국 비교" (table) "조건을 한눈에", "가이드" (book-open) "준비 정보 글".
"② 준비하기": "D-day 체크리스트" (list-checks) "출국일까지 할 일", "나라별 필수 앱" (smartphone) "가서 깔 앱", "초기 비용 계산기" (calculator) + lime "Soon", "예산 저축 플래너" (piggy-bank) + "Soon", "모집 오픈 알림" (bell) + "Soon", "정착 가이드북" (book) + "Soon".
"③ 현지 생활": "일자리 찾기 가이드" (briefcase) + "Soon", "세컨비자 트래커" (calendar-check) + "Soon", "환율·송금 알림" (repeat) + "Soon", "안전 체크인" (shield) + "Soon", "출국 동기 찾기" (users) + "Soon".
"④ 귀국": "세금·연금 환급 도우미" (receipt) + "Soon", "워홀 결산 리포트" (award) + "Soon", "경험을 이력서로" (file-text) + "Soon".
Soon items use #5A6684 text (not disabled-looking, still clickable). Bottom strip of the panel on aqua-50: "곧 나올 기능 15개 모두 보기 →".
Mobile menu open: full-screen white sheet from the right, close X. Accordion sections "나라 고르기", "준비하기" (expanded, showing its 6 items with Soon badges), "현지 생활", "귀국", "커뮤니티 Soon". Divider. "로그인 (Soon)", "곧 나올 기능 전체 보기", "개인정보 처리방침", "정보 제보하기". Bottom: coral button "내 나라 확인하기".
Footer (web): links "곧 나올 기능 · 개인정보 처리방침 · 정보 제보하기", disclaimer "참고용 정보예요. 최종 확인은 각 나라 대사관에서 해주세요.", "© 2026 워홀로그".
```

---

## S12 29개국 비교표

```
[공통 스타일]
Screen: "29개국 비교" table page.
Title H1 "29개국 한눈에 비교", sub "정보 확인일 2026-11-10 · 출처 워킹홀리데이 인포센터 외".
Filter row: chips "지역: 전체 / 아시아 / 오세아니아 / 북미 / 유럽 / 남미 / 중동", toggle chip "영어권만", number chip "내 나이 27세" (only countries open to this age), sort dropdown "정렬: 필요한 돈 적은 순".
Table (sticky header and sticky first column) with columns: 나라 (flag + name), 나이, 체류, 선발, 인원, 필요한 돈, 최저 시급, 어학원, 일 제한. Example rows:
호주 | 18~35세 | 최대 3년 | 제한 없음 | 무제한 | 약 698만 원 | 상 | 4개월 | 한 고용주 6개월
일본 | 18~30세 | 1년 (2번까지) | 선착순 | 분기별 | 약 320만 원 | 중 | 3개월 (확인 중) | 풍속업 금지
캐나다 | 18~35세 | 2년 (2번까지) | 추첨 (coral-50 tag) | 10,239명 | 약 436만 원 | 상 | 6개월 | 없음
아일랜드 | 18~34세 | 1년 | 추첨 | 800명 | 약 160만 원 | 상 | 6개월 | 상근 불가
이스라엘 | 18~30세 | 1년 | 선착순 | 200명 | 약 159만 원 | 중 | 6개월 | 한 고용주 3개월, with coral-50 "안전 주의" tag
Empty values show a gray "확인 중" pill. Each row has a checkbox at the far left; when 2 are checked a floating navy bar appears at the bottom: "2개 선택됨 · 나란히 비교" with coral button "비교하기".
Mobile: instead of a wide table, a list of country cards (flag, name, age range, 필요한 돈, 선발 tag) with a "표로 보기" toggle that switches to a horizontally scrollable table with sticky first column.
```

---

## S13 나라 상세

```
[공통 스타일]
Screen: country detail page for 일본.
Hero on aqua #9FE6F3 (full width, square): breadcrumb "29개국 비교 > 일본", large flag + H1 "일본 워킹홀리데이", tags (white pills, dark aqua text) "18~30세", "1년 · 2번까지", "선착순 · 분기별 접수". Right side (web) a white floating card "내 적합도 확인하기" with text "질문 12개로 일본이 나에게 맞는지 알려줘요" and coral button "일본 적합도 확인".
Below, white page with a left sticky table of contents on web ("한눈에", "필요한 돈", "일·어학", "신청 방법", "생활 정보", "필수 앱", "추천 준비물", "출처") and sections:
1 "한눈에": 4 stat tiles (#F6F8FA): "필요한 돈 약 320만 원", "최저 시급 1,226엔 (도쿄)", "월세 원룸 약 7.8만 엔", "다음 접수 2027년 1월".
2 "필요한 돈": breakdown rows "잔고 증명 280만 원", "비자 비용 0원", "항공권 약 40만 원", small note "환율 2026-11-10 기준".
3 "일·어학": rows with icons: "어학원 최대 3개월" + gray "확인 중" pill, "금지 업종: 풍속영업(바·파친코 등)", "대표 일자리: 음식점·호텔·요양시설 (일본어 필요)".
4 "신청 방법": numbered steps with aqua circles: "1 접수 기간 확인 (분기마다 5일)", "2 대리신청기관에 서류 제출", "3 결과 확인", "4 출국".
5 "생활 정보": "한국인 많음", "물가 한국과 비슷", "한국과 가까움 (약 2시간)".
5-1 "필수 앱" and 5-2 "추천 준비물": use the S22 blocks.
6 "출처": list of sources with publisher, link icon and 확인일, plus link "정보가 틀렸나요? 제보하기".
Bottom action bar (sticky on mobile): outlined navy button "비교에 담기" and coral button "체크리스트 만들기".
Variant note: for 이스라엘 show a coral-50 banner at the top: "외교부 여행경보 2단계(여행자제), 일부 지역 4단계(여행금지). 출발 전 최신 단계를 확인하세요."
```

---

## S14 체크리스트 시작

```
[공통 스타일]
Screen: checklist setup, simple and short.
Title H1 "출국일까지 할 일, 순서대로 알려 줄게요", sub "로그인 없이 이 브라우저에 저장돼요."
Step 1 label "어느 나라로 가요?": selected country chip "일본" with flag and a "바꾸기" link (if coming from result/detail, prefilled).
Step 2 label "출국 예정일": date input "2027-04-01" with calendar icon, and a chip "아직 몰라요".
Info box on aqua-50: "출국일을 넣으면 'D-90 비자 신청'처럼 날짜별로 정리돼요."
Coral button "체크리스트 만들기".
```

---

## S15 체크리스트 목록

```
[공통 스타일]
Screen: D-day checklist for 일본, departure 2027-04-01.
Top summary card on aqua #9FE6F3 (square full-width block on mobile, rounded card on web): "일본 · 출국 D-142", progress bar "32개 중 5개 완료" (navy fill on white track), small links "출국일 바꾸기", "나라 바꾸기".
Phase tabs as pills (horizontal scroll on mobile): "결정" "신청" "출국 준비" "출국" "도착 후", current "신청" selected (aqua-100 fill, dark aqua border).
List grouped by date headers ("D-120 · 12월 2일", "D-90 · 1월 1일"). Each item row: large checkbox (checked = dark aqua fill with white check), title, one gray line, small tags. Examples:
☑ "여권 유효기간 확인" — "출국일 기준 1년 이상 남았는지" 
☐ "잔고 증명서 발급" — "280만 원 이상, 발급 후 1개월 이내" tags: "서류", "발급 후 1개월 유효" (coral-50)
☐ "대리신청기관 예약" — "접수 기간 1월 19~23일 (예정)" tag "확인 중" (gray)
☐ "범죄경력회보서 발급" — "경찰서 또는 정부24, 영문" tags "서류", "번역 필요"
Past-due item shows gray text "늦었어요" (not red).
Each item expands to show detail and source with 확인일.
Bottom area: link "다른 기기에서 열기 (링크 복사)", note "체크 상태는 이 브라우저에만 저장돼요."
Celebration state hint: when a phase is complete, show a small lime badge "신청 단계 완료!".
```

---

## S16 To Korea 대기자 (English)

```
[공통 스타일]
Screen: English landing for foreigners coming to Korea. All text in English.
Header same as landing but toggle "To Korea" selected.
Hero on aqua: small white pill "Working Holiday in Korea", headline "Coming to Korea on a working holiday?", sub "We're building a step-by-step guide for your first 30 days: visa, alien registration, phone, bank and jobs.", lime round sticker "Coming 2027".
Three preview cards (#F6F8FA): "H-1 visa in plain English", "First 30 days checklist", "Find jobs and housing".
Waitlist card (white, floating): email input "you@example.com", required consent checkbox "I agree to woholog collecting my email to send one launch notice. See privacy policy.", coral button "Join the waitlist", small text "One email when we launch. No spam."
Success state: "You're on the list!".
```

---

## S17 정보 제보 모달

```
[공통 스타일]
Screen: report modal (mobile bottom sheet).
Title "정보 제보하기", body "틀린 정보나 바뀐 규칙을 알려 주세요. 확인 후 고칠게요."
Read-only context chips: "일본 · 나라 상세".
Textarea label "어떤 정보가 다른가요?", placeholder "예: 어학원 기간이 6개월로 바뀌었어요 (출처 링크가 있으면 같이 적어 주세요)", character counter "0 / 2000".
Gray note "연락처는 받지 않아요."
Coral button "제보 보내기". Success state: aqua check, "제보 고마워요! 확인해서 반영할게요."
```

---

## S18 준비 중 기능 모음

```
[공통 스타일]
Screen: "곧 나올 기능" hub page.
Hero on aqua (full width, square): white pill "로드맵", H1 "워홀 전 과정을 함께할 기능을 만들고 있어요", sub "원하는 기능에 '원해요'를 눌러 주세요. 많이 받은 기능부터 만들어요.", lime round sticker "15개 준비 중".
Stage tabs as pills: "전체" (selected), "준비하기", "현지 생활", "귀국", "커뮤니티".
Grid of feature cards (3 columns web, 1 column mobile). Each card: white, radius 20, 1px #E6E9EF border; icon in aqua-100 circle; title; one-line description in #5A6684; bottom row: small gray "2027 상반기 목표" and a pill toggle button "♡ 원해요 128" (pressed state: coral-50 fill, coral-dark text, filled heart "♥ 원해요 129").
Cards: "초기 비용 계산기 — 항공·보험·비자·첫 달 집세를 나라별로 합산", "예산 저축 플래너 — 출국일까지 매달 모을 돈", "모집 오픈 알림 — 캐나다·일본 접수가 열리면 알림", "일자리 찾기 가이드 — 나라별 구인 사이트와 업종별 시급", "세컨비자 조건 트래커 — 호주 지정 지역 근무 일수 세기", "세금·연금 환급 도우미 — 호주 Super 등 돌려받을 돈 계산", "워홀 결산 리포트 — 일한 시간·모은 돈을 한 장 카드로", "커뮤니티 — 나라·도시별 Q&A와 후기".
Bottom section on aqua-50: "열리면 알려 드릴까요?" with email input, required consent checkbox, coral button "알림 받기".
```

---

## S19 준비 중 기능 상세 (템플릿)

```
[공통 스타일]
Screen: a single upcoming feature page, example "세컨비자 조건 트래커". This layout is a reusable template.
Breadcrumb "곧 나올 기능 > 현지 생활". Lime badge "준비 중 · 2027 상반기 목표".
H1 "세컨비자 조건 트래커", sub "호주 2차 비자에 필요한 지정 지역 근무 일수를 자동으로 세어 줘요."
A blurred preview illustration card (gray placeholder mockup of a counter "88일 중 42일" with a progress ring), overlaid by a small white pill "미리보기".
Section "이런 걸 할 수 있어요" with 3 check rows: "근무한 날을 달력에 기록", "지정 지역인지 우편번호로 확인", "남은 일수와 예상 완료일 알림".
Big centered pill button "♡ 원해요" with count "212명이 기다려요".
Card "지금 쓸 수 있는 것": "호주 상세에서 2차 비자 조건 보기 →" (dark aqua link).
Email box: "이 기능이 열리면 알려 드릴까요?" email input + consent checkbox + coral button "알림 받기".
Bottom: "다른 준비 중 기능" horizontal scroll of 3 small cards.
```

---

## S20 가이드 목록 (빈 상태 포함)

```
[공통 스타일]
Screen: guides list page.
H1 "가이드", sub "워홀 준비에 꼭 필요한 정보를 정리해요."
Filter chips: "전체", "나라 고르기", "신청", "출국 준비", "현지 생활".
State A (has posts): list of article cards with a thumbnail placeholder (aqua-50 block with icon), category tag (aqua-100 pill), title "35세에도 갈 수 있는 워홀 나라 7곳", meta "확인일 2026-12-20 · 5분".
State B (empty, show as a second frame): friendly empty state with book icon in aqua-100 circle, title "첫 글을 준비하고 있어요", text "곧 올라올 글", and a list of 4 planned titles in gray with small "준비 중" pills: "35세에도 갈 수 있는 워홀 나라", "캐나다 IEC 2027 준비법", "일본 워홀 분기 접수 완벽 정리", "워홀 첫 달 필요한 돈 계산법". Below: email box "새 글이 올라오면 알림" (same as S9 form).
```

---

## S21 결과 공유 이미지

```
[공통 스타일]
Screen: two share image templates side by side, no app UI around them.
1) Instagram story 1080×1920: full aqua #9FE6F3 background, top small logo "워홀로그", lime round sticker rotated "내 워홀 나라", center a big white card (radius 32, floating shadow): large flag of Canada, "캐나다", huge navy number "93%", "조건 9개 중 8개 ✓", three mark rows "돈 ✓  언어 ✓  일 △". Below the card: navy text "나는 캐나다랑 93% 맞아!" and a small white pill "woholog.com에서 나도 해 보기". 
2) Link preview (OG) 1200×630: left half aqua with "나는 캐나다 93%!" in navy extra bold and logo; right half white with the same mini result card.
Design must stay readable when shrunk to a small preview.
```

---

## S22 필수 앱·추천 준비물 칸

```
[공통 스타일]
Screen: two content blocks used inside the country detail page and the checklist "출국 1주 전" step, shown stacked on a white page.
Block 1 "일본 가면 깔아야 할 앱" (heading with smartphone icon): category chips row "교통", "일자리", "집", "은행·송금", "중고거래", "정부·세금", "메신저". App rows: rounded square app icon placeholder, name "LINE", category tag "메신저", one gray line "현지 연락은 대부분 LINE으로 해요", external-link icon. Show 3 rows, then an empty-state variant for another country: "이 나라 앱 목록을 정리하고 있어요" with a small "♡ 원해요" pill.
Block 2 "추천 준비물" (heading with package icon) with a gray pill "광고" at the right of the heading: 4 cards in a row (2×2 on mobile) for "eSIM", "여행자 보험", "해외 송금", "항공권", each with icon in aqua-100 circle and text "추천 상품을 고르는 중이에요" (placeholder state). Under the block a small gray note: "이 링크로 구매하면 워홀로그가 수수료를 받을 수 있어요. 가격은 같아요."
```
