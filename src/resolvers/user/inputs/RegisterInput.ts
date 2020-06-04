import { InputType, Field } from "type-graphql"
import { Length, IsEmail } from "class-validator"

import { IsEmailAlreadyExist } from "../validators/IsEmailAlreadyExistConstraint"

@InputType()
export default class RegisterInput {
  @Field()
  @Length(1, 20)
  name: string

  @Field()
  @IsEmail()
  @IsEmailAlreadyExist({ message: "Email already exist." })
  email: string

  @Field()
  password: string
}
