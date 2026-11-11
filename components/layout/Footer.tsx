import Link from 'next/link';
import { t } from '@/lib/copy';

/**
 * 공통 푸터 (SPEC 1장): 곧 나올 기능 · 처리방침 · 정보 제보 · 면책 문구 · ©.
 * TODO(9단계): 정보 제보는 그 페이지 정보가 자동으로 붙는 모달로 바꾼다. 지금은 임시 화면(/report)으로 연결한다.
 */
export function Footer() {
  const link = 'inline-flex min-h-11 items-center text-body text-text2 underline-offset-4 hover:text-navy hover:underline';
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-content flex-col gap-3 px-5 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <nav aria-label={t('footer.privacy')} className="flex flex-wrap items-center gap-x-5">
          <Link href="/soon" className={link}>{t('footer.soon')}</Link>
          <Link href="/privacy" className={link}>{t('footer.privacy')}</Link>
          <Link href="/report" className={link}>{t('footer.report')}</Link>
        </nav>
        <div className="flex flex-col gap-1 text-caption text-text3 lg:flex-row lg:items-center lg:gap-4">
          <p>{t('disclaimer.short')}</p>
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
