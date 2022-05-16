FROM node:16

WORKDIR /usr/src/app
COPY . .

RUN ls /usr/src/app -l

RUN cd ./backend/server && npm install
RUN cd ./backend/server && npm run build

# для корректного отображения гитом не английский символов (русских, украинских и прочих)
RUN git config --global core.quotepath false

RUN ls /usr/src/app/backend/server/build

CMD ["node", "/usr/src/app/backend/server/build/index.js"]
