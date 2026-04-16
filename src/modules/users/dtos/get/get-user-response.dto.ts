import { ObjectType, Field } from "@nestjs/graphql";
import { UserGroup } from "../../enums/user-group.enum";

@ObjectType()
export class GetUserResponseDto {
  @Field()
  idUsers: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  urlAvatar?: string;

  @Field()
  status: boolean;

  @Field(() => UserGroup)
  group: UserGroup;

  @Field({ nullable: true })
  inactivatedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
