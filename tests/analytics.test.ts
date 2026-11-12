import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const track = vi.fn();
vi.mock('@vercel/analytics', () => ({ track: (...a: unknown[]) => track(...a) }));

describe('측정 이벤트 (SPEC 0.7, D-133)', () => {
  beforeEach(() => {
    vi.resetModules();
    track.mockReset();
    const store = new Map<string, string>();
    vi.stubGlobal('window', { localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) } });
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

  it('trackEvent: 이름과 속성을 그대로 보내고, 대기줄(window.va)을 먼저 만든다', async () => {
    const { trackEvent } = await import('@/lib/analytics');
    trackEvent('share', { type: 'link' });
    expect(track).toHaveBeenCalledWith('share', { type: 'link' });
    expect(typeof (window as unknown as { va?: unknown }).va).toBe('function');
    (window as unknown as { va: (...a: unknown[]) => void }).va('event', { name: 'x' });
    expect((window as unknown as { vaq: unknown[][] }).vaq).toEqual([['event', { name: 'x' }]]);
  });
  it('trackSession: 같은 이름은 한 번만', async () => {
    const { trackSession } = await import('@/lib/analytics');
    trackSession('quiz_start'); trackSession('quiz_start');
    expect(track).toHaveBeenCalledTimes(1);
  });
  it('trackOnce: 브라우저당 한 번만 기록', async () => {
    const { trackOnce } = await import('@/lib/analytics');
    trackOnce('checklist_start', { country: 'JP' }); trackOnce('checklist_start', { country: 'CA' });
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith('checklist_start', { country: 'JP' });
  });
  it('보내기가 던져도 화면은 영향이 없다', async () => {
    track.mockImplementation(() => { throw new Error('blocked'); });
    const { trackEvent } = await import('@/lib/analytics');
    expect(() => trackEvent('vote', { slug: 'a' })).not.toThrow();
  });
  it('운영(production)에서만 api/event로 보낸다: sendBeacon 우선, 안 되면 fetch(keepalive), 실패해도 던지지 않는다 (D-137)', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const beacon = vi.fn(() => true);
    const fetchMock = vi.fn(() => Promise.reject(new Error('offline')));
    vi.stubGlobal('navigator', { sendBeacon: beacon });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('Blob', class { constructor(public parts: string[], public opts: { type: string }) {} });
    (window as unknown as { location: { pathname: string } }).location = { pathname: '/r/abc' };
    const { trackEvent } = await import('@/lib/analytics');
    trackEvent('share', { type: 'link' });
    expect(track).toHaveBeenCalledWith('share', { type: 'link' }); // Vercel track()은 그대로
    expect(beacon).toHaveBeenCalledTimes(1);
    const [url, blob] = beacon.mock.calls[0] as unknown as [string, { parts: string[]; opts: { type: string } }];
    expect(url).toBe('/api/event');
    expect(blob.opts.type).toBe('application/json');
    expect(JSON.parse(blob.parts[0]!)).toEqual({ name: 'share', props: { type: 'link' }, path: '/r/abc' });
    expect(fetchMock).not.toHaveBeenCalled();
    // sendBeacon이 없거나 거절하면 fetch, 그것도 실패해도 던지지 않는다
    beacon.mockReturnValue(false);
    expect(() => trackEvent('vote', { slug: 'resume' })).not.toThrow();
    expect(fetchMock).toHaveBeenCalledWith('/api/event', expect.objectContaining({ method: 'POST', keepalive: true }));
    vi.stubGlobal('navigator', {});
    expect(() => trackEvent('quiz_start')).not.toThrow();
  });
  it('개발·테스트 환경에서는 api/event로 보내지 않는다(개발 서버도 운영 DB에 연결돼 있어서)', async () => {
    const beacon = vi.fn(() => true);
    vi.stubGlobal('navigator', { sendBeacon: beacon });
    const { trackEvent } = await import('@/lib/analytics');
    trackEvent('quiz_start');
    expect(beacon).not.toHaveBeenCalled();
  });
  it('이벤트를 보내는 곳은 SPEC 0.7 표의 이름만 쓰고 답 값을 속성에 넣지 않는다', async () => {
    const { readFileSync, readdirSync, statSync } = await import('node:fs');
    const { join } = await import('node:path');
    const files: string[] = [];
    const walk = (d: string) => { for (const f of readdirSync(d)) { const p = join(d, f); if (f === 'node_modules' || f === '.next') continue; if (statSync(p).isDirectory()) walk(p); else if (/\.tsx?$/.test(f)) files.push(p); } };
    ['components', 'lib'].forEach((d) => walk(d));
    const names = new Set<string>();
    for (const f of files) for (const m of readFileSync(f, 'utf-8').matchAll(/track(?:Event|Once|Session)\('([a-z_]+)'(?:, \{([^}]*)\})?/g)) {
      names.add(m[1]!);
      // 속성 이름은 SPEC 0.7 표의 것만(type·country·section·slug·page·heart). 이메일·나이·예산 같은 답 값 이름은 없다
      const keys = [...(m[2] ?? '').matchAll(/(?:^|,)\s*([a-z]+)\s*:/g)].map((k) => k[1]);
      for (const k of keys) expect(['type', 'country', 'section', 'slug', 'page', 'heart'], `${f}: ${m[1]}.${k}`).toContain(k);
    }
    expect([...names].sort()).toEqual(['checklist_start', 'quiz_complete', 'quiz_start', 'report', 'share', 'subscribe', 'vote']);
  });
});
