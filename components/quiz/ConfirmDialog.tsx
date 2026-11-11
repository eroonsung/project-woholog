'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';

/** 확인 창. 네이티브 <dialog>라서 포커스가 창 안에 갇히고, Esc로 닫히고, 닫히면 연 버튼으로 포커스가 돌아온다(SPEC 0.5). */
export function ConfirmDialog({ open, message, yes, no, onYes, onNo }: {
  open: boolean; message: string; yes: string; no: string; onYes: () => void; onNo: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref} aria-label={message} onCancel={(e) => { e.preventDefault(); onNo(); }}
      onClick={(e) => { if (e.target === ref.current) onNo(); }}
      className="m-auto w-11/12 max-w-sm rounded-card-lg p-0 shadow-float backdrop:bg-navy/45"
    >
      <div className="flex flex-col gap-6 p-6">
        <p className="text-h3 text-navy">{message}</p>
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" onClick={onNo}>{no}</Button>
          <Button onClick={onYes}>{yes}</Button>
        </div>
      </div>
    </dialog>
  );
}
