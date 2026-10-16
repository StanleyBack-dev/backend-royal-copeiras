import { EventExtraExpenseCategory } from "../enums/event-extra-expense-category.enum";

export interface IEventExtraExpense {
  category: EventExtraExpenseCategory;
  amount: number;
}
