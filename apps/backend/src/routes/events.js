import { prisma } from '../db.js'

export default async function eventRoutes(fastify) {
  // Get all events
  fastify.get('/events', async (request, reply) => {
    const events = await prisma.event.findMany({
      include: {
        _count: {
          select: { rsvps: true }
        }
      }
    })

    return events.map(event => ({
      ...event,
      rsvpCount: event._count.rsvps,
      _count: undefined
    }))
  })

  // Get single event
  fastify.get('/events/:id', async (request, reply) => {
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

  // RSVP to an event
  fastify.post('/events/:id/rsvp', async (request, reply) => {
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
}
