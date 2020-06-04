import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm"
import { Field, ID, ObjectType } from "type-graphql"

@ObjectType()
@Entity()
export default class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number

  @Field()
  @Column()
  name: string

  @Field()
  @Column("text", { unique: true })
  email: string

  @Field()
  @Column("bool", { default: false })
  confirmed: boolean

  @Column()
  password: string
}
