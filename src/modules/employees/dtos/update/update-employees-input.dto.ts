import { InputType, Field } from "@nestjs/graphql";
import {
  IsUUID,
  IsOptional,
  IsString,
  IsEmail,
  IsBoolean,
  Length,
  Matches,
} from "class-validator";

@InputType()
export class UpdateEmployeesInputDto {
  @Field()
  @IsUUID()
  idEmployees!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 120)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, {
    message: "Documento deve ser CPF com 11 dígitos",
  })
  document?: string;

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
  @Length(2, 100)
  position?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
