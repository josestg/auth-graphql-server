import "reflect-metadata"

import Express from "express"
import { ApolloServer } from "apollo-server-express"
import { buildSchema } from "type-graphql"

import { HelloResolver } from "./resolvers/Hello"

const main = async () => {
  const schema = await buildSchema({
    resolvers: [HelloResolver],
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
