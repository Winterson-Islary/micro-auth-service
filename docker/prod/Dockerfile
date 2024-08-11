FROM node:18-alpine AS builder

RUN apk update && apk add --no-cache git
RUN npm install -g pnpm

WORKDIR /app

COPY package*.json ./

RUN pnpm install

COPY . .

RUN pnpm run build



FROM node:18-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN pnpm install --ignore-scripts

COPY --from=builder /app/dist ./

EXPOSE 5501

CMD [ "node", "src/server.js" ]