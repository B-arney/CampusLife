import { createTransport } from "nodemailer";
import Handlebars from "handlebars"

import fs from "fs/promises"
import path from "path"

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

async function  renderTemplate (name, variables = {}) {
  const filePath = path.resolve("src/templates/emails", `${name}.html`)
  const templateContent = await fs.readFile(filePath, "utf8")
  const template = Handlebars.compile(templateContent)

  return template(variables)
}

export async function sendActivationEmail(email, verificationLink) {
  try {
    const html = await renderTemplate("activation", {
      verificationLink
    })

    const info = await transporter.sendMail({
      from: `"CampusLife" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: "Confirm your registration - CampusLife",
      html
    })
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
