import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GuideArticle } from '@/components/guides/GuideArticle';
import type { GuideFactContext } from '@/lib/data/queries';
import { fillFacts, isInternalHref, parseInline, parseMarkdown, type Block, type Inline } from '@/lib/guides';
import type { DbRows } from '@/lib/engine';
import snapshot from './fixtures/db_rows_v1.json';

const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const rows = snapshot as unknown as DbRows;
const FACT_KEYS = ['apply_method', 'employer_limit_months', 'extension', 'extension_by_regional_work', 'health_surcharge', 'insurance_required', 'job_hard_note', 'job_language_required', 'medical_check', 'no_fulltime', 'prohibited_work', 'proof_amount', 'proof_amount_with_ticket', 'proof_note', 'special_note', 'study_max_months', 'study_note', 'visa_fee', 'work_limit_months', 'work_note'];
const TYPES: Record<string, string> = { proof_amount: 'money', proof_amount_with_ticket: 'money', visa_fee: 'money', health_surcharge: 'money', employer_limit_months: 'months', work_limit_months: 'months', study_max_months: 'months', no_fulltime: 'boolean', extension_by_regional_work: 'boolean' };

describe('가이드 링크: 외부 https + 사이트 안 /…', () => {
  const link = (md: string) => parseInline(md).find((i): i is Extract<Inline, { t: 'link' }> => i.t === 'link');
  it('사이트 안 링크는 internal, 외부 링크는 external', () => {
    for (const href of ['/countries', '/test', '/test?pre=CA', '/checklist?c=CA', '/countries/CA', '/countries?sort=money&region=europe']) {
      expect(link(`[글](${href})`), href).toMatchObject({ href, internal: true });
    }
    expect(link('[글](https://example.com/a?b=1)')).toMatchObject({ href: 'https://example.com/a?b=1', internal: false });
  });
  it('위험한 주소는 링크가 아니라 글자로만 남는다', () => {
    for (const bad of ['//evil.com', '/\\evil.com', 'javascript:alert(1)', 'data:text/html,x', '/../etc', '/a b', 'mailto:a@b.co', 'ftp://x.co/a']) {
      const inline = parseInline(`[나쁜](${bad})`);
      expect(inline.some((i) => i.t === 'link'), bad).toBe(false);
      expect(inline.map((i) => i.text).join('')).toContain('나쁜');
    }
    expect(isInternalHref('/')).toBe(true);
    expect(isInternalHref('//x')).toBe(false);
  });
  it('화면: 사이트 안 링크는 같은 탭(target 없음), 외부는 새 탭 + rel', () => {
    const html = renderToStaticMarkup(<GuideArticle title="글" country={null} date={null} needsReview={false} blocks={parseMarkdown('[안](/countries/CA) [밖](https://example.com)')} />);
    expect(html).toMatch(/<a class="[^"]*" href="\/countries\/CA">안<\/a>/);
    expect(html).toMatch(/href="https:\/\/example.com"[^>]*target="_blank"|target="_blank"[^>]*href="https:\/\/example.com"/);
    expect(html.match(/target="_blank"/g)).toHaveLength(1);
  });
  it('javascript: 링크는 화면에 href로 나오지 않는다', () => {
    const html = renderToStaticMarkup(<GuideArticle title="글" country={null} date={null} needsReview={false} blocks={parseMarkdown('[x](javascript:alert(1)) [y](//evil.com)')} />);
    expect(html).not.toMatch(/href="(javascript|\/\/)/);
  });
  it('번호 목록(1. 2. 3.)은 목록으로 읽는다', () => {
    const blocks = parseMarkdown('앞 문단\n\n1. 첫째 **굵게**\n2. 둘째\n3. 셋째\n\n- 점 목록\n- 둘');
    expect(blocks.map((b) => b.t)).toEqual(['p', 'ol', 'ul']);
    expect((blocks[1] as Extract<Block, { t: 'ol' }>).items).toHaveLength(3);
    expect(renderToStaticMarkup(<GuideArticle title="글" country={null} date={null} needsReview={false} blocks={blocks} />)).toContain('<ol');
  });
});

// ---------- 시드 파일 ----------
const sql = readFileSync('supabase/seed/seed_guides_v1.sql', 'utf8');
const entries = [...sql.matchAll(/\('([a-z0-9-]+)', ((?:null|\(select [^)]+\))), '([^']+)',\n\$guide\$([\s\S]*?)\$guide\$,\n\s+'(published|draft|archived)', '(\d{4}-\d{2}-\d{2})'\)/g)]
  .map((m) => ({ slug: m[1]!, program: m[2]!, title: m[3]!, body: m[4]!, status: m[5]!, reviewedAt: m[6]! }));
const caFacts = rows.facts.filter((f) => f.program_id === rows.programs.find((p) => p.destination === 'CA')!.id);
const ctx: GuideFactContext = { facts: caFacts.map((f) => ({ key: f.key, value_num: f.value_num, value_text: f.value_text, currency: f.currency })), keyTypes: TYPES, rates: rows.rates };

describe('시드 seed_guides_v1.sql (draft md에서 만든 파일)', () => {
  const g1 = entries.find((e) => e.slug === 'first-month-money')!;
  const g2 = entries.find((e) => e.slug === 'canada-iec-2027')!;
  it('글 2개, 발행 상태, 같은 slug는 갱신(on conflict)', () => {
    expect(entries.map((e) => e.slug)).toEqual(['first-month-money', 'canada-iec-2027']);
    expect(entries.every((e) => e.status === 'published' && e.reviewedAt === '2026-11-11')).toBe(true);
    expect(sql).toContain('on conflict (slug) do update');
    expect(sql.startsWith('--')).toBe(true);
    expect(sql).toMatch(/begin;[\s\S]*commit;/);
  });
  it('program_id: 방법 글은 없음(null), 캐나다 글은 캐나다 프로그램', () => {
    expect(g1.program).toBe('null');
    expect(g2.program).toBe("(select id from programs where origin = 'KR' and destination = 'CA' and kind = 'working_holiday')");
  });
  it('초안 md의 본문과 시드의 본문이 같다(메모인 "참고" 줄은 시드에 없다)', () => {
    const draft = readFileSync('docs/content/guides_draft_v1.md', 'utf8');
    const bodyOf = (n: number) => draft.split(/^## 글 \d+\s*$/m)[n]!.split('### 본문')[1]!.split('\n---\n')[0]!.trim();
    expect(g1.body).toBe(bodyOf(1));
    expect(g2.body).toBe(bodyOf(2));
    expect(sql).not.toContain('2026 시즌 신청자 풀은 2026-10-19에 닫혔고');
    expect(sql).not.toContain('참고(2026-11 기준 확인)');
    expect(sql).not.toContain('program_id: ');
  });
  it('{fact_key}: 방법 글에는 없고, 캐나다 글에는 proof_amount·visa_fee만(모두 fact_keys에 있는 키)', () => {
    expect(g1.body).not.toMatch(/\{[a-z_]+\}/);
    const keys = [...new Set([...g2.body.matchAll(/\{([a-z][a-z0-9_]*)\}/g)].map((m) => m[1]!))];
    expect(keys.sort()).toEqual(['proof_amount', 'visa_fee']);
    for (const k of keys) expect(FACT_KEYS).toContain(k);
  });
  it('캐나다 DB 값으로 채워진다: 잔고 증명·비자 비용(원화 같이), "확인 중"은 없다', () => {
    const filled = fillFacts(g2.body, ctx, '2026-11-11');
    const proof = caFacts.find((f) => f.key === 'proof_amount_with_ticket') ?? caFacts.find((f) => f.key === 'proof_amount');
    const own = caFacts.find((f) => f.key === 'proof_amount')!;
    expect(own.currency).toBe('CAD');
    expect(filled).toContain('**잔고 증명:** CAD 2,500 (약 250만 원)');
    expect(filled).toContain('**비자 비용:** CAD 279.75 (약 28만 원)');
    expect(filled).not.toContain('{');
    expect(filled).not.toContain('확인 중');
    expect(proof).toBeDefined();
  });
  it('program_id가 없는 글에 {fact_key}를 쓰면 "확인 중"(방법 글에는 영향 없음)', () => {
    expect(fillFacts('{proof_amount}', { ...ctx, facts: [] }, '2026-11-11')).toBe('확인 중');
    expect(fillFacts(g1.body, { facts: [], keyTypes: {}, rates: [] }, '2026-11-11')).toBe(g1.body);
  });
  it('사이트 안 링크 5개가 모두 링크로 읽히고 실제 있는 화면을 가리킨다', () => {
    const links = (body: string) => parseMarkdown(body).flatMap((b) => ('items' in b ? b.items.flat() : b.inline)).filter((i): i is Extract<Inline, { t: 'link' }> => i.t === 'link');
    const internal = [...links(g1.body), ...links(g2.body)].filter((l) => l.internal).map((l) => l.href);
    expect(internal.sort()).toEqual(['/checklist?c=CA', '/countries', '/countries/CA', '/test', '/test?pre=CA'].sort());
    for (const href of internal) expect(isInternalHref(href)).toBe(true);
    const external = [...links(g1.body), ...links(g2.body)].filter((l) => !l.internal).map((l) => l.href);
    expect(external).toEqual(['https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/iec.html', 'https://whic.mofa.go.kr/whic/nation/info.jsp?boardNo=100013']);
  });
  it('본문 마크다운이 문단으로 뭉치지 않는다: 글 2의 신청 순서는 번호 목록 7개', () => {
    const blocks = parseMarkdown(fillFacts(g2.body, ctx, '2026-11-11'));
    const ols = blocks.filter((b) => b.t === 'ol');
    expect(ols.map((b) => ('items' in b ? b.items.length : 0))).toEqual([7]);
    expect(blocks.filter((b) => b.t === 'h2').length).toBeGreaterThanOrEqual(4);
  });
  it('화면 글자: 두 글이 그려지고 "예정"이 없다', () => {
    for (const e of [g1, g2]) {
      const html = renderToStaticMarkup(<GuideArticle title={e.title} country={e.slug === 'canada-iec-2027' ? '캐나다' : null} date={e.reviewedAt} needsReview={false} blocks={parseMarkdown(fillFacts(e.body, ctx, '2026-11-11'))} />);
      expect(text(html)).toContain(e.title);
      expect(text(html)).not.toContain('예정');
    }
  });
});
