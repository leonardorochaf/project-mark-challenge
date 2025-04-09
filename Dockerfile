FROM node:20-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache python3 make g++

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml tsconfig.json tsconfig.build.json nest-cli.json ./

RUN pnpm install --frozen-lockfile

COPY ./src ./src

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start:prod"] 