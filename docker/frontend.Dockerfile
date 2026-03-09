FROM node:24.14.0-alpine

WORKDIR /app

COPY apps/frontend/package*.json ./
RUN npm install

COPY apps/frontend .

EXPOSE 4200
CMD ["npm","start"]
