import Image from 'next/image';
import Link from 'next/link';
import { t } from '@/lib/copy';
import { isToKorea } from '@/lib/nav';

/**
 * 로고 (S11, logo-v4 확정 로고): 누르면 첫 화면. 360px 이상은 글자가 들어간 가로 로고, 더 좁은 화면은 배지만(모바일 32px·웹 36px).
 * 파일은 public/brand/*.svg. 두 그림 중 하나만 보이고(display: none은 스크린리더도 읽지 않는다) 대체 글은 같은 문구 키다.
 */
export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="inline-flex min-h-11 shrink-0 items-center">
      <Image src="/brand/woholog-logo.svg" alt={t('brand.logoAlt')} width={167} height={36} unoptimized priority className="hidden h-8 w-auto xs:block lg:h-9" />
      <Image src="/brand/woholog-badge.svg" alt={t('brand.logoAlt')} width={36} height={36} unoptimized priority className="block size-9 xs:hidden" />
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
  const base = `inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-pill font-bold ${wide ? 'px-3 text-body' : 'px-2 text-caption sm:px-2.5 lg:px-3 lg:text-body'}`;
  const on = 'bg-navy text-white', off = 'text-text2 hover:text-navy';
  return (
    <div role="group" aria-label={t('nav.switch')} className={`inline-flex shrink-0 rounded-pill bg-subtle p-1 ${wide ? 'flex w-full' : ''}`}>
      <Link href="/" onClick={onNavigate} aria-current={to ? undefined : 'true'} className={`${base} ${wide ? 'flex-1' : ''} ${to ? off : on}`}>{t('nav.from')}</Link>
      <Link href="/to-korea" onClick={onNavigate} aria-current={to ? 'true' : undefined} className={`${base} ${wide ? 'flex-1' : ''} ${to ? on : off}`}>{t('nav.to')}</Link>
    </div>
  );
}
