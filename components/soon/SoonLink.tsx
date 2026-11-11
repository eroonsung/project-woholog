'use client';

import Link from 'next/link';
import type { ComponentProps, MouseEvent } from 'react';
import { useModals, type SoonVariant } from '@/components/modal/ModalHost';

/** 왼쪽 클릭이고 Ctrl·Cmd·Shift·Alt 없이 눌렀을 때만 true(새 탭 열기 같은 기본 동작은 그대로 둔다) */
export const isPlainClick = (e: MouseEvent): boolean => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

/**
 * Coming soon 모달을 여는 링크(로그인·시작하기·커뮤니티 Soon, 나이 초과 화면). 스크립트가 없어도 /soon/community로 이동한다.
 * `onOpen`은 메뉴 닫기 같은 뒤처리.
 */
export function SoonLink({ variant = 'community', onOpen, ...props }: Omit<ComponentProps<typeof Link>, 'onClick'> & { variant?: SoonVariant; onOpen?: () => void }) {
  const { openSoon } = useModals();
  return (
    <Link
      {...props}
      onClick={(e) => { if (!isPlainClick(e)) return; e.preventDefault(); onOpen?.(); openSoon(variant); }}
    />
  );
}
