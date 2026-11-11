import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

// Pretendard 자체 호스팅 (D-032). 굵기 400~900 가변 글꼴 한 파일.
const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  weight: '100 900',
  display: 'swap',
});

export const metadata: Metadata = { title: '워홀로그' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>{children}</body>
    </html>
  );
}
