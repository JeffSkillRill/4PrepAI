# Build context must be the repo root (this app imports from ../shared).
# Build with: docker build -f app/Dockerfile .

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /repo

COPY app/package.json app/package-lock.json ./app/
RUN npm ci --prefix app

COPY shared/ ./shared/
COPY app/ ./app/

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_ALLOW_PRODUCTION_DESTRUCTIVE_OPERATIONS=false
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_ALLOW_PRODUCTION_DESTRUCTIVE_OPERATIONS=$VITE_ALLOW_PRODUCTION_DESTRUCTIVE_OPERATIONS

WORKDIR /repo/app
RUN npm run build

# ---- serve ----
FROM nginx:1.27-alpine AS serve
COPY --from=build /repo/app/dist /usr/share/nginx/html
COPY app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
