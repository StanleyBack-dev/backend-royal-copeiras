import { InputType, Field, Int, Float } from '@nestjs/graphql';
import {
  IsUUID,
  IsOptional,
  IsNumber,
  IsString,
  IsInt,
  Min,
  Max,
  IsDateString,
} from 'class-validator';

@InputType()
export class UpdateCustomersInputDto {
  @Field()
  @IsUUID()
  idCustomers: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(300)
  weightKg?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observation?: string;

  @Field()
  @IsDateString()
  measurementDate: string;
}