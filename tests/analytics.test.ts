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
  afterEach(() => vi.unstubAllGlobals());

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
