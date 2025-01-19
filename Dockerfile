FROM node:16-alpine as build

WORKDIR /app
RUN chown node:node /app
RUN apk add --no-cache git

COPY --chown=node:node package-lock.json package-lock.json
COPY --chown=node:node package.json package.json
RUN npm ci

COPY --chown=node:node . .

RUN npm run build
RUN npm prune --omit=dev

FROM node:16-alpine

WORKDIR /app
RUN chown node:node /app

COPY --from=build --chown=node:node /app/build /app/build
COPY --from=build --chown=node:node /app/swagger.yml /app
COPY --from=build --chown=node:node /app/node_modules /app/node_modules

USER node

CMD ["node", "build/server.js"]
