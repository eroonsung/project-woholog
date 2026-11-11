'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ChecklistView, type SelectedCountry } from '@/components/checklist/ChecklistView';
import { SetupForm, type CountryOption } from '@/components/checklist/SetupForm';
import { ConfirmDialog } from '@/components/quiz/ConfirmDialog';
import type { Partner } from '@/components/countries/DetailExtras';
import { trackOnce } from '@/lib/analytics';
import { decodeChecked, isValidDeparture, sameChecked } from '@/lib/checklist';
import { clearRecord, loadRecord, saveRecord, snapshotRecord, subscribeChecklist } from '@/lib/checklistStore';
import { t } from '@/lib/copy';
import { todayKst } from '@/lib/format';
import { isStorageAvailable } from '@/lib/storage';

/**
 * 체크리스트 화면 전체 (SPEC 10장). 서버가 나라·항목을 읽어 주고, 체크·날짜는 브라우저 저장소에서 읽는다.
 *  - 그 나라 기록이 있으면(또는 주소에 날짜가 있으면) 목록, 없으면 시작 화면(나라는 ?c=로 미리 고름).
 *  - `?s=`로 들어오면: 기록이 없으면 링크 상태를 저장하고 s를 지운다 / 기록이 있고 다르면 확인 창 / 같으면 s만 지운다. 없는 항목 id는 무시.
 */
const subscribeNone = () => () => {};
const href = (code: string, date: string | null) => `/checklist?c=${code}${date ? `&d=${date}` : ''}`;

export function ChecklistApp({ options, selected, d, s, partners }: {
  options: CountryOption[]; selected: SelectedCountry | null; d: string | null; s: string | null; partners: Partner[];
}) {
  const router = useRouter();
  const code = selected?.code ?? '';
  const snap = useSyncExternalStore(subscribeChecklist, () => (code ? snapshotRecord(code) : ''), () => 'loading');
  const storageOn = useSyncExternalStore(subscribeNone, () => isStorageAvailable('checklist'), () => true);
  const today = useSyncExternalStore(subscribeNone, () => todayKst(), () => '');
  const [resetting, setResetting] = useState(false);
  const [resolved, setResolved] = useState(false);
  const handled = useRef(false);

  const validD = d !== null && today !== '' && isValidDeparture(d, today) ? d : null;
  const record = snap && snap !== 'loading' ? (JSON.parse(snap) as { date: string | null; checked: string[] }) : null;
  const valid = useMemo(() => new Set(selected?.entries.map((e) => e.key) ?? []), [selected]);
  const linked = s !== null ? decodeChecked(s, valid) : null; // 링크의 체크 상태(깨졌으면 null)
  // 기록이 있고 링크의 체크 상태와 다르면 확인 창(바꾸기 / 지금 것 유지)
  const conflict = !resolved && linked !== null && record !== null && !sameChecked(record.checked, linked);

  // 링크(?s=)로 들어온 경우를 한 번만 처리: 깨진 값·같은 값이면 s만 지우고, 기록이 없으면 링크 상태를 저장한다
  useEffect(() => {
    if (handled.current || !selected || s === null || snap === 'loading') return;
    const mine = loadRecord(selected.code);
    if (linked !== null && mine && !sameChecked(mine.checked, linked)) return; // 확인 창이 처리
    handled.current = true;
    if (linked !== null && !mine) saveRecord(selected.code, { date: validD, checked: linked });
    router.replace(href(selected.code, validD ?? mine?.date ?? null));
  }, [s, selected, snap, linked, validD, router]);

  const savingLink = selected !== null && s !== null && linked !== null && !record && !validD; // 링크 상태를 저장하는 동안 시작 화면이 깜빡이지 않게
  if (snap === 'loading' || today === '' || savingLink) return <div aria-busy="true" className="mx-auto min-h-dvh w-full max-w-3xl animate-pulse px-5 py-10"><div className="h-64 rounded-card-lg bg-subtle" /></div>;

  // 목록: 그 나라 기록이 있거나, 주소에 올바른 날짜가 있을 때(링크로 온 경우)
  if (selected && (record || validD)) {
    const date = record ? record.date : validD;
    const checked = record?.checked ?? [];
    const toggle = (key: string) => {
      const next = checked.includes(key) ? checked.filter((k) => k !== key) : [...checked, key];
      saveRecord(selected.code, { date, checked: next });
      if (next.length > checked.length) trackOnce('checklist_start', { country: selected.code }); // 첫 체크, 브라우저당 1번, 나라 코드만
    };
    return (
      <>
        <ChecklistView
          country={selected} date={date} checked={checked.filter((k) => valid.has(k))} today={today} storageOn={storageOn} partners={partners}
          onToggle={toggle}
          onDate={(next) => { saveRecord(selected.code, { date: next, checked }); router.replace(href(selected.code, next)); }}
          onReset={() => setResetting(true)}
        />
        <ConfirmDialog
          open={resetting} message={t('checklist.reset.confirm', { country: selected.nameKo })} yes={t('checklist.reset.yes')} no={t('checklist.reset.no')}
          onNo={() => setResetting(false)}
          onYes={() => { clearRecord(selected.code); setResetting(false); router.replace(`/checklist?c=${selected.code}`); }}
        />
        <ConfirmDialog
          open={conflict} message={t('checklist.link.confirm')} yes={t('checklist.link.yes')} no={t('checklist.link.no')}
          onNo={() => { setResolved(true); router.replace(href(selected.code, date)); }}
          onYes={() => { if (linked) { saveRecord(selected.code, { date: validD ?? date, checked: linked }); } setResolved(true); router.replace(href(selected.code, validD ?? date)); }}
        />
      </>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-8rem)] bg-aqua-50 px-5 py-8 lg:py-12">
      <div className="mx-auto w-full max-w-xl rounded-card-lg bg-white p-6 shadow-float lg:p-8">
        <h1 className="text-h1 text-navy">{t('checklist.setup.title')}</h1>
        <p className="mb-6 mt-2 text-body text-text2">{t('checklist.setup.sub')}</p>
        <SetupForm
          options={options} preselect={selected?.code ?? null} today={today}
          onStart={(c, date) => { saveRecord(c, { date, checked: loadRecord(c)?.checked ?? [] }); router.push(href(c, date)); }}
        />
      </div>
    </main>
  );
}
