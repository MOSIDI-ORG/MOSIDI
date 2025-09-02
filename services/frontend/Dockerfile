FROM node:lts-alpine as build-stage

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

RUN npm install @vue/cli@5.0.8 -g

COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .

RUN npm run build

# production stage: create NGINX server
FROM nginx:stable-alpine as production-stage

COPY --from=build-stage ./app/dist /usr/share/nginx/html/app/

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]