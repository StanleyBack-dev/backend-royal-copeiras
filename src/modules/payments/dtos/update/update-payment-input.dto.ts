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
import { PaymentStatus } from "../../enums/payment-status.enum";
import { CreatePaymentItemInputDto } from "../shared/create-payment-item-input.dto";

@InputType()
export class UpdatePaymentInputDto {
  @Field()
  @IsUUID()
  idPayments!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

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

  @Field(() => [CreatePaymentItemInputDto], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentItemInputDto)
  paymentItems?: CreatePaymentItemInputDto[];
}
