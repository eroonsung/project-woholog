export * from './types';
export { DEFAULT_CONFIG, resolveConfig } from './defaults';
export { scoreAll, scoreCountry, roundHalfEven } from './score';
export { splitCandidates, maxAgeOf, candidateLanguages, visiblePriorities } from './candidates';
export { buildReasons, scoreSummary } from './reasons';
export { whatIf } from './whatIf';
export type { WhatIfChange, WhatIfRow } from './whatIf';
export * from './adapter';
