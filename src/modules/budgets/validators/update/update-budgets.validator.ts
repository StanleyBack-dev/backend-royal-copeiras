import { In, Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { BudgetItemsEntity } from "../../entities/budgetItems.entity";
import { BudgetsEntity } from "../../entities/budgets.entity";
import { UpdateBudgetsInputDto } from "../../dtos/update/update-budgets-input.dto";
import { LeadsEntity } from "../../../leads/entities/leads.entity";
import { BudgetStatus } from "../../enums/budget-status.enum";
import {
  BUDGET_ALLOWED_PAYMENT_METHODS,
  BUDGET_DURATION_HOURS_MAX,
  BUDGET_DURATION_HOURS_MIN,
} from "../../constants/budget-form-rules.constant";
import { parseBudgetDateOnly } from "../../utils/budget-date.util";
import { PositionsEntity } from "../../../positions/entities/positions.entity";
import {
  inferServiceComboFromDescription,
  normalizeGenderToEnglish,
} from "../../constants/budget-service-types.constant";

const BUDGET_ALLOWED_TRANSITIONS: Record<BudgetStatus, BudgetStatus[]> = {
  [BudgetStatus.DRAFT]: [
    BudgetStatus.GENERATED,
    BudgetStatus.CANCELED,
    BudgetStatus.EXPIRED,
  ],
  [BudgetStatus.GENERATED]: [
    BudgetStatus.SENT,
    BudgetStatus.APPROVED,
    BudgetStatus.DRAFT,
    BudgetStatus.CANCELED,
    BudgetStatus.EXPIRED,
  ],
  [BudgetStatus.SENT]: [
    BudgetStatus.DRAFT,
    BudgetStatus.APPROVED,
    BudgetStatus.REJECTED,
    BudgetStatus.EXPIRED,
    BudgetStatus.CANCELED,
  ],
  [BudgetStatus.APPROVED]: [BudgetStatus.CANCELED],
  [BudgetStatus.REJECTED]: [],
  [BudgetStatus.EXPIRED]: [],
  [BudgetStatus.CANCELED]: [],
};

interface UpdateBudgetDeps {
  budgetsRepo: Repository<BudgetsEntity>;
  budgetItemsRepo: Repository<BudgetItemsEntity>;
  leadsRepo: Repository<LeadsEntity>;
  positionsRepo: Repository<PositionsEntity>;
}

interface BudgetRulesSnapshot {
  idLeads?: string | null;
  eventDates?: string[] | null;
  eventArrivalTimes?: string[] | null;
  eventDepartureTimes?: string[] | null;
  eventLocation?: string[] | null;
  guestCount?: number[] | null;
  durationHours?: number[] | null;
  paymentMethod?: string | null;
  advancePercentage?: number | null;
  discountType?: string[] | null;
  discountPercentage?: number[] | null;
  discountAmount?: number[] | null;
  items?: Array<{
    description?: string | null;
    idPositions?: string | null;
    gender?: string | null;
    eventDateIndex?: number | null;
  }>;
}

export class UpdateBudgetsValidator {
  private static readonly allowedPaymentMethods =
    BUDGET_ALLOWED_PAYMENT_METHODS as readonly string[];

  private static resolveDiscountValuesPerDay(
    current: BudgetsEntity,
    input: UpdateBudgetsInputDto,
    eventDates: string[],
  ) {
    const dayCount = eventDates.length;
    const hasTypeInput = input.discountType !== undefined;
    const types = hasTypeInput ? input.discountType : current.discountType;
    const percentages = input.discountPercentage ?? current.discountPercentage;
    const amounts = input.discountAmount ?? current.discountAmount;

    const discountType: string[] = [];
    const discountPercentage: number[] = [];
    const discountAmount: number[] = [];

    for (let index = 0; index < dayCount; index += 1) {
      const rawType = types?.[index];
      const type =
        rawType === "percentage" || rawType === "amount" ? rawType : "";
      discountType.push(type);
      discountPercentage.push(
        type === "percentage"
          ? Number((percentages?.[index] ?? 0).toFixed(2))
          : 0,
      );
      discountAmount.push(
        type === "amount" ? Number((amounts?.[index] ?? 0).toFixed(2)) : 0,
      );
    }

    return { discountType, discountPercentage, discountAmount };
  }

  private static computeDiscountAmount(
    subtotal: number,
    displacementFee: number,
    discount: {
      discountType?: string | null;
      discountPercentage?: number | null;
      discountAmount?: number | null;
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

  static async validateAndUpdate(
    userId: string,
    input: UpdateBudgetsInputDto,
    deps: UpdateBudgetDeps,
  ): Promise<BudgetsEntity> {
    if (!input.idBudgets) {
      throw AppException.from(APP_ERRORS.budgets.idRequired, undefined);
    }

    const current = await deps.budgetsRepo.findOne({
      where: { idBudgets: input.idBudgets },
      relations: { items: { position: true } },
    });

    if (!current) {
      throw AppException.from(APP_ERRORS.budgets.notFound, undefined);
    }

    const hasUpdateData = Object.entries(input).some(
      ([key, value]) => key !== "idBudgets" && value !== undefined,
    );

    if (!hasUpdateData) {
      throw AppException.from(APP_ERRORS.budgets.noUpdateData, undefined);
    }

    const isStatusOnlyUpdate =
      input.status !== undefined && !this.hasAnyNonStatusField(input);

    const hasNonStatusUpdates = this.hasAnyNonStatusField(input);
    if (hasNonStatusUpdates && current.status !== BudgetStatus.DRAFT) {
      throw AppException.from(APP_ERRORS.budgets.editForbidden, undefined);
    }

    const resolvedEventDates = input.eventDates ?? current.eventDates;

    if (hasNonStatusUpdates) {
      this.validateBusinessRules(
        {
          idLeads: input.idLeads ?? current.idLeads,
          eventDates: resolvedEventDates,
          eventArrivalTimes:
            input.eventArrivalTimes ?? current.eventArrivalTimes,
          eventDepartureTimes:
            input.eventDepartureTimes ?? current.eventDepartureTimes,
          eventLocation: input.eventLocation ?? current.eventLocation,
          guestCount: input.guestCount ?? current.guestCount,
          durationHours: input.durationHours ?? current.durationHours,
          paymentMethod: input.paymentMethod ?? current.paymentMethod,
          advancePercentage:
            input.advancePercentage ?? current.advancePercentage,
          discountType: input.discountType ?? current.discountType,
          discountPercentage:
            input.discountPercentage ?? current.discountPercentage,
          discountAmount: input.discountAmount ?? current.discountAmount,
          items:
            input.items?.map((item) => ({
              description: item.description,
              idPositions: item.idPositions,
              eventDateIndex: item.eventDateIndex ?? 0,
            })) ?? current.items,
        },
        Boolean(input.items?.length),
      );
    }

    if (input.status && input.status !== current.status) {
      const allowedNextStatuses =
        BUDGET_ALLOWED_TRANSITIONS[current.status] ?? [];
      const canTransition = allowedNextStatuses.includes(input.status);

      if (!canTransition) {
        throw AppException.from(
          APP_ERRORS.budgets.invalidStatusTransition,
          undefined,
        );
      }
    }

    if (input.idLeads) {
      const lead = await deps.leadsRepo.findOne({
        where: { idLeads: input.idLeads },
      });

      if (!lead) {
        throw AppException.from(APP_ERRORS.leads.notFound, undefined);
      }

      if (!lead.isActive) {
        throw AppException.from(APP_ERRORS.budgets.leadInactive, undefined);
      }
    }

    if (input.status === BudgetStatus.GENERATED) {
      const lead = await deps.leadsRepo.findOne({
        where: { idLeads: input.idLeads ?? current.idLeads },
      });

      if (!lead) {
        throw AppException.from(APP_ERRORS.leads.notFound, undefined);
      }

      if (!lead.isActive) {
        throw AppException.from(APP_ERRORS.budgets.leadInactive, undefined);
      }
    }

    const updatedIssueDate = input.issueDate
      ? parseBudgetDateOnly(input.issueDate)
      : current.issueDate;
    const updatedValidUntil = input.validUntil
      ? parseBudgetDateOnly(input.validUntil)
      : current.validUntil;

    if (updatedValidUntil < updatedIssueDate) {
      throw AppException.from(
        APP_ERRORS.budgets.invalidValidityRange,
        undefined,
      );
    }

    return deps.budgetsRepo.manager.transaction(async (manager) => {
      const resolvedDiscount = this.resolveDiscountValuesPerDay(
        current,
        input,
        resolvedEventDates,
      );

      current.idLeads = input.idLeads ?? current.idLeads;
      current.status = input.status ?? current.status;
      current.sentVia = input.sentVia ?? current.sentVia;
      current.sentAt = input.sentAt ? new Date(input.sentAt) : current.sentAt;
      current.issueDate = updatedIssueDate;
      current.validUntil = updatedValidUntil;
      current.eventDates = input.eventDates ?? current.eventDates;
      current.eventArrivalTimes =
        input.eventArrivalTimes ?? current.eventArrivalTimes;
      current.eventDepartureTimes =
        input.eventDepartureTimes ?? current.eventDepartureTimes;
      current.eventLocation = input.eventLocation ?? current.eventLocation;
      current.guestCount = input.guestCount ?? current.guestCount;
      current.durationHours = input.durationHours ?? current.durationHours;
      current.paymentMethod = input.paymentMethod ?? current.paymentMethod;
      current.advancePercentage =
        input.advancePercentage ?? current.advancePercentage;
      current.discountType = resolvedDiscount.discountType;
      current.discountPercentage = resolvedDiscount.discountPercentage;
      current.discountAmount = resolvedDiscount.discountAmount;
      if (input.displacementFee !== undefined) {
        if (input.displacementFee.length !== current.eventDates.length) {
          throw AppException.from(
            APP_ERRORS.budgets.displacementFeeLengthMismatch,
            undefined,
          );
        }
        current.displacementFee = input.displacementFee.map((value) =>
          Number((value ?? 0).toFixed(2)),
        );
      }

      if (input.items?.length) {
        const positionIds = Array.from(
          new Set(input.items.map((item) => item.idPositions)),
        );
        const positions = await deps.positionsRepo.find({
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
          const totalPrice = Number(
            (item.quantity * item.unitPrice).toFixed(2),
          );

          const explicitGenderRaw = item.gender?.toString().trim();
          let serviceGender = normalizeGenderToEnglish(explicitGenderRaw);

          if (!serviceGender) {
            const inferred = inferServiceComboFromDescription(
              item.description ?? undefined,
            );
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

        const eventDayCount = current.eventDates.length;
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
        current.subtotal = subtotal;

        const displacementFeePerDay = current.displacementFee ?? [];
        let totalAmount = 0;
        for (let day = 0; day < eventDayCount; day += 1) {
          const dayFee = displacementFeePerDay[day] ?? 0;
          const dayDiscountAmount = this.computeDiscountAmount(
            daySubtotals[day],
            dayFee,
            {
              discountType: resolvedDiscount.discountType[day],
              discountPercentage: resolvedDiscount.discountPercentage[day],
              discountAmount: resolvedDiscount.discountAmount[day],
            },
          );
          totalAmount += daySubtotals[day] + dayFee - dayDiscountAmount;
        }
        current.totalAmount = Number(totalAmount.toFixed(2));

        await manager.delete(BudgetItemsEntity, {
          idBudgets: current.idBudgets,
        });

        const newItems = normalizedItems.map((item) =>
          manager.create(BudgetItemsEntity, {
            idBudgets: current.idBudgets,
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

        await manager.save(BudgetItemsEntity, newItems);
        current.items = await manager.find(BudgetItemsEntity, {
          where: { idBudgets: current.idBudgets },
          relations: { position: true },
          order: { sortOrder: "ASC" },
        });
      } else if (!isStatusOnlyUpdate) {
        const eventDayCount = current.eventDates.length;
        const existingItems = current.items ?? [];
        const daySubtotals = Array.from({ length: eventDayCount }, (_, day) =>
          Number(
            existingItems
              .filter((item) => (item.eventDateIndex ?? 0) === day)
              .reduce((sum, item) => sum + Number(item.totalPrice), 0)
              .toFixed(2),
          ),
        );
        const displacementFeePerDay = current.displacementFee ?? [];
        let totalAmount = 0;
        for (let day = 0; day < eventDayCount; day += 1) {
          const dayFee = displacementFeePerDay[day] ?? 0;
          const dayDiscountAmount = this.computeDiscountAmount(
            daySubtotals[day],
            dayFee,
            {
              discountType: resolvedDiscount.discountType[day],
              discountPercentage: resolvedDiscount.discountPercentage[day],
              discountAmount: resolvedDiscount.discountAmount[day],
            },
          );
          totalAmount += daySubtotals[day] + dayFee - dayDiscountAmount;
        }
        current.totalAmount = Number(totalAmount.toFixed(2));
      }

      const saved = await manager.save(BudgetsEntity, current);

      if (!saved.items) {
        saved.items = await deps.budgetItemsRepo.find({
          where: { idBudgets: saved.idBudgets },
          relations: { position: true },
          order: { sortOrder: "ASC" },
        });
      }

      return saved;
    });
  }

  private static hasAnyNonStatusField(input: UpdateBudgetsInputDto): boolean {
    return [
      input.idLeads,
      input.issueDate,
      input.validUntil,
      input.eventDates,
      input.eventArrivalTimes,
      input.eventDepartureTimes,
      input.eventLocation,
      input.guestCount,
      input.durationHours,
      input.paymentMethod,
      input.advancePercentage,
      input.discountType,
      input.discountPercentage,
      input.discountAmount,
      input.displacementFee,
      input.totalAmount,
      input.items,
    ].some((value) => value !== undefined);
  }

  private static validateBusinessRules(
    data: BudgetRulesSnapshot,
    enforceItemPositions = false,
  ): void {
    if (!data.idLeads) {
      throw AppException.from(APP_ERRORS.budgets.leadRequired, undefined);
    }

    if (!data.items?.length) {
      throw AppException.from(APP_ERRORS.budgets.itemsRequired, undefined);
    }

    if (!data.eventDates?.length) {
      throw AppException.from(APP_ERRORS.budgets.eventDatesRequired, undefined);
    }

    if (!data.eventArrivalTimes?.length) {
      throw AppException.from(
        APP_ERRORS.budgets.eventArrivalTimesRequired,
        undefined,
      );
    }

    if (!data.eventDepartureTimes?.length) {
      throw AppException.from(
        APP_ERRORS.budgets.eventDepartureTimesRequired,
        undefined,
      );
    }

    if (
      data.eventDates.length !== data.eventArrivalTimes.length ||
      data.eventDates.length !== data.eventDepartureTimes.length
    ) {
      throw AppException.from(
        APP_ERRORS.budgets.eventTimesLengthMismatch,
        undefined,
      );
    }

    if (
      !data.eventLocation?.length ||
      data.eventLocation.length !== data.eventDates.length ||
      data.eventLocation.some((value) => !value?.trim())
    ) {
      throw AppException.from(
        APP_ERRORS.budgets.eventLocationRequired,
        undefined,
      );
    }

    if (
      !data.guestCount?.length ||
      data.guestCount.length !== data.eventDates.length ||
      data.guestCount.some((value) => !Number.isInteger(value) || value < 1)
    ) {
      throw AppException.from(APP_ERRORS.budgets.guestCountRequired, undefined);
    }

    if (
      !data.durationHours?.length ||
      data.durationHours.length !== data.eventDates.length ||
      data.durationHours.some(
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

    if (!data.paymentMethod?.trim()) {
      throw AppException.from(
        APP_ERRORS.budgets.paymentMethodRequired,
        undefined,
      );
    }

    if (!this.allowedPaymentMethods.includes(data.paymentMethod)) {
      throw AppException.from(
        APP_ERRORS.budgets.paymentMethodInvalid,
        undefined,
      );
    }

    if (
      data.advancePercentage === undefined ||
      data.advancePercentage === null ||
      Number.isNaN(Number(data.advancePercentage)) ||
      data.advancePercentage < 0 ||
      data.advancePercentage > 100
    ) {
      throw AppException.from(
        APP_ERRORS.budgets.advancePercentageRequired,
        undefined,
      );
    }

    if (data.discountType?.length) {
      if (data.discountType.length !== data.eventDates.length) {
        throw AppException.from(
          APP_ERRORS.budgets.discountLengthMismatch,
          undefined,
        );
      }

      data.discountType.forEach((type, index) => {
        if (type !== "" && type !== "percentage" && type !== "amount") {
          throw AppException.from(
            APP_ERRORS.budgets.discountTypeInvalid,
            undefined,
          );
        }

        if (type === "percentage") {
          const percentage = data.discountPercentage?.[index];
          if (
            percentage === undefined ||
            percentage === null ||
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
          const amount = data.discountAmount?.[index];
          if (
            amount === undefined ||
            amount === null ||
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

    const hasInvalidItemDescription = data.items.some(
      (item) => !item.description?.trim(),
    );

    if (hasInvalidItemDescription) {
      throw AppException.from(
        APP_ERRORS.budgets.itemDescriptionRequired,
        undefined,
      );
    }

    if (
      enforceItemPositions &&
      data.items.some((item) => !item.idPositions?.trim())
    ) {
      throw AppException.from(
        APP_ERRORS.budgets.itemServiceTypeInvalid,
        undefined,
      );
    }

    if (enforceItemPositions) {
      const eventDayCount = data.eventDates?.length ?? 0;
      const hasInvalidEventDateIndex = data.items.some((item) => {
        const index = item.eventDateIndex ?? 0;
        return !Number.isInteger(index) || index < 0 || index >= eventDayCount;
      });

      if (hasInvalidEventDateIndex) {
        throw AppException.from(
          APP_ERRORS.budgets.itemEventDateIndexInvalid,
          undefined,
        );
      }

      const coveredDays = new Set(
        data.items.map((item) => item.eventDateIndex ?? 0),
      );
      if (coveredDays.size < eventDayCount) {
        throw AppException.from(APP_ERRORS.budgets.dayMissingItems, undefined);
      }

      const selectedPositionKeys = data.items.map((item) => {
        const explicitGenderRaw = item.gender?.toString().trim();
        let genderKey = normalizeGenderToEnglish(explicitGenderRaw) ?? "";
        if (!genderKey) {
          const inferred = inferServiceComboFromDescription(
            item.description ?? undefined,
          );
          if (inferred) {
            const parts = inferred.split(":");
            genderKey =
              normalizeGenderToEnglish(
                parts.length > 1 ? parts[1] : undefined,
              ) ?? "";
          }
        }

        const dayPrefix = `${item.eventDateIndex ?? 0}`;

        if (genderKey) {
          return `${dayPrefix}::${item.idPositions || ""}::${genderKey}`;
        }

        return `${dayPrefix}::${item.idPositions || ""}::${(item.description ?? "").trim().toLowerCase()}`;
      });
      const uniquePositionKeys = new Set(selectedPositionKeys);

      if (selectedPositionKeys.length !== uniquePositionKeys.size) {
        throw AppException.from(
          APP_ERRORS.budgets.itemServiceTypeDuplicated,
          undefined,
        );
      }
    }

    if (!enforceItemPositions) {
      return;
    }
  }
}
