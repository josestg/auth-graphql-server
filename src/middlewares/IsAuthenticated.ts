import { MiddlewareFn } from "type-graphql"
import { AuthContext } from "../interfaces"

export const IsAuthenticated: MiddlewareFn<AuthContext> = async (
  { context },
  next
) => {
  if (!context.req.session!.userId) {
    throw new Error("User is not authenticated!")
  }
  return next()
}
