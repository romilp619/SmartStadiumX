FROM node:18-alpine

WORKDIR /app

# Install server deps
COPY package*.json ./
RUN npm ci --only=production

# Copy server source
COPY . .

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "server.js"]
