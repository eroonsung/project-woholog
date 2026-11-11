import type { Badge, BlockReason, ReasonLine, ScoreItem, WhatIfRow } from '@/lib/engine';

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
}

export interface StoredCountry {
  nameKo: string;
  safetyLevel: string;
  moneyChecking: boolean; // 잔고 증명 금액이 숫자로 없어 필요한 돈이 "확인 중" (SPEC 4.3)
  needMan: number | null;
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
  config: { lowResultPct: number; closeGapPp: number }; // 결과 카드 기준(SPEC 4.2)
}
