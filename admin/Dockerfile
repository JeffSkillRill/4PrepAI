# Build context must be the repo root (this app imports from ../shared).
# Build with: docker build -f admin/Dockerfile .

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /repo

COPY admin/package.json admin/package-lock.json ./admin/
RUN npm ci --prefix admin

COPY shared/ ./shared/
COPY admin/ ./admin/

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

WORKDIR /repo/admin
RUN npm run build

# ---- serve ----
FROM nginx:1.27-alpine AS serve
COPY --from=build /repo/admin/dist /usr/share/nginx/html
COPY admin/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
