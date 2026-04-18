import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { BudgetItemsEntity } from "../../entities/budgetItems.entity";
import { BudgetsEntity } from "../../entities/budgets.entity";
import { CreateBudgetsInputDto } from "../../dtos/create/create-budgets-input.dto";
import { LeadsEntity } from "../../../leads/entities/leads.entity";
import { EntityManager, Repository } from "typeorm";

interface CreateBudgetResult {
  budget: BudgetsEntity;
  items: BudgetItemsEntity[];
}

export class CreateBudgetsValidator {
  static async validateAndCreate(
    userId: string,
    input: CreateBudgetsInputDto,
    budgetsRepo: Repository<BudgetsEntity>,
    leadsRepo: Repository<LeadsEntity>,
  ): Promise<CreateBudgetResult> {
    if (!input.items?.length) {
      throw AppException.from(APP_ERRORS.budgets.itemsRequired, undefined);
    }

    const issueDate = input.issueDate ? new Date(input.issueDate) : new Date();
    const validUntil = new Date(input.validUntil);

    if (validUntil < issueDate) {
      throw AppException.from(
        APP_ERRORS.budgets.invalidValidityRange,
        undefined,
      );
    }

    if (input.idLeads) {
      const lead = await leadsRepo.findOne({
        where: {
          idLeads: input.idLeads,
          idUsers: userId,
        },
      });

      if (!lead) {
        throw AppException.from(APP_ERRORS.leads.notFound, undefined);
      }
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
        status: input.status,
        issueDate,
        validUntil,
        eventDates: input.eventDates ?? [],
        eventLocation: input.eventLocation,
        guestCount: input.guestCount,
        durationHours: input.durationHours,
        paymentMethod: input.paymentMethod,
        advancePercentage: input.advancePercentage,
        notes: input.notes,
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
