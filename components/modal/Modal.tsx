'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

/**
 * 모달 공통 (SPEC 0.5). 네이티브 <dialog>라서 Tab이 창 안에서만 돌고 Esc로 닫히고, 닫히면 연 버튼으로 포커스가 돌아간다.
 * 열리면 `data-autofocus`가 붙은 첫 입력칸으로 포커스가 간다. 입력한 글이 있으면(`dirty`) 바깥을 눌러도 닫히지 않는다(Esc·닫기 버튼은 닫힘).
 * 모바일은 아래에서 올라오는 시트, 웹(1024px↑)은 가운데 창.
 */
export function Modal({ open, onClose, label, closeLabel, dirty = false, children }: {
  open: boolean; onClose: () => void; label: string; closeLabel: string; dirty?: boolean; children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      d.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    }
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref} aria-label={label}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === ref.current && !dirty) onClose(); }}
      className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-dvh w-full max-w-none overflow-y-auto rounded-b-none rounded-t-card-lg bg-white p-0 shadow-float backdrop:bg-navy/45 lg:inset-0 lg:m-auto lg:h-fit lg:max-w-md lg:rounded-card-lg"
    >
      {open ? (
        <div className="relative p-6">
          <button type="button" onClick={onClose} aria-label={closeLabel} className="absolute right-3 top-3 inline-flex size-11 items-center justify-center rounded-full text-text2 hover:bg-subtle">
            <X aria-hidden="true" className="size-5" />
          </button>
          {children}
        </div>
      ) : null}
    </dialog>
  );
}
