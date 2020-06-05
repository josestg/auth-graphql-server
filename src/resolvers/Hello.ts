import { Resolver, Query, UseMiddleware } from "type-graphql"
import { IsAuthenticated } from "../middlewares/IsAuthenticated"

@Resolver()
export class HelloResolver {
  @Query(() => String)
  hello() {
    return "Hello from graphql serve."
  }

  @Query(() => String)
  @UseMiddleware(IsAuthenticated)
  protectedQuery() {
    return "Hello from protected query."
  }
}
