import { Field, InputType, Int } from "@nestjs/graphql";
import { IsEnum, IsInt, IsOptional, IsUUID, Min } from "class-validator";
import { EventStatus } from "../../enums/event-status.enum";

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
}
