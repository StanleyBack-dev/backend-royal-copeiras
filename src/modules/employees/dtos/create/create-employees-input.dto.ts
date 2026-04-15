import { InputType, Field } from "@nestjs/graphql";
import {
  IsOptional,
  IsString,
  IsEmail,
  IsBoolean,
  Length,
  Matches,
} from "class-validator";

@InputType()
export class CreateEmployeesInputDto {
  @Field()
  @IsString()
  @Length(2, 120)
  name!: string;

  @Field()
  @IsString()
  @Matches(/^\d{11}$/, {
    message: "Documento deve ser CPF com 11 dígitos",
  })
  document!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field()
  @IsString()
  @Length(2, 100)
  position!: string;

  @Field({ defaultValue: true })
  @IsBoolean()
  isActive: boolean = true;
}
