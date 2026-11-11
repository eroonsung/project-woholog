'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Link2, Share2 } from 'lucide-react';
import { Modal } from '@/components/modal/Modal';
import { trackEvent } from '@/lib/analytics';
import { t } from '@/lib/copy';

/**
 * 공유 버튼 (SPEC 5장). 모바일에서 Web Share API가 되면 시스템 공유 창(링크 + 제목, 파일 공유가 되면 스토리 이미지도 같이).
 * 안 되면 선택 창: "링크 복사" · "스토리 이미지 저장". 카카오 공유는 넣지 않는다(DECISIONS 열린 질문 Q-1).
 * 시스템 공유 창은 버튼을 누른 직후에만 열 수 있어서, 스토리 이미지는 화면이 열릴 때 미리 받아 둔다.
 */
export function ShareButton({ id, title, compact = false }: { id: string; title: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);

  const coarse = () => typeof window !== 'undefined' && typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches;

  useEffect(() => {
    if (!coarse() || typeof navigator.canShare !== 'function') return;
    let alive = true;
    fetch(`/r/${id}/story`).then((r) => (r.ok ? r.blob() : null)).then((blob) => {
      if (!alive || !blob) return;
      const file = new File([blob], 'woholog-result.png', { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) fileRef.current = file;
    }).catch(() => {});
    return () => { alive = false; };
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const url = () => `${window.location.origin}/r/${id}`;

  async function onClick() {
    if (coarse()) {
      try {
        await navigator.share({ title, text: t('share.ogDesc'), url: url(), ...(fileRef.current ? { files: [fileRef.current] } : {}) });
        trackEvent('share', { type: 'native' });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return; // 이용자가 닫음
        // 그 밖의 오류: 선택 창으로
      }
    }
    setOpen(true);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url());
      trackEvent('share', { type: 'link' });
      setToast(t('share.copied'));
    } catch {
      setToast(t('share.err'));
    }
    setOpen(false);
  }

  const btn = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-button bg-aqua-50 px-4 text-body font-extrabold text-navy hover:bg-aqua-100';
  return (
    <>
      <button type="button" onClick={onClick} data-share className={`${btn} ${compact ? 'flex-col px-3 text-caption' : 'w-full'}`}>
        <Share2 aria-hidden="true" className="size-4" />
        {t('result.share')}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} label={t('share.cta')} closeLabel={t('soon.close')}>
        <h2 className="pr-10 text-h3 text-navy">{t('share.cta')}</h2>
        <div className="mt-4 flex flex-col gap-3">
          <button type="button" data-autofocus onClick={copy} className={`${btn} w-full justify-start`}><Link2 aria-hidden="true" className="size-5" />{t('share.sheet.copy')}</button>
          <a href={`/r/${id}/story?download=1`} download="woholog-result.png" onClick={() => { trackEvent('share', { type: 'story' }); setOpen(false); }} className={`${btn} w-full justify-start`}>
            <Download aria-hidden="true" className="size-5" />{t('share.sheet.image')}
          </a>
        </div>
      </Modal>
      {toast ? <p role="status" className="fixed inset-x-5 bottom-24 z-50 mx-auto w-fit max-w-full rounded-pill bg-navy px-5 py-3 text-body font-extrabold text-white shadow-float">{toast}</p> : null}
    </>
  );
}
