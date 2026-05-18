import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from '../generated/prisma/default.js';
const { PrismaClient } = pkg

const connectionString = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DATABASE}?schema=public`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const userHash = await bcrypt.hash('PassWord.123', 10);

  const testUsers = [
    { email: 'alice@example.com', username: 'alice', password: userHash },
    { email: 'bob@example.com', username: 'bob', password: userHash },
    { email: 'admin@campuslife.local', username: 'admin', password: userHash, isAdmin: true },
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

  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@campuslife.local' }
  });

  const testNews = [
    {
      title: 'Campus Library Extended Hours This Exam Season',
      content: 'The main library will be open 24/7 from May 15 to June 10 to support students during the exam period. Extra study rooms can be booked through the student portal.',
      expiresAt: new Date('2026-06-10T23:59:00.000Z'),
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1400&q=80',
    },
    {
      title: 'New Bike Parking Installed Near Building C',
      content: 'A new covered bike parking facility has been installed near Building C with 40 spots available. Students can register their bike with the campus security office.',
      expiresAt: new Date('2026-12-31T23:59:00.000Z'),
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=1400&q=80',
    },
    {
      title: 'Cafeteria Renovation Starting Next Week',
      content: 'The main cafeteria will undergo renovation from May 10. Temporary food service will be available in the Student Center lobby. We apologize for the inconvenience.',
      expiresAt: new Date('2026-07-01T23:59:00.000Z'),
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80',
    },
    {
      title: 'Student Union Elections Open for Nominations',
      content: 'Nominations for the 2026/27 Student Union board are now open. Any enrolled student can apply by submitting a nomination form at the Student Affairs office by May 20.',
      expiresAt: new Date('2026-05-20T23:59:00.000Z'),
      imageUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1400&q=80',
    },
    {
      title: 'Free Mental Health Workshops in May',
      content: 'The campus counseling center is hosting weekly mental health workshops every Wednesday in May. Topics include stress management, sleep hygiene, and exam anxiety. No registration needed.',
      expiresAt: new Date('2026-05-31T23:59:00.000Z'),
      imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1400&q=80',
    },
  ];

  for (const newsData of testNews) {
    const existing = await prisma.news.findFirst({
      where: { title: newsData.title }
    });

    if (!existing) {
      await prisma.news.create({
        data: {
          ...newsData,
          createdBy: adminUser.id
        }
      });
      console.log(`Created test news: ${newsData.title}`);
    } else {
      console.log(`Test news already exists: ${newsData.title} (Skipping)`);
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
