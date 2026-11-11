'use client';

import { useSyncExternalStore } from 'react';
import { Download } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { t } from '@/lib/copy';
import { isIos, storyHref } from '@/lib/share/web';

/**
 * 스토리 이미지 저장 (SPEC 5장, D-131). 공유하기와 따로 둔다.
 * 대부분은 /r/[id]/story?download=1로 바로 저장. 아이폰은 파일 저장이 막힐 수 있어서 이미지를 새 탭으로 열고 길게 눌러 저장하라고 안내한다.
 */
const noop = () => () => {};
const detectIos = () => isIos(navigator.userAgent, navigator.platform, navigator.maxTouchPoints);

export function StoryDownload({ id, className = '' }: { id: string; className?: string }) {
  const ios = useSyncExternalStore(noop, detectIos, () => false); // 서버·첫 그리기는 false
  return (
    <div className={className}>
      <a
        href={storyHref(id, !ios)} {...(ios ? { target: '_blank', rel: 'noopener' } : { download: 'woholog-result.png' })}
        onClick={() => trackEvent('share', { type: 'story' })} data-story-download
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-button bg-aqua-50 px-4 text-body font-extrabold text-navy hover:bg-aqua-100"
      >
        <Download aria-hidden="true" className="size-4" />
        {t('share.sheet.image')}
      </a>
      {ios ? <p className="mt-2 text-caption text-text2">{t('share.story.iosHint')}</p> : null}
    </div>
  );
}
