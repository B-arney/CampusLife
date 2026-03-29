import { prisma } from '../db.js'

function parseEventDate(body) {
  const raw = body.startAt ?? body.date
  if (!raw) return null

  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return null
  return d
}

export default async function eventRoutes(fastify) {
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
      try {
        await request.jwtVerify()
      } catch {
        return reply.code(401).send({ error: 'Nincs bejelentkezve.' })
      }

      const userId = Number(request.user?.sub)
      if (!Number.isInteger(userId)) {
        return reply.code(401).send({ error: 'Érvénytelen bejelentkezési token.' })
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

      const created = await prisma.event.create({
        data: {
          title: request.body.title.trim(),
          description: request.body.description.trim(),
          startAt,
          location: request.body.location.trim(),
          category: request.body.category.trim(),
          imageUrl: request.body.imageUrl?.trim() || null,
          interests: Array.isArray(request.body.interests) ? request.body.interests : undefined,
          hostId: userId
        },
        select: {
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
      })

      return reply.code(201).send({ event: created })
    }
  )
}

