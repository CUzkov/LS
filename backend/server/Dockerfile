FROM node:16

WORKDIR /usr/src/app
COPY . .
RUN ls -la
RUN cd ./backend/server && npm install
RUN cd ./backend/server && npm run build

EXPOSE 8000

CMD ["node", "./backend/server/build/index.js"]
