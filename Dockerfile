# Single image: build client, then run server serving API + static build.
# Point your reverse proxy at this container on port 2988; no /api forwarding needed.

FROM node:18 AS client-builder
WORKDIR /app/client
COPY client/package.json client/package-lock.json* ./
RUN npm ci --omit=dev || npm install
COPY client/ ./
RUN npm run build

FROM node:18
WORKDIR /app
COPY server/package.json server/package-lock.json* ./
RUN npm ci --omit=dev || npm install
COPY server/ ./
COPY --from=client-builder /app/client/build ./client/build
ENV PORT=2988
ENV STATIC_DIR=/app/client/build
EXPOSE 2988
CMD ["node", "server.js"]
