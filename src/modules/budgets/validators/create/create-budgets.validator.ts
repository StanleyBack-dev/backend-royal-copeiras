import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { BudgetItemsEntity } from "../../entities/budgetItems.entity";
import { BudgetsEntity } from "../../entities/budgets.entity";
import { CreateBudgetsInputDto } from "../../dtos/create/create-budgets-input.dto";
import { LeadsEntity } from "../../../leads/entities/leads.entity";
import { In, Repository } from "typeorm";
import {
  BUDGET_ALLOWED_PAYMENT_METHODS,
  BUDGET_DURATION_HOURS_MAX,
  BUDGET_DURATION_HOURS_MIN,
} from "../../constants/budget-form-rules.constant";
import { BudgetStatus } from "../../enums/budget-status.enum";
import { parseBudgetDateOnly } from "../../utils/budget-date.util";
import { PositionsEntity } from "../../../positions/entities/positions.entity";
import {
  inferServiceComboFromDescription,
  normalizeGenderToEnglish,
} from "../../constants/budget-service-types.constant";
import { generateBudgetNumber } from "../../utils/generate-budget-number.util";

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

    const positionIds = Array.from(
      new Set(input.items.map((item) => item.idPositions)),
    );
    const positions = await positionsRepo.find({
      where: { idPositions: In(positionIds) },
    });
    const positionsById = new Map(
      positions.map((position) => [position.idPositions, position]),
    );

    const hasMissingPosition = positionIds.some(
      (idPositions) => !positionsById.has(idPositions),
    );

    if (hasMissingPosition) {
      throw AppException.from(APP_ERRORS.positions.notFound, undefined);
    }

    const hasInactivePosition = positionIds.some((idPositions) => {
      const position = positionsById.get(idPositions);
      return !position?.isActive;
    });

    if (hasInactivePosition) {
      throw AppException.from(APP_ERRORS.positions.inactive, undefined);
    }

    const normalizedItems = input.items.map((item) => {
      const totalPrice = Number((item.quantity * item.unitPrice).toFixed(2));

      // Normalize incoming gender (UI may send Portuguese labels) to canonical English
      const explicitGenderRaw = (item as { gender?: unknown }).gender
        ?.toString()
        .trim();
      let serviceGender = normalizeGenderToEnglish(explicitGenderRaw);

      if (!serviceGender) {
        const inferred = inferServiceComboFromDescription(item.description);
        if (inferred) {
          const parts = inferred.split(":");
          serviceGender = normalizeGenderToEnglish(
            parts.length > 1 ? parts[1] : undefined,
          );
        }
      }

      return {
        idPositions: item.idPositions,
        description: item.description,
        serviceGender: serviceGender ?? null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
        notes: item.notes,
        sortOrder: item.sortOrder ?? 0,
        eventDateIndex: item.eventDateIndex ?? 0,
      };
    });

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
          idPositions: item.idPositions,
          description: item.description,
          serviceGender: item.serviceGender ?? null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          notes: item.notes,
          sortOrder: item.sortOrder,
          eventDateIndex: item.eventDateIndex,
        }),
      );

      await manager.save(BudgetItemsEntity, budgetItems);

      const itemsWithPositions = await manager.find(BudgetItemsEntity, {
        where: { idBudgets: savedBudget.idBudgets },
        relations: { position: true },
        order: { sortOrder: "ASC" },
      });

      savedBudget.items = itemsWithPositions;
      return { budget: savedBudget, items: itemsWithPositions };
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

    const hasInvalidItemPosition = input.items.some(
      (item) => !item.idPositions,
    );

    if (hasInvalidItemPosition) {
      throw AppException.from(
        APP_ERRORS.budgets.itemServiceTypeInvalid,
        undefined,
      );
    }

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

    const selectedPositionKeys = input.items.map((item) => {
      // Map incoming or inferred gender to canonical english key for uniqueness check
      const explicitGenderRaw = item.gender?.toString().trim();
      let genderKey = normalizeGenderToEnglish(explicitGenderRaw) ?? "";

      if (!genderKey) {
        const inferred = inferServiceComboFromDescription(item.description);
        if (inferred) {
          const parts = inferred.split(":");
          genderKey =
            normalizeGenderToEnglish(parts.length > 1 ? parts[1] : undefined) ??
            "";
        }
      }

      const dayPrefix = `${item.eventDateIndex ?? 0}`;

      if (genderKey) {
        return `${dayPrefix}::${item.idPositions}::${genderKey}`;
      }

      return `${dayPrefix}::${item.idPositions}::${(item.description ?? "").trim().toLowerCase()}`;
    });

    const uniquePositionKeys = new Set(selectedPositionKeys);
    if (uniquePositionKeys.size !== selectedPositionKeys.length) {
      throw AppException.from(
        APP_ERRORS.budgets.itemServiceTypeDuplicated,
        undefined,
      );
    }
  }
}
