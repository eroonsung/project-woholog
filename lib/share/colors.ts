/**
 * 공유 이미지(satori)는 CSS 변수를 읽지 못해서 색 값을 직접 넣어야 한다. app/globals.css의 디자인 토큰과 같은 값이다 — 토큰을 바꾸면 여기도 같이 바꾼다(D-125).
 */
export const SHARE_COLORS = {
  aqua: '#9fe6f3', aqua50: '#eaf9fc', aqua100: '#d6f5fb', aquaDark: '#086a7d',
  coralDark: '#b9432a', coral50: '#ffe6df',
  navy: '#1d3366', navy80: '#2e4470', lime: '#abe54c', text2: '#5a6684', line: '#e6e9ef', white: '#ffffff',
} as const;
