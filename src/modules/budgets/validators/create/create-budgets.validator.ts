import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { BudgetItemsEntity } from "../../entities/budgetItems.entity";
import { BudgetsEntity } from "../../entities/budgets.entity";
import { CreateBudgetsInputDto } from "../../dtos/create/create-budgets-input.dto";
import { LeadsEntity } from "../../../leads/entities/leads.entity";
import { EntityManager, Repository } from "typeorm";
import {
  BUDGET_ALLOWED_PAYMENT_METHODS,
  BUDGET_DURATION_HOURS_MAX,
  BUDGET_DURATION_HOURS_MIN,
} from "../../constants/budget-form-rules.constant";
import { inferServiceTypeFromDescription } from "../../constants/budget-service-types.constant";
import { BudgetStatus } from "../../enums/budget-status.enum";

interface CreateBudgetResult {
  budget: BudgetsEntity;
  items: BudgetItemsEntity[];
}

export class CreateBudgetsValidator {
  private static readonly allowedPaymentMethods =
    BUDGET_ALLOWED_PAYMENT_METHODS as readonly string[];

  static async validateAndCreate(
    userId: string,
    input: CreateBudgetsInputDto,
    budgetsRepo: Repository<BudgetsEntity>,
    leadsRepo: Repository<LeadsEntity>,
  ): Promise<CreateBudgetResult> {
    this.validateBusinessRules(input);

    const issueDate = input.issueDate ? new Date(input.issueDate) : new Date();
    const validUntil = new Date(input.validUntil);

    if (validUntil < issueDate) {
      throw AppException.from(
        APP_ERRORS.budgets.invalidValidityRange,
        undefined,
      );
    }

    const lead = await leadsRepo.findOne({
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

    const normalizedItems = input.items.map((item) => {
      const totalPrice = Number((item.quantity * item.unitPrice).toFixed(2));
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

    const totalAmount = Number((input.totalAmount ?? subtotal).toFixed(2));

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
        eventLocation: input.eventLocation,
        guestCount: input.guestCount,
        durationHours: input.durationHours,
        paymentMethod: input.paymentMethod,
        advancePercentage: input.advancePercentage,
        subtotal,
        totalAmount,
      });

      const savedBudget = await manager.save(BudgetsEntity, budget);

      const budgetItems = normalizedItems.map((item) =>
        manager.create(BudgetItemsEntity, {
          idBudgets: savedBudget.idBudgets,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          notes: item.notes,
          sortOrder: item.sortOrder,
        }),
      );

      const savedItems = await manager.save(BudgetItemsEntity, budgetItems);

      savedBudget.items = savedItems;
      return { budget: savedBudget, items: savedItems };
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

    const hasInvalidItemDescription = input.items.some(
      (item) => !item.description?.trim(),
    );

    if (hasInvalidItemDescription) {
      throw AppException.from(
        APP_ERRORS.budgets.itemDescriptionRequired,
        undefined,
      );
    }

    const serviceTypes = input.items.map((item) =>
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
