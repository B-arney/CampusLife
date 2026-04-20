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
      params: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 }
        },
        required: ['email', 'password']
      },
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                username: { type: 'string' },
                email: { type: 'string', format: 'email' },
                displayName: { type: 'string', nullable: true }
              }
            }
          }
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        403: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
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
        username: user.username
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
        displayName: user.displayName
      }
    })
  })

  fastify.post('/logout', {
    schema: {
      tags: ['Authentication'],
      summary: 'Log out the user',
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (_request, reply) => {
    reply.clearCookie('authToken', {
      path: '/'
    })

    return reply.send({ message: 'Successful logout.' })
  })

  fastify.get('/me', {
    schema: {
      tags: ['Profile'],
      summary: 'Get current user details',
      response: {
        200: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                username: { type: 'string' },
                email: { type: 'string', format: 'email' },
                displayName: { type: 'string', nullable: true },
                isVerified: { type: 'boolean' }
              }
            }
          }
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch {
      return reply.code(401).send({ error: 'Not logged in.' })
    }

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
        isVerified: true
      }
    })

    if (!user) {
      return reply.code(401).send({ error: 'User not found.' })
    }

    return reply.send({ user })
  })
}
