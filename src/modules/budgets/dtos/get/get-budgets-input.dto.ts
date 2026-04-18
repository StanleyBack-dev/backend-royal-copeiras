import { Field, InputType } from "@nestjs/graphql";
import { IsDateString, IsEnum, IsOptional, IsUUID } from "class-validator";
import { PaginationInputDto } from "../../../../common/responses/dtos/pagination-input.dto";
import { BudgetStatus } from "../../enums/budget-status.enum";

@InputType()
export class GetBudgetsInputDto extends PaginationInputDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  idBudgets?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  idLeads?: string;

  @Field(() => BudgetStatus, { nullable: true })
  @IsOptional()
  @IsEnum(BudgetStatus)
  status?: BudgetStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
