import { Resolver, Query, Arg, Mutation } from "type-graphql"
import bcrypt from "bcrypt"

import User from "../../entities/User"
import RegisterInput from "./inputs/RegisterInput"

@Resolver()
export default class UserResolver {
  @Query(() => [User])
  async users(): Promise<User[]> {
    return User.find({})
  }

  @Query(() => User, { nullable: true })
  async user(@Arg("id") id: number): Promise<User | undefined> {
    return User.findOne({ id })
  }

  @Mutation(() => User)
  async register(
    @Arg("data") { name, email, password }: RegisterInput
  ): Promise<User> {
    const hashed = bcrypt.hashSync(password, 12)

    const user = await User.create({
      email,
      name,
      password: hashed,
    }).save()

    return user
  }
}
