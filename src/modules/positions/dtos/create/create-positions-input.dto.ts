import { Field, InputType } from "@nestjs/graphql";
import { IsBoolean, IsString, Length } from "class-validator";

@InputType()
export class CreatePositionsInputDto {
  @Field()
  @IsString()
  @Length(2, 120)
  name!: string;

  @Field({ defaultValue: true })
  @IsBoolean()
  isActive: boolean = true;
}
