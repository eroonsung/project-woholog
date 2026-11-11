'use client';

import { Check, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

/** 번호 + 제목 + 설명 카드 목록(Q5·Q7·Q10·Q11). 고르는 즉시 넘어가지 않는다 — "다음"을 눌러야 한다(SPEC 3.2). */
export interface ChoiceOption<T extends string | number> { id: T; title: string; sub?: string }

export function ChoiceCards<T extends string | number>({ options, value, onChange, label }: {
  options: ChoiceOption<T>[]; value: T | undefined; onChange: (id: T) => void; label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-col gap-3">
      {options.map((o, i) => {
        const selected = o.id === value;
        return (
          <button
            key={o.id} type="button" role="radio" aria-checked={selected} onClick={() => onChange(o.id)}
            className={`flex min-h-20 items-center gap-4 rounded-card border-thin px-5 py-4 text-left transition-colors ${
              selected ? 'border-aqua-dark bg-aqua-100 shadow-card' : 'border-line bg-white hover:bg-subtle'}`}
          >
            <span className={`flex size-9 shrink-0 items-center justify-center rounded-full text-body font-extrabold ${
              selected ? 'bg-aqua-dark text-white' : 'bg-aqua-50 text-navy'}`}>
              {selected ? <Check aria-hidden="true" className="size-4" /> : i + 1}
            </span>
            <span className="flex-1">
              <span className="block text-body-l font-extrabold text-navy">{o.title}</span>
              {o.sub ? <span className={`block text-body ${selected ? 'text-aqua-dark' : 'text-text2'}`}>{o.sub}</span> : null}
            </span>
            {selected ? <Check aria-hidden="true" className="size-5 text-aqua-dark" /> : <ChevronRight aria-hidden="true" className="size-4 text-text3" />}
          </button>
        );
      })}
    </div>
  );
}

/** 칩 모음(Q8·Q9·Q12). 선택은 색 + 체크 + aria-pressed로 함께 보여 준다. */
export function ChipToggle({ selected, disabled, onClick, children }: {
  selected: boolean; disabled?: boolean; onClick: () => void; children: ReactNode;
}) {
  const state = selected
    ? 'border-aqua-dark bg-aqua-100 text-aqua-dark'
    : disabled ? 'border-line bg-white text-text3' : 'border-line bg-white text-navy hover:bg-subtle';
  return (
    <button
      type="button" aria-pressed={selected} aria-disabled={disabled || undefined} onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-2 rounded-pill border-thin px-4 text-body font-bold transition-colors ${state}`}
    >
      {selected ? <Check aria-hidden="true" className="size-4" /> : null}
      {children}
    </button>
  );
}

/** 왼쪽 아래 보조 선택("없어요", "아직 없어요", "잘 모르겠어요"). 눌린 상태를 보여 준다. */
export function NoneToggle({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button" aria-pressed={selected} onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-2 rounded-button px-4 text-body font-bold ${
        selected ? 'bg-aqua-100 text-aqua-dark' : 'text-navy hover:bg-subtle'}`}
    >
      {selected ? <Check aria-hidden="true" className="size-4" /> : null}
      {children}
    </button>
  );
}
