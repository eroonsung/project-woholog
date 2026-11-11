import { StatusLink, StatusPage } from '@/components/shared/StatusPage';
import { t } from '@/lib/copy';

// 없는 주소·나라 코드·결과 id·slug 공통 404 화면 (SPEC 0.4)
export default function NotFound() {
  return (
    <StatusPage title={t('error.notfound.title')} body={t('error.notfound.body')}>
      <StatusLink href="/test" primary>{t('error.notfound.test')}</StatusLink>
      <StatusLink href="/countries">{t('error.notfound.countries')}</StatusLink>
    </StatusPage>
  );
}
