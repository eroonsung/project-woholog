/**
 * 질문 화면용 나라 표시 정보(임시 고정 데이터). 3단계에서 DB(countries.region·name_ko·safety_level)로 바꾼다.
 * 순서는 Figma S01 와이어프레임의 나라 칩 순서다.  국기는 public/flags/{code}.svg(components/ui/Flag.tsx).
 */
export type Region = 'north_america' | 'asia' | 'oceania' | 'europe' | 'south_america' | 'middle_east';

export interface CountryDisplay {
  code: string;
  region: Region;
  /** countries.safety_level이 caution/avoid인 나라 */
  safety: boolean;
}

const d = (code: string, region: Region, safety = false): CountryDisplay => ({ code, region, safety });

export const COUNTRY_DISPLAY: CountryDisplay[] = [
  d('CA', 'north_america'),
  d('JP', 'asia'), d('TW', 'asia'), d('HK', 'asia'),
  d('AU', 'oceania'), d('NZ', 'oceania'),
  d('GB', 'europe'), d('IE', 'europe'), d('FR', 'europe'), d('DE', 'europe'),
  d('ES', 'europe'), d('IT', 'europe'), d('NL', 'europe'), d('BE', 'europe'),
  d('LU', 'europe'), d('AT', 'europe'), d('DK', 'europe'), d('SE', 'europe'),
  d('PT', 'europe'), d('CZ', 'europe'), d('HU', 'europe'), d('PL', 'europe'),
  d('LV', 'europe'), d('AD', 'europe'),
  d('AR', 'south_america'), d('CL', 'south_america'), d('BR', 'south_america'),
  d('IL', 'middle_east', true),
];
