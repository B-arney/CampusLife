import { prisma } from '../db.js'

export default async function eventRoutes(fastify) {
  // Get all events
  fastify.get('/events', {
    schema: {
      tags: ['Events'],
      summary: 'Get all events',
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              title: { type: 'string' },
              description: { type: 'string' },
              startsAt: { type: 'string', format: 'date-time' },
              location: { type: 'string' },
              category: { type: 'string' },
              rsvpCount: { type: 'integer' },
              hasUserRsvped: { type: 'boolean' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    let userId = null
    try {
      await request.jwtVerify()
      userId = Number(request.user.sub)
    } catch (err) {
      // User not logged in, that's fine
    }

    const events = await prisma.event.findMany({
      include: {
        _count: {
          select: { rsvps: true }
        },
        rsvps: userId ? {
          where: { userId }
        } : false
      }
    })

    return events.map(event => ({
      ...event,
      rsvpCount: event._count.rsvps,
      hasUserRsvped: userId ? event.rsvps.length > 0 : false,
      rsvps: undefined,
      _count: undefined
    }))
  })

  // Get My RSVPs
  fastify.get('/events/me/rsvps', {
    schema: {
      tags: ['Events'],
      summary: 'Get RSVPs for the logged-in user',
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              title: { type: 'string' },
              description: { type: 'string' },
              startsAt: { type: 'string', format: 'date-time' },
              location: { type: 'string' },
              category: { type: 'string' },
              rsvpCount: { type: 'integer' },
              hasUserRsvped: { type: 'boolean' }
            }
          }
        },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.code(401).send({ error: 'Not logged in.' })
    }

    const userId = Number(request.user.sub)

    const rsvps = await prisma.rsvp.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            _count: {
              select: { rsvps: true }
            }
          }
        }
      }
    })

    return rsvps.map(r => ({
      ...r.event,
      rsvpCount: r.event._count.rsvps,
      _count: undefined,
      hasUserRsvped: true
    }))
  })

  // Create event
  fastify.post('/events', {
    schema: {
      tags: ['Events'],
      summary: 'Create a new event',
      response: {
        201: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
            location: { type: 'string' },
            category: { type: 'string' },
          }
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            errors: { type: 'object' }
          }
        }
      },
      body: {
        type: 'object',
        required: ['title', 'description', 'date', 'location', 'category'],
        properties: {
          title: { type: 'string', minLength: 1 },
          description: { type: 'string', minLength: 1 },
          date: { type: 'string', format: 'date-time' },
          location: { type: 'string', minLength: 1 },
          category: { type: 'string', minLength: 1 }
        }
      },
      params: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          location: { type: 'string' },
          category: { type: 'string' }
        },
        required: ['title', 'description', 'date', 'location', 'category']
      }
    }
  }, async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.code(401).send({ error: 'Not logged in.' })
    }

    const userId = Number(request.user.sub)
    const body = request.body || {}

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return reply.code(404).send({ error: 'User not found' })
    }

    const event = await prisma.event.create({
      data: {
        title: String(body.title).trim(),
        shortDescription: String(body.description).trim().slice(0, 250),
        description: String(body.description).trim(),
        startsAt: new Date(body.date),
        location: String(body.location).trim(),
        category: String(body.category).trim(),
        hostId: userId,
        hostName: user.displayName || user.username,
        imageUrl: body.imageUrl ? String(body.imageUrl) : null
      }
    })

    return reply.code(201).send({
      message: 'Event successfully created',
      ...event,
      rsvpCount: 0,
      hasUserRsvped: false
    })
  })

  // Get single event
  fastify.get('/events/:id', {
    schema: {
      tags: ['Events'],
      summary: 'Get details of a single event',
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            startsAt: { type: 'string', format: 'date-time' },
            location: { type: 'string' },
            category: { type: 'string' },
            rsvpCount: { type: 'integer' },
            hasUserRsvped: { type: 'boolean' }
          }
        },
        400: { type: 'object', properties: { error: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params
    const eventId = parseInt(id)

    if (isNaN(eventId)) {
      return reply.code(400).send({ error: 'Invalid event ID' })
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { rsvps: true }
        }
      }
    })

    if (!event) {
      return reply.code(404).send({ error: 'Event not found' })
    }

    let hasUserRsvped = false
    try {
      await request.jwtVerify()
      const userId = Number(request.user.sub)
      const rsvp = await prisma.rsvp.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId
          }
        }
      })
      hasUserRsvped = !!rsvp
    } catch (err) {
      // User not logged in, that's fine for GET /events/:id
    }

    return {
      ...event,
      rsvpCount: event._count.rsvps,
      hasUserRsvped,
      _count: undefined
    }
  })

  // Update event
  fastify.put('/events/:id', {
    schema: {
      tags: ['Events'],
      summary: 'Update an event',
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        required: ['title', 'description', 'date', 'location', 'category'],
        properties: {
          title: { type: 'string', minLength: 1 },
          description: { type: 'string', minLength: 1 },
          date: { type: 'string', format: 'date-time' },
          location: { type: 'string', minLength: 1 },
          category: { type: 'string', minLength: 1 },
          imageUrl: { type: 'string', format: 'uri', nullable: true }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            startsAt: { type: 'string', format: 'date-time' },
            location: { type: 'string' },
            category: { type: 'string' },
            rsvpCount: { type: 'integer' },
            hasUserRsvped: { type: 'boolean' }
          }
        },
        400: { type: 'object', properties: { error: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } },
        403: { type: 'object', properties: { error: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.code(401).send({ error: 'Not logged in.' })
    }

    const { id } = request.params
    const eventId = parseInt(id)
    const userId = Number(request.user.sub)

    if (isNaN(eventId)) {
      return reply.code(400).send({ error: 'Invalid event ID' })
    }

    const existing = await prisma.event.findUnique({ where: { id: eventId } })
    if (!existing) {
      return reply.code(404).send({ error: 'Event not found' })
    }

    if (existing.hostId !== userId) {
      return reply.code(403).send({ error: 'You can only edit your own events' })
    }

    const body = request.body || {}

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: String(body.title).trim(),
        shortDescription: String(body.description).trim().slice(0, 250),
        description: String(body.description).trim(),
        startsAt: new Date(body.date),
        location: String(body.location).trim(),
        category: String(body.category).trim(),
        imageUrl: body.imageUrl ? String(body.imageUrl) : null
      }
    })

    const count = await prisma.rsvp.count({ where: { eventId } })

    return {
      ...updated,
      rsvpCount: count,
      hasUserRsvped: false
    }
  })

  // Delete event
  fastify.delete('/events/:id', {
    schema: {
      tags: ['Events'],
      summary: 'Delete an event',
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer' }
        },
        required: ['id']
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        400: { type: 'object', properties: { error: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } },
        403: { type: 'object', properties: { error: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.code(401).send({ error: 'Not logged in.' })
    }

    const { id } = request.params
    const eventId = parseInt(id)
    const userId = Number(request.user.sub)

    if (isNaN(eventId)) {
      return reply.code(400).send({ error: 'Invalid event ID' })
    }

    const existing = await prisma.event.findUnique({ where: { id: eventId } })
    if (!existing) {
      return reply.code(404).send({ error: 'Event not found' })
    }

    if (existing.hostId !== userId) {
      return reply.code(403).send({ error: 'You can only delete your own events' })
    }

    await prisma.event.delete({ where: { id: eventId } })
    return { message: 'Event deleted successfully' }
  })

  // RSVP to an event
  fastify.post('/events/:id/rsvp', {
    schema: {
      tags: ['Events'],
      summary: 'RSVP to an event',
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer' }
        },
        required: ['id']
      },
      response: {
        201: { type: 'object', properties: { message: { type: 'string' } } },
        400: { type: 'object', properties: { error: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.code(401).send({ error: 'Not logged in.' })
    }

    const { id } = request.params
    const eventId = parseInt(id)
    const userId = Number(request.user.sub)

    if (isNaN(eventId)) {
      return reply.code(400).send({ error: 'Invalid event ID' })
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return reply.code(404).send({ error: 'Event not found' })
    }

    // Check if event is in the past
    if (new Date(event.startsAt).getTime() < Date.now()) {
      return reply.code(400).send({ error: 'Cannot RSVP to a past event' })
    }

    try {
      await prisma.rsvp.create({
        data: {
          eventId,
          userId
        }
      })
      return reply.code(201).send({ message: 'RSVP successful' })
    } catch (err) {
      if (err.code === 'P2002') {
        return reply.code(400).send({ error: 'Already RSVPed' })
      }
      throw err
    }
  })

  // Cancel RSVP
  fastify.delete('/events/:id/rsvp', {
    schema: {
      tags: ['Events'],
      summary: 'Cancel RSVP for an event',
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer' }
        },
        required: ['id']
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        400: { type: 'object', properties: { error: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.code(401).send({ error: 'Not logged in.' })
    }

    const { id } = request.params
    const eventId = parseInt(id)
    const userId = Number(request.user.sub)

    if (isNaN(eventId)) {
      return reply.code(400).send({ error: 'Invalid event ID' })
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return reply.code(404).send({ error: 'Event not found' })
    }

    // Check if event is in the past
    if (new Date(event.startsAt).getTime() < Date.now()) {
      return reply.code(400).send({ error: 'Cannot cancel RSVP for a past event' })
    }

    try {
      await prisma.rsvp.delete({
        where: {
          eventId_userId: {
            eventId,
            userId
          }
        }
      })
      return reply.code(200).send({ message: 'RSVP cancelled successfully' })
    } catch (err) {
      if (err.code === 'P2025') {
        return reply.code(400).send({ error: 'No RSVP found for this event' })
      }
      throw err
    }
  })
}
