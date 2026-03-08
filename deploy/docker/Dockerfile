FROM node:20-alpine
WORKDIR /app

COPY package.json pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./
COPY apps ./apps
COPY packages ./packages
COPY deploy/docker/server.mjs ./deploy/docker/server.mjs

RUN npm install
RUN npm run build

ENV PORT=8080
ENV LEDRA_REGISTRY_PATH=/data/registry
EXPOSE 8080

CMD ["node", "deploy/docker/server.mjs"]
