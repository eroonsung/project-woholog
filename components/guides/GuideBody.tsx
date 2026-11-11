import type { Block, Inline } from '@/lib/guides';

function Run({ inline }: { inline: Inline[] }) {
  return inline.map((x, i) =>
    x.t === 'bold' ? <strong key={i} className="font-extrabold text-navy">{x.text}</strong>
    : x.t === 'link' ? <a key={i} href={x.href} target="_blank" rel="noopener noreferrer nofollow" className="font-bold text-aqua-dark underline underline-offset-4">{x.text}</a>
    : <span key={i}>{x.text}</span>);
}

/** 가이드 본문(마크다운을 읽어 만든 블록). HTML은 풀지 않고 React가 글자로만 그린다. */
export function GuideBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex flex-col gap-4 text-body-l text-text2">
      {blocks.map((b, i) =>
        b.t === 'h2' ? <h2 key={i} className="mt-4 text-h2 text-navy"><Run inline={b.inline} /></h2>
        : b.t === 'h3' ? <h3 key={i} className="mt-2 text-h3 text-navy"><Run inline={b.inline} /></h3>
        : b.t === 'ul' ? <ul key={i} className="list-disc space-y-1 pl-5">{b.items.map((it, j) => <li key={j}><Run inline={it} /></li>)}</ul>
        : <p key={i}><Run inline={b.inline} /></p>)}
    </div>
  );
}
