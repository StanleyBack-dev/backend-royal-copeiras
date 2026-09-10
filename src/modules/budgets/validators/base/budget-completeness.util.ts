import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { BUDGET_ALLOWED_PAYMENT_METHODS } from "../../constants/budget-form-rules.constant";
import { BudgetsEntity } from "../../entities/budgets.entity";
import { BudgetItemType } from "../../enums/budget-item-type.enum";

/**
 * A budget can only leave DRAFT (become GENERATED / SENT / APPROVED and, from
 * there, feed a contract) once every mandatory field is filled and every line
 * item carries a price. This stops "hollow" contracts reaching the client.
 */
export function assertBudgetReadyForContract(budget: BudgetsEntity): void {
  const dayCount = budget.eventDates?.length ?? 0;

  const hasEventSchedule =
    dayCount > 0 &&
    budget.eventArrivalTimes?.length === dayCount &&
    budget.eventDepartureTimes?.length === dayCount &&
    budget.eventLocation?.length === dayCount &&
    budget.eventLocation.every((value) => value?.trim()) &&
    budget.guestCount?.length === dayCount &&
    budget.guestCount.every((value) => Number.isInteger(value) && value > 0) &&
    budget.durationHours?.length === dayCount &&
    budget.durationHours.every((value) => Number.isInteger(value) && value > 0);

  const hasPaymentTerms =
    Boolean(budget.paymentMethod?.trim()) &&
    (BUDGET_ALLOWED_PAYMENT_METHODS as readonly string[]).includes(
      budget.paymentMethod ?? "",
    ) &&
    typeof budget.advancePercentage === "number" &&
    budget.advancePercentage >= 0 &&
    budget.advancePercentage <= 100;

  const items = budget.items ?? [];
  const everyItemPriced =
    items.length > 0 &&
    items.every((item) => {
      const priced = Number(item.unitPrice) > 0 && Number(item.totalPrice) > 0;
      if (item.itemType === BudgetItemType.SUPPLY) {
        return priced && Boolean(item.idSupplies || item.description?.trim());
      }
      return priced && Boolean(item.idPositions);
    });

  const daysCovered = new Set(items.map((item) => item.eventDateIndex ?? 0));
  const everyDayHasItem = daysCovered.size >= dayCount && dayCount > 0;

  const hasPositiveTotal = Number(budget.totalAmount) > 0;

  if (
    !hasEventSchedule ||
    !hasPaymentTerms ||
    !everyItemPriced ||
    !everyDayHasItem ||
    !hasPositiveTotal
  ) {
    throw AppException.from(
      APP_ERRORS.budgets.incompleteForContract,
      undefined,
    );
  }
}
