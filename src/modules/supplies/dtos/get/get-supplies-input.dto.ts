import { Field, InputType } from "@nestjs/graphql";
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";
import { PaginationInputDto } from "../../../../common/responses/dtos/pagination-input.dto";

@InputType()
export class GetSuppliesInputDto extends PaginationInputDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  idSupplies?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
