import { createHmac } from 'node:crypto';

/** 요청 제한용 IP 처리. 원래 IP는 저장하지 않고 해시만 쓴다 (D-065, D-095). */

/** 프록시 뒤에서 클라이언트 IP를 읽는다(Vercel은 x-forwarded-for 맨 앞이 실제 IP). 없으면 'unknown'. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || headers.get('x-real-ip')?.trim() || 'unknown';
}

/** HMAC-SHA256(키, IP) 16진수. 키를 모르면 IP로 되돌릴 수 없다. */
export function hashIp(ip: string, secret: string): string {
  return createHmac('sha256', secret).update(ip).digest('hex');
}
