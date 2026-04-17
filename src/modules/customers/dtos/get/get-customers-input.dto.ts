import { InputType, Field } from "@nestjs/graphql";
import { IsOptional, IsUUID, IsDateString } from "class-validator";
import { PaginationInputDto } from "../../../../common/responses/dtos/pagination-input.dto";

@InputType()
export class GetCustomersInputDto extends PaginationInputDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  idCustomers?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
