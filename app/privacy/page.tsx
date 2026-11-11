import type { Metadata } from 'next';
import { PrivacyDoc } from '@/components/privacy/PrivacyDoc';

// 개인정보 처리방침 (SPEC 16장): 한국어 기본, ?lang=en이면 영어판. 본문은 docs/legal/privacy.md가 원본이다.
export const metadata: Metadata = { title: '개인정보 처리방침 | 워홀로그' };

export default async function PrivacyPage({ searchParams }: { searchParams: Promise<{ lang?: string | string[] }> }) {
  const { lang } = await searchParams;
  return <PrivacyDoc lang={(Array.isArray(lang) ? lang[0] : lang) === 'en' ? 'en' : 'ko'} />;
}
