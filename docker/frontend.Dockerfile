FROM node:24.14.0-alpine

WORKDIR /app

COPY apps/frontend/package*.json ./
RUN npm install -g @angular/cli
RUN npm install

COPY apps/frontend .

EXPOSE 4200
CMD ["ng","serve","--poll=2000","--host=0.0.0.0"]
