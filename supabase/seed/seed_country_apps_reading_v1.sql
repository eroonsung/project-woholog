-- 일본어·중국어 이름 앱의 note_ko에 한글 뜻을 붙인다 (D-130, 발음 대신 뜻이 보이게).
-- seed_country_apps_v1.sql은 on conflict do nothing이라 이미 들어간 행은 안 바뀌므로 UPDATE로 따로 적용한다.
-- 값을 통째로 지정하므로 여러 번 실행해도 결과가 같다.
begin;
update country_apps set note_ko = '야후 환승안내 · 전철 환승·시간표 검색' where country = 'JP' and name = 'Yahoo!乗換案内';
update country_apps set note_ko = '타운워크(아르바이트 구인)' where country = 'JP' and name = 'タウンワーク';
update country_apps set note_ko = '이지카드(유유카) · 교통카드 (편의점 결제도 돼요)' where country = 'TW' and name = '悠遊卡 EasyCard';
update country_apps set note_ko = '대만 고속철도 · 고속철도 예매' where country = 'TW' and name = '台灣高鐵 T Express';
update country_apps set note_ko = '591 방 구하기 사이트' where country = 'TW' and name = '591租屋網';
update country_apps set note_ko = '104 구인 사이트' where country = 'TW' and name = '104人力銀行';
commit;
