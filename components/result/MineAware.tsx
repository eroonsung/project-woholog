'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { isMine } from '@/lib/mine';

const subscribe = (cb: () => void) => {
  window.addEventListener('storage', cb);
  return () => window.removeEventListener('storage', cb);
};

/**
 * 내 결과(이 브라우저에서 만든 결과)면 `mine`, 아니면 `other`를 보여 준다 (D-132).
 * 서버에서 그릴 때와 저장소를 읽지 못할 때는 `other`(남의 결과)다.
 */
export function MineAware({ id, mine, other }: { id: string; mine: ReactNode; other: ReactNode }) {
  const own = useSyncExternalStore(subscribe, () => isMine(id), () => false);
  return <>{own ? mine : other}</>;
}
