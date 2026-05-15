#!/bin/sh
set -eu

if [ -z "${CONVEX_SELF_HOSTED_URL:-}" ] && [ -n "${CONVEX_URL:-}" ]; then
  CONVEX_SELF_HOSTED_URL="$CONVEX_URL"
fi

if [ -z "${CONVEX_SELF_HOSTED_URL:-}" ]; then
  echo "CONVEX_URL or CONVEX_SELF_HOSTED_URL is required (Convex backend URL for production deploy)" >&2
  exit 1
fi

if [ -z "${CONVEX_SELF_HOSTED_ADMIN_KEY:-}" ]; then
  echo "CONVEX_SELF_HOSTED_ADMIN_KEY is required" >&2
  exit 1
fi

export CONVEX_SELF_HOSTED_URL
export CONVEX_SELF_HOSTED_ADMIN_KEY

exec pnpm exec convex deploy --yes
