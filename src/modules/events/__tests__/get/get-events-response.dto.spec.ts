import { BudgetsEntity } from "../../../budgets/entities/budgets.entity";
import { GetEventsResponseDto } from "../../dtos/get/get-events-response.dto";
import { EventAssignmentEntity } from "../../entities/event-assignment.entity";
import { EventEntity } from "../../entities/event.entity";
import { EventStatus } from "../../enums/event-status.enum";
import { EventExtraExpenseCategory } from "../../enums/event-extra-expense-category.enum";

function buildAssignment(
  overrides: Partial<EventAssignmentEntity> = {},
): EventAssignmentEntity {
  const assignment = new EventAssignmentEntity();
  assignment.idEventAssignments = "assignment-1";
  assignment.idBudgetItems = "item-1";
  assignment.allocationIndex = 1;
  assignment.employeePayment = 100;
  assignment.overtimeHourlyPayment = 30;
  assignment.isActive = true;
  assignment.createdAt = new Date("2026-10-15T12:00:00Z");
  assignment.updatedAt = new Date("2026-10-15T12:00:00Z");
  return Object.assign(assignment, overrides);
}

function buildEvent(overrides: Partial<EventEntity> = {}): EventEntity {
  const event = new EventEntity();
  event.idEvents = "event-1";
  event.idContracts = "contract-1";
  event.idBudgets = "budget-1";
  event.status = EventStatus.SCHEDULED;
  event.overtimeMinutes = 0;
  event.overtimeHourlyRate = 90;
  event.extraExpenses = [];
  event.budget = { totalAmount: 1000, subtotal: 1000 } as BudgetsEntity;
  event.assignments = [
    buildAssignment(),
    buildAssignment({ idEventAssignments: "assignment-2" }),
  ];
  event.createdAt = new Date("2026-10-15T12:00:00Z");
  event.updatedAt = new Date("2026-10-15T12:00:00Z");
  return Object.assign(event, overrides);
}

describe("GetEventsResponseDto.fromEntity", () => {
  it("keeps revenue and cost untouched when there is no overtime or extra expense", () => {
    const dto = GetEventsResponseDto.fromEntity(buildEvent());

    expect(dto.overtimeAmount).toBe(0);
    expect(dto.overtimeCost).toBe(0);
    expect(dto.extraExpensesTotal).toBe(0);
    expect(dto.totalRevenue).toBe(1000);
    expect(dto.totalCost).toBe(200);
    expect(dto.companyReceivable).toBe(800);
  });

  it("charges and pays overtime using the event and per-employee hourly values", () => {
    const dto = GetEventsResponseDto.fromEntity(
      buildEvent({
        overtimeMinutes: 90,
        overtimeHourlyRate: 100,
        assignments: [
          buildAssignment({ overtimeHourlyPayment: 30 }),
          buildAssignment({
            idEventAssignments: "assignment-2",
            overtimeHourlyPayment: 40,
          }),
        ],
      }),
    );

    // 2 employees x 1.5h x R$ 100
    expect(dto.overtimeAmount).toBe(300);
    // 1.5h x R$ 30 + 1.5h x R$ 40
    expect(dto.overtimeCost).toBe(105);
    expect(dto.totalRevenue).toBe(1300);
    expect(dto.totalCost).toBe(305);
    expect(dto.companyReceivable).toBe(995);
  });

  it("ignores inactive allocations for overtime", () => {
    const dto = GetEventsResponseDto.fromEntity(
      buildEvent({
        overtimeMinutes: 60,
        assignments: [
          buildAssignment(),
          buildAssignment({
            idEventAssignments: "assignment-2",
            employeePayment: 0,
            isActive: false,
          }),
        ],
      }),
    );

    expect(dto.overtimeAmount).toBe(90);
    expect(dto.overtimeCost).toBe(30);
  });

  it("reports unknown stored categories as OTHER", () => {
    const dto = GetEventsResponseDto.fromEntity(
      buildEvent({
        extraExpenses: [
          {
            category: "LEGACY" as EventExtraExpenseCategory,
            amount: 10,
          },
        ],
      }),
    );

    expect(dto.extraExpenses[0].category).toBe(EventExtraExpenseCategory.OTHER);
  });

  it("subtracts extra expenses from the company receivable", () => {
    const dto = GetEventsResponseDto.fromEntity(
      buildEvent({
        extraExpenses: [
          { category: EventExtraExpenseCategory.TRANSPORT, amount: 45.5 },
          { category: EventExtraExpenseCategory.FOOD, amount: 80 },
        ],
      }),
    );

    expect(dto.extraExpenses).toEqual([
      { category: EventExtraExpenseCategory.TRANSPORT, amount: 45.5 },
      { category: EventExtraExpenseCategory.FOOD, amount: 80 },
    ]);
    expect(dto.extraExpensesTotal).toBe(125.5);
    expect(dto.totalCost).toBe(325.5);
    expect(dto.companyReceivable).toBe(674.5);
  });
});
