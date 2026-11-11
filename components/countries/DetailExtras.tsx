import { ExternalLink, Plane, ShieldCheck, Smartphone, Wallet } from 'lucide-react';
import type { CountryDetail } from '@/lib/countries/detail';
import { t } from '@/lib/copy';
import { formatKoDate } from '@/lib/format';

const box = 'rounded-card-lg bg-subtle p-5';
const ICONS = { esim: Smartphone, insurance: ShieldCheck, remittance: Wallet, flight: Plane } as const;
export const PARTNER_CATEGORIES = ['esim', 'insurance', 'remittance', 'flight'] as const;
export interface Partner { category: string; name: string; url: string; disclosure?: string }

/** 필수 앱(country_apps). 없으면 "정리하는 중" 카드 1장 (SPEC 8장) */
export function Apps({ apps }: { apps: CountryDetail['apps'] }) {
  if (apps.length === 0) return <p className={`${box} text-body text-text2`}>{t('apps.empty')}</p>;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {apps.map((a) => (
        <li key={a.name} className={box}>
          <p className="flex flex-wrap items-center gap-2 text-body-l font-extrabold text-navy">
            {a.url ? <a href={a.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 underline-offset-4 hover:underline">{a.name}<ExternalLink aria-hidden="true" className="size-4" /></a> : a.name}
            <span className="rounded-pill bg-aqua-100 px-2 py-0.5 text-caption font-extrabold text-aqua-dark">{a.category}</span>
          </p>
          {a.note ? <p className="mt-1 text-body text-text2">{a.note}</p> : null}
        </li>
      ))}
    </ul>
  );
}

/**
 * 추천 준비물 칸 4개 (SPEC 9장). 링크가 없는 칸은 "추천 상품을 고르는 중이에요"(누를 수 없음).
 * 링크가 있으면 카드 위 "광고" 표시 + 블록 아래 수수료 안내, 링크는 rel="sponsored noopener" 새 탭 (CLAUDE.md 규칙 15).
 */
export function Partners({ items }: { items: Partner[] }) {
  const byCat = (c: string) => items.find((p) => p.category === c && p.url);
  const anyLink = PARTNER_CATEGORIES.some((c) => byCat(c));
  return (
    <div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PARTNER_CATEGORIES.map((c) => {
          const p = byCat(c);
          const Icon = ICONS[c];
          const inner = (
            <>
              <span className="flex items-center justify-between gap-2">
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-aqua-100 text-aqua-dark"><Icon aria-hidden="true" className="size-4" /></span>
                {p ? <span className="rounded-pill bg-white px-2 py-0.5 text-caption font-extrabold text-text2">{t('partners.badge')}</span> : null}
              </span>
              <span className="mt-3 block text-body-l font-extrabold text-navy">{t(`partners.cat.${c}`)}</span>
              <span className="mt-1 block text-body text-text2">{p ? p.name : t('partners.empty')}</span>
            </>
          );
          return (
            <li key={c}>
              {p ? (
                <a href={p.url} target="_blank" rel="sponsored noopener" className={`${box} block min-h-11 hover:bg-aqua-50`}>{inner}</a>
              ) : <div className={`${box} h-full`}>{inner}</div>}
            </li>
          );
        })}
      </ul>
      {anyLink ? <p className="mt-3 text-caption text-text2">{t('partners.disclosure')}</p> : null}
    </div>
  );
}

export function Sources({ d }: { d: CountryDetail }) {
  if (d.sources.length === 0) return <p className={`${box} text-body text-text2`}>{t('status.checking')}</p>;
  return (
    <ul className={`${box} divide-y divide-line`}>
      {d.sources.map((s) => (
        <li key={`${s.publisher}-${s.url}`} className="flex flex-wrap items-center gap-2 py-2 text-body text-navy">
          {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 underline underline-offset-4">{s.publisher}<ExternalLink aria-hidden="true" className="size-4" /></a> : s.publisher}
          <span className="text-caption text-text2">({t('detail.sources.date', { date: formatKoDate(s.verifiedAt) })})</span>
          {s.stale ? <span className="rounded-pill bg-coral-50 px-2 py-0.5 text-caption font-extrabold text-coral-dark">{t('status.stale')}</span> : null}
        </li>
      ))}
    </ul>
  );
}
