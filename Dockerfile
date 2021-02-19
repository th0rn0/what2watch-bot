FROM node:13

WORKDIR /usr/src/app

COPY src /usr/src/app

RUN npm install pm2 -g

RUN npm install

RUN mkdir /usr/src/app/database


ENTRYPOINT ["pm2-runtime"]
CMD ["app.js", "--prod "]