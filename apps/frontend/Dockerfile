FROM node:24-alpine AS build-env
RUN npm install -g corepack@latest && corepack enable
WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY packages ./packages
COPY apps/frontend ./apps/frontend
COPY apps/backend/package.json ./apps/backend/package.json

RUN yarn workspaces focus @voxmusica/frontend
RUN yarn workspace @voxmusica/frontend build


FROM node:24-alpine AS production-dependencies-env
RUN npm install -g corepack@latest && corepack enable
WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY packages ./packages
COPY apps/frontend ./apps/frontend
COPY apps/backend/package.json ./apps/backend/package.json

RUN yarn workspaces focus @voxmusica/frontend --production


FROM node:24-alpine
RUN npm install -g corepack@latest && corepack enable
WORKDIR /app

COPY --from=production-dependencies-env /app/node_modules ./node_modules
COPY --from=production-dependencies-env /app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY --from=production-dependencies-env /app/package.json ./package.json
COPY --from=production-dependencies-env /app/apps/frontend/package.json ./apps/frontend/package.json
COPY --from=build-env /app/apps/frontend/build ./apps/frontend/build

WORKDIR /app/apps/frontend
CMD ["yarn", "start"]