import { renderShareImage, SIZES } from '@/lib/share/image';

// 사이트 기본 링크 미리보기 이미지 1200×630 (결과 링크는 r/[id]/opengraph-image가 따로 만든다). 워홀로그 기본 카드.
export const runtime = 'nodejs';
export const size = SIZES.og;
export const contentType = 'image/png';
export const alt = '워홀로그';

export default function OgImage() {
  return renderShareImage('og', null);
}
