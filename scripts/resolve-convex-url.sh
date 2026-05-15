#!/bin/sh
# Resolves CONVEX_URL from common env var names. Exports CONVEX_URL on success.

if [ -z "${CONVEX_URL:-}" ]; then
  if [ -n "${CONVEX_SELF_HOSTED_URL:-}" ]; then
    CONVEX_URL="$CONVEX_SELF_HOSTED_URL"
  elif [ -n "${VITE_CONVEX_URL:-}" ]; then
    CONVEX_URL="$VITE_CONVEX_URL"
  fi
fi

if [ -z "${CONVEX_URL:-}" ]; then
  echo "CONVEX_URL, CONVEX_SELF_HOSTED_URL, or VITE_CONVEX_URL is required" >&2
  exit 1
fi

export CONVEX_URL
