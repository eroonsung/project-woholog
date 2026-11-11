import type { Metadata } from 'next';
import localFont from 'next/font/local';
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
      <body>{children}</body>
    </html>
  );
}
