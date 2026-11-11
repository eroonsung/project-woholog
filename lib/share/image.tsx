/* eslint-disable @next/next/no-img-element -- satori(next/og)는 next/image를 못 쓰고 <img>만 그린다 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { t } from '@/lib/copy';
import { SHARE_COLORS as C } from './colors';
import type { ShareData } from './data';

/**
 * 공유 이미지 두 가지 (SPEC 5장, S21): OG(1200×630, 링크 미리보기) · 스토리(1080×1920, 인스타 스토리용 PNG).
 * 카드 나라 국기·이름·%, 한 줄 문장, TOP 3 이름·%, "워홀로그" 글자 로고. 답변 값(나이·예산 등)은 넣지 않는다.
 * 글꼴은 Pretendard 정적 파일(app/fonts/share/*.ttf, scripts/make_share_fonts.py)을 직접 넣는다(시스템 글꼴에 기대지 않음).
 * 이 파일은 satori가 그리는 모양이라 flex만 쓰고 색은 lib/share/colors.ts의 값(디자인 토큰과 같은 값)을 쓴다.
 */
export type ShareKind = 'og' | 'story';
export const SIZES = { og: { width: 1200, height: 630 }, story: { width: 1080, height: 1920 } } as const;

const fontCache = new Map<number, Promise<Buffer>>();
const font = (weight: 500 | 800) => {
  if (!fontCache.has(weight)) fontCache.set(weight, readFile(join(process.cwd(), 'app/fonts/share', `PretendardShare-${weight}.ttf`)));
  return fontCache.get(weight)!;
};

/** public/brand/{파일} → data URL (satori는 이미지를 data URL로만 받는다, 글자가 들어간 가로 로고는 글꼴 없이 그려진다). 없으면 null */
async function brand(file: 'woholog-logo.svg' | 'woholog-badge.png'): Promise<string | null> {
  try {
    const buf = await readFile(join(process.cwd(), 'public/brand', file));
    return `data:${file.endsWith('.svg') ? 'image/svg+xml' : 'image/png'};base64,${buf.toString('base64')}`;
  } catch { return null; }
}

/** public/flags/{코드}.svg → data URL (satori는 SVG를 data URL로만 받는다). 없으면 null */
async function flag(code: string): Promise<string | null> {
  if (!/^[A-Za-z]{2}$/.test(code)) return null;
  try {
    const svg = await readFile(join(process.cwd(), 'public/flags', `${code.toLowerCase()}.svg`));
    return `data:image/svg+xml;base64,${svg.toString('base64')}`;
  } catch { return null; }
}

const row = { display: 'flex', alignItems: 'center' } as const;
const col = { display: 'flex', flexDirection: 'column' } as const;

function Story({ d, flagSrc, logo, badge }: { d: ShareData | null; flagSrc: string | null; logo: string | null; badge: string | null }) {
  return (
    <div style={{ ...col, width: 1080, height: 1920, background: C.aqua, padding: 72, fontFamily: 'Pretendard', color: C.navy }}>
      <div style={{ ...row, justifyContent: 'space-between' }}>
        {logo ? <img src={logo} width={297} height={64} alt="" /> : <div style={{ display: 'flex', fontSize: 60, fontWeight: 800 }}>{t('share.img.brand')}</div>}
        <div style={{ ...row, justifyContent: 'center', width: 210, height: 210, borderRadius: 105, background: C.lime, fontSize: 34, fontWeight: 800, textAlign: 'center', padding: 8, whiteSpace: 'nowrap' }}>{t('share.img.sticker')}</div>
      </div>
      {d ? (
        <div style={{ ...col }}>
          <div style={{ ...col, alignItems: 'center', marginTop: 48, background: C.white, borderRadius: 72, padding: '56px 56px 48px' }}>
            {flagSrc ? <img src={flagSrc} width={200} height={150} style={{ borderRadius: 16, objectFit: 'cover' }} alt="" /> : null}
            <div style={{ display: 'flex', fontSize: 76, fontWeight: 800, marginTop: 28 }}>{d.name}</div>
            <div style={{ ...row, alignItems: 'flex-end', marginTop: 8 }}>
              <div style={{ display: 'flex', fontSize: 230, fontWeight: 800, lineHeight: 1 }}>{d.pct}</div>
              <div style={{ display: 'flex', fontSize: 96, fontWeight: 800, marginBottom: 22, marginLeft: 8 }}>%</div>
            </div>
            <div style={{ display: 'flex', background: C.aqua100, color: C.aquaDark, borderRadius: 999, padding: '16px 40px', fontSize: 40, fontWeight: 800, marginTop: 8 }}>
              {t('share.img.score', { total: d.itemCount, ok: d.okCount })}
            </div>
            <div style={{ display: 'flex', width: '100%', height: 2, background: C.line, marginTop: 40 }} />
            <div style={{ display: 'flex', fontSize: 34, fontWeight: 500, color: C.text2, marginTop: 32 }}>{d.topTitle}</div>
            <div style={{ ...col, width: '100%', marginTop: 20 }}>
              {d.top3.map((r) => (
                <div key={r.code} style={{ ...row, justifyContent: 'space-between', fontSize: 46, fontWeight: 800, padding: '8px 24px' }}>
                  <div style={{ display: 'flex' }}>{r.name}</div>
                  <div style={{ display: 'flex' }}>{r.pct}%</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center', fontSize: 54, fontWeight: 800, marginTop: 48, padding: '0 24px', wordBreak: 'keep-all' }}>{d.headline}</div>
        </div>
      ) : (
        <div style={{ ...col, alignItems: 'center', justifyContent: 'center', flexGrow: 1, textAlign: 'center', fontSize: 70, fontWeight: 800, padding: 48 }}>{t('share.ogDesc')}</div>
      )}
      <div style={{ display: 'flex', flexGrow: 1 }} />
      <div style={{ ...row, justifyContent: 'center' }}>
        <div style={{ display: 'flex', background: C.white, borderRadius: 999, padding: '24px 72px', fontSize: 46, fontWeight: 800 }}>{t('share.img.cta')}</div>
      </div>
    </div>
  );
}

function Og({ d, flagSrc, logo, badge }: { d: ShareData | null; flagSrc: string | null; logo: string | null; badge: string | null }) {
  return (
    <div style={{ display: 'flex', width: 1200, height: 630, background: C.white, fontFamily: 'Pretendard', color: C.navy }}>
      <div style={{ ...col, width: 720, height: 630, background: C.aqua, padding: '56px 64px', justifyContent: 'space-between' }}>
        <div style={{ ...row }}>
          {logo ? <img src={logo} width={186} height={40} alt="" /> : <div style={{ display: 'flex', fontSize: 40, fontWeight: 800 }}>{t('share.img.brand')}</div>}
          <div style={{ display: 'flex', fontSize: 26, fontWeight: 500, color: C.navy80, marginLeft: 20 }}>{t('share.img.tag')}</div>
        </div>
        <div style={{ ...col }}>
          <div style={{ display: 'flex', fontSize: d ? 76 : 66, fontWeight: 800, lineHeight: 1.2, wordBreak: 'keep-all' }}>{d ? t('share.img.og', { country: d.name, pct: d.pct }) : t('share.img.brand')}</div>
          <div style={{ display: 'flex', fontSize: d ? 32 : 30, fontWeight: 500, color: C.navy80, marginTop: 20, lineHeight: 1.4, wordBreak: 'keep-all' }}>{d ? d.headline : t('share.ogDesc')}</div>
        </div>
        <div style={{ display: 'flex', fontSize: 30, fontWeight: 800 }}>{t('share.img.cta')}</div>
      </div>
      <div style={{ ...col, width: 480, height: 630, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        {d ? (
          <div style={{ ...col, width: '100%', alignItems: 'center', background: C.aqua50, borderRadius: 40, padding: '36px 28px' }}>
            <div style={{ ...row }}>
              {flagSrc ? <img src={flagSrc} width={64} height={48} style={{ borderRadius: 6, objectFit: 'cover' }} alt="" /> : null}
              <div style={{ display: 'flex', fontSize: 44, fontWeight: 800, marginLeft: 16 }}>{d.name}</div>
            </div>
            <div style={{ ...row, alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', fontSize: 150, fontWeight: 800, lineHeight: 1 }}>{d.pct}</div>
              <div style={{ display: 'flex', fontSize: 60, fontWeight: 800, marginBottom: 14, marginLeft: 4 }}>%</div>
            </div>
            <div style={{ display: 'flex', background: C.aqua100, color: C.aquaDark, borderRadius: 999, padding: '8px 24px', fontSize: 24, fontWeight: 800 }}>{t('share.img.score', { total: d.itemCount, ok: d.okCount })}</div>
            <div style={{ ...col, width: '100%', marginTop: 20 }}>
              {d.top3.map((r) => (
                <div key={r.code} style={{ ...row, justifyContent: 'space-between', fontSize: 28, fontWeight: 500, color: C.text2, padding: '4px 12px' }}>
                  <div style={{ display: 'flex' }}>{r.name}</div>
                  <div style={{ display: 'flex' }}>{r.pct}%</div>
                </div>
              ))}
            </div>
          </div>
        ) : badge ? <img src={badge} width={300} height={300} alt="" /> : <div style={{ display: 'flex', fontSize: 40, fontWeight: 800, textAlign: 'center' }}>{t('share.img.brand')}</div>}
      </div>
    </div>
  );
}

/** 이미지 만들기. data가 없으면(없는 결과 id) 워홀로그 기본 카드. 결과는 저장된 값이 바뀌지 않으므로 오래 캐시한다. */
export async function renderShareImage(kind: ShareKind, data: ShareData | null, init: { download?: boolean } = {}): Promise<ImageResponse> {
  const [f500, f800, flagSrc, logo, badge] = await Promise.all([font(500), font(800), data ? flag(data.code) : Promise.resolve(null), brand('woholog-logo.svg'), data ? Promise.resolve(null) : brand('woholog-badge.png')]);
  const size = SIZES[kind];
  const headers: Record<string, string> = { 'Cache-Control': data ? 'public, max-age=31536000, immutable' : 'public, max-age=3600' };
  if (init.download) headers['Content-Disposition'] = 'attachment; filename="woholog-result.png"';
  return new ImageResponse(kind === 'og' ? <Og d={data} flagSrc={flagSrc} logo={logo} badge={badge} /> : <Story d={data} flagSrc={flagSrc} logo={logo} badge={badge} />, {
    ...size,
    fonts: [{ name: 'Pretendard', data: f500, weight: 500, style: 'normal' }, { name: 'Pretendard', data: f800, weight: 800, style: 'normal' }],
    headers,
  });
}
