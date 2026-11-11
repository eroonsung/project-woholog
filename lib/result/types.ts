import type { Badge, BlockReason, ItemId, ReasonLine, ScoreItem, WhatIfRow } from '@/lib/engine';

/**
 * quiz_results.result에 저장하는 결과(계산 당시의 스냅샷). 결과 화면(5단계)은 이 값을 그대로 보여 준다 — 화면에서 다시 계산하지 않는다.
 * 나라 데이터가 나중에 바뀌어도 저장된 결과는 그대로이고, `data_changed`로 "정보가 바뀌었어요"만 알린다(SPEC 4.1).
 */
export interface StoredRanked {
  code: string;
  pct: number;
  okCount: number;
  itemCount: number; // "확인 중" 조건은 뺀 조건 수
  badges: Badge[];
  items: ScoreItem[];
  lines: ReasonLine[]; // 조건 줄(✗ → △ → ✓), 문구 키 + 자리표시자 값
  /** 값이 없어 점수에서 뺀("확인 중") 조건. 이전에 저장된 결과에는 없을 수 있다 */
  unknown?: ItemId[];
}

/** 돈 항목 1개: 원래 금액·통화와 만 원 환산(환율이 없으면 man = null) */
export interface StoredMoney {
  amount: number;
  currency: string;
  man: number | null;
}

/** "현실 미리보기" 4줄에 쓰는 값(저장 당시 기준). 값이 없으면 null → 화면은 "확인 중" (SPEC 4.4) */
export interface StoredPreview {
  money: { needMan: number | null; proof: StoredMoney | null; fee: StoredMoney | null; health: StoredMoney | null; flightMan: number | null };
  job: { code: string; text: string } | null;
  /** krw = 원화 환산 시급(100원 단위), 환율이 없거나 이전에 저장된 결과에는 없음 → 외화만 보여 준다 (SPEC 0.3) */
  wage: { amount: number; currency: string; city: string; derived: boolean; krw?: number | null } | null; // derived = 월급 ÷ 월 근무 시간으로 구한 시급
  /** krwMan·krwMaxMan = 원화 환산 월세(만 원 단위, 범위면 최댓값도) */
  rent: { amount: number; max: number | null; currency: string; city: string; unit: 'month' | 'week'; krwMan?: number | null; krwMaxMan?: number | null } | null;
  next: { selection: 'unlimited' | 'first_come' | 'lottery'; quota: number | null; windows: { opensOn: string; closesOn: string | null; note: string | null }[] };
  fxDate: string | null; // 환율 기준일
}

export interface StoredCountry {
  nameKo: string;
  safetyLevel: string;
  moneyChecking: boolean; // 잔고 증명 금액이 숫자로 없어 필요한 돈이 "확인 중" (SPEC 4.3)
  needMan: number | null;
  preview?: StoredPreview; // 이전에 저장된 결과에는 없을 수 있다
  provenance: { publishers: string[]; verifiedAt: string | null; stale: boolean };
}

export interface StoredResult {
  v: 1;
  asOf: string; // 계산 기준일(KST)
  ranked: StoredRanked[]; // 갈 수 있는 나라, 엔진이 정한 순서
  blocked: { code: string; reason: BlockReason }[]; // 지금은 갈 수 없는 나라
  whatIf: Record<string, WhatIfRow[]>; // "이렇게 바꾸면": 낮은 %(low_result_pct 미만) 나라만
  countries: Record<string, StoredCountry>;
  comingSoon: { code: string; nameKo: string }[]; // 협정 미발효 등 "곧 열려요"
  config: { lowResultPct: number; closeGapPp: number; workFailCapPct?: number }; // 결과 카드 기준(SPEC 4.2)
}
