import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { t } from '@/lib/copy';
import { isSiteLive } from '@/lib/site';
import './globals.css';

// Pretendard 자체 호스팅 (D-032). 굵기 400~900 가변 글꼴 한 파일.
const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  weight: '100 900',
  display: 'swap',
});

// 오픈 전에는 검색 결과에 나오지 않게 noindex·nofollow (D-092)
export const metadata: Metadata = {
  title: '워홀로그',
  robots: isSiteLive() ? undefined : { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-button focus:bg-navy focus:px-4 focus:py-3 focus:text-white">
          {t('a11y.skip')}
        </a>
        <Header />
        <div id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
