import { Field, Float, InputType, Int } from "@nestjs/graphql";
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from "class-validator";

@InputType()
export class UpdateBudgetItemInputDto {
  @Field()
  @IsUUID()
  idPositions!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  description!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  gender?: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  quantity!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number = 0;
}
