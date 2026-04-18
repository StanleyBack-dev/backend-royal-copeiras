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
  @Length(2, 60)
  source?: string;

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
