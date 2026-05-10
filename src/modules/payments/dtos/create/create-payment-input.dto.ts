import { Field, Float, InputType } from "@nestjs/graphql";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { PaymentOrigin } from "../../enums/payment-origin.enum";
import { CreatePaymentItemInputDto } from "../shared/create-payment-item-input.dto";

@InputType()
export class CreatePaymentInputDto {
  @Field()
  @IsUUID()
  idLeads!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  idBudgets?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  idContracts?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  idEvents?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  idEmployees?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(PaymentOrigin)
  origin?: PaymentOrigin;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  plannedAmount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => [CreatePaymentItemInputDto], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentItemInputDto)
  paymentItems?: CreatePaymentItemInputDto[];
}
