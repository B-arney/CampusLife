import { prisma } from '../db.js'

export default async function profileRoutes(fastify) {
  fastify.get('/profile', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.code(401).send({ error: 'Not logged in.' })
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(request.user.sub) },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        major: true,
        interests: true,
        profilePicture: true
      }
    })

    if (!user) {
      return reply.code(404).send({ error: 'User not found.' })
    }
    return reply.send(user)
  })

  fastify.put('/profile', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.code(401).send({ error: 'Not logged in.' })
    }

    const userId = Number(request.user.sub)
    let updateData = {}
    
    if (request.isMultipart()) {
      const parts = request.parts()
      for await (const part of parts) {
        if (part.type === 'file') {
          if (part.fieldname === 'profilePicture') {
            const buffer = await part.toBuffer()
            const base64 = buffer.toString('base64')
            updateData.profilePicture = `data:${part.mimetype};base64,${base64}`
          }
        } else {
          if (part.fieldname === 'interests') {
            updateData.interests = part.value
          } else if (['username', 'major', 'displayName'].includes(part.fieldname)) {
            updateData[part.fieldname] = part.value
          } else if (part.fieldname === 'removeProfilePicture' && part.value === 'true') {
			updateData.profilePicture = null
		  }
        }
      }
    } else {
      updateData = request.body
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          major: true,
          interests: true,
          profilePicture: true
        }
      })
      return reply.send(updatedUser)
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({ error: 'Error saving profile.' })
    }
  })
}
