export default async function healthRoutes(fastify) {
  fastify.get('/', async () => {
    return {
      status: 'ok',
      uptime: process.uptime()
    }
  })
}
