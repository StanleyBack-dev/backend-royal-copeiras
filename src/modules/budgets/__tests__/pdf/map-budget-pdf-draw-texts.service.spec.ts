import { budgetMock } from "../../__mocks__/budget.mock";
import { BuildBudgetPdfSnapshotService } from "../../services/pdf/build-budget-pdf-snapshot.service";
import { BuildBudgetProposalPdfPayloadService } from "../../services/pdf/build-budget-proposal-pdf-payload.service";
import { RenderBudgetProposalTemplateService } from "../../../pdf-generator/templates/budgets/render-budget-proposal-template.service";

describe("RenderBudgetProposalTemplateService", () => {
  it("should render snapshot to pdf buffer", async () => {
    const snapshotBuilder = new BuildBudgetPdfSnapshotService();
    const payloadBuilder = new BuildBudgetProposalPdfPayloadService();
    const renderer = new RenderBudgetProposalTemplateService();

    const snapshot = snapshotBuilder.buildFromEntity(budgetMock);
    const payload = payloadBuilder.build(
      snapshot,
      "abc1234567890defabc1234567890def",
    );
    const buffer = await renderer.render(payload);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });
});
