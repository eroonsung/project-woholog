'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRightLeft } from 'lucide-react';
import { compareHref } from '@/lib/compare/parse';
import { t } from '@/lib/copy';
import { useCompareList } from './useCompareList';

/** 담기 버튼이 있는 화면(나라 상세·비교표)에서만 보이는 화면 아래 막대 */
const SHOW_ON = ['/countries', '/dev/compare'];

/** 화면 아래에 떠 있는 "비교하기 (n)" 막대 (SPEC 6장). 담은 나라가 없으면 안 보인다. */
export function CompareBar() {
  const list = useCompareList();
  const path = usePathname();
  if (list.length === 0 || !SHOW_ON.some((p) => path === p || path.startsWith(`${p}/`))) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white px-5 py-3 shadow-float">
      <div className="mx-auto flex max-w-content items-center justify-between gap-3">
        <p className="hidden text-body text-text2 sm:block">{t('compare.bar.hint')}</p>
        <Link
          href={compareHref('/compare', list)}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-button bg-coral px-6 font-extrabold text-navy shadow-coral hover:bg-coral-hover sm:w-auto"
        >
          <ArrowRightLeft aria-hidden="true" className="size-4" />
          {t('compare.bar', { n: list.length })}
        </Link>
      </div>
    </div>
  );
}
