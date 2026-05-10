# syntax=docker/dockerfile:1.7
# ---- Stage 1: build the static site ----
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first for better layer caching.
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source and build.
COPY . .
RUN npm run build

# ---- Stage 2: serve via Nginx ----
FROM nginx:alpine

# Replace stock Nginx config with one tuned for an unprivileged user under
# Cloud Run, plus our server-block template.
COPY nginx.main.conf /etc/nginx/nginx.conf
COPY nginx.conf      /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint-coastline.sh

# Clean default content, ensure writable tmp dirs for the nginx user, copy app.
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf \
 && mkdir -p /tmp/nginx /var/cache/nginx \
 && chown -R nginx:nginx /tmp/nginx /var/cache/nginx /usr/share/nginx/html /etc/nginx/conf.d \
 && chmod +x /docker-entrypoint-coastline.sh

COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Cloud Run injects PORT (default 8080).
ENV PORT=8080
EXPOSE 8080

USER nginx
ENTRYPOINT ["/docker-entrypoint-coastline.sh"]
