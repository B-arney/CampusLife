import { prisma } from '../db.js'

const eventSelectPublic = {
  id: true,
  title: true,
  description: true,
  startAt: true,
  location: true,
  category: true,
  imageUrl: true,
  interests: true,
  hostId: true,
  createdAt: true
}

function parseEventDate(body) {
  const raw = body.startAt ?? body.date
  if (!raw) return null

  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return null
  return d
}

async function requireUserId(request, reply) {
  try {
    await request.jwtVerify()
  } catch {
    reply.code(401).send({ error: 'Nincs bejelentkezve.' })
    return null
  }
  const userId = Number(request.user?.sub)
  if (!Number.isInteger(userId)) {
    reply.code(401).send({ error: 'Érvénytelen bejelentkezési token.' })
    return null
  }
  return userId
}

function normalizeInterests(interests) {
  if (!Array.isArray(interests)) return undefined
  return interests
}

export default async function eventRoutes(fastify) {
  fastify.get('/events', async (_request, reply) => {
    const events = await prisma.event.findMany({
      orderBy: { startAt: 'asc' },
      select: eventSelectPublic
    })
    return reply.send({ events })
  })

  fastify.get('/events/:id', async (request, reply) => {
    const id = Number(request.params.id)
    if (!Number.isInteger(id) || id < 1) {
      return reply.code(400).send({ error: 'Érvénytelen esemény azonosító.' })
    }
    const event = await prisma.event.findUnique({
      where: { id },
      select: eventSelectPublic
    })
    if (!event) {
      return reply.code(404).send({ error: 'Az esemény nem található.' })
    }
    return reply.send({ event })
  })

  fastify.post(
    '/events',
    {
      schema: {
        body: {
          type: 'object',
          required: ['title', 'description', 'location', 'category'],
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 200 },
            description: { type: 'string', minLength: 1, maxLength: 5000 },
            location: { type: 'string', minLength: 1, maxLength: 255 },
            category: { type: 'string', minLength: 1, maxLength: 80 },

            // Accept either `startAt` (preferred) or `date` (current frontend form).
            startAt: { type: 'string' },
            date: { type: 'string' },

            imageUrl: { type: 'string', maxLength: 2048 },
            interests: {
              type: 'array',
              items: { type: 'string', minLength: 1, maxLength: 50 },
              maxItems: 25
            }
          },
          additionalProperties: false,
          anyOf: [{ required: ['startAt'] }, { required: ['date'] }]
        }
      }
    },
    async (request, reply) => {
      const userId = await requireUserId(request, reply)
      if (userId == null) return

      const startAt = parseEventDate(request.body)
      if (!startAt) {
        return reply.code(400).send({ errors: [{ field: 'date', message: 'Érvénytelen dátum.' }] })
      }

      if (startAt.getTime() <= Date.now()) {
        return reply
          .code(400)
          .send({ errors: [{ field: 'date', message: 'Event date must be in the future' }] })
      }

      const created = await prisma.event.create({
        data: {
          title: request.body.title.trim(),
          description: request.body.description.trim(),
          startAt,
          location: request.body.location.trim(),
          category: request.body.category.trim(),
          imageUrl: request.body.imageUrl?.trim() || null,
          interests: normalizeInterests(request.body.interests),
          hostId: userId
        },
        select: eventSelectPublic
      })

      return reply.code(201).send({ event: created })
    }
  )

  const updateBodySchema = {
    type: 'object',
    required: ['title', 'description', 'location', 'category'],
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 200 },
      description: { type: 'string', minLength: 1, maxLength: 5000 },
      location: { type: 'string', minLength: 1, maxLength: 255 },
      category: { type: 'string', minLength: 1, maxLength: 80 },
      startAt: { type: 'string' },
      date: { type: 'string' },
      imageUrl: { type: 'string', maxLength: 2048 },
      interests: {
        type: 'array',
        items: { type: 'string', minLength: 1, maxLength: 50 },
        maxItems: 25
      }
    },
    additionalProperties: false,
    anyOf: [{ required: ['startAt'] }, { required: ['date'] }]
  }

  fastify.put(
    '/events/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string', pattern: '^[1-9][0-9]*$' } }
        },
        body: updateBodySchema
      }
    },
    async (request, reply) => {
      const userId = await requireUserId(request, reply)
      if (userId == null) return

      const id = Number(request.params.id)
      const existing = await prisma.event.findUnique({ where: { id } })
      if (!existing) {
        return reply.code(404).send({ error: 'Az esemény nem található.' })
      }
      if (existing.hostId !== userId) {
        return reply.code(403).send({ error: 'Nincs jogosultságod ehhez az eseményhez.' })
      }

      const startAt = parseEventDate(request.body)
      if (!startAt) {
        return reply.code(400).send({ errors: [{ field: 'date', message: 'Érvénytelen dátum.' }] })
      }
      if (startAt.getTime() <= Date.now()) {
        return reply
          .code(400)
          .send({ errors: [{ field: 'date', message: 'Event date must be in the future' }] })
      }

      const updated = await prisma.event.update({
        where: { id },
        data: {
          title: request.body.title.trim(),
          description: request.body.description.trim(),
          startAt,
          location: request.body.location.trim(),
          category: request.body.category.trim(),
          imageUrl: request.body.imageUrl?.trim() || null,
          interests: normalizeInterests(request.body.interests)
        },
        select: eventSelectPublic
      })

      return reply.send({ event: updated })
    }
  )

  fastify.delete(
    '/events/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string', pattern: '^[1-9][0-9]*$' } }
        }
      }
    },
    async (request, reply) => {
      const userId = await requireUserId(request, reply)
      if (userId == null) return

      const id = Number(request.params.id)
      const existing = await prisma.event.findUnique({ where: { id } })
      if (!existing) {
        return reply.code(404).send({ error: 'Az esemény nem található.' })
      }
      if (existing.hostId !== userId) {
        return reply.code(403).send({ error: 'Nincs jogosultságod ehhez az eseményhez.' })
      }

      await prisma.event.delete({ where: { id } })
      return reply.code(204).send()
    }
  )
}

