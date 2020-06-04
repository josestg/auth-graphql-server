import bcrypt from "bcrypt"
import { Arg, Mutation, Query, Resolver } from "type-graphql"

import { generateConfirmUserToken, sendEmail } from "../..//helpers"
import User from "../../entities/User"
import redis from "../../store/redis"
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

    const token = await generateConfirmUserToken(user.id)
    sendEmail(email, token)

    return user
  }

  @Mutation(() => Boolean)
  async confirmUser(@Arg("token") token: string): Promise<boolean> {
    const userId = await redis.get(token)
    if (!userId) return false

    await User.update({ id: parseInt(userId) }, { confirmed: true })
    await redis.del(token)

    return true
  }
}
