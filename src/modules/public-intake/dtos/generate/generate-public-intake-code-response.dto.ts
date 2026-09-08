import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class GeneratePublicIntakeCodeResponseDto {
  @Field()
  code!: string;

  @Field()
  expiresAt!: string;
}
