import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class GetCustomersResponseDto {
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

  @Field(() => String)
  measurementDate: string;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}