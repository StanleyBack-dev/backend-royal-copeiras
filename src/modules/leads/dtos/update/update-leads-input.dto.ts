import { Field, InputType } from "@nestjs/graphql";
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from "class-validator";
import { LeadStatus } from "../../enums/lead-status.enum";
import { LeadSource } from "../../enums/lead-source.enum";

@InputType()
export class UpdateLeadsInputDto {
  @Field()
  @IsUUID()
  idLeads!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 120)
  name?: string;

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

  @Field(() => LeadSource, { nullable: true })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => LeadStatus, { nullable: true })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
