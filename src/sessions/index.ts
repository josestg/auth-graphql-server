import session from "express-session"
import connectRedis from "connect-redis"

import redis from "../store/redis"
import { SESSION_SECRET } from "../utils/config"

export default function Session() {
  const RedisStore = connectRedis(session)

  return session({
    store: new RedisStore({
      client: redis as any,
    }),
    name: "qid",
    secret: SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV == "production",
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 years
    },
  })
}
