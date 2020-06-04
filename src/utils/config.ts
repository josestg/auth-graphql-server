import dotenv from "dotenv"
dotenv.config()
dotenv.config({ path: `${__dirname}/../../.env` })

export const SESSION_SECRET = process.env.SESSION_SECRET
