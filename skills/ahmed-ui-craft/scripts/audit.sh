#!/usr/bin/env bash
# Automated part of the pre-delivery audit. Prints findings per check; exits 1 if any.
# Usage: bash scripts/audit.sh <folder-or-file> [...]
#        AUDIT_ALLOW="focus-removed" bash scripts/audit.sh src   # skip checks you reviewed by hand
set -uo pipefail
export LC_ALL=C.UTF-8 # grep -P needs a UTF-8 locale (Git Bash fails without it)

[ $# -gt 0 ] || { echo "Usage: bash $0 <folder-or-file> [...]"; exit 2; }
HERE="$(cd "$(dirname "$0")" && pwd)"
G=(grep -rnP --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=.git
   --include=*.html --include=*.css --include=*.scss --include=*.js --include=*.jsx --include=*.ts
   --include=*.tsx --include=*.vue --include=*.svelte --include=*.astro --include=*.mdx)
findings=0

check() { # check <id> <description> <pattern> [grep -v filter]
  local id="$1" desc="$2" pat="$3" filter="${4:-}" out
  [[ ",${AUDIT_ALLOW:-}," == *",$id,"* ]] && return
  out="$("${G[@]}" -- "$pat" "${TARGETS[@]}" 2>/dev/null)"
  [ -n "$filter" ] && out="$(printf '%s\n' "$out" | grep -vP -- "$filter")"
  out="$(printf '%s\n' "$out" | sed '/^$/d')"
  if [ -n "$out" ]; then
    local n; n=$(printf '%s\n' "$out" | wc -l | tr -d ' ')
    findings=$((findings + n))
    printf '\n[%s] %s (%s)\n' "$id" "$desc" "$n"
    printf '%s\n' "$out" | cut -c1-200 | head -20
  fi
}
TARGETS=("$@")
COLOR='#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|oklch\('

check hardcoded-color "Color outside a --custom-property declaration" "$COLOR" "--[\w-]+\s*:[^;{}]*($COLOR)"
check tailwind-default "Default Tailwind palette or arbitrary px value" '\b(bg|text|border|from|to|via|ring)-(slate|gray|zinc|neutral|indigo|violet|purple|blue)-\d{2,3}\b|\[\d+px\]'
check generic-font "Generic default font as a primary face" "font-family:\s*['\"]?(Inter|Roboto|Arial|Helvetica|Poppins|Montserrat|Space Grotesk|DM Sans)\b|family=(Inter|Roboto|Poppins|Montserrat|Space\+Grotesk|DM\+Sans)\b|next/font/google.*\b(Inter|Roboto|Poppins)\b"
check focus-removed "Outline removed (needs a visible replacement on the same element)" 'outline:\s*(none|0)\b|\boutline-none\b'
check transition-all "transition: all" 'transition:\s*all\b|\btransition-all\b'
check html-sink "Unsafe HTML sink (input must be trusted or sanitized)" 'dangerouslySetInnerHTML|\.innerHTML\s*=|\.outerHTML\s*=|insertAdjacentHTML|v-html|\{@html'
check client-secret "Secret in client code" '(NEXT_PUBLIC|VITE|PUBLIC)_\w*(SECRET|PRIVATE|PASSWORD)|sk_live_|sk_test_'
check img-alt "<img> without alt" '<img(?![^>]*\balt=)'
check img-size "<img> without width/height (layout shift)" '<img(?![^>]*\b(width|height|fill)\b)'
check emoji-icon "Emoji or dingbat used as an icon" '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]'
check div-click "Clickable div/span/li (use <button> or <a>)" '<(div|span|li)[^>]*\bon[cC]lick'
check blank-rel "target=_blank without rel" "target=[\"']_blank[\"'](?![^>]*\brel=)"

if [[ ",${AUDIT_ALLOW:-}," != *",reduced-motion,"* ]] \
  && "${G[@]}" -lq 'animation|transition|framer-motion|gsap' "${TARGETS[@]}" 2>/dev/null \
  && ! "${G[@]}" -q 'prefers-reduced-motion|useReducedMotion' "${TARGETS[@]}" 2>/dev/null; then
  findings=$((findings + 1)); printf '\n[reduced-motion] Animations found but no prefers-reduced-motion handling (1)\n'
fi

# Contrast: measure every file that defines semantic color tokens
if command -v node >/dev/null; then
  while IFS= read -r f; do
    if ! out="$(node "$HERE/check-tokens.mjs" "$f" 2>&1)"; then
      n=$(printf '%s\n' "$out" | grep -c FAIL); findings=$((findings + n))
      printf '\n[contrast] %s (%s)\n' "$f" "$n"; printf '%s\n' "$out" | grep FAIL
    fi
  done < <("${G[@]}" -l -- '--color-text\s*:' "${TARGETS[@]}" 2>/dev/null)
else
  echo "note: node not found, contrast not measured (run scripts/check-tokens.mjs yourself)"
fi

if [ "$findings" -eq 0 ]; then echo "audit.sh: no findings"; else printf '\naudit.sh: %s finding(s). Fix them, or justify each in your reply.\n' "$findings"; fi
[ "$findings" -eq 0 ]
