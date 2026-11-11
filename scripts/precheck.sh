#!/usr/bin/env bash
# push 전 확인 (CLAUDE.md 7장). 하나라도 실패하면 종료 코드 1 → push하지 않는다.
#   1) build · tsc · eslint · vitest 통과
#   2) 스테이징에 .env* 파일 없음(.env.example 제외)
#   3) 바뀐 내용에 키 패턴 0건 (sb_secret_/sb_publishable_ 뒤 16자 이상, eyJ로 시작하는 긴 문자열, 코드의 service_role)
#      문서(.md), SQL 파일(DB 역할 이름 service_role), 이 스크립트 자체는 service_role 단어만 예외로 본다. 실제 키 형태는 문서에서도 막는다.
# 키 값은 출력하지 않는다(걸린 파일 이름과 개수만 보여 준다).
set -u
fail=0
step() { printf '\n== %s\n' "$1"; }

step "1/3 build · tsc · eslint · vitest"
log=$(mktemp)
for cmd in "npm run build" "npm run typecheck" "npm run lint" "npm test"; do
  if $cmd >"$log" 2>&1; then echo "  ✓ $cmd"; else echo "  ✗ $cmd"; tail -5 "$log"; fail=1; fi
done
rm -f "$log"

step "2/3 스테이징에 .env* 없음"
envs=$(git diff --cached --name-only | grep -E '(^|/)\.env' | grep -v '\.env\.example$' || true)
if [ -z "$envs" ]; then echo "  ✓ 없음"; else echo "  ✗ $envs"; fail=1; fi

step "3/3 키 패턴 0건"
shape=$(git diff --cached -U0 | grep -E '^\+' | grep -cE 'sb_(secret|publishable)_[A-Za-z0-9_-]{16,}|eyJ[A-Za-z0-9_-]{20,}' || true)
role=$(git diff --cached -U0 -- . ':(exclude)*.md' ':(exclude)*.sql' ':(exclude)scripts/precheck.sh' | grep -E '^\+' | grep -c 'service_role' || true)
if [ "$shape" = "0" ] && [ "$role" = "0" ]; then echo "  ✓ 0건"; else echo "  ✗ 실제 키 형태 ${shape}건, 코드의 service_role ${role}건"; fail=1; fi

step "참고: 글꼴 글자 확인 (경고만, push를 막지 않음)"
node scripts/check_font_chars.mjs || echo "  (확인 스크립트 오류)"

printf '\n'
if [ "$fail" = "0" ]; then echo "precheck 통과 → push 가능"; else echo "precheck 실패 → push 금지"; fi
exit $fail
