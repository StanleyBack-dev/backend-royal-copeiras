import { Field, ObjectType } from "@nestjs/graphql";
import { PageAccessKey } from "../enums/page-access-key.enum";
import { UserGroup } from "../../users/enums/user-group.enum";

@ObjectType()
export class GroupDefaultDto {
  @Field(() => UserGroup)
  group!: UserGroup;

  @Field(() => [PageAccessKey])
  defaultPermissions!: PageAccessKey[];
}

@ObjectType()
export class PageAccessMetadataResponseDto {
  @Field(() => [PageAccessKey])
  allKeys!: PageAccessKey[];

  @Field(() => [GroupDefaultDto])
  groupDefaults!: GroupDefaultDto[];
}
