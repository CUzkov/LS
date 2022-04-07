FROM node:16

WORKDIR /usr/src/app
COPY . .
RUN cd ./backend/server && npm install
RUN cd ./backend/server && npm run build

# для корректного отображения гитом не английский символов (русских, украинских и прочих)
RUN git config --global core.quotepath false

CMD ["node", "/usr/src/app/backend/server/build/backend/server/src/index.js"]
