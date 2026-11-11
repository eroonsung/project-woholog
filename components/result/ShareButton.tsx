'use client';

import { useEffect, useState } from 'react';
import { Link2, Share2 } from 'lucide-react';
import { Modal } from '@/components/modal/Modal';
import { trackEvent } from '@/lib/analytics';
import { t } from '@/lib/copy';
import { buildSharePayload } from '@/lib/share/web';

/**
 * 공유 버튼 (SPEC 5장, D-131). 모바일에서 Web Share API가 되면 시스템 공유 창에 제목·문구·링크만 넘긴다(파일 없음: 카카오톡 등에서 이미지만 가고 링크가 빠지기 때문).
 * 안 되면 선택 창(링크 복사). 스토리 이미지 저장은 StoryDownload 버튼이 따로 맡는다. 카카오 공유는 넣지 않는다(DECISIONS 열린 질문 Q-1).
 */
export function ShareButton({ id, title, text, compact = false }: { id: string; title: string; text: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const coarse = () => typeof window !== 'undefined' && typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches;

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const url = () => `${window.location.origin}/r/${id}`;

  async function onClick() {
    if (coarse()) {
      try {
        await navigator.share(buildSharePayload(title, text, url()));
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
        </div>
      </Modal>
      {toast ? <p role="status" className="fixed inset-x-5 bottom-24 z-50 mx-auto w-fit max-w-full rounded-pill bg-navy px-5 py-3 text-body font-extrabold text-white shadow-float">{toast}</p> : null}
    </>
  );
}
