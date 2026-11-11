import { describe, expect, it } from 'vitest';
import { t } from '@/lib/copy';
import { josa, withJosa } from '@/lib/josa';

describe('조사 고르기', () => {
  it('받침이 있으면 이/은/을/과, 없으면 가/는/를/와', () => {
    expect(josa('캐나다', '이/가')).toBe('가');
    expect(josa('일본', '이/가')).toBe('이');
    expect(josa('캐나다', '은/는')).toBe('는');
    expect(josa('일본', '은/는')).toBe('은');
    expect(josa('프랑스어', '을/를')).toBe('를');
    expect(josa('영국', '을/를')).toBe('을');
    expect(josa('영국', '와/과')).toBe('과');
    expect(josa('캐나다', '와/과')).toBe('와');
  });
  it('으로/로: 받침이 없거나 ㄹ이면 로', () => {
    expect(josa('일본', '으로/로')).toBe('으로');
    expect(josa('서울', '으로/로')).toBe('로');
    expect(josa('호주', '으로/로')).toBe('로');
  });
  it('한글이 아닌 글자로 끝나면 받침 없음으로 본다', () => {
    expect(josa('CAD', '이/가')).toBe('가');
    expect(josa('', '이/가')).toBe('가');
  });
  it('withJosa, 문구 안의 {이름:조사}', () => {
    expect(withJosa('일본', '은/는')).toBe('일본은');
    expect(t('result.heart.blocked', { country: '일본', reason: '나이 조건(만 30세까지)' })).toBe('일본은 지금 조건으로는 갈 수 없어요. (나이 조건(만 30세까지))');
    expect(t('result.heart.blocked', { country: '캐나다', reason: 'x' })).toContain('캐나다는 지금');
    expect(t('result.heart.close', { country: '일본', top: '캐나다', diff: 4 })).toBe('일본도 충분히 잘 맞아요. 1위 캐나다와 4%p 차이예요.');
    expect(t('result.heart.close', { country: '일본', top: '영국', diff: 4 })).toContain('영국과 4%p');
    expect(t('result.noHeart.headline', { country: '캐나다' })).toBe('캐나다가 가장 잘 맞아요');
    expect(t('reason.language.no.localRequired', { language: '프랑스어·독일어' })).toBe('인포센터가 프랑스어·독일어가 필요하다고 안내해요.');
  });
});
