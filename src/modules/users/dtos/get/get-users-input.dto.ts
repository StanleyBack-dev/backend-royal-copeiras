import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsUUID } from "class-validator";
import { PaginationInputDto } from "../../../../common/responses/dtos/pagination-input.dto";

@InputType()
export class GetUsersInputDto extends PaginationInputDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  idUsers?: string;
}
