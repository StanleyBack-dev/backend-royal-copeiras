import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
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
import { UpdateBudgetItemInputDto } from "./update-budget-item-input.dto";
import {
  BUDGET_ALLOWED_PAYMENT_METHODS,
  BUDGET_DURATION_HOURS_MAX,
  BUDGET_DURATION_HOURS_MIN,
} from "../../constants/budget-form-rules.constant";

@InputType()
export class UpdateBudgetsInputDto {
  @Field()
  @IsUUID()
  idBudgets!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  idLeads?: string;

  @Field(() => BudgetStatus, { nullable: true })
  @IsOptional()
  @IsEnum(BudgetStatus)
  status?: BudgetStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsDateString({}, { each: true })
  eventDates?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  eventLocation?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  guestCount?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(BUDGET_DURATION_HOURS_MIN)
  @Max(BUDGET_DURATION_HOURS_MAX)
  durationHours?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsIn(BUDGET_ALLOWED_PAYMENT_METHODS)
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

  @Field(() => [UpdateBudgetItemInputDto], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateBudgetItemInputDto)
  items?: UpdateBudgetItemInputDto[];
}
