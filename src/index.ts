import "reflect-metadata"

import Express from "express"
import { ApolloServer } from "apollo-server-express"
import { buildSchema } from "type-graphql"
import { createConnection } from "typeorm"
import cors from "cors"

import { HelloResolver } from "./resolvers/Hello"
import UserResolver from "./resolvers/user"
import session from "./sessions/"

const main = async () => {
  let tries = 5
  while (tries > 0) {
    try {
      await createConnection()
      break
    } catch (e) {
      console.log(e)
      tries -= 1
      await Promise.resolve(
        setTimeout(() => {
          console.log("Tries left: ", tries)
        }, 5000)
      )
    }
  }

  const schema = await buildSchema({
    resolvers: [HelloResolver, UserResolver],
  })

  const appoloServer = new ApolloServer({
    schema,
    context: ({ req, res }) => ({ req, res }),
  })

  const app = Express()

  app.use(session())
  app.use(
    cors({
      credentials: true,
      origin: "http://localhost:3000", // frontend
    })
  )

  appoloServer.applyMiddleware({ app })

  app.listen(4000, () => {
    console.log("Server is running on http://localhost:4000/graphql")
  })
}

main()
