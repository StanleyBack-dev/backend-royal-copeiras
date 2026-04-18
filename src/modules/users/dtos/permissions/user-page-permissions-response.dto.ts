import { Field, ObjectType } from "@nestjs/graphql";
import { PageAccessKey } from "../../../auth/enums/page-access-key.enum";
import { UserGroup } from "../../enums/user-group.enum";

@ObjectType()
export class UserPagePermissionsResponseDto {
  @Field()
  idUsers!: string;

  @Field(() => UserGroup)
  group!: UserGroup;

  @Field(() => [PageAccessKey])
  effectivePermissions!: PageAccessKey[];

  @Field(() => [PageAccessKey])
  defaultPermissions!: PageAccessKey[];

  @Field(() => Boolean)
  useGroupDefaults!: boolean;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
