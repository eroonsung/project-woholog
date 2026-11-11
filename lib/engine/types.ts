/**
 * 적합도 엔진 타입. 엔진은 순수 함수만 쓴다: DB·화면·fetch를 모른다 (CLAUDE.md 규칙 1).
 * 나라 데이터와 설정값은 모두 함수 인자로 받는다. 원본 계산: docs/engine/fit_engine_v1.py (D-011).
 *
 * 값 이름은 Python의 한글 값을 영어 코드로 옮긴 것이다.
 *   wage 상/중/하/없음 = high/mid/low/none · price 낮음/중간/높음 = low/mid/high
 *   korean 많음/중간/적음 = many/mid/few · selection 무제한/선착순/추첨 = unlimited/first_come/lottery
 */

export type Mark = 'ok' | 'partial' | 'no'; // ✓ △ ✗
export type EnglishCountry = 'Y' | 'H' | 'N'; // 영어권 / 일부 / 아님
export type Wage = 'high' | 'mid' | 'low' | 'none';
export type Level3 = 'low' | 'mid' | 'high';
export type Selection = 'unlimited' | 'first_come' | 'lottery';
export type LongStay = 'Y' | 'P' | 'N'; // 2년 이상 가능 / 조건부 / 불가

/** 나라 1곳의 엔진 입력. 채우는 일은 adapter.ts(3단계)의 몫이다 (CLAUDE.md 6장). */
export interface EngineCountry {
  code: string;
  maxAge: number; // programs.age_max
  english: EnglishCountry;
  languages: string[]; // 일자리 언어(영어 제외)
  localReq: boolean; // job_language_required
  noFulltime: boolean;
  employerLimit: boolean; // employer_limit_months ≤ 3
  hard: boolean; // job_hard_note 있음
  wage: Wage;
  price: Level3 | null; // low = 물가 낮음
  korean: Level3 | null; // low = 한국인 적음
  studyMaxMonths: number | null; // null = 확인 중(계산 제외)
  longStay: LongStay;
  europe: boolean;
  nearKorea: boolean;
  selection: Selection;
  needMan: number; // 필요한 돈(만 원)
  twice: boolean; // max_participations ≥ 2
  farmForExtension: boolean; // 체류 연장에 농장 등 일이 필요한 나라(호주). 원본의 n=='호주' 자리
  /** 화면 문구에 들어갈 표시용 값. 점수에는 쓰지 않는다. */
  meta?: {
    repJob?: string | null;
    hardNote?: string | null;
    employerMonths?: number | null;
    longStayMonths?: number | null;
  };
}

export type EnglishSkill = 0 | 1 | 2 | 3; // Q7
export type JobId = 'cafe' | 'retail' | 'hotel' | 'farm' | 'office' | 'care'; // Q9 (아직 몰라요 = 빈 배열)
export type EarnNeed = 'must' | 'partly' | 'none'; // Q10
export type PriorityId =
  | 'money' | 'easy_job' | 'english' | 'career' | 'two_years' | 'europe'
  | 'low_cost' | 'sure_pick' | 'few_koreans' | 'many_koreans' | 'near_korea'; // scoring_config.priority_chips

/** 질문 12개의 답 중 엔진이 쓰는 것. 출국 시기(Q5)와 마음 이유는 점수에 쓰지 않는다. */
export interface Profile {
  age: number; // Q2
  visited: string[]; // Q4 나라 코드
  budgetMan: number; // Q6 (만 원)
  english: EnglishSkill; // Q7
  languages: string[]; // Q8
  jobs: JobId[]; // Q9
  earn: EarnNeed; // Q10
  studyMonths: number; // Q11 (0 = 안 다님)
  priorities: PriorityId[]; // Q12
  companion?: { age: number; visited: string[] }; // Q3
}

/** DB scoring_config 표의 key별 값과 같은 모양(seed_v1_1.sql). 없는 key는 defaults.ts가 채운다. */
export interface ScoringConfig {
  weights: { money: number; language: number; work: Record<EarnNeed, number>; study: number; priority_each: number };
  money_tolerance_krw: number;
  work_fail_cap_pct: number;
  low_result_pct: number;
  mark_values: Record<Mark, number>;
  priority_chips: PriorityId[];
  /** 아래는 DB 시드에 아직 없는 기준값. 시드에 넣을 때까지 defaults.ts가 값을 준다. */
  english_levels: { interview: number; work: number; basic_max: number };
  close_gap_pp: number; // 결과 카드: 1위와 이 %p 미만이면 "충분히 잘 맞아요" (SPEC 4.2)
  study_unlimited_months: number; // 이 값 이상이면 "기간 제한 없음"
  what_if_max_rows: number;
}

export type CoreItemId = 'money' | 'language' | 'work' | 'study';
export type ItemId = CoreItemId | PriorityId;
export type Badge = 'hard_to_live' | 'lottery';

export interface ScoreItem {
  kind: 'core' | 'priority';
  id: ItemId;
  weight: number;
  mark: Mark;
}

export interface ScoreRow {
  code: string;
  pct: number;
  okCount: number;
  itemCount: number;
  essential: number; // 동점 순서용(돈·언어·일 가중 점수)
  items: ScoreItem[];
  badges: Badge[];
}

export type BlockReason =
  | { kind: 'age'; maxAge: number }
  | { kind: 'visited' }
  | { kind: 'companion_age'; maxAge: number }
  | { kind: 'companion_visited' };

export interface BlockedCountry {
  code: string;
  reason: BlockReason;
}

export type ReasonParams = Record<string, string | number | string[] | null>;

export interface ReasonLine {
  mark: Mark;
  kind: 'core' | 'priority';
  itemId: ItemId;
  key: string; // 문구 키 (content/copy_ko.json, 5단계에서 추가)
  params: ReasonParams;
}
