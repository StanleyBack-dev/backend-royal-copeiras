import { Field, InputType, Int } from "@nestjs/graphql";
import { IsInt, IsOptional, IsUUID, Min } from "class-validator";

@InputType()
export class UpdateEventsInputDto {
  @Field()
  @IsUUID()
  idEvents!: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  overtimeMinutes?: number;
}
