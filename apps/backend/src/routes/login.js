import bcrypt from 'bcrypt'
import { prisma } from '../db.js'

function getCookieOptions() {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 
  }
}

export default async function loginRoutes(fastify) {
  fastify.post('/login', {
    schema: {
      tags: ['Authentication'],
      summary: 'Authenticate user and return token',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 }
        }
      }
    }
  }, async (request, reply) => {
    const { email, password } = request.body

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return reply.code(401).send({ error: 'Invalid email or password.' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return reply.code(401).send({ error: 'Invalid email or password.' })
    }

    if (!user.isVerified) {
      return reply.code(403).send({ error: 'Account is not activated yet.' })
    }

    const token = await reply.jwtSign(
      {
        sub: user.id,
        username: user.username,
        isAdmin: user.isAdmin
      },
      { expiresIn: '24h' }
    )

    reply.setCookie('authToken', token, getCookieOptions())

    return reply.send({
      message: 'Successful login.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        isAdmin: user.isAdmin
      }
    })
  })

  fastify.post('/logout', async (_request, reply) => {
    reply.clearCookie('authToken', {
      path: '/'
    })

    return reply.send({ message: 'Successful logout.' })
  })

  fastify.get('/me', async (request, reply) => {
    const userId = Number(request.user.sub)
    if (!Number.isInteger(userId)) {
      return reply.code(401).send({ error: 'Invalid login token.' })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        isVerified: true,
        isAdmin: true
      }
    })

    if (!user) {
      return reply.code(401).send({ error: 'User not found.' })
    }

    return reply.send({ user })
  })
}
