FROM node:16 as build-stage

WORKDIR /app

ADD ./frontend/site/public /app/build
ADD ./frontend/site /app

RUN npm i
RUN npm rebuild node-sass
RUN npm run build

FROM nginx:1.19.6

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build-stage /app/build /usr/share/nginx/html
COPY ./frontend/nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]