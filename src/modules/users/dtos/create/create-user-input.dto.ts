import { Field, InputType } from "@nestjs/graphql";
import {
  IsEmail,
  IsEnum,
  IsString,
  IsUrl,
  Length,
  Matches,
} from "class-validator";
import { UserGroup } from "../../enums/user-group.enum";

@InputType()
export class CreateUserInputDto {
  @Field()
  @IsString()
  @Length(2, 120)
  name!: string;

  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  @Length(3, 40)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      "Username deve conter apenas letras, números, ponto, underscore ou hífen.",
  })
  username!: string;

  @Field(() => UserGroup, { defaultValue: UserGroup.USER })
  @IsEnum(UserGroup)
  group: UserGroup = UserGroup.USER;

  @Field({ nullable: true })
  @IsUrl({}, { message: "A URL do avatar deve ser válida." })
  urlAvatar?: string;
}
