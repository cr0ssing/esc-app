#!/bin/sh
set -eu

. /usr/local/bin/resolve-convex-url.sh

escaped_url=$(printf '%s' "$CONVEX_URL" | sed 's/\\/\\\\/g; s/"/\\"/g')
printf 'window.__ESC_RUNTIME__ = {"convexUrl":"%s"};\n' "$escaped_url" \
  > /usr/share/nginx/html/runtime-config.js

exec nginx -g 'daemon off;'
