FROM node:16-alpine

WORKDIR /home/kalina/projects/wbo

RUN chown -R 1000:1000 /home/kalina/projects/wbo

# Allow node to bind to port 80
RUN apk update && apk add libcap
RUN setcap CAP_NET_BIND_SERVICE=+eip /usr/local/bin/node

USER 1000:1000

COPY package.json package-lock.json ./
RUN npm ci --production
COPY --chown=1000:1000 . .

ENV PORT=80
EXPOSE 80

VOLUME /home/kalina/projects/wbo/server-data

CMD ["/usr/local/bin/node", "server/server.js"]
