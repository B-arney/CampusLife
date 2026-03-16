import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from '../generated/prisma/default.js';
const { PrismaClient } = pkg

export function getConStr() {
  const {
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_DATABASE
  } = process.env;

  return `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DATABASE}?schema=public`;
}

const adapter = new PrismaPg({ connectionString: getConStr() });
const prisma = new PrismaClient({ adapter });

export { prisma };
