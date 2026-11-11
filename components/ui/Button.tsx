import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 font-extrabold transition-colors disabled:cursor-not-allowed disabled:opacity-50';

const variants: Record<Variant, string> = {
  // 코랄 + 네이비 글씨. 화면당 1개 (D-040)
  primary:
    'h-12 rounded-button bg-coral px-6 text-navy shadow-coral hover:bg-coral-hover lg:h-13',
  // 네이비 알약 + 흰 글씨
  secondary: 'h-10 rounded-pill bg-navy px-5 text-white hover:opacity-90',
  // 밑줄 친 네이비 글자 링크
  ghost: 'px-2 text-navy underline underline-offset-4',
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; wide?: boolean };

export function Button({ variant = 'primary', wide = false, className = '', type = 'button', ...rest }: Props) {
  const width = wide ? 'w-full' : '';
  return <button type={type} className={`${base} ${variants[variant]} ${width} ${className}`} {...rest} />;
}
