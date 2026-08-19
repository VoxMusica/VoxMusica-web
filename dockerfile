FROM node:26-alpine AS build

WORKDIR /app

RUN npm install -g yarn

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile \
    && yarn cache clean

COPY tsconfig.json ./
COPY src ./src

RUN yarn build


FROM node:26-alpine AS runtime

WORKDIR /app

RUN npm install -g yarn

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --production \
    && yarn cache clean \
    && npm uninstall -g yarn \
    && npm cache clean --force

COPY --from=build /app/dist ./dist

USER node

CMD ["node", "dist/main.js"]