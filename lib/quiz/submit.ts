import type { Answers } from './types';

/**
 * 결과 저장 요청.
 * TODO(4단계): `POST /api/result`로 보내고, 성공하면 sessionStorage를 지운 뒤 `/r/[id]`로 replace 이동한다.
 * 10초 안에 응답이 없거나 오류면 reject한다(SPEC.md 3.3). 2단계에서는 계산 중 화면까지만 가므로
 * 이 함수는 끝나지 않는 Promise를 돌려준다.
 */
export function submitQuiz(answers: Answers): Promise<{ id: string }> {
  void answers;
  return new Promise(() => {});
}
