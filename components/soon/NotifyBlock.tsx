'use client';

import { Bell } from 'lucide-react';
import { useModals, type SoonVariant } from '@/components/modal/ModalHost';
import { t } from '@/lib/copy';

/** "열리면 알려 드릴까요?" 블록: 누르면 Coming soon 이메일 신청 모달을 연다(SPEC 11·14장, section = launch) */
export function NotifyBlock({ variant, titleKey, className = '' }: { variant: SoonVariant; titleKey: string; className?: string }) {
  const { openSoon } = useModals();
  return (
    <section aria-labelledby={`notify-${variant}`} className={`rounded-card-lg bg-aqua-50 p-6 ${className}`}>
      <h2 id={`notify-${variant}`} className="flex items-center gap-2 text-h3 text-navy"><Bell aria-hidden="true" className="size-5 text-aqua-dark" />{t(titleKey)}</h2>
      <p className="mt-2 text-body text-text2">{t('soon.notify.body')}</p>
      <button
        type="button" onClick={() => openSoon(variant)}
        className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-button bg-coral px-6 font-extrabold text-navy shadow-coral hover:bg-coral-hover sm:w-auto"
      >{t('soon.submit')}</button>
    </section>
  );
}
