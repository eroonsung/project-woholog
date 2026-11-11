'use client';

import { useEffect, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { addCompare, removeCompare } from '@/lib/compare/store';
import { t } from '@/lib/copy';
import { useCompareList } from './useCompareList';

/**
 * "비교에 담기" 버튼 (SPEC 6장). 나라 상세(7단계)·비교표에서 쓰는 부품이다.
 * 이미 담았으면 "비교에서 빼기", 4번째를 담으려 하면 "3개까지 담을 수 있어요" 안내만 띄우고 담지 않는다.
 */
export function CompareToggle({ code, nameKo, className = '' }: { code: string; nameKo: string; className?: string }) {
  const list = useCompareList();
  const [notice, setNotice] = useState(false);
  const saved = list.includes(code);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(false), 2500);
    return () => clearTimeout(id);
  }, [notice]);

  const onClick = () => {
    if (saved) return removeCompare(code);
    if (addCompare(code) === 'full') setNotice(true);
  };

  return (
    <>
      <button
        type="button" onClick={onClick} aria-pressed={saved} aria-label={`${nameKo} ${t(saved ? 'compare.toggle.remove' : 'compare.toggle.add')}`}
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-button px-4 text-body font-extrabold ${saved ? 'bg-aqua-100 text-aqua-dark' : 'bg-subtle text-navy hover:bg-aqua-50'} ${className}`}
      >
        {saved ? <Check aria-hidden="true" className="size-4" /> : <Plus aria-hidden="true" className="size-4" />}
        {t(saved ? 'compare.toggle.remove' : 'compare.toggle.add')}
      </button>
      {notice ? (
        <p role="status" className="fixed inset-x-5 bottom-24 z-50 mx-auto w-fit max-w-full rounded-pill bg-navy px-5 py-3 text-body font-extrabold text-white shadow-float">
          {t('compare.full')}
        </p>
      ) : null}
    </>
  );
}
