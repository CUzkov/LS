FROM node:16

WORKDIR /usr/src/app
COPY . .
RUN cd ./backend/server && npm install
RUN cd ./backend/server && npm run build

EXPOSE 8000

CMD ["node", "/usr/src/app/backend/server/build/backend/server/src/index.js"]
