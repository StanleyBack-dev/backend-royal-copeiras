import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { BudgetItemsEntity } from "../../entities/budgetItems.entity";
import { BudgetsEntity } from "../../entities/budgets.entity";
import { CreateBudgetsInputDto } from "../../dtos/create/create-budgets-input.dto";
import { LeadsEntity } from "../../../leads/entities/leads.entity";
import { EntityManager, In, Repository } from "typeorm";
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

interface CreateBudgetResult {
  budget: BudgetsEntity;
  items: BudgetItemsEntity[];
}

export class CreateBudgetsValidator {
  private static readonly allowedPaymentMethods =
    BUDGET_ALLOWED_PAYMENT_METHODS as readonly string[];

  private static resolveDiscountValues(input: CreateBudgetsInputDto) {
    if (!input.discountType) {
      return {
        discountType: undefined,
        discountPercentage: undefined,
        discountAmount: undefined,
      };
    }

    if (input.discountType === "percentage") {
      return {
        discountType: input.discountType,
        discountPercentage: Number((input.discountPercentage ?? 0).toFixed(2)),
        discountAmount: undefined,
      };
    }

    return {
      discountType: input.discountType,
      discountPercentage: undefined,
      discountAmount: Number((input.discountAmount ?? 0).toFixed(2)),
    };
  }

  private static computeDiscountAmount(
    subtotal: number,
    displacementFee: number,
    discount: {
      discountType?: "percentage" | "amount";
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
      };
    });

    const subtotal = Number(
      normalizedItems
        .reduce((sum, item) => sum + item.totalPrice, 0)
        .toFixed(2),
    );

    const displacementFee = Number((input.displacementFee ?? 0).toFixed(2));
    const resolvedDiscount = this.resolveDiscountValues(input);
    const discountAmount = this.computeDiscountAmount(
      subtotal,
      displacementFee,
      resolvedDiscount,
    );
    const totalAmount = Number(
      (subtotal + displacementFee - discountAmount).toFixed(2),
    );

    return budgetsRepo.manager.transaction(async (manager) => {
      const budgetNumber = await this.generateBudgetNumber(manager);

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
        displacementFee,
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

    if (!input.eventLocation?.trim()) {
      throw AppException.from(
        APP_ERRORS.budgets.eventLocationRequired,
        undefined,
      );
    }

    if (
      input.guestCount === undefined ||
      !Number.isInteger(input.guestCount) ||
      input.guestCount < 1
    ) {
      throw AppException.from(APP_ERRORS.budgets.guestCountRequired, undefined);
    }

    if (
      input.durationHours === undefined ||
      !Number.isInteger(input.durationHours) ||
      input.durationHours < BUDGET_DURATION_HOURS_MIN ||
      input.durationHours > BUDGET_DURATION_HOURS_MAX
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

    if (
      input.discountType !== undefined &&
      input.discountType !== null &&
      input.discountType !== "percentage" &&
      input.discountType !== "amount"
    ) {
      throw AppException.from(
        APP_ERRORS.budgets.discountTypeInvalid,
        undefined,
      );
    }

    if (input.discountType === "percentage") {
      if (
        input.discountPercentage === undefined ||
        Number.isNaN(Number(input.discountPercentage)) ||
        input.discountPercentage <= 0 ||
        input.discountPercentage > 100
      ) {
        throw AppException.from(
          APP_ERRORS.budgets.discountPercentageRequired,
          undefined,
        );
      }
    }

    if (input.discountType === "amount") {
      if (
        input.discountAmount === undefined ||
        Number.isNaN(Number(input.discountAmount)) ||
        input.discountAmount <= 0
      ) {
        throw AppException.from(
          APP_ERRORS.budgets.discountAmountRequired,
          undefined,
        );
      }
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

      if (genderKey) {
        return `${item.idPositions}::${genderKey}`;
      }

      return `${item.idPositions}::${(item.description ?? "").trim().toLowerCase()}`;
    });

    const uniquePositionKeys = new Set(selectedPositionKeys);
    if (uniquePositionKeys.size !== selectedPositionKeys.length) {
      throw AppException.from(
        APP_ERRORS.budgets.itemServiceTypeDuplicated,
        undefined,
      );
    }
  }

  private static async generateBudgetNumber(
    manager: EntityManager,
  ): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `ORC-${year}`;

    const totalForYear = await manager
      .createQueryBuilder(BudgetsEntity, "budget")
      .where("budget.budgetNumber LIKE :prefix", { prefix: `${prefix}-%` })
      .getCount();

    const sequence = String(totalForYear + 1).padStart(5, "0");
    return `${prefix}-${sequence}`;
  }
}
