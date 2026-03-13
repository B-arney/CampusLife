#!/bin/sh

set -e

npm install

npx prisma migrate reset --force
npx prisma generate

npm run dev