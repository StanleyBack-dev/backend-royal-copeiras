import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";
import { ContractStatus } from "../../enums/contract-status.enum";

@InputType()
export class CreateContractsInputDto {
  @Field()
  @IsUUID()
  idBudgets!: string;

  @Field(() => ContractStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @Field()
  @IsDateString()
  issueDate!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  body?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  templateVersion?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}
