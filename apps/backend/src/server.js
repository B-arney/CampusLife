import Fastify from 'fastify'
import apiRoutes from './routes/api.js'

const fastify = Fastify({
  logger: true,
  trustProxy: true
})

fastify.register(apiRoutes, { prefix: '/api' })

await fastify.listen({
  port: 3000,
  host: '0.0.0.0'
})
