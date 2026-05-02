import { prisma } from '../db.js'

function validateEventPayload(body) {
  const errors = []

  if (!body?.title || !String(body.title).trim()) {
    errors.push({ field: 'title', message: 'Title is required' })
  }
  if (!body?.date || Number.isNaN(new Date(body.date).getTime())) {
    errors.push({ field: 'date', message: 'Valid date is required' })
  }
  if (!body?.location || !String(body.location).trim()) {
    errors.push({ field: 'location', message: 'Location is required' })
  }
  if (!body?.category || !String(body.category).trim()) {
    errors.push({ field: 'category', message: 'Category is required' })
  }
  if (!body?.description || !String(body.description).trim()) {
    errors.push({ field: 'description', message: 'Description is required' })
  }

  const date = new Date(body?.date)
  if (!Number.isNaN(date.getTime()) && date.getTime() < Date.now()) {
    errors.push({ field: 'date', message: 'Event date must be in the future' })
  }

  return errors
}

export default async function eventRoutes(fastify) {
  // Get all events
  fastify.get('/events', async (request, reply) => {
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

  // Get My RSVPs (MUST be above /events/:id)
  fastify.get('/events/me/rsvps', async (request, reply) => {
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
  fastify.post('/events', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.code(401).send({ error: 'Not logged in.' })
    }

    const userId = Number(request.user.sub)
    const body = request.body || {}
    const errors = validateEventPayload(body)

    if (errors.length > 0) {
      return reply.code(400).send({ errors })
    }

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
      ...event,
      rsvpCount: 0,
      hasUserRsvped: false
    })
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

  // Update event
  fastify.put('/events/:id', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.code(401).send({ error: 'Not logged in.' })
    }

    const { id } = request.params
    const eventId = parseInt(id)
    const userId = Number(request.user.sub)
    const isAdmin = request.user.isAdmin === true

    if (isNaN(eventId)) {
      return reply.code(400).send({ error: 'Invalid event ID' })
    }

    const existing = await prisma.event.findUnique({ where: { id: eventId } })
    if (!existing) {
      return reply.code(404).send({ error: 'Event not found' })
    }

    if (existing.hostId !== userId && !isAdmin) {
      return reply.code(403).send({ error: 'You can only edit your own events' })
    }

    const body = request.body || {}
    const errors = validateEventPayload(body)
    if (errors.length > 0) {
      return reply.code(400).send({ errors })
    }

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
  fastify.delete('/events/:id', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.code(401).send({ error: 'Not logged in.' })
    }

    const { id } = request.params
    const eventId = parseInt(id)
    const userId = Number(request.user.sub)
    const isAdmin = request.user.isAdmin === true

    if (isNaN(eventId)) {
      return reply.code(400).send({ error: 'Invalid event ID' })
    }

    const existing = await prisma.event.findUnique({ where: { id: eventId } })
    if (!existing) {
      return reply.code(404).send({ error: 'Event not found' })
    }

    if (existing.hostId !== userId && !isAdmin) {
      return reply.code(403).send({ error: 'You can only delete your own events' })
    }

    await prisma.event.delete({ where: { id: eventId } })
    return { message: 'Event deleted successfully' }
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

  // Cancel RSVP
  fastify.delete('/events/:id/rsvp', async (request, reply) => {
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
