import Link from 'next/link';
import type { ReactNode } from 'react';
import { t, tEn } from '@/lib/copy';
import ko from '@/content/privacy_ko.json';
import en from '@/content/privacy_en.json';

type Block = { t: 'h'; text: string } | { t: 'p'; text: string } | { t: 'ul'; items: string[] } | { t: 'table'; head: string[]; rows: string[][] };
interface Doc { title: string; meta: string; blocks: Block[] }
type Lang = 'ko' | 'en';

/**
 * 처리방침 (SPEC 16장). 본문은 docs/legal/privacy.md → content/privacy_*.json(scripts/build_privacy_content.py).
 * 원본의 대괄호 [ ] 칸은 "[공개 전 채움: …]"으로 눈에 띄게 남겨서 오픈 전 체크리스트로 확인한다.
 * 수집 동의문은 이메일 신청 모달의 "보기"와 같은 문구 키(consent.* / tk.consent.*)를 쓴다.
 */
const DOCS: Record<Lang, Doc> = { ko: ko as Doc, en: en as Doc };

function Inline({ text, lang }: { text: string; lang: Lang }): ReactNode {
  const fill = lang === 'en' ? tEn('pp.fill') : t('privacy.fill');
  return text.split(/(\*\*[^*]+\*\*|\[[^\]]*\])/).map((part, i) => {
    if (part.startsWith('**')) return <strong key={i} className="font-extrabold text-navy">{part.slice(2, -2)}</strong>;
    if (part.startsWith('[')) {
      const inner = part.slice(1, -1).trim();
      return <mark key={i} data-fill className="rounded bg-lime-50 px-1 font-extrabold text-lime-dark">[{fill}{inner ? `: ${inner}` : ''}]</mark>;
    }
    return part;
  });
}

function Table({ head, rows, lang }: { head: string[]; rows: string[][]; lang: Lang }) {
  return (
    <div className="overflow-x-auto rounded-card border border-line">
      <table className="w-full min-w-max border-collapse text-left text-body">
        <thead><tr className="bg-subtle text-caption font-extrabold text-text2">{head.map((h) => <th key={h} scope="col" className="px-3 py-2">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-line">
          {rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="max-w-72 px-3 py-2 align-top text-text2 first:font-extrabold first:text-navy"><Inline text={c} lang={lang} /></td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

function Consent({ lang }: { lang: Lang }) {
  const k = lang === 'en' ? { title: 'tk.consent.title', a: 'tk.consent.col.item', b: 'tk.consent.col.purpose', c: 'tk.consent.col.keep', i: 'tk.consent.item', p: 'tk.consent.purpose', kp: 'tk.consent.keep', d: 'tk.consent.decline' } : { title: 'consent.title', a: 'consent.col.item', b: 'consent.col.purpose', c: 'consent.col.keep', i: 'consent.item', p: 'consent.purpose', kp: 'consent.keep', d: 'consent.decline' };
  const tr = lang === 'en' ? tEn : t;
  return (
    <section aria-labelledby="consent-h" className="rounded-card-lg bg-aqua-50 p-5">
      <h2 id="consent-h" className="text-h3 text-navy">{lang === 'en' ? tEn('pp.consent') : t('privacy.consent.heading')}</h2>
      <p className="mt-2 text-body font-extrabold text-navy">{tr(k.title)}</p>
      <Table head={[tr(k.a), tr(k.b), tr(k.c)]} rows={[[tr(k.i), tr(k.p), tr(k.kp)]]} lang={lang} />
      <p className="mt-3 text-body text-text2">{tr(k.d)}</p>
    </section>
  );
}

export function PrivacyDoc({ lang }: { lang: Lang }) {
  const doc = DOCS[lang];
  const draft = lang === 'en' ? tEn('pp.draft') : t('privacy.draft');
  return (
    <main lang={lang} className="mx-auto w-full max-w-3xl px-5 pb-16 pt-6 lg:px-10">
      <nav aria-label="language" className="flex items-center justify-end gap-3 text-body font-extrabold">
        <Link href="/privacy" aria-current={lang === 'ko' ? 'true' : undefined} lang="ko" className={`inline-flex min-h-11 items-center underline-offset-4 ${lang === 'ko' ? 'text-navy underline' : 'text-text2'}`}>{t('privacy.lang.ko')}</Link>
        <Link href="/privacy?lang=en" aria-current={lang === 'en' ? 'true' : undefined} lang="en" className={`inline-flex min-h-11 items-center underline-offset-4 ${lang === 'en' ? 'text-navy underline' : 'text-text2'}`}>{t('privacy.lang.en')}</Link>
      </nav>
      <h1 className="mt-2 text-h1 text-navy">{doc.title}</h1>
      <p className="mt-1 text-body text-text2">{doc.meta}</p>
      <p role="note" className="mt-4 rounded-card bg-lime-50 p-3 text-caption font-extrabold text-lime-dark">{draft}</p>

      <div className="mt-6"><Consent lang={lang} /></div>

      <div className="mt-8 flex flex-col gap-4">
        {doc.blocks.map((b, i) => {
          if (b.t === 'h') return <h2 key={i} className="mt-4 text-h3 text-navy">{b.text}</h2>;
          if (b.t === 'p') return <p key={i} className="text-body text-text2"><Inline text={b.text} lang={lang} /></p>;
          if (b.t === 'ul') return <ul key={i} className="list-disc space-y-1 pl-5 text-body text-text2">{b.items.map((it, j) => <li key={j}><Inline text={it} lang={lang} /></li>)}</ul>;
          return <Table key={i} head={b.head} rows={b.rows} lang={lang} />;
        })}
      </div>
    </main>
  );
}
