import type { MetadataRoute } from 'next';
import { t } from '@/lib/copy';
import { SHARE_COLORS as C } from '@/lib/share/colors';

// 웹 앱 매니페스트 (logo-v4, D-134). 설치형 앱은 아니라서 display는 browser.
// 색은 디자인 토큰과 같은 값(lib/share/colors.ts, tests/share_colors.test.ts가 토큰과 같은지 확인한다).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: t('brand.name'),
    short_name: t('brand.name'),
    start_url: '/',
    display: 'browser',
    theme_color: C.navy,
    background_color: C.white,
    icons: [
      { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
