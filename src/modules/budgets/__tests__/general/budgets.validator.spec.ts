import { BudgetStatus } from "../../enums/budget-status.enum";

describe("BudgetStatus", () => {
  it("should expose expected statuses", () => {
    expect(BudgetStatus.DRAFT).toBe("draft");
    expect(BudgetStatus.SENT).toBe("sent");
    expect(BudgetStatus.APPROVED).toBe("approved");
    expect(BudgetStatus.REJECTED).toBe("rejected");
    expect(BudgetStatus.EXPIRED).toBe("expired");
    expect(BudgetStatus.CANCELED).toBe("canceled");
  });
});
