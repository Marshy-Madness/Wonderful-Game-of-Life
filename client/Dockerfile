FROM node:18

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

ENV PORT=2987

EXPOSE 2987

CMD ["npm", "start"]
