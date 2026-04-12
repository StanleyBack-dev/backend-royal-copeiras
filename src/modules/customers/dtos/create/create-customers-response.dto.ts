import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class CreateCustomersResponseDto {
  @Field()
  idCustomers!: string;

  @Field()
  name!: string;

  @Field()
  document!: string;

  @Field()
  type!: 'individual' | 'company';

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  birthDate?: string;

  @Field({ nullable: true })
  address?: string;

  @Field()
  isActive!: boolean;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}