import { adaptRows } from '@/lib/engine/adapter';
import type { EngineCountry, ScoringConfig } from '@/lib/engine';
import { todayKst } from '@/lib/format';
import { fetchAdapterRows } from './queries';

/** 질문 화면이 쓰는 나라 목록(DB → adapter). 화면은 이 함수만 부른다. */
export interface QuizCountry {
  code: string;
  nameKo: string;
  region: string;
  /** countries.safety_level이 caution/avoid인 나라 */
  safety: boolean;
  engine: EngineCountry;
}

export interface QuizData {
  countries: QuizCountry[]; // active 프로그램만 (가나다 순)
  /** active 프로그램 age_min 최솟값. "워킹홀리데이는 만 {minAge}세부터" 문구 */
  minAge: number;
  config: ScoringConfig;
}

export async function getQuizData(): Promise<QuizData> {
  const result = adaptRows(await fetchAdapterRows(), { asOf: todayKst() });
  if (result.warnings.length > 0) console.warn('[adapter]', result.warnings.join(' | '));
  if (result.minAge === null) throw new Error('active 프로그램이 없어요');
  return {
    countries: result.active.map((a) => ({
      code: a.code, nameKo: a.nameKo, region: a.region, safety: a.safetyLevel !== 'normal', engine: a.engine,
    })),
    minAge: result.minAge,
    config: result.config,
  };
}
