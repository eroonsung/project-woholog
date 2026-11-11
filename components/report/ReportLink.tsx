'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useModals } from '@/components/modal/ModalHost';
import { isPlainClick } from '@/components/soon/SoonLink';
import { contextFromPath, type ReportScreen } from '@/lib/report';

/**
 * "정보가 틀렸나요? 제보하기" 링크. 누르면 그 화면 위에 제보 모달이 열리고, 나라·화면·섹션이 자동으로 붙는다(SPEC 13장).
 * 스크립트가 없거나 새 탭으로 열면 같은 정보를 주소에 담은 /report?c=&s=&screen= 페이지가 열린다.
 * screen·country를 안 주면 지금 주소에서 알아낸다(푸터).
 */
export function ReportLink({ country, countryName, screen, section, fallback = 'other', className, children, onOpen }: {
  country?: string | null; countryName?: string | null; screen?: ReportScreen; section?: string | null; fallback?: ReportScreen;
  className?: string; children: ReactNode; onOpen?: () => void;
}) {
  const pathname = usePathname() ?? '';
  const { openReport } = useModals();
  const derived = contextFromPath(pathname, fallback);
  const ctx = { country: country ?? derived.country, countryName: countryName ?? null, screen: screen ?? derived.screen, section: section ?? null };
  const params = new URLSearchParams({ screen: ctx.screen });
  if (ctx.country) params.set('c', ctx.country);
  if (ctx.section) params.set('s', ctx.section);
  if (pathname) params.set('from', pathname);
  return (
    <Link
      href={`/report?${params.toString()}`} className={className}
      onClick={(e) => { if (!isPlainClick(e)) return; e.preventDefault(); onOpen?.(); openReport(ctx); }}
    >
      {children}
    </Link>
  );
}
