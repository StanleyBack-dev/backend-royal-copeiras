import { InputType, Field } from "@nestjs/graphql";
import { IsOptional, IsUUID, IsDateString } from "class-validator";

@InputType()
export class GetCustomersInputDto {
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
