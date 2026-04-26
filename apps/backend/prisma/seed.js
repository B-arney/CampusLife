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

  const testEvents = [
    {
      title: 'Spring Hackathon 2026',
      shortDescription: '48-hour team hackathon with mentors and prizes.',
      description: 'Join students from all majors for a 48-hour build sprint. We provide mentors, API credits, snacks, and a final demo day with jury feedback.',
      startsAt: new Date('2026-05-03T10:00:00.000Z'),
      location: 'Innovation Lab, Building B, Room 204',
      category: 'Technology',
      hostName: 'Student Tech Guild',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80',
      mapUrl: 'https://maps.google.com/?q=Innovation+Lab+Building+B'
    },
    {
      title: 'Campus Career Fair',
      shortDescription: 'Meet employers, internship programs, and alumni recruiters.',
      description: 'Connect with over 40 companies and organizations hiring interns and juniors. Bring your CV and prepare for mini interviews at dedicated booths.',
      startsAt: new Date('2026-06-11T08:30:00.000Z'),
      location: 'Main Hall',
      category: 'Career',
      hostName: 'Career Center',
      imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80',
      mapUrl: 'https://maps.google.com/?q=Campus+Main+Hall'
    },
    {
      title: 'Winter Ball 2025',
      shortDescription: 'Annual formal night with live music and dance.',
      description: 'An evening gala celebrating campus life with live music, performances, and awards for student communities.',
      startsAt: new Date('2025-12-12T19:00:00.000Z'),
      location: 'Grand Auditorium',
      category: 'Social',
      hostName: 'Student Union',
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=80',
      mapUrl: 'https://maps.google.com/?q=Grand+Auditorium+Campus'
    }
  ];

  for (const eventData of testEvents) {
    const existing = await prisma.event.findFirst({
      where: { title: eventData.title }
    });

    if (!existing) {
      await prisma.event.create({
        data: eventData
      });
      console.log(`Created test event: ${eventData.title}`);
    } else {
      console.log(`Test event already exists: ${eventData.title} (Skipping)`);
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
