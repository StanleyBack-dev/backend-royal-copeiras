import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class SubmitPublicIntakeResponseDto {
  @Field()
  idLeads!: string;

  @Field()
  idBudgets!: string;
}
