import { Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsOptional, IsUUID } from "class-validator";
import { PaginationInputDto } from "../../../common/responses/dtos/pagination-input.dto";
import { SignatureStatus } from "../enums/signature-status.enum";

@InputType()
export class GetSignaturesInputDto extends PaginationInputDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  idContracts?: string;

  @Field(() => SignatureStatus, { nullable: true })
  @IsOptional()
  @IsEnum(SignatureStatus)
  status?: SignatureStatus;
}
