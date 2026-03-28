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
      return reply.code(401).send({ error: 'Hibás email vagy jelszó.' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return reply.code(401).send({ error: 'Hibás email vagy jelszó.' })
    }

    if (!user.isVerified) {
      return reply.code(403).send({ error: 'A fiók még nincs aktiválva.' })
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
      message: 'Sikeres bejelentkezés.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName
      }
    })
  })

  fastify.post('/logout', async (_request, reply) => {
    reply.clearCookie('authToken', {
      path: '/'
    })

    return reply.send({ message: 'Sikeres kijelentkezés.' })
  })

  fastify.get('/me', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch {
      return reply.code(401).send({ error: 'Nincs bejelentkezve.' })
    }

    const userId = Number(request.user.sub)
    if (!Number.isInteger(userId)) {
      return reply.code(401).send({ error: 'Érvénytelen bejelentkezési token.' })
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
      return reply.code(401).send({ error: 'A felhasználó nem található.' })
    }

    return reply.send({ user })
  })
}
