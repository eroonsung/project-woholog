import { describe, expect, it } from 'vitest';
import { flightLine, flightOf, formatHours } from '@/lib/flight';
import { reasonSmall, reasonText } from '@/lib/result/text';

const line = (params: Record<string, number>) => ({ mark: 'ok', kind: 'priority', itemId: 'near_korea', key: 'reason.priority.near_korea.ok', params }) as never;

describe('비행시간 표시 (D-130)', () => {
  it('시간 글자', () => {
    expect(formatHours(2.5)).toBe('2시간 30분');
    expect(formatHours(14)).toBe('14시간');
    expect(formatHours(0.5)).toBe('30분');
  });
  it('값이 없으면 기존 문구만', () => {
    expect(flightOf({ flight_direct: null, flight_hours: null })).toBeNull();
    expect(flightOf({})).toBeNull();
    expect(flightLine(null, true)).toEqual({ main: '한국과 가까워요.', small: null });
    expect(flightLine(null, false).main).toBe('비행기로 오래 가야 해요.');
  });
  it('가까운 나라·먼 나라(직항)·직항 없음', () => {
    expect(flightLine({ direct: true, hours: 2.5 }, true)).toEqual({ main: '한국과 가까워요.', small: '직항 약 2시간 30분' });
    expect(flightLine({ direct: true, hours: 14 }, false)).toEqual({ main: '비행기로 오래 가야 해요.', small: '직항 약 14시간' });
    expect(flightLine({ direct: false, hours: 16 }, false)).toEqual({ main: '직항이 없어서 경유해야 해요.', small: '최소 약 16시간' });
  });
  it('DB 숫자 문자열도 읽는다', () => {
    expect(flightOf({ flight_direct: true, flight_hours: '2.5' })).toEqual({ direct: true, hours: 2.5 });
  });
  it('결과 조건 줄: 저장된 값으로 만들고, 옛 결과는 그대로', () => {
    expect(reasonSmall(line({ flightDirect: 1, flightHours: 2.5 }))).toBe('직항 약 2시간 30분');
    expect(reasonSmall(line({}))).toBeNull();
    expect(reasonText(line({ flightDirect: 0, flightHours: 16 }))).toBe('직항이 없어서 경유해야 해요.');
    expect(reasonText(line({}))).toBe('한국과 가까워요.');
  });
});
