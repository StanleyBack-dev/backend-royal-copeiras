import { Repository } from "typeorm";
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
import { inferServiceTypeFromDescription } from "../../constants/budget-service-types.constant";

const BUDGET_ALLOWED_TRANSITIONS: Record<BudgetStatus, BudgetStatus[]> = {
  [BudgetStatus.DRAFT]: [
    BudgetStatus.GENERATED,
    BudgetStatus.CANCELED,
    BudgetStatus.EXPIRED,
  ],
  [BudgetStatus.GENERATED]: [
    BudgetStatus.SENT,
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
}

interface BudgetRulesSnapshot {
  idLeads?: string | null;
  eventDates?: string[] | null;
  eventLocation?: string | null;
  guestCount?: number | null;
  durationHours?: number | null;
  paymentMethod?: string | null;
  advancePercentage?: number | null;
  items?: Array<{ description?: string | null }>;
}

export class UpdateBudgetsValidator {
  private static readonly allowedPaymentMethods =
    BUDGET_ALLOWED_PAYMENT_METHODS as readonly string[];

  static async validateAndUpdate(
    userId: string,
    input: UpdateBudgetsInputDto,
    deps: UpdateBudgetDeps,
  ): Promise<BudgetsEntity> {
    if (!input.idBudgets) {
      throw AppException.from(APP_ERRORS.budgets.idRequired, undefined);
    }

    const current = await deps.budgetsRepo.findOne({
      where: { idBudgets: input.idBudgets, idUsers: userId },
      relations: { items: true },
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

    if (hasNonStatusUpdates) {
      this.validateBusinessRules({
        idLeads: input.idLeads ?? current.idLeads,
        eventDates: input.eventDates ?? current.eventDates,
        eventLocation: input.eventLocation ?? current.eventLocation,
        guestCount: input.guestCount ?? current.guestCount,
        durationHours: input.durationHours ?? current.durationHours,
        paymentMethod: input.paymentMethod ?? current.paymentMethod,
        advancePercentage: input.advancePercentage ?? current.advancePercentage,
        items:
          input.items?.map((item) => ({ description: item.description })) ??
          current.items,
      });
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
        where: {
          idLeads: input.idLeads,
          idUsers: userId,
        },
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
        where: {
          idLeads: input.idLeads ?? current.idLeads,
          idUsers: userId,
        },
      });

      if (!lead) {
        throw AppException.from(APP_ERRORS.leads.notFound, undefined);
      }

      if (!lead.isActive) {
        throw AppException.from(APP_ERRORS.budgets.leadInactive, undefined);
      }
    }

    const updatedIssueDate = input.issueDate
      ? new Date(input.issueDate)
      : current.issueDate;
    const updatedValidUntil = input.validUntil
      ? new Date(input.validUntil)
      : current.validUntil;

    if (updatedValidUntil < updatedIssueDate) {
      throw AppException.from(
        APP_ERRORS.budgets.invalidValidityRange,
        undefined,
      );
    }

    return deps.budgetsRepo.manager.transaction(async (manager) => {
      current.idLeads = input.idLeads ?? current.idLeads;
      current.status = input.status ?? current.status;
      current.sentVia = input.sentVia ?? current.sentVia;
      current.sentAt = input.sentAt ? new Date(input.sentAt) : current.sentAt;
      current.issueDate = updatedIssueDate;
      current.validUntil = updatedValidUntil;
      current.eventDates = input.eventDates ?? current.eventDates;
      current.eventLocation = input.eventLocation ?? current.eventLocation;
      current.guestCount = input.guestCount ?? current.guestCount;
      current.durationHours = input.durationHours ?? current.durationHours;
      current.paymentMethod = input.paymentMethod ?? current.paymentMethod;
      current.advancePercentage =
        input.advancePercentage ?? current.advancePercentage;

      if (input.items?.length) {
        const normalizedItems = input.items.map((item) => {
          const totalPrice = Number(
            (item.quantity * item.unitPrice).toFixed(2),
          );
          return {
            description: item.description,
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

        current.subtotal = subtotal;
        current.totalAmount = Number(
          (input.totalAmount ?? subtotal).toFixed(2),
        );

        await manager.delete(BudgetItemsEntity, {
          idBudgets: current.idBudgets,
        });

        const newItems = normalizedItems.map((item) =>
          manager.create(BudgetItemsEntity, {
            idBudgets: current.idBudgets,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            notes: item.notes,
            sortOrder: item.sortOrder,
          }),
        );

        const savedItems = await manager.save(BudgetItemsEntity, newItems);
        current.items = savedItems;
      } else if (!isStatusOnlyUpdate && input.totalAmount !== undefined) {
        current.totalAmount = Number(input.totalAmount.toFixed(2));
      }

      const saved = await manager.save(BudgetsEntity, current);

      if (!saved.items) {
        saved.items = await deps.budgetItemsRepo.find({
          where: { idBudgets: saved.idBudgets },
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
      input.eventLocation,
      input.guestCount,
      input.durationHours,
      input.paymentMethod,
      input.advancePercentage,
      input.totalAmount,
      input.items,
    ].some((value) => value !== undefined);
  }

  private static validateBusinessRules(data: BudgetRulesSnapshot): void {
    if (!data.idLeads) {
      throw AppException.from(APP_ERRORS.budgets.leadRequired, undefined);
    }

    if (!data.items?.length) {
      throw AppException.from(APP_ERRORS.budgets.itemsRequired, undefined);
    }

    if (!data.eventDates?.length) {
      throw AppException.from(APP_ERRORS.budgets.eventDatesRequired, undefined);
    }

    if (!data.eventLocation?.trim()) {
      throw AppException.from(
        APP_ERRORS.budgets.eventLocationRequired,
        undefined,
      );
    }

    if (
      data.guestCount === undefined ||
      data.guestCount === null ||
      !Number.isInteger(data.guestCount) ||
      data.guestCount < 1
    ) {
      throw AppException.from(APP_ERRORS.budgets.guestCountRequired, undefined);
    }

    if (
      data.durationHours === undefined ||
      data.durationHours === null ||
      !Number.isInteger(data.durationHours) ||
      data.durationHours < BUDGET_DURATION_HOURS_MIN ||
      data.durationHours > BUDGET_DURATION_HOURS_MAX
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

    const hasInvalidItemDescription = data.items.some(
      (item) => !item.description?.trim(),
    );

    if (hasInvalidItemDescription) {
      throw AppException.from(
        APP_ERRORS.budgets.itemDescriptionRequired,
        undefined,
      );
    }

    const serviceTypes = data.items.map((item) =>
      inferServiceTypeFromDescription(item.description),
    );

    if (serviceTypes.some((type) => type === null)) {
      throw AppException.from(
        APP_ERRORS.budgets.itemServiceTypeInvalid,
        undefined,
      );
    }

    const uniqueServiceTypes = new Set(serviceTypes);
    if (uniqueServiceTypes.size !== serviceTypes.length) {
      throw AppException.from(
        APP_ERRORS.budgets.itemServiceTypeDuplicated,
        undefined,
      );
    }
  }
}
