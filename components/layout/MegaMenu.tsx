'use client';

import Link from 'next/link';
import { type KeyboardEvent, type RefObject } from 'react';
import { SoonBadge } from './SoonBadge';
import { iconFor } from './navIcons';
import { t } from '@/lib/copy';
import { hrefOf, isCurrentItem, SOON_COUNT, STAGES, type NavItem } from '@/lib/nav';

/** 항목 아래 한 줄 설명. 문구는 copy 파일에 있는 것만 쓴다(없으면 안 보여 줌). */
const SUB: Record<string, string> = { '/test': 'nav.mobile.test.sub', '/countries': 'nav.mobile.countries.sub', '/checklist': 'nav.mobile.checklist.sub' };
const subKeyOf = (item: NavItem) => (item.pickCountry ? 'nav.apps.sub' : item.href ? SUB[item.href] : undefined);

/**
 * 웹 메가 메뉴: 4단계가 한 패널에 열로 열리고, 연 단계가 강조된다(S11_nav-mega_w).
 * 키보드: ↑↓ 같은 단계 안 이동, ←→ 다른 단계로 이동, Home/End 처음·끝, Esc는 Header가 처리해 닫는다.
 */
export function MegaMenu({ open, pathname, panelRef, onNavigate, onClose, onHoverIn, onHoverOut }: {
  open: number; pathname: string; panelRef: RefObject<HTMLDivElement | null>; onNavigate: () => void; onClose: () => void;
  /** 마우스가 패널 안으로 들어옴 / 패널 밖(배경)으로 나감. 닫기는 짧게 미뤄서 메뉴 버튼 → 패널로 옮기는 사이에 깜빡이지 않게 한다 */
  onHoverIn: () => void; onHoverOut: () => void;
}) {
  const links = (stage: number) => Array.from(panelRef.current?.querySelectorAll<HTMLAnchorElement>(`[data-stage="${stage}"] a`) ?? []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const stage = Number(target.closest('[data-stage]')?.getAttribute('data-stage'));
    if (Number.isNaN(stage)) return;
    const list = links(stage);
    const index = list.indexOf(target as HTMLAnchorElement);
    const move = (el?: HTMLElement) => { if (el) { e.preventDefault(); el.focus(); } };
    if (e.key === 'ArrowDown') move(list[(index + 1) % list.length]);
    else if (e.key === 'ArrowUp') move(list[(index - 1 + list.length) % list.length]);
    else if (e.key === 'Home') move(list[0]);
    else if (e.key === 'End') move(list[list.length - 1]);
    else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const other = links((stage + (e.key === 'ArrowRight' ? 1 : STAGES.length - 1)) % STAGES.length);
      move(other[Math.min(Math.max(index, 0), other.length - 1)]);
    }
  };

  return (
    <>
      <div aria-hidden="true" onClick={onClose} onMouseEnter={onHoverOut} className="fixed inset-x-0 bottom-0 top-16 z-30 hidden bg-navy/20 lg:block" />
      <div ref={panelRef} onKeyDown={onKeyDown} className="pointer-events-none absolute inset-x-0 top-full z-40 hidden lg:block">
        <div className="pointer-events-auto mx-auto max-w-content px-10 pt-2" onMouseEnter={onHoverIn}>
          <div className="overflow-hidden rounded-card-lg bg-white shadow-float">
            <div className="grid grid-cols-4 divide-x divide-line">
              {STAGES.map((stage, i) => (
                <section key={stage.id} data-stage={i} aria-label={t(stage.labelKey)} className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className={`flex size-8 items-center justify-center rounded-full text-body font-extrabold ${open === i ? 'bg-aqua-dark text-white' : 'bg-aqua-100 text-aqua-dark'}`}>{i + 1}</span>
                    <p className={`text-h3 ${open === i ? 'text-aqua-dark' : 'text-navy'}`}>{t(stage.labelKey)}</p>
                  </div>
                  <ul className="flex flex-col gap-1">
                    {stage.items.map((item) => {
                      const Icon = iconFor(item);
                      const current = isCurrentItem(item, pathname);
                      const subKey = subKeyOf(item);
                      return (
                        <li key={item.label}>
                          <Link
                            href={hrefOf(item)} onClick={onNavigate} aria-current={current ? 'page' : undefined}
                            className="flex min-h-11 items-center gap-3 rounded-button px-2 py-2 hover:bg-subtle"
                          >
                            <span className={`flex size-9 shrink-0 items-center justify-center rounded-button ${item.soon ? 'bg-subtle text-text3' : 'bg-aqua-100 text-aqua-dark'}`}>
                              <Icon aria-hidden="true" className="size-5" />
                            </span>
                            <span className="flex-1">
                              <span className={`block text-body text-navy ${current ? 'font-extrabold' : 'font-medium'}`}>{item.label}</span>
                              {subKey ? <span className="block text-caption text-text2">{t(subKey)}</span> : null}
                            </span>
                            {item.soon ? <SoonBadge /> : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
            <div className="flex justify-end bg-aqua-50 px-6 py-3">
              <Link href="/soon" onClick={onNavigate} className="inline-flex min-h-11 items-center gap-2 text-body font-extrabold text-aqua-dark">
                {t('nav.soonAll', { n: SOON_COUNT })}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
