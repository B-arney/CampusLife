import Fastify from 'fastify'
import AutoLoad from '@fastify/autoload'
import { join } from 'path'

const fastify = Fastify({
  logger: true,
  trustProxy: true,
  ajv: {
    customOptions: { allErrors: true }
  }
})

fastify.addHook('preValidation', async (request, reply) => {
  if ((request.method === 'POST' || request.method === 'PUT') && !request.body) {
    return reply.code(400).send({ error: 'A request body nem lehet üres.' })
  }
})

fastify.setErrorHandler((error, request, reply) => {
  if (error.validation) {
    const simplifiedErrors = error.validation.map(err => ({
      field: err.instancePath.replace('/', ''),
      message: err.message
    }));

    return reply.code(400).send({
      errors: simplifiedErrors
    });
  }
  reply.send(error);
});

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