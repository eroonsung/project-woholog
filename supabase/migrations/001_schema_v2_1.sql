-- =====================================================================
-- 워홀로그 DB 스키마 v2.1 (Supabase / PostgreSQL 15+)  — v2.1: country_stats에 value_max·note 추가
-- 1인 운영용. 원칙:
--   1) 사실은 DB에, 계산은 코드에
--   2) 값 하나 = 출처 하나 + 확인일 하나. 덮어쓰지 않고 valid_to로 이력 보존
--   3) 문구에 숫자를 쓰지 않고 {fact_key}로 사실 표를 불러온다
--   4) 사실이 바뀌면 그 값을 쓰는 체크리스트·서류·가이드가 자동으로 "검토 필요"가 된다
--   5) 모든 변경은 change_log에 자동 기록
-- v1 대비: fact_keys(오타 방지), 현재 값 1개 보장, 체크리스트·서류·앱·가이드·오픈 알림 테이블 추가,
--          자리표시자 검증, 범용 변경 기록 트리거, RLS 전면 적용, 결과 조회 함수
-- =====================================================================

-- ---------- 공통: 변경 기록 ----------
create table change_log (
  id          bigint generated always as identity primary key,
  table_name  text not null,
  row_id      text not null,
  action      text not null check (action in ('INSERT','UPDATE','DELETE')),
  old_value   jsonb,
  new_value   jsonb,
  reason      text,                                     -- set_config('app.change_reason', '...', true)로 전달
  changed_at  timestamptz not null default now(),
  changed_by  uuid default auth.uid()
);

create or replace function log_change() returns trigger language plpgsql security definer set search_path = public as $$
declare
  j jsonb := coalesce(to_jsonb(new), to_jsonb(old));
begin
  insert into change_log(table_name, row_id, action, old_value, new_value, reason)
  values (tg_table_name,
          coalesce(j->>'id', j->>'key', j->>'code', '?'),
          tg_op,
          case when tg_op = 'INSERT' then null else to_jsonb(old) end,
          case when tg_op = 'DELETE' then null else to_jsonb(new) end,
          nullif(current_setting('app.change_reason', true), ''));
  return coalesce(new, old);
end $$;

create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

-- ---------- 1. 나라 ----------
create table countries (
  code          text primary key check (code ~ '^[A-Z]{2}$'),   -- ISO 3166-1 alpha-2
  name_ko       text not null,
  name_en       text not null,
  region        text not null check (region in ('asia','oceania','north_america','south_america','europe','middle_east')),
  english       text not null check (english in ('Y','H','N')),   -- Y 영어권, H 일부(홍콩), N 비영어권
  languages     text[] not null default '{}',
  in_europe     boolean not null default false,
  near_korea    boolean not null default false,
  safety_level  text not null default 'normal' check (safety_level in ('normal','caution','avoid')),
  safety_note   text,
  updated_at    timestamptz not null default now()
);

-- ---------- 2. 출처 ----------
create table sources (
  id              bigint generated always as identity primary key,
  url             text not null unique check (url ~ '^https?://'),
  publisher       text not null,
  grade           text not null check (grade in ('official','press','commercial','other')),
  watch           boolean not null default false,
  content_hash    text,
  last_checked_at timestamptz,
  last_changed_at timestamptz,
  note            text
);

-- ---------- 3. 프로그램 (출발국 → 도착국 × 비자) ----------
create table programs (
  id                  bigint generated always as identity primary key,
  origin              text not null references countries(code),
  destination         text not null references countries(code),
  kind                text not null default 'working_holiday' check (kind in ('working_holiday','student','work','nomad')),
  status              text not null check (status in ('active','pending','suspended')),
  age_min             int  not null check (age_min between 16 and 40),
  age_max             int  not null check (age_max between 16 and 40),
  age_note            text,
  annual_quota        int  check (annual_quota is null or annual_quota > 0),   -- null = 제한 없음
  selection           text not null check (selection in ('unlimited','first_come','lottery')),
  max_participations  int  not null default 1 check (max_participations between 1 and 5),
  stay_months         int  not null check (stay_months between 1 and 60),
  long_stay_months    int  check (long_stay_months is null or long_stay_months >= stay_months),
  long_stay_condition text,
  updated_at          timestamptz not null default now(),
  check (age_min <= age_max),
  check (origin <> destination),
  unique (origin, destination, kind)
);

-- ---------- 4. 사실 항목 사전 (오타 방지 + 문서화) ----------
create table fact_keys (
  key          text primary key check (key ~ '^[a-z][a-z0-9_]*$'),
  label_ko     text not null,
  value_type   text not null check (value_type in ('money','number','months','boolean','text')),
  description  text
);

-- ---------- 5. 규칙 값 (핵심) ----------
create table program_facts (
  id           bigint generated always as identity primary key,
  program_id   bigint not null references programs(id) on delete cascade,
  key          text not null references fact_keys(key),
  value_num    numeric,
  value_text   text,
  currency     text check (currency is null or currency ~ '^[A-Z]{3}$'),
  unit         text,
  source_id    bigint references sources(id),
  verified_at  date not null,
  valid_from   date,
  valid_to     date,                                   -- null = 현재 값
  note         text,
  check (value_num is not null or value_text is not null),
  check (valid_to is null or valid_from is null or valid_to >= valid_from)
);
-- 같은 프로그램·항목의 "현재 값"은 하나만
create unique index program_facts_one_current on program_facts (program_id, key) where valid_to is null;

-- 금액 항목은 통화 필수
create or replace function check_fact_type() returns trigger language plpgsql as $$
declare t text;
begin
  select value_type into t from fact_keys where key = new.key;
  if t = 'money' and (new.value_num is null or new.currency is null) then
    raise exception '금액 항목(%)은 value_num과 currency가 필요해요', new.key;
  end if;
  if t in ('number','months') and new.value_num is null then
    raise exception '숫자 항목(%)은 value_num이 필요해요', new.key;
  end if;
  return new;
end $$;
create trigger trg_facts_type before insert or update on program_facts for each row execute function check_fact_type();

-- ---------- 6. 접수 기간 ----------
create table application_windows (
  id          bigint generated always as identity primary key,
  program_id  bigint not null references programs(id) on delete cascade,
  opens_on    date not null,
  closes_on   date,                                    -- null = 소진 시까지
  note        text,
  source_id   bigint references sources(id),
  verified_at date not null,
  check (closes_on is null or closes_on >= opens_on)
);

-- ---------- 7. 나라·도시 통계 ----------
create table country_stats (
  id          bigint generated always as identity primary key,
  country     text not null references countries(code),
  city        text not null default '',                -- '' = 나라 전체
  metric      text not null check (metric in ('min_wage_hourly','min_wage_monthly','price_level_kr100','korean_population','rent_month','rent_week')),
  value       numeric not null check (value >= 0),
  value_max   numeric,                                 -- 범위일 때 최댓값 (예: 셰어 주당 200~400)
  currency    text check (currency is null or currency ~ '^[A-Z]{3}$'),
  as_of       date not null,
  source_id   bigint references sources(id),
  verified_at date not null,
  valid_to    date,
  note        text,
  check (value_max is null or value_max >= value)
);
create unique index country_stats_one_current on country_stats (country, city, metric) where valid_to is null;

-- ---------- 8. 대표 일자리 (질문 9번 칩 코드) ----------
create table job_types (
  id          bigint generated always as identity primary key,
  country     text not null references countries(code),
  job_code    text not null check (job_code in ('cafe','retail','hotel','farm','office','care')),
  description_ko text not null,
  description_en text,
  language    text,
  source_id   bigint references sources(id),
  verified_at date not null,
  unique (country, job_code)
);

-- ---------- 9. 환율·항공권 ----------
create table exchange_rates (
  currency      text not null check (currency ~ '^[A-Z]{3}$'),
  krw_per_unit  numeric not null check (krw_per_unit > 0),
  rate_date     date not null,
  source        text not null default 'api',
  primary key (currency, rate_date)
);

create table flight_estimates (
  region      text primary key check (region in ('asia','oceania','north_america','south_america','europe','middle_east')),
  krw         numeric not null check (krw > 0),
  as_of       date not null
);

-- ---------- 10. 계산 설정 ----------
create table scoring_config (
  key         text primary key,
  value       jsonb not null,
  version     int not null default 1,
  updated_at  timestamptz not null default now()
);

-- ---------- 11. 콘텐츠: 자리표시자 검증 + 검토 필요 표시 ----------
-- 문구 안의 {key}가 fact_keys에 있는지 검사 (오타·삭제된 항목 방지)
create or replace function check_placeholders() returns trigger language plpgsql as $$
declare
  txt text := coalesce(to_jsonb(new)->>'title_ko','') || ' ' || coalesce(to_jsonb(new)->>'body_ko','') || ' ' ||
              coalesce(to_jsonb(new)->>'title_en','') || ' ' || coalesce(to_jsonb(new)->>'body_en','');
  k text;
begin
  for k in select (regexp_matches(txt, '\{([a-z][a-z0-9_]*)\}', 'g'))[1] loop
    if not exists (select 1 from fact_keys where key = k) then
      raise exception '문구의 {%}는 fact_keys에 없는 항목이에요', k;
    end if;
  end loop;
  return new;
end $$;

-- 12. D-day 체크리스트
create table checklist_items (
  id            bigint generated always as identity primary key,
  program_id    bigint references programs(id) on delete cascade,   -- null = 모든 나라 공통 (예: 여권)
  phase         text not null check (phase in ('decide','apply','prepare','depart','arrive','during','return')),
  days_offset   int check (days_offset between -365 and 400),         -- 출국일 기준 (D-90 = -90)
  sort_order    int not null default 0,
  title_ko      text not null,
  body_ko       text,
  title_en      text,
  body_en       text,
  depends_on    bigint references checklist_items(id),
  source_id     bigint references sources(id),
  verified_at   date not null,
  active        boolean not null default true,
  needs_review  boolean not null default false,
  updated_at    timestamptz not null default now(),
  check (depends_on is null or depends_on <> id)
);

-- 13. 비자 서류
create table required_documents (
  id                   bigint generated always as identity primary key,
  program_id           bigint not null references programs(id) on delete cascade,
  sort_order           int not null default 0,
  title_ko             text not null,
  body_ko              text,
  title_en             text,
  body_en              text,
  issuer               text,                       -- 발급처
  max_age_days         int check (max_age_days is null or max_age_days > 0),   -- 발급 후 유효 일수
  translation_required boolean not null default false,
  apostille_required   boolean not null default false,
  source_id            bigint references sources(id),
  verified_at          date not null,
  needs_review         boolean not null default false,
  updated_at           timestamptz not null default now()
);

-- 14. 나라별 필수 앱
create table country_apps (
  id          bigint generated always as identity primary key,
  country     text not null references countries(code),
  name        text not null,
  category    text not null check (category in ('transport','bank','telecom','job','housing','map','life','safety')),
  url         text check (url is null or url ~ '^https?://'),
  note_ko     text,
  note_en     text,
  verified_at date not null,
  active      boolean not null default true,
  unique (country, name)
);

-- 15. 가이드 글
create table guides (
  id            bigint generated always as identity primary key,
  slug          text not null unique check (slug ~ '^[a-z0-9-]+$'),
  country       text references countries(code),
  program_id    bigint references programs(id) on delete set null,
  title_ko      text not null,
  body_ko       text not null,                      -- 마크다운 + {fact_key}
  title_en      text,
  body_en       text,
  status        text not null default 'draft' check (status in ('draft','published','archived')),
  reviewed_at   date,
  needs_review  boolean not null default false,
  updated_at    timestamptz not null default now()
);

create trigger trg_ck_placeholders  before insert or update on checklist_items    for each row execute function check_placeholders();
create trigger trg_doc_placeholders before insert or update on required_documents for each row execute function check_placeholders();
create trigger trg_gd_placeholders  before insert or update on guides             for each row execute function check_placeholders();

-- 사실 값이 바뀌면 그 값을 쓰는 콘텐츠를 "검토 필요"로 표시
create or replace function flag_dependent_content() returns trigger language plpgsql security definer set search_path = public as $$
declare
  k   text := coalesce(new.key, old.key);
  pid bigint := coalesce(new.program_id, old.program_id);
  pat text := '%{' || k || '}%';
begin
  update checklist_items set needs_review = true
   where (program_id = pid or program_id is null)
     and (coalesce(title_ko,'') || coalesce(body_ko,'') || coalesce(title_en,'') || coalesce(body_en,'')) like pat;
  update required_documents set needs_review = true
   where program_id = pid
     and (coalesce(title_ko,'') || coalesce(body_ko,'') || coalesce(title_en,'') || coalesce(body_en,'')) like pat;
  update guides set needs_review = true
   where (program_id = pid or program_id is null)
     and (coalesce(title_ko,'') || coalesce(body_ko,'') || coalesce(title_en,'') || coalesce(body_en,'')) like pat;
  return coalesce(new, old);
end $$;
create trigger trg_facts_flag after insert or update or delete on program_facts for each row execute function flag_dependent_content();

-- ---------- 16. 사용자 관련 ----------
-- 오픈 알림 신청 (12월 MVP). 개인정보: 이메일만, 동의 버전·시각 기록, 수신거부 가능
create table launch_subscribers (
  id               bigint generated always as identity primary key,
  email            text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 254),
  locale           text not null default 'ko' check (locale in ('ko','en')),
  section          text not null default 'from_korea' check (section in ('from_korea','to_korea')),
  consent_version  text not null,
  consented_at     timestamptz not null default now(),
  unsubscribed_at  timestamptz
);
create unique index launch_subscribers_email on launch_subscribers (lower(email), section);

create table user_reports (
  id          bigint generated always as identity primary key,
  country     text references countries(code),
  page        text check (length(page) <= 300),
  message     text not null check (length(message) between 1 and 2000),
  status      text not null default 'new' check (status in ('new','checking','fixed','no_change')),
  created_at  timestamptz not null default now()
);

create table quiz_results (
  id            uuid primary key default gen_random_uuid(),
  answers       jsonb not null,
  result        jsonb not null,
  data_version  bigint not null,                    -- 계산 당시 change_log 최대 id
  created_at    timestamptz not null default now()
);

-- 로그인 도입 후 사용 (커뮤니티 오픈 때)
create table user_checklist_progress (
  user_id     uuid not null references auth.users(id) on delete cascade,
  item_id     bigint not null references checklist_items(id) on delete cascade,
  done_at     timestamptz not null default now(),
  primary key (user_id, item_id)
);

-- ---------- 변경 기록·updated_at 트리거 ----------
create trigger trg_log_countries   after insert or update or delete on countries           for each row execute function log_change();
create trigger trg_log_programs    after insert or update or delete on programs            for each row execute function log_change();
create trigger trg_log_facts       after insert or update or delete on program_facts       for each row execute function log_change();
create trigger trg_log_windows     after insert or update or delete on application_windows for each row execute function log_change();
create trigger trg_log_stats       after insert or update or delete on country_stats       for each row execute function log_change();
create trigger trg_log_jobs        after insert or update or delete on job_types           for each row execute function log_change();
create trigger trg_log_config      after insert or update or delete on scoring_config      for each row execute function log_change();
create trigger trg_log_checklist   after insert or update or delete on checklist_items     for each row execute function log_change();
create trigger trg_log_docs        after insert or update or delete on required_documents  for each row execute function log_change();
create trigger trg_log_apps        after insert or update or delete on country_apps        for each row execute function log_change();
create trigger trg_log_guides      after insert or update or delete on guides              for each row execute function log_change();

create trigger trg_upd_countries before update on countries          for each row execute function touch_updated_at();
create trigger trg_upd_programs  before update on programs           for each row execute function touch_updated_at();
create trigger trg_upd_config    before update on scoring_config     for each row execute function touch_updated_at();
create trigger trg_upd_checklist before update on checklist_items    for each row execute function touch_updated_at();
create trigger trg_upd_docs      before update on required_documents for each row execute function touch_updated_at();
create trigger trg_upd_guides    before update on guides             for each row execute function touch_updated_at();

-- ---------- 운영용 뷰 (관리자만) ----------
-- 오래된 값: 확인일 90일 경과
create view stale_items with (security_invoker = true) as
  select 'program_facts' as source, p.destination as country, f.key as item, f.verified_at, current_date - f.verified_at as days_old
    from program_facts f join programs p on p.id = f.program_id where f.valid_to is null
  union all
  select 'country_stats', s.country, s.metric || coalesce(nullif(':' || s.city, ':'), ''), s.verified_at, current_date - s.verified_at
    from country_stats s where s.valid_to is null
  union all
  select 'checklist_items', coalesce(p.destination, 'ALL'), c.title_ko, c.verified_at, current_date - c.verified_at
    from checklist_items c left join programs p on p.id = c.program_id where c.active
  union all
  select 'required_documents', p.destination, d.title_ko, d.verified_at, current_date - d.verified_at
    from required_documents d join programs p on p.id = d.program_id
  union all
  select 'application_windows', p.destination, coalesce(w.note, '접수 기간'), w.verified_at, current_date - w.verified_at
    from application_windows w join programs p on p.id = w.program_id where coalesce(w.closes_on, w.opens_on) >= current_date;

-- 이번 주 할 일 한 화면: 오래된 값 + 검토 필요 콘텐츠 + 새 제보 + 바뀐 출처
create view admin_todo with (security_invoker = true) as
  select 'stale' as kind, source || ' / ' || country || ' / ' || item as what, days_old::text as detail from stale_items where days_old > 90
  union all select 'review', 'checklist / ' || title_ko, '' from checklist_items where needs_review
  union all select 'review', 'document / ' || title_ko, '' from required_documents where needs_review
  union all select 'review', 'guide / ' || title_ko, '' from guides where needs_review
  union all select 'report', coalesce(country, '-') || ' / ' || left(message, 80), created_at::date::text from user_reports where status = 'new'
  union all select 'source_changed', url, last_changed_at::date::text from sources where watch and last_changed_at > coalesce(last_checked_at - interval '1 second', '-infinity');

-- 현재 데이터 버전 (공유 링크의 결과가 그 뒤 바뀌었는지 비교용)
create or replace function current_data_version() returns bigint language sql stable security definer set search_path = public as
$$ select coalesce(max(id), 0) from change_log $$;

-- 공유 링크로 결과 하나만 조회 (전체 목록 조회는 막음)
create or replace function get_quiz_result(result_id uuid)
returns table (answers jsonb, result jsonb, data_version bigint, created_at timestamptz, data_changed boolean)
language sql stable security definer set search_path = public as $$
  select q.answers, q.result, q.data_version, q.created_at, q.data_version < current_data_version()
  from quiz_results q where q.id = result_id
$$;

-- ---------- 보안 (RLS) ----------
-- 공개 읽기: 서비스 화면에 필요한 사실·콘텐츠. 쓰기: 관리자(service_role / Supabase 대시보드)만
do $$
declare t text;
begin
  foreach t in array array['countries','sources','programs','fact_keys','program_facts','application_windows',
                           'country_stats','job_types','exchange_rates','flight_estimates','scoring_config',
                           'checklist_items','required_documents','country_apps','guides'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "public read" on %I for select using (true)', t);
  end loop;
end $$;
-- 가이드는 공개된 글만
drop policy "public read" on guides;
create policy "public read published" on guides for select using (status = 'published');

-- 관리 전용 (공개 정책 없음 = 익명 접근 불가)
alter table change_log enable row level security;

-- 익명은 넣기만 가능
alter table launch_subscribers enable row level security;
create policy "anyone can subscribe" on launch_subscribers for insert with check (unsubscribed_at is null);
alter table user_reports enable row level security;
create policy "anyone can report" on user_reports for insert with check (status = 'new');
alter table quiz_results enable row level security;
create policy "anyone can save result" on quiz_results for insert with check (true);

-- 로그인 사용자는 자기 진행 상황만
alter table user_checklist_progress enable row level security;
create policy "own progress" on user_checklist_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());

grant execute on function get_quiz_result(uuid) to anon, authenticated;
grant execute on function current_data_version() to anon, authenticated;
