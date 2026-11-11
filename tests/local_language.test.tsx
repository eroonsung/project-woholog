import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { QuestionPriority } from '@/components/quiz/QuestionsB';
import { ResultCard } from '@/components/result/ResultCard';
import { buildReasons, DEFAULT_CONFIG, scoreAll, splitCandidates, visiblePriorities, adaptRows } from '@/lib/engine';
import { priorityMark } from '@/lib/engine/marks';
import type { DbRows, Mark, Profile } from '@/lib/engine';
import { pruneAnswers, priorityChips } from '@/lib/quiz/steps';
import { validateAnswers } from '@/lib/quiz/validate';
import type { Answers } from '@/lib/quiz/types';
import { pickCard } from '@/lib/result/card';
import { computeResult } from '@/lib/result/compute';
import { reasonText } from '@/lib/result/text';
import copy from '@/content/copy_ko.json';
import snapshot from './fixtures/db_rows_v1.json';
import { COUNTRIES } from './fixtures/countries_v1';
import { PERSONAS } from './fixtures/personas';
import { PERSONA_ANSWERS } from './fixtures/persona_answers';

/** 5.1단계 (D-111): Q12 "현지 언어 배우기" 칩 */
const rows = snapshot as unknown as DbRows;
const data = adaptRows(rows, { asOf: '2026-11-11' });
const ctx = { countries: data.active.map((a) => a.engine), config: data.config, minAge: data.minAge!, maxAge: data.maxAge! };
const G = PERSONAS[6]!;
const A = PERSONA_ANSWERS[0]!.answers;
const markOf = (code: string): Mark | null => {
  const c = COUNTRIES.find((x) => x.code === code)!;
  return priorityMark('local_language', c, G.profile, 'no');
};

describe('나라별 표시 (영어 값·현지 언어 값으로만 판단)', () => {
  it('eng=N → ✓ (22개국), eng=H → △(홍콩), eng=Y+언어 있음 → △(캐나다), eng=Y+언어 없음 → ✗(호주·뉴질랜드·영국·아일랜드)', () => {
    const by = (m: Mark) => COUNTRIES.filter((c) => markOf(c.code) === m).map((c) => c.nameKo);
    expect(by('ok')).toHaveLength(22);
    expect(by('partial').sort()).toEqual(['캐나다', '홍콩']);
    expect(by('no').sort()).toEqual(['뉴질랜드', '아일랜드', '영국', '호주']);
  });

  it('나라 이름이 아니라 값으로 판단한다: 같은 값이면 어느 나라든 같은 표시', () => {
    const base = COUNTRIES.find((c) => c.code === 'AU')!;
    const mk = (english: 'Y' | 'H' | 'N', languages: string[]) => priorityMark('local_language', { ...base, english, languages }, G.profile, 'no');
    expect([mk('Y', []), mk('Y', ['스페인어']), mk('H', []), mk('N', [])]).toEqual(['no', 'partial', 'partial', 'ok']);
  });
});

describe('가상 사용자 G (Python 기대값과 같다)', () => {
  const { ranked } = scoreAll(COUNTRIES, G.profile, DEFAULT_CONFIG);
  it('1위는 일본 61%, 현지 언어 줄은 ✓', () => {
    expect(G.expected[0]).toMatchObject({ country: '일본', pct: 61 });
    expect(ranked[0]!.code).toBe('JP');
    expect(ranked[0]!.items.find((i) => i.id === 'local_language')).toMatchObject({ weight: 1.5, mark: 'ok' });
  });
  it('캐나다는 △', () => {
    expect(ranked.find((r) => r.code === 'CA')!.items.find((i) => i.id === 'local_language')!.mark).toBe('partial');
  });
});

describe('기존 가상 사용자 6명은 새 칩을 고르지 않아 결과가 같다', () => {
  it('A~F의 중요한 것에 현지 언어 칩이 없다', () => {
    for (const p of PERSONAS.slice(0, 6)) expect(p.profile.priorities).not.toContain('local_language');
  });
});

describe('Q12 칩 숨김 규칙', () => {
  const pr = (codes: string[]): Profile => ({ ...G.profile, visited: COUNTRIES.filter((c) => !codes.includes(c.code)).map((c) => c.code) });
  it('후보에 ✓와 ✗가 섞여 있으면 보인다', () => {
    const { candidates } = splitCandidates(COUNTRIES, G.profile);
    expect(visiblePriorities(candidates, G.profile, DEFAULT_CONFIG)).toContain('local_language');
  });
  it('남은 후보가 모두 같은 표시면 숨긴다(영어권 호주·영국 = 모두 ✗)', () => {
    const only = COUNTRIES.filter((c) => ['AU', 'GB'].includes(c.code));
    expect(visiblePriorities(only, pr(['AU', 'GB']), DEFAULT_CONFIG)).not.toContain('local_language');
  });
  it('후보가 모두 ✓(일본·독일)여도 숨긴다', () => {
    const only = COUNTRIES.filter((c) => ['JP', 'DE'].includes(c.code));
    expect(visiblePriorities(only, G.profile, DEFAULT_CONFIG)).not.toContain('local_language');
  });
  it('영어 실력 칩은 그대로 있다', () => {
    const { candidates } = splitCandidates(COUNTRIES, G.profile);
    expect(visiblePriorities(candidates, G.profile, DEFAULT_CONFIG)).toContain('english');
  });
});

describe('마음 이유에서 "언어 배우기"를 뺐다 (이전 저장 값은 깨지지 않는다)', () => {
  const withHearts = (hearts: string[]) => ({ ...A, q1: { none: false, codes: ['CA'] }, q12: { unknown: false, priorities: ['money'], hearts } });
  it('서버 검증: 예전 값은 오류 없이 버리고, 모르는 값은 거부', () => {
    const r = validateAnswers(withHearts(['learn_language', 'culture']), ctx);
    expect(r.ok && r.answers.q12?.hearts).toEqual(['culture']);
    expect(validateAnswers(withHearts(['hate']), ctx).ok).toBe(false);
  });
  it('이어서 풀 때: 저장된 답에서 예전 값은 정리된다', () => {
    const saved = withHearts(['learn_language', 'know_someone']) as unknown as Answers;
    expect(pruneAnswers(saved, { countries: COUNTRIES }).q12?.hearts).toEqual(['know_someone']);
  });
  it('이미 저장된 결과에 "언어 배우기"가 있어도 결과 카드가 그려진다', () => {
    const v = validateAnswers(withHearts(['culture']), ctx);
    if (!v.ok) throw new Error(v.reason);
    const result = computeResult(v.answers, data, '2026-11-11', rows);
    const plan = pickCard(v.answers, result)!;
    const old = { ...v.answers, q12: { ...v.answers.q12!, hearts: ['learn_language'] } } as unknown as Answers;
    const html = renderToStaticMarkup(<ResultCard plan={plan} result={result} answers={old} />);
    expect(html).toContain('그 나라 언어를 배우고 싶어서');
  });
  it('질문 화면: "현지 언어 배우기" 칩이 보이고, 마음 이유 칩에는 "언어 배우기"가 없다(영어 실력 칩은 그대로)', () => {
    const answers = { ...A, q1: { none: false, codes: ['JP'] } } as Answers;
    expect(priorityChips(answers, { countries: COUNTRIES })).toContain('local_language');
    const html = renderToStaticMarkup(
      <QuestionPriority answers={answers} ctx={{ countries: COUNTRIES }} countries={[]} minAge={18} set={() => {}} next={() => {}} />,
    );
    const text = html.replace(/<[^>]+>/g, ' ');
    expect(text).toContain('현지 언어 배우기');
    expect(text).toContain('영어 실력');
    expect(text).toContain('문화가 좋아서');
    expect(text).toContain('아는 사람이 있어서');
    expect(text).not.toContain('그 나라 언어를 배우고 싶어서');
  });
});

describe('결과 조건 줄 문구', () => {
  const { ranked } = scoreAll(COUNTRIES, G.profile, DEFAULT_CONFIG);
  const line = (code: string) => {
    const c = COUNTRIES.find((x) => x.code === code)!;
    const l = buildReasons(ranked.find((r) => r.code === code)!, c, G.profile, DEFAULT_CONFIG).find((x) => x.itemId === 'local_language')!;
    return reasonText(l, { country: c.nameKo });
  };
  it('✓·△·✗ 문장', () => {
    expect(line('JP')).toBe('일본에서는 일하면서 현지 언어를 매일 써요.');
    expect(line('CA')).toBe('영어와 현지 언어를 함께 써요. 지역에 따라 현지 언어를 배울 기회가 있어요.');
    expect(line('AU')).toBe('영어권이라 다른 언어를 배울 기회는 적어요.');
  });
  it('칩 이름', () => expect((copy as Record<string, string>)['q12.opt.local_language']).toBe('현지 언어 배우기'));
});
