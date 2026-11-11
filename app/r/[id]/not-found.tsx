import Link from 'next/link';
import { t } from '@/lib/copy';

export default function ResultNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-quiz flex-1 flex-col items-center justify-center py-16 gap-6 px-5 text-center">
      <h1 className="text-h2 text-navy">{t('result.notFound')}</h1>
      <Link href="/test" className="inline-flex h-12 items-center rounded-button bg-coral px-6 font-extrabold text-navy shadow-coral hover:bg-coral-hover">
        {t('result.again')}
      </Link>
    </main>
  );
}
