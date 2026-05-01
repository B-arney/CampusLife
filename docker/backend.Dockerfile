FROM node:24.14.0-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

EXPOSE 3000

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
