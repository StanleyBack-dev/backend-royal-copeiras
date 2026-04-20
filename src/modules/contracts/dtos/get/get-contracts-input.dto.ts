import { Field, InputType } from "@nestjs/graphql";
import { IsDateString, IsEnum, IsOptional, IsUUID } from "class-validator";
import { PaginationInputDto } from "../../../../common/responses/dtos/pagination-input.dto";
import { ContractStatus } from "../../enums/contract-status.enum";

@InputType()
export class GetContractsInputDto extends PaginationInputDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  idContracts?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  idBudgets?: string;

  @Field(() => ContractStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
