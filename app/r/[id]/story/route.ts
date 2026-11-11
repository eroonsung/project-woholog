import { NextResponse } from 'next/server';
import { buildShareData } from '@/lib/share/data';
import { renderShareImage } from '@/lib/share/image';
import { loadResult } from '@/lib/result/load';

// 인스타 스토리용 이미지 1080×1920 PNG (SPEC 5장). ?download=1이면 파일로 저장되게 한다. 없는 결과 id는 404.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const loaded = await loadResult(id);
    const data = loaded ? buildShareData(loaded.answers, loaded.result) : null;
    if (!data) return new NextResponse('not found', { status: 404 });
    return await renderShareImage('story', data, { download: new URL(request.url).searchParams.get('download') === '1' });
  } catch (error) {
    console.error('[story]', error instanceof Error ? error.message : 'unknown');
    return new NextResponse('error', { status: 500 });
  }
}
