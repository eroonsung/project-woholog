// Core 글꼴에 없는 글자가 문구·코드·DB 시드에 생겼는지 확인한다 (D-112). 경고만 하고 push를 막지는 않는다.
// 읽는 곳은 scripts/make_font_subset.py의 ROOTS와 같다. 목록: app/fonts/PretendardCore.chars.txt
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['content', 'app', 'components', 'lib', 'supabase/seed', 'tests/fixtures/db_rows_v1.json'];
const EXT = /\.(ts|tsx|json|sql|css)$/;
const known = new Set();
for (const line of readFileSync('app/fonts/PretendardCore.chars.txt', 'utf8').split('\n')) {
  const m = line.match(/^(core|none): (.*)$/);
  if (m) for (const c of m[2]) known.add(c);
}
const files = [];
const walk = (p) => {
  if (statSync(p).isFile()) return files.push(p);
  for (const f of readdirSync(p)) if (!(p.includes('fonts') && !p.includes('components'))) walk(join(p, f));
};
for (const r of ROOTS) walk(r);
const found = new Map(); // 글자 → 파일 목록
for (const f of files.filter((f) => EXT.test(f))) {
  for (const c of new Set(readFileSync(f, 'utf8'))) {
    if (c.codePointAt(0) < 0x20 || known.has(c)) continue;
    if (!found.has(c)) found.set(c, []);
    found.get(c).push(f);
  }
}
if (found.size === 0) console.log('  ✓ 모든 글자가 Core 글꼴에 있음');
else {
  console.log(`  ⚠ Core 글꼴에 없는 글자 ${found.size}종 (화면에서 Extra를 내려받거나 시스템 글꼴로 보일 수 있어요)`);
  for (const [c, fs] of [...found].slice(0, 20)) console.log(`    ${c} (U+${c.codePointAt(0).toString(16).toUpperCase()}): ${fs.slice(0, 3).join(', ')}${fs.length > 3 ? ' 외 ' + (fs.length - 3) + '곳' : ''}`);
  console.log('    → python3 -I scripts/make_font_subset.py 로 Core를 다시 만든 뒤 커밋하세요 (pip install fonttools brotli).');
}
