import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
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
import {
  BUDGET_ALLOWED_PAYMENT_METHODS,
  BUDGET_DURATION_HOURS_MAX,
  BUDGET_DURATION_HOURS_MIN,
} from "../../constants/budget-form-rules.constant";

@InputType()
export class CreateBudgetsInputDto {
  @Field()
  @IsUUID()
  idLeads!: string;

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

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(1)
  @IsDateString({}, { each: true })
  eventDates!: string[];

  @Field()
  @IsString()
  @IsNotEmpty()
  eventLocation!: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  guestCount!: number;

  @Field(() => Int)
  @IsInt()
  @Min(BUDGET_DURATION_HOURS_MIN)
  @Max(BUDGET_DURATION_HOURS_MAX)
  durationHours!: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  @IsIn(BUDGET_ALLOWED_PAYMENT_METHODS)
  paymentMethod!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  @Max(100)
  advancePercentage!: number;

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
