import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GuideArticle } from '@/components/guides/GuideArticle';
import { GuidesView } from '@/components/guides/GuidesView';
import { FeatureDetail } from '@/components/soon/FeatureDetail';
import { SoonHub } from '@/components/soon/SoonHub';
import { VoteButton } from '@/components/soon/VoteButton';
import copy from '@/content/copy_ko.json';
import features from '@/content/features_ko.json';
import type { GuideFactContext } from '@/lib/data/queries';
import { FEATURES, featureBySlug, otherFeatures, STAGES } from '@/lib/features';
import { fillFacts, formatFact, parseMarkdown } from '@/lib/guides';
import { castVote, hasVoted, unmarkVoted } from '@/lib/votes';
import { adaptRows, type DbRows } from '@/lib/engine';
import { validateAnswers } from '@/lib/quiz/validate';
import { computeResult } from '@/lib/result/compute';
import { buildShareData } from '@/lib/share/data';
import { renderShareImage } from '@/lib/share/image';
import snapshot from './fixtures/db_rows_v1.json';
import { PERSONA_ANSWERS } from './fixtures/persona_answers';

const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const ko = copy as Record<string, string>;

// ---------- 준비 중 기능 ----------
describe('준비 중 기능 15개 (features_ko.json)', () => {
  it('15개이고 slug가 모두 다르다', () => { expect(FEATURES).toHaveLength(15); expect(new Set(FEATURES.map((f) => f.slug)).size).toBe(15); });
  it('"예정"이 아니라 "목표"만 쓴다(규칙 16): 기능 문구·soon 문구 어디에도 "예정"이 없다', () => {
    expect(JSON.stringify(features)).not.toContain('예정');
    for (const [k, v] of Object.entries(ko)) if (k.startsWith('soon.') || k.startsWith('guides.')) expect(v, k).not.toContain('예정');
  });
  it('단계는 4가지, 이름은 JSON 순서 그대로', () => {
    expect(new Set(FEATURES.map((f) => f.stage))).toEqual(new Set(STAGES));
    expect(FEATURES.map((f) => f.slug)).toEqual((features.features as { slug: string }[]).map((f) => f.slug));
  });
  it('다른 준비 중 기능: 이 기능 다음 3개, 끝이면 처음으로, 자기 자신은 없다', () => {
    expect(otherFeatures('cost-calculator').map((f) => f.slug)).toEqual(['savings-planner', 'intake-alerts', 'guidebook']);
    expect(otherFeatures('language-exchange').map((f) => f.slug)).toEqual(['cost-calculator', 'savings-planner', 'intake-alerts']);
    for (const f of FEATURES) expect(otherFeatures(f.slug).some((o) => o.slug === f.slug)).toBe(false);
  });
});

describe('/soon 모음', () => {
  const counts = Object.fromEntries(FEATURES.map((f, i) => [f.slug, i + 1]));
  const html = renderToStaticMarkup(<SoonHub stage={null} counts={counts} />);
  it('카드 15장, JSON 순서 그대로(원해요 순으로 바꾸지 않음), 각 카드는 상세 링크', () => {
    const hrefs = [...html.matchAll(/href="\/soon\/([a-z-]+)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual(FEATURES.map((f) => f.slug));
  });
  it('카드: 단계 뱃지·이름·한 줄 설명·"○○ 목표"·원해요 + 숫자(DB 값)', () => {
    const s = text(html);
    expect(s).toContain('초기 비용 계산기');
    expect(s).toContain('항공·보험·비자·첫 달 집세를 나라별로 합산');
    expect(s).toContain('2027 상반기 목표');
    expect(s).toContain('원해요 1');
    expect(s).toContain('원해요 15');
    expect(s).toContain('15개 준비 중');
  });
  it('숫자를 못 읽으면(null) 숫자 없이 "원해요"만', () => {
    const s = text(renderToStaticMarkup(<SoonHub stage={null} counts={null} />));
    expect(s).toContain('원해요');
    expect(s).not.toMatch(/원해요 \d/);
  });
  it('단계 탭(전체·준비하기·현지 생활·귀국·커뮤니티), 단계를 고르면 그 단계 카드만', () => {
    const s = text(html);
    for (const label of ['전체', '준비하기', '현지 생활', '귀국', '커뮤니티']) expect(s).toContain(label);
    expect(html).toContain('href="/soon?stage=local"');
    const local = renderToStaticMarkup(<SoonHub stage="local" counts={counts} />);
    expect([...local.matchAll(/href="\/soon\/([a-z-]+)"/g)].map((m) => m[1])).toEqual(FEATURES.filter((f) => f.stage === 'local').map((f) => f.slug));
  });
  it('아래 오픈 알림 블록(Coming soon 모달을 여는 버튼)', () => {
    expect(text(html)).toContain('열리면 알려 드릴까요?');
    expect(text(html)).toContain('알림 받기');
  });
});

describe('/soon/[slug] 상세', () => {
  const view = (slug: string, counts: Record<string, number> | null = { [slug]: 212 }) => renderToStaticMarkup(<FeatureDetail feature={featureBySlug(slug)!} counts={counts} />);
  it('블록 순서: 이름 → 미리보기 → 이런 걸 할 수 있어요 → 원해요 → 지금 쓸 수 있는 것 → 알림 → 다른 기능 3개', () => {
    const s = text(view('cost-calculator'));
    const order = ['초기 비용 계산기', '준비 중 · 2027 상반기 목표', '미리보기', '이런 걸 할 수 있어요', '원해요 212', '212명이 기다려요', '지금 쓸 수 있는 것', '이 기능이 열리면 알려 드릴까요?', '다른 준비 중 기능'];
    let at = -1;
    for (const x of order) { const i = s.indexOf(x, at + 1); expect(i, x).toBeGreaterThan(at); at = i; }
  });
  it('"이런 걸 할 수 있어요" 3줄, 다른 준비 중 기능 3개', () => {
    const html = view('cost-calculator');
    expect(featureBySlug('cost-calculator')!.can).toHaveLength(3);
    expect(html.match(/href="\/soon\/[a-z-]+"/g)).toHaveLength(3); // 다른 기능 3개(위쪽 "곧 나올 기능"·"로드맵"은 /soon)
  });
  it('"지금 쓸 수 있는 것"은 값이 없으면 블록을 숨긴다', () => {
    expect(featureBySlug('fx-alerts')!.now).toBeFalsy();
    expect(text(view('fx-alerts'))).not.toContain('지금 쓸 수 있는 것');
    expect(text(view('cost-calculator'))).toContain('지금 쓸 수 있는 것');
  });
  it('15개 slug 모두 같은 템플릿으로 그려지고 "예정"이 없다', () => {
    for (const f of FEATURES) { const s = text(view(f.slug)); expect(s, f.slug).toContain(f.name); expect(s).not.toContain('예정'); }
  });
  it('원해요 숫자가 0이면 "명이 기다려요" 문장은 숨긴다', () => expect(text(view('resume', { resume: 0 }))).not.toContain('명이 기다려요'));
});

// ---------- 원해요 ----------
describe('원해요 버튼', () => {
  it('처음에는 눌리기 전 모양(원해요 + 숫자)', () => {
    const html = renderToStaticMarkup(<VoteButton slug="resume" count={7} />);
    expect(html).toContain('aria-pressed="false"');
    expect(text(html)).toContain('원해요 7');
  });
});

describe('원해요 보내기 (한 번만, 실패하면 되돌림)', () => {
  const ok = () => Promise.resolve(new Response('{"status":"ok"}', { status: 200 }));
  beforeEach(() => unmarkVoted('tax-refund'));
  afterEach(() => unmarkVoted('tax-refund'));
  it('성공하면 표시가 남고, 같은 기능을 또 누르면 보내지 않는다', async () => {
    const send = vi.fn((...args: [string, RequestInit]) => { void args; return ok(); });
    expect(await castVote('tax-refund', send as never)).toBe('ok');
    expect(hasVoted('tax-refund')).toBe(true);
    expect(await castVote('tax-refund', send as never)).toBe('already');
    expect(send).toHaveBeenCalledTimes(1);
    expect(JSON.parse((send.mock.calls[0]![1] as RequestInit).body as string)).toEqual({ slug: 'tax-refund' });
  });
  it('서버 오류(500)·네트워크 끊김이면 표시를 되돌린다(다시 누를 수 있다)', async () => {
    expect(await castVote('tax-refund', (() => Promise.resolve(new Response('{}', { status: 500 }))) as never)).toBe('failed');
    expect(hasVoted('tax-refund')).toBe(false);
    expect(await castVote('tax-refund', (() => Promise.reject(new Error('offline'))) as never)).toBe('failed');
    expect(hasVoted('tax-refund')).toBe(false);
    expect(await castVote('tax-refund', ok as never)).toBe('ok');
  });
  it('너무 잦은 요청(429)은 조용히 되돌린다', async () => {
    expect(await castVote('tax-refund', (() => Promise.resolve(new Response('{}', { status: 429 }))) as never)).toBe('limited');
    expect(hasVoted('tax-refund')).toBe(false);
  });
});

// ---------- api/vote ----------
const mocks = vi.hoisted(() => ({ checkRateLimit: vi.fn<(...a: unknown[]) => Promise<boolean>>(), addVote: vi.fn<(...a: unknown[]) => Promise<void>>() }));
vi.mock('@/lib/data/admin', () => ({ getServiceKey: () => 'test-service-key', getAdminClient: () => { throw new Error('사용 안 함'); } }));
vi.mock('@/lib/data/mutations', () => ({ checkRateLimit: mocks.checkRateLimit, addVote: mocks.addVote }));
const voteRoute = await import('@/app/api/vote/route');
const post = (body: unknown, raw?: string) => voteRoute.POST(new Request('http://localhost/api/vote', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '203.0.113.9' }, body: raw ?? JSON.stringify(body) }));

describe('POST /api/vote', () => {
  beforeEach(() => { mocks.checkRateLimit.mockReset().mockResolvedValue(true); mocks.addVote.mockReset().mockResolvedValue(undefined); });
  it('알려진 slug면 기능 이름만 저장한다', async () => {
    const res = await post({ slug: 'resume' });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
    expect(mocks.addVote).toHaveBeenCalledWith('resume');
  });
  it('모르는 slug·이상한 본문은 400, 저장 안 함', async () => {
    for (const body of [{ slug: 'hack' }, { slug: 5 }, {}, [1]]) expect((await post(body)).status).toBe(400);
    expect((await post(null, '{깨짐')).status).toBe(400);
    expect(mocks.addVote).not.toHaveBeenCalled();
  });
  it('1분에 20번을 넘으면 429(IP는 해시로만)', async () => {
    mocks.checkRateLimit.mockResolvedValue(false);
    expect((await post({ slug: 'resume' })).status).toBe(429);
    const [bucket, hash, limit, win] = mocks.checkRateLimit.mock.calls[0]!;
    expect([bucket, limit, win]).toEqual(['vote', 20, 60]);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(mocks.addVote).not.toHaveBeenCalled();
  });
  it('서버 오류는 500', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.addVote.mockRejectedValue(new Error('원해요 저장 실패: 08006'));
    expect((await post({ slug: 'resume' })).status).toBe(500);
    spy.mockRestore();
  });
});

// ---------- 가이드 ----------
const ctx: GuideFactContext = {
  facts: [
    { key: 'proof_amount', value_num: 2500, value_text: null, currency: 'CAD' },
    { key: 'employer_limit_months', value_num: 6, value_text: null, currency: null },
    { key: 'apply_method', value_num: null, value_text: '대사관 방문', currency: null },
    { key: 'no_fulltime', value_num: 1, value_text: null, currency: null },
    { key: 'annual_quota', value_num: 5000, value_text: null, currency: null },
  ],
  keyTypes: { proof_amount: 'money', employer_limit_months: 'months', apply_method: 'text', no_fulltime: 'boolean', annual_quota: 'number' },
  rates: [{ currency: 'CAD', krw_per_unit: 1000, rate_date: '2026-11-09' }],
};
describe('가이드 {fact_key} 자리표시자', () => {
  it('DB 값으로 채운다: 돈(원화 같이)·개월·글·예/아니요·숫자', () => {
    expect(formatFact('proof_amount', ctx, '2026-11-11')).toBe('CAD 2,500 (약 250만 원)');
    expect(formatFact('employer_limit_months', ctx, '2026-11-11')).toBe('6개월');
    expect(formatFact('apply_method', ctx, '2026-11-11')).toBe('대사관 방문');
    expect(formatFact('no_fulltime', ctx, '2026-11-11')).toBe('예');
    expect(formatFact('annual_quota', ctx, '2026-11-11')).toBe('5,000');
  });
  it('값이 없거나 모르는 키는 "확인 중"(지어내지 않음)', () => {
    expect(formatFact('visa_fee', ctx, '2026-11-11')).toBe('확인 중');
    expect(fillFacts('비용은 {visa_fee}, 기간은 {employer_limit_months}예요.', ctx, '2026-11-11')).toBe('비용은 확인 중, 기간은 6개월예요.');
    expect(fillFacts('중괄호 아님 {Not Key} {123}', ctx, '2026-11-11')).toBe('중괄호 아님 {Not Key} {123}');
  });
  it('환율이 없는 통화는 원화 환산만 빠진다', () => {
    expect(formatFact('proof_amount', { ...ctx, rates: [] }, '2026-11-11')).toBe('CAD 2,500');
  });
});

describe('가이드 마크다운과 화면', () => {
  it('제목·목록·문단·굵게·https 링크만 읽는다', () => {
    const blocks = parseMarkdown('## 제목\n\n본문 **굵게** [링크](https://example.com/a)\n\n- 하나\n- 둘\n\n### 소제목\n끝');
    expect(blocks.map((b) => b.t)).toEqual(['h2', 'p', 'ul', 'h3', 'p']);
    expect(blocks[1]).toMatchObject({ t: 'p', inline: [{ t: 'text' }, { t: 'bold', text: '굵게' }, { t: 'text' }, { t: 'link', text: '링크', href: 'https://example.com/a' }] });
  });
  it('HTML·javascript: 링크는 글자로만 보여 주고 풀지 않는다', () => {
    const html = renderToStaticMarkup(<GuideArticle title="글" country={null} date={null} needsReview={false} blocks={parseMarkdown('<script>alert(1)</script> [나쁜](javascript:alert(1))')} />);
    expect(html).not.toContain('<script');
    expect(html).not.toContain('href="javascript');
    expect(html).toContain('&lt;script&gt;');
  });
  it('외부 링크는 새 탭 + rel=noopener', () => {
    const html = renderToStaticMarkup(<GuideArticle title="글" country={null} date={null} needsReview={false} blocks={parseMarkdown('[공식](https://example.com)')} />);
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer nofollow"');
  });
  it('정보가 바뀌어 다시 확인 중이면 맨 위 안내, 아니면 없음', () => {
    const on = text(renderToStaticMarkup(<GuideArticle title="글" country="일본" date="2026-11-05" needsReview blocks={[]} />));
    expect(on).toContain('일부 정보가 바뀌어 다시 확인하는 중이에요');
    expect(on.indexOf('일부 정보가')).toBeLessThan(on.indexOf('글 일본'));
    expect(on).toContain('확인일 2026년 11월 5일');
    expect(text(renderToStaticMarkup(<GuideArticle title="글" country={null} date={null} needsReview={false} blocks={[]} />))).not.toContain('일부 정보가');
  });
  it('0개면 빈 상태: "곧 올라올 글"(제목만, 링크 아님) + 알림 신청', () => {
    const html = renderToStaticMarkup(<GuidesView guides={[]} planned={['캐나다 IEC 2027 준비법', '워홀 첫 달 필요한 돈 계산법']} />);
    const s = text(html);
    expect(s).toContain('첫 글을 준비하고 있어요');
    expect(s).toContain('곧 올라올 글');
    for (const title of ['캐나다 IEC 2027 준비법', '워홀 첫 달 필요한 돈 계산법']) expect(s).toContain(title);
    expect(html).not.toMatch(/href="\/guides\//);
    expect(s).toContain('새 글이 올라오면 알려 드릴게요');
  });
  it('올릴 글을 다 올려서 "곧 올라올 글" 문구 목록이 비면, 목록 상자 없이 빈 상태 안내와 알림 신청만', () => {
    expect(copy['guides.planned']).toBe(''); // 두 글을 올려서 제목을 지웠다(D-128)
    const s = text(renderToStaticMarkup(<GuidesView guides={[]} />));
    expect(s).toContain('첫 글을 준비하고 있어요');
    expect(s).not.toContain('곧 올라올 글');
    expect(s).toContain('새 글이 올라오면 알려 드릴게요');
  });
  it('글이 있으면 목록(제목 링크 + 확인일)', () => {
    const html = renderToStaticMarkup(<GuidesView guides={[{ slug: 'jp-start', title: '일본 시작', summary: '요약', date: '2026-11-05' }]} />);
    expect(html).toContain('href="/guides/jp-start"');
    expect(text(html)).toContain('확인일 2026년 11월 5일');
    expect(text(html)).not.toContain('첫 글을 준비하고 있어요');
  });
});

// ---------- 공유 ----------
const rows = snapshot as unknown as DbRows;
const data = adaptRows(rows, { asOf: '2026-11-11' });
const answers = { ...PERSONA_ANSWERS[0]!.answers, q1: { none: false, codes: ['CA'] } };
const checked = validateAnswers(answers, { countries: data.active.map((a) => a.engine), config: data.config, minAge: data.minAge!, maxAge: data.maxAge! });
if (!checked.ok) throw new Error(checked.reason);
const result = computeResult(checked.answers, data, '2026-11-11', rows);

describe('공유 이미지 값', () => {
  const share = buildShareData(checked.answers, result)!;
  it('카드 나라·%·한 줄·TOP 3 이름·%만 들어 있다(답변 값 없음)', () => {
    expect(Object.keys(share).sort()).toEqual(['code', 'headline', 'itemCount', 'name', 'okCount', 'pct', 'top3', 'topTitle']);
    expect(share.name).toBe('캐나다');
    expect(share.pct).toBe(result.ranked.find((r) => r.code === 'CA')!.pct);
    expect(share.top3).toHaveLength(3);
    expect(share.top3.every((r) => Object.keys(r).sort().join() === 'code,name,pct')).toBe(true);
    const json = JSON.stringify(share);
    for (const bad of ['q2', 'budget', 'q6', '"age"', 'languages', 'english']) expect(json).not.toContain(bad);
  });
  it('이미지 크기: OG 1200×630, 스토리 1080×1920 PNG', async () => {
    for (const [kind, w, h] of [['og', 1200, 630], ['story', 1080, 1920]] as const) {
      const res = await renderShareImage(kind, share);
      const buf = Buffer.from(await res.arrayBuffer());
      expect(res.headers.get('content-type')).toBe('image/png');
      expect(buf.subarray(1, 4).toString()).toBe('PNG');
      expect([buf.readUInt32BE(16), buf.readUInt32BE(20)]).toEqual([w, h]);
    }
  }, 60000);
  it('저장용 주소는 파일로 내려받게 한다(download)', async () => {
    const res = await renderShareImage('story', share, { download: true });
    expect(res.headers.get('content-disposition')).toContain('attachment');
    expect(res.headers.get('cache-control')).toContain('immutable');
  }, 60000);
  it('결과를 못 읽으면(없는 id) 기본 카드 이미지', async () => {
    const res = await renderShareImage('og', null);
    expect(Buffer.from(await res.arrayBuffer()).subarray(1, 4).toString()).toBe('PNG');
  }, 60000);
});
