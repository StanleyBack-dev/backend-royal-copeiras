import { InputType, Field } from "@nestjs/graphql";
import { IsOptional, IsUUID } from "class-validator";

@InputType()
export class GetProfileInputDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  idProfiles?: string;
}
