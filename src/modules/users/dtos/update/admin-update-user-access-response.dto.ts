import { Field, ObjectType } from "@nestjs/graphql";
import { UserGroup } from "../../enums/user-group.enum";

@ObjectType()
export class AdminUpdateUserAccessResponseDto {
  @Field()
  idUsers!: string;

  @Field(() => UserGroup)
  group!: UserGroup;

  @Field()
  status!: boolean;

  @Field({ nullable: true })
  inactivatedAt?: Date;

  @Field()
  updatedAt!: Date;
}
