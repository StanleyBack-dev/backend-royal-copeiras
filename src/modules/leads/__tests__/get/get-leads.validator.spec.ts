import { GetLeadsInputDto } from "../../dtos/get/get-leads-input.dto";
import { LeadStatus } from "../../enums/lead-status.enum";

describe("GetLeadsInputDto", () => {
  it("should allow empty input", () => {
    const input = new GetLeadsInputDto();
    expect(input).toBeDefined();
  });

  it("should allow optional filters", () => {
    const input = new GetLeadsInputDto();
    input.idLeads = "uuid-mock";
    input.status = LeadStatus.QUALIFIED;
    input.startDate = "2026-01-01";
    input.endDate = "2026-12-31";

    expect(input.idLeads).toBe("uuid-mock");
    expect(input.status).toBe(LeadStatus.QUALIFIED);
  });
});
