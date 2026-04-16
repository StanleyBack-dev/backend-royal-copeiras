import { InputType, Field } from "@nestjs/graphql";
import {
  IsOptional,
  IsEnum,
  IsDateString,
  IsPhoneNumber,
} from "class-validator";

@InputType()
export class UpdateProfileInputDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsPhoneNumber("BR")
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(["male", "female", "other"])
  sex?: "male" | "female" | "other";

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(["sedentary", "light", "moderate", "active", "very_active"])
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active";

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(["lose_weight", "maintain", "gain_weight"])
  goal?: "lose_weight" | "maintain" | "gain_weight";
}
