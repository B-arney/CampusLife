import { sendActivationEmail } from "../../services/mailer.js"
import { prisma } from "../db.js"
import bcrypt from 'bcrypt'
import crypto from 'crypto'

export default async function registerRoutes(fastify) {
  const registerSchema = {
    body: {
      type: 'object',
      required: ['username', 'email', 'password', 'passwordConfirm'],
      properties: {
        username: { type: 'string', minLength: 3 },
        email: { type: 'string', format: 'email' },
        password: { 
          type: 'string', 
          minLength: 8,
          pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&\\.\\^])[A-Za-z\\d@$!%*?&\\.\\^]{8,}$'
        },
        passwordConfirm: { 
          type: 'string', 
          minLength: 8,
          pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&\\.\\^])[A-Za-z\\d@$!%*?&\\.\\^]{8,}$'
        }
      }
    }
  }
  
  fastify.post('/register', {
    schema: registerSchema
  }, async (request, reply) => {
    const { username, email, password, passwordConfirm } = request.body
    
    if (password !== passwordConfirm) {
      return reply.code(400).send({ error: "A jelszavak nem egyeznek." })
    }
    
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      let message = '';
      if (existingUser.email === email) message = 'Ez az email már foglalt.';
      if (existingUser.username === username) message = 'Ez a felhasználónév már foglalt.';
      return reply.code(400).send({ error: message });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    const verificationToken = crypto.randomBytes(32).toString('hex')
    
    const user = await prisma.user.create({
      data: { 
        username, 
        email, 
        password: hashedPassword,
        isVerified: false,
        verificationToken
      },
    })

    const baseUrl = process.env.BASE_URL || 'https://campuslife.social'
    const verificationLink = `${baseUrl}/api/verify?token=${verificationToken}`
    
    try {
      await sendActivationEmail(email, verificationLink)
    } catch (mailError) {
      fastify.log.error(mailError)
    }
    
    reply.code(201).send({ 
      message: 'Registration initiated. Please check your email to verify your account.'
    })
  })
}
