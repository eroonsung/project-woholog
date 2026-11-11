import { AlertTriangle, Check, Triangle } from 'lucide-react';
import type { ReactNode } from 'react';
import { ReportLink } from '@/components/report/ReportLink';
import type { Cell } from '@/lib/compare/build';
import type { CountryDetail, DetailLine } from '@/lib/countries/detail';
import { t } from '@/lib/copy';
import { formatKoDate } from '@/lib/format';

const pill = 'inline-flex rounded-pill bg-subtle px-2 py-0.5 text-caption font-extrabold text-text2';
const box = 'rounded-card-lg bg-subtle p-5';

/** 섹션 틀: 제목 + 내용 + 아래 "정보가 틀렸나요? 제보하기"(나라·섹션이 주소에 붙음, 모달은 9단계) */
export function Section({ id, code, countryName, title, children, report = true }: { id: string; code: string; countryName: string; title: string; children: ReactNode; report?: boolean }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-16 lg:scroll-mt-6">
      <h2 id={`${id}-title`} className="text-h2 text-navy">{title}</h2>
      <div className="mt-4">{children}</div>
      {report ? (
        <p className="mt-3"><ReportLink screen="country" country={code} countryName={countryName} section={id} className="inline-flex min-h-11 items-center text-caption font-extrabold text-text2 underline underline-offset-4">{t('source.report')}</ReportLink></p>
      ) : null}
    </section>
  );
}

export function CellText({ cell }: { cell: Cell }) {
  return (
    <>
      {cell.checking ? <span className={pill}>{cell.text}</span> : <span className="font-extrabold">{cell.text}</span>}
      {cell.extra.map((x) => <p key={x} className="mt-1 text-caption text-text2">{x}</p>)}
    </>
  );
}

export function Glance({ d }: { d: CountryDetail }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {d.glance.map((g) => (
        <div key={g.id} className={box}>
          <dt className="text-caption font-extrabold text-text2">{g.label}</dt>
          <dd className="mt-1 text-body-l text-navy"><CellText cell={g.cell} /></dd>
        </div>
      ))}
    </dl>
  );
}

function Line({ l }: { l: DetailLine }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-body font-extrabold text-navy">{l.label}</dt>
      <dd className="text-right text-body text-navy">{l.checking ? <span className={pill}>{l.text}</span> : <span className="font-extrabold">{l.text}</span>}</dd>
    </div>
  );
}

export function Money({ d }: { d: CountryDetail }) {
  return (
    <div className={box}>
      <dl className="divide-y divide-line">{d.money.rows.map((l) => <Line key={l.label} l={l} />)}</dl>
      <div className="mt-2 flex items-start justify-between gap-4 border-t border-line pt-3">
        <p className="text-body font-extrabold text-navy">{t('compare.row.money')}</p>
        <div className="text-right text-body-l text-navy"><CellText cell={d.money.total} /></div>
      </div>
      <p className="mt-3 text-caption text-text2">{t('disclaimer.money')}</p>
      {d.money.fxDate ? <p className="mt-1 text-caption text-text2">{t('fx.line', { date: formatKoDate(d.money.fxDate) })}</p> : null}
    </div>
  );
}

function Row({ icon, title, sub }: { icon: 'ok' | 'warn' | 'info'; title: string; sub?: string }) {
  return (
    <li className="flex items-start gap-3 py-3">
      <span className={`mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full ${icon === 'warn' ? 'bg-coral-50 text-coral-dark' : 'bg-aqua-100 text-aqua-dark'}`}>
        {icon === 'warn' ? <Triangle aria-hidden="true" className="size-3.5" /> : <Check aria-hidden="true" className="size-3.5" />}
      </span>
      <div><p className="text-body font-extrabold text-navy">{title}</p>{sub ? <p className="mt-0.5 text-caption text-text2">{sub}</p> : null}</div>
    </li>
  );
}

export function Work({ d }: { d: CountryDetail }) {
  const { work } = d;
  return (
    <ul className={`${box} divide-y divide-line`}>
      <Row icon="info" title={work.study.text} />
      {work.limits.length > 0 ? work.limits.map((x) => <Row key={x} icon="warn" title={x} />) : <Row icon="ok" title={t('compare.work.none')} />}
      {work.job ? <Row icon="ok" title={work.job} /> : null}
      {work.notes.map((x) => <Row key={x} icon="info" title={x} />)}
    </ul>
  );
}

export function Apply({ d }: { d: CountryDetail }) {
  return (
    <div className={box}>
      <p className="text-caption font-extrabold text-text2">{t('compare.row.next')}</p>
      <p className="mt-1 text-body-l text-navy"><CellText cell={d.apply.next} /></p>
      {d.apply.items.length > 0 ? (
        <dl className="mt-3 divide-y divide-line border-t border-line">
          {d.apply.items.map((l) => (
            <div key={l.label} className="py-3"><dt className="text-caption font-extrabold text-text2">{l.label}</dt><dd className="mt-0.5 text-body text-navy">{l.text}</dd></div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

export function Life({ d }: { d: CountryDetail }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {d.life.map((c) => (
        <li key={c.id} className={box}>
          {c.checking ? <span className={pill}>{c.title}</span> : <p className="text-body-l font-extrabold text-navy">{c.title}</p>}
          {c.body ? <p className={`mt-1 text-text2 ${c.id === 'distance' ? 'text-caption' : 'text-body'}`}>{c.body}</p> : null}
        </li>
      ))}
    </ul>
  );
}

export function SafetyBanner({ safety }: { safety: NonNullable<CountryDetail['safety']> }) {
  const avoid = safety.level === 'avoid';
  return (
    <div role="note" className={`flex items-start gap-3 rounded-card-lg p-4 ${avoid ? 'bg-coral text-navy' : 'bg-coral-50 text-coral-dark'}`}>
      <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <p className="text-body font-extrabold">{safety.text}</p>
    </div>
  );
}
