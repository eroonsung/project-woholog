'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Modal } from '@/components/modal/Modal';
import { ReportForm, type ReportContext } from '@/components/report/ReportForm';
import { SubscribeForm } from '@/components/soon/SubscribeForm';
import { t } from '@/lib/copy';

/**
 * 모달 두 개(Coming soon 이메일 신청, 정보 제보)를 앱 전체에서 하나씩만 열어 주는 곳 (SPEC 0.5·11·13장).
 * 헤더·푸터·나이 초과 화면·각 화면의 "제보하기"가 `useModals()`로 연다. 화면 이동 없이 열리고, 닫으면 있던 화면 그대로다.
 */
export type SoonVariant = 'community' | 'login';
type Open = { kind: 'soon'; variant: SoonVariant } | { kind: 'report'; ctx: ReportContext } | null;
interface Api { openSoon: (variant?: SoonVariant) => void; openReport: (ctx: Omit<ReportContext, 'path'> & { path?: string }) => void }

const Ctx = createContext<Api>({ openSoon: () => {}, openReport: () => {} });
export const useModals = (): Api => useContext(Ctx);

export function ModalHost({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<Open>(null);
  const [dirty, setDirty] = useState(false);
  const close = useCallback(() => { setOpen(null); setDirty(false); }, []);
  const api = useMemo<Api>(() => ({
    openSoon: (variant = 'community') => { setDirty(false); setOpen({ kind: 'soon', variant }); },
    openReport: (ctx) => { setDirty(false); setOpen({ kind: 'report', ctx: { ...ctx, path: ctx.path ?? `${window.location.pathname}` } }); },
  }), []);

  return (
    <Ctx.Provider value={api}>
      {children}
      <Modal open={open?.kind === 'soon'} onClose={close} dirty={dirty} label={t('soon.badge')} closeLabel={t('soon.close')}>
        {open?.kind === 'soon' ? (
          <SubscribeForm
            lang="ko" section="launch" onClose={close} onDirtyChange={setDirty}
            titleSlot={(
              <div className="pr-10">
                <p className="inline-flex -rotate-3 rounded-pill bg-lime px-3 py-1 text-caption font-extrabold text-navy">{t('soon.badge')}</p>
                <h2 className="mt-3 text-h2 text-navy">{t(open.variant === 'login' ? 'soon.login.title' : 'soon.title')}</h2>
                <p className="mt-1 text-body text-text2">{t(open.variant === 'login' ? 'soon.login.body' : 'soon.body')}</p>
              </div>
            )}
          />
        ) : null}
      </Modal>
      <Modal open={open?.kind === 'report'} onClose={close} dirty={dirty} label={t('report.title')} closeLabel={t('report.close')}>
        {open?.kind === 'report' ? <ReportForm ctx={open.ctx} onClose={close} onDirtyChange={setDirty} /> : null}
      </Modal>
    </Ctx.Provider>
  );
}
