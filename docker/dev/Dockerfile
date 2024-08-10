FROM node:18

RUN apk update && apk add --no-cache git
RUN npm install -g pnpm

WORKDIR /usr/src/app

COPY package*.json ./

RUN pnpm install

COPY . .

EXPOSE 8000

CMD [ "pnpm", "run", "dev" ]