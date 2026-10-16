import { Field, Float, InputType } from "@nestjs/graphql";
import { IsEnum, IsNumber, Min } from "class-validator";
import { EventExtraExpenseCategory } from "../../enums/event-extra-expense-category.enum";
import { IEventExtraExpense } from "../../interface/event-extra-expense.interface";

@InputType()
export class UpdateEventExtraExpenseInputDto implements IEventExtraExpense {
  @Field(() => EventExtraExpenseCategory)
  @IsEnum(EventExtraExpenseCategory)
  category!: EventExtraExpenseCategory;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount!: number;
}
