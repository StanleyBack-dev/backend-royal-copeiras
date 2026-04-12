import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class CreateCustomersResponseDto {
  @Field()
  idCustomers: string;

  @Field(() => Float)
  weightKg: number;

  @Field(() => Float)
  bmi: number;

  @Field()
  bmiStatus: string;

  @Field({ nullable: true })
  observation?: string;

  @Field()
  measurementDate: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}