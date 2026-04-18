import { GetBudgetsInputDto } from "../../dtos/get/get-budgets-input.dto";
import { BudgetStatus } from "../../enums/budget-status.enum";

describe("GetBudgetsInputDto", () => {
  it("should allow empty input", () => {
    const input = new GetBudgetsInputDto();
    expect(input).toBeDefined();
  });

  it("should allow optional filters", () => {
    const input = new GetBudgetsInputDto();
    input.idBudgets = "uuid-mock";
    input.status = BudgetStatus.SENT;
    input.startDate = "2026-01-01";
    input.endDate = "2026-12-31";

    expect(input.idBudgets).toBe("uuid-mock");
    expect(input.status).toBe(BudgetStatus.SENT);
  });
});
