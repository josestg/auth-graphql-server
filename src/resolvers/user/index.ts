import bcrypt from "bcrypt"
import { Arg, Mutation, Query, Resolver, Ctx } from "type-graphql"

import {
  generateUserToken,
  sendConfirmationMail,
  sendForgotPasswordMail,
  prefixToken,
} from "../../helpers"
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

    const token = await generateUserToken("confirm-user", user.id)
    sendConfirmationMail(email, token)

    return user
  }

  @Mutation(() => Boolean)
  async confirmUser(@Arg("token") token: string): Promise<boolean> {
    const key = prefixToken("confirm-user", token)
    const userId = await redis.get(key)

    if (!userId) return false

    await User.update({ id: parseInt(userId) }, { confirmed: true })
    await redis.del(key)

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

  @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") email: string): Promise<boolean> {
    const user = await User.findOne({ where: { email } })
    if (!user || !user.confirmed) return true

    const token = await generateUserToken("forgot-password", user.id)
    sendForgotPasswordMail(email, token)

    return true
  }

  @Mutation(() => User, { nullable: true })
  async changePassword(
    @Arg("password") password: string,
    @Arg("token") token: string,
    @Ctx() ctx: AuthContext
  ) {
    const key = prefixToken("forgot-password", token)
    const userId = await redis.get(key)
    if (!userId) return null

    const user = await User.findOne({ where: { id: userId } })
    if (!user) return null

    user.password = bcrypt.hashSync(password, 12)
    await user.save()
    await redis.del(key)

    // auto login
    ctx.req.session!.userId = user.id

    return user
  }
}
