'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu } from 'lucide-react';
import { Logo, RegionSwitch } from './HeaderParts';
import { MegaMenu } from './MegaMenu';
import { MobileMenu } from './MobileMenu';
import { SoonBadge } from './SoonBadge';
import { SoonLink } from '@/components/soon/SoonLink';
import { t } from '@/lib/copy';
import { COMMUNITY, isCommunity, STAGES, stageIndexFor } from '@/lib/nav';

/**
 * 공통 헤더 (SPEC 1장). 웹(1024px 이상): 로고 | From/To | 단계 메뉴 4개 ▾ | 커뮤니티 Soon | 로그인 · 시작하기.
 * 모바일: 로고 + From/To + 햄버거(전체 화면 메뉴).
 * 메가 메뉴는 마우스를 올리거나 클릭하면 열리고, Esc·바깥 클릭·다른 곳으로 이동하면 닫힌다.
 * 키보드: Enter/Space로 열면 첫 항목으로 포커스가 가고, 화살표로 이동한다(MegaMenu).
 * 열림 상태에 "그때의 주소"를 같이 저장해서, 다른 페이지로 이동하면 저절로 닫힌다.
 */
export function Header() {
  const pathname = usePathname();
  const [mega, setMega] = useState<{ stage: number; path: string } | null>(null);
  const [mobile, setMobile] = useState<string | null>(null);
  const open = mega && mega.path === pathname ? mega.stage : null;
  const mobileOpen = mobile === pathname;
  const active = stageIndexFor(pathname);

  const root = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const burger = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<number | null>(null); // 키보드로 열었을 때 첫 항목으로 포커스
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeMega = () => setMega(null);
  const cancelClose = () => { if (closeTimer.current) clearTimeout(closeTimer.current); };
  const scheduleClose = () => { cancelClose(); closeTimer.current = setTimeout(closeMega, 150); };
  const openStage = (stage: number, focusFirst: boolean) => {
    cancelClose();
    pendingFocus.current = focusFirst ? stage : null;
    setMega({ stage, path: pathname });
  };

  useEffect(() => {
    if (open !== null && pendingFocus.current === open) panel.current?.querySelector<HTMLElement>(`[data-stage="${open}"] a`)?.focus();
    pendingFocus.current = null;
  }, [open]);

  // 바깥을 누르면 닫힘
  useEffect(() => {
    if (open === null) return;
    const onDown = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setMega(null); };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && open !== null) { e.preventDefault(); closeMega(); triggers.current[open]?.focus(); }
  };
  const onBlur = (e: React.FocusEvent) => {
    const next = e.relatedTarget as Node | null;
    if (next && !root.current?.contains(next)) setMega(null);
  };
  const closeMobile = () => { setMobile(null); burger.current?.focus(); };

  const bold = (on: boolean) => (on ? 'font-black' : 'font-bold');
  return (
    <header
      ref={root} onKeyDown={onKeyDown} onBlur={onBlur}
      onMouseLeave={scheduleClose} onMouseEnter={cancelClose}
      className="relative z-40 border-b border-line bg-white"
    >
      <div className="mx-auto flex h-16 max-w-content items-center gap-2 px-4 lg:gap-3 lg:px-6 xl:px-10">
        <Logo />
        <RegionSwitch pathname={pathname} />

        <nav aria-label={t('nav.main')} className="hidden min-w-0 flex-1 items-center lg:flex ">
          {STAGES.map((stage, i) => (
            <button
              key={stage.id} ref={(el) => { triggers.current[i] = el; }} type="button"
              aria-expanded={open === i} aria-haspopup="true" aria-label={t('nav.stageOf', { stage: t(stage.labelKey) })}
              onClick={(e) => (open === i ? closeMega() : openStage(i, e.detail === 0))}
              onPointerEnter={(e) => { if (e.pointerType === 'mouse') openStage(i, false); }}
              onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); openStage(i, true); } }}
              className={`inline-flex min-h-11 shrink-0 items-center gap-1 whitespace-nowrap rounded-button px-2 text-body text-navy hover:bg-subtle ${bold(active === i)} ${open === i ? 'bg-aqua-50' : ''}`}
            >
              <span className={active === i ? 'border-b-2 border-aqua-dark' : ''}>{t(stage.labelKey)}</span>
              <ChevronDown aria-hidden="true" className={`hidden size-4 text-text3 transition-transform xl:block ${open === i ? 'rotate-180' : ''}`} />
            </button>
          ))}
          <SoonLink variant="community" href={COMMUNITY.href} aria-current={isCommunity(pathname) ? 'page' : undefined} className={`inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-button px-2 text-body text-navy hover:bg-subtle ${bold(isCommunity(pathname))}`}>
            {t('nav.community')}
            <SoonBadge />
          </SoonLink>
        </nav>

        <div className="ml-auto hidden shrink-0 items-center gap-1 lg:flex">
          {/* 로그인·시작하기는 Coming soon 모달을 연다(스크립트가 없으면 /soon/community로 이동) */}
          <SoonLink variant="login" href={COMMUNITY.href} className="inline-flex min-h-11 items-center whitespace-nowrap px-2 text-body font-bold text-text2 hover:text-navy">{t('nav.login')}</SoonLink>
          <SoonLink variant="login" href={COMMUNITY.href} className="inline-flex h-11 items-center whitespace-nowrap rounded-pill bg-navy px-4 text-body font-extrabold text-white hover:opacity-90">{t('nav.signup')}</SoonLink>
        </div>

        <button
          ref={burger} type="button" onClick={() => setMobile(pathname)} aria-label={t('nav.open')} aria-haspopup="dialog" aria-expanded={mobileOpen}
          className="ml-auto flex size-11 shrink-0 items-center justify-center rounded-full text-navy hover:bg-subtle lg:hidden"
        >
          <Menu aria-hidden="true" className="size-6" />
        </button>
      </div>

      {open !== null ? <MegaMenu open={open} pathname={pathname} panelRef={panel} onNavigate={closeMega} onClose={closeMega} onHoverIn={cancelClose} onHoverOut={scheduleClose} /> : null}
      {mobileOpen ? <MobileMenu pathname={pathname} onClose={closeMobile} /> : null}
    </header>
  );
}
