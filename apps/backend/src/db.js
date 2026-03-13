import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from '../generated/prisma/default.js';
const { PrismaClient } = pkg

const connectionString =
  `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DATABASE}?schema=public`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };