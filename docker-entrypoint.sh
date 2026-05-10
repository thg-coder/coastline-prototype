#!/bin/sh
# Coastline prototype — container startup.
# Substitutes ${PORT} into the Nginx server-block template, then execs Nginx.

set -eu

: "${PORT:=8080}"
export PORT

TEMPLATE=/etc/nginx/templates/default.conf.template
TARGET=/etc/nginx/conf.d/default.conf

# Remove any default config shipped with the base image.
if [ -f /etc/nginx/conf.d/default.conf ] && [ ! -L /etc/nginx/conf.d/default.conf ]; then
    rm -f /etc/nginx/conf.d/default.conf
fi

# envsubst is part of nginx:alpine.
envsubst '${PORT}' < "$TEMPLATE" > "$TARGET"

# exec replaces this shell so SIGTERM goes straight to Nginx.
exec nginx -g 'daemon off;'
