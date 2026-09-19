FROM node:24-alpine AS development-dependencies-env
RUN npm install -g corepack@latest && corepack enable
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY packages ./packages
COPY apps ./apps
RUN yarn install --frozen-lockfile

FROM node:24-alpine AS build-env
RUN npm install -g corepack@latest && corepack enable
WORKDIR /app
COPY --from=development-dependencies-env /app/node_modules ./node_modules
COPY --from=development-dependencies-env /app/packages ./packages
COPY --from=development-dependencies-env /app/apps ./apps
COPY package.json yarn.lock ./
RUN yarn workspace frontend build

FROM node:24-alpine AS production-dependencies-env
RUN npm install -g corepack@latest && corepack enable
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY packages ./packages
COPY apps ./apps
RUN yarn workspaces focus frontend --production

FROM node:24-alpine
RUN npm install -g corepack@latest && corepack enable
WORKDIR /app
COPY --from=production-dependencies-env /app/node_modules ./node_modules
COPY --from=production-dependencies-env /app/package.json ./package.json
COPY --from=build-env /app/apps/frontend/build ./apps/frontend/build
WORKDIR /app/apps/frontend
CMD ["yarn", "start"]
