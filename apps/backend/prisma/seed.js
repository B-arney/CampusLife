import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from '../generated/prisma/default.js';
const { PrismaClient } = pkg

const connectionString =
  `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DATABASE}?schema=public`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.user.createMany({
    data: [
      { email: 'alice@example.com', username: 'alice', password: "$2b$10$0fzWmrUMifEtusCjOsGI2./j2q6dagn5QbAqI20Fuer4VWmS0.xNW" },//PassWord.123
      { email: 'bob@example.com', username: 'bob', password: "$2b$10$0fzWmrUMifEtusCjOsGI2./j2q6dagn5QbAqI20Fuer4VWmS0.xNW" }, 
    ],
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });