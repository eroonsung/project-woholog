import { describe, expect, it } from 'vitest';
import { q4Help } from '@/components/quiz/QuestionsA';
import { popularFirst, POPULAR_CODES } from '@/lib/popular';

const c = (nameKo: string, twice: boolean) => ({ nameKo, engine: { twice } }) as never;

describe('Q4 설명 (D-130)', () => {
  it('두 번 갈 수 있는 나라 이름을 DB 값으로 만든다', () => {
    const s = q4Help([c('캐나다', true), c('독일', false), c('일본', true)]);
    expect(s).toContain('캐나다·일본은');
    expect(s).not.toContain('독일');
  });
  it('두 번 가는 나라가 없으면 한 번만 가능하다고만 쓴다', () => {
    expect(q4Help([c('독일', false)])).toBe('워홀은 나라마다 한 번만 갈 수 있어요.');
  });
});

describe('많이 찾는 나라 먼저 (D-130)', () => {
  it('많이 찾는 나라 → 가나다순', () => {
    const items = [{ code: 'DE', nameKo: '독일' }, { code: 'CA', nameKo: '캐나다' }, { code: 'AU', nameKo: '호주' }, { code: 'FR', nameKo: '프랑스' }, { code: 'JP', nameKo: '일본' }, { code: 'GB', nameKo: '영국' }];
    const out = popularFirst(items).map((i) => i.code);
    expect(out.slice(0, POPULAR_CODES.length)).toEqual(['AU', 'GB', 'JP', 'CA']);
    expect(out.slice(4)).toEqual(['DE', 'FR']);
  });
});
