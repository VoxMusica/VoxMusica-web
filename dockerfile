FROM node:26-alpine AS build
WORKDIR /app

RUN npm install -g yarn

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean
RUN yarn add @libsql/linux-x64-musl --optional

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN yarn build
# make sure tsconfig.json's outDir is "dist" — check this first


FROM node:26-alpine AS runtime
WORKDIR /app

RUN yarn add @libsql/linux-x64-musl --optional


COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production \
    && yarn cache clean \
    && npm uninstall -g yarn \
    && npm cache clean --force

COPY --from=build /app/dist ./dist

VOLUME /data

USER node
CMD ["node", "dist/main.js"]
