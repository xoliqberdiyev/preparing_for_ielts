FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY server.js ./
COPY public ./public

VOLUME /app/data

ENV DB_PATH=/app/data/words.db
ENV PORT=4000

EXPOSE 4000

CMD ["node", "server.js"]
