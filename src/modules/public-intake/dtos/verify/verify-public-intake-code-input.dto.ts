import { Field, InputType } from "@nestjs/graphql";
import { Matches } from "class-validator";

@InputType()
export class VerifyPublicIntakeCodeInputDto {
  @Field()
  @Matches(/^\d{6}$/, { message: "Código deve ter 6 dígitos." })
  code!: string;
}
