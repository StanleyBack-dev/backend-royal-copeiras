import { InputType, Field } from "@nestjs/graphql";
import {
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsDateString,
  Length,
  Matches,
} from "class-validator";

@InputType()
export class CreateCustomersInputDto {
  @Field()
  @IsString()
  @Length(2, 120)
  name!: string;

  @Field()
  @IsString()
  @Matches(/^(\d{11}|\d{14})$/, {
    message: "Documento deve ser CPF (11 dígitos) ou CNPJ (14 dígitos)",
  })
  document!: string;

  @Field(() => String)
  @IsEnum(["individual", "company"])
  type!: "individual" | "company";

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
  @IsDateString()
  birthDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field({ defaultValue: true })
  @IsBoolean()
  isActive: boolean = true;
}
