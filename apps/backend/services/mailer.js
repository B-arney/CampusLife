import { createTransport } from "nodemailer";

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  requireTLS: true
});

export async function sendMail({ to, subject, html }) {
  await transporter.sendMail({
    from: `"CampusLife" <${process.env.SMTP_FROM}>`,
    to,
    subject,
    html
  });
}
