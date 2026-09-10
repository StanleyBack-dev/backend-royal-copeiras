import { Type } from "class-transformer";
import { Field, InputType, Int } from "@nestjs/graphql";
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { BudgetItemType } from "../../../budgets/enums/budget-item-type.enum";

const EVENT_TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

@InputType()
export class SubmitPublicIntakeItemInputDto {
  @Field(() => BudgetItemType, { defaultValue: BudgetItemType.LABOR })
  @IsEnum(BudgetItemType)
  itemType: BudgetItemType = BudgetItemType.LABOR;

  @Field()
  @IsString()
  @IsNotEmpty()
  description!: string;

  // Set for SUPPLY items picked from the operator's materials catalog. The
  // name and unit are then taken from the catalog, not from the client.
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  idSupplies?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsIn(["Masculino", "Feminino"])
  gender?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 32)
  unit?: string;

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

  // Optional address of the responsible party, saved onto the lead so the
  // contract can be issued once the budget is approved. Mirrors the lead
  // module's structured address fields.
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 160)
  addressStreet?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  addressNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  addressComplement?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  addressNeighborhood?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 80)
  addressCity?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  addressState?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(8, 9)
  @Matches(/^\d{8}$|^\d{5}-\d{3}$/, {
    message: "CEP deve ter 8 dígitos (NNNNN-NNN)",
  })
  addressZipCode?: string;

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
