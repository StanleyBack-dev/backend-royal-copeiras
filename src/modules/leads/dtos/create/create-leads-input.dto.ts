import { Field, InputType } from "@nestjs/graphql";
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from "class-validator";
import { LeadStatus } from "../../enums/lead-status.enum";
import { LeadSource } from "../../enums/lead-source.enum";

@InputType()
export class CreateLeadsInputDto {
  @Field()
  @IsString()
  @Length(2, 120)
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Matches(/^\d{11}$|^\d{14}$/, {
    message: "Documento deve ser CPF (11 dígitos) ou CNPJ (14 dígitos)",
  })
  document?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 160)
  legalName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 255)
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 160)
  addressStreet?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  addressNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  addressComplement?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  addressNeighborhood?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 80)
  addressCity?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  addressState?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(8, 9)
  @Matches(/^\d{8}$|^\d{5}-\d{3}$/, {
    message: "CEP deve ter 8 dígitos (NNNNN-NNN)",
  })
  addressZipCode?: string;

  @Field(() => LeadSource)
  @IsEnum(LeadSource)
  source!: LeadSource;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => LeadStatus, { defaultValue: LeadStatus.NEW })
  @IsEnum(LeadStatus)
  status: LeadStatus = LeadStatus.NEW;

  @Field({ defaultValue: true })
  @IsBoolean()
  isActive: boolean = true;
}
