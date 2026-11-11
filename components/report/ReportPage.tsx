'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Modal } from '@/components/modal/Modal';
import { ReportForm, type ReportContext } from '@/components/report/ReportForm';
import { t } from '@/lib/copy';

/** /report?c=JP&s=money&screen=country 로 직접 들어와도 같은 제보 모달이 열린다(SPEC 13장). 닫으면 왔던 화면으로 돌아간다. */
export function ReportPage({ ctx, back }: { ctx: ReportContext; back: string }) {
  const router = useRouter();
  const [dirty, setDirty] = useState(false);
  return (
    <main className="mx-auto flex w-full max-w-quiz flex-1 flex-col items-center justify-center px-5 py-16 text-center">
      <h1 className="text-h1 text-navy">{t('report.title')}</h1>
      <p className="mt-2 text-body text-text2">{t('report.body')}</p>
      <Modal open onClose={() => router.push(back)} dirty={dirty} label={t('report.title')} closeLabel={t('report.close')}>
        <ReportForm ctx={ctx} onClose={() => router.push(back)} onDirtyChange={setDirty} />
      </Modal>
    </main>
  );
}
