'use client';

import { useId, useState } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { ageFromBirth } from '@/lib/age';
import { t } from '@/lib/copy';
import { todayKst } from '@/lib/format';

/**
 * 만 나이 계산기(질문 2 아래). 생년월일을 넣으면 만 나이를 계산해 위 나이 칸에 바로 반영한다.
 * 생년월일은 이 컴포넌트 안에만 있고 저장하지도 서버로 보내지도 않는다.
 */
export function AgeCalculator({ onApply }: { onApply: (age: number) => void }) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [birth, setBirth] = useState({ y: '', m: '', d: '' });
  const check = ageFromBirth(birth.y, birth.m, birth.d, todayKst());

  const update = (key: 'y' | 'm' | 'd', raw: string, max: number) => {
    const next = { ...birth, [key]: raw.replace(/\D/g, '').slice(0, max) };
    setBirth(next);
    const result = ageFromBirth(next.y, next.m, next.d, todayKst());
    if (result.ok) onApply(result.age);
  };

  const fields = [
    { key: 'y', max: 4, label: t('age.calc.year'), placeholder: '1998', auto: 'off' },
    { key: 'm', max: 2, label: t('age.calc.month'), placeholder: '05', auto: 'off' },
    { key: 'd', max: 2, label: t('age.calc.day'), placeholder: '21', auto: 'off' },
  ] as const;

  return (
    <div className="mt-6">
      <div className="flex justify-center">
        <button
          type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((v) => !v)}
          className="inline-flex min-h-11 items-center gap-2 text-body font-bold text-navy underline underline-offset-4"
        >
          <CalendarDays aria-hidden="true" className="size-5 text-aqua-dark" />
          {t('age.calc.toggle')}
          <ChevronDown aria-hidden="true" className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open ? (
        <section id={panelId} aria-label={t('age.calc.title')} className="mt-3 rounded-card border-thin border-line bg-white p-5">
          <h2 className="mb-3 text-body font-extrabold text-navy">{t('age.calc.title')}</h2>
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-3">
            {fields.map(({ key, max, label, placeholder, auto }) => (
              <div key={key} className="relative">
                <input
                  type="text" inputMode="numeric" autoComplete={auto} placeholder={placeholder} value={birth[key]} aria-label={label}
                  onChange={(e) => update(key, e.target.value, max)} aria-invalid={check.ok === false && check.reason !== 'incomplete'}
                  className="h-12 w-full rounded-button border-thin border-line bg-subtle pl-4 pr-9 text-body-l text-navy placeholder:text-text3 focus:border-aqua-dark focus:bg-white"
                />
                <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-caption text-text3">{label}</span>
              </div>
            ))}
          </div>
          <p role="status" className={`mt-3 text-body font-bold ${check.ok ? 'text-aqua-dark' : check.reason === 'incomplete' ? 'text-text2' : 'text-coral-dark'}`}>
            {check.ok
              ? t('age.calc.result', { age: check.age })
              : check.reason === 'invalid' ? t('age.calc.invalid')
              : check.reason === 'future' ? t('age.calc.future')
              : t('age.calc.hint')}
          </p>
          <p className="mt-1 text-caption text-text3">{t('age.calc.note')}</p>
        </section>
      ) : null}
    </div>
  );
}
