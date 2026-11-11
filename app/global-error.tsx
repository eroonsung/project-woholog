'use client';

import { t } from '@/lib/copy';

// 맨 위(layout)에서 난 오류용 마지막 화면. 헤더·글꼴 없이 최소한의 글자와 버튼만(SPEC 0.4).
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', color: '#1d3366', background: '#fff', display: 'flex', minHeight: '100dvh', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20 }}>
        <main>
          <h1 style={{ fontSize: 28 }}>{t('error.title')}</h1>
          <p style={{ color: '#5a6684' }}>{t('error.body')}</p>
          <p style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" onClick={reset} style={{ minHeight: 48, padding: '0 24px', borderRadius: 14, border: 0, background: '#ff7e5f', color: '#1d3366', fontWeight: 800, fontSize: 16 }}>{t('error.retry')}</button>
            {/* layout 밖에서 그려지는 마지막 화면이라 next/link(라우터)를 쓸 수 없다 */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" style={{ minHeight: 48, padding: '0 24px', borderRadius: 14, background: '#eaf9fc', color: '#1d3366', fontWeight: 800, fontSize: 16, display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>{t('error.home')}</a>
          </p>
        </main>
      </body>
    </html>
  );
}
