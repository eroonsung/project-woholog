'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * 비교 표의 가로 스크롤 틀. 오른쪽에 더 볼 나라가 있으면 오른쪽 끝에 그림자와 안내 한 줄을 보여 준다(D-130).
 * 끝까지 밀거나 표가 화면에 다 들어가면 사라진다. 스크롤은 이 상자 안에서만 한다(SPEC 6장).
 */
export function ScrollFrame({ hint, children }: { hint: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setMore(el.scrollWidth - el.clientWidth - el.scrollLeft > 4);
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);

  return (
    <div>
      <div className="relative">
        <div ref={ref} className="overflow-x-auto rounded-card-lg border border-line bg-white" data-compare-scroll>{children}</div>
        {more ? <div aria-hidden="true" data-scroll-more className="pointer-events-none absolute inset-y-0 right-0 w-8 rounded-r-card-lg bg-gradient-to-l from-navy/15 to-transparent" /> : null}
      </div>
      {more ? (
        <p data-scroll-hint className="mt-2 flex items-center justify-end gap-1 text-caption font-bold text-text2">
          {hint}<ChevronRight aria-hidden="true" className="size-4" />
        </p>
      ) : null}
    </div>
  );
}
