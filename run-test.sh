#!/bin/bash

if [ ! -f ".env.test" ]; then
    cp sample.env.test .env.test
    echo ".env.test létrehozva a sample.env.test alapján."
else
    echo ".env.test már létezik, nem másoltuk."
fi

docker build --no-cache -t campuslife-backend:test -f docker/backend.Dockerfile apps/backend
docker build --no-cache -t campuslife-frontend:test -f docker/frontend.Dockerfile apps/frontend

echo "Test images built successfully."

export PUID=$(id -u)
export PGID=$(id -g)

docker network create caddy 2>/dev/null || true

docker compose -f docker-compose.test.yml -p campuslife-test --env-file .env.test up --force-recreate
