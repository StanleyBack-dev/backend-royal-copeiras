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
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ContractStatus } from "../../enums/contract-status.enum";
import { ContractPartyInputDto } from "../shared/contract-party-input.dto";

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

  @Field(() => ContractPartyInputDto, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContractPartyInputDto)
  contractor?: ContractPartyInputDto;
}
