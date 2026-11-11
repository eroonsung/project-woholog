import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { CompareBar } from '@/components/compare/CompareBar';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { t } from '@/lib/copy';
import { isSiteLive } from '@/lib/site';
import './globals.css';

// Pretendard 자체 호스팅 (D-032). 굵기 400~900 가변 글꼴을 쓰는 글자만 담아 둘로 나눴다 (D-112, scripts/make_font_subset.py).
// Core(약 100KB)는 모든 화면이 쓰고 미리 받는다. Extra는 Core에 없는 글자가 나올 때만 내려받는다.
const pretendard = localFont({
  src: './fonts/PretendardCore.woff2',
  variable: '--font-pretendard',
  weight: '400 900',
  display: 'swap',
  preload: true,
});
const pretendardExtra = localFont({
  src: './fonts/PretendardExtra.woff2',
  variable: '--font-pretendard-extra',
  weight: '400 900',
  display: 'swap',
  preload: false,
});

// 오픈 전에는 검색 결과에 나오지 않게 noindex·nofollow (D-092)
export const metadata: Metadata = {
  title: '워홀로그',
  robots: isSiteLive() ? undefined : { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${pretendardExtra.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-button focus:bg-navy focus:px-4 focus:py-3 focus:text-white">
          {t('a11y.skip')}
        </a>
        <Header />
        <div id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">{children}</div>
        <Footer />
        <CompareBar />
      </body>
    </html>
  );
}
