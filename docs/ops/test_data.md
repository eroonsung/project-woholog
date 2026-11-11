# 운영 DB 테스트 데이터 기록

운영 DB에서 만든 테스트용 데이터를 여기에 적는다. 오픈 전에 `launch_checklist.md`의 "테스트 결과 일괄 삭제"로 지운다(삭제는 허락받고 실행, CLAUDE.md 규칙 17). 앞으로 운영에서 테스트 결과를 만들 때마다 한 줄 추가한다.

## quiz_results (결과 저장 테스트)

| 날짜(KST) | id | 만든 곳 | 내용 |
|---|---|---|---|
| 2026-11-11 | `660ceaf3-2a01-4d84-99a8-eec659dcfb92` | 로컬 서버(운영 DB 연결) | 4단계 확인: Yvonne 예시 답(A) |
| 2026-11-11 | `897f0cf2-72e5-4183-a87b-58de664ecdcf` | 운영 주소(project-woholog.vercel.app) | 4단계 확인: Yvonne 예시 답(A) |
| 2026-11-11 | `ed3501a2-8164-41cc-ba82-bdb1b8a446a6` | 운영 주소(project-woholog.vercel.app) | 서울 지역(icn1) 적용 후 저장 응답 시간 측정: Yvonne 예시 답(A) |

## 그 밖의 표
- `rate_limits`: 요청 제한 기록(IP 해시). 24시간이 지나면 다음 요청 때 자동으로 지워져서 따로 기록하지 않는다.
- `launch_subscribers`, `user_reports`, `feature_votes`: 테스트로 넣은 것이 있으면 여기에 적는다(지금은 없음).

## 삭제 방법(오픈 전, 허락 받고 실행)
```sql
-- 위 표의 id만 지운다 (id 목록을 확인한 뒤)
delete from quiz_results where id in (
  '660ceaf3-2a01-4d84-99a8-eec659dcfb92',
  '897f0cf2-72e5-4183-a87b-58de664ecdcf',
  'ed3501a2-8164-41cc-ba82-bdb1b8a446a6'
);
```
