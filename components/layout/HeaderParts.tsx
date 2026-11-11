import Link from 'next/link';
import { t } from '@/lib/copy';
import { isToKorea } from '@/lib/nav';

/** 로고: 아쿠아 "W" 마크 + 서비스 이름 + 코랄 점 (S11). 누르면 첫 화면. */
export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} aria-label={t('brand.name')} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap lg:gap-2">
      <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-button bg-aqua text-body font-black text-navy">W</span>
      <span className="text-body-l font-black text-navy max-xs:hidden lg:text-h3">{t('brand.name')}</span>
      <span aria-hidden="true" className="hidden size-1.5 rounded-full bg-coral lg:block" />
    </Link>
  );
}

/**
 * From Korea / To Korea 전환 (SPEC 1장). From = `/`(한국어), To = `/to-korea`(영어).
 * 고른 쪽을 기억하지 않고 주소만 바뀐다. 지금 구역은 aria-current로도 알려 준다.
 */
export function RegionSwitch({ pathname, onNavigate, wide = false }: { pathname: string; onNavigate?: () => void; wide?: boolean }) {
  const to = isToKorea(pathname);
  // 모바일 헤더(375px)에 로고·전환·햄버거가 다 들어가도록 작게, 모바일 메뉴 안(wide)과 웹에서는 보통 크기
  const base = `inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-pill font-bold ${wide ? 'px-3 text-body' : 'px-2.5 text-caption lg:px-3 lg:text-body'}`;
  const on = 'bg-navy text-white', off = 'text-text2 hover:text-navy';
  return (
    <div role="group" aria-label={t('nav.switch')} className={`inline-flex shrink-0 rounded-pill bg-subtle p-1 ${wide ? 'flex w-full' : ''}`}>
      <Link href="/" onClick={onNavigate} aria-current={to ? undefined : 'true'} className={`${base} ${wide ? 'flex-1' : ''} ${to ? off : on}`}>{t('nav.from')}</Link>
      <Link href="/to-korea" onClick={onNavigate} aria-current={to ? 'true' : undefined} className={`${base} ${wide ? 'flex-1' : ''} ${to ? on : off}`}>{t('nav.to')}</Link>
    </div>
  );
}
