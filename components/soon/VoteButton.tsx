'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { Check, Heart } from 'lucide-react';
import { t } from '@/lib/copy';
import { castVote, hasVoted, subscribeVotes } from '@/lib/votes';

/**
 * 원해요 버튼 (SPEC 14장). 한 브라우저에서 기능마다 1번: 누른 뒤에는 "원해요 ✓"로 바뀌고 눌리지 않는다(취소 없음).
 * 누르면 숫자를 먼저 +1로 보여 주고 서버에 보낸다. 실패하면 숫자와 버튼을 되돌리고 "잠시 후 다시 눌러 주세요"를 띄운다(너무 잦은 요청은 조용히 되돌림).
 * count가 null이면(숫자를 못 읽음) 숫자를 보여 주지 않는다.
 */
export function VoteButton({ slug, count, large = false }: { slug: string; count: number | null; large?: boolean }) {
  const voted = useSyncExternalStore(subscribeVotes, () => hasVoted(slug), () => false);
  const [justNow, setJustNow] = useState(false); // 이번 화면에서 눌러서 서버 숫자에 아직 안 들어간 1표
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(false), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  async function onClick() {
    if (voted) return;
    setJustNow(true); // 먼저 +1
    const result = await castVote(slug);
    if (result === 'ok' || result === 'already') return;
    setJustNow(false); // 되돌림
    if (result === 'failed') setToast(true);
  }

  const shown = count === null ? null : count + (justNow ? 1 : 0);
  const size = large ? 'h-12 px-6 text-body-l' : 'h-11 px-3 text-body';
  return (
    <>
      <button
        type="button" onClick={onClick} aria-pressed={voted} aria-disabled={voted} aria-label={`${voted ? t('soon.voted') : t('soon.want')}${shown !== null ? ` ${shown}` : ''}`}
        className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-pill font-extrabold ${size} ${voted ? 'cursor-default bg-coral-50 text-coral-dark' : 'bg-subtle text-navy hover:bg-aqua-50'}`}
      >
        {voted ? <Check aria-hidden="true" className="size-4" /> : <Heart aria-hidden="true" className="size-4" />}
        <span aria-hidden="true">{t('soon.want')}{shown !== null ? ` ${shown}` : ''}</span>
      </button>
      {toast ? <p role="status" className="fixed inset-x-5 bottom-24 z-50 mx-auto w-fit max-w-full rounded-pill bg-navy px-5 py-3 text-body font-extrabold text-white shadow-float">{t('soon.err.vote')}</p> : null}
    </>
  );
}
