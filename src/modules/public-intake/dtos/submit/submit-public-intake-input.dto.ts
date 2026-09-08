import { Type } from "class-transformer";
import { Field, InputType, Int } from "@nestjs/graphql";
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
  ValidateNested,
} from "class-validator";

const EVENT_TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

@InputType()
export class SubmitPublicIntakeItemInputDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  description!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsIn(["Masculino", "Feminino"])
  gender?: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  quantity!: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @Min(0)
  eventDateIndex: number = 0;
}

@InputType()
export class SubmitPublicIntakeInputDto {
  @Field()
  @IsString()
  formToken!: string;

  @Field()
  @IsString()
  @Length(2, 120)
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Matches(/^\d{11}$|^\d{14}$/, {
    message: "Documento deve ser CPF (11 dígitos) ou CNPJ (14 dígitos)",
  })
  document?: string;

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(1)
  @IsDateString({}, { each: true })
  eventDates!: string[];

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(1)
  @Matches(EVENT_TIME_PATTERN, { each: true })
  eventArrivalTimes!: string[];

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(1)
  @Matches(EVENT_TIME_PATTERN, { each: true })
  eventDepartureTimes!: string[];

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  eventLocation!: string[];

  @Field(() => [Int])
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(1, { each: true })
  guestCount!: number[];

  @Field(() => [Int])
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(24, { each: true })
  durationHours!: number[];

  @Field(() => [SubmitPublicIntakeItemInputDto])
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SubmitPublicIntakeItemInputDto)
  items!: SubmitPublicIntakeItemInputDto[];
}
