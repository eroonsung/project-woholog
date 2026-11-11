import { t } from '@/lib/copy';
import type { GuideFactContext } from '@/lib/data/queries';
import { formatNumber } from '@/lib/format';
import { latestRates } from '@/lib/result/preview';
import { moneyText } from '@/lib/result/previewText';

/**
 * 가이드 글 (SPEC 15장): 마크다운 + `{fact_key}` 자리표시자. 자리표시자는 DB의 현재 값으로 채우고, 값이 없으면 "확인 중"으로 둔다(지어내지 않음).
 * 마크다운은 제목(##·###)·목록(-)·문단·**굵게**·[글자](https 링크)만 읽고, HTML은 그대로 글자로 보여 준다(화면에서 HTML로 풀지 않는다).
 */
const PLACEHOLDER = /\{([a-z][a-z0-9_]*)\}/g;

/** 한 값을 글자로: money는 "CAD 2,500 (약 250만 원)"처럼 원화를 같이, months는 "12개월", 그 밖의 숫자는 그대로, 글 값은 글자 그대로 */
export function formatFact(key: string, ctx: GuideFactContext, asOf: string): string {
  const fact = ctx.facts.find((f) => f.key === key);
  if (!fact) return t('status.checking');
  if (fact.value_text) return fact.value_text;
  if (fact.value_num === null) return t('status.checking');
  const type = ctx.keyTypes[key];
  if (type === 'money') {
    const currency = fact.currency ?? 'KRW';
    const per = latestRates(ctx, asOf).rate.get(currency);
    return moneyText({ amount: fact.value_num, currency, man: per === undefined ? null : Math.round((fact.value_num * per) / 10_000) });
  }
  if (type === 'months') return t('guides.fact.months', { n: fact.value_num });
  if (type === 'boolean') return t(fact.value_num === 1 ? 'guides.fact.yes' : 'guides.fact.no');
  return formatNumber(fact.value_num);
}

export const fillFacts = (body: string, ctx: GuideFactContext, asOf: string): string => body.replace(PLACEHOLDER, (_m, key: string) => formatFact(key, ctx, asOf));

export type Inline = { t: 'text'; text: string } | { t: 'bold'; text: string } | { t: 'link'; text: string; href: string };
export type Block = { t: 'h2' | 'h3' | 'p'; inline: Inline[] } | { t: 'ul'; items: Inline[][] };

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  for (const part of text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/)) {
    if (!part) continue;
    const link = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/.exec(part);
    if (link) out.push({ t: 'link', text: link[1]!, href: link[2]! });
    else if (/^\*\*[^*]+\*\*$/.test(part)) out.push({ t: 'bold', text: part.slice(2, -2) });
    else out.push({ t: 'text', text: part });
  }
  return out;
}

export function parseMarkdown(md: string): Block[] {
  const blocks: Block[] = [];
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  let para: string[] = [];
  let list: Inline[][] = [];
  const flush = () => {
    if (para.length) blocks.push({ t: 'p', inline: parseInline(para.join(' ')) });
    if (list.length) blocks.push({ t: 'ul', items: list });
    para = []; list = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    const h = /^(#{1,3})\s+(.+)$/.exec(line);
    if (h) { flush(); blocks.push({ t: h[1]!.length >= 3 ? 'h3' : 'h2', inline: parseInline(h[2]!) }); continue; }
    const li = /^[-*]\s+(.+)$/.exec(line);
    if (li) { if (para.length) flush(); list.push(parseInline(li[1]!)); continue; }
    if (list.length) flush();
    para.push(line);
  }
  flush();
  return blocks;
}

/** 목록용 한 줄 요약(첫 문단, 자리표시자·마크다운 기호 없이 앞 90자) */
export function excerpt(md: string): string {
  const first = parseMarkdown(md).find((b) => b.t === 'p');
  const text = first && first.t === 'p' ? first.inline.map((i) => i.text).join('') : '';
  return text.length > 90 ? `${text.slice(0, 90)}…` : text;
}
