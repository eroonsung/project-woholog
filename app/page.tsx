import { t } from '@/lib/copy';

// 첫 화면은 2단계 전에 만든다(SPEC.md 2장). 지금은 문구·토큰이 연결됐는지 보는 자리표시.
export default function Home() {
  return (
    <main className="mx-auto w-full max-w-content px-5 py-16 lg:px-10">
      <h1 className="text-display">{t('landing.title')}</h1>
    </main>
  );
}
