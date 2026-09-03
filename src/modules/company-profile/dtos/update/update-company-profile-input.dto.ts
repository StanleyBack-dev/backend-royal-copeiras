import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsIn, IsOptional, IsString, Length } from "class-validator";

export const PIX_KEY_TYPES = [
  "cnpj",
  "cpf",
  "email",
  "phone",
  "random",
] as const;

@InputType()
export class UpdateCompanyProfileInputDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 160)
  legalName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 160)
  tradeName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(11, 20)
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
  @IsEmail()
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
  @IsIn(PIX_KEY_TYPES as unknown as string[])
  pixKeyType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 80)
  issueCity?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 120)
  website?: string;
}
