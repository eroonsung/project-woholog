import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { CompareBar } from '@/components/compare/CompareBar';
import { ModalHost } from '@/components/modal/ModalHost';
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
  // Extra가 가진 글자(한글 KS X 1001 + 기호) 범위일 때만 내려받는다. 일본어·중국어 앱 이름처럼 두 글꼴에 모두 없는 글자는 Extra를 내려받지 않고 시스템 글꼴로 보인다(D-133).
  declarations: [{ prop: 'unicode-range', value: 'U+AC00-D7A3,U+3131-318E,U+2190-21FF,U+2460-24FF,U+25A0-25FF,U+2700-27BF,U+FF00-FFEF' }],
});

// 오픈 전에는 검색 결과에 나오지 않게 noindex·nofollow (D-092)
export const metadata: Metadata = {
  title: t('meta.site.title'),
  description: t('meta.site.desc'),
  openGraph: { title: t('meta.site.title'), description: t('meta.site.desc'), siteName: t('meta.brand'), locale: 'ko_KR', type: 'website' },
  twitter: { card: 'summary_large_image', title: t('meta.site.title'), description: t('meta.site.desc') },
  robots: isSiteLive() ? undefined : { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${pretendardExtra.variable}`}>
      {/* ColorZilla 같은 브라우저 확장이 <body>에 cz-shortcut-listen 속성을 붙여서 생기는 하이드레이션 경고를 막는다(body 속성 하나에만 적용, 자식에는 영향 없음) */}
      <body suppressHydrationWarning className="flex min-h-dvh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-button focus:bg-navy focus:px-4 focus:py-3 focus:text-white">
          {t('a11y.skip')}
        </a>
        <ModalHost>
          <Header />
          <div id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">{children}</div>
          <Footer />
          <CompareBar />
        </ModalHost>
        <Analytics />
      </body>
    </html>
  );
}
