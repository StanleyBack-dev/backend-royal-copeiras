import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { BudgetItemsEntity } from "../../entities/budgetItems.entity";
import { BudgetsEntity } from "../../entities/budgets.entity";
import { UpdateBudgetsInputDto } from "../../dtos/update/update-budgets-input.dto";
import { LeadsEntity } from "../../../leads/entities/leads.entity";
import { BudgetStatus } from "../../enums/budget-status.enum";

const BUDGET_ALLOWED_TRANSITIONS: Record<BudgetStatus, BudgetStatus[]> = {
  [BudgetStatus.DRAFT]: [
    BudgetStatus.SENT,
    BudgetStatus.CANCELED,
    BudgetStatus.EXPIRED,
  ],
  [BudgetStatus.SENT]: [
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

export class UpdateBudgetsValidator {
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
      current.issueDate = updatedIssueDate;
      current.validUntil = updatedValidUntil;
      current.eventDates = input.eventDates ?? current.eventDates;
      current.eventLocation = input.eventLocation ?? current.eventLocation;
      current.guestCount = input.guestCount ?? current.guestCount;
      current.durationHours = input.durationHours ?? current.durationHours;
      current.paymentMethod = input.paymentMethod ?? current.paymentMethod;
      current.advancePercentage =
        input.advancePercentage ?? current.advancePercentage;
      current.notes = input.notes ?? current.notes;

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
      input.notes,
      input.totalAmount,
      input.items,
    ].some((value) => value !== undefined);
  }
}
