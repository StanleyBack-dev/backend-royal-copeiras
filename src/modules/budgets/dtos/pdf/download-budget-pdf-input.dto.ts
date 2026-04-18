import { Field, InputType } from "@nestjs/graphql";
import { IsUUID } from "class-validator";

@InputType()
export class DownloadBudgetPdfInputDto {
  @Field()
  @IsUUID()
  idBudgets!: string;
}
