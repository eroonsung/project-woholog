import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EVENT_NAMES, normalizePath, parseEvent } from '@/lib/events';

// DB·서비스 키는 가짜로 바꿔서 API의 흐름(요청 제한 → 검증 → 저장)만 확인한다. 운영 DB에는 아무것도 쓰지 않는다.
const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn<(...args: unknown[]) => Promise<boolean>>(),
  addEvent: vi.fn<(...args: unknown[]) => Promise<void>>(),
  purgeEvents: vi.fn<(...args: unknown[]) => Promise<void>>(),
}));
vi.mock('@/lib/data/admin', () => ({ getServiceKey: () => 'test-service-key', getAdminClient: () => { throw new Error('사용 안 함'); } }));
vi.mock('@/lib/data/mutations', () => ({ checkRateLimit: mocks.checkRateLimit, addEvent: mocks.addEvent, purgeEvents: mocks.purgeEvents }));

const { POST } = await import('@/app/api/event/route');
const post = (body: unknown, init: { headers?: Record<string, string>; raw?: string } = {}) =>
  POST(new Request('http://localhost/api/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '203.0.113.7', ...init.headers },
    body: init.raw ?? JSON.stringify(body),
  }));

// SPEC 0.7의 7종: 이름 → 올바른 속성
const VALID: [string, Record<string, string>][] = [
  ['quiz_start', {}],
  ['quiz_complete', { heart: '있음' }],
  ['share', { type: 'native' }],
  ['checklist_start', { country: 'JP' }],
  ['subscribe', { section: 'launch' }],
  ['vote', { slug: 'resume' }],
  ['report', { page: 'country' }],
];

beforeEach(() => {
  mocks.checkRateLimit.mockReset().mockResolvedValue(true);
  mocks.addEvent.mockReset().mockResolvedValue();
  mocks.purgeEvents.mockReset().mockResolvedValue();
});
afterEach(() => vi.restoreAllMocks());

describe('POST /api/event', () => {
  it('7종이 모두 저장된다(저장 함수에 정해진 값만 넘어간다)', async () => {
    expect(VALID.map(([n]) => n).sort()).toEqual([...EVENT_NAMES].sort());
    for (const [name, props] of VALID) {
      const res = await post({ name, props, path: '/countries/JP' });
      expect(res.status, name).toBe(200);
      expect(await res.json()).toEqual({ status: 'ok' });
    }
    expect(mocks.addEvent).toHaveBeenCalledTimes(7);
    expect(mocks.addEvent.mock.calls.map(([e]) => (e as { name: string }).name)).toEqual(VALID.map(([n]) => n));
    expect(mocks.addEvent).toHaveBeenCalledWith({ name: 'checklist_start', props: { country: 'JP' }, path: '/countries/JP' });
  });

  it('허용되지 않은 이름·속성은 400이고 저장하지 않는다', async () => {
    const bad: unknown[] = [
      { name: 'page_view', props: {} },                                   // 모르는 이름
      { name: 'quiz_start', props: { age: 27 } },                         // 모르는 속성(나이)
      { name: 'quiz_complete', props: { heart: '아마도' } },               // 허용 값이 아님
      { name: 'quiz_complete', props: { heart: '있음', age: 27 } },        // 속성이 더 많음
      { name: 'quiz_complete', props: {} },                               // 속성이 빠짐
      { name: 'share', props: { type: 'email' } },
      { name: 'checklist_start', props: { country: 'jp' } },               // 대문자 2글자만
      { name: 'checklist_start', props: { country: 'JPN' } },
      { name: 'subscribe', props: { email: 'a@b.com', section: 'launch' } }, // 이메일은 받을 칸이 없다
      { name: 'subscribe', props: { section: 'from_korea' } },
      { name: 'vote', props: { slug: 'hack' } },                          // 모르는 기능
      { name: 'report', props: { page: '/secret' } },
      { name: 'share', props: { type: ['link'] } },                        // 문자열이 아님
      { name: 'quiz_start', props: [] },
      { name: 'quiz_start', props: {}, extra: 1 },                        // 모르는 칸
      { name: 'quiz_start', props: {}, path: 'https://evil.example/' },    // 화면 주소가 아님
      { name: '__proto__', props: {} },
      { name: 'constructor', props: {} },
      'quiz_start', null, [], 7,
    ];
    for (const body of bad) {
      const res = await post(body);
      expect(res.status, JSON.stringify(body)).toBe(400);
    }
    expect(mocks.addEvent).not.toHaveBeenCalled();
  });

  it('JSON이 아니거나 너무 큰 요청은 막는다', async () => {
    expect((await post(null, { raw: 'not json' })).status).toBe(400);
    expect((await post(null, { headers: { 'Content-Type': 'text/plain' }, raw: '{}' })).status).toBe(400);
    expect((await post({ name: 'quiz_start', props: {}, path: '/' + 'a'.repeat(600) })).status).toBe(413);
    expect(mocks.addEvent).not.toHaveBeenCalled();
  });

  it('요청 제한(IP당 1분에 60번)을 넘으면 429, 이벤트 버킷으로 센다', async () => {
    mocks.checkRateLimit.mockResolvedValue(false);
    const res = await post({ name: 'quiz_start', props: {} });
    expect(res.status).toBe(429);
    expect(mocks.checkRateLimit).toHaveBeenCalledWith('event', expect.stringMatching(/^[0-9a-f]{64}$/), 60, 60);
    expect(mocks.addEvent).not.toHaveBeenCalled();
  });

  it('저장이 실패해도 500만 돌려주고(화면 영향 없음), IP·이메일은 저장 인자에 없다', async () => {
    mocks.addEvent.mockRejectedValue(new Error('db down'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect((await post({ name: 'quiz_start', props: {} })).status).toBe(500);
    mocks.addEvent.mockResolvedValue();
    await post({ name: 'share', props: { type: 'link' }, path: '/r/3f2b8c1e-0000-4000-8000-000000000001' });
    const saved = mocks.addEvent.mock.calls.at(-1)![0] as Record<string, unknown>;
    expect(Object.keys(saved).sort()).toEqual(['name', 'path', 'props']);
    expect(JSON.stringify(saved)).not.toMatch(/203\.0\.113|@|ip/i);
    expect(saved.path).toBe('/r/:id'); // 결과 id는 지운다
  });
});

describe('화면 주소 정리', () => {
  it('쿼리·결과 id를 지우고 이상한 값은 거절한다', () => {
    expect(normalizePath('/r/3f2b8c1e-0000-4000-8000-000000000001/compare?c=JP,CA')).toBe('/r/:id/compare');
    expect(normalizePath('/checklist?c=JP&d=2027-03-01')).toBe('/checklist');
    expect(normalizePath('/countries/JP#apps')).toBe('/countries/JP');
    expect(normalizePath('https://x')).toBeNull();
    expect(normalizePath('/a b')).toBeNull();
    expect(normalizePath(5)).toBeNull();
  });
  it('parseEvent: 속성 없이 보낸 quiz_start는 통과', () => {
    expect(parseEvent({ name: 'quiz_start' })).toEqual({ ok: true, value: { name: 'quiz_start', props: {}, path: null } });
  });
});
