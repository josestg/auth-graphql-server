import bcrypt from "bcrypt"
import { Arg, Mutation, Query, Resolver, Ctx } from "type-graphql"

import { generateConfirmUserToken, sendConfirmationMail } from "../..//helpers"
import User from "../../entities/User"
import redis from "../../store/redis"
import { AuthContext } from "../../interfaces"
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
    sendConfirmationMail(email, token)

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

  @Mutation(() => User, { nullable: true })
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() ctx: AuthContext
  ): Promise<null | User> {
    const user = await User.findOne({ where: { email } })
    if (!user) return null

    const isValid = bcrypt.compareSync(password, user.password)
    if (!isValid) return null

    if (!user.confirmed) return null

    ctx.req.session!.userId = user.id

    return user
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() ctx: AuthContext): Promise<undefined | User> {
    const userId = ctx.req.session!.userId
    if (!userId) return undefined

    return await User.findOne({ where: { id: userId } })
  }
}
