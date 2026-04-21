import { Field, InputType } from "@nestjs/graphql";
import {
  ArrayMinSize,
  IsArray,
  IsBase64,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { SignatureSignerInputDto } from "./signature-signer-input.dto";

@InputType()
export class CreateSignatureRequestInputDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  documentName!: string;

  @Field()
  @IsString()
  @IsBase64()
  documentBase64!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  externalReference?: string;

  @Field(() => [SignatureSignerInputDto])
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SignatureSignerInputDto)
  signers!: SignatureSignerInputDto[];
}
