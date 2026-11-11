import Link from 'next/link';
import type { ReactNode } from 'react';

/** 404·오류 화면 공통 틀 (SPEC 0.4): 제목 하나 + 설명 + 버튼 줄. 회색 막대·빙글빙글 없이 글자와 버튼만. */
export const primaryBtn = 'inline-flex min-h-12 items-center justify-center rounded-button bg-coral px-6 font-extrabold text-navy shadow-coral hover:bg-coral-hover';
export const secondaryBtn = 'inline-flex min-h-12 items-center justify-center rounded-button bg-aqua-50 px-6 font-extrabold text-navy hover:bg-aqua-100';

export function StatusPage({ title, body, children }: { title: string; body?: string; children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-quiz flex-1 flex-col items-center justify-center gap-4 px-5 py-16 text-center">
      <h1 className="text-h1 text-navy">{title}</h1>
      {body ? <p className="text-body-l text-text2">{body}</p> : null}
      <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">{children}</div>
    </main>
  );
}

export const StatusLink = ({ href, primary, children }: { href: string; primary?: boolean; children: ReactNode }) => (
  <Link href={href} className={primary ? primaryBtn : secondaryBtn}>{children}</Link>
);
