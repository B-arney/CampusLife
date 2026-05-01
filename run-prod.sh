#!/bin/bash

if [ ! -f ".env.prod" ]; then
    cp sample.env.prod .env.prod
    echo ".env.prod létrehozva a sample.env.prod alapján."
else
    echo ".env.prod már létezik, nem másoltuk."
fi

PG_PASSWORD="POSTGRES_PASSWORD"
if grep -q "^$PG_PASSWORD=[^[:space:]]" .env.prod 2>/dev/null; then
    echo "$PG_PASSWORD már rendelkezik értékkel, nem módosítottuk."
else
    PASSWORD=$(tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 24)
    if grep -q "^$PG_PASSWORD=" .env.prod 2>/dev/null; then
        sed -i "s/^$PG_PASSWORD=.*/$PG_PASSWORD=$PASSWORD/" .env.prod
    else
        echo "$PG_PASSWORD=$PASSWORD" >> .env.prod
    fi
    echo "$PG_PASSWORD jelszó létrehozva: $PASSWORD"
fi

PG_USER="POSTGRES_USER"
if grep -q "^$PG_USER=[^[:space:]]" .env.prod 2>/dev/null; then
    echo "$PG_USER már rendelkezik értékkel, nem módosítottuk."
else
    USER=$(tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 16)
    if grep -q "^$PG_USER=" .env.prod 2>/dev/null; then
        sed -i "s/^$PG_USER=.*/$PG_USER=$USER/" .env.prod
    else
        echo "$PG_USER=$USER" >> .env.prod
    fi
    echo "$PG_USER felhasználó létrehozva: $USER"
fi

DB_URL="DATABASE_URL"
U=$(grep "^POSTGRES_USER=" .env.prod | cut -d'=' -f2)
P=$(grep "^POSTGRES_PASSWORD=" .env.prod | cut -d'=' -f2)
H=$(grep "^POSTGRES_HOST=" .env.prod | cut -d'=' -f2)
PORT=$(grep "^POSTGRES_PORT=" .env.prod | cut -d'=' -f2)
DB=$(grep "^POSTGRES_DATABASE=" .env.prod | cut -d'=' -f2)
VAL="postgresql://$U:$P@$H:5432/$DB?schema=public"

if grep -q "^$DB_URL=" .env.prod 2>/dev/null; then
    sed -i "s|^$DB_URL=.*|$DB_URL=$VAL|" .env.prod
    echo "$DB_URL frissítve az .env.prod fájlban."
else
    echo "$DB_URL=$VAL" >> .env.prod
    echo "$DB_URL hozzáadva az .env.prod fájlhoz."
fi

docker build --no-cache -t campuslife-backend -f docker/backend.Dockerfile apps/backend
docker build --no-cache -t campuslife-frontend -f docker/frontend.Dockerfile apps/frontend

echo "Images built successfully."

docker compose -p campuslife-prod -f docker-compose.prod.yml -p campuslife-prod --env-file .env.prod up --force-recreate
