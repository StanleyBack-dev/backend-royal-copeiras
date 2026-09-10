import { CreateBudgetsInputDto } from "../../dtos/create/create-budgets-input.dto";
import { BudgetStatus } from "../../enums/budget-status.enum";

describe("CreateBudgetsInputDto", () => {
  it("should require validUntil and items", () => {
    const input = new CreateBudgetsInputDto();
    expect(input.validUntil).toBeUndefined();
    expect(input.items).toBeUndefined();
  });

  it("should allow optional fields", () => {
    const input = new CreateBudgetsInputDto();
    input.status = BudgetStatus.DRAFT;
    input.validUntil = "2026-04-20";
    input.eventDates = ["2026-04-19"];
    input.eventArrivalTimes = ["08:00"];
    input.eventDepartureTimes = ["14:00"];
    input.eventLocation = ["Polo Empresarial"];
    input.guestCount = [150];
    input.durationHours = [6];
    input.paymentMethod = "PIX";
    input.advancePercentage = 30;
    input.items = [
      {
        itemType: "LABOR" as never,
        idPositions: "95d227b4-f731-4a80-8902-2e92a056bf44",
        description: "2 copeiras",
        quantity: 2,
        unitPrice: 500,
        sortOrder: 0,
        eventDateIndex: 0,
      },
    ];

    expect(input.status).toBe(BudgetStatus.DRAFT);
    expect(input.items).toHaveLength(1);
  });
});
