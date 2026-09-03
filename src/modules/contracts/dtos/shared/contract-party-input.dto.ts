import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsString, Length } from "class-validator";

/**
 * Optional per-contract override of the CONTRATADA identity.
 * Fields left empty inherit the company profile (company-profile module).
 */
@InputType()
export class ContractPartyInputDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 160)
  legalName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 160)
  tradeName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  document?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 30)
  stateRegistration?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 30)
  municipalRegistration?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 120)
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 80)
  addressCity?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 2)
  addressState?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 9)
  addressZipCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 120)
  representativeName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 80)
  representativeRole?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  representativeDocument?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 120)
  pixKey?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  pixKeyType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 80)
  issueCity?: string;
}
