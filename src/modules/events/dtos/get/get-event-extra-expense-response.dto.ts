import { Field, Float, ObjectType } from "@nestjs/graphql";
import { EventExtraExpenseCategory } from "../../enums/event-extra-expense-category.enum";
import { IEventExtraExpense } from "../../interface/event-extra-expense.interface";

const KNOWN_CATEGORIES = new Set<string>(
  Object.values(EventExtraExpenseCategory),
);

@ObjectType()
export class GetEventExtraExpenseResponseDto implements IEventExtraExpense {
  static fromValue(value: IEventExtraExpense): GetEventExtraExpenseResponseDto {
    const dto = new GetEventExtraExpenseResponseDto();
    // jsonb is not constrained by the database, so anything unexpected is
    // reported as OTHER instead of breaking the GraphQL enum serialization.
    dto.category = KNOWN_CATEGORIES.has(value.category)
      ? value.category
      : EventExtraExpenseCategory.OTHER;
    dto.amount = Number(value.amount ?? 0);
    return dto;
  }

  @Field(() => EventExtraExpenseCategory)
  category!: EventExtraExpenseCategory;

  @Field(() => Float)
  amount!: number;
}
