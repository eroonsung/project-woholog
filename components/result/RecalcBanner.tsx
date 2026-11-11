'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { t } from '@/lib/copy';
import { submitQuiz } from '@/lib/quiz/submit';
import type { Answers } from '@/lib/quiz/types';

/** 저장한 뒤 나라 정보가 바뀌었을 때(data_changed) 맨 위 안내. 같은 답으로 다시 계산해 새 id로 이동한다 (SPEC 4.1). */
export function RecalcBanner({ answers }: { answers: Answers }) {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'busy' | 'error'>('idle');

  const recalc = async () => {
    setState('busy');
    try {
      const { id } = await submitQuiz(answers);
      router.push(`/r/${id}`);
    } catch {
      setState('error');
    }
  };

  return (
    <div role="status" className="mb-4 flex flex-col gap-3 rounded-card bg-coral-50 p-4 lg:flex-row lg:items-center lg:justify-between">
      <p className="text-body font-bold text-coral-dark">{t('result.dataChanged')}</p>
      <div className="flex flex-col gap-1">
        <Button variant="secondary" onClick={recalc} disabled={state === 'busy'}>
          {state === 'busy' ? t('result.recalcing') : t('result.recalc')}
        </Button>
        {state === 'error' ? <p className="text-caption font-bold text-coral-dark">{t('error.generic')}</p> : null}
      </div>
    </div>
  );
}
