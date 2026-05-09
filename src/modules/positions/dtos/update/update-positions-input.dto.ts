import { Field, InputType } from "@nestjs/graphql";
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from "class-validator";

@InputType()
export class UpdatePositionsInputDto {
  @Field()
  @IsUUID()
  idPositions!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 120)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
