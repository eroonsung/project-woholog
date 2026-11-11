import type { ButtonHTMLAttributes } from 'react';

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-pressed'> & {
  selected?: boolean;
};

/** 선택 칩. 키보드로 고를 수 있고(button), 터치 영역 44px 이상. 선택은 색 + 테두리 + aria-pressed. */
export function Chip({ selected = false, className = '', type = 'button', ...rest }: Props) {
  const state = selected
    ? 'border-aqua-dark bg-aqua-100 text-aqua-dark'
    : 'border-line bg-white text-navy hover:bg-subtle';
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={`inline-flex min-h-11 items-center rounded-chip border-thin px-4 text-body font-bold transition-colors ${state} ${className}`}
      {...rest}
    />
  );
}
