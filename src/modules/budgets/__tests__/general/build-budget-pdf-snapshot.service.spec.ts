import { BuildBudgetPdfSnapshotService } from "../../services/pdf/build-budget-pdf-snapshot.service";
import { budgetMock } from "../../__mocks__/budget.mock";

describe("BuildBudgetPdfSnapshotService", () => {
  it("should build snapshot with budget and items", () => {
    const service = new BuildBudgetPdfSnapshotService();
    const snapshot = service.buildFromEntity({
      ...budgetMock,
      idUsers: "mock-user-id",
      items: budgetMock.items || [],
    });

    expect(snapshot.schemaVersion).toBe("1.0.0");
    expect(snapshot.budget.budgetNumber).toBe(budgetMock.budgetNumber);
    expect(Array.isArray(snapshot.items)).toBe(true);
  });
});
