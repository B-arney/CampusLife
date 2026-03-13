#!/bin/sh

set -e

npm install

npx prisma db push
npx prisma db seed
npx prisma generate

npm run dev