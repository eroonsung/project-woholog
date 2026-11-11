import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { FitMark } from '@/components/ui/FitMark';

// 개발 확인용 화면. 배포(production 빌드)에서는 404로 막는다 (CLAUDE.md 9장 0단계).
// 이 화면의 글자는 토큰 이름이라 copy 파일을 쓰지 않는다.

const colors = [
  'aqua', 'aqua-50', 'aqua-100', 'aqua-dark', 'coral', 'coral-hover', 'coral-50', 'coral-dark',
  'navy', 'navy-80', 'lime', 'lime-50', 'lime-dark', 'text2', 'text3', 'line', 'subtle', 'error',
] as const;

const swatch: Record<(typeof colors)[number], string> = {
  aqua: 'bg-aqua', 'aqua-50': 'bg-aqua-50', 'aqua-100': 'bg-aqua-100', 'aqua-dark': 'bg-aqua-dark',
  coral: 'bg-coral', 'coral-hover': 'bg-coral-hover', 'coral-50': 'bg-coral-50', 'coral-dark': 'bg-coral-dark',
  navy: 'bg-navy', 'navy-80': 'bg-navy-80', lime: 'bg-lime', 'lime-50': 'bg-lime-50', 'lime-dark': 'bg-lime-dark',
  text2: 'bg-text2', text3: 'bg-text3', line: 'bg-line', subtle: 'bg-subtle', error: 'bg-error',
};

const type = [
  ['text-display', 'Display'], ['text-h1', 'H1'], ['text-h2', 'H2'], ['text-h3', 'H3'],
  ['text-body-l', 'Body L'], ['text-body', 'Body'], ['text-caption', 'Caption'],
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 text-h2">{title}</h2>
      {children}
    </section>
  );
}

export default function TokensPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <main className="mx-auto w-full max-w-content px-5 py-12 lg:px-10">
      <h1 className="mb-8 text-h1">/dev/tokens</h1>

      <Section title="색">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          {colors.map((name) => (
            <li key={name} className="text-caption">
              <div className={`mb-1 h-12 rounded-chip border border-line ${swatch[name]}`} />
              {name}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="버튼">
        <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center">
          <Button>primary (코랄)</Button>
          <Button variant="secondary">secondary</Button>
          <Button variant="ghost">ghost</Button>
          <Button disabled>disabled</Button>
        </div>
      </Section>

      <Section title="칩">
        <div className="flex flex-wrap gap-2">
          <Chip>선택 안 됨</Chip>
          <Chip selected>선택됨</Chip>
        </div>
      </Section>

      <Section title="✓△✗ (모양 + 글자)">
        <div className="flex items-center gap-4">
          <FitMark mark="ok" text="맞아요" />
          <FitMark mark="warn" text="조금 아쉬워요" />
          <FitMark mark="no" text="어려워요" />
        </div>
      </Section>

      <Section title="글자 크기 (1024px 이상에서 웹 크기)">
        <div className="space-y-2">
          {type.map(([cls, label]) => (
            <p key={cls} className={cls}>{label} {cls}</p>
          ))}
        </div>
      </Section>

      <Section title="모서리·그림자">
        <div className="flex flex-wrap gap-4">
          <div className="size-20 rounded-chip bg-aqua-100" />
          <div className="size-20 rounded-button bg-aqua-100" />
          <div className="size-20 rounded-card bg-subtle shadow-card" />
          <div className="size-20 rounded-card-lg bg-white shadow-float" />
          <div className="h-10 w-24 rounded-pill bg-navy" />
        </div>
      </Section>
    </main>
  );
}
