import { describe, expect, it } from 'vitest';
import { ageFromBirth } from '@/lib/age';

const age = (y: string, m: string, d: string, today = '2026-11-11') => ageFromBirth(y, m, d, today);

describe('만 나이 계산기 (생년월일 → 만 나이)', () => {
  it('생일이 지났으면 연도 차이, 안 지났으면 1살 적다', () => {
    expect(age('1998', '05', '21')).toEqual({ ok: true, age: 28 }); // 생일 지남
    expect(age('1998', '12', '25')).toEqual({ ok: true, age: 27 }); // 아직 안 지남
  });

  it('생일 당일에 나이가 오른다(하루 전은 아직)', () => {
    expect(age('1999', '11', '11')).toEqual({ ok: true, age: 27 });
    expect(age('1999', '11', '12')).toEqual({ ok: true, age: 26 });
    expect(age('1999', '11', '10')).toEqual({ ok: true, age: 27 });
  });

  it('올해 태어났거나 오늘 태어나면 0세', () => {
    expect(age('2026', '11', '11')).toEqual({ ok: true, age: 0 });
    expect(age('2026', '01', '01')).toEqual({ ok: true, age: 0 });
  });

  it('2월 29일생은 평년에 3월 1일을 생일로 본다', () => {
    expect(age('2000', '2', '29', '2027-02-28')).toEqual({ ok: true, age: 26 }); // 평년 2/28: 아직
    expect(age('2000', '2', '29', '2027-03-01')).toEqual({ ok: true, age: 27 });
    expect(age('2000', '2', '29', '2028-02-29')).toEqual({ ok: true, age: 28 }); // 윤년은 2/29
    expect(age('2000', '2', '29', '2028-02-28')).toEqual({ ok: true, age: 27 });
  });

  it('없는 날짜는 invalid (2월 30일, 평년 2월 29일, 13월, 0일, 문자)', () => {
    for (const [y, m, d] of [['1998', '2', '30'], ['1999', '2', '29'], ['1998', '13', '1'], ['1998', '0', '5'], ['1998', '5', '0'], ['1998', '4', '31'], ['19x8', '5', '5'], ['1998', '-1', '5']] as const) {
      expect(age(y, m, d), `${y}-${m}-${d}`).toEqual({ ok: false, reason: 'invalid' });
    }
    expect(age('1899', '12', '31')).toEqual({ ok: false, reason: 'invalid' });
  });

  it('윤년의 2월 29일은 유효', () => {
    expect(age('2000', '2', '29').ok).toBe(true);
  });

  it('오늘 이후 날짜는 future', () => {
    expect(age('2026', '11', '12')).toEqual({ ok: false, reason: 'future' });
    expect(age('2027', '1', '1')).toEqual({ ok: false, reason: 'future' });
    expect(age('2026', '12', '1')).toEqual({ ok: false, reason: 'future' });
  });

  it('아직 다 안 적었으면 incomplete(틀렸다고 하지 않는다)', () => {
    expect(age('', '', '')).toEqual({ ok: false, reason: 'incomplete' });
    expect(age('1998', '', '')).toEqual({ ok: false, reason: 'incomplete' });
    expect(age('199', '5', '21')).toEqual({ ok: false, reason: 'incomplete' }); // 연도 4자리 전
    expect(age('1998', '5', ' ')).toEqual({ ok: false, reason: 'incomplete' });
  });

  it('앞뒤 공백·앞의 0은 허용', () => {
    expect(age(' 1998 ', ' 05', '21 ')).toEqual({ ok: true, age: 28 });
  });
});
