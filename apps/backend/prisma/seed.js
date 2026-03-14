import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from '../generated/prisma/default.js';
const { PrismaClient } = pkg

const connectionString = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DATABASE}?schema=public`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const testUsers = [
    { email: 'alice@example.com', username: 'alice', password: "$2b$10$0fzWmrUMifEtusCjOsGI2./j2q6dagn5QbAqI20Fuer4VWmS0.xNW" },
    { email: 'bob@example.com', username: 'bob', password: "$2b$10$0fzWmrUMifEtusCjOsGI2./j2q6dagn5QbAqI20Fuer4VWmS0.xNW" }, 
  ];

  for (const userData of testUsers) {
    const existing = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (!existing) {
      await prisma.user.create({
        data: {
          ...userData,
          isVerified: true
        }
      });
      console.log(`Created test user: ${userData.username}`);
    } else {
      console.log(`Test user already exists: ${userData.username} (Skipping)`);
    }
  }
}

main()
  .catch(e => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
