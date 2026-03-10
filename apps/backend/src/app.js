import Fastify from 'fastify'
import AutoLoad from '@fastify/autoload'
import { join } from 'path'

const fastify = Fastify({
  logger: true,
  trustProxy: true
})

fastify.register(AutoLoad, {
  dir: join(process.cwd(), 'src/routes'),
  options: {
    prefix: '/api',
  }
})

await fastify.listen({
  port: 3000,
  host: '0.0.0.0'
})
console.log(fastify.printRoutes())