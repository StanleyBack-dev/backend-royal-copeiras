import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class VerifyPublicIntakeCodeResponseDto {
  @Field()
  formToken!: string;

  @Field()
  expiresAt!: string;
}
