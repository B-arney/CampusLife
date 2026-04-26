#!/bin/sh
set -e

npm install

npm start -- --poll=2000
