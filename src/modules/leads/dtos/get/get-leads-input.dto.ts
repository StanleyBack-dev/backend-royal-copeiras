import { Field, InputType } from "@nestjs/graphql";
import { IsDateString, IsEnum, IsOptional, IsUUID } from "class-validator";
import { PaginationInputDto } from "../../../../common/responses/dtos/pagination-input.dto";
import { LeadStatus } from "../../enums/lead-status.enum";

@InputType()
export class GetLeadsInputDto extends PaginationInputDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  idLeads?: string;

  @Field(() => LeadStatus, { nullable: true })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
