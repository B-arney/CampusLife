import cron from 'node-cron'
import webpush from 'web-push'
import { prisma } from '../db.js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' }) // or use fastify config if already loaded

// Only set VAPID details if they exist in the env
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:noreply@campuslife.social',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

export function startReminderWorker() {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date()

      // Find unsent reminders that are due
      // Calculate due reminders using a raw query to handle the offsetMinutes math efficiently
      const dueReminderIds = await prisma.$queryRaw`
        SELECT er.id 
        FROM "event_reminder" er
        JOIN "event" e ON e.id = er."eventId"
        WHERE er."isSent" = false
        AND (e."startsAt" - (er."offsetMinutes" * interval '1 minute')) <= NOW()
      `

      if (dueReminderIds.length === 0) return

      const pendingReminders = await prisma.event_reminder.findMany({
        where: {
          id: { in: dueReminderIds.map(r => r.id) }
        },
        include: {
          event: true,
          user: {
            include: {
              push_subscriptions: true
            }
          }
        }
      })

      for (const reminder of pendingReminders) {
        let sentCount = 0
        const subscriptions = reminder.user.push_subscriptions

        for (const sub of subscriptions) {
          try {
            const pushConfig = {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
              }
            }

            const payload = JSON.stringify({
              title: `Event reminder: ${reminder.event.title}`,
              body: `The event ${reminder.event.title} is starting soon!`,
              url: `/events/${reminder.event.id}`
            })

            await webpush.sendNotification(pushConfig, payload)
            sentCount++
          } catch (err) {
            // If the subscription is invalid/expired (status 410 or 404), maybe remove it
            if (err.statusCode === 410 || err.statusCode === 404) {
              await prisma.push_subscription.delete({
                where: { id: sub.id }
              })
            } else {
              console.error('Error sending push notification', err)
            }
          }
        }

        // Mark reminder as sent regardless of success (to prevent infinite loops if no valid subs exist)
        await prisma.event_reminder.update({
          where: { id: reminder.id },
          data: { isSent: true }
        })
      }
    } catch (err) {
      console.error('Error in reminder worker cron', err)
    }
  })
}
