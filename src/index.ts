import "reflect-metadata"

import Express from "express"
import { ApolloServer } from "apollo-server-express"
import { buildSchema } from "type-graphql"
import { createConnection } from "typeorm"

import { HelloResolver } from "./resolvers/Hello"
import UserResolver from "./resolvers/user"

const main = async () => {
  await createConnection()

  const schema = await buildSchema({
    resolvers: [HelloResolver, UserResolver],
  })

  const appoloServer = new ApolloServer({
    schema,
  })

  const app = Express()

  appoloServer.applyMiddleware({ app })

  app.listen(4000, () => {
    console.log("Server is running on http://localhost:4000/graphql")
  })
}

main()
