import { InputType, Field, Float } from '@nestjs/graphql';
import {
  IsOptional,
  IsEnum,
  IsDateString,
  IsPhoneNumber,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

@InputType()
export class UpdateProfileInputDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsPhoneNumber('BR')
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  sex?: 'male' | 'female' | 'other';

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false }, { message: 'A altura deve ser um número válido em metros.' })
  @Min(0.5, { message: 'Altura mínima permitida é 0.5 m.' })
  @Max(3.0, { message: 'Altura máxima permitida é 3.0 m.' })
  heightM?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(['sedentary', 'light', 'moderate', 'active', 'very_active'])
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(['lose_weight', 'maintain', 'gain_weight'])
  goal?: 'lose_weight' | 'maintain' | 'gain_weight';
}