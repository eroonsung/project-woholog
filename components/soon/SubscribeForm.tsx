'use client';

import { useId, useState } from 'react';
import { CircleCheck } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { t, tEn } from '@/lib/copy';
import { isValidEmail } from '@/lib/subscribe';
import type { SubscribeSection } from '@/lib/subscribe';

/**
 * 이메일 신청 폼 (SPEC 11·12장): 이메일 + 동의 체크박스(처음엔 비어 있음) + 동의문 펼쳐 보기. 둘 다 돼야 버튼이 켜진다.
 * 모달(한국어, section=launch)과 To Korea 페이지(영어, section=to_korea)가 같이 쓴다. 동의문은 처리방침과 같은 문구 키(consent.* / tk.consent.*).
 * 결과: 성공 / 이미 신청(성공과 같은 모양, 문구만 다름, D-024) / 형식 오류(칸 아래 글자) / 너무 잦음·서버 오류(문구 + 다시 시도, 입력값은 그대로).
 */
type Lang = 'ko' | 'en';
type Status = 'idle' | 'sending' | 'ok' | 'exists' | 'error' | 'limited';

const K = {
  ko: {
    email: 'soon.email', placeholder: 'soon.placeholder', consent: 'soon.consent', view: 'soon.consent.view', hide: 'soon.consent.hide',
    submit: 'soon.submit', retry: 'soon.retry', note: 'soon.modal.note', errFormat: 'soon.err.format', errServer: 'soon.err.server', errLimit: 'soon.err.limit',
    doneTitle: 'soon.done.title', doneBody: 'soon.done.body', existsTitle: 'soon.done.exists', existsBody: 'soon.err.dup', close: 'soon.done.close',
    cTitle: 'consent.title', cItem: 'consent.col.item', cPurpose: 'consent.col.purpose', cKeep: 'consent.col.keep',
    item: 'consent.item', purpose: 'consent.purpose', keep: 'consent.keep', decline: 'consent.decline',
  },
  en: {
    email: 'tk.email', placeholder: 'tk.placeholder', consent: 'tk.consent', view: 'tk.consent.view', hide: 'tk.consent.hide',
    submit: 'tk.cta', retry: 'tk.retry', note: 'tk.note', errFormat: 'tk.err.format', errServer: 'tk.err.server', errLimit: 'tk.err.limit',
    doneTitle: 'tk.done', doneBody: 'tk.done.body', existsTitle: 'tk.done.exists', existsBody: 'tk.err.dup', close: 'tk.close',
    cTitle: 'tk.consent.title', cItem: 'tk.consent.col.item', cPurpose: 'tk.consent.col.purpose', cKeep: 'tk.consent.col.keep',
    item: 'tk.consent.item', purpose: 'tk.consent.purpose', keep: 'tk.consent.keep', decline: 'tk.consent.decline',
  },
} as const;

export function SubscribeForm({ lang, section, onClose, onDirtyChange, titleSlot }: {
  lang: Lang; section: SubscribeSection; onClose?: () => void; onDirtyChange?: (dirty: boolean) => void; titleSlot?: React.ReactNode;
}) {
  const k = K[lang];
  const tr = lang === 'en' ? tEn : t;
  const id = useId();
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<Status>('idle');

  const valid = isValidEmail(email);
  const formatError = touched && email.trim() !== '' && !valid;
  const set = (nextEmail: string, nextConsent: boolean) => { setEmail(nextEmail); setConsent(nextConsent); onDirtyChange?.(nextEmail !== ''); };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid || !consent || status === 'sending') return;
    setStatus('sending');
    try {
      const res = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, section, consent: true }) });
      if (res.status === 429) return setStatus('limited');
      if (res.status === 400) { const b = (await res.json().catch(() => ({}))) as { error?: string }; if (b.error === 'invalid_email') return setStatus('idle'); return setStatus('error'); }
      if (!res.ok) return setStatus('error');
      const body = (await res.json()) as { status?: string };
      if (body.status === 'ok') trackEvent('subscribe', { section });
      setStatus(body.status === 'exists' ? 'exists' : 'ok');
    } catch {
      setStatus('error'); // 네트워크 오류: 입력값은 그대로
    }
  }

  if (status === 'ok' || status === 'exists') {
    return (
      <div role="status" className="flex flex-col items-center gap-3 py-4 text-center">
        <CircleCheck aria-hidden="true" className="size-14 text-aqua-dark" />
        <h2 className="text-h2 text-navy">{tr(status === 'ok' ? k.doneTitle : k.existsTitle)}</h2>
        <p className="text-body text-text2">{tr(status === 'ok' ? k.doneBody : k.existsBody)}</p>
        {onClose ? <button type="button" data-autofocus onClick={onClose} className="mt-2 inline-flex min-h-11 items-center px-4 text-body font-extrabold text-navy underline underline-offset-4">{tr(k.close)}</button> : null}
      </div>
    );
  }

  const failed = status === 'error' || status === 'limited';
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      {titleSlot}
      <div>
        <label htmlFor={`${id}-email`} className="text-body font-extrabold text-navy">{tr(k.email)}</label>
        <input
          id={`${id}-email`} type="email" inputMode="email" autoComplete="email" data-autofocus value={email} placeholder={tr(k.placeholder)}
          onChange={(e) => set(e.target.value, consent)} onBlur={() => setTouched(true)}
          aria-invalid={formatError} aria-describedby={formatError ? `${id}-err` : undefined}
          className={`mt-2 h-12 w-full rounded-button border-[1.5px] bg-white px-4 text-body text-navy outline-none focus:ring-[3px] ${formatError ? 'border-error focus:ring-coral-50' : 'border-line focus:border-aqua-dark focus:ring-aqua-100'}`}
        />
        {formatError ? <p id={`${id}-err`} role="alert" className="mt-1 text-caption font-extrabold text-error">{tr(k.errFormat)}</p> : null}
      </div>

      <div>
        <div className="flex items-start justify-between gap-3">
          <label className="flex min-h-11 flex-1 cursor-pointer items-start gap-3 text-body text-navy">
            <input type="checkbox" checked={consent} onChange={(e) => set(email, e.target.checked)} className="mt-0.5 size-6 shrink-0 cursor-pointer accent-aqua-dark" />
            <span>{tr(k.consent)}</span>
          </label>
          <button type="button" aria-expanded={showDetail} aria-controls={`${id}-detail`} onClick={() => setShowDetail((v) => !v)} className="inline-flex min-h-11 shrink-0 items-center text-body font-extrabold text-navy underline underline-offset-4">
            {tr(showDetail ? k.hide : k.view)}
          </button>
        </div>
        {showDetail ? (
          <dl id={`${id}-detail`} className="mt-2 rounded-card bg-subtle p-3 text-caption text-text2">
            <dt className="font-extrabold text-navy">{tr(k.cTitle)}</dt>
            <dd className="mt-1"><strong className="font-extrabold">{tr(k.cItem)}</strong> {tr(k.item)}</dd>
            <dd><strong className="font-extrabold">{tr(k.cPurpose)}</strong> {tr(k.purpose)}</dd>
            <dd><strong className="font-extrabold">{tr(k.cKeep)}</strong> {tr(k.keep)}</dd>
            <dd className="mt-1">{tr(k.decline)}</dd>
          </dl>
        ) : null}
      </div>

      {failed ? <p role="alert" className="rounded-card bg-coral-50 p-3 text-body font-extrabold text-coral-dark">{tr(status === 'limited' ? k.errLimit : k.errServer)}</p> : null}

      <button
        type="submit" disabled={!valid || !consent || status === 'sending'}
        className="inline-flex h-12 w-full items-center justify-center rounded-button bg-coral px-6 font-extrabold text-navy shadow-coral hover:bg-coral-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {tr(failed ? k.retry : k.submit)}
      </button>
      <p className="text-center text-caption text-text2">{tr(k.note)}</p>
    </form>
  );
}
