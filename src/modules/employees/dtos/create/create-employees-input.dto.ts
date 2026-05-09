import { InputType, Field } from "@nestjs/graphql";
import {
  ValidateIf,
  IsOptional,
  IsString,
  IsEmail,
  IsBoolean,
  Length,
  Matches,
  IsUUID,
} from "class-validator";

@InputType()
export class CreateEmployeesInputDto {
  @Field()
  @IsString()
  @Length(2, 120)
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @ValidateIf(
    (_, value) => value !== null && value !== undefined && value !== "",
  )
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

  @Field()
  @IsUUID()
  idPositions!: string;

  @Field({ defaultValue: true })
  @IsBoolean()
  isActive: boolean = true;
}
