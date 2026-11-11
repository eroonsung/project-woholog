import { notFound } from 'next/navigation';
import { CompareToggle } from '@/components/compare/CompareToggle';

// 개발 확인용: "비교에 담기" 버튼과 아래 막대를 7단계 나라 상세 없이 확인한다. 배포(production 빌드)에서는 404.
export const dynamic = 'force-dynamic';

const SAMPLE = [['JP', '일본'], ['CA', '캐나다'], ['GB', '영국'], ['AU', '호주']] as const;

export default function DevCompare() {
  if (process.env.NODE_ENV === 'production') notFound();
  return (
    <main className="mx-auto w-full max-w-content px-5 py-8">
      <ul className="flex flex-col items-start gap-3">
        {SAMPLE.map(([code, name]) => <li key={code}><CompareToggle code={code} nameKo={name} /></li>)}
      </ul>
    </main>
  );
}
