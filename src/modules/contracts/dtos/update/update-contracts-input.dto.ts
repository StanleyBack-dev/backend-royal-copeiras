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
} from "class-validator";
import { ContractStatus } from "../../enums/contract-status.enum";

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
  @Length(2, 80)
  signatureProvider?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 120)
  signatureEnvelopeId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 60)
  signatureStatus?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 120)
  signedByName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(5, 20)
  signedByDocument?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(5, 120)
  signedByEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 60)
  signerIp?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 255)
  signerUserAgent?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  signedAt?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  consentAt?: string;

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
}
