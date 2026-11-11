import { buildShareData } from '@/lib/share/data';
import { renderShareImage, SIZES } from '@/lib/share/image';
import { loadResult } from '@/lib/result/load';

// 링크 미리보기(카카오톡·메신저·SNS)용 OG 이미지 1200×630 (SPEC 5장). 결과를 못 읽어도 워홀로그 기본 카드를 돌려준다.
export const runtime = 'nodejs';
export const size = SIZES.og;
export const contentType = 'image/png';
export const alt = '워홀로그 결과';

export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data = null;
  try {
    const loaded = await loadResult(id);
    data = loaded ? buildShareData(loaded.answers, loaded.result) : null;
  } catch { data = null; }
  return renderShareImage('og', data);
}
