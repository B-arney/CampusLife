import { prisma } from "../db.js"

export default async function healthRoutes(fastify) {
  fastify.get('/', async () => {
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1`;
    const end = Date.now()
    
    return {
      status: 'ok',
      uptime: process.uptime(),
      ms: end - start
    }
  })
}
