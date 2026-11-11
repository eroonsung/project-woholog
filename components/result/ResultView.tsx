import { BlockedList } from './BlockedList';
import { PreviewPanel } from './PreviewPanel';
import { RecalcBanner } from './RecalcBanner';
import { CompareButton, ResultButtons, ResultTopBar, StickyActions } from './ResultActions';
import { StoryDownload } from '@/components/result/StoryDownload';
import { ResultCard } from './ResultCard';
import { Top3 } from './Top3';
import { ReportLink } from '@/components/report/ReportLink';
import { t } from '@/lib/copy';
import { formatKoDate } from '@/lib/format';
import type { Answers } from '@/lib/quiz/types';
import { pickCard } from '@/lib/result/card';
import { previewRows } from '@/lib/result/previewText';
import type { StoredResult } from '@/lib/result/types';

/**
 * 결과 화면 전체 (SPEC 4장). 서버에서 그린다. 저장된 결과를 그대로 보여 주고 다시 계산하지 않는다(CLAUDE.md 규칙 1).
 * 웹: 왼쪽에 카드·현실 미리보기·비교·갈 수 없는 나라, 오른쪽에 TOP 3·버튼. 모바일: 한 줄로 쌓고 아래에 고정 버튼 줄.
 * 어떤 나라를 카드로 쓸지는 pickCard가 정한다. 홈(5.5단계)은 ResultCard 등 부품을 재사용한다.
 */
export function ResultView({ id, answers, result, dataChanged, today }: {
  id: string; answers: Answers; result: StoredResult; dataChanged: boolean; today: string;
}) {
  const plan = pickCard(answers, result);
  if (!plan) return null;
  const country = result.countries[plan.card.code];
  const shareTitle = t('share.ogTitle', { country: country?.nameKo ?? plan.card.code, pct: plan.card.pct });
  const shareText = t('share.text', { country: country?.nameKo ?? plan.card.code, pct: plan.card.pct });
  const rows = previewRows(country?.preview, today, answers.q5);
  const hasForeign = !!country?.preview && [country.preview.money.proof, country.preview.money.fee, country.preview.money.health].some((m) => m && m.currency !== 'KRW');
  const verified = country?.provenance.verifiedAt;
  const publishers = country?.provenance.publishers ?? [];

  return (
    <main className="mx-auto w-full max-w-content px-5 pb-6 pt-4 lg:px-10 lg:pb-12">
      {dataChanged ? <RecalcBanner answers={answers} /> : null}
      <ResultTopBar id={id} shareTitle={shareTitle} shareText={shareText} />

      <div className="mt-4 grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2 lg:row-start-1">
          <ResultCard plan={plan} result={result} answers={answers} />
          <PreviewPanel rows={rows} fxDate={hasForeign ? country?.preview?.fxDate ?? null : null} />
          <CompareButton plan={plan} id={id} />
          <StoryDownload id={id} className="lg:hidden" />
        </div>

        <div className="lg:col-start-3 lg:row-span-2 lg:row-start-1">
          <Top3 rows={plan.top3} countries={result.countries} titleKey={plan.topTitleKey} />
          <ResultButtons plan={plan} id={id} shareTitle={shareTitle} shareText={shareText} />
        </div>

        <div className="lg:col-span-2 lg:row-start-2"><BlockedList result={result} /></div>
      </div>

      <div className="mt-8 flex flex-col gap-2 text-caption text-text3">
        <p className="flex flex-wrap items-center gap-x-3">
          <span>{t('source.line', { date: verified ? formatKoDate(verified) : t('status.checking'), publisher: publishers.length > 0 ? `${publishers[0]}${publishers.length > 1 ? ' 외' : ''}` : t('status.checking') })}</span>
          <ReportLink screen="result" country={plan.card.code} countryName={country?.nameKo ?? null} className="inline-flex min-h-11 items-center underline underline-offset-4">{t('source.report')}</ReportLink>
        </p>
        <p>{t('disclaimer.result')}</p>
      </div>
      <StickyActions plan={plan} id={id} shareTitle={shareTitle} shareText={shareText} />
    </main>
  );
}
