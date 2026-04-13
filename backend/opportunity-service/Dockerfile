FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY tsconfig.json ./
COPY ../shared ./shared
COPY src ./src

RUN npm run build

EXPOSE 8002

CMD ["node", "dist/src/index.js"]
