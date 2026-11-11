import { t } from '@/lib/copy';
import type { GuideFactContext } from '@/lib/data/queries';
import { formatNumber } from '@/lib/format';
import { latestRates } from '@/lib/result/preview';
import { moneyText } from '@/lib/result/previewText';

/**
 * 가이드 글 (SPEC 15장): 마크다운 + `{fact_key}` 자리표시자. 자리표시자는 DB의 현재 값으로 채우고, 값이 없으면 "확인 중"으로 둔다(지어내지 않음).
 * 마크다운은 제목(##·###)·목록(`- `, `1. `)·문단·**굵게**·[글자](링크)만 읽고, HTML은 그대로 글자로 보여 준다(화면에서 HTML로 풀지 않는다).
 * 링크는 두 가지만 된다: 외부 `https://…`(새 탭) · 사이트 안 `/…`(같은 탭, `//`로 시작하는 주소·`javascript:` 같은 것은 안 됨).
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

export type Inline = { t: 'text'; text: string } | { t: 'bold'; text: string } | { t: 'link'; text: string; href: string; internal: boolean };
export type Block = { t: 'h2' | 'h3' | 'p'; inline: Inline[] } | { t: 'ul'; items: Inline[][] } | { t: 'ol'; items: Inline[][] };

/** 사이트 안 링크: `/`로 시작하고 한 글자 더 이어지거나 `/` 하나뿐(`//…`는 다른 사이트로 가는 주소라 막는다). 주소에 쓰는 글자만 허용 */
export const isInternalHref = (href: string): boolean => /^\/(?!\/)[A-Za-z0-9\-._~/?=&%#:+,@]*$/.test(href) && !href.includes('..');
const LINK_TARGET = 'https?:\\/\\/[^)\\s]+|\\/[^)\\s]*';

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  for (const part of text.split(new RegExp(`(\\*\\*[^*]+\\*\\*|\\[[^\\]]+\\]\\((?:${LINK_TARGET})\\))`))) {
    if (!part) continue;
    const link = new RegExp(`^\\[([^\\]]+)\\]\\((${LINK_TARGET})\\)$`).exec(part);
    if (link) {
      const href = link[2]!;
      if (href.startsWith('/')) out.push(isInternalHref(href) ? { t: 'link', text: link[1]!, href, internal: true } : { t: 'text', text: part }); // 이상한 사이트 안 주소는 글자로만
      else out.push({ t: 'link', text: link[1]!, href, internal: false });
    }
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
  let kind: 'ul' | 'ol' = 'ul';
  const flush = () => {
    if (para.length) blocks.push({ t: 'p', inline: parseInline(para.join(' ')) });
    if (list.length) blocks.push({ t: kind, items: list });
    para = []; list = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    const h = /^(#{1,3})\s+(.+)$/.exec(line);
    if (h) { flush(); blocks.push({ t: h[1]!.length >= 3 ? 'h3' : 'h2', inline: parseInline(h[2]!) }); continue; }
    const item = /^[-*]\s+(.+)$/.exec(line);
    const numbered = /^\d+\.\s+(.+)$/.exec(line);
    if (item || numbered) {
      const next = numbered ? 'ol' : 'ul';
      if (para.length || (list.length && next !== kind)) flush();
      kind = next;
      list.push(parseInline((item ?? numbered)![1]!));
      continue;
    }
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
