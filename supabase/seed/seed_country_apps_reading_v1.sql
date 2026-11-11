-- 일본어·중국어 이름 앱의 note_ko 앞에 한글 읽기를 붙인다 (D-130).
-- seed_country_apps_v1.sql은 on conflict do nothing이라 이미 들어간 행은 안 바뀌므로 UPDATE로 따로 적용한다.
-- 여러 번 실행해도 같은 결과(이미 붙어 있으면 건너뜀). 운영 적용은 허락 후.
update country_apps set note_ko = '야후 노리카에안나이 · ' || note_ko where country='JP' and name='Yahoo!乗換案内' and note_ko not like '야후%';
update country_apps set note_ko = '타운워크 · ' || note_ko where country='JP' and name='タウンワーク' and note_ko not like '타운워크%';
update country_apps set note_ko = '요우요우카 · ' || note_ko where country='TW' and name='悠遊卡 EasyCard' and note_ko not like '요우요우카%';
update country_apps set note_ko = '타이완 가오톄 · ' || note_ko where country='TW' and name='台灣高鐵 T Express' and note_ko not like '타이완%';
update country_apps set note_ko = '591 쭈우왕 · ' || note_ko where country='TW' and name='591租屋網' and note_ko not like '591 쭈우왕%';
update country_apps set note_ko = '104 런리인항 · ' || note_ko where country='TW' and name='104人力銀行' and note_ko not like '104 런리인항%';
