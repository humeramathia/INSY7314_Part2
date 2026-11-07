FROM node:22-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY scripts ./scripts
RUN mkdir -p certs && node scripts/generate-certs.js && chown -R node:node /app

USER node
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=25s --retries=12 \
  CMD node scripts/docker-healthcheck.js

CMD ["node", "src/server.js"]
