#!/usr/bin/env sh

set -eu

if command -v gitleaks >/dev/null 2>&1; then
  echo "Running gitleaks staged scan..."
  gitleaks protect --staged --redact --config .gitleaks.toml
  exit 0
fi

echo "gitleaks not found; running fallback staged secret scan..."

staged_patch="$(git diff --cached -U0 -- . ':(exclude)*.lock')"

if [ -z "$staged_patch" ]; then
  exit 0
fi

# Only inspect newly added lines in staged changes.
added_lines="$(printf '%s\n' "$staged_patch" | grep -E '^\+' | grep -vE '^\+\+\+' || true)"

if [ -z "$added_lines" ]; then
  exit 0
fi

patterns='(BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY|ghp_[A-Za-z0-9_]{36,}|github_pat_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16}|AWS_SECRET_ACCESS_KEY[[:space:]]*[:=][[:space:]]*[A-Za-z0-9/+=]{30,}|DATABASE_URL[[:space:]]*[:=][[:space:]]*[^[:space:]]+://[^[:space:]]+:[^[:space:]]+@|REDIS_URL[[:space:]]*[:=][[:space:]]*redis://[^[:space:]]+:[^[:space:]]+@)'

if printf '%s\n' "$added_lines" | grep -Eiq "$patterns"; then
  echo "Potential secret detected in staged changes."
  echo "Install gitleaks for stronger checks: brew install gitleaks"
  exit 1
fi

exit 0