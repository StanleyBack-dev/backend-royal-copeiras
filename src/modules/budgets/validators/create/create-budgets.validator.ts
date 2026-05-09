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
      return {
        idPositions: item.idPositions,
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

    const displacementFee = Number((input.displacementFee ?? 0).toFixed(2));
    const totalAmount = Number(
      (input.totalAmount ?? subtotal + displacementFee).toFixed(2),
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

    const selectedPositions = input.items.map((item) => item.idPositions);
    const uniquePositions = new Set(selectedPositions);
    if (uniquePositions.size !== selectedPositions.length) {
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
