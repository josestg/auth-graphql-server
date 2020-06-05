import nodemailer from "nodemailer"
import { v4 } from "uuid"

import redis from "../store/redis"
import { TokenPrefix } from "./types"

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(
  to: string,
  body: { subject: string; text: string; html: string }
) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  const testAccount = await nodemailer.createTestAccount()

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  })

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: to, // list of receivers
    ...body,
  })

  console.log("Message sent: %s", info.messageId)
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

export function prefixToken(prefix: TokenPrefix, token: string): string {
  return `${prefix}:${token}`
}

export async function generateUserToken(prefix: TokenPrefix, userId: number) {
  const token = v4()
  await redis.set(prefixToken(prefix, token), userId, "ex", 60 * 60) // 1 hour
  return token
}

export function sendConfirmationMail(to: string, token: string) {
  const url = `http://localhost:3000/user/confirm/${token}`
  const body = {
    subject: "Confirmation",
    text: "Please confirm your account",
    html: `<a href="${url}">${url}</a>`,
  }
  sendEmail(to, body)
}

export function sendForgotPasswordMail(to: string, token: string) {
  const url = `http://localhost:3000/user/forgot-password/${token}`
  const body = {
    subject: "Change Password",
    text: "Visit this link",
    html: `<a href="${url}">${url}</a>`,
  }
  sendEmail(to, body)
}
