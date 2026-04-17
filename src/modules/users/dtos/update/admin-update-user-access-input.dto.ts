import { Field, InputType } from "@nestjs/graphql";
import { IsBoolean, IsEnum, IsOptional, IsUUID } from "class-validator";
import { UserGroup } from "../../enums/user-group.enum";

@InputType()
export class AdminUpdateUserAccessInputDto {
  @Field()
  @IsUUID()
  idUsers!: string;

  @Field(() => UserGroup, { nullable: true })
  @IsOptional()
  @IsEnum(UserGroup)
  group?: UserGroup;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
