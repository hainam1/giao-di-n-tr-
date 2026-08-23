FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run prisma:generate && npm prune --omit=dev
EXPOSE 5000
CMD ["npm", "start"]
