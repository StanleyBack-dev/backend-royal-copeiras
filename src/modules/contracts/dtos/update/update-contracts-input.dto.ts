import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ContractStatus } from "../../enums/contract-status.enum";
import { ContractPartyInputDto } from "../shared/contract-party-input.dto";

@InputType()
export class UpdateContractsInputDto {
  @Field()
  @IsUUID()
  idContracts!: string;

  @Field(() => ContractStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

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
  @Length(2, 20)
  sentVia?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  sentAt?: string;

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
