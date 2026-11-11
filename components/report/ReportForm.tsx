'use client';

import { useId, useState } from 'react';
import { CircleCheck } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { t } from '@/lib/copy';
import { looksLikeContact, MAX_REPORT, MIN_REPORT, reportLength, type ReportScreen } from '@/lib/report';

/**
 * 정보 제보 폼 (SPEC 13장): 내용 1칸(5~2,000자, 글자 수 표시), 연락처 칸 없음. 나라·화면·섹션은 자동으로 붙고 위에 "일본 · 나라 상세"로 보여 준다.
 * 이메일·전화번호처럼 보이는 글이 있으면 "연락처는 적지 않아도 돼요" 안내만 띄운다(막지 않음). 실패하면 입력을 남긴 채 오류 문구 + 다시 시도.
 */
export interface ReportContext { country: string | null; countryName: string | null; screen: ReportScreen; section: string | null; path: string }
type Status = 'idle' | 'sending' | 'done' | 'error' | 'limited';

export function ReportForm({ ctx, onClose, onDirtyChange }: { ctx: ReportContext; onClose: () => void; onDirtyChange?: (dirty: boolean) => void }) {
  const id = useId();
  const [text, setText] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [touched, setTouched] = useState(false);

  const len = reportLength(text);
  const tooShort = len < MIN_REPORT;
  const tooLong = len > MAX_REPORT;
  const where = [ctx.countryName, t(`report.screen.${ctx.screen}`)].filter(Boolean).join(' · ');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (tooShort || tooLong || status === 'sending') return;
    setStatus('sending');
    try {
      const res = await fetch('/api/report', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, country: ctx.country, screen: ctx.screen, section: ctx.section, path: ctx.path }),
      });
      if (res.status === 429) return setStatus('limited');
      if (!res.ok) return setStatus('error');
      trackEvent('report', { page: ctx.screen });
      setStatus('done');
    } catch {
      setStatus('error'); // 입력은 그대로
    }
  }

  if (status === 'done') {
    return (
      <div role="status" className="flex flex-col items-center gap-3 py-4 text-center">
        <CircleCheck aria-hidden="true" className="size-14 text-aqua-dark" />
        <p className="text-h3 text-navy">{t('report.done')}</p>
        <button type="button" data-autofocus onClick={onClose} className="mt-2 inline-flex min-h-11 items-center px-4 text-body font-extrabold text-navy underline underline-offset-4">{t('report.done.close')}</button>
      </div>
    );
  }

  const failed = status === 'error' || status === 'limited';
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div className="pr-10">
        <p className="inline-flex rounded-pill bg-aqua-100 px-3 py-1 text-caption font-extrabold text-aqua-dark">{where}</p>
        <h2 className="mt-2 text-h2 text-navy">{t('report.title')}</h2>
        <p className="mt-1 text-body text-text2">{t('report.body')}</p>
      </div>
      <div>
        <label htmlFor={`${id}-msg`} className="flex items-center justify-between text-body font-extrabold text-navy">
          {t('report.label')}<span className="text-caption font-medium text-text2">{t('report.required')}</span>
        </label>
        <textarea
          id={`${id}-msg`} data-autofocus rows={5} value={text} placeholder={t('report.placeholder')}
          onChange={(e) => { setText(e.target.value); onDirtyChange?.(e.target.value !== ''); }}
          aria-invalid={touched && (tooShort || tooLong)} aria-describedby={`${id}-help`}
          className="mt-2 w-full resize-y rounded-button border-[1.5px] border-line bg-white p-4 text-body text-navy outline-none focus:border-aqua-dark focus:ring-[3px] focus:ring-aqua-100"
        />
        <p id={`${id}-help`} className="mt-1 flex items-start justify-between gap-3 text-caption text-text2">
          <span>{touched && tooShort ? <strong role="alert" className="font-extrabold text-error">{t('report.err.short')}</strong> : t('report.noContact')}</span>
          <span className={tooLong ? 'font-extrabold text-error' : ''}>{t('report.count', { n: len })}</span>
        </p>
        {looksLikeContact(text) ? <p role="status" className="mt-2 rounded-card bg-aqua-50 p-3 text-caption font-extrabold text-navy">{t('report.contactWarn')}</p> : null}
      </div>
      {failed ? <p role="alert" className="rounded-card bg-coral-50 p-3 text-body font-extrabold text-coral-dark">{t(status === 'limited' ? 'report.err.limit' : 'report.err.server')}</p> : null}
      <button
        type="submit" disabled={tooShort || tooLong || status === 'sending'}
        className="inline-flex h-12 w-full items-center justify-center rounded-button bg-coral px-6 font-extrabold text-navy shadow-coral hover:bg-coral-hover disabled:cursor-not-allowed disabled:opacity-50"
      >{t(failed ? 'report.retry' : 'report.submit')}</button>
    </form>
  );
}
