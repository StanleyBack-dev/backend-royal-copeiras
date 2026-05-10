import { Field, Float, InputType, Int } from "@nestjs/graphql";
import {
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { PaymentOrigin } from "../../enums/payment-origin.enum";
import { PaymentStatus } from "../../enums/payment-status.enum";

@InputType()
export class CreatePaymentItemInputDto {
  @Field(() => String)
  @IsEnum(PaymentOrigin)
  origin!: PaymentOrigin;

  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  plannedAmount!: number;

  @Field(() => String)
  @IsNotEmpty()
  @IsEnum(PaymentStatus)
  status!: PaymentStatus;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  paidAmount!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  proofUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
