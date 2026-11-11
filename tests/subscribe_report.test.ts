import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isValidEmail, normalizeEmail, parseSubscribe, DB_SECTION, CONSENT_VERSION } from '@/lib/subscribe';
import { looksLikeContact, pageLabel, parseReport, reportLength } from '@/lib/report';

// DB·서비스 키는 가짜. 운영 DB에는 아무것도 쓰지 않는다.
const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn<(...a: unknown[]) => Promise<boolean>>(),
  addSubscriber: vi.fn<(...a: unknown[]) => Promise<'created' | 'exists'>>(),
  addReport: vi.fn<(...a: unknown[]) => Promise<void>>(),
}));
vi.mock('@/lib/data/admin', () => ({ getServiceKey: () => 'test-service-key', getAdminClient: () => { throw new Error('사용 안 함'); } }));
vi.mock('@/lib/data/mutations', () => ({ checkRateLimit: mocks.checkRateLimit, addSubscriber: mocks.addSubscriber, addReport: mocks.addReport }));

const sub = await import('@/app/api/subscribe/route');
const rep = await import('@/app/api/report/route');
const req = (url: string, body: unknown, init: { raw?: string; type?: string } = {}) =>
  new Request(`http://localhost${url}`, { method: 'POST', headers: { 'Content-Type': init.type ?? 'application/json', 'x-forwarded-for': '203.0.113.7' }, body: init.raw ?? JSON.stringify(body) });

beforeEach(() => {
  mocks.checkRateLimit.mockReset().mockResolvedValue(true);
  mocks.addSubscriber.mockReset().mockResolvedValue('created');
  mocks.addReport.mockReset().mockResolvedValue(undefined);
});

describe('이메일 검사', () => {
  it('앞뒤 공백을 지우고 소문자로', () => expect(normalizeEmail('  Hello@Example.COM ')).toBe('hello@example.com'));
  it('올바른 형식·잘못된 형식', () => {
    for (const ok of ['a@b.co', ' User+tag@Mail.Example.com ']) expect(isValidEmail(ok), ok).toBe(true);
    for (const bad of ['', 'a', 'a@b', '@b.co', 'a@.co', 'a b@c.co', 'a@b c.co', `${'x'.repeat(250)}@b.co`, 'a\n@b.co', 'a\u0000@b.co']) expect(isValidEmail(bad), JSON.stringify(bad)).toBe(false);
  });
  it('구분(section): launch → DB from_korea, to_korea → to_korea, 동의 버전 launch-v1', () => {
    expect(DB_SECTION).toEqual({ launch: 'from_korea', to_korea: 'to_korea' });
    expect(CONSENT_VERSION).toBe('launch-v1');
  });
  it('본문 검사: 동의가 true가 아니면 거부(문자열 "true"·1도 거부)', () => {
    expect(parseSubscribe({ email: 'a@b.co', section: 'launch', consent: true }).ok).toBe(true);
    for (const consent of [false, 'true', 1, undefined, null]) expect(parseSubscribe({ email: 'a@b.co', section: 'launch', consent })).toEqual({ ok: false, error: 'consent_required' });
  });
});

describe('POST /api/subscribe', () => {
  const body = (over: Record<string, unknown> = {}) => ({ email: '  Yvonne@Example.com ', section: 'launch', consent: true, ...over });
  it('성공: 소문자·공백 정리한 이메일과 동의 버전이 저장된다', async () => {
    const res = await sub.POST(req('/api/subscribe', body()));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
    expect(mocks.addSubscriber).toHaveBeenCalledWith({ email: 'yvonne@example.com', section: 'from_korea', locale: 'ko', consentVersion: 'launch-v1' });
  });
  it('To Korea는 section = to_korea, 언어 en', async () => {
    await sub.POST(req('/api/subscribe', body({ section: 'to_korea' })));
    expect(mocks.addSubscriber).toHaveBeenCalledWith(expect.objectContaining({ section: 'to_korea', locale: 'en' }));
  });
  it('이미 신청한 이메일: 오류가 아니라 { status: "exists" } 200 (D-024)', async () => {
    mocks.addSubscriber.mockResolvedValue('exists');
    const res = await sub.POST(req('/api/subscribe', body()));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'exists' });
  });
  it('형식 오류·동의 없음·잘못된 section은 400이고 저장하지 않는다', async () => {
    for (const [over, error] of [[{ email: 'abc' }, 'invalid_email'], [{ consent: false }, 'consent_required'], [{ consent: undefined }, 'consent_required'], [{ section: 'x' }, 'invalid_section'], [{ email: 5 }, 'invalid_email']] as const) {
      const res = await sub.POST(req('/api/subscribe', body(over)));
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error });
    }
    expect(mocks.addSubscriber).not.toHaveBeenCalled();
  });
  it('요청이 잦으면 429, 저장하지 않는다(IP는 해시로만 넘긴다)', async () => {
    mocks.checkRateLimit.mockResolvedValue(false);
    const res = await sub.POST(req('/api/subscribe', body()));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: 'rate_limited' });
    expect(mocks.addSubscriber).not.toHaveBeenCalled();
    const [bucket, hash, limit, win] = mocks.checkRateLimit.mock.calls[0]!;
    expect([bucket, limit, win]).toEqual(['subscribe', 5, 60]);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain('203');
  });
  it('JSON이 아니거나 깨졌거나 너무 크면 거부', async () => {
    expect((await sub.POST(req('/api/subscribe', null, { raw: '{깨짐', type: 'application/json' }))).status).toBe(400);
    expect((await sub.POST(req('/api/subscribe', null, { raw: 'a=b', type: 'text/plain' }))).status).toBe(400);
    expect((await sub.POST(req('/api/subscribe', body({ email: `${'a'.repeat(3000)}@b.co` })))).status).toBe(413);
    expect((await sub.POST(req('/api/subscribe', [1, 2]))).status).toBe(400);
  });
  it('서버 오류는 500, 이메일은 로그에 남기지 않는다', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.addSubscriber.mockRejectedValue(new Error('신청 저장 실패: 08006'));
    const res = await sub.POST(req('/api/subscribe', body()));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'server_error' });
    expect(JSON.stringify(spy.mock.calls)).not.toContain('yvonne');
    spy.mockRestore();
  });
});

describe('제보 검사', () => {
  it('글자 수: 앞뒤 공백 제외, 이모지·한글 1글자', () => {
    expect(reportLength('  가나다  ')).toBe(3);
    expect(reportLength('😀😀')).toBe(2);
  });
  it('5자 미만·2,000자 초과 거부, 5자·2,000자는 통과', () => {
    const base = { screen: 'country', country: 'JP' };
    expect(parseReport({ ...base, message: '1234' })).toEqual({ ok: false, error: 'invalid_message' });
    expect(parseReport({ ...base, message: '    12   ' })).toEqual({ ok: false, error: 'invalid_message' });
    expect(parseReport({ ...base, message: '12345' }).ok).toBe(true);
    expect(parseReport({ ...base, message: 'ㄱ'.repeat(2000) }).ok).toBe(true);
    expect(parseReport({ ...base, message: 'ㄱ'.repeat(2001) })).toEqual({ ok: false, error: 'invalid_message' });
    expect(parseReport({ ...base, message: 12345 })).toEqual({ ok: false, error: 'invalid_message' });
  });
  it('화면·나라 정보 검사와 page 글자(나라·화면·섹션 자동으로 붙음)', () => {
    const ok = parseReport({ message: '어학원 기간이 달라요', screen: 'country', country: 'JP', section: 'work', path: '/countries/JP' });
    expect(ok).toMatchObject({ ok: true, value: { country: 'JP', page: 'country /countries/JP#work' } });
    expect(parseReport({ message: '12345', screen: 'hack' })).toEqual({ ok: false, error: 'invalid_context' });
    expect(parseReport({ message: '12345', screen: 'country', country: 'jp' })).toEqual({ ok: false, error: 'invalid_context' });
    expect(parseReport({ message: '12345', screen: 'footer' })).toMatchObject({ ok: true, value: { country: null, page: 'footer' } });
    expect(pageLabel({ screen: 'result', path: '/r/abc', section: 'DROP TABLE' })).toBe('result /r/abc'); // 이상한 섹션은 버린다
    expect(pageLabel({ screen: 'other', path: `/${'a'.repeat(400)}` }).length).toBeLessThanOrEqual(300);
    expect(pageLabel({ screen: 'other', path: 'javascript:alert(1)' })).toBe('other');
  });
  it('연락처처럼 보이는 글: 이메일·전화번호는 감지, 보통 문장·금액·날짜는 감지 안 함(막지는 않음)', () => {
    for (const yes of ['메일은 a@b.co 예요', '연락은 010-1234-5678로', '010 1234 5678', '+82 10-1234-5678', '02-123-4567', '01012345678']) expect(looksLikeContact(yes), yes).toBe(true);
    for (const no of ['어학원 기간이 6개월로 바뀌었어요', '잔고 증명이 3,000,000원이에요', '2027-03-01에 접수가 열려요', '시급이 1226엔이에요', '비자 비용 CAD 279.75', '12345']) expect(looksLikeContact(no), no).toBe(false);
  });
});

describe('POST /api/report', () => {
  const body = (over: Record<string, unknown> = {}) => ({ message: '어학원 기간이 6개월로 바뀌었어요', screen: 'country', country: 'JP', section: 'work', path: '/countries/JP', ...over });
  it('성공: 나라·화면·섹션이 page에 붙어 저장된다', async () => {
    const res = await rep.POST(req('/api/report', body()));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: 'ok' });
    expect(mocks.addReport).toHaveBeenCalledWith({ country: 'JP', page: 'country /countries/JP#work', message: '어학원 기간이 6개월로 바뀌었어요' });
  });
  it('5자 미만·2,000자 초과·잘못된 화면은 400, 저장 안 함', async () => {
    for (const over of [{ message: '짧아요' }, { message: 'ㄱ'.repeat(2001) }, { screen: 'x' }, { country: 'zz' }]) {
      const res = await rep.POST(req('/api/report', body(over)));
      expect(res.status).toBe(400);
    }
    expect(mocks.addReport).not.toHaveBeenCalled();
  });
  it('연락처가 들어 있어도 서버는 막지 않는다(안내는 화면에서만)', async () => {
    expect((await rep.POST(req('/api/report', body({ message: '010-1234-5678로 연락 주세요' })))).status).toBe(200);
  });
  it('요청 제한 1분 3번 → 429', async () => {
    mocks.checkRateLimit.mockResolvedValue(false);
    expect((await rep.POST(req('/api/report', body()))).status).toBe(429);
    expect(mocks.checkRateLimit.mock.calls[0]!.slice(0, 1).concat(mocks.checkRateLimit.mock.calls[0]!.slice(2))).toEqual(['report', 3, 60]);
  });
  it('서버 오류는 500이고 제보 내용은 로그에 남기지 않는다', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.addReport.mockRejectedValue(new Error('제보 저장 실패: 08006'));
    const res = await rep.POST(req('/api/report', body({ message: '비밀 제보 내용입니다' })));
    expect(res.status).toBe(500);
    expect(JSON.stringify(spy.mock.calls)).not.toContain('비밀 제보');
    spy.mockRestore();
  });
});
