FROM node:18-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY package.json .
COPY .npmrc .
RUN mkdir -p /data/.n8n && chown -R node:node /data/.n8n
USER node
RUN pnpm install
CMD ["pnpm", "start"]
