import healthRoutes from './health.js'

export default async function apiRoutes(fastify) {
  fastify.register(healthRoutes, {
    prefix: '/health'
  })
}
