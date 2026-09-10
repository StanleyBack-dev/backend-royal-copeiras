import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class PublicIntakeSupplyDto {
  @Field()
  idSupplies!: string;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  defaultUnit?: string | null;
}

@ObjectType()
export class VerifyPublicIntakeCodeResponseDto {
  @Field()
  formToken!: string;

  @Field()
  expiresAt!: string;

  // The operator's active materials catalog, so the public form can offer the
  // same "pick from catalog" material select as the private budget form.
  @Field(() => [PublicIntakeSupplyDto])
  supplies!: PublicIntakeSupplyDto[];
}
