# Multi-stage Docker Build for Vue 3 + Node.js Express + SQLite
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "server/index.js"]