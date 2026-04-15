import { InputType, Field } from "@nestjs/graphql";
import { IsOptional, IsUUID, IsDateString } from "class-validator";

@InputType()
export class GetEmployeesInputDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  idEmployees?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
