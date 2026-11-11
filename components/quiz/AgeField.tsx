'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { AGE_MAX } from '@/lib/quiz/config';
import { t } from '@/lib/copy';

/** 만 나이 입력(Q2·동행자). 숫자 입력 + −/+ 버튼. 범위 안의 숫자만 값으로 돌려주고, 아니면 undefined. */
export function AgeField({ value, onChange, label, minAge, size = 'lg', initialText }: {
  value: number | undefined; onChange: (v: number | undefined) => void; label: string; minAge: number; size?: 'lg' | 'sm';
  /** 계산기가 넣어 준 나이(범위 밖이어도 그대로 보여 준다). 바꿀 때는 key를 바꿔 다시 그린다. */
  initialText?: string;
}) {
  const [text, setText] = useState(initialText ?? (value === undefined ? '' : String(value)));
  const num = text === '' ? undefined : Number(text);
  const tooYoung = num !== undefined && Number.isInteger(num) && num < minAge;

  const commit = (raw: string) => {
    const cleaned = raw.replace(/\D/g, '').slice(0, 3);
    setText(cleaned);
    const n = cleaned === '' ? undefined : Number(cleaned);
    onChange(n !== undefined && n >= minAge && n <= AGE_MAX ? n : undefined);
  };
  const step = (d: number) => commit(String(num === undefined ? minAge : Math.min(AGE_MAX, Math.max(minAge, num + d))));
  const big = size === 'lg';

  return (
    <div>
      <div className={`flex items-center justify-between rounded-card bg-white ${big ? 'p-5 shadow-card' : 'border-thin border-line p-2'}`}>
        <button type="button" onClick={() => step(-1)} aria-label={t('q2.dec')}
          className="flex size-11 items-center justify-center rounded-full bg-subtle text-navy">
          <Minus aria-hidden="true" className="size-5" />
        </button>
        <label className="flex items-baseline justify-center gap-2">
          <span className="sr-only">{label}</span>
          <input
            type="text" inputMode="numeric" value={text} onChange={(e) => commit(e.target.value)} aria-invalid={tooYoung}
            className={`w-20 bg-transparent text-center font-black text-navy outline-none ${big ? 'text-h1' : 'text-h3'}`}
          />
          <span className="text-body-l text-text2">{t('q2.unit')}</span>
        </label>
        <button type="button" onClick={() => step(1)} aria-label={t('q2.inc')}
          className="flex size-11 items-center justify-center rounded-full bg-subtle text-navy">
          <Plus aria-hidden="true" className="size-5" />
        </button>
      </div>
      {tooYoung ? <p role="alert" className="mt-3 text-body font-bold text-coral-dark">{t('q2.tooYoung', { minAge })}</p> : null}
    </div>
  );
}
