import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString } from "class-validator";

@InputType()
export class CancelSignatureRequestInputDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  requestId!: string;
}
