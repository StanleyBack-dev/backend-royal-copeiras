import { LeadStatus } from "../../enums/lead-status.enum";

describe("LeadStatus", () => {
  it("should expose expected statuses", () => {
    expect(LeadStatus.NEW).toBe("new");
    expect(LeadStatus.QUALIFIED).toBe("qualified");
    expect(LeadStatus.WON).toBe("won");
    expect(LeadStatus.LOST).toBe("lost");
  });
});
