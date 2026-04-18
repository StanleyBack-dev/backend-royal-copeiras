import { Repository } from "typeorm";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { BudgetItemsEntity } from "../../entities/budgetItems.entity";
import { BudgetsEntity } from "../../entities/budgets.entity";
import { BudgetStatus } from "../../enums/budget-status.enum";
import { UpdateBudgetsValidator } from "../../validators/update/update-budgets.validator";
import { UpdateBudgetsInputDto } from "../../dtos/update/update-budgets-input.dto";
import { LeadsEntity } from "../../../leads/entities/leads.entity";
import { budgetMock } from "../../__mocks__/budget.mock";

interface MockManager {
  transaction: (
    run: (manager: {
      delete: jest.Mock;
      create: jest.Mock;
      save: jest.Mock;
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
    const managerImpl = {
      delete: jest.fn<Promise<void>, [unknown, unknown]>().mockResolvedValue(),
      create: jest.fn((_: unknown, value: object) => value),
      save: jest.fn(async (_: unknown, value: unknown) => {
        if (Array.isArray(value)) {
          return value.map((item, index) => ({
            ...(item as object),
            idBudgetItems: `new-item-${index + 1}`,
            createdAt: new Date("2026-04-10"),
            updatedAt: new Date("2026-04-10"),
          }));
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

    return {
      budgetsRepo: budgetsRepo as unknown as Repository<BudgetsEntity>,
      budgetItemsRepo:
        budgetItemsRepo as unknown as Repository<BudgetItemsEntity>,
      leadsRepo: leadsRepo as unknown as Repository<LeadsEntity>,
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
      }),
    ).rejects.toThrow(APP_ERRORS.budgets.notFound.message as string);
  });

  it("should block non-status edits when budget is not draft", async () => {
    const deps = makeDeps(makeBudget({ status: BudgetStatus.SENT }));

    const input = new UpdateBudgetsInputDto();
    input.idBudgets = "budget-1";
    input.notes = "alterar observacao";

    await expect(
      UpdateBudgetsValidator.validateAndUpdate(userId, input, {
        budgetsRepo: deps.budgetsRepo,
        budgetItemsRepo: deps.budgetItemsRepo,
        leadsRepo: deps.leadsRepo,
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
        description: "2 copeiras",
        quantity: 2,
        unitPrice: 500,
        sortOrder: 0,
      },
      {
        description: "material",
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
      },
    );

    expect(result.subtotal).toBe(1150);
    expect(result.totalAmount).toBe(1150);
    expect(result.items).toHaveLength(2);
    expect(deps.managerImpl.delete).toHaveBeenCalledTimes(1);
  });
});
