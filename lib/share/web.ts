/**
 * 공유 동작의 순수 부분 (SPEC 5장, D-131). 화면 없이 테스트한다.
 * 카카오톡 등은 파일이 같이 오면 이미지만 보내고 링크를 빼 버려서, 공유하기에는 파일을 절대 넣지 않는다.
 */
export interface SharePayload { title: string; text: string; url: string }

/** navigator.share에 넘길 값: 제목·문구·링크 세 가지뿐(files 없음) */
export function buildSharePayload(title: string, text: string, url: string): SharePayload {
  return { title, text, url };
}

/** 아이폰·아이패드(데스크톱 모드 아이패드 포함). iOS 사파리는 파일 저장이 막힐 수 있어 새 탭 안내를 쓴다 */
export function isIos(userAgent: string, platform: string, maxTouchPoints: number): boolean {
  return /iPhone|iPad|iPod/.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1);
}

export const storyHref = (id: string, download: boolean): string => `/r/${id}/story${download ? '?download=1' : ''}`;
