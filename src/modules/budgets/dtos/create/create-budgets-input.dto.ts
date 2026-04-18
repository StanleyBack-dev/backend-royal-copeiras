import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { Field, Float, InputType, Int } from "@nestjs/graphql";
import { BudgetStatus } from "../../enums/budget-status.enum";
import { CreateBudgetItemInputDto } from "./create-budget-item-input.dto";

@InputType()
export class CreateBudgetsInputDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  idLeads?: string;

  @Field(() => BudgetStatus, { defaultValue: BudgetStatus.DRAFT })
  @IsEnum(BudgetStatus)
  status: BudgetStatus = BudgetStatus.DRAFT;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @Field()
  @IsDateString()
  validUntil!: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eventDates?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  eventLocation?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  guestCount?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationHours?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  advancePercentage?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @Field(() => [CreateBudgetItemInputDto])
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetItemInputDto)
  items!: CreateBudgetItemInputDto[];
}
