FROM node:16

WORKDIR /usr/src/app
COPY . .

RUN npm install
RUN npm run build

# для корректного отображения гитом не английский символов (русских, украинских и прочих)
RUN git config --global core.quotepath false

CMD ["node", "./build/backend/server/src/index.js"]
