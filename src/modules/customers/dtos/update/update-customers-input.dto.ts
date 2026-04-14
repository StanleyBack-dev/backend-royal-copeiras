import { InputType, Field } from "@nestjs/graphql";
import {
  IsUUID,
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  IsBoolean,
  Length,
  Matches,
} from "class-validator";

@InputType()
export class UpdateCustomersInputDto {
  @Field()
  @IsUUID()
  idCustomers!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 120)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^(\d{11}|\d{14})$/, {
    message: "Documento deve ser CPF (11 dígitos) ou CNPJ (14 dígitos)",
  })
  document?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(["individual", "company"])
  type?: "individual" | "company";

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
  @IsString()
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
