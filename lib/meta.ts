import type { Metadata } from 'next';
import { t } from '@/lib/copy';

/** 화면별 제목·설명 (D-133). 제목 끝에 "| 워홀로그"를 붙이고, 링크 미리보기(og·twitter)에도 같은 글을 쓴다. 문구는 copy 파일의 키로만. */
export function pageMeta(titleKey: string, descKey = 'meta.site.desc'): Metadata {
  const title = `${t(titleKey)} | ${t('meta.brand')}`;
  const description = t(descKey);
  return { title, description, openGraph: { title, description }, twitter: { title, description } };
}
