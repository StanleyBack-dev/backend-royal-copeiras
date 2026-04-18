import { Field, InputType } from "@nestjs/graphql";
import { IsUUID } from "class-validator";

@InputType()
export class FreezeBudgetPdfInputDto {
  @Field()
  @IsUUID()
  idBudgets!: string;
}
