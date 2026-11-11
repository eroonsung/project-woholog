import { languageMark, priorityMark } from './marks';
import type { BlockedCountry, EngineCountry, PriorityId, Profile, ScoringConfig } from './types';

/**
 * 후보 나라: Q2~Q4 답(나이·다녀온 나라·동행자)으로 갈 수 있는 나라 (SPEC.md 3.2).
 * 결과의 "갈 수 없는 나라"와 Q8·Q12 칩 계산이 모두 이 함수를 쓴다.
 * 입력 순서를 그대로 지킨다(동점 순서가 여기서 정해진다).
 */
export function splitCandidates(
  countries: readonly EngineCountry[],
  p: Pick<Profile, 'age' | 'visited' | 'companion'>,
): { candidates: EngineCountry[]; blocked: BlockedCountry[] } {
  const candidates: EngineCountry[] = [];
  const blocked: BlockedCountry[] = [];
  for (const c of countries) {
    const alreadyVisited = (list: string[]) => list.includes(c.code) && !c.twice;
    if (p.age > c.maxAge) blocked.push({ code: c.code, reason: { kind: 'age', maxAge: c.maxAge } });
    else if (alreadyVisited(p.visited)) blocked.push({ code: c.code, reason: { kind: 'visited' } });
    else if (p.companion && p.companion.age > c.maxAge)
      blocked.push({ code: c.code, reason: { kind: 'companion_age', maxAge: c.maxAge } });
    else if (p.companion && alreadyVisited(p.companion.visited))
      blocked.push({ code: c.code, reason: { kind: 'companion_visited' } });
    else candidates.push(c);
  }
  return { candidates, blocked };
}

/** 지원 가능한 최대 만 나이. 나이 초과 화면의 `{maxAge}` (D-070). 호출하는 쪽이 active 나라만 넘긴다. */
export function maxAgeOf(countries: readonly EngineCountry[]): number | null {
  return countries.length ? Math.max(...countries.map((c) => c.maxAge)) : null;
}

/** Q8 칩: 후보 나라의 일자리 언어(영어 제외), 중복 없이 나온 순서대로. 빈 배열이면 Q8을 건너뛴다. */
export function candidateLanguages(candidates: readonly EngineCountry[]): string[] {
  return [...new Set(candidates.flatMap((c) => c.languages))];
}

/**
 * Q12 칩: 후보 나라들의 표시(✓△✗)가 모두 같은 칩은 숨긴다. 값이 없는 나라는 비교에서 뺀다.
 * Q7·Q8·Q9 답이 필요하다(일자리·커리어 칩이 언어 판정에 기대므로).
 */
export function visiblePriorities(
  candidates: readonly EngineCountry[],
  p: Profile,
  cfg: ScoringConfig,
): PriorityId[] {
  return cfg.priority_chips.filter((id) => {
    const marks = new Set(
      candidates.flatMap((c) => {
        const m = priorityMark(id, c, p, languageMark(c, p, cfg));
        return m === null ? [] : [m];
      }),
    );
    return marks.size > 1;
  });
}
