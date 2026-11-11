import {
  Award, BellRing, BookOpen, BookOpenText, Briefcase, Calculator, CalendarCheck, Columns3, Compass, FileText, Landmark,
  LayoutGrid, ListChecks, PiggyBank, RefreshCw, ShieldCheck, UserPlus, Users, type LucideIcon,
} from 'lucide-react';
import type { NavItem } from '@/lib/nav';

/** 메뉴 항목별 아이콘. 주소(/test) 또는 준비 중 slug(/soon/xxx)로 고른다. 모양은 장식이라 스크린리더는 글자를 읽는다. */
const BY_KEY: Record<string, LucideIcon> = {
  '/test': Compass, '/countries': Columns3, '/guides': BookOpen, '/checklist': ListChecks,
  'cost-calculator': Calculator, 'savings-planner': PiggyBank, 'intake-alerts': BellRing, guidebook: BookOpenText,
  'job-guide': Briefcase, 'second-visa': CalendarCheck, 'fx-alerts': RefreshCw, 'safety-checkin': ShieldCheck,
  'departure-buddies': UserPlus, 'tax-refund': Landmark, 'year-report': Award, resume: FileText, community: Users,
};

export function iconFor(item: NavItem): LucideIcon {
  if (item.pickCountry) return LayoutGrid;
  const slug = item.href?.startsWith('/soon/') ? item.href.slice('/soon/'.length) : null;
  return BY_KEY[slug ?? item.href ?? ''] ?? Compass;
}
