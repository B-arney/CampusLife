import { prisma } from '../db.js'

export default async function (fastify, opts) {
  fastify.post('/notifications/subscribe', async (request, reply) => {
    const { endpoint, keys } = request.body
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return reply.code(400).send({ error: 'Invalid subscription data.' })
    }

    try {
      await prisma.push_subscription.upsert({
        where: {
          userId_endpoint: {
            userId: request.user.id,
            endpoint
          }
        },
        update: {
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
        create: {
          userId: request.user.id,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
        }
      })
      return reply.send({ success: true })
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send({ error: 'Failed to save subscription.' })
    }
  })

  fastify.get('/notifications/public-key', async (request, reply) => {
    const publicKey = process.env.VAPID_PUBLIC_KEY
    if (!publicKey) {
      return reply.code(500).send({ error: 'VAPID public key not configured' })
    }
    return reply.send({ publicKey })
  })
}
