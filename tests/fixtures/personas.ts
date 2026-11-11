import type { EarnNeed, EnglishSkill, ItemId, JobId, PriorityId, Profile } from '@/lib/engine';
import { CODE_BY_NAME } from './countries_v1';
import expectedJson from './personas_expected.json';

/** personas_expected.json(Python 원본의 출력)을 엔진 입력·기대값으로 바꾸는 테스트 도우미. */

export interface ExpectedItem { item: string; weight: number; mark: string }
export interface ExpectedRow {
  country: string; pct: number; ok_count: number; item_count: number; flag: string; items: ExpectedItem[];
}
interface RawPersona {
  persona: string;
  input: {
    age: number; visited: string[]; budget: number; eng: number; langs: string[];
    jobs: string[]; earn: string; study: number; prio: string[];
  };
  expected: ExpectedRow[];
}

const EARN: Record<string, EarnNeed> = { 꼭: 'must', 일부: 'partly', 안: 'none' };
const JOB: Record<string, JobId> = { 사무: 'office', 호텔: 'hotel', 카페: 'cafe', 농장: 'farm', 리테일: 'retail' };
export const PRIORITY_KO: Record<PriorityId, string> = {
  money: '돈', easy_job: '일자리', english: '영어', career: '커리어', two_years: '2년', europe: '유럽',
  low_cost: '생활비', sure_pick: '확실', few_koreans: '한국인적은', many_koreans: '한국인많은', near_korea: '가까운',
};
const PRIORITY = Object.fromEntries(Object.entries(PRIORITY_KO).map(([id, ko]) => [ko, id])) as Record<string, PriorityId>;

export const ITEM_KO: Record<ItemId, string> = {
  ...PRIORITY_KO, money: '돈', language: '언어', work: '일', study: '어학원',
};
// 위 spread 때문에 priority 'money'가 core 'money'와 같은 키다 → 둘 다 '돈'이라 이름 비교에는 문제가 없다.

function pick<T>(table: Record<string, T>, key: string, what: string): T {
  const value = table[key];
  if (value === undefined) throw new Error(`personas_expected.json의 ${what} 값을 모르겠어요: ${key}`);
  return value;
}

export const PERSONAS = (expectedJson as RawPersona[]).map((raw) => {
  const i = raw.input;
  const profile: Profile = {
    age: i.age,
    visited: i.visited.map((n) => pick(CODE_BY_NAME, n, '나라')),
    budgetMan: i.budget,
    english: i.eng as EnglishSkill,
    languages: i.langs,
    jobs: i.jobs.map((j) => pick(JOB, j, '직군')),
    earn: pick(EARN, i.earn, '생활비 벌기'),
    studyMonths: i.study,
    priorities: i.prio.map((p) => pick(PRIORITY, p, '중요한 것')),
  };
  return { name: raw.persona, profile, expected: raw.expected };
});
