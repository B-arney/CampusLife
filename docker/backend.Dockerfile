FROM node:24.14.0-alpine

WORKDIR /app

COPY apps/backend/package*.json ./
RUN npm install

COPY apps/backend .

EXPOSE 3000

CMD ["npm", "run", "dev"]
