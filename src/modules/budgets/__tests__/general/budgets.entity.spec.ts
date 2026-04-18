import { BudgetsEntity } from "../../entities/budgets.entity";

describe("BudgetsEntity", () => {
  it("should be defined", () => {
    expect(new BudgetsEntity()).toBeDefined();
  });
});
