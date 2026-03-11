#!/bin/sh

set -e

npm install

npx prisma migrate deploy
npx prisma generate

npm run dev