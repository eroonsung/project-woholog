# 워홀로그 개인정보 동의문·처리방침 초안 v1 (2026-11-10)

> **초안이에요.** 개인정보보호위원회 「개인정보 처리방침 작성지침」(2025.4)의 필수 항목을 기준으로 썼지만, 법률 자문은 아니에요. 공개 전에 [개인정보보호 포털 처리방침 만들기](https://www.privacy.go.kr) 도구와 한 번 대조하고, 아래 `[ ]` 칸을 채워야 해요.

## 0. 공개 전에 채울 것
| 칸 | 할 일 |
|---|---|
| [운영자] | 사업자등록 전이면 개인 이름(예: 성OO). 등록하면 상호로 바꾼다. |
| [연락 메일] | 지금은 사업용 Gmail, 도메인을 사면 hello@woholog.com |
| [DB 지역] | Supabase 프로젝트를 만들 때 **서울(ap-northeast-2)** 을 고른다. 데이터가 한국에 저장되면 국외 이전 설명이 간단해진다. |
| [메일 발송 서비스] | 오픈 알림을 보낼 서비스(예: Resend, Stibee). 한국 서비스(Stibee 등)를 쓰면 국외 이전 항목에서 빠진다. |
| [분석 도구] | 쿠키를 안 쓰는 Vercel Web Analytics를 추천. Google Analytics를 쓰면 쿠키 안내와 국외 이전 항목을 추가해야 한다. |

운영 원칙 (처리방침과 실제가 같아야 해요)
- 이메일 외에는 아무것도 받지 않는다. 이름·전화번호·나이 입력 칸을 만들지 않는다.
- 알림 메일은 **1회만**, 제목에 서비스 이름을 넣는다. 다른 홍보 메일을 보내려면 광고성 정보 수신 동의를 따로 받아야 한다(정보통신망법 50조).
- 알림을 보낸 뒤 30일 안에 `launch_subscribers` 표를 비운다. 회원으로 옮길 때는 새로 동의를 받는다.
- 테스트 답변은 이름 없이 저장하고, 결과 링크를 아는 사람만 볼 수 있게 한다(이미 DB 함수로 구현됨).
- 요청 횟수 제한(`rate_limits`): IP는 `HMAC-SHA256(서버에만 있는 비밀 키, IP)` 해시로만 저장한다(원래 IP는 저장하지 않음, 4단계 구현). 24시간이 지난 기록은 다음 요청을 처리할 때 지운다(`pg_cron`은 쓰지 않음). 그래서 처리방침 문구는 "24시간이 지나면 삭제"로 쓴다. 비밀 키(`SUPABASE_SERVICE_ROLE_KEY`)를 바꾸면 해시 값이 달라진다(기존 기록과 이어지지 않을 뿐 문제 없음).

---

## 1. 수집 동의문 (이메일 신청 모달)

**[필수] 오픈 알림을 위한 개인정보 수집·이용 동의**

| 수집 항목 | 이용 목적 | 보관 기간 |
|---|---|---|
| 이메일 주소 | 커뮤니티 오픈 알림 1회 발송 | 알림 발송 후 30일 이내 파기 (오픈이 미뤄져도 최대 2027년 12월 31일까지) |

동의하지 않을 수 있으며, 동의하지 않아도 워홀로그의 다른 기능을 이용하는 데 제한이 없어요. 다만 오픈 알림은 받을 수 없어요. 만 14세 미만은 신청할 수 없어요.

☐ 위 내용을 확인했고 동의해요.

> 체크박스는 처음에 **비어 있어야** 하고, 체크해야 "알림 받기" 버튼이 켜진다. 서버에는 동의 시각(`consented_at`)과 동의문 버전(`consent_version = 'launch-v1'`)을 함께 저장한다.

---

## 2. 개인정보 처리방침 (한국어)

**워홀로그 개인정보 처리방침**
시행일: 2026년 12월 31일 · 버전 1.0

[운영자](이하 "워홀로그")는 「개인정보 보호법」에 따라 이용자의 개인정보를 보호하고 관련 고충을 빠르게 처리하기 위해 다음과 같이 처리방침을 둡니다.

### 1. 처리하는 개인정보와 목적
| 구분 | 항목 | 목적 | 근거 |
|---|---|---|---|
| 오픈 알림 신청 | 이메일 주소 | 커뮤니티 오픈 알림 1회 발송, 중복 신청 확인 | 이용자 동의 |
| To Korea 대기자 신청 | 이메일 주소 | To Korea 오픈 알림 1회 발송 | 이용자 동의 |
| 정보 제보 | 제보 내용(어느 나라·어느 화면인지 포함) | 틀린 정보 수정 | 이용자가 직접 입력 (이메일 등 연락처는 받지 않음) |
| 나라 적합도 테스트 | 테스트 답변(나이, 예산 범위, 언어 수준 등), 결과 | 결과 계산, 결과 링크 공유 | 이름·연락처와 연결하지 않으며, 개인을 알아볼 수 없는 형태로 저장 |
| 서비스 이용 중 요청 횟수 제한 | IP 주소를 서버에만 있는 비밀 값을 섞어 복원할 수 없게 바꾼 해시 값(원래 IP 주소는 저장하지 않음) | 과도한 요청·오용 방지 | 서비스 보호 |

워홀로그는 회원가입이 없으며, 위 항목 외의 개인정보를 받지 않아요.

### 2. 보관 기간과 파기
| 항목 | 보관 기간 |
|---|---|
| 오픈 알림 이메일 | 알림 발송 후 30일 이내 파기 (오픈이 미뤄져도 최대 2027년 12월 31일), 동의 철회 시 즉시 파기 |
| 제보 내용 | 처리 완료 후 1년 이내 삭제 |
| 테스트 답변·결과 | 저장 후 1년이 지나면 삭제 |
| 요청 횟수 제한 기록(IP 해시) | 저장 후 24시간이 지나면 삭제 |
| 접속 기록 | 호스팅 업체 기본 보관 기간(최대 [ ]일) |

전자 파일은 복구할 수 없는 방법으로 삭제해요. 종이로 받는 개인정보는 없어요.

### 3. 처리 위탁과 국외 이전
워홀로그는 서비스 운영을 위해 아래 업체에 처리를 맡겨요.

| 받는 자 | 맡기는 일 | 이전 국가·방법 | 이전 항목 | 보관 기간 |
|---|---|---|---|---|
| Supabase Inc. | 데이터베이스 보관 | 저장 위치 [대한민국(서울) 리전], 회사 소재지 미국, 네트워크 전송 | 이메일, 제보 내용, 테스트 답변 | 위 2번과 같음 |
| Vercel Inc. | 웹사이트 호스팅·접속 기록 | 미국 등, 네트워크 전송 | 접속 IP, 브라우저 정보 | 업체 기본 기간 |
| [메일 발송 서비스] | 오픈 알림 메일 발송 | [국가], 발송 시점에 네트워크 전송 | 이메일 | 발송 후 [ ]일 |

국외 이전을 원하지 않으면 오픈 알림을 신청하지 않거나, 신청 후 아래 연락처로 삭제를 요청할 수 있어요. 이 경우 알림을 받을 수 없어요.

### 4. 제3자 제공
워홀로그는 이용자의 개인정보를 제3자에게 제공하지 않아요. 법령에 따른 요청이 있을 때만 예외로 해요.

### 5. 자동으로 수집되는 정보
- 웹사이트 운영 중 접속 IP, 브라우저 종류, 접속 시각이 서버 기록으로 남아요.
- 결과 저장·정보 제보·오픈 알림 신청처럼 서버로 보내는 요청에는 이용 횟수를 제한하기 위해 IP 주소를 서버에만 있는 비밀 값을 섞어 복원할 수 없는 해시 값으로 바꿔요. 이 해시 값은 24시간이 지나면 삭제하고, 원래 IP 주소는 저장하지 않아요.
- 방문 통계는 [Vercel Web Analytics]로 확인하며, 개인을 알아볼 수 있는 쿠키를 쓰지 않아요.
- 테스트 진행 중 답변은 이용자의 브라우저(세션 저장소)에만 임시로 저장되고, 결과를 볼 때 서버로 보내요.
- 준비 중 기능의 "원해요"는 어떤 기능을 눌렀는지와 시각만 저장하고, 누가 눌렀는지는 저장하지 않아요. 같은 브라우저에서 중복으로 누르지 않도록 브라우저(로컬 저장소)에 표시만 남겨요.
- 체크리스트의 나라·출국 예정일·체크 상태는 이용자의 브라우저(로컬 저장소)에만 저장되고 서버로 보내지 않아요. 브라우저 데이터를 지우면 사라져요.

### 6. 이용자의 권리
이용자는 언제든 자신의 개인정보를 확인·정정·삭제하거나 처리 정지를 요청할 수 있어요. 아래 메일로 요청하면 10일 안에 처리하고 결과를 알려 드려요.

### 7. 안전 조치
- 데이터베이스 접근 권한을 운영자 1인으로 제한하고, 일반 이용자는 자신이 낸 정보를 다른 사람이 볼 수 없도록 접근 규칙(RLS)을 적용해요.
- 모든 통신은 암호화(HTTPS)해요.
- 관리 계정에는 2단계 인증을 사용해요.

### 8. 개인정보 보호책임자
- 책임자: [운영자 이름]
- 연락처: [연락 메일]

개인정보 침해 신고·상담은 아래 기관에도 할 수 있어요.
개인정보침해신고센터 (privacy.kisa.or.kr / 국번 없이 118), 개인정보분쟁조정위원회 (kopico.go.kr / 1833-6972), 대검찰청 (spo.go.kr / 국번 없이 1301), 경찰청 (ecrm.police.go.kr / 국번 없이 182)

### 9. 변경 안내
이 처리방침이 바뀌면 시행 7일 전에 웹사이트에 알려요. 이용자 권리에 중요한 변경은 30일 전에 알려요.
- v1.0 2026-12-31 최초 시행

---

## 3. Privacy Policy (English, short version)

**woholog Privacy Policy**
Effective: December 31, 2026 · Version 1.0

woholog is run by [Operator]. We collect as little as possible.

**What we collect and why**
- **Email address** (launch notice or To Korea waitlist sign-up): to send one email when the community opens. Deleted within 30 days after that email, and no later than December 31, 2027. Deleted immediately if you withdraw consent.
- **Report message**: to fix wrong information. We do not ask for contact details. Deleted within 1 year after we resolve it.
- **Quiz answers and results**: to calculate your result and let you share a link. Not linked to your name or contact details. Deleted after 1 year.
- **Server logs** (IP address, browser, time): kept by our hosting provider for security.
- **Request-rate limiting**: to prevent abuse we store only a one-way hash of your IP address, made with a secret value kept on our server (we do not store the IP address itself). Deleted after 24 hours.

**Who processes it**: Supabase Inc. (database, stored in [Seoul, Korea]), Vercel Inc. (hosting, USA), [Email provider] (sending the launch email, [country]). We do not sell or share your data with anyone else.

**Checklist**: Your checklist (country, departure date, checked items) is stored only in your browser and never sent to us.

**Feature votes**: When you tap "원해요" (I want this), we store only which feature and when, not who.

**Cookies**: We use [Vercel Web Analytics], which does not use tracking cookies.

**Your rights**: You can ask us to access, correct or delete your data at any time. Email [contact email] and we will respond within 10 days.

**Age**: Do not sign up if you are under 14.

**Contact**: [Operator name], [contact email]

**Changes**: We will post changes on this page at least 7 days before they take effect.
