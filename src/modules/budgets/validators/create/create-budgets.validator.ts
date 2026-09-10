import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { BudgetItemsEntity } from "../../entities/budgetItems.entity";
import { BudgetsEntity } from "../../entities/budgets.entity";
import { CreateBudgetsInputDto } from "../../dtos/create/create-budgets-input.dto";
import { LeadsEntity } from "../../../leads/entities/leads.entity";
import { Repository } from "typeorm";
import {
  BUDGET_ALLOWED_PAYMENT_METHODS,
  BUDGET_DURATION_HOURS_MAX,
  BUDGET_DURATION_HOURS_MIN,
} from "../../constants/budget-form-rules.constant";
import { BudgetStatus } from "../../enums/budget-status.enum";
import { parseBudgetDateOnly } from "../../utils/budget-date.util";
import { PositionsEntity } from "../../../positions/entities/positions.entity";
import { SuppliesEntity } from "../../../supplies/entities/supplies.entity";
import { generateBudgetNumber } from "../../utils/generate-budget-number.util";
import {
  assertItemsNotDuplicated,
  assertItemsShape,
  loadAndAssertPositions,
  loadAndAssertSupplies,
  normalizeBudgetItems,
} from "../base/budget-items.util";

interface CreateBudgetResult {
  budget: BudgetsEntity;
  items: BudgetItemsEntity[];
}

export class CreateBudgetsValidator {
  private static readonly allowedPaymentMethods =
    BUDGET_ALLOWED_PAYMENT_METHODS as readonly string[];

  private static resolveDiscountValuesPerDay(
    eventDates: string[],
    rawType?: string[],
    rawPercentage?: number[],
    rawAmount?: number[],
  ) {
    const dayCount = eventDates.length;
    const types = rawType?.length ? rawType : eventDates.map(() => "");
    const percentages = rawPercentage?.length
      ? rawPercentage
      : eventDates.map(() => 0);
    const amounts = rawAmount?.length ? rawAmount : eventDates.map(() => 0);

    const discountType: string[] = [];
    const discountPercentage: number[] = [];
    const discountAmount: number[] = [];

    for (let index = 0; index < dayCount; index += 1) {
      const type =
        types[index] === "percentage" || types[index] === "amount"
          ? types[index]
          : "";
      discountType.push(type);
      discountPercentage.push(
        type === "percentage"
          ? Number((percentages[index] ?? 0).toFixed(2))
          : 0,
      );
      discountAmount.push(
        type === "amount" ? Number((amounts[index] ?? 0).toFixed(2)) : 0,
      );
    }

    return { discountType, discountPercentage, discountAmount };
  }

  private static computeDiscountAmount(
    subtotal: number,
    displacementFee: number,
    discount: {
      discountType?: string;
      discountPercentage?: number;
      discountAmount?: number;
    },
  ) {
    const baseTotal = Number((subtotal + displacementFee).toFixed(2));

    if (discount.discountType === "percentage") {
      const percentage = Number(discount.discountPercentage ?? 0);
      const calculated = baseTotal * (percentage / 100);
      return Number(Math.min(Math.max(calculated, 0), baseTotal).toFixed(2));
    }

    if (discount.discountType === "amount") {
      const amount = Number(discount.discountAmount ?? 0);
      return Number(Math.min(Math.max(amount, 0), baseTotal).toFixed(2));
    }

    return 0;
  }

  static async validateAndCreate(
    userId: string,
    input: CreateBudgetsInputDto,
    budgetsRepo: Repository<BudgetsEntity>,
    leadsRepo: Repository<LeadsEntity>,
    positionsRepo: Repository<PositionsEntity>,
    suppliesRepo: Repository<SuppliesEntity>,
  ): Promise<CreateBudgetResult> {
    this.validateBusinessRules(input);

    const issueDate = parseBudgetDateOnly(input.issueDate);
    const validUntil = parseBudgetDateOnly(input.validUntil);

    if (validUntil < issueDate) {
      throw AppException.from(
        APP_ERRORS.budgets.invalidValidityRange,
        undefined,
      );
    }

    const lead = await leadsRepo.findOne({
      where: { idLeads: input.idLeads },
    });

    if (!lead) {
      throw AppException.from(APP_ERRORS.leads.notFound, undefined);
    }

    if (!lead.isActive) {
      throw AppException.from(APP_ERRORS.budgets.leadInactive, undefined);
    }

    await loadAndAssertPositions(input.items, positionsRepo);
    const suppliesById = await loadAndAssertSupplies(input.items, suppliesRepo);

    const normalizedItems = normalizeBudgetItems(input.items, suppliesById);

    const eventDayCount = input.eventDates.length;

    const daySubtotals = Array.from({ length: eventDayCount }, (_, day) =>
      Number(
        normalizedItems
          .filter((item) => item.eventDateIndex === day)
          .reduce((sum, item) => sum + item.totalPrice, 0)
          .toFixed(2),
      ),
    );

    const subtotal = Number(
      daySubtotals.reduce((sum, value) => sum + value, 0).toFixed(2),
    );

    const displacementFeePerDay = (
      input.displacementFee?.length
        ? input.displacementFee
        : input.eventDates.map(() => 0)
    ).map((value) => Number((value ?? 0).toFixed(2)));

    if (displacementFeePerDay.length !== input.eventDates.length) {
      throw AppException.from(
        APP_ERRORS.budgets.displacementFeeLengthMismatch,
        undefined,
      );
    }

    const resolvedDiscount = this.resolveDiscountValuesPerDay(
      input.eventDates,
      input.discountType,
      input.discountPercentage,
      input.discountAmount,
    );

    let totalAmount = 0;
    for (let day = 0; day < eventDayCount; day += 1) {
      const dayDiscountAmount = this.computeDiscountAmount(
        daySubtotals[day],
        displacementFeePerDay[day],
        {
          discountType: resolvedDiscount.discountType[day],
          discountPercentage: resolvedDiscount.discountPercentage[day],
          discountAmount: resolvedDiscount.discountAmount[day],
        },
      );
      totalAmount +=
        daySubtotals[day] + displacementFeePerDay[day] - dayDiscountAmount;
    }
    totalAmount = Number(totalAmount.toFixed(2));

    return budgetsRepo.manager.transaction(async (manager) => {
      const budgetNumber = await generateBudgetNumber(manager);

      const budget = manager.create(BudgetsEntity, {
        idUsers: userId,
        idLeads: input.idLeads,
        budgetNumber,
        status: BudgetStatus.DRAFT,
        issueDate,
        validUntil,
        eventDates: input.eventDates ?? [],
        eventArrivalTimes: input.eventArrivalTimes ?? [],
        eventDepartureTimes: input.eventDepartureTimes ?? [],
        eventLocation: input.eventLocation,
        guestCount: input.guestCount,
        durationHours: input.durationHours,
        paymentMethod: input.paymentMethod,
        advancePercentage: input.advancePercentage,
        discountType: resolvedDiscount.discountType,
        discountPercentage: resolvedDiscount.discountPercentage,
        discountAmount: resolvedDiscount.discountAmount,
        displacementFee: displacementFeePerDay,
        subtotal,
        totalAmount,
      });

      const savedBudget = await manager.save(BudgetsEntity, budget);

      const budgetItems = normalizedItems.map((item) =>
        manager.create(BudgetItemsEntity, {
          idBudgets: savedBudget.idBudgets,
          itemType: item.itemType,
          idPositions: item.idPositions,
          idSupplies: item.idSupplies,
          unit: item.unit,
          description: item.description,
          serviceGender: item.serviceGender,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          notes: item.notes,
          sortOrder: item.sortOrder,
          eventDateIndex: item.eventDateIndex,
        }),
      );

      await manager.save(BudgetItemsEntity, budgetItems);

      const itemsWithRelations = await manager.find(BudgetItemsEntity, {
        where: { idBudgets: savedBudget.idBudgets },
        relations: { position: true, supply: true },
        order: { sortOrder: "ASC" },
      });

      savedBudget.items = itemsWithRelations;
      return { budget: savedBudget, items: itemsWithRelations };
    });
  }

  private static validateBusinessRules(input: CreateBudgetsInputDto): void {
    if (!input.idLeads) {
      throw AppException.from(APP_ERRORS.budgets.leadRequired, undefined);
    }

    if (!input.items?.length) {
      throw AppException.from(APP_ERRORS.budgets.itemsRequired, undefined);
    }

    if (!input.eventDates?.length) {
      throw AppException.from(APP_ERRORS.budgets.eventDatesRequired, undefined);
    }

    if (!input.eventArrivalTimes?.length) {
      throw AppException.from(
        APP_ERRORS.budgets.eventArrivalTimesRequired,
        undefined,
      );
    }

    if (!input.eventDepartureTimes?.length) {
      throw AppException.from(
        APP_ERRORS.budgets.eventDepartureTimesRequired,
        undefined,
      );
    }

    if (
      input.eventDates.length !== input.eventArrivalTimes.length ||
      input.eventDates.length !== input.eventDepartureTimes.length
    ) {
      throw AppException.from(
        APP_ERRORS.budgets.eventTimesLengthMismatch,
        undefined,
      );
    }

    if (
      !input.eventLocation?.length ||
      input.eventLocation.length !== input.eventDates.length ||
      input.eventLocation.some((value) => !value?.trim())
    ) {
      throw AppException.from(
        APP_ERRORS.budgets.eventLocationRequired,
        undefined,
      );
    }

    if (
      !input.guestCount?.length ||
      input.guestCount.length !== input.eventDates.length ||
      input.guestCount.some((value) => !Number.isInteger(value) || value < 1)
    ) {
      throw AppException.from(APP_ERRORS.budgets.guestCountRequired, undefined);
    }

    if (
      !input.durationHours?.length ||
      input.durationHours.length !== input.eventDates.length ||
      input.durationHours.some(
        (value) =>
          !Number.isInteger(value) ||
          value < BUDGET_DURATION_HOURS_MIN ||
          value > BUDGET_DURATION_HOURS_MAX,
      )
    ) {
      throw AppException.from(
        APP_ERRORS.budgets.durationHoursRequired,
        undefined,
      );
    }

    if (!input.paymentMethod?.trim()) {
      throw AppException.from(
        APP_ERRORS.budgets.paymentMethodRequired,
        undefined,
      );
    }

    if (!this.allowedPaymentMethods.includes(input.paymentMethod)) {
      throw AppException.from(
        APP_ERRORS.budgets.paymentMethodInvalid,
        undefined,
      );
    }

    if (
      input.advancePercentage === undefined ||
      Number.isNaN(Number(input.advancePercentage)) ||
      input.advancePercentage < 0 ||
      input.advancePercentage > 100
    ) {
      throw AppException.from(
        APP_ERRORS.budgets.advancePercentageRequired,
        undefined,
      );
    }

    if (input.discountType?.length) {
      if (input.discountType.length !== input.eventDates.length) {
        throw AppException.from(
          APP_ERRORS.budgets.discountLengthMismatch,
          undefined,
        );
      }

      input.discountType.forEach((type, index) => {
        if (type !== "" && type !== "percentage" && type !== "amount") {
          throw AppException.from(
            APP_ERRORS.budgets.discountTypeInvalid,
            undefined,
          );
        }

        if (type === "percentage") {
          const percentage = input.discountPercentage?.[index];
          if (
            percentage === undefined ||
            Number.isNaN(Number(percentage)) ||
            percentage <= 0 ||
            percentage > 100
          ) {
            throw AppException.from(
              APP_ERRORS.budgets.discountPercentageRequired,
              undefined,
            );
          }
        }

        if (type === "amount") {
          const amount = input.discountAmount?.[index];
          if (
            amount === undefined ||
            Number.isNaN(Number(amount)) ||
            amount <= 0
          ) {
            throw AppException.from(
              APP_ERRORS.budgets.discountAmountRequired,
              undefined,
            );
          }
        }
      });
    }

    const hasInvalidItemDescription = input.items.some(
      (item) => !item.description?.trim(),
    );

    if (hasInvalidItemDescription) {
      throw AppException.from(
        APP_ERRORS.budgets.itemDescriptionRequired,
        undefined,
      );
    }

    assertItemsShape(input.items);

    const eventDayCount = input.eventDates.length;
    const hasInvalidEventDateIndex = input.items.some(
      (item) =>
        !Number.isInteger(item.eventDateIndex ?? 0) ||
        (item.eventDateIndex ?? 0) < 0 ||
        (item.eventDateIndex ?? 0) >= eventDayCount,
    );

    if (hasInvalidEventDateIndex) {
      throw AppException.from(
        APP_ERRORS.budgets.itemEventDateIndexInvalid,
        undefined,
      );
    }

    const coveredDays = new Set(
      input.items.map((item) => item.eventDateIndex ?? 0),
    );
    if (coveredDays.size < eventDayCount) {
      throw AppException.from(APP_ERRORS.budgets.dayMissingItems, undefined);
    }

    assertItemsNotDuplicated(input.items);
  }
}
