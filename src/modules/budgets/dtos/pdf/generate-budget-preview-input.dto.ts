import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CreateBudgetsInputDto } from "../create/create-budgets-input.dto";

@InputType()
export class GenerateBudgetPreviewInputDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  idBudgets?: string;

  @Field({ nullable: true })
  @IsOptional()
  budgetNumber?: string;

  @Field(() => CreateBudgetsInputDto, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateBudgetsInputDto)
  draft?: CreateBudgetsInputDto;
}
