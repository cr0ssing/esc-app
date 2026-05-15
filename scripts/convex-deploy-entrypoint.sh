#!/bin/sh
set -eu

. /usr/local/bin/resolve-convex-url.sh

if [ -z "${CONVEX_SELF_HOSTED_ADMIN_KEY:-}" ]; then
  echo "CONVEX_SELF_HOSTED_ADMIN_KEY is required" >&2
  exit 1
fi

export CONVEX_SELF_HOSTED_URL="$CONVEX_URL"
export CONVEX_SELF_HOSTED_ADMIN_KEY

exec pnpm exec convex deploy --yes
