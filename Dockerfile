FROM mhart/alpine-node:12

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn --frozen-lockfile

COPY . ./

RUN yarn build \
  && rm -rf node_modules \
  && yarn --frozen-lockfile --prod

FROM mhart/alpine-node:slim-12

WORKDIR /app

COPY --from=0 /app/dist ./

COPY --from=0 /app/node_modules ./node_modules

ENV NODE_ENV=production

CMD [ "node", "index.js" ]