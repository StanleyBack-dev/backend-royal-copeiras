import { Field, Float, InputType } from "@nestjs/graphql";
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from "class-validator";

@InputType()
export class CreateSuppliesInputDto {
  @Field()
  @IsString()
  @Length(2, 120)
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 32)
  defaultUnit?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  suggestedUnitPrice?: number;

  @Field({ defaultValue: true })
  @IsBoolean()
  isActive: boolean = true;
}
