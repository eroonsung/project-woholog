import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 공유 이미지(OG·스토리)가 파일로 읽는 글꼴·국기는 배포 때 함께 묶어야 한다(D-125)
  outputFileTracingIncludes: {
    '/r/[id]/opengraph-image': ['./app/fonts/share/**', './public/flags/**'],
    '/r/[id]/story': ['./app/fonts/share/**', './public/flags/**'],
  },
};

export default nextConfig;
