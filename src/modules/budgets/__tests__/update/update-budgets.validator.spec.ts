import { Repository } from "typeorm";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { BudgetItemsEntity } from "../../entities/budgetItems.entity";
import { BudgetsEntity } from "../../entities/budgets.entity";
import { BudgetStatus } from "../../enums/budget-status.enum";
import { UpdateBudgetsValidator } from "../../validators/update/update-budgets.validator";
import { UpdateBudgetsInputDto } from "../../dtos/update/update-budgets-input.dto";
import { LeadsEntity } from "../../../leads/entities/leads.entity";
import { PositionsEntity } from "../../../positions/entities/positions.entity";
import { budgetMock } from "../../__mocks__/budget.mock";

interface MockManager {
  transaction: (
    run: (manager: {
      delete: jest.Mock;
      create: jest.Mock;
      save: jest.Mock;
      find: jest.Mock;
    }) => Promise<BudgetsEntity>,
  ) => Promise<BudgetsEntity>;
}

function makeBudget(overrides: Partial<BudgetsEntity> = {}): BudgetsEntity {
  return {
    ...budgetMock,
    ...overrides,
  } as BudgetsEntity;
}

describe("UpdateBudgetsValidator", () => {
  const userId = "user-1";

  function makeDeps(current: BudgetsEntity | null) {
    let persistedItems = current?.items ?? [];

    const managerImpl = {
      delete: jest.fn<Promise<void>, [unknown, unknown]>().mockResolvedValue(),
      create: jest.fn((_: unknown, value: object) => value),
      find: jest
        .fn<Promise<BudgetItemsEntity[]>, [unknown, unknown]>()
        .mockImplementation(async () => persistedItems),
      save: jest.fn(async (_: unknown, value: unknown) => {
        if (Array.isArray(value)) {
          persistedItems = value.map((item, index) => ({
            ...(item as object),
            idBudgetItems: `new-item-${index + 1}`,
            createdAt: new Date("2026-04-10"),
            updatedAt: new Date("2026-04-10"),
          })) as BudgetItemsEntity[];

          return persistedItems;
        }

        return value;
      }),
    };

    const manager = {
      transaction: jest.fn(async (run) => run(managerImpl)),
    } as MockManager;

    const budgetsRepo = {
      findOne: jest
        .fn<Promise<BudgetsEntity | null>, [unknown]>()
        .mockResolvedValue(current),
      manager,
    };

    const budgetItemsRepo = {
      find: jest
        .fn<Promise<BudgetItemsEntity[]>, [unknown]>()
        .mockResolvedValue(current?.items ?? []),
    };

    const leadsRepo = {
      findOne: jest
        .fn<Promise<LeadsEntity | null>, [unknown]>()
        .mockResolvedValue({
          idLeads: "lead-1",
          idUsers: userId,
        } as LeadsEntity),
    };

    const positionsRepo = {
      find: jest.fn<Promise<PositionsEntity[]>, [unknown]>().mockResolvedValue([
        {
          idPositions: "95d227b4-f731-4a80-8902-2e92a056bf44",
          name: "Copeira",
          isActive: true,
        } as PositionsEntity,
        {
          idPositions: "11f8f463-dbf4-c9f0-5f1e-42b7699e1f50",
          name: "Porteiro",
          isActive: true,
        } as PositionsEntity,
      ]),
    };

    return {
      budgetsRepo: budgetsRepo as unknown as Repository<BudgetsEntity>,
      budgetItemsRepo:
        budgetItemsRepo as unknown as Repository<BudgetItemsEntity>,
      leadsRepo: leadsRepo as unknown as Repository<LeadsEntity>,
      positionsRepo: positionsRepo as unknown as Repository<PositionsEntity>,
      managerImpl,
    };
  }

  it("should throw when idBudgets is not provided", async () => {
    const deps = makeDeps(makeBudget());
    const input = new UpdateBudgetsInputDto();

    await expect(
      UpdateBudgetsValidator.validateAndUpdate(userId, input, {
        budgetsRepo: deps.budgetsRepo,
        budgetItemsRepo: deps.budgetItemsRepo,
        leadsRepo: deps.leadsRepo,
        positionsRepo: deps.positionsRepo,
      }),
    ).rejects.toThrow(APP_ERRORS.budgets.idRequired.message as string);
  });

  it("should throw when budget is not found", async () => {
    const deps = makeDeps(null);

    const input = new UpdateBudgetsInputDto();
    input.idBudgets = "missing";
    input.status = BudgetStatus.SENT;

    await expect(
      UpdateBudgetsValidator.validateAndUpdate(userId, input, {
        budgetsRepo: deps.budgetsRepo,
        budgetItemsRepo: deps.budgetItemsRepo,
        leadsRepo: deps.leadsRepo,
        positionsRepo: deps.positionsRepo,
      }),
    ).rejects.toThrow(APP_ERRORS.budgets.notFound.message as string);
  });

  it("should block non-status edits when budget is not draft", async () => {
    const deps = makeDeps(makeBudget({ status: BudgetStatus.SENT }));

    const input = new UpdateBudgetsInputDto();
    input.idBudgets = "budget-1";
    input.eventLocation = "Novo local do evento";

    await expect(
      UpdateBudgetsValidator.validateAndUpdate(userId, input, {
        budgetsRepo: deps.budgetsRepo,
        budgetItemsRepo: deps.budgetItemsRepo,
        leadsRepo: deps.leadsRepo,
        positionsRepo: deps.positionsRepo,
      }),
    ).rejects.toThrow(APP_ERRORS.budgets.editForbidden.message as string);
  });

  it("should throw for invalid status transition", async () => {
    const deps = makeDeps(makeBudget({ status: BudgetStatus.DRAFT }));

    const input = new UpdateBudgetsInputDto();
    input.idBudgets = "budget-1";
    input.status = BudgetStatus.APPROVED;

    await expect(
      UpdateBudgetsValidator.validateAndUpdate(userId, input, {
        budgetsRepo: deps.budgetsRepo,
        budgetItemsRepo: deps.budgetItemsRepo,
        leadsRepo: deps.leadsRepo,
        positionsRepo: deps.positionsRepo,
      }),
    ).rejects.toThrow(
      APP_ERRORS.budgets.invalidStatusTransition.message as string,
    );
  });

  it("should allow valid status transition as status-only update", async () => {
    const deps = makeDeps(makeBudget({ status: BudgetStatus.SENT }));

    const input = new UpdateBudgetsInputDto();
    input.idBudgets = "budget-1";
    input.status = BudgetStatus.APPROVED;

    const result = await UpdateBudgetsValidator.validateAndUpdate(
      userId,
      input,
      {
        budgetsRepo: deps.budgetsRepo,
        budgetItemsRepo: deps.budgetItemsRepo,
        leadsRepo: deps.leadsRepo,
        positionsRepo: deps.positionsRepo,
      },
    );

    expect(result.status).toBe(BudgetStatus.APPROVED);
    expect(deps.managerImpl.save).toHaveBeenCalled();
  });

  it("should allow generated to approved as status-only update", async () => {
    const deps = makeDeps(makeBudget({ status: BudgetStatus.GENERATED }));

    const input = new UpdateBudgetsInputDto();
    input.idBudgets = "budget-1";
    input.status = BudgetStatus.APPROVED;

    const result = await UpdateBudgetsValidator.validateAndUpdate(
      userId,
      input,
      {
        budgetsRepo: deps.budgetsRepo,
        budgetItemsRepo: deps.budgetItemsRepo,
        leadsRepo: deps.leadsRepo,
        positionsRepo: deps.positionsRepo,
      },
    );

    expect(result.status).toBe(BudgetStatus.APPROVED);
    expect(deps.managerImpl.save).toHaveBeenCalled();
  });

  it("should update draft budget items and recalculate totals", async () => {
    const deps = makeDeps(makeBudget({ status: BudgetStatus.DRAFT }));

    const input = new UpdateBudgetsInputDto();
    input.idBudgets = "budget-1";
    input.items = [
      {
        idPositions: "95d227b4-f731-4a80-8902-2e92a056bf44",
        description: "2 copeiras",
        quantity: 2,
        unitPrice: 500,
        sortOrder: 0,
      },
      {
        idPositions: "11f8f463-dbf4-c9f0-5f1e-42b7699e1f50",
        description: "1 porteiro",
        quantity: 1,
        unitPrice: 150,
        sortOrder: 1,
      },
    ];

    const result = await UpdateBudgetsValidator.validateAndUpdate(
      userId,
      input,
      {
        budgetsRepo: deps.budgetsRepo,
        budgetItemsRepo: deps.budgetItemsRepo,
        leadsRepo: deps.leadsRepo,
        positionsRepo: deps.positionsRepo,
      },
    );

    expect(result.subtotal).toBe(1150);
    expect(result.totalAmount).toBe(1150);
    expect(result.items).toHaveLength(2);
    expect(deps.managerImpl.delete).toHaveBeenCalledTimes(1);
  });

  it("should clear discount fields when discount type is removed", async () => {
    const deps = makeDeps(
      makeBudget({
        status: BudgetStatus.DRAFT,
        discountType: "percentage",
        discountPercentage: 10,
        discountAmount: null,
        subtotal: 1000,
        displacementFee: 0,
        totalAmount: 900,
      }),
    );

    const input = new UpdateBudgetsInputDto();
    input.idBudgets = "budget-1";
    input.discountType = null;

    const result = await UpdateBudgetsValidator.validateAndUpdate(
      userId,
      input,
      {
        budgetsRepo: deps.budgetsRepo,
        budgetItemsRepo: deps.budgetItemsRepo,
        leadsRepo: deps.leadsRepo,
        positionsRepo: deps.positionsRepo,
      },
    );

    expect(result.discountType).toBeNull();
    expect(result.discountPercentage).toBeNull();
    expect(result.discountAmount).toBeNull();
    expect(result.totalAmount).toBe(1000);
  });
});
