import nav from '@/content/nav_ko.json';
import features from '@/content/features_ko.json';

/**
 * 헤더·메가 메뉴·모바일 메뉴가 같이 쓰는 메뉴 데이터와 "지금 페이지" 판단 (SPEC.md 1장, D-004).
 * 메뉴 항목과 주소는 content/nav_ko.json 한 곳에서만 읽는다. 순수 함수라서 화면 없이 테스트한다.
 */
export interface NavItem {
  label: string;
  href: string | null;
  soon?: boolean;
}
export interface NavStage {
  id: string;
  labelKey: string;
  items: NavItem[];
}

export const STAGES = nav.stages as NavStage[];
export const COMMUNITY = nav.community as { label: string; href: string; soon: boolean };
export const SOON_COUNT = features.features.length;

/** 항목이 가는 주소 (나라별 필수 앱은 /apps, D-130) */
export function hrefOf(item: NavItem): string {
  return item.href ?? '/';
}

/** 주소가 같거나 그 아래 주소면 "지금 페이지". `/`는 정확히 같을 때만. */
export function matches(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** 이 항목이 지금 페이지인가. */
export function isCurrentItem(item: NavItem, pathname: string): boolean {
  return matches(hrefOf(item), pathname);
}

/** 지금 페이지가 속한 단계 번호(0~3). 없으면 null. 결과·비교 화면은 "나라 고르기"에 속한다. */
export function stageIndexFor(pathname: string): number | null {
  const found = STAGES.findIndex((stage) => stage.items.some((item) => isCurrentItem(item, pathname)));
  if (found >= 0) return found;
  if (matches('/r', pathname) || matches('/compare', pathname)) return 0;
  return null;
}

export const isCommunity = (pathname: string): boolean => matches(COMMUNITY.href, pathname);

/** To Korea 구역인가. 고른 쪽을 기억하지 않고 주소만 본다(SPEC 1장). */
export const isToKorea = (pathname: string): boolean => matches('/to-korea', pathname);
