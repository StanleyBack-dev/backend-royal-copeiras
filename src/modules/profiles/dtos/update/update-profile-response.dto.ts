import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class UpdateProfileResponseDto {
  @Field()
  idProfiles: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  birthDate?: string;

  @Field({ nullable: true })
  sex?: 'male' | 'female' | 'other';

  @Field({ nullable: true })
  heightM?: number;

  @Field({ nullable: true })
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

  @Field({ nullable: true })
  goal?: 'lose_weight' | 'maintain' | 'gain_weight';
}