import { Field, InputType } from "@nestjs/graphql";
import { IsUUID } from "class-validator";

@InputType()
export class GenerateContractPreviewInputDto {
  @Field()
  @IsUUID()
  idContracts!: string;
}
