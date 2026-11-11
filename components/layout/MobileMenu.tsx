'use client';

import Link from 'next/link';
import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Compass, LogIn, Megaphone, Rocket, ShieldQuestion, X } from 'lucide-react';
import { Logo, RegionSwitch } from './HeaderParts';
import { SoonBadge } from './SoonBadge';
import { ReportLink } from '@/components/report/ReportLink';
import { SoonLink } from '@/components/soon/SoonLink';
import { iconFor } from './navIcons';
import { t } from '@/lib/copy';
import { COMMUNITY, hrefOf, isCommunity, isCurrentItem, SOON_COUNT, STAGES, stageIndexFor } from '@/lib/nav';

/**
 * 모바일 전체 화면 메뉴 (SPEC 1장). 단계별로 접고 펼치며 지금 페이지가 속한 단계만 펼쳐서 연다.
 * 열려 있는 동안 뒤 화면은 스크롤되지 않고, Esc로 닫히고, Tab은 메뉴 안에서만 돈다. 항목을 누르면 닫히고 이동한다.
 * 닫을 때 햄버거 버튼으로 포커스를 돌려주는 일은 Header가 한다.
 */
export function MobileMenu({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const [expanded, setExpanded] = useState<number | null>(() => stageIndexFor(pathname));
  const root = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  // 뒤 화면 스크롤 잠금 + 처음 포커스는 닫기 버튼
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    return () => { document.body.style.overflow = previous; };
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
    if (e.key !== 'Tab') return;
    const focusable = Array.from(root.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const small = 'flex min-h-11 items-center justify-between text-body text-text2';
  return (
    <div ref={root} role="dialog" aria-modal="true" aria-label={t('nav.main')} onKeyDown={onKeyDown} className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden">
      <div className="flex h-16 shrink-0 items-center justify-between px-5">
        <Logo onClick={onClose} />
        <button ref={closeButton} type="button" onClick={onClose} aria-label={t('nav.close')} className="flex size-11 items-center justify-center rounded-full bg-subtle text-navy">
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <RegionSwitch pathname={pathname} onNavigate={onClose} wide />
        <nav aria-label={t('nav.main')} className="mt-4">
          {STAGES.map((stage, i) => {
            const open = expanded === i;
            const id = `mobile-stage-${stage.id}`;
            return (
              <div key={stage.id} className={open ? 'my-1 rounded-card bg-subtle p-2' : ''}>
                <h2>
                  <button
                    type="button" aria-expanded={open} aria-controls={id} onClick={() => setExpanded(open ? null : i)}
                    className={`flex min-h-12 w-full items-center justify-between px-2 text-left text-h3 ${stageIndexFor(pathname) === i ? 'font-black text-navy' : 'font-bold text-navy'}`}
                  >
                    {t(stage.labelKey)}
                    <ChevronDown aria-hidden="true" className={`size-5 text-text3 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                </h2>
                {open ? (
                  <ul id={id} className="flex flex-col gap-2 pb-1">
                    {stage.items.map((item) => {
                      const Icon = iconFor(item);
                      const current = isCurrentItem(item, pathname);
                      return (
                        <li key={item.label}>
                          <Link
                            href={hrefOf(item)} onClick={onClose} aria-current={current ? 'page' : undefined}
                            className={`flex min-h-12 items-center gap-3 rounded-card px-3 ${item.soon ? '' : 'bg-white shadow-card'}`}
                          >
                            <span className={`flex size-9 shrink-0 items-center justify-center rounded-button ${item.soon ? 'bg-white text-text3' : 'bg-aqua-100 text-aqua-dark'}`}>
                              <Icon aria-hidden="true" className="size-5" />
                            </span>
                            <span className={`flex-1 text-body ${item.soon ? 'text-text2' : 'text-navy'} ${current ? 'font-extrabold' : item.soon ? 'font-medium' : 'font-bold'}`}>{item.label}</span>
                            {item.soon ? <SoonBadge /> : <ChevronRight aria-hidden="true" className="size-4 text-text3" />}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            );
          })}
          <SoonLink variant="community" href={COMMUNITY.href} onOpen={onClose} aria-current={isCommunity(pathname) ? 'page' : undefined} className="flex min-h-12 items-center justify-between px-2">
            <span className={`flex items-center gap-2 text-h3 text-navy ${isCommunity(pathname) ? 'font-black' : 'font-bold'}`}>
              {t('nav.community')}
              <SoonBadge />
            </span>
            <ChevronRight aria-hidden="true" className="size-5 text-text3" />
          </SoonLink>
        </nav>

        <ul className="mt-4 border-t border-line pt-3">
          <li><SoonLink variant="login" href={COMMUNITY.href} onOpen={onClose} className={small}><span className="flex items-center gap-2">{t('nav.login')}<SoonBadge /></span><LogIn aria-hidden="true" className="size-4 text-text3" /></SoonLink></li>
          <li><Link href="/soon" onClick={onClose} className={small}>{t('nav.soonAll', { n: SOON_COUNT })}<Rocket aria-hidden="true" className="size-4 text-text3" /></Link></li>
          <li><Link href="/privacy" onClick={onClose} className={small}>{t('footer.privacy')}<ShieldQuestion aria-hidden="true" className="size-4 text-text3" /></Link></li>
          <li><ReportLink fallback="footer" onOpen={onClose} className={small}>{t('footer.report')}<Megaphone aria-hidden="true" className="size-4 text-text3" /></ReportLink></li>
        </ul>
      </div>

      <div className="shrink-0 border-t border-line bg-white px-5 py-3">
        <Link href="/test" onClick={onClose} className="flex h-12 w-full items-center justify-center gap-2 rounded-button bg-coral font-extrabold text-navy shadow-coral hover:bg-coral-hover">
          <Compass aria-hidden="true" className="size-5" />
          {t('landing.cta')}
        </Link>
      </div>
    </div>
  );
}
