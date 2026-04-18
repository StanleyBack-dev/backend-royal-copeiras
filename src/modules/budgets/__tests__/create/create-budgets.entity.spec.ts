import { BudgetsEntity } from "../../entities/budgets.entity";

describe("CreateBudgetsEntity", () => {
  it("should be defined", () => {
    expect(new BudgetsEntity()).toBeDefined();
  });
});
