import { prisma } from '../db.js'
import { adminOnly } from '../hooks/auth.js'


function validateImageUrl(imageUrl) {
    if (!imageUrl) return null

    const value = String(imageUrl)
    const allowedDataPrefixes = [
        'data:image/jpeg;base64,',
        'data:image/png;base64,',
        'data:image/webp;base64,'
    ]

    if (allowedDataPrefixes.some(prefix => value.startsWith(prefix))) {
        return value
    }

    try {
        const url = new URL(value)
        if (url.protocol === 'https:' || url.protocol === 'http:') {
            return value
        }
    } catch {
        return { error: 'imageUrl must be a valid image URL' }
    }

    return { error: 'imageUrl must be a valid image URL' }
}


const schema = {
          type: 'array',
          items: {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                title: { type: 'string' },
                content: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                expiresAt: { type: 'string', format: 'date-time' },
                createdBy: { type: 'integer' },
                imageUrl: { type: ['string', 'null'] },
                creator: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        username: { type: 'string' },
                        displayName: { type: ['string', 'null'] },
                        profilePicture: { type: ['string', 'null'] }
                    }
                }
            }
          }
        }

export default async function newsRoutes(fastify) {
    fastify.get('/news', {
    schema: {
      tags: ['News'],
      summary: 'Get all news',
      response: {
        200: schema
      }
    }
  }, async (request, reply) => {
        const news = await prisma.news.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: { creator: true }
        })
        return news
    })

    fastify.get('/news/latest', {
        schema: {
            tags: ['News'],
            summary: 'Get latest 3 news',
            response: {
                200: schema
            }
        }
    }, async (request, reply) => {
        const news = await prisma.news.findMany({
            take: 3,
            orderBy: {
                createdAt: 'desc'
            },
            include: { creator: true }
        })
        return news
    })

    fastify.post('/news', {
        onRequest: [adminOnly],
        schema: {
            tags: ['News'],
            summary: 'Create news',
            body: {
                type: 'object',
                required: ['title', 'content', 'expiresAt'],
                properties: {
                    title: { type: 'string', minLength: 1 },
                    content: { type: 'string', minLength: 1 },
                    expiresAt: { type: 'string', format: 'date-time' },
                    imageUrl: { type: ['string', 'null'] }
                }
            },
            response: {
                201: schema.items
            }
        }
    }, async (request, reply) => {
        const { title, content, expiresAt } = request.body
        const userId = Number(request.user.sub)

        const validateImageUrl = validateImageUrl(imageUrl)
        if(validateImageUrl?.error){
            return reply.code(400).send({error: validateImageUrl.error})
        }

        const newsItem = await prisma.news.create({
            data: {
                title,
                content,
                expiresAt: new Date(expiresAt),
                createdBy: userId,
                imageUrl: validateImageUrl
            },
            include: { creator: true }
        })

        return reply.code(201).send(newsItem)
    })
    
}