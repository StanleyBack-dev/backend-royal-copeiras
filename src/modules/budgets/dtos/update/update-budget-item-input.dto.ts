import { Field, Float, InputType, Int } from "@nestjs/graphql";
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from "class-validator";
import { BudgetItemType } from "../../enums/budget-item-type.enum";

@InputType()
export class UpdateBudgetItemInputDto {
  @Field(() => BudgetItemType, { defaultValue: BudgetItemType.LABOR })
  @IsEnum(BudgetItemType)
  itemType: BudgetItemType = BudgetItemType.LABOR;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  idPositions?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  idSupplies?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  unit?: string;

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

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @Min(0)
  eventDateIndex: number = 0;
}
