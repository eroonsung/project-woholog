'use client';

import { useEffect, useState } from 'react';
import { t } from '@/lib/copy';

export const SECTIONS = ['summary', 'money', 'work', 'apply', 'life', 'apps', 'partners', 'sources'] as const;
export type SectionId = (typeof SECTIONS)[number];

/**
 * 나라 상세 목차 (SPEC 8장). 웹: 왼쪽에서 스크롤을 따라오고 지금 보는 섹션에 점을 찍는다. 모바일: 위쪽 가로 탭.
 * 링크는 `#섹션` 앵커라서 스크립트 없이도 이동한다. 지금 섹션 표시만 브라우저에서 계산한다.
 */
export function DetailToc() {
  const [active, setActive] = useState<SectionId>('summary');

  useEffect(() => {
    const els = SECTIONS.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id as SectionId);
      },
      { rootMargin: '-10% 0px -70% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  const link = (id: SectionId, cls: string, activeCls: string) => (
    <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined} className={`${cls} ${active === id ? activeCls : ''}`}>
      {t(`detail.toc.${id}`)}
    </a>
  );

  return (
    <>
      <nav aria-label={t('detail.toc.title')} className="sticky top-0 z-30 -mx-5 flex gap-2 overflow-x-auto border-b border-line bg-white px-5 py-2 lg:hidden">
        {SECTIONS.map((id) => link(id, 'inline-flex min-h-11 shrink-0 items-center rounded-pill px-4 text-body font-extrabold text-text2', 'bg-aqua-100 text-aqua-dark'))}
      </nav>
      <nav aria-label={t('detail.toc.title')} className="hidden self-start rounded-card-lg bg-subtle p-4 lg:sticky lg:top-6 lg:block">
        <p className="px-2 pb-2 text-caption font-extrabold text-text3">{t('detail.toc.title')}</p>
        <ul className="flex flex-col">
          {SECTIONS.map((id) => (
            <li key={id}>
              <a href={`#${id}`} aria-current={active === id ? 'location' : undefined} className={`flex min-h-11 items-center justify-between rounded-button px-2 text-body ${active === id ? 'font-extrabold text-navy' : 'text-text2'}`}>
                {t(`detail.toc.${id}`)}
                {active === id ? <span aria-hidden="true" className="size-1.5 rounded-full bg-aqua-dark" /> : null}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
