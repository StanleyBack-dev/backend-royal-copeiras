import { Field, Float, InputType, Int } from "@nestjs/graphql";
import { IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";

@InputType()
export class UpdateBudgetItemInputDto {
  @Field()
  @IsString()
  description!: string;

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
