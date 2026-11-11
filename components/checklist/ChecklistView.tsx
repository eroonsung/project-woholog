'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Link2 } from 'lucide-react';
import { EntryRow } from '@/components/checklist/EntryRow';
import { Apps, Partners, type Partner } from '@/components/countries/DetailExtras';
import { Flag } from '@/components/ui/Flag';
import { checklistHref, daysUntil, isValidDeparture, maxDeparture, PHASES, phaseEntries, progress, timing, type Entry } from '@/lib/checklist';
import type { DetailApp } from '@/lib/countries/detail';
import { t } from '@/lib/copy';
import { formatKoDate } from '@/lib/format';

export interface SelectedCountry {
  code: string; nameKo: string; entries: Entry[]; hasCountryContent: boolean; publishers: Record<number, string>; apps: DetailApp[];
}

/** 날짜 바꾸기 폼(오늘 이후 ~ 3년 안, 또는 "아직 몰라요") */
function DateForm({ date, today, onSave, onCancel }: { date: string | null; today: string; onSave: (d: string | null) => void; onCancel?: () => void }) {
  const [value, setValue] = useState(date ?? '');
  const [bad, setBad] = useState(false);
  return (
    <form noValidate className="flex flex-wrap items-center gap-2" onSubmit={(e) => { e.preventDefault(); if (isValidDeparture(value, today)) onSave(value); else setBad(true); }}>
      <input
        type="date" value={value} min={today} max={maxDeparture(today)} aria-label={t('checklist.setup.date')} aria-invalid={bad}
        onChange={(e) => { setValue(e.target.value); setBad(false); }}
        className="h-11 rounded-button border-[1.5px] border-line bg-white px-3 text-body text-navy outline-none focus:border-aqua-dark focus:ring-[3px] focus:ring-aqua-100"
      />
      <button type="submit" className="inline-flex min-h-11 items-center rounded-button bg-navy px-4 text-body font-extrabold text-white">{t('checklist.date.save')}</button>
      <button type="button" onClick={() => onSave(null)} className="inline-flex min-h-11 items-center rounded-pill bg-white px-4 text-body font-extrabold text-text2">{t('checklist.setup.unknown')}</button>
      {onCancel ? <button type="button" onClick={onCancel} className="inline-flex min-h-11 items-center px-2 text-body font-extrabold text-navy underline underline-offset-4">{t('checklist.date.cancel')}</button> : null}
      {bad ? <p role="alert" className="w-full text-caption font-extrabold text-coral-dark">{t('checklist.err.date')}</p> : null}
    </form>
  );
}

/** 체크리스트 목록 (S15, SPEC 10.2·10.3): 요약 카드 · 단계 이동 · 단계별 항목 · 출국 단계 아래 필수 앱·추천 준비물 · 링크 복사 · 체크 초기화 */
export function ChecklistView({ country, date, checked, today, storageOn, partners, onToggle, onDate, onReset }: {
  country: SelectedCountry; date: string | null; checked: string[]; today: string; storageOn: boolean; partners: Partner[];
  onToggle: (key: string) => void; onDate: (d: string | null) => void; onReset: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState<'done' | 'fallback' | null>(null);
  const { total, done } = progress(country.entries, checked);
  const doneSet = new Set(checked);
  const days = date ? daysUntil(date, today) : 0;
  const summary = date === null ? t('checklist.summary.noDate', { country: country.nameKo })
    : days > 0 ? t('checklist.summary', { country: country.nameKo, days })
    : days === 0 ? t('checklist.summary.today', { country: country.nameKo }) : t('checklist.summary.past', { country: country.nameKo });
  const phases = PHASES.filter((p) => phaseEntries(country.entries, p).length > 0);
  const link = typeof window === 'undefined' ? '' : `${window.location.origin}${checklistHref(country.code, date, checked)}`;

  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setCopied('done'); } catch { setCopied('fallback'); }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-16 pt-6 lg:px-10">
      {!storageOn ? <p role="status" className="mb-4 rounded-card bg-coral-50 p-4 text-body font-extrabold text-coral-dark">{t('checklist.storageOff')}</p> : null}

      <section aria-labelledby="cl-summary" className="rounded-card-lg bg-aqua p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 id="cl-summary" className="flex items-center gap-3 text-h2 text-navy"><Flag code={country.code} className="h-6 w-8" />{summary}</h1>
          <span className="flex items-center gap-4 text-body font-extrabold text-navy">
            <button type="button" onClick={() => setEditing((v) => !v)} aria-expanded={editing} className="inline-flex min-h-11 items-center underline underline-offset-4">{t('checklist.changeDate')}</button>
            <Link href="/checklist" className="inline-flex min-h-11 items-center underline underline-offset-4">{t('checklist.changeCountry')}</Link>
          </span>
        </div>
        {date ? <p className="mt-1 inline-flex rounded-pill bg-white px-3 py-1 text-caption font-extrabold text-navy">{formatKoDate(date)}</p> : null}
        {date === null || editing ? (
          <div className="mt-3 rounded-card bg-white/70 p-3">
            {date === null ? <p className="mb-2 text-body font-extrabold text-navy">{t('checklist.noDate.tip')}</p> : null}
            <DateForm date={date} today={today} onSave={(d) => { onDate(d); setEditing(false); }} onCancel={date !== null ? () => setEditing(false) : undefined} />
          </div>
        ) : null}
        <div className="mt-4">
          <p className="flex items-center justify-between text-body font-extrabold text-navy"><span>{t('checklist.progress', { total, done })}</span></p>
          <div className="mt-2 h-3 overflow-hidden rounded-pill bg-white" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label={t('checklist.progress', { total, done })}>
            <div className="h-full rounded-pill bg-navy" style={{ width: total ? `${(done / total) * 100}%` : '0%' }} />
          </div>
          {total > 0 && done === total ? <p className="mt-2 text-body font-extrabold text-navy">{t('checklist.allDone')}</p> : null}
        </div>
      </section>

      <nav aria-label={t('checklist.nav')} className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 py-1">
        {phases.map((p) => (
          <a key={p} href={`#phase-${p}`} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-pill bg-subtle px-4 text-body font-extrabold text-text2 hover:bg-aqua-50">
            {t(`checklist.phase.${p}`)}<span className="rounded-pill bg-white px-2 text-caption text-navy">{phaseEntries(country.entries, p).length}</span>
          </a>
        ))}
      </nav>

      {!country.hasCountryContent ? <p className="mt-4 rounded-card bg-aqua-50 p-4 text-body text-navy">{t('checklist.docs.empty')}</p> : null}

      <div className="mt-6 flex flex-col gap-10">
        {phases.map((p) => {
          const list = phaseEntries(country.entries, p);
          const allDone = list.every((e) => doneSet.has(e.key));
          return (
            <section key={p} id={`phase-${p}`} aria-labelledby={`h-${p}`} className="scroll-mt-4">
              <h2 id={`h-${p}`} className="flex flex-wrap items-center gap-2 text-h3 text-navy">
                {t(`checklist.phase.${p}`)}
                {allDone ? <span className="rounded-pill bg-lime-50 px-2 py-0.5 text-caption font-extrabold text-lime-dark">{t('checklist.phaseDone', { phase: t(`checklist.phase.${p}`) })}</span> : null}
              </h2>
              <ul className="mt-3 flex flex-col gap-3">
                {list.map((e) => (
                  <EntryRow
                    key={e.key} entry={e} done={doneSet.has(e.key)} timing={timing(e, date, today, doneSet.has(e.key))}
                    publisher={e.sourceId !== null ? country.publishers[e.sourceId] ?? null : null} onToggle={() => onToggle(e.key)}
                  />
                ))}
              </ul>
              {p === 'depart' ? (
                <div className="mt-6 flex flex-col gap-8">
                  <div><h3 className="mb-3 text-h3 text-navy">{t('apps.title', { country: country.nameKo })}</h3><Apps apps={country.apps} /></div>
                  <div><h3 className="mb-3 text-h3 text-navy">{t('partners.title')}</h3><Partners items={partners} /></div>
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 text-center">
        <button type="button" onClick={copy} className="inline-flex min-h-11 items-center gap-2 text-body font-extrabold text-navy underline underline-offset-4">
          <Link2 aria-hidden="true" className="size-4" />{t('checklist.link')}
        </button>
        {copied === 'done' ? <p role="status" className="text-body text-text2">{t('checklist.link.done')}</p> : null}
        {copied === 'fallback' ? (
          <div role="status" className="w-full">
            <p className="text-body text-text2">{t('checklist.link.fallback')}</p>
            <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} aria-label={t('checklist.link')} className="mt-2 h-11 w-full rounded-button border-[1.5px] border-line bg-white px-3 text-caption text-navy" />
          </div>
        ) : null}
        <p className="text-caption text-text3">{t('checklist.storageNote')}</p>
        <button type="button" onClick={onReset} className="inline-flex min-h-11 items-center text-body font-extrabold text-text2 underline underline-offset-4">{t('checklist.reset')}</button>
      </div>
    </main>
  );
}
