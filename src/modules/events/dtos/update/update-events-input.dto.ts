import { Type } from "class-transformer";
import { Field, Float, InputType, Int } from "@nestjs/graphql";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from "class-validator";
import { EventStatus } from "../../enums/event-status.enum";
import { UpdateEventExtraExpenseInputDto } from "./update-event-extra-expense-input.dto";

@InputType()
export class UpdateEventsInputDto {
  @Field()
  @IsUUID()
  idEvents!: string;

  @Field(() => EventStatus, { nullable: true })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  overtimeMinutes?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  overtimeHourlyRate?: number;

  @Field(() => [UpdateEventExtraExpenseInputDto], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateEventExtraExpenseInputDto)
  extraExpenses?: UpdateEventExtraExpenseInputDto[];
}
