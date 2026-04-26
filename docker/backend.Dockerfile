FROM node:24.14.0-alpine

WORKDIR /app

COPY apps/backend/package*.json ./
RUN npm install

EXPOSE 3000

COPY apps/backend/entrypoint.sh .
RUN chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
