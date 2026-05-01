import { Field, InputType } from "@nestjs/graphql";
import { IsDateString, IsEnum, IsOptional, IsUUID } from "class-validator";
import { PaginationInputDto } from "../../../../common/responses/dtos/pagination-input.dto";
import { EventStatus } from "../../enums/event-status.enum";

@InputType()
export class GetEventsInputDto extends PaginationInputDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  idEvents?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  idContracts?: string;

  @Field(() => EventStatus, { nullable: true })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
