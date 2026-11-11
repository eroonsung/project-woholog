import Link from 'next/link';
import { t } from '@/lib/copy';

/**
 * 아직 없는 페이지 공통 임시 화면 "준비 중이에요" (D-103). 404가 나지 않게 연결해 두고,
 * 해당 단계에서 진짜 화면으로 교체한다(11단계에서 남아 있는 곳이 없는지 확인).
 */
export function ComingSoonPage() {
  return (
    <main className="mx-auto flex w-full max-w-quiz flex-1 flex-col items-center justify-center gap-6 px-5 py-16 text-center">
      <h1 className="text-h1 text-navy">{t('placeholder.title')}</h1>
      <Link href="/" className="inline-flex h-12 items-center rounded-button bg-coral px-6 font-extrabold text-navy shadow-coral hover:bg-coral-hover">
        {t('placeholder.home')}
      </Link>
    </main>
  );
}
