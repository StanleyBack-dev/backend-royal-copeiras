import { InputType, Field, Int } from "@nestjs/graphql";
import { IsOptional, IsInt, Min, IsString } from "class-validator";

@InputType()
export class GetPaymentsInputDto {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  idPayments?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  idBudgets?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  idContracts?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  idEvents?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  idLeads?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  endDate?: string;
}
