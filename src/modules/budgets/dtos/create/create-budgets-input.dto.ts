import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsMilitaryTime,
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

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(1)
  @IsMilitaryTime({ each: true })
  eventArrivalTimes!: string[];

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(1)
  @IsMilitaryTime({ each: true })
  eventDepartureTimes!: string[];

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  eventLocation!: string[];

  @Field(() => [Int])
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(1, { each: true })
  guestCount!: number[];

  @Field(() => [Int])
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(BUDGET_DURATION_HOURS_MIN, { each: true })
  @Max(BUDGET_DURATION_HOURS_MAX, { each: true })
  durationHours!: number[];

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

  @Field(() => [Float], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  @Max(100, { each: true })
  discountPercentage?: number[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsIn(["", "percentage", "amount"], { each: true })
  discountType?: string[];

  @Field(() => [Float], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  discountAmount?: number[];

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @Field(() => [Float], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  displacementFee?: number[];

  @Field(() => [CreateBudgetItemInputDto])
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetItemInputDto)
  items!: CreateBudgetItemInputDto[];
}
