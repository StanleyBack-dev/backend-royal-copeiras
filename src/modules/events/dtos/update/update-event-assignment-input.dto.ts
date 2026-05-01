import { Field, Float, InputType } from "@nestjs/graphql";
import { IsBoolean, IsNumber, IsOptional, IsUUID, Min } from "class-validator";

@InputType()
export class UpdateEventAssignmentInputDto {
  @Field()
  @IsUUID()
  idEventAssignments!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  idEmployees?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  employeePayment?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
