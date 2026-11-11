import Image from 'next/image';

/**
 * 국기 SVG. 파일은 public/flags/{소문자 ISO 코드}.svg (flag-icons, MIT — public/flags/LICENSE).
 * 장식이라 스크린리더는 나라 이름 글자를 읽는다(alt 비움).
 */
export function Flag({ code, className = '' }: { code: string; className?: string }) {
  return (
    <Image
      src={`/flags/${code.toLowerCase()}.svg`} alt="" width={20} height={15} unoptimized
      className={`inline-block h-4 w-5 rounded-sm border border-line object-cover ${className}`}
    />
  );
}
