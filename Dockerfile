FROM node:20-alpine AS build

WORKDIR /app

RUN apk add --no-cache python3 make g++ bash curl \
    && corepack disable \
    && curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version 1.22.22

ENV PATH="${PATH}:/root/.yarn/bin"

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

COPY .env .env

RUN yarn build

FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
