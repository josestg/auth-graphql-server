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
  await createConnection()

  const schema = await buildSchema({
    resolvers: [HelloResolver, UserResolver],
  })

  const appoloServer = new ApolloServer({
    schema,
    context: ({ req }) => ({ req }),
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
