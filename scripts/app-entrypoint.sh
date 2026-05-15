#!/bin/sh
set -eu

. /usr/local/bin/resolve-convex-url.sh

jq -n \
  --arg convexUrl "$CONVEX_URL" \
  --arg impressName "${IMPRESS_NAME:-}" \
  --arg impressAddress "${IMPRESS_ADDRESS:-}" \
  --arg impressEmail "${IMPRESS_EMAIL:-}" \
  '
    { convexUrl: $convexUrl }
    + if ($impressName | length) > 0 and ($impressAddress | length) > 0 and ($impressEmail | length) > 0
      then { impress: { name: $impressName, address: $impressAddress, email: $impressEmail } }
      else {}
      end
  ' > /tmp/runtime-config.json

{
  printf 'window.__ESC_RUNTIME__ = '
  cat /tmp/runtime-config.json
  printf ';\n'
} > /usr/share/nginx/html/runtime-config.js

exec nginx -g 'daemon off;'
