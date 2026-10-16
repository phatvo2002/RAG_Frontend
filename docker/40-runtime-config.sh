#!/bin/sh
set -eu

: "${PUBLIC_API_URL:?PUBLIC_API_URL is required}"
if ! printf '%s' "$PUBLIC_API_URL" | grep -Eq '^https?://[A-Za-z0-9._~:/?#@!$&()*+,;=%-]+$'; then
    echo 'PUBLIC_API_URL must be a valid HTTP(S) URL without quotes or spaces.' >&2
    exit 1
fi

printf 'window.__NEXORA_CONFIG__ = { apiBaseUrl: "%s" };\n' "$PUBLIC_API_URL" \
    > /usr/share/nginx/html/runtime-config.js
