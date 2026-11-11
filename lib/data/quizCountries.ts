import type { EngineCountry } from '@/lib/engine';
import { COUNTRIES } from '@/tests/fixtures/countries_v1';
import { COUNTRY_DISPLAY, type Region } from '@/tests/fixtures/country_display_v1';

/**
 * 질문 화면이 쓰는 나라 목록. 화면은 이 함수만 부른다.
 *
 * TODO(3단계): 지금은 DB 대신 tests/fixtures의 고정 데이터를 쓴다(CLAUDE.md 규칙 2의 예외, 2단계 한정).
 * 3단계에서 이 함수 안만 `lib/data/queries.ts` + `adapter.ts`로 바꾼다. 화면 코드는 고치지 않는다.
 *   - engine: adapter.ts가 만든 active 프로그램 28개
 *   - nameKo·region·flag·safety: countries 표(name_ko, region, safety_level)
 *   - 곧 열려요(핀란드)는 Q1·Q4 칩에서 뺀다
 */
export interface QuizCountry {
  code: string;
  nameKo: string;
  region: Region;
  flag: string;
  safety: boolean;
  engine: EngineCountry;
}

export function getQuizCountries(): QuizCountry[] {
  return COUNTRY_DISPLAY.map((display) => {
    const country = COUNTRIES.find((c) => c.code === display.code);
    if (!country) throw new Error(`나라 데이터가 없어요: ${display.code}`);
    const { nameKo, ...engine } = country;
    return { code: display.code, nameKo, region: display.region, flag: display.flag, safety: display.safety, engine };
  });
}
