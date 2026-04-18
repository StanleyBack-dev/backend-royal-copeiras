import { budgetMock } from "../../__mocks__/budget.mock";
import { BuildBudgetPdfSnapshotService } from "../../services/pdf/build-budget-pdf-snapshot.service";
import { MapBudgetPdfDrawTextsService } from "../../services/pdf/map-budget-pdf-draw-texts.service";

describe("MapBudgetPdfDrawTextsService", () => {
  it("should map snapshot to draw texts", () => {
    const snapshotBuilder = new BuildBudgetPdfSnapshotService();
    const mapper = new MapBudgetPdfDrawTextsService();

    const snapshot = snapshotBuilder.buildFromEntity(budgetMock);
    const drawTexts = mapper.map(snapshot, "abc1234567890defabc1234567890def");

    expect(Array.isArray(drawTexts)).toBe(true);
    expect(drawTexts.length).toBeGreaterThan(0);
    expect(drawTexts[0]).toHaveProperty("text");
    expect(drawTexts[0]).toHaveProperty("x");
    expect(drawTexts[0]).toHaveProperty("y");
  });
});
