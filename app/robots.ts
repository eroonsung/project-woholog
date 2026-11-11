import type { MetadataRoute } from 'next';
import { isSiteLive } from '@/lib/site';

// 오픈 전(NEXT_PUBLIC_SITE_LIVE가 true가 아님)에는 모든 검색 로봇을 막는다 (D-092)
export default function robots(): MetadataRoute.Robots {
  return isSiteLive()
    ? { rules: { userAgent: '*', allow: '/' } }
    : { rules: { userAgent: '*', disallow: '/' } };
}
