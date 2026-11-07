#!/usr/bin/env bash
# Counts design-quality signals in each eval output. Usage: bash evals/score.sh
export LC_ALL=C.UTF-8
cd "$(dirname "$0")/runs"
c() { grep -cP "$1" "$2" 2>/dev/null || true; }
printf "%-26s %6s %6s %6s %6s %6s %6s %6s %6s %6s\n" file genfont purple hexInCSS cssVars focusVis redMot transAll emoji divClick
for f in */*.html; do
  printf "%-26s %6s %6s %6s %6s %6s %6s %6s %6s %6s\n" "$f" \
    "$(c "(?i)family=(Inter|Roboto|Poppins|Montserrat|Space\+Grotesk|DM\+Sans)\b|font-family:\s*['\"]?(Inter|Roboto|Arial|Poppins|Montserrat)" "$f")" \
    "$(c "(?i)#(6366f1|8b5cf6|7c3aed|a855f7|4f46e5)|purple|violet" "$f")" \
    "$(c "^\s*[a-z-]+:\s*[^;]*#[0-9a-fA-F]{3,8}\b" "$f")" \
    "$(c "var\(--" "$f")" \
    "$(c ":focus-visible" "$f")" \
    "$(c "prefers-reduced-motion" "$f")" \
    "$(c "transition:\s*all" "$f")" \
    "$(c "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" "$f")" \
    "$(c "<(div|span)[^>]*onclick" "$f")"
done
