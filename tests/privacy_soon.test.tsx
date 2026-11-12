import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PrivacyDoc } from '@/components/privacy/PrivacyDoc';
import { ReportForm } from '@/components/report/ReportForm';
import { SubscribeForm } from '@/components/soon/SubscribeForm';
import ToKorea from '@/app/to-korea/page';
import copyEn from '@/content/copy_en.json';
import copyKo from '@/content/copy_ko.json';
import privacyEn from '@/content/privacy_en.json';
import privacyKo from '@/content/privacy_ko.json';
import { contextFromPath } from '@/lib/report';
import { t, tEn } from '@/lib/copy';

const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/\s+/g, ' ');
const ko = copyKo as Record<string, string>;
const en = copyEn as Record<string, string>;

describe('이메일 신청 폼', () => {
  const html = renderToStaticMarkup(<SubscribeForm lang="ko" section="launch" />);
  it('동의 체크박스는 처음에 비어 있고, 버튼은 꺼져 있다', () => {
    expect(html).toMatch(/<input type="checkbox"(?![^>]*checked)/);
    expect(html).toMatch(/<button type="submit" disabled=""/);
  });
  it('동의문은 처음에 접혀 있고 "보기"로 펼친다(aria-expanded=false)', () => {
    expect(html).toContain('aria-expanded="false"');
    expect(text(html)).toContain('보기');
    expect(text(html)).not.toContain(ko['consent.keep']!);
  });
  it('문구는 copy 키에서: 이메일·동의·알림 받기·안내 문장', () => {
    const s = text(html);
    for (const k of ['soon.email', 'soon.consent', 'soon.submit', 'soon.modal.note']) expect(s, k).toContain(ko[k]!);
    expect(html).toContain('type="email"');
    expect(html).toContain('autoComplete="email"');
  });
  it('영어판(To Korea)은 영어 문구만', () => {
    const e = text(renderToStaticMarkup(<SubscribeForm lang="en" section="to_korea" />));
    for (const k of ['tk.email', 'tk.consent', 'tk.cta', 'tk.note']) expect(e, k).toContain(en[k]!);
    expect(e).not.toMatch(/[가-힣]/);
  });
});

describe('To Korea 페이지(/to-korea)', () => {
  const html = renderToStaticMarkup(<ToKorea />);
  it('화면 전체가 영어다(한글 없음), lang="en"', () => {
    expect(html).toContain('lang="en"');
    expect(text(html)).not.toMatch(/[가-힣]/);
  });
  it('제목·스티커·카드 3장·처리방침 영어판 링크', () => {
    const s = text(html);
    for (const k of ['tk.title', 'tk.sticker', 'tk.card1', 'tk.card2', 'tk.card3', 'tk.cta']) expect(s, k).toContain(en[k]!);
    expect(html).toContain('href="/privacy?lang=en"');
  });
  it('근거 없는 숫자·제휴 주장은 없다(와이어프레임의 "1,240+ travelers", "officially partnering")', () => {
    expect(text(html)).not.toMatch(/1,240|officially partnering|25\+ partner/i);
  });
});

describe('제보 폼', () => {
  const ctx = { country: 'JP', countryName: '일본', screen: 'country' as const, section: 'work', path: '/countries/JP' };
  const html = renderToStaticMarkup(<ReportForm ctx={ctx} onClose={() => {}} />);
  it('"일본 · 나라 상세"가 위에 보이고 연락처 칸이 없다, 글자 수 0 / 2000', () => {
    const s = text(html);
    expect(s).toContain('일본 · 나라 상세');
    expect(s).toContain('0 / 2000');
    expect(s).toContain(ko['report.noContact']!);
    expect(html).not.toMatch(/type="(email|tel)"/);
  });
  it('내용이 5자 미만이면 보내기 버튼이 꺼져 있다', () => {
    expect(html).toMatch(/<button type="submit" disabled=""/);
  });
  it('화면·나라는 주소에서도 알아낸다(푸터의 제보하기)', () => {
    expect(contextFromPath('/countries/jp')).toEqual({ screen: 'country', country: 'JP' });
    expect(contextFromPath('/r/abc')).toEqual({ screen: 'result', country: null });
    expect(contextFromPath('/r/abc/compare')).toEqual({ screen: 'compare', country: null });
    expect(contextFromPath('/compare')).toEqual({ screen: 'compare', country: null });
    expect(contextFromPath('/countries')).toEqual({ screen: 'countries', country: null });
    expect(contextFromPath('/checklist')).toEqual({ screen: 'checklist', country: null });
    expect(contextFromPath('/guides', 'footer')).toEqual({ screen: 'footer', country: null });
  });
});

describe('처리방침(/privacy)', () => {
  const koHtml = renderToStaticMarkup(<PrivacyDoc lang="ko" />);
  const enHtml = renderToStaticMarkup(<PrivacyDoc lang="en" />);
  it('버전·시행일이 맨 위에 있고 언어 전환 링크가 있다', () => {
    expect(text(koHtml)).toContain('시행일: 2026년 12월 1일 · 버전 1.0');
    expect(text(enHtml)).toContain('Effective: December 1, 2026 · Version 1.0');
    expect(koHtml).toContain('href="/privacy?lang=en"');
    expect(enHtml).toContain('href="/privacy"');
  });
  it('원본(privacy.md)의 모든 문단·표·목록이 화면에 나온다', () => {
    const doc = privacyKo as { blocks: ({ t: string; text?: string; items?: string[]; rows?: string[][]; head?: string[] })[] };
    const body = text(koHtml);
    const plain = (s: string) => s.replace(/\*\*/g, '').split(/\[[^\]]*\]/).find((x) => x.trim().split(/\s+/).length >= 3) ?? s.replace(/\[[^\]]*\]/g, '');
    for (const b of doc.blocks) {
      if (b.t === 'h' || b.t === 'p') expect(body, b.text).toContain(plain(b.text!).split(/\s+/).filter(Boolean).slice(0, 4).join(' '));
      if (b.t === 'ul') for (const it of b.items!) expect(body).toContain(plain(it).split(/\s+/).filter(Boolean).slice(0, 3).join(' '));
      if (b.t === 'table') for (const h of b.head!) expect(body).toContain(h);
    }
    expect(doc.blocks.filter((b) => b.t === 'h')).toHaveLength(9);
  });
  it('빈칸이 모두 채워져 있다(오픈일 12/1 기준): 남은 [ ] 칸과 "공개 전 채움" 표시가 0개', () => {
    expect(koHtml.match(/<mark data-fill/g) ?? []).toHaveLength(0);
    expect(enHtml.match(/<mark data-fill/g) ?? []).toHaveLength(0);
    expect(text(koHtml).replace(ko['privacy.draft']!, '')).not.toContain('공개 전 채움'); // 위쪽 안내 문장(privacy.draft)은 11/20 확정 때 뺀다(launch_checklist B)
    expect(text(enHtml).replace(en['pp.draft']!, '')).not.toContain('to fill before launch');
    const strings = (v: unknown): string[] => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);
    for (const doc of [privacyKo, privacyEn]) expect(strings(doc).flatMap((s) => s.match(/\[[^\]]*\](?!\()/g) ?? [])).toEqual([]); // 마크다운 링크 [글](주소)는 제외
    expect(text(koHtml)).toContain('yvonnesung.work@gmail.com');
    expect(text(koHtml)).toContain('Google LLC');
    expect(text(koHtml)).toContain('ap-northeast-2');
    expect(text(enHtml)).toContain('yvonnesung.work@gmail.com');
    expect(text(koHtml)).toContain(ko['privacy.draft']!);
  });
  it('수집 동의문은 이메일 신청 모달과 같은 문구 키를 쓴다(한국어·영어)', () => {
    for (const k of ['consent.title', 'consent.item', 'consent.purpose', 'consent.keep', 'consent.decline']) expect(text(koHtml), k).toContain(ko[k]!);
    for (const k of ['tk.consent.title', 'tk.consent.item', 'tk.consent.purpose', 'tk.consent.keep', 'tk.consent.decline']) expect(text(enHtml), k).toContain(en[k]!);
  });
  it('처리방침의 보관 기간과 동의문 보관 기간이 서로 같은 약속이다(30일 이내, 최대 2027-12-31)', () => {
    const rows = JSON.stringify(privacyKo);
    expect(rows).toContain('30일 이내 파기');
    expect(rows).toContain('2027년 12월 31일');
    expect(ko['consent.keep']).toContain('30일 이내');
    expect(ko['consent.keep']).toContain('2027년 12월 31일');
    expect(JSON.stringify(privacyEn)).toContain('December 31, 2027');
  });
  it('영어판은 한글이 없다(언어 전환 라벨 "한국어"와 앱 안의 버튼 이름 "원해요"만)', () => {
    const e = text(enHtml).replace('한국어', '').replace('"원해요"', '');
    expect(e).not.toMatch(/[가-힣]/);
  });
});

describe('문구 키', () => {
  it('t/tEn이 키를 풀어 준다', () => {
    expect(t('soon.done.exists')).toBe('이미 신청했어요');
    expect(tEn('tk.done')).toBe("You're on the list!");
    expect(tEn('report.none' as never)).toBe('report.none');
  });
  it('삭제한 soon.consent.detail은 더 이상 없다', () => expect(ko['soon.consent.detail']).toBeUndefined());
});
