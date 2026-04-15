import Fastify from 'fastify'
import AutoLoad from '@fastify/autoload'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import cookie from '@fastify/cookie'
import jwt from '@fastify/jwt'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import { join } from 'path'

const fastify = Fastify({
  logger: true,
  trustProxy: true,
  ajv: {
    customOptions: { allErrors: true }
  }
})

await fastify.register(cors, {
  origin: true,
  credentials: true
})

await fastify.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
})

fastify.addHook('preValidation', async (request, reply) => {
  if (request.isMultipart()) {
    return
  }
  // Allow empty bodies for specific routes or if body is not strictly required
  if ((request.method === 'POST' || request.method === 'PUT') && !request.body && !request.url.includes('/rsvp') && !request.url.includes('/logout')) {
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

await fastify.register(swagger, {
  openapi: {
    info: {
      title: 'teszt',
      description: 'teszt leírás',
      version: '0.0.1'
    }
  }
})

await fastify.register(swaggerUI, {
  routePrefix: '/api/docs'
})

await fastify.register(cookie)

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'dev-insecure-secret-change-me',
  cookie: {
    cookieName: 'authToken',
    signed: false
  }
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