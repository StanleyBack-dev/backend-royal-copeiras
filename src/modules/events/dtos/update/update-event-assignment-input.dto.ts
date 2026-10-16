import { Field, Float, InputType } from "@nestjs/graphql";
import { IsBoolean, IsNumber, IsOptional, IsUUID, Min } from "class-validator";

@InputType()
export class UpdateEventAssignmentInputDto {
  @Field()
  @IsUUID()
  idEventAssignments!: string;

  @Field()
  @IsUUID()
  idEmployees!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  employeePayment!: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  overtimeHourlyPayment?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
