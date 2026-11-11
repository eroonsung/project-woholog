'use client';

import { useEffect } from 'react';
import { StatusLink, StatusPage, primaryBtn } from '@/components/shared/StatusPage';
import { t } from '@/lib/copy';

// 서버 오류 공통 화면 (SPEC 0.4): 다시 시도 + 처음으로. 오류 내용은 화면에 보이지 않고 서버 로그에만 남는다.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('[error]', error.digest ?? 'client'); }, [error]);
  return (
    <StatusPage title={t('error.title')} body={t('error.body')}>
      <button type="button" onClick={reset} className={primaryBtn}>{t('error.retry')}</button>
      <StatusLink href="/">{t('error.home')}</StatusLink>
    </StatusPage>
  );
}
