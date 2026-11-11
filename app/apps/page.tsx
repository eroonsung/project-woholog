import type { Metadata } from 'next';
import { AppsIndex } from '@/components/apps/AppsIndex';
import { t } from '@/lib/copy';
import { buildAppsIndex } from '@/lib/countries/appsIndex';
import { fetchAdapterRows, fetchDetailExtras } from '@/lib/data/queries';

// 나라별 필수 앱 목록 (D-130). 읽기만 하고 하루에 한 번 다시 만든다(ISR).
export const revalidate = 86400;

export const metadata: Metadata = { title: `${t('apps.index.title')} | 워홀로그` };

export default async function AppsPage() {
  const [rows, extras] = await Promise.all([fetchAdapterRows(), fetchDetailExtras()]);
  return (
    <main className="mx-auto w-full max-w-content px-5 pb-28 pt-6 lg:px-10">
      <h1 className="text-h1 text-navy">{t('apps.index.title')}</h1>
      <p className="mt-2 text-body text-text2">{t('apps.index.sub')}</p>
      <div className="mt-6"><AppsIndex rows={buildAppsIndex(rows, extras.apps)} /></div>
    </main>
  );
}
