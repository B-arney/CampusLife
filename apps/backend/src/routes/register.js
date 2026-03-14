import { prisma } from "../db.js"
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { sendMail } from "../../services/mailer.js"

export default async function registerRoutes(fastify) {
  const registerSchema = {
    body: {
      type: 'object',
      required: ['username', 'email', 'password', 'passwordConfirm'],
      properties: {
        username: { type: 'string', minLength: 3 },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8 },
        passwordConfirm: { type: 'string', minLength: 8 }
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
      await sendMail({
        to: email,
        subject: 'Erősítsd meg a regisztrációdat - CampusLife',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 20px auto; padding: 40px; border: 1px solid #eeeeee; border-radius: 12px; background-color: #ffffff; }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { color: #2563eb; margin: 0; font-size: 28px; letter-spacing: -0.5px; }
              .content { margin-bottom: 30px; }
              .content h2 { color: #1f2937; font-size: 20px; margin-bottom: 16px; }
              .content p { margin-bottom: 16px; color: #4b5563; }
              .button-container { text-align: center; margin: 35px 0; }
              .button { display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background-color 0.2s; }
              .footer { font-size: 13px; color: #9ca3af; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 20px; }
              .link-alt { font-size: 12px; color: #9ca3af; word-break: break-all; margin-top: 20px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>CampusLife</h1>
              </div>
              <div class="content">
                <h2>Üdvözlünk a CampusLife-nál!</h2>
                <p>Köszönjük, hogy regisztráltál a <strong>CampusLife</strong> platformján. Már csak egy utolsó lépés választ el attól, hogy teljes hozzáférést kapj a rendszerhez.</p>
                <p>Kérjük, kattints az alábbi gombra a fiókod aktiválásához és az email címed megerősítéséhez:</p>
                
                <div class="button-container">
                  <a href="${verificationLink}" class="button">Fiók megerősítése</a>
                </div>
                
                <p>Ha a gomb nem működik, másold ki az alábbi linket a böngésződbe:</p>
              </div>
              <div class="link-alt">
                <a href="${verificationLink}">${verificationLink}</a>
              </div>
              <div class="footer">
                <p>Ezt az üzenetet azért kaptad, mert regisztrációt kezdeményeztek a CampusLife oldalon.<br>Ha nem te regisztráltál, nyugodtan hagyd figyelmen kívül ezt az emailt.</p>
                <p>&copy; 2026 CampusLife</p>
              </div>
            </div>
          </body>
          </html>
        `
      })
    } catch (mailError) {
      fastify.log.error(mailError)
    }
    
    reply.code(201).send({ 
      message: 'Registration initiated. Please check your email to verify your account.',
      id: user.id, 
      username: user.username, 
      email: user.email 
    })
  })

  fastify.get('/verify', async (request, reply) => {
    const { token } = request.query

    if (!token) {
      return reply.status(400).send({ error: 'Missing token' })
    }

    try {
      const user = await prisma.user.findUnique({
        where: { verificationToken: token }
      })

      if (!user) {
        return reply.status(404).send({ error: 'Invalid or expired token' })
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          verificationToken: null
        }
      })

      const baseUrl = process.env.BASE_URL || 'https://campuslife.social'
      return reply.redirect(`${baseUrl}/login?verified=true`)

    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })
}
