import { Repository } from "typeorm";
import { BudgetItemsEntity } from "../../../budgets/entities/budget-items.entity";
import { BudgetsEntity } from "../../../budgets/entities/budgets.entity";
import { BudgetItemType } from "../../../budgets/enums/budget-item-type.enum";
import { ContractsEntity } from "../../../contracts/entities/contracts.entity";
import { ContractStatus } from "../../../contracts/enums/contract-status.enum";
import { EventAssignmentEntity } from "../../entities/event-assignment.entity";
import { EventEntity } from "../../entities/event.entity";
import { CreateEventFromSignedContractService } from "../../services/internal/create-event-from-signed-contract.service";

function buildItem(overrides: Partial<BudgetItemsEntity>): BudgetItemsEntity {
  return Object.assign(new BudgetItemsEntity(), {
    idBudgetItems: "item",
    itemType: BudgetItemType.LABOR,
    quantity: 1,
    sortOrder: 0,
    ...overrides,
  });
}

describe("CreateEventFromSignedContractService", () => {
  let eventAssignmentsRepository: jest.Mocked<
    Repository<EventAssignmentEntity>
  >;
  let service: CreateEventFromSignedContractService;
  let budget: BudgetsEntity;

  beforeEach(() => {
    const eventsRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((data) => data),
      save: jest.fn((data) =>
        Promise.resolve({ ...data, idEvents: "event-1" }),
      ),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      })),
    } as unknown as Repository<EventEntity>;

    eventAssignmentsRepository = {
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve(data)),
    } as unknown as jest.Mocked<Repository<EventAssignmentEntity>>;

    const contractsRepository = {
      findOne: jest.fn().mockResolvedValue({
        idContracts: "contract-1",
        idBudgets: "budget-1",
        idUsers: "user-1",
        status: ContractStatus.SIGNED,
      } as ContractsEntity),
    } as unknown as Repository<ContractsEntity>;

    budget = Object.assign(new BudgetsEntity(), {
      idBudgets: "budget-1",
      items: [],
    });
    const budgetsRepository = {
      findOne: jest.fn(() => Promise.resolve(budget)),
    } as unknown as Repository<BudgetsEntity>;

    service = new CreateEventFromSignedContractService(
      eventsRepository,
      eventAssignmentsRepository,
      contractsRepository,
      budgetsRepository,
    );
  });

  it("creates one allocation slot per professional and none for supplies", async () => {
    budget.items = [
      buildItem({ idBudgetItems: "copeiras", quantity: 2, sortOrder: 0 }),
      buildItem({
        idBudgetItems: "papel-higienico",
        itemType: BudgetItemType.SUPPLY,
        quantity: 4,
        sortOrder: 1,
      }),
    ];

    await service.execute("contract-1");

    const saved = eventAssignmentsRepository.save.mock
      .calls[0][0] as unknown as EventAssignmentEntity[];
    expect(saved).toHaveLength(2);
    expect(saved.every((slot) => slot.idBudgetItems === "copeiras")).toBe(true);
  });

  it("does not create allocations when the budget only has supplies", async () => {
    budget.items = [
      buildItem({ idBudgetItems: "papel", itemType: BudgetItemType.SUPPLY }),
    ];

    await service.execute("contract-1");

    expect(eventAssignmentsRepository.save).not.toHaveBeenCalled();
  });
});
