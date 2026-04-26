import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from '../generated/prisma/default.js';
import { getConStr } from "./db-config.js";
const { PrismaClient } = pkg

const adapter = new PrismaPg({ connectionString: getConStr() });
const prisma = new PrismaClient({ adapter });

export { prisma };
