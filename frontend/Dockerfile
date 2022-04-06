FROM node:16 as build-stage

WORKDIR /app

ADD ./frontend/site/public /app/build
ADD . /app

RUN cd ./frontend/site && npm i
RUN cd ./frontend/site && npm rebuild node-sass
RUN cd ./frontend/site && npm run build
RUN cd ./frontend/site/build && mv * ../../../build

FROM nginx:1.19.6

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build-stage /app/build /usr/share/nginx/html
COPY ./frontend/nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]